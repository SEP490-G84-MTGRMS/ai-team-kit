# Spec: pos-customer-api-route-and-field-mapping-fix

> Spec gốc của capability. Chỉ cập nhật qua `/sep-archive` (merge delta từ `openspec/changes/<change>/specs.md`).

## Requirements

### Requirement: REQ-CUST-ROUTE-01 Định tuyến API Khách hàng (Dual Routing)
1. `CustomersController` **MUST** hỗ trợ cả hai route: `[Route("api/[controller]")]` và `[Route("api/v1/[controller]")]`.
2. `CustomerDebtController` **MUST** hỗ trợ cả hai route: `[Route("api/customers/debt")]` và `[Route("api/v1/customers/debt")]`.
3. Request gửi tới `GET /api/v1/customers` với header `X-Tenant-Id` **MUST** trả về danh sách khách hàng thuộc tenant đó từ CSDL PostgreSQL (HTTP 200 OK).

#### Scenario: Gọi API lấy danh sách khách hàng qua route v1
- **GIVEN** Tenant `tenant_an_nhien_02` có 3 khách hàng trong PostgreSQL (gồm khách hàng `KH26110509554270` - Sơn)
- **WHEN** Frontend POS gửi request `GET /api/v1/customers` kèm header tenant
- **THEN** Backend trả về HTTP 200 OK với danh sách 3 khách hàng và không trả về lỗi 404 Not Found.

---

### Requirement: REQ-CUST-MAP-02 Ánh xạ dữ liệu khách hàng Frontend POS
1. Hàm `posOrderApi.getAllCustomers()` **MUST** ánh xạ chính xác các trường dữ liệu từ DTO backend:
   - `name: c.fullName || c.name || ''`
   - `phone: c.phoneNumber || c.phone || ''`
   - `code: c.customerCode || c.code || ''`
   - `loyaltyPoints: c.loyaltyPoints ?? c.rewardPoints ?? 0`
   - `currentDebt: c.currentDebtAR ?? c.currentDebt ?? c.totalDebt ?? 0`
2. `PosCheckoutPage` **MUST** cập nhật danh sách `customers` state bằng dữ liệu nhận được từ API backend, và chỉ dùng mock data khi API thực sự không có kết nối.

#### Scenario: Tìm kiếm khách hàng mới tạo trong POS
- **GIVEN** Khách hàng "Sơn" (Mã `KH26110509554270`, SĐT `0961934104`) vừa được tạo trong CSDL
- **WHEN** Thu ngân mở màn hình POS hoặc gõ "Sơn" / "0961934104"
- **THEN** Dropdown hiển thị khách hàng "Sơn" với mã `KH26110509554270`
- **AND** Không bị rơi vào dữ liệu mock mặc định.

## Lịch sử
- 2026-11-05 · `pos-customer-api-route-and-field-mapping-fix` · +0 ~2 -0
