# Inventory

## Purpose

Inventory is part of the operational order workflow. Products contain
canonical identity, price, stock quantity, and unit information.

## Units

Supported catalog units include:

-   kg
-   litre
-   packet
-   piece
-   loaf

Requested order units are validated against the product configuration.

## Catalog

The First Commit catalog is seeded independently from legacy demo orders
and is designed to be idempotent.

The intended catalog includes Maggie Noodles, Basmati Rice, Milk,
Cooking Oil, Wheat Flour, Sugar, Tea Powder, Biscuits, Bread, and Eggs.

## Inventory Lookup

The dashboard inventory endpoint reads current product records from
DynamoDB. The conversational engine can also resolve a product and
report inventory.

## Transactional Order Creation

``` text
Customer confirms
       |
Validate product
       |
Validate unit
       |
Validate stock
       |
TransactWriteItems
   +-------------------+
   | Create order      |
   | Deduct inventory  |
   +-------------------+
```

This prevents an order from being committed independently of its stock
deduction.

## Cancellation

Permitted early-state cancellation restores inventory through
transactional logic and records the cancellation/audit state.

## Dashboard Refresh

The Inventory dashboard periodically refreshes so changes appear without
a manual page reload.

## Data Integrity

Inventory is backend-authoritative. The dashboard does not independently
calculate or persist stock.

## Demo Verification

Establish a known starting stock, place a real test order, and show the
resulting deduction in the Inventory dashboard.
