# Tasks: Màn hình Quản lý Chi phí Vận hành & Mua sắm Dịch vụ Ngoài (`service-expenses`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `ExpenseVoucher`, `CashbookEntry` đảm bảo lọc `TenantId` (`REQ-SERV-EXPE-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `service-expenses` (`REQ-SERV-EXPE-02`, `REQ-SERV-EXPE-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `ExpensesController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner, Employee) (`REQ-SERV-EXPE-01`, `REQ-SERV-EXPE-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/service-expenses/pages/ServiceExpensesPage.tsx` tại route `/store-owner/expenses` và kết nối API thời gian thực (`REQ-SERV-EXPE-01` → `REQ-SERV-EXPE-04`).

## Test & Nghiệm thu
- [x] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-07-01` (`REQ-SERV-EXPE-01` → `REQ-SERV-EXPE-04`).
