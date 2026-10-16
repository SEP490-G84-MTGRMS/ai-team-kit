# Exploration: store-information-and-subscriptions

## 1. Hiện Trạng Code & Cơ Sở Dữ Liệu
- **Frontend Hiện Tại (`MT_GRMS_FRONTEND`)**:
  - `StoreOwnerLayout` và `StoreOwnerTopbar.tsx` đã có thanh điều hướng ngang và Profile Pill ("Minh Đức - Store Owner"), nhưng chưa có link điều hướng sang trang Cài đặt gian hàng / Gói dịch vụ / Ví tiền.
  - `router.tsx`: Chưa có route `/store-owner/settings` hoặc `/store-owner/store-info` hay `/store-owner/subscriptions`.
  - Chưa có component hiển thị bảng giá gói cước SaaS cho Store Owner và chưa có modal thanh toán mua gói / nạp ví.
- **Database Hiện Tại (`Database_Design_Data_Dictionary.md`)**:
  - Bảng `Tenants`: Đang được đề xuất mở rộng thêm các trường (`Subdomain`, `TaxCode`, `Hotline`, `Address`, `CurrentPlan`, `SubscriptionExpiresAt`, `GracePeriodExpiresAt`). Cần bổ sung thêm cột `WalletBalance (DECIMAL(18,2))` để lưu trữ số dư ví trả trước.
  - Cần thêm bảng `TenantWalletTransactions` để ghi nhận nhật ký nạp tiền ví và thanh toán mua gói.

## 2. Assumptions (Giả Định Cốt Lõi)
1. **Ví Tiền Gắn Với Tenant (Tenant-Scoped Wallet)**: Tiền nạp vào ví là tài sản trả trước của Gian hàng/Tenant, dùng để chi trả phí dịch vụ phần mềm (Gia hạn gói, Nâng cấp gói, Mua thêm chi nhánh/kho).
2. **Kỳ Hạn & Ưu Đãi Bán Hàng**: Các gói cước có giá niêm yết theo tháng (270k, 330k, 490k), nhưng thanh toán theo chu kỳ 1 năm (tặng 1 tháng) hoặc 2 năm (tặng 3 tháng) nhằm tối ưu chi phí cho người bán tạp hóa.
3. **Thanh Toán Không Tiền Mặt**: Tích hợp Napas VietQR Pro động cho cả luồng Nạp ví và Mua gói trực tiếp.

## 3. Non-Goals (Ngoài Phạm Vi)
- Không cung cấp tính năng rút tiền từ ví trả trước về tài khoản ngân hàng cá nhân.
- Không tích hợp thẻ quốc tế Visa/Master thật qua cổng trung gian thanh toán phức tạp (mô phỏng quét mã VietQR và xác nhận giao dịch tự động).

## 4. Các Phương Án Đánh Giá

### Phương án 1: Tạo các trang đơn lẻ phân tán
- **Mô tả**: Tách thành các route riêng lẻ: `/store-owner/store-info` (thông tin gian hàng), `/store-owner/plans` (bảng giá), `/store-owner/wallet` (ví tiền).
- **Ưu điểm**: File code nhỏ lẻ.
- **Nhược điểm**: Trải nghiệm người dùng rời rạc, không đúng với bố cục chuẩn của KiotViet (nơi tất cả các mục này được nhóm trong menu cài đặt gian hàng có sidebar bên trái).

### Phương án 2: Trung Tâm Quản Lý Gian Hàng & Gói Dịch Vụ Hub (KHUYÊN DÙNG)
- **Mô tả**: Xây dựng một trang Hub trung tâm `StoreSettingsHubPage.tsx` có Sidebar 3 nhóm (Gian hàng, Gói dịch vụ, Khác) theo chuẩn xác 100% giao diện KiotViet:
  - Sidebar bên trái điều hướng giữa các tab: *Thông tin gian hàng*, *Gói dịch vụ*, *Lịch sử mua hàng*, *Ví tiền & Thanh toán*.
  - Tab *Gói dịch vụ* là màn hình chính với Thanh KPI đếm ngược hạn dùng (còn 3 ngày) + Bảng so sánh 3 gói cước (270k, 330k, 490k).
  - Modal Đặt mua gói dịch vụ: Hỗ trợ chọn kỳ hạn, thêm chi nhánh/kho, chọn thanh toán bằng **Số dư ví** hoặc **VietQR Pro**.
  - Modal Nạp tiền vào ví: Chọn mệnh giá nhanh (500k, 1M, 2M, 5M) và quét mã VietQR.
  - Tab *Thông tin gian hàng*: Xem và cập nhật Tên, Subdomain, MST, Hotline, Địa chỉ.
- **Ưu điểm**: Khớp 100% với ảnh chụp thực tế từ KiotViet của người dùng; trải nghiệm liền mạch, chuyên nghiệp; bóc tách component sạch sẽ theo `RULE_UI_DESIGN_SYSTEM.md`.
- **Nhược điểm**: Cần thiết kế nhiều component con có tính tương tác cao.

## 5. Phương Án Lựa Chọn & Lý Do
- **Lựa chọn**: **Phương án 2**.
- **Lý do**: Tái hiện chính xác trải nghiệm thực tế của phần mềm KiotViet mà chủ cửa hàng tạp hóa đang quen thuộc, đồng thời đáp ứng trọn vẹn yêu cầu nghiệp vụ về gian hàng, mua gói và ví tiền.

## 6. Rủi Ro & Cách Giảm Thiểu
- **Rủi ro**: Số dư ví bị trừ sai lệch hoặc trừ trùng lặp khi mua gói.
- **Cách giảm thiểu**: Áp dụng Transaction trong CSDL (Database Transaction) khi thanh toán bằng ví: Trừ `WalletBalance`, ghi bản ghi `TenantWalletTransactions`, và gia hạn `SubscriptionExpiresAt` trong cùng một giao dịch nguyên tử.
