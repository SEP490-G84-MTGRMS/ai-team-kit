# Tasks: Màn hình Quản lý Khách hàng CRM, Hạn mức Công nợ Phải thu (AR) & Thu nợ (`customer-crm-debt`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `Customer`, `CashbookEntry` đảm bảo lọc `TenantId` (`REQ-CUST-CRM-DEBT-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `customer-crm-debt` (`REQ-CUST-CRM-DEBT-02`, `REQ-CUST-CRM-DEBT-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `CustomersController.cs`, `CustomerDebtController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner, Employee) (`REQ-CUST-CRM-DEBT-01`, `REQ-CUST-CRM-DEBT-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/customer-crm/pages/CustomerManagementPage.tsx` tại route `/store-owner/customers` và kết nối API thời gian thực (`REQ-CUST-CRM-DEBT-01` → `REQ-CUST-CRM-DEBT-04`).

## Test & Nghiệm thu
- [x] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-08-01` (`REQ-CUST-CRM-DEBT-01` → `REQ-CUST-CRM-DEBT-04`).
