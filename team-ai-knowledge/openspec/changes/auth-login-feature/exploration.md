# Exploration: Loại bỏ Email & Tối ưu tỷ lệ hiển thị Form Đăng ký (Zero-scroll)

## 1. Hiện trạng & Vấn đề
- **Vấn đề 1 (Trường Email)**: Form đăng ký mở cửa hàng hiện tại đang bắt buộc người dùng nhập "Email đăng ký". Tuy nhiên, nhóm đối tượng khách hàng mục tiêu của MT-GRMS là các chủ tiệm tạp hóa, siêu thị mini gia đình tại Việt Nam (thường là tiểu thương truyền thống, lớn tuổi), nhiều người không quen dùng hoặc không có tài khoản email. Điều này tạo ra rào cản tâm lý và khiến tỷ lệ hoàn tất đăng ký sụt giảm.
- **Vấn đề 2 (Tràn màn hình - Scroll Overflow)**: Chiều cao trang đăng ký hiện tại là ~969px trong khi khung nhìn viewport thông dụng là 945px (laptop 1080p trừ thanh công cụ). Người dùng phải cuộn chuột xuống mới thấy được toàn bộ nút đăng ký và thông tin bản quyền/bảo mật phía dưới.

## 2. Giả định (Assumptions) & Phạm vi (Non-Goals)
- **Assumptions**: Số điện thoại là kênh liên lạc chính và định danh duy nhất (Unique Identity) của chủ cửa hàng. Mọi thông báo tài khoản và mã OTP sẽ chuyển qua SMS / Zalo / SĐT.
- **Non-Goals**: Không bỏ trường email ở các phân hệ SaaS Master Admin hay xuất hóa đơn điện tử của doanh nghiệp lớn (ở đó email vẫn là kênh nhận hóa đơn chuẩn).

## 3. Đánh giá các phương án giải quyết

### Vấn đề 1: Xử lý trường Email
- **Phương án A: Bỏ hoàn toàn trường Email khi đăng ký (Khuyên dùng ✅)**
  - *Ưu điểm*: Tối giản biểu mẫu, thao tác trong 30 giây, thân thiện tuyệt đối với tiểu thương Việt Nam. Hệ thống tự gán fallback `email = ""` hoặc `{phone}@mtgrms.vn` dưới backend/service.
  - *Nhược điểm*: Khi cần gửi tài liệu dài qua email sẽ cần người dùng bổ sung sau trong mục Cài đặt thông tin cửa hàng.
- **Phương án B: Giữ Email nhưng chuyển thành Không bắt buộc (Optional)**
  - *Ưu điểm*: Người có email vẫn điền được.
  - *Nhược điểm*: Vẫn chiếm diện tích thị giác trên màn hình, form vẫn dài và gây phân vân cho người già.
- **=> Quyết định chọn**: Phương án A.

### Vấn đề 2: Tối ưu tỷ lệ (Fit viewport - Không cuộn)
- **Phương án A: Thêm overflow-hidden gượng ép**
  - *Nhược điểm*: Cắt cụt nội dung trên màn hình nhỏ.
- **Phương án B: Tái cấu trúc tỷ lệ Spacing, Padding và Typography (Khuyên dùng ✅)**
  - Giảm padding `.auth-main-area` từ `32px 48px` xuống `16px 20px`.
  - Giảm padding thẻ `.auth-card` từ `36px` xuống `24px 28px`.
  - Giảm padding và height của Top Header (56px) và Footer (46px).
  - Tối ưu gap giữa các field từ `16px` xuống `11px - 12px`, chiều cao input từ 46px xuống 42px.
  - Tổng chiều cao form giảm từ 970px xuống ~680px - 710px, hiển thị trọn vẹn 100% không cuộn trên mọi màn hình $\ge 768px$.
- **=> Quyết định chọn**: Phương án B.
