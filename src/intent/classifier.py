import re
from typing import Dict, Any, Optional
from dataclasses import dataclass
from .intents import Intent
from .patterns import INTENT_PATTERNS

@dataclass
class IntentResult:
    intent: Intent
    entities: Dict[str, Any]
    matched_pattern: Optional[str]

class IntentClassifier:
    def classify(self, text: str) -> IntentResult:
        if not text:
            return IntentResult(Intent.UNKNOWN, {}, None)
            
        for pattern_str, intent, group_names, label in INTENT_PATTERNS:
            match = re.search(pattern_str, text)
            if match:
                entities = {}
                # Extract groups based on group_names mapping
                if group_names:
                    for i, name in enumerate(group_names):
                        try:
                            # Group 0 is full match, Group i+1 corresponds to the sequentially defined capturing groups in regex.
                            val = match.group(i + 1) 
                            if val:
                                entities[name] = val.strip('?.!')
                        except IndexError:
                            pass
                return IntentResult(intent, entities, label)
                
        return IntentResult(Intent.UNKNOWN, {}, None)
