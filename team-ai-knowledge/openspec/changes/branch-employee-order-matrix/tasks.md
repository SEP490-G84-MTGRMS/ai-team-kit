# Tasks: branch-employee-order-matrix

## Frontend
- [ ] T1 — Mở rộng interface `OrderMatrixFilterBarProps` với các props tùy chọn `hideBranchSelect?: boolean` và `fixedBranchLabel?: string` (REQ-02)
- [ ] T2 — Cập nhật `OrderMatrixFilterBar.tsx` để ẩn selector `<select>` chi nhánh và hiển thị badge thông tin chi nhánh cố định khi `hideBranchSelect = true` (REQ-02)
- [ ] T3 — Xây dựng trang `EmployeeOrderMatrixPage.tsx` kế thừa toàn bộ logic đặt hàng ma trận với chi nhánh nhân viên cố định và thông báo toast (REQ-01, REQ-03, REQ-04, REQ-05)
- [ ] T4 — Đăng ký route `/employee/purchase-orders/create-matrix` trong `src/app/router.tsx` và bổ sung liên kết điều hướng vào menu (REQ-01)
- [ ] T5 — Cập nhật `src/features/purchase-order/index.ts` để export `EmployeeOrderMatrixPage` (REQ-01)

## Test & Verification
- [ ] T6 — Kiểm thử trực quan màn hình nhân viên: xác nhận dropdown chi nhánh đã bị ẩn, badge chi nhánh cố định hiển thị rõ ràng, layout flexbox không bị vỡ (REQ-01, REQ-02)
- [ ] T7 — Kiểm thử tương tác ma trận: lọc NCC, nhập số lượng theo ngày giao, cảnh báo MOQ, copy tuần trước, gửi đơn đặt hàng và lưu nháp (REQ-03, REQ-04, REQ-05)
- [ ] T8 — Regression test màn hình Store Owner (`/store-owner/purchase-orders/create-matrix`): xác nhận dropdown chi nhánh vẫn hiển thị và hoạt động bình thường
- [ ] T9 — Kiểm tra biên dịch dự án (`npm run build`) không có lỗi TypeScript hoặc linting
