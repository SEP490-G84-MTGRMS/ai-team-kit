# Proposal: Phân hệ Frontend Kê khai & Chốt số liệu thuế Hộ kinh doanh (FE-19 Tax Snapshot)

## 1. Bối cảnh & Vấn đề (Problem Statement)
- Dự án **MT-GRMS** phục vụ các chuỗi cửa hàng tạp hóa, bán lẻ hàng tiêu dùng hoạt động dưới mô hình **Hộ kinh doanh cá thể (HKD)** theo quy định pháp luật Việt Nam (Thông tư 40/2021/TT-BTC).
- Các chủ cửa hàng bán lẻ hiện nay gặp rất nhiều trở ngại trong việc:
  - Khó khăn khi tổng hợp số liệu doanh thu bán lẻ từ quầy POS để nộp thuế định kỳ theo Quý hoặc Năm.
  - Thiết kế ban đầu dự kiến tích hợp Hóa đơn điện tử (E-Invoice) phức tạp, phụ thuộc nhà cung cấp giải pháp (VNPT, Viettel, MISA meInvoice) và phát sinh chi phí per-invoice không phù hợp với cửa hàng tạp hóa nhỏ lẻ.
  - Nguy cơ kê khai sai lệch hoặc trễ hạn nộp thuế do không có hệ thống cảnh báo doanh thu và snapshot lưu vết số liệu kỳ kế toán.

## 2. Mục tiêu (Objectives)
- Xây dựng phân hệ Frontend **FE-19 Tax Snapshot** cho Chủ cửa hàng (`StoreOwner`) và Kế toán (`Accountant`) giúp:
  1. Tự động hóa việc tổng hợp doanh thu chịu thuế (`TaxableRevenue`) từ toàn bộ các hóa đơn POS đã hoàn tất thanh toán (`PaymentStatus = 'Paid'`) trong kỳ.
  2. Áp dụng biểu thuế khoán/kê khai ngành bán buôn, bán lẻ hàng hóa chuẩn quy định: Thuế GTGT (`VAT_rate` = 1.0%), Thuế TNCN (`PIT_Rate` = 0.5%).
  3. Quản lý trạng thái và lưu vết bất biến lịch sử các kỳ kê khai thuế (`TaxSnapshot`) theo Quý/Năm (trạng thái: `Draft` -> `Finalized` -> `Submitted` -> `Paid`).
  4. Cung cấp báo cáo bảng kê chi tiết và chức năng xuất biểu mẫu Tờ khai thuế (Form 01/CNKD) phục vụ nộp báo cáo thuế.

## 3. Phạm vi (Scope)

### Trong phạm vi (In-Scope)
- **Quản lý danh sách kỳ tính thuế (`TaxSnapshot`):**
  - Bảng danh sách các kỳ tính thuế theo Năm và Quý (Q1, Q2, Q3, Q4).
  - Thẻ tóm tắt KPIs: Doanh thu chịu thuế lũy kế năm, Tổng thuế GTGT, Tổng thuế TNCN, Tổng số thuế đã nộp / còn phải nộp.
  - Lọc theo Năm, Quý, Trạng thái (`Draft`, `Finalized`, `Submitted`, `Paid`).
- **Tạo & Tính toán kỳ thuế mới (Create Snapshot):**
  - Modal/Trình tạo kỳ thuế: Chọn Năm tài chính, Quý kê khai.
  - Tự động quét và tính toán: `TaxableRevenue`, `VAT_amount` (= 1%), `PIT_amount` (= 0.5%), `TotalTaxAmount` (= 1.5%).
  - Bảng kê danh sách các đơn hàng (`Orders`) phát sinh trong kỳ tương ứng để đối soát minh bạch.
- **Chi tiết & Vòng đời tờ khai (Tax Snapshot Detail & Lifecycle):**
  - Xem chi tiết tờ khai, chuyển trạng thái từ `Draft` (Nháp) sang `Finalized` (Đã chốt) và `Submitted` (Đã nộp cơ quan thuế).
  - Ghi chú (`Note`), thời điểm chốt (`GeneratedAt`), người thực hiện.
- **Xuất báo cáo & Biểu mẫu (Export & Reporting):**
  - Hỗ trợ xuất dữ liệu bảng kê doanh thu và mẫu tờ khai Form 01/CNKD (Excel / định dạng chuẩn phục vụ in ấn hoặc tải lên trang Thuế điện tử).
- **Cấu hình thuế suất cửa hàng (Store Tax Profile):**
  - Hiển thị mức thuế suất mặc định (1% VAT, 0.5% TNCN) và thông tin mã số thuế, cơ quan thuế quản lý của Tenant.

### Ngoài phạm vi (Out-of-Scope)
- Không kết nối API truyền nhận trực tiếp với hệ thống Hóa đơn điện tử (E-Invoice) hoặc hệ thống TCT qua cổng dịch vụ bên thứ 3.
- Không tính thuế Thu nhập doanh nghiệp (TNDN) do hệ thống phục vụ mô hình Hộ kinh doanh.

## 4. Người dùng & Phân quyền (Actors & Permissions)
- **Chủ cửa hàng (`StoreOwner`):** Toàn quyền xem, khởi tạo kỳ thuế, chốt số liệu (`Finalized`), xác nhận đã nộp (`Submitted`), xuất tờ khai.
- **Kế toán (`Accountant`):** Xem báo cáo, tạo dự thảo kỳ thuế (`Draft`), kiểm tra bảng kê hóa đơn.
- **Nhân viên thu ngân (`Cashier`):** Không có quyền truy cập phân hệ thuế.

## 5. Tiêu chí thành công (Success Criteria)
1. **Trải nghiệm người dùng:** Chủ cửa hàng có thể tạo và chốt số liệu thuế của một quý trong thời gian dưới 1 phút.
2. **Độ chính xác số liệu:** Số liệu `TaxableRevenue` khớp 100% với tổng doanh thu thực thu của các đơn hàng `Orders` hợp lệ trong Quý.
3. **Tuân thủ thiết kế CSDL:** Khớp 100% với thực thể `TaxSnapshot` trong ERD (ID, TenantID, Year, Quarter, TaxableRevenue, VAT_rate, VAT_amount, PIT_Rate, PIT_amount, Status).
4. **Chất lượng mã nguồn:** TypeScript nghiêm ngặt, 0 lỗi lint, 0 lỗi build (`npm run build` thành công), tuân thủ Design System chung của dự án MT-GRMS.
