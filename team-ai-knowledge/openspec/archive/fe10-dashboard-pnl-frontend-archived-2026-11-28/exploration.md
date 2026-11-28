# EXP-2026-10-13-FE10: Khám Phá & Lựa Chọn Kiến Trúc UI Cho Phân Hệ FE-10 Dashboard KPIs & Báo Cáo P&L

## 1. Problem Statement
Chủ chuỗi cửa hàng (`StoreOwner`) và Quản lý chi nhánh (`StoreManager`) cần một công cụ tập trung để theo dõi sức khỏe tài chính và hiệu quả kinh doanh. Hiện tại dữ liệu đang nằm rời rạc ở nhiều nơi (Đơn hàng POS, Lô hàng tồn kho, Chi phí dịch vụ ngoài FE-07, Hao hụt kho FE-06), chưa có một màn hình tổng hợp để vừa nắm bắt nhanh các chỉ số cốt lõi (KPIs), vừa đối soát chi tiết dòng tiền lãi/lỗ (P&L Statement).

## 2. Context & Background
- Hệ thống đã chuẩn hóa công thức tài chính và các bảng dữ liệu bổ trợ trong tài liệu [database-schema.md](file:///d:/Sourse_code_Do_An/ai-team-kit/team-ai-knowledge/projects/MT-GRMS/design/database-schema.md).
- Frontend đang chạy Vite + React 19 + TypeScript, đã có sẵn các thư viện mạnh mẽ: `chart.js`, `react-chartjs-2`, `lucide-react`, `dayjs`, `@tanstack/react-query`.
- **Ràng buộc đặc biệt**: Tạm thời chưa sửa Backend C#, Frontend cần xây dựng Service Layer chuẩn mực kết hợp Mock Data chân thực để hoàn thiện giao diện độc lập và sẵn sàng cắm API Backend bất cứ lúc nào.

## 3. Constraints
1. **Tuân thủ chỉ thị người dùng**: Không can thiệp mã nguồn Backend C# trong giai đoạn này.
2. **Công nghệ sẵn có**: Tận dụng tối đa `chart.js` và `react-chartjs-2` đã có trong `package.json`, không cài đặt thêm package nặng.
3. **Phong cách thiết kế**: Bám sát Design System hiện tại của MT-GRMS (Màu Teal/Emerald làm điểm nhấn, typography rõ ràng, thẻ card bo góc nhẹ, viền xám sáng, hỗ trợ trạng thái rỗng/đang tải).
4. **Bố cục màn hình**: Theo lựa chọn của User, tích hợp tất cả vào **1 màn hình thống nhất All-in-one**: Phần trên là Executive KPI Cards & Interactive Charts, phần dưới là Báo cáo P&L Statement chi tiết.

## 4. Assumptions
- **Đơn vị tiền tệ**: Luôn hiển thị theo Đồng Việt Nam (VNĐ), làm tròn số nguyên hoặc 1 chữ số thập phân khi hiển thị phần trăm.
- **Múi giờ**: Dữ liệu ngày tháng lọc theo múi giờ địa phương Việt Nam (UTC+7, Asia/Ho_Chi_Minh).
- **Phân quyền Role**:
  + `StoreOwner`: Được xem toàn bộ chi nhánh hoặc chọn lọc từng chi nhánh, thấy đầy đủ Lợi nhuận gộp và Lợi nhuận ròng.
  + `StoreManager`: Cố định chi nhánh được gán, chỉ xem dữ liệu trong phạm vi chi nhánh phụ trách.

## 5. Scope & Non-Goals
### In Scope
- Xây dựng module mới `src/features/reports-pnl/` bao gồm:
  + `components/PnlKpiCard.tsx`: Thẻ hiển thị chỉ số tài chính (Doanh thu thuần, Lợi nhuận gộp, Lợi nhuận ròng, Chi phí vận hành, AOV, Đơn hàng) kèm % biến động so với kỳ trước.
  + `components/PnlTrendChart.tsx`: Biểu đồ đường & cột kết hợp (Doanh thu vs Chi phí vs Lợi nhuận) theo thời gian.
  + `components/PnlExpenseDonutChart.tsx`: Biểu đồ tròn thể hiện tỷ trọng các nhóm chi phí (Điện, Nước, Nhân công, Mặt bằng, Tiếp thị, Hao hụt kho).
  + `components/PnlStatementTable.tsx`: Bảng biểu báo cáo P&L theo cấu trúc cây (phân cấp cha-con có thể thu gọn/mở rộng) gồm Doanh thu -> Giá vốn -> Lãi gộp -> Chi phí -> Lãi ròng.
  + `components/PnlFilterToolbar.tsx`: Bộ lọc mốc thời gian nhanh (Hôm nay, 7 ngày, Tháng này, Tháng trước, Quý này) + DateRangePicker + Dropdown chọn Chi nhánh.
  + `components/PnlExportModal.tsx`: Hộp thoại xem trước và xuất bản báo cáo (Xuất Excel, In ấn / Xuất PDF khổ A4 kèm tiêu đề tiệm và ngày xuất).
  + `services/reportsPnlService.ts`: Data access layer chuẩn mực, cung cấp mock data thực tế và method gọi API sẵn sàng tích hợp Backend.
- Định tuyến và kết nối menu trong `AppTopNav.tsx` và `router.tsx`.

### Out of Scope (Non-Goals)
- Không chỉnh sửa C# Backend trong phân hệ này.
- Không tích hợp tính thuế TNDN tạm tính hay các bút toán khấu hao máy móc nhiều năm.

## 6. Lựa Chọn Phương Án (Options Analysis)
- **Phương án 1 (Tách 2 trang)**: Tạo riêng `/store-owner/dashboard` và `/store-owner/reports/pnl`.
  - *Nhược điểm*: Khiến chủ tiệm phải nhảy qua lại giữa 2 trang; bộ lọc thời gian và chi nhánh không được lưu giữ đồng bộ.
- **Phương án 2 (All-in-one Page - ĐƯỢC CHỌN)**: Gom toàn bộ vào 1 trang duy nhất `/store-owner/reports/pnl` (hoặc `/admin/dashboard` liên kết mượt mà):
  - *Ưu điểm*: Góc nhìn tổng thể 360 độ từ trực quan biểu đồ đến bảng số liệu chi tiết đối soát; 1 bộ lọc dùng chung cho toàn bộ màn hình; hỗ trợ nút cuộn nhanh hoặc tab toggle linh hoạt.
  - *Lý do chọn*: Đáp ứng trực tiếp yêu cầu và mong muốn thực tế của User.

## 7. Rủi Ro & Giải Pháp Giảm Thiểu
- **Rủi ro biểu đồ lag khi đổi ngày**: Sử dụng `useMemo` để cache cấu hình biểu đồ và datasets.
- **Rủi ro số liệu tràn chữ trên màn hình nhỏ**: Format số bằng `Intl.NumberFormat('vi-VN')`, responsive flex-wrap / grid tự co dãn trên tablet và desktop.
