# Tasks: purchase-order-grid-creation (FE-05 Ordering)

## Backend (.NET 8)
- [x] T1 — Tạo DTOs cho PO Grid (`GridInitDto`, `GridProductDto`, `SubmitGridPoCommand`, `SplitPoItemDto`) trong `MT_GRMS.Application` (REQ-POGRID-01, REQ-POGRID-02)
- [x] T2 — Triển khai Query Handler `GetPoGridProductsQuery` với logic lọc LeadTime, ActiveDays, Holidays và CutoffSchedules trong `MT_GRMS.Application` (REQ-POGRID-01, REQ-POGRID-03)
- [x] T3 — Triển khai FluentValidation cho `SubmitGridPoCommand` kiểm tra MOQ & Bội số đặt hàng (REQ-POGRID-05)
- [x] T4 — Triển khai Command Handler `SubmitGridPoCommandHandler` tự động tách PO theo `[BranchId + SupplierId + DeliveryDate]` & gán trạng thái `PENDING_CREDIT_APPROVAL` nếu vượt `CreditLimit` (REQ-POGRID-04, REQ-POGRID-08)
- [x] T5 — Thêm Controller Endpoint `PurchaseOrderGridController` trong `MT_GRMS.Api` (REQ-POGRID-01, REQ-POGRID-04)

## Frontend (Vite + React 19 + TypeScript)
- [x] T6 — Mở rộng Types trong `types/po.types.ts`: cấu trúc `MatrixCellData` (3 trường `employeeQty`, `storeQty`, `finalQty`), `DayCutoffStatus`, `SplitPoPreview` (REQ-POGRID-02, REQ-POGRID-03)
- [x] T7 — Nâng cấp `OrderMatrixFilterBar`: hỗ trợ chọn preset thời gian 7/14/21/31 ngày, ràng buộc tối đa 31 ngày, filter "Chủ đã sửa", "Cảnh báo vi phạm MOQ" (REQ-POGRID-01, REQ-POGRID-02)
- [x] T8 — Nâng cấp `OrderMatrixTable`: hiển thị Cutoff Header theo từng ngày giao, ô nhập 3 trường số lượng kèm chỉ báo trực quan Store Owner override và khôi phục số lượng NV (REQ-POGRID-02, REQ-POGRID-03)
- [x] T9 — Triển khai tiện ích Đề xuất số lượng (Suggested Qty), Sao chép tuần trước, Xuất/Nhập Excel (REQ-POGRID-06, REQ-POGRID-07)
- [x] T10 — Triển khai Modal `OrderMatrixSplitModal`: xem trước và thực hiện chốt đơn bóc tách độc lập theo từng `[Chi nhánh + NCC + Ngày giao hàng]`, phân biệt ngày đến hạn Cutoff vs ngày tương lai (REQ-POGRID-03, REQ-POGRID-04)
- [x] T11 — Cập nhật `OrderMatrixPage` kết nối toàn bộ luồng nghiệp vụ FE-05 tại `/store-owner/purchase-orders/create-matrix` (REQ-POGRID-01 -> REQ-POGRID-08)

## Test & Verification
- [x] T12 — Kiểm tra tính toán FinalQty = EmployeeQty khi StoreQty = null và FinalQty = StoreQty khi StoreQty != null
- [x] T13 — Kiểm tra tách PO theo từng ngày giao hàng và NCC khi chốt đơn
- [x] T14 — TypeScript compilation (`tsc -b`) và Vite production build đạt 100% PASS

## Tasks Sáp Nhập Từ Các Change Con

<!-- Tasks sáp nhập từ: branch-employee-order-matrix -->
# Tasks: branch-employee-order-matrix

## Frontend
- [x] T1 — Mở rộng interface `OrderMatrixFilterBarProps` với các props tùy chọn `hideBranchSelect?: boolean` và `fixedBranchLabel?: string` (REQ-02)
- [x] T2 — Cập nhật `OrderMatrixFilterBar.tsx` để ẩn selector `<select>` chi nhánh và hiển thị badge thông tin chi nhánh cố định khi `hideBranchSelect = true` (REQ-02)
- [x] T3 — Xây dựng trang `EmployeeOrderMatrixPage.tsx` kế thừa toàn bộ logic đặt hàng ma trận với chi nhánh nhân viên cố định và thông báo toast (REQ-01, REQ-03, REQ-04, REQ-05)
- [x] T4 — Đăng ký route `/employee/purchase-orders/create-matrix` trong `src/app/router.tsx` và bổ sung liên kết điều hướng vào menu (REQ-01)
- [x] T5 — Cập nhật `src/features/purchase-order/index.ts` để export `EmployeeOrderMatrixPage` (REQ-01)

## Test & Verification
- [x] T6 — Kiểm thử trực quan màn hình nhân viên: xác nhận dropdown chi nhánh đã bị ẩn, badge chi nhánh cố định hiển thị rõ ràng, layout flexbox không bị vỡ (REQ-01, REQ-02)
- [x] T7 — Kiểm thử tương tác ma trận: lọc NCC, nhập số lượng theo ngày giao, cảnh báo MOQ, copy tuần trước, gửi đơn đặt hàng và lưu nháp (REQ-03, REQ-04, REQ-05)
- [x] T8 — Regression test màn hình Store Owner (`/store-owner/purchase-orders/create-matrix`): xác nhận dropdown chi nhánh vẫn hiển thị và hoạt động bình thường
- [x] T9 — Kiểm tra biên dịch dự án (`npm run build`) không có lỗi TypeScript hoặc linting
