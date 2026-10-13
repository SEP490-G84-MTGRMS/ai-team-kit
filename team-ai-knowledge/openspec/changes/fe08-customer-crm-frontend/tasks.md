# Tasks: fe08-customer-crm-frontend

## 1. Data & State Management
- [x] T1 — Khởi tạo TypeScript Type Definitions & Mock Data `customers.json` hoàn chỉnh cho khách hàng, hạn mức nợ và lịch sử giao dịch (REQ-08.1, REQ-08.3)
- [x] T2 — Xây dựng Customer API Service & Hooks/State Store để quản lý CRUD, tìm kiếm debounce, bộ lọc và tính toán KPI (REQ-08.1)

## 2. Frontend UI Components
- [x] T3 — Xây dựng `CustomerKpiGrid` hiển thị 4 chỉ số KPI: Tổng số khách, Tổng nợ AR, Khách vượt trần nợ, Điểm thưởng (REQ-08.1)
- [x] T4 — Xây dựng `CustomerTable` với phân trang, sorting, search debounce theo SĐT/Tên và lọc theo Tier / Trạng thái nợ (REQ-08.1)
- [x] T5 — Xây dựng `CustomerFormModal` để thêm mới và cập nhật khách hàng kèm validation SĐT, hạn mức nợ (REQ-08.2, REQ-08.5)
- [x] T6 — Xây dựng `CustomerDrawerDetail` hiển thị toàn diện Profile, widget % nợ đã dùng, tab lịch sử đơn hàng và lịch sử trả nợ (REQ-08.3)
- [x] T7 — Xây dựng `DebtCollectionModal` và `VietQrDisplayCard` hỗ trợ thu nợ tiền mặt & sinh mã VietQR động theo chuẩn Napas 247 (REQ-08.4)

## 3. Integration & Testing
- [x] T8 — Tích hợp toàn diện các components vào `CustomerManagementPage` và liên kết navigation menu `Đối tác -> Khách hàng` (REQ-08.1)
- [x] T9 — Kiểm thử giao diện (UI & Validation Test): kiểm tra các kịch bản tìm kiếm, vượt hạn mức nợ, thanh toán VietQR và responsive trên Desktop/Tablet (REQ-08.1 đến REQ-08.5)
