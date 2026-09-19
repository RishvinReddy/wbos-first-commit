import unittest
import os
import sys
import boto3
from moto import mock_aws

# Add src to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

os.environ["AWS_DEFAULT_REGION"] = "ap-south-1"
os.environ["DYNAMODB_TABLE"] = "WBOS_Store"

@mock_aws
class TestConversations(unittest.TestCase):
    def setUp(self):
        self.dynamodb = boto3.resource("dynamodb", region_name="ap-south-1")
        self.table = self.dynamodb.create_table(
            TableName="WBOS_Store",
            KeySchema=[
                {"AttributeName": "PK", "KeyType": "HASH"},
                {"AttributeName": "SK", "KeyType": "RANGE"}
            ],
            AttributeDefinitions=[
                {"AttributeName": "PK", "AttributeType": "S"},
                {"AttributeName": "SK", "AttributeType": "S"}
            ],
            BillingMode="PAY_PER_REQUEST"
        )
        
    def test_persist_inbound_message(self):
        from services.conversations import persist_inbound_message, list_conversations, get_conversation_messages
        
        tenant_id = "TENANT_001"
        phone = "+919999999999"
        
        persist_inbound_message(tenant_id, phone, "Hello", "wamid.123", "2026-09-19T01:00:00Z")
        
        conversations = list_conversations(tenant_id)
        self.assertEqual(len(conversations), 1)
        self.assertEqual(conversations[0]["unreadCount"], 1)
        self.assertEqual(conversations[0]["lastMessage"], "Hello")
        
        persist_inbound_message(tenant_id, phone, "World", "wamid.124", "2026-09-19T01:05:00Z")
        
        conversations = list_conversations(tenant_id)
        self.assertEqual(conversations[0]["unreadCount"], 2)
        self.assertEqual(conversations[0]["lastMessage"], "World")
        
        messages = get_conversation_messages(tenant_id, phone)["messages"]
        self.assertEqual(len(messages), 2)
        self.assertEqual(messages[0]["direction"], "INBOUND")
        self.assertEqual(messages[0]["status"], "RECEIVED")

    def test_persist_outbound_message(self):
        from services.conversations import persist_outbound_message, list_conversations, get_conversation_messages
        
        tenant_id = "TENANT_001"
        phone = "+919999999999"
        
        persist_outbound_message(tenant_id, phone, "Hi there")
        
        conversations = list_conversations(tenant_id)
        self.assertEqual(len(conversations), 1)
        # Outbound should not increment unreadCount
        self.assertEqual(conversations[0]["unreadCount"], 0)
        self.assertEqual(conversations[0]["lastMessage"], "Hi there")
        
        messages = get_conversation_messages(tenant_id, phone)["messages"]
        self.assertEqual(len(messages), 1)
        self.assertEqual(messages[0]["direction"], "OUTBOUND")
        self.assertEqual(messages[0]["status"], "SENT")
        
    def test_tenant_isolation(self):
        from services.conversations import persist_inbound_message, list_conversations
        
        persist_inbound_message("TENANT_001", "+911111111111", "T1 msg", "wamid.1")
        persist_inbound_message("TENANT_002", "+912222222222", "T2 msg", "wamid.2")
        
        # Verify TENANT_001 only sees their conversations
        t1_convs = list_conversations("TENANT_001")
        self.assertEqual(len(t1_convs), 1)
        self.assertEqual(t1_convs[0]["customerPhone"], "+911111111111")
        
        # Verify TENANT_002 only sees their conversations
        t2_convs = list_conversations("TENANT_002")
        self.assertEqual(len(t2_convs), 1)
        self.assertEqual(t2_convs[0]["customerPhone"], "+912222222222")

    def test_empty_conversations(self):
        from services.conversations import list_conversations
        conversations = list_conversations("TENANT_EMPTY")
        self.assertEqual(conversations, [])
        
    def test_message_ordering(self):
        from services.conversations import persist_inbound_message, get_conversation_messages
        
        tenant_id = "TENANT_001"
        phone = "+913333333333"
        
        # Insert out of chronological processing order but with explicit timestamps
        persist_inbound_message(tenant_id, phone, "Second", "wamid.2", "2026-09-19T01:05:00Z")
        persist_inbound_message(tenant_id, phone, "First", "wamid.1", "2026-09-19T01:00:00Z")
        
        messages = get_conversation_messages(tenant_id, phone)["messages"]
        # DynamoDB sorts by SK (MESSAGE#timestamp#id), so older messages appear first
        self.assertEqual(messages[0]["text"], "First")
        self.assertEqual(messages[1]["text"], "Second")

if __name__ == '__main__':
    unittest.main()
