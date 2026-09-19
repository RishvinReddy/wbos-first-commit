import datetime
import uuid
from decimal import Decimal
from core.db import get_client, config
from core import events
from services.products import check_inventory

def create_order(tenant_id: str, customer_id: str, customer_phone: str, items: list[dict], delivery_address: str):
    """
    Atomically creates an order and deducts inventory using DynamoDB Transactions.
    """
    if not items:
        raise ValueError("Order must contain at least one item.")

    product_ids = [item["productId"] for item in items]
    inventory = check_inventory(tenant_id, product_ids)

    inventory_map = {p["productId"]: p for p in inventory}

    subtotal = Decimal("0.0")
    tax_total = Decimal("0.0")
    order_id = f"ORD_{uuid.uuid4().hex[:8].upper()}"
    now = datetime.datetime.now(datetime.UTC).isoformat() + "Z"

    transact_items = []
    order_items_records = []

    for item in items:
        pid = item["productId"]
        qty = Decimal(str(item["quantity"]))

        if pid not in inventory_map:
            raise ValueError(f"Product {pid} not found in inventory.")

        prod = inventory_map[pid]
        price = Decimal(str(prod["price"]))

        line_total = price * qty
        subtotal += line_total
        tax_total += line_total * Decimal("0.05") # Assuming flat 5% GST for MVP

        # 1. Update Product Stock (Decrement)
        transact_items.append({
            "Update": {
                "TableName": config.DYNAMODB_TABLE,
                "Key": {
                    "PK": {"S": f"TENANT#{tenant_id}#PRODUCT#{pid}"},
                    "SK": {"S": "METADATA"}
                },
                "UpdateExpression": "SET stock = stock - :qty",
                "ConditionExpression": "stock >= :qty",
                "ExpressionAttributeValues": {
                    ":qty": {"N": str(qty)}
                }
            }
        })

        # 2. Put Order Item
        order_item = {
            "PK": {"S": f"TENANT#{tenant_id}#ORDER#{order_id}"},
            "SK": {"S": f"ITEM#{pid}"},
            "GSI1PK": {"S": f"TENANT#{tenant_id}#PRODUCT#{pid}"},
            "GSI1SK": {"S": f"ORDER#{order_id}"},
            "entityType": {"S": "ORDER_ITEM"},
            "tenantId": {"S": tenant_id},
            "orderId": {"S": order_id},
            "productId": {"S": pid},
            "name": {"S": prod["name"]},
            "quantity": {"N": str(qty)},
            "unitPrice": {"N": str(price)},
            "lineTotal": {"N": str(line_total)}
        }

        if "unit" in item:
            order_item["unit"] = {"S": item["unit"]}

        transact_items.append({
            "Put": {
                "TableName": config.DYNAMODB_TABLE,
                "Item": order_item
            }
        })

        order_items_records.append({
            "productId": pid,
            "name": prod["name"],
            "quantity": float(qty),
            "lineTotal": float(line_total)
        })

    total = subtotal + tax_total

    # 3. Put Order Header
    order_header = {
        "PK": {"S": f"TENANT#{tenant_id}#ORDER#{order_id}"},
        "SK": {"S": "META"},
        "GSI1PK": {"S": f"TENANT#{tenant_id}#CUS#{customer_id}"},
        "GSI1SK": {"S": f"ORDER#{now}#{order_id}"},
        "GSI2PK": {"S": f"TENANT#{tenant_id}#STATUS#PENDING"},
        "GSI2SK": {"S": f"CREATED#{now}"},
        "GSI3PK": {"S": f"TENANT#{tenant_id}#DATE#{now[:10]}"},
        "GSI3SK": {"S": f"ORDER#{order_id}"},
        "entityType": {"S": "ORDER_HEADER"},
        "tenantId": {"S": tenant_id},
        "orderId": {"S": order_id},
        "customerId": {"S": customer_id},
        "customerPhone": {"S": customer_phone},
        "deliveryAddress": {"S": delivery_address},
        "status": {"S": "PENDING"},
        "itemCount": {"N": str(len(items))},
        "subtotal": {"N": str(subtotal)},
        "tax": {"N": str(tax_total)},
        "total": {"N": str(total)},
        "createdAt": {"S": now}
    }

    transact_items.append({
        "Put": {
            "TableName": config.DYNAMODB_TABLE,
            "Item": order_header
        }
    })

    # Execute Transaction
    client = get_client()
    # Execute Transaction (native ClientError bubbles up on failure)
    client.transact_write_items(TransactItems=transact_items)

    # 4. Emit OrderCreated Event (Post-Transaction)
    # Note: For MVP, we emit directly here. In a true enterprise system,
    # we would use the Outbox Pattern to guarantee EventBridge delivery.
    events.publish(
        event_type="OrderCreated",
        tenant_id=tenant_id,
        source="wbos.orders",
        data={
            "orderId": order_id,
            "customerId": customer_id,
            "customerPhone": customer_phone,
            "total": float(total),
            "items": order_items_records
        }
    )

    return {
        "orderId": order_id,
        "status": "PENDING",
        "subtotal": float(subtotal),
        "tax": float(tax_total),
        "total": float(total),
        "items": order_items_records
    }

