# EXP-2026-10-14-FE19: Khảo sát Giải pháp Frontend Kê khai & Chốt số liệu thuế Hộ kinh doanh (FE-19 Tax Snapshot)

## 1. Problem Statement (Vấn đề)
Chủ cửa hàng tạp hóa (Hộ kinh doanh cá thể) trong hệ thống MT-GRMS cần một giải pháp trực quan, đơn giản và chính xác để:
- Chốt số liệu doanh thu thực tế phát sinh theo Quý/Năm nhằm thực hiện nghĩa vụ thuế theo Thông tư 40/2021/TT-BTC.
- Loại bỏ sự phức tạp và chi phí không cần thiết của Hóa đơn điện tử (E-Invoice).
- Cần biết trước ước tính số thuế GTGT (1%) và thuế TNCN (0.5%) phải nộp, theo dõi trạng thái tờ khai và lịch sử nộp thuế qua các quý.

## 2. Context & Background (Bối cảnh & Hiện trạng)
- **Kiến trúc hiện tại:**
  - Frontend: React 19 + TypeScript + Vite, Ant Design + TailwindCSS v4, TanStack Query, Zustand.
  - Đã có các phân hệ hoàn thiện: `FE-07` (Chi phí dịch vụ `service-expenses`), `FE-08` (Khách hàng & Công nợ `customer-crm`), `FE-10` (Dashboard P&L `dashboard-pnl`), `FE-17` (Sổ quỹ tiền mặt `cashbook`).
  - Dữ liệu hóa đơn bán lẻ POS nằm ở bảng `Orders` (`TotalAmount`, `DiscountAmount`, `FinalAmount`, `PaymentStatus`).
  - Đề xuất cập nhật CSDL của Nguyễn Trường An đã chốt thực thể `TaxSnapshot`: `ID`, `TenantID`, `Year`, `Quarter`, `TaxableRevenue`, `VAT_rate` (1%), `VAT_amount`, `PIT_Rate` (0.5%), `PIT_amount`, `Status`.
- **Mock data:** Đã có `taxes.json` trong `Design_UI/app/api/taxes.json` định hình cấu trúc dữ liệu thuế và mẫu giao diện `tax_management_v2_mockup.html`.

## 3. Constraints (Ràng buộc kỹ thuật & Nghiệp vụ)
- **Quy định pháp luật (Thông tư 40/2021/TT-BTC):**
  - Tỷ lệ thuế trên doanh thu áp dụng cho ngành Phân phối, cung cấp hàng hóa (bán lẻ tạp hóa): Thuế GTGT = 1%, Thuế TNCN = 0.5%.
  - Kỳ kê khai: Theo Quý (Q1: T1-T3, Q2: T4-T6, Q3: T7-T9, Q4: T10-T12) hoặc theo Năm tài chính.
- **Tính toàn vẹn dữ liệu (Data Integrity):**
  - Khi kỳ tính thuế chuyển sang `Finalized` hoặc `Submitted`, số liệu `TaxableRevenue` và tiền thuế phải được cố định (Freeze/Immutable), không bị thay đổi ngay cả khi có đơn hàng mới phát sinh sau này.
- **Phân vùng Multi-Tenant:** Mọi truy vấn và snapshot thuế bắt buộc lọc theo `TenantId` của cửa hàng đang đăng nhập.

## 4. Assumptions (Giả định)
- **[ASSUMPTION-01]**: Doanh thu tính thuế là tổng số tiền thực thu (`Orders.FinalAmount`) từ tất cả các đơn hàng có `PaymentStatus = 'Paid'` và không bị xóa (`IsDeleted = false`) trong kỳ.
- **[ASSUMPTION-02]**: Hộ kinh doanh bán hàng giá đã bao gồm thuế (Gross Price), thu ngân quầy POS không cần nhập thêm thuế suất lẻ từng mặt hàng khi thanh toán.
- **[ASSUMPTION-03]**: Một Tenant trong cùng một Năm và cùng một Quý chỉ có tối đa 1 bản ghi `TaxSnapshot` hiệu lực (Unique constraint: `TenantId + Year + Quarter`).

## 5. Scope & Non-Goals
### In Scope
- Giao diện quản lý danh sách kỳ tính thuế `TaxSnapshot` (Filter theo Năm, Quý, Trạng thái).
- Thống kê KPI tổng quan: Doanh thu chịu thuế lũy kế, Thuế GTGT tạm tính, Thuế TNCN tạm tính, Thuế đã nộp.
- Modal/Wizard tạo kỳ tính thuế mới: Chọn Năm, Quý -> Tự động tính toán số liệu và hiển thị bảng kê hóa đơn đi kèm.
- Modal xem chi tiết tờ khai thuế: Bảng phân rã số liệu, danh sách hóa đơn cấu thành, lịch sử thay đổi trạng thái (`Draft` -> `Finalized` -> `Submitted`).
- Chức năng xuất dữ liệu báo cáo (Export Excel / XML Tờ khai Form 01/CNKD).

### Out of Scope (Non-Goals)
- Tích hợp cổng phát hành Hóa đơn điện tử bên thứ 3 (VNPT/Viettel/MISA).
- Tích hợp cổng thanh toán trực tiếp nộp thuế vào kho bạc nhà nước (Store Owner nộp qua App Etax Mobile hoặc ngân hàng sau khi có tờ khai).

## 6. So sánh các Phương án Kỹ thuật (Technical Options)

### Phương án A: Client-side Aggregation (Tính toán tổng hợp tại Frontend từ danh sách Orders)
- **Cách làm:** Frontend gọi API lấy toàn bộ danh sách `Orders` trong quý, tự tính tổng `FinalAmount` rồi tính VAT và PIT trên client.
- **Ưu điểm:** Nhanh, không cần backend endpoint tính toán phức tạp.
- **Nhược điểm:** Khi số lượng đơn hàng lớn (hàng chục nghìn đơn/quý), tải lượng dữ liệu qua mạng rất lớn; dễ lệch số liệu nếu client tính sai.

### Phương án B: Server-side Snapshot Engine với API Preview & Finalize (KHUYẾN NGHỊ)
- **Cách làm:**
  - Backend cung cấp endpoint `POST /api/v1/tax-snapshots/preview` (nhận `year`, `quarter`) -> Backend tự chạy SQL query tổng hợp và trả về DTO xem trước.
  - Endpoint `POST /api/v1/tax-snapshots` -> Lưu snapshot vào CSDL với trạng thái `Draft`.
  - Endpoint `PUT /api/v1/tax-snapshots/{id}/finalize` -> Chốt số liệu, không cho sửa.
- **Ưu điểm:** Hiệu năng cực cao (< 100ms), bảo mật, dữ liệu nhất quán 100%, tuân thủ nguyên tắc kế toán bất biến.
- **Lựa chọn:** Chọn **Phương án B**.

## 7. Success Criteria (Tiêu chí thành công)
- Giao diện trực quan, dễ hiểu cho chủ cửa hàng tạp hóa (không đòi hỏi kiến thức kế toán chuyên sâu).
- Tạo kỳ tính thuế và kiểm tra bảng kê trong < 3 bước.
- Độ chính xác số liệu đạt 100% đối chiếu với bảng `Orders`.
