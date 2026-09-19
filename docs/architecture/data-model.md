# WBOS v2 — DynamoDB Single-Table Design

## 1. Design Overview

* **Table Name**: `WBOS_Store`
* **Billing Mode**: PAY_PER_REQUEST (On-Demand)
* **Primary Key**:
  * Partition Key: `PK` (String)
  * Sort Key: `SK` (String)
* **Global Secondary Indexes**:
  * **GSI1**: `GSI1PK` (String), `GSI1SK` (String) — *Entity Lookup & Inverted Indices*
  * **GSI2**: `GSI2PK` (String), `GSI2SK` (String) — *Operational Status Queues & Time-Series Projections*

---

## 2. Multi-Tenant Key Partitioning Rules

Every entity is namespaced by its `tenantId` in the partition key.

| Entity Type | `PK` | `SK` | `GSI1PK` | `GSI1SK` | `GSI2PK` | `GSI2SK` |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Customer** | `TENANT#<t>#CUSTOMER#<c>` | `PROFILE` | `PHONE#<phone>` | `TENANT#<t>` | `TENANT#<t>#CUSTOMERS` | `NAME#<name>` |
| **Product** | `TENANT#<t>#PRODUCT#<p>` | `METADATA` | `TENANT#<t>#CAT#<category>` | `PROD#<p>` | `TENANT#<t>#LOW_STOCK` | `STOCK#<stock_pad>` |
| **Order Meta** | `TENANT#<t>#ORDER#<o>` | `META` | `TENANT#<t>#CUS#<c>` | `ORDER#<createdAt>#<o>` | `TENANT#<t>#STATUS#<status>`| `CREATED#<createdAt>` |
| **Order Item** | `TENANT#<t>#ORDER#<o>` | `ITEM#<p>` | `TENANT#<t>#PRODUCT#<p>` | `ORDER#<o>` | — | — |
| **Delivery** | `TENANT#<t>#ORDER#<o>` | `DELIVERY` | `TENANT#<t>#DRIVER#<driver>`| `ASSIGNED#<assignedAt>` | `TENANT#<t>#DELIVERY_STATUS#<s>` | `ASSIGNED#<assignedAt>` |
| **Daily Sales** | `TENANT#<t>#ANALYTICS` | `DATE#<YYYY-MM-DD>` | — | — | — | — |

---

## 3. Entity Schema Definitions

### 3.1 Customer Profile Record
```json
{
  "PK": "TENANT#TENANT_001#CUSTOMER#CUS_01J8R9X2B0Z",
  "SK": "PROFILE",
  "GSI1PK": "PHONE#+919347761153",
  "GSI1SK": "TENANT#TENANT_001",
  "GSI2PK": "TENANT#TENANT_001#CUSTOMERS",
  "GSI2SK": "NAME#Rishvin",
  "entityType": "CUSTOMER",
  "tenantId": "TENANT_001",
  "customerId": "CUS_01J8R9X2B0Z",
  "phone": "+919347761153",
  "name": "Rishvin",
  "address": {
    "text": "Sector 15, Belapur, Navi Mumbai",
    "latitude": 19.0225,
    "longitude": 73.0415
  },
  "isTakeover": false,
  "status": "ACTIVE",
  "createdAt": "2026-09-17T12:00:00Z"
}
```

### 3.2 Product Catalog Record
```json
{
  "PK": "TENANT#TENANT_001#PRODUCT#PROD_001",
  "SK": "METADATA",
  "GSI1PK": "TENANT#TENANT_001#CAT#Grocery & Staples",
  "GSI1SK": "PROD#PROD_001",
  "GSI2PK": "TENANT#TENANT_001#LOW_STOCK",
  "GSI2SK": "STOCK#000042",
  "entityType": "PRODUCT",
  "tenantId": "TENANT_001",
  "productId": "PROD_001",
  "name": "Basmati Rice (Rozana 1kg)",
  "category": "Grocery & Staples",
  "unit": "kg",
  "price": 120.00,
  "stock": 42,
  "lowStockThreshold": 15,
  "taxRate": 0.05,
  "status": "ACTIVE"
}
```

