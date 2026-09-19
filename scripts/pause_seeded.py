import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))
os.environ["AWS_REGION"] = "ap-south-1"
os.environ["DYNAMODB_TABLE"] = "WBOS_Store"

from services.automations import list_automations, pause_automation

TENANT_ID = "DEMO_TENANT"

def pause_all():
    autos = list_automations(TENANT_ID)
    for auto in autos:
        if auto['status'] == 'ACTIVE':
            print(f"Pausing {auto['name']} ({auto['id']})")
            pause_automation(TENANT_ID, auto['id'])
    print("All automations paused.")

if __name__ == "__main__":
    pause_all()
