import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

from intent.classifier import IntentClassifier
from intent.intents import Intent

class TestIntentClassifier(unittest.TestCase):
    def setUp(self):
        self.classifier = IntentClassifier()

    def test_order_tracking(self):
        res = self.classifier.classify("Track my order")
        self.assertEqual(res.intent, Intent.ORDER_TRACKING)
        self.assertNotIn("order_id", res.entities)

        res = self.classifier.classify("Where is my order?")
        self.assertEqual(res.intent, Intent.ORDER_TRACKING)

        res = self.classifier.classify("track order WB1024")
        self.assertEqual(res.intent, Intent.ORDER_TRACKING)
        self.assertEqual(res.entities.get("order_id"), "WB1024")

    def test_order_history(self):
        res = self.classifier.classify("show my previous orders")
        self.assertEqual(res.intent, Intent.ORDER_HISTORY)

    def test_inventory_check(self):
        res = self.classifier.classify("do you have rice?")
        self.assertEqual(res.intent, Intent.INVENTORY_CHECK)
        self.assertEqual(res.entities.get("product"), "rice")

    def test_create_order(self):
        res = self.classifier.classify("I want 3 packets of rice")
        self.assertEqual(res.intent, Intent.CREATE_ORDER)
        self.assertEqual(res.entities.get("quantity"), "3")
        self.assertEqual(res.entities.get("product"), "rice")

    def test_cancel_order(self):
        res = self.classifier.classify("cancel order WB1024")
        self.assertEqual(res.intent, Intent.CANCEL_ORDER)
        self.assertEqual(res.entities.get("order_id"), "WB1024")

    def test_invoice(self):
        res = self.classifier.classify("send my invoice")
        self.assertEqual(res.intent, Intent.INVOICE_REQUEST)

    def test_store_hours(self):
        res = self.classifier.classify("what time do you open?")
        self.assertEqual(res.intent, Intent.STORE_HOURS)

    def test_help(self):
        res = self.classifier.classify("help")
        self.assertEqual(res.intent, Intent.HELP)

    def test_greeting(self):
        res = self.classifier.classify("hello")
        self.assertEqual(res.intent, Intent.GREETING)

        res = self.classifier.classify("hi there")
        self.assertEqual(res.intent, Intent.GREETING)

    def test_unknown(self):
        res = self.classifier.classify("what is the weather like?")
        self.assertEqual(res.intent, Intent.UNKNOWN)

    def test_place_order_general(self):
        res = self.classifier.classify("Place an order")
        self.assertEqual(res.intent, Intent.CREATE_ORDER)
        self.assertNotIn("product", res.entities)

        res = self.classifier.classify("Place an order for 2 packets of rice")
        self.assertEqual(res.intent, Intent.CREATE_ORDER)
        self.assertEqual(res.entities.get("quantity"), "2")
        self.assertEqual(res.entities.get("product"), "rice")

if __name__ == '__main__':
    unittest.main()
