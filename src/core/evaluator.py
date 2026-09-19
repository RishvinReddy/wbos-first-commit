import logging
from decimal import Decimal

logger = logging.getLogger(__name__)

def resolve_path(obj: dict, path: str):
    """Resolves a dot-notation path in a dictionary (e.g. 'order.total')."""
    keys = path.split('.')
    current = obj
    for key in keys:
        if isinstance(current, dict) and key in current:
            current = current[key]
        else:
            return None
    return current

def evaluate_condition(event_data: dict, condition: dict) -> bool:
    """Evaluates a single condition against the event data payload."""
    field_path = condition.get("field")
    operator = condition.get("operator")
    expected_value = condition.get("value")
    
    if not field_path or not operator:
        return False
        
    actual_value = resolve_path(event_data, field_path)
    
    # Type normalization for numbers
    def _num(v):
        if v is None: return None
        try: return Decimal(str(v))
        except: return None
        
    try:
        if operator == "equals":
            return str(actual_value) == str(expected_value)
        elif operator == "not_equals":
            return str(actual_value) != str(expected_value)
        elif operator == "greater_than":
            return _num(actual_value) is not None and _num(expected_value) is not None and _num(actual_value) > _num(expected_value)
        elif operator == "less_than":
            return _num(actual_value) is not None and _num(expected_value) is not None and _num(actual_value) < _num(expected_value)
        elif operator == "greater_or_equal":
            return _num(actual_value) is not None and _num(expected_value) is not None and _num(actual_value) >= _num(expected_value)
        elif operator == "less_or_equal":
            return _num(actual_value) is not None and _num(expected_value) is not None and _num(actual_value) <= _num(expected_value)
        elif operator == "contains":
            return actual_value is not None and expected_value is not None and str(expected_value).lower() in str(actual_value).lower()
        elif operator == "not_contains":
            return actual_value is not None and expected_value is not None and str(expected_value).lower() not in str(actual_value).lower()
        elif operator == "exists":
            return actual_value is not None
        elif operator == "not_exists":
            return actual_value is None
        else:
            logger.warning(f"Unknown operator: {operator}")
            return False
    except Exception as e:
        logger.error(f"Evaluation error for {field_path} {operator} {expected_value}: {e}")
        return False

def evaluate_all(event_data: dict, conditions: list) -> bool:
    """Evaluates all conditions (AND logic)."""
    if not conditions:
        return True
        
    for cond in conditions:
        if not evaluate_condition(event_data, cond):
            return False
            
    return True

def dry_run(tenant_id: str, payload: dict) -> dict:
    """
    Executes a dry-run test mode of an automation against a simulated event payload.
    Ensures zero side effects.
    """
    trigger = payload.get("trigger", {})
    conditions = payload.get("conditions", [])
    actions = payload.get("actions", [])
    event_data = payload.get("eventData", {})
    
    trace = []
    
    # 1. Trigger
    trace.append({
        "step": "Trigger",
        "detail": trigger.get("type", "UNKNOWN"),
        "status": "SUCCESS"
    })
    
    # 2. Conditions
    cond_pass = True
    for cond in conditions:
        passed = evaluate_condition(event_data, cond)
        trace.append({
            "step": "Condition",
            "detail": f"{cond.get('field')} {cond.get('operator')} {cond.get('value')}",
            "status": "SUCCESS" if passed else "SKIPPED"
        })
        if not passed:
            cond_pass = False
            break
            
    if not cond_pass:
        return {"result": "SKIPPED", "trace": trace, "sideEffects": 0}
        
    # 3. Actions
    for action in actions:
        trace.append({
            "step": "Action (Simulated)",
            "detail": action.get("type"),
            "status": "SUCCESS",
            "message": f"Would execute {action.get('type')} but side effects are disabled in test mode."
        })
        
    return {"result": "SUCCESS", "trace": trace, "sideEffects": 0}
