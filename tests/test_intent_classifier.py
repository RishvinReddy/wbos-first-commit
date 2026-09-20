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

        res = self.classifier.classify("track order WB1024")
        self.assertEqual(res.intent, Intent.ORDER_TRACKING)
        self.assertEqual(res.entities.get("order_id"), "WB1024")

    def test_order_history(self):
        res = self.classifier.classify("show my previous orders")
        self.assertEqual(res.intent, Intent.ORDER_HISTORY)

    def test_inventory_check(self):
        res = self.classifier.classify("do you have rice?")
        self.assertEqual(res.intent, Intent.INVENTORY_CHECK)
        self.assertEqual(res.entities.get("productQuery"), "rice")

    def test_product_lookup(self):
        res = self.classifier.classify("How much is rice?")
        self.assertEqual(res.intent, Intent.PRODUCT_LOOKUP)
        self.assertEqual(res.entities.get("productQuery"), "rice")

    def test_catalog(self):
        for text in ["What do you have?", "Give me all items", "Show me all products", "catalog", "view catalog"]:
            res = self.classifier.classify(text)
            self.assertEqual(res.intent, Intent.CATALOG, f"Failed on '{text}'")

    def test_menu_selection(self):
        for num in ["1", "2", "6", "7", "8", "21", "22"]:
            res = self.classifier.classify(num)
            self.assertEqual(res.intent, Intent.MENU_SELECTION)
            self.assertEqual(res.entities.get("option"), num)

    def test_create_order(self):
        # general
        res = self.classifier.classify("Place an order")
        self.assertEqual(res.intent, Intent.CREATE_ORDER)
        
        # product first
        res = self.classifier.classify("Maggie noodles 2 packets")
        self.assertEqual(res.intent, Intent.CREATE_ORDER)
        self.assertEqual(res.entities.get("productQuery"), "Maggie noodles")
        self.assertEqual(res.entities.get("quantity"), "2")
        self.assertEqual(res.entities.get("unit"), "packet")

        # quantity first
        res = self.classifier.classify("2 packets of Maggie noodles")
        self.assertEqual(res.intent, Intent.CREATE_ORDER)
        self.assertEqual(res.entities.get("productQuery"), "Maggie noodles")
        self.assertEqual(res.entities.get("quantity"), "2")
        self.assertEqual(res.entities.get("unit"), "packet")

        res = self.classifier.classify("I want 2 kg basmati rice")
        self.assertEqual(res.intent, Intent.CREATE_ORDER)
        self.assertEqual(res.entities.get("productQuery"), "basmati rice")
        self.assertEqual(res.entities.get("quantity"), "2")
        self.assertEqual(res.entities.get("unit"), "kg")
        
        res = self.classifier.classify("Buy 2 Maggie noodles")
        self.assertEqual(res.intent, Intent.CREATE_ORDER)
        self.assertEqual(res.entities.get("productQuery"), "Maggie noodles")
        self.assertEqual(res.entities.get("quantity"), "2")
        self.assertIsNone(res.entities.get("unit"))

    def test_cancel_order(self):
        res = self.classifier.classify("cancel order WB1024")
        self.assertEqual(res.intent, Intent.CANCEL_ORDER)
        self.assertEqual(res.entities.get("order_id"), "WB1024")

    def test_invoice(self):
        res = self.classifier.classify("send my invoice")
        self.assertEqual(res.intent, Intent.INVOICE_REQUEST)

    def test_support(self):
        res = self.classifier.classify("contact support")
        self.assertEqual(res.intent, Intent.SUPPORT_TICKET)

    def test_help(self):
        res = self.classifier.classify("help")
        self.assertEqual(res.intent, Intent.HELP)

    def test_greeting(self):
        for text in ["hello", "hi there", "hi", "hey"]:
            res = self.classifier.classify(text)
            self.assertEqual(res.intent, Intent.GREETING, f"Failed on '{text}'")

    def test_unknown(self):
        res = self.classifier.classify("what is the weather like?")
        self.assertEqual(res.intent, Intent.UNKNOWN)

if __name__ == '__main__':
    unittest.main()
