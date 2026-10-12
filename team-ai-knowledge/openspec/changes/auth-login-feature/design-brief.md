# Design Brief: Đăng Ký Mở Cửa Hàng (Phone-First & Compact Viewport)

## 1. Luồng Giao Diện (UI Flow)
- Người dùng vào `/auth/register`.
- Form hiển thị 4 khối trường chính:
  1. **Họ và tên đại diện** (Họ tên chủ cửa hàng / người quản lý)
  2. **Tên cửa hàng / Chuỗi siêu thị** (Sinh tên tenant & subdomain)
  3. **Số điện thoại** (Định danh duy nhất, phông số `JetBrains Mono` căn thẳng hàng)
  4. **Mật khẩu** & **Xác nhận mật khẩu** (kèm thang đo độ mạnh Weak/Medium/Strong và nút ẩn/hiện mắt)
- Checkbox đồng ý Điều khoản dịch vụ.
- Nút CTA Full Pill: `ĐĂNG KÝ MỞ CỬA HÀNG NGAY`.
- Chuyển hướng sang Đăng nhập: `Đã có tài khoản quản lý chuỗi? Đăng nhập tại đây`.

## 2. Quy Chuẩn Kích Thước & Tỷ Lệ (Zero-Scroll Standards)
- **Viewport Target**: Tối ưu hiển thị vừa vặn 100% trong khung nhìn chiều cao từ `720px - 945px` (chuẩn laptop 13-15.6 inch và màn hình desktop).
- **Layout Tokens**:
  - `Header Shell`: `height: 56px` (giảm từ 64px).
  - `Footer Shell`: `padding: 10px 20px`, font size `11px`.
  - `Auth Card`: `padding: 24px 28px`, `border-radius: 24px`, bóng đổ mềm mại.
  - `Fields Vertical Gap`: `11px - 12px` giữa các khối nhập liệu.
  - `Input Heights`: `42px`, padding `8px 14px`.
  - `Heading`: `font-size: 1.35rem`, margin đáy `4px`.
  - `Subheading`: `font-size: 12.5px`, margin đáy `14px`.

## 3. Quy Tắc Nghiệp Vụ & Dữ Liệu
- **Bỏ trường Email**:
  - `RegisterPayload`: `email` chuyển thành trường tuỳ chọn hoặc tự động sinh fallback `{phone}@mtgrms.vn`.
  - Backend/AuthService nhận `phone` làm Username chính, xác thực trùng lặp dựa trên số điện thoại.
