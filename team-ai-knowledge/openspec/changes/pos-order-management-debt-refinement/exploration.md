# Khám Phá & Đánh Giá Kỹ Thuật (Exploration)

## 1. Hiện Trạng Code
- **Frontend POS:**
  - `PosHeader.tsx`: Trước đây tồn tại nút "Về Dashboard" to ở góc trái cạnh logo tiệm và icon vương miện 👑.
  - `LoginPage.tsx`: Tồn tại khối "Chọn nhanh tài khoản kiểm thử" cố định.
  - `AddCustomerModal.tsx`: Tồn tại trường `Mã KH:` và `Nhóm:` gây thừa thao tác cho thu ngân.
  - `PosPaymentPanel.tsx` & `PosCheckoutPage.tsx`: Có logic kiểm tra và chặn vượt hạn mức nợ (Debt Limit).
  - `InvoiceManagementPage.tsx`: Giao diện quản lý hóa đơn còn ghi "Không có công nợ lẻ" và chưa kết nối backend cho tab Đơn đặt trước.
- **Backend .NET 8:**
  - `OrderService.cs`: Chặn đơn ghi nợ nếu vượt `customer.DebtLimit`.
  - `OrderDtos.cs`: `OrderResponse` thiếu `CustomerPhone`, `DepositAmount`, `Note`.
  - `DbInitializer.cs`: Chưa có dữ liệu seed mẫu cho bảng `Orders` của tài khoản chủ tiệm `0901234567`.

## 2. Giả Định (Assumptions)
- Khách mua nợ là khách quen định danh trong hệ thống (có tên và số điện thoại).
- Tài khoản chủ tiệm `Tran Van Chu` có số điện thoại `0901234567`, thuộc tenant `tenant_mt_mart_01`.
- Nghiệp vụ tạp hóa gia đình quyết định cho nợ dựa vào sự tin tưởng và theo dõi lịch sử số lần nợ/tổng nợ, không dùng hạn mức tín dụng.

## 3. Những Gì Không Làm (Non-Goals)
- Không chấm điểm tín dụng tài chính phức tạp.
- Không tích hợp SMS Brandname gửi tin nhắn đòi nợ tự động.
- Không thay đổi kiến trúc multi-tenant phân lập CSDL.

## 4. Các Phương Án Kỹ Thuật (Options Comparison)

### Phương Án 1: Nâng Hạn Mức Nợ Lên Giá Trị Rất Lớn (100 Triệu)
- **Ưu điểm:** Giữ nguyên code backend hiện có, không cần đổi cấu trúc if-else kiểm tra hạn mức.
- **Nhược điểm:** Vẫn còn khái niệm "Hạn mức nợ" trên giao diện gây khó hiểu cho thu ngân/chủ tiệm; không đúng bản chất yêu cầu loại bỏ hạn mức nợ.

### Phương Án 2 (Được chọn): Bỏ Hạn Mức Nợ Cứng + Tinh Gọn UI + Kết Nối Backend CSDL Thật
- **Ưu điểm:**
  - Sát 100% với thực tế kinh doanh tiệm tạp hóa bán lẻ.
  - Hiển thị trực quan: Số lần nợ, Tổng tiền từng nợ, Số tiền đang nợ và Dự kiến sau đơn.
  - Form thêm khách hàng tối giản, tự sinh mã ngầm.
  - Seed dữ liệu CSDL phong phú và kết nối đồng bộ Frontend cho cả hóa đơn bán lẻ và đơn đặt trước giữ kho.
- **Nhược điểm:** Cần cập nhật cả C# Entity/Service và React Component.

## 5. Rủi Ro & Biện Pháp Giảm Thiểu (Risks & Mitigations)
- **Rủi ro:** Khi bỏ hạn mức, nhân viên thu ngân có thể lạm dụng cho khách nợ tùy tiện.
- **Biện pháp giảm thiểu:** Phân quyền chặt chẽ — nút Ghi Nợ chỉ hiển thị duy nhất khi người đăng nhập là **Chủ Cửa Hàng** (`role: STORE_OWNER`). Nhân viên thu ngân (`role: CASHIER`) bị ẩn hoàn toàn nút này.
