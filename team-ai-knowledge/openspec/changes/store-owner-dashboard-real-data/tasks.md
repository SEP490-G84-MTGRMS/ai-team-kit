# Tasks: store-owner-dashboard-real-data

## DB
- Không thay đổi schema hoặc migration; dùng truy vấn đọc từ bảng hiện có.

## Backend
- [x] T1 — Định nghĩa DTO/filter và tính khoảng kỳ theo Asia/Ho_Chi_Minh cho dashboard; kiểm tra đầu vào. (REQ-DASH-REAL-01, REQ-DASH-REAL-02)
- [x] T2 — Tổng hợp doanh số, trend và tài chính từ cùng logic P&L, xử lý tăng trưởng khi kỳ trước bằng 0. (REQ-DASH-REAL-03)
- [x] T3 — Tổng hợp PO chờ duyệt/chờ nhận và GRN COMPLETED theo thời điểm xác nhận, không đếm trùng. (REQ-DASH-REAL-04)
- [x] T4 — Tổng hợp cảnh báo kho và số nhân viên theo tenant/chi nhánh, giới hạn preview 5 dòng. (REQ-DASH-REAL-05)
- [x] T5 — Tạo GET `/api/store-owner/dashboard`, kiểm tra StoreOwner, tenant/branch và lỗi filter. (REQ-DASH-REAL-01, REQ-DASH-REAL-02, REQ-DASH-REAL-06)

## Frontend
- [x] T6 — Tạo API client/types và quản lý bộ lọc, loading, empty/error, bỏ response cũ khi đổi filter. (REQ-DASH-REAL-01, REQ-DASH-REAL-02)
- [x] T7 — Thiết kế lại header, KPI, biểu đồ doanh số và khối tài chính bằng dữ liệu API; xóa số/tên chi nhánh/trạng thái ca giả khỏi màn hình. (REQ-DASH-REAL-01, REQ-DASH-REAL-03)
- [x] T8 — Thiết kế khối nhập hàng, cảnh báo kho, nhân viên và lối tắt chi tiết; responsive desktop/tablet. (REQ-DASH-REAL-04, REQ-DASH-REAL-05, REQ-DASH-REAL-06)

## Test và kiểm chứng
- [ ] T9 — Kiểm chứng có trọng tâm các phép tính P&L/GRN, phạm vi tenant/branch và trạng thái loading/empty/error; chạy build backend/frontend. (REQ-DASH-REAL-01..06)
