import json
import boto3
import os
from .config import config

# Load tool definitions from contracts
contracts_path = os.path.join(os.path.dirname(__file__), "..", "..", "contracts", "tools.json")
try:
    with open(contracts_path, "r") as f:
        tools_spec = json.load(f)
        bedrock_tools = []
        for t in tools_spec.get("tools", []):
            bedrock_tools.append({
                "toolSpec": {
                    "name": t["name"],
                    "description": t["description"],
                    "inputSchema": {
                        "json": t["input_schema"]
                    }
                }
            })
except Exception:
    bedrock_tools = []


class BedrockAdapter:
    def __init__(self):
        self.client = boto3.client("bedrock-runtime", region_name=config.AWS_REGION)
        self.model_id = config.BEDROCK_MODEL_ID

    def converse(self, messages, system_prompt=""):
        """
        Invoke Bedrock Converse API with tool definitions.
        """
        request_args = {
            "modelId": self.model_id,
            "messages": messages,
            "inferenceConfig": {
                "temperature": 0.0
            }
        }
        
        if system_prompt:
            request_args["system"] = [{"text": system_prompt}]
            
        if bedrock_tools:
            request_args["toolConfig"] = {
                "tools": bedrock_tools
            }
            
        response = self.client.converse(**request_args)
        
        return response["output"]["message"]
