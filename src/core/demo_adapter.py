class DemoAdapter:
    def converse(self, messages, system_prompt):
        last_message = ""
        if messages and len(messages) > 0:
            last_message_content = messages[-1].get('content', [])
            if last_message_content:
                last_message = last_message_content[0].get('text', '').lower()
        
        if "basmati rice" in last_message and "2kg" in last_message:
            return {
                "content": [
                    {
                        "toolUse": {
                            "name": "create_order",
                            "input": {
                                "items": [
                                    {"productId": "PROD_BASMATI", "quantity": 2}
                                ],
                                "deliveryAddress": "123 Main St, Demo City"
                            }
                        }
                    }
                ]
            }

        return {
            "content": [
                {
                    "text": "DEMO MODE: I didn't recognize this specific demo intent. Try 'Need 2kg basmati rice'."
                }
            ]
        }
