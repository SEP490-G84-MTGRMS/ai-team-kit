# Specs: Pre-Order FEFO Allocation & Smart Product Selector UX

## ADDED Requirements

### Requirement: REQ-POS-PRE-04 Multi-Batch FEFO Allocation for Pre-Orders
The system MUST prioritize reserving stock from the batch with the earliest expiration date (FEFO - First Expired, First Out) when creating a pre-order.

#### Scenario: Pre-order qty spans across multiple batches
- GIVEN a branch with Product P having:
  - Batch 1: ExpireDate = Today + 5 days, QuantityOnHand = 3
  - Batch 2: ExpireDate = Today + 20 days, QuantityOnHand = 5
- WHEN a customer creates a pre-order for 4 units of Product P with a valid deposit (≥ 10%)
- THEN the system MUST deduct 3 units from Batch 1 (leaving 0)
- AND deduct 1 unit from Batch 2 (leaving 4)
- AND the pre-order status SHALL be `PendingPickup` with 2 OrderDetail line items corresponding to the allocated batches.

### Requirement: REQ-POS-PRE-05 Smart Product Autocomplete Selector for Pre-Orders
The system SHALL provide an instant autocomplete search input to filter and pick products within the Create Pre-Order modal.

#### Scenario: Cashier searches product by name or barcode
- GIVEN the Create Pre-Order modal is opened
- WHEN the cashier types a keyword or barcode into the search box
- THEN the system MUST display a dropdown list of matching products showing name, unit price, and available shelf stock
- AND clicking an item SHALL immediately add it to the selected items table
- AND the search box SHALL reset to empty and focus for the next input.

#### Scenario: Cashier adjusts item quantity using inline controls
- GIVEN an item exists in the pre-order table
- WHEN the cashier clicks the `+` or `-` button
- THEN the quantity SHALL increment or decrement accordingly
- AND the line item total amount and minimum required deposit SHALL update immediately.

## Acceptance Checklist
- [x] Backend Unit Test for multi-batch FEFO deduction passes.
- [x] Pre-order creation correctly calculates deposit minimum (10%).
- [x] Autocomplete search allows 1-click product addition in modal.
- [x] Inline `+` / `-` buttons function cleanly.
