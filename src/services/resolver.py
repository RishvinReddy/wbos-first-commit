import logging
from services.products import search_products

logger = logging.getLogger(__name__)

class ProductResolver:
    """
    Separates string matching from intent classification.
    Given a productQuery string (e.g., 'maggie', 'basmati rice'), 
    it finds the canonical product ID via DynamoDB.
    """
    
    @staticmethod
    def resolve(tenant_id: str, product_query: str) -> dict:
        """
        Returns the resolved product dictionary containing productId, name, price, stock, and unit.
        Returns None if no matching product is found.
        """
        if not product_query:
            return None
            
        # We fetch a few matches and pick the first one (most relevant).
        # search_products currently does an in-memory substring match, 
        # which supports inputs like 'maggie' matching 'Maggie Noodles'.
        matches = search_products(tenant_id, query=product_query, limit=1)
        
        if matches:
            return matches[0]
            
        return None
