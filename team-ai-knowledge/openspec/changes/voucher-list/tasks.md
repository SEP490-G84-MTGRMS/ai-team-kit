# Tasks: Màn hình Quản lý Đợt Phát hành Mã Giảm giá Voucher / Coupon (`voucher-list`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `VoucherCode` đảm bảo lọc `TenantId` (`REQ-VOUC-LIST-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `voucher-list` (`REQ-VOUC-LIST-02`, `REQ-VOUC-LIST-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `VouchersController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner) (`REQ-VOUC-LIST-01`, `REQ-VOUC-LIST-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/promotion/pages/VoucherListPage.tsx` tại route `/store-owner/vouchers` và kết nối API thời gian thực (`REQ-VOUC-LIST-01` → `REQ-VOUC-LIST-04`).

## Test & Nghiệm thu
- [ ] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-16-02` (`REQ-VOUC-LIST-01` → `REQ-VOUC-LIST-04`).
