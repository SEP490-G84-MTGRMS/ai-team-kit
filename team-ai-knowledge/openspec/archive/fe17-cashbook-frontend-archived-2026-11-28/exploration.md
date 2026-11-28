# Khảo sát kỹ thuật: fe17-cashbook-frontend

## 1. Hiện trạng Code & Thành phần liên quan
- **Frontend Framework**: React 19 + TypeScript + Vite. Dự án **không dùng runtime Tailwind CSS** mà dùng 100% Vanilla CSS kết hợp biến `:root` trong `src/index.css`.
- **Design Tokens chung**: Brand Deep Teal (`--blue-primary: #0F766E`), Subtle Teal (`--blue-subtle: #CCFBF1`), Border (`--blue-border: #99F6E4`), Pills (`--radius-pill: 9999px`), Card (`--radius-card: 24px`), Font chữ `Be Vietnam Pro`.
- **Shared Components chuẩn dự án**:
  - `AdminToast` (`src/features/admin/components/common/AdminToast.tsx`): Thông báo trạng thái Success / Error / Info / Warning dạng pill nổi góc màn hình.
  - `TablePagination` (`src/components/common/TablePagination/TablePagination.tsx`): Bộ phân trang chuẩn KiotViet hỗ trợ chọn kích thước trang (10, 20, 50, 100) và điều hướng trang.
- **Các phân hệ liên kết**:
  - FE-07 (`service-expenses`): Khi thanh toán dịch vụ chi phí ngoài có liên kết Sổ quỹ.
  - FE-08 (`customer-crm`): Khi lập phiếu thu nợ khách hàng ghi nhận vào Sổ quỹ.
  - FE-10 (`reports-pnl`): Lấy số liệu dòng tiền và chi phí từ các chứng từ phát sinh.
- **Thực trạng phân hệ FE-17**: Chưa có thư mục `src/features/cashbook/`. Cần xây dựng mới hoàn toàn.

## 2. Assumptions (Giả định)
1. Cửa hàng vận hành theo mô hình đa chi nhánh và đa tài khoản quỹ: Mỗi chi nhánh có ít nhất 1 Két tiền mặt tại quầy (`CASH`) và các Tài khoản ngân hàng (`BANK`) phục vụ chuyển khoản/VietQR.
2. Bút toán giao dịch (`LedgerTransaction`) luôn thuộc về một tài khoản cụ thể (`AccountId`), có phân loại rõ ràng (`RECEIPT`, `PAYMENT`, `ADJUSTMENT`) và cập nhật số dư lũy kế tức thời (`BalanceAfter`).
3. Phân hệ Frontend kết nối thông qua Mock API Service Client (`cashbookService.ts`) với đầy đủ dữ liệu giả lập thực tế, sẵn sàng chuyển đổi sang REST API thật khi Backend hoàn thiện.

## 3. Non-Goals (Những gì không làm)
- Không can thiệp hoặc sửa đổi mã nguồn Backend C# trong change này.
- Không tích hợp trực tiếp Open Banking Webhook của ngân hàng thực tế (sử dụng đối soát nội bộ và mã VietQR chuẩn NAPAS).
- Không xây dựng hệ thống kế toán doanh nghiệp lớn nhiều tài khoản kế toán chữ T phức tạp; chỉ tập trung vào Sổ quỹ và Quản lý dòng tiền bán lẻ FMCG.

## 4. Đánh giá các Phương án Kỹ thuật

### Phương án A: Tự viết CSS và tạo các component độc lập riêng lẻ
- **Ưu điểm**: Triển khai nhanh theo ý thích cá nhân mà không cần tìm hiểu component cũ.
- **Nhược điểm**: Phá vỡ tính đồng nhất của hệ thống, giao diện lệch chuẩn KiotViet, thiếu tương thích với FE-07, FE-08, FE-10, vi phạm chỉ thị của người dùng.

### Phương án B (Được chọn): Tuân thủ 100% MT-GRMS Design System & Tái sử dụng Shared Components
- **Ưu điểm**:
  - Đồng bộ 100% với phong cách chung của dự án: Màu chủ đạo Deep Teal `#0F766E`, bo góc card `24px`, KiotViet pill `9999px`, font `Be Vietnam Pro`.
  - Sử dụng trực tiếp `AdminToast` cho mọi thông báo tương tác và `TablePagination` cho bảng Sổ quỹ.
  - Cấu trúc thư mục chuẩn mực theo kiến trúc Feature-based: `components/`, `pages/`, `services/`, `types/`, `__tests__/` và scoped CSS `cashbook.css`.
  - Dễ bảo trì, mở rộng và bàn giao cho team.
- **Nhược điểm**: Cần thiết kế giao diện CSS tỉ mỉ, không dùng utility class ad-hoc.

## 5. Rủi ro Kỹ thuật & Biện pháp Giảm thiểu
| Rủi ro | Mức độ | Biện pháp giảm thiểu |
|---|---|---|
| **Rút quá số dư tiền mặt két** (Vi phạm `GBR-CSH-03`) | Cao | Validate form lập phiếu chi ở cả Client và Service layer; chặn submit và cảnh báo toast đỏ nếu `Amount > current_balance` của tài khoản tiền mặt. |
| **Sửa/Xóa nhầm giao dịch tự động** (Vi phạm `GBR-CSH-01`) | Cao | Kiểm tra cờ `Is_Automated = 1`; ẩn hoặc vô hiệu hóa nút Hủy/Sửa đối với các bút toán sinh từ POS/Chi phí/Thu nợ. |
| **Lệch tiền kiểm kê không có lý do** (Vi phạm `GBR-CSH-04`) | Trung bình | Kiểm tra bắt buộc trường `Reason` khi `DifferenceAmount != 0`; không cho phép lưu biên bản nếu để trống lý do. |
