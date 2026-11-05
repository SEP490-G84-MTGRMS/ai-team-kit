# Tasks: pos-customer-api-route-and-field-mapping-fix

- [ ] T1 — Backend API Routing (`CustomersController.cs` & `CustomerDebtController.cs`): Thêm route kép `[Route("api/v1/[controller]")]` và `[Route("api/v1/customers/debt")]` (tham chiếu REQ-CUST-ROUTE-01).
- [ ] T2 — Frontend POS API DTO Mapping (`posOrderApi.ts`): Cập nhật ánh xạ trường `fullName` -> `name`, `phoneNumber` -> `phone`, `customerCode` -> `code` (tham chiếu REQ-CUST-MAP-02).
- [ ] T3 — Kiểm thử Tự động & Tích hợp: Kiểm tra gọi endpoint `/api/v1/customers` trả về HTTP 200 và khách hàng `KH26110509554270` (Sơn), chạy toàn bộ unit tests backend và frontend build.