def transition_order_state(tenant_id: str, order_id: str, payload: dict, actor: str):
    """
    Deterministically transitions an order's state.
    """
    transition = payload.get("transition")
    if not transition:
        raise ValueError("Transition is required")
        
    valid_transitions = {
        "CONFIRM": {"from": "NEW", "to": "CONFIRMED"},
        "START_PREPARATION": {"from": "CONFIRMED", "to": "PREPARING"},
        "COMPLETE_PREPARATION": {"from": "PREPARING", "to": "READY"},
        "DISPATCH": {"from": "READY", "to": "DELIVERY"},
        "DELIVER": {"from": "DELIVERY", "to": "DELIVERED"},
        "CANCEL": {"from": ["NEW", "CONFIRMED", "PREPARING"], "to": "CANCELLED"}
    }
    
    if transition not in valid_transitions:
        raise ValueError(f"Invalid transition: {transition}")
        
    rule = valid_transitions[transition]
    expected_old_state = rule["from"]
    new_state = rule["to"]
    
    # Payload validation
    worker_id = None
    driver_id = None
    if transition == "START_PREPARATION":
        worker_id = payload.get("workerId")
        if not worker_id:
            raise ValueError("workerId is required to start preparation")
    elif transition == "DISPATCH":
        driver_id = payload.get("driverId")
        if not driver_id:
            raise ValueError("driverId is required for dispatch")

    now = datetime.datetime.now(datetime.UTC).isoformat() + "Z"
    new_gsi2pk = f"TENANT#{tenant_id}#STATUS#{new_state}"
    
    # Determine the ConditionExpression for old state
    if isinstance(expected_old_state, list):
        # E.g. Cancel from multiple possible states
        in_expr = ", ".join([f":st{i}" for i in range(len(expected_old_state))])
        condition_expr = f"#st IN ({in_expr})"
        expr_vals = {f":st{i}": {"S": expected_old_state[i]} for i in range(len(expected_old_state))}
    else:
        condition_expr = "#st = :old_status"
        expr_vals = {":old_status": {"S": expected_old_state}}

    expr_vals[":new_status"] = {"S": new_state}
    expr_vals[":new_gsi2pk"] = {"S": new_gsi2pk}
    
    update_expr = "SET #st = :new_status, GSI2PK = :new_gsi2pk"
    
    if worker_id:
        update_expr += ", workerId = :workerId"
        expr_vals[":workerId"] = {"S": worker_id}
    if driver_id:
        update_expr += ", driverId = :driverId"
        expr_vals[":driverId"] = {"S": driver_id}

    transact_items = [
        {
            "Update": {
                "TableName": config.DYNAMODB_TABLE,
                "Key": {
                    "PK": {"S": f"TENANT#{tenant_id}#ORDER#{order_id}"},
                    "SK": {"S": "META"}
                },
                "UpdateExpression": update_expr,
                "ConditionExpression": condition_expr,
                "ExpressionAttributeNames": {"#st": "status"},
                "ExpressionAttributeValues": expr_vals
            }
        }
    ]
    
    # Audit Trail Record
    audit_id = str(uuid.uuid4())
    audit_item = {
        "PK": {"S": f"TENANT#{tenant_id}#ORDER#{order_id}"},
        "SK": {"S": f"AUDIT#{now}#{audit_id}"},
        "entityType": {"S": "ORDER_AUDIT"},
        "transition": {"S": transition},
        "newState": {"S": new_state},
        "actor": {"S": actor},
        "timestamp": {"S": now}
    }
    if isinstance(expected_old_state, str):
        audit_item["previousState"] = {"S": expected_old_state}
    if worker_id:
        audit_item["workerId"] = {"S": worker_id}
    if driver_id:
        audit_item["driverId"] = {"S": driver_id}
        
    transact_items.append({
        "Put": {
            "TableName": config.DYNAMODB_TABLE,
            "Item": audit_item
        }
    })
    
    client = get_client()
    client.transact_write_items(TransactItems=transact_items)
    
    # Publish Event
    event_names = {
        "CONFIRM": "OrderConfirmed",
        "START_PREPARATION": "OrderPreparationStarted",
        "COMPLETE_PREPARATION": "OrderPreparationCompleted",
        "DISPATCH": "OrderDispatched",
        "DELIVER": "OrderDelivered",
        "CANCEL": "OrderCancelled"
    }
    
    events.publish(
        event_type=event_names[transition],
        tenant_id=tenant_id,
        source="wbos.orders",
        data={
            "orderId": order_id,
            "previousState": expected_old_state if isinstance(expected_old_state, str) else "UNKNOWN",
            "newState": new_state,
            "actor": actor,
            "workerId": worker_id,
            "driverId": driver_id
        }
    )
    
    return {
        "orderId": order_id,
        "status": new_state,
        "transition": transition
    }