### 3.3 Order Header Record (`SK = META`)
```json
{
  "PK": "TENANT#TENANT_001#ORDER#ORD_001",
  "SK": "META",
  "GSI1PK": "TENANT#TENANT_001#CUS#CUS_01J8R9X2B0Z",
  "GSI1SK": "ORDER#2026-09-17T12:30:00Z#ORD_001",
  "GSI2PK": "TENANT#TENANT_001#STATUS#PENDING",
  "GSI2SK": "CREATED#2026-09-17T12:30:00Z",
  "entityType": "ORDER_HEADER",
  "tenantId": "TENANT_001",
  "orderId": "ORD_001",
  "customerId": "CUS_01J8R9X2B0Z",
  "customerName": "Rishvin",
  "customerPhone": "+919347761153",
  "deliveryAddress": "Sector 15, Belapur, Navi Mumbai",
  "status": "PENDING",
  "itemCount": 2,
  "subtotal": 240.00,
  "tax": 12.00,
  "deliveryFee": 0.00,
  "total": 252.00,
  "createdAt": "2026-09-17T12:30:00Z"
}
```

### 3.4 Order Item Record (`SK = ITEM#<productId>`)
```json
{
  "PK": "TENANT#TENANT_001#ORDER#ORD_001",
  "SK": "ITEM#PROD_001",
  "GSI1PK": "TENANT#TENANT_001#PRODUCT#PROD_001",
  "GSI1SK": "ORDER#ORD_001",
  "entityType": "ORDER_ITEM",
  "tenantId": "TENANT_001",
  "orderId": "ORD_001",
  "productId": "PROD_001",
  "name": "Basmati Rice (Rozana 1kg)",
  "quantity": 2.0,
  "unit": "kg",
  "unitPrice": 120.00,
  "lineTotal": 240.00
}
```

---

## 4. Access Patterns Matrix

| ID | Access Pattern | Target | Key Condition Expression | Filter / Projection |
| :--- | :--- | :--- | :--- | :--- |
| **AP-01** | Find Customer by Phone | GSI1 | `GSI1PK = :phone AND GSI1SK = :tenant` | Fast O(1) WhatsApp webhook sender resolution |
| **AP-02** | Get Customer Profile by ID | Base | `PK = TENANT#<t>#CUSTOMER#<c> AND SK = :profile` | Single item read |
| **AP-03** | List Products in Category | GSI1 | `GSI1PK = TENANT#<t>#CAT#<cat>` | Category browsing |
| **AP-04** | Get Product by ID | Base | `PK = TENANT#<t>#PRODUCT#<p> AND SK = :meta` | Stock & pricing lookup |
| **AP-05** | List Low-Stock Products | GSI2 | `GSI2PK = TENANT#<t>#LOW_STOCK AND GSI2SK <= :threshold` | Store reorder alerts & Owner BI |
| **AP-06** | Read Order with ALL Items | Base | `PK = TENANT#<t>#ORDER#<o>` | **Single Query**: returns Order Meta AND all Order Items in one round-trip! |
| **AP-07** | List Customer's Past Orders | GSI1 | `GSI1PK = TENANT#<t>#CUS#<c>` | Sort by date descending (Customer order history) |
| **AP-08** | List Orders by Status Queue | GSI2 | `GSI2PK = TENANT#<t>#STATUS#<status>` | Operational queue for Store Manager (e.g. `PENDING`, `PREPARING`) |
| **AP-09** | List Driver's Active Runs | GSI1 | `GSI1PK = TENANT#<t>#DRIVER#<driver>` | Dispatcher & Rider portal |
| **AP-10** | Get Daily Sales Record | Base | `PK = TENANT#<t>#ANALYTICS AND SK = DATE#<date>` | Instant O(1) Owner BI lookup |

---

## 5. Concurrency & Transaction Guarantees

### Atomic Order Creation with Stock Reservation
Orders are created using `TransactWriteItems`:
1. **Put** Order Header (`SK = META`).
2. **Put** Order Items (`SK = ITEM#<productId>`).
3. **Update** Product Records: `SET stock = stock - :qty` with condition `stock >= :qty`.
   * If any item is out of stock, the entire transaction rolls back atomically. Zero phantom stock deductions.

### Deterministic State Transitions
Status updates are guarded with `attribute_exists` and conditional checks:
```text
ConditionExpression: attribute_exists(PK) AND #status IN (:allowed_prior_statuses)
```
For example, an order cannot transition to `OUT_FOR_DELIVERY` unless its current `#status` is `READY`.
