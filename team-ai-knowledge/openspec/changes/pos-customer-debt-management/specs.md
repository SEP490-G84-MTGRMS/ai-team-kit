# Specifications (Delta): pos-customer-debt-management

## ADDED Requirements

### Requirement: REQ-01 Chọn Phương Thức Thanh Toán Ghi Nợ Tại Quầy POS
The POS checkout interface MUST allow the cashier to select `Ghi nợ (Bán nợ)` as a valid payment method alongside `Tiền mặt` and `Chuyển khoản VietQR`.
The system MUST require an identified customer with `allowDebt: true` before permitting checkout with the debt payment method.

#### Scenario: Cashier selects debt without customer
**GIVEN** the cashier has items in the cart and has not selected a customer  
**WHEN** the cashier selects `Ghi nợ (Bán nợ)` and clicks checkout  
**THEN** the system MUST display an alert requiring the cashier to select an identified customer before selling on credit.

#### Scenario: Cashier selects debt with valid customer
**GIVEN** an identified customer is selected with tier `Hạng Bạc (Người quen)` and debt limit of 500.000 đ  
**WHEN** the cashier selects `Ghi nợ (Bán nợ)`  
**THEN** the system MUST display the customer's current debt, debt limit, and projected debt after this order.

---

### Requirement: REQ-02 Kiểm Tra Hạn Mức Nợ & Cảnh Báo Vượt Mức
The system MUST validate whether the total debt (current debt + new order total) exceeds the customer's debt limit.
If total debt exceeds the limit, the system MUST display a warning modal showing the over-limit amount and request cashier confirmation.

#### Scenario: Order total within debt limit
**GIVEN** customer current debt is 100.000 đ and debt limit is 500.000 đ  
**WHEN** the order total is 250.000 đ (total projected debt = 350.000 đ <= 500.000 đ) and cashier clicks checkout  
**THEN** the system MUST complete the checkout immediately without displaying the over-limit warning modal.

#### Scenario: Order total exceeds debt limit
**GIVEN** customer current debt is 350.000 đ and debt limit is 500.000 đ  
**WHEN** the order total is 300.000 đ (total projected debt = 650.000 đ > 500.000 đ, exceeding by 150.000 đ)  
**THEN** the system MUST show the `DebtLimitWarningModal` highlighting the 150.000 đ over-limit amount and providing options to cancel or confirm override.

---

### Requirement: REQ-03 Phê Duyệt Bán Nợ Vượt Hạn Mức
When the warning modal is displayed, the cashier SHALL be able to approve the sale by clicking `Xác Nhận Duyệt Bán Nợ`.

#### Scenario: Cashier confirms override
**GIVEN** the over-limit warning modal is open  
**WHEN** the cashier clicks `Xác Nhận Duyệt Bán Nợ`  
**THEN** the system MUST create the invoice with status `DEBT` and remaining debt amount equal to the final payable amount.

#### Scenario: Cashier cancels override
**GIVEN** the over-limit warning modal is open  
**WHEN** the cashier clicks `Hủy thao tác`  
**THEN** the system MUST close the modal and remain on the checkout screen without creating an invoice.

---

### Requirement: REQ-04 Theo Dõi Hóa Đơn Ghi Nợ Tại Quản Lý Hóa Đơn
The Invoice Management screen MUST allow filtering invoices by debt status (`Ghi nợ (Còn nợ)`) and display the remaining debt amount in a highlighted pill.

#### Scenario: Filter invoices by debt
**GIVEN** the cashier opens `InvoiceManagementPage`  
**WHEN** the cashier selects filter `Ghi nợ (Còn nợ)`  
**THEN** the table MUST display only invoices where payment method is `DEBT` and `debtAmount > 0`.

---

### Requirement: REQ-05 Thu Nợ Hóa Đơn Bán Lẻ
The Invoice Management screen MUST provide a `Thu nợ` action on debt invoices, allowing the cashier to record debt repayments via Cash or VietQR.

#### Scenario: Partial debt repayment
**GIVEN** an invoice with remaining debt of 400.000 đ  
**WHEN** the cashier clicks `Thu nợ`, enters 150.000 đ, selects `Tiền mặt` and confirms  
**THEN** the invoice debt amount MUST update to 250.000 đ and a payment record MUST be added to `debtPaymentRecords`.

#### Scenario: Full debt settlement
**GIVEN** an invoice with remaining debt of 250.000 đ  
**WHEN** the cashier clicks `Thu nợ`, pays full 250.000 đ via `Chuyển khoản VietQR` and confirms  
**THEN** the invoice debt amount MUST become 0 đ, status MUST update to `COMPLETED`, and status label MUST display `Hoàn thành (Đã tất toán nợ)`.

---

## Acceptance Checklist
- [ ] Option `Ghi nợ (Bán nợ)` appears in `PosPaymentPanel`.
- [ ] Debt widget shows customer debt limit, current debt, and post-order debt.
- [ ] Over-limit warning modal displays when debt exceeds limit and allows cashier override.
- [ ] Thermal receipt K80 clearly marks debt invoice with remaining balance.
- [ ] Invoices list shows debt status and remaining balance badge.
- [ ] Modal `Thu nợ` records payment method (Cash/VietQR), reduces debt amount, and closes invoice upon full payment.
- [ ] TypeScript compiles cleanly with 0 errors. No remote git push.
