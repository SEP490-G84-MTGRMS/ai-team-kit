# Tasks: admin-service-plans-management

## Frontend
- [x] T1 — Định nghĩa TypeScript types (`plan.types.ts`) và Mock Data 4 gói cước chuẩn (`mockPlanData.ts`) (REQ-01)
- [x] T2 — Xây dựng component `PlanKPIBanner.tsx` hiển thị 4 thẻ thống kê tổng quan (REQ-01)
- [x] T3 — Xây dựng component `PlanFilterToolbar.tsx` tìm kiếm, dropdown trạng thái và nút hành động (REQ-02, REQ-07)
- [x] T4 — Xây dựng component `PlanDataTable.tsx` hiển thị bảng dữ liệu gói cước kèm phân trang chuẩn KiotViet (REQ-01, REQ-06)
- [x] T5 — Xây dựng component `CreatePlanModal.tsx` popup 3 phần khởi tạo gói cước mới kèm validation (REQ-03)
- [x] T6 — Xây dựng component `UpdatePlanModal.tsx` popup chỉnh sửa thông tin & hạn mức quota gói cước (REQ-04)
- [x] T7 — Xây dựng component `PlanDetailModal.tsx` popup xem chi tiết kỹ thuật và danh sách Tenant đang thuê (REQ-05)
- [x] T8 — Xây dựng trang quản trị chính `SubscriptionPlanPage.tsx` tích hợp logic CRUD và toast thông báo (REQ-01)
- [x] T9 — Cập nhật `src/app/router.tsx` đăng ký route `/admin/subscriptions` và tích hợp link điều hướng (REQ-07)

## Test & Validation
- [x] T10 — Viết unit test `src/features/admin/__tests__/planValidation.test.ts` kiểm tra logic tính toán quota và validation
- [x] T11 — Chạy kiểm thử tự động `npm run build` và `npm test` xác minh toàn bộ test pass 100%
