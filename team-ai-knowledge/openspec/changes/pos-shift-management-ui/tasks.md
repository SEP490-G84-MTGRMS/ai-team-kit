# Tasks: pos-shift-management-ui

## Frontend Implementation

- [x] T1 — Định nghĩa types cho ca bán hàng, kiểm đếm tiền, thu chi, lịch sử ca trong `src/features/pos/types/pos.types.ts` (REQ-SHIFT-02, REQ-SHIFT-03, REQ-SHIFT-04, REQ-SHIFT-06)
- [x] T2 — Thêm mock data ca bán hàng, giao dịch thu/chi, lịch sử ca vào `src/features/pos/mock/posMockData.ts` (REQ-SHIFT-02, REQ-SHIFT-03, REQ-SHIFT-06)
- [x] T3 — Cải tiến `PosHeader.tsx`: Thêm hamburger menu (Giữ đơn, In bill gần nhất, Chốt ca / Quản lý ca) và tách tab hóa đơn xuống hàng dưới, giữ nút + [F1] luôn hiển thị ngoài (REQ-SHIFT-01)
- [x] T4 — Tạo component `ShiftKpiCard.tsx` hiển thị 4 KPI đầu ca/doanh thu/thực tế/chuyển khoản (REQ-SHIFT-02)
- [x] T5 — Tạo component `ShiftRevenueTable.tsx` hiển thị doanh thu theo phương thức thanh toán (REQ-SHIFT-03)
- [x] T6 — Tạo component `ShiftCashInOutTable.tsx` hiển thị bảng thu/chi tiền mặt tại quầy kèm phân trang `admin-pagination-footer` (REQ-SHIFT-03)
- [x] T7 — Tạo component `CashCountingTable.tsx` kiểm đếm 9 mệnh giá tiền mặt và `CashReconciliation.tsx` đối chiếu chênh lệch két (REQ-SHIFT-04)
- [x] T8 — Tạo component `ShiftHandoverForm.tsx` form bàn giao ca, tiền để lại, tiền nộp lại và nút đóng ca có xác nhận (REQ-SHIFT-05)
- [x] T9 — Tạo modal `CashInOutModal.tsx` lập phiếu thu/chi nội bộ tại két và `ZReportModal.tsx` in bill K80 khổ 320px (REQ-SHIFT-07)
- [x] T10 — Tạo component `ShiftHistoryFilter.tsx` và `ShiftHistoryTable.tsx` cho tab Lịch sử đóng ca kèm phân trang `admin-pagination-footer` (REQ-SHIFT-06)
- [x] T11 — Tạo page `PosShiftPage.tsx` tích hợp 2 tab "Phiên Ca Bán Hàng" và "Báo Cáo Sổ Quỹ & Lịch Sử Đóng Ca" (REQ-SHIFT-02..06)
- [x] T12 — Thêm CSS styling chuẩn tokens hệ thống vào `src/features/pos/pos.css` (REQ-SHIFT-01..07)
- [x] T13 — Khai báo route `/pos/shift` trong router ứng dụng và export các component mới trong `src/features/pos/index.ts` (REQ-SHIFT-01)

## Verification & Test

- [x] T14 — Chạy `npm run build` xác minh không có lỗi TypeScript hoặc lint (REQ-SHIFT-01..07)
- [x] T15 — Kiểm thử giao diện trên trình duyệt (hamburger menu, dời tab, kiểm đếm tiền, đổi tab lịch sử ca, modal Z-report)
