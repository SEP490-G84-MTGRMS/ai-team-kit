# Proposal: Nâng cấp Icon Cài Đặt trên TopBar thành Dropdown Menu Điều Hướng (Cấu hình VietQR & Gói dịch vụ)

## 1. Vấn đề (Problem)
- Hiện tại, icon bánh răng Cài đặt (`Settings`) trên thanh điều hướng TopBar (`AppTopNav.tsx`) là một thẻ `<Link>` trỏ cứng vào `/store-owner/subscriptions` (trang quản lý gói dịch vụ của thành viên khác).
- Chủ cửa hàng không có lối truy cập trực quan từ thanh TopBar chung để mở trang **Cấu hình tài khoản ngân hàng & VietQR (SePay)** (`/store-owner/payment-config`), mà phải truy cập thông qua màn hình bán lẻ POS (`/pos`).
- Nếu nhúng cấu hình tài khoản vào thẳng trang `StoreSettingsHubPage` thì sẽ gây xung đột và ảnh hưởng đến code của thành viên phụ trách phần Subscription.

## 2. Mục tiêu (Objective)
- Nâng cấp icon Bánh Răng trên thanh TopBar (`AppTopNav.tsx`) thành một **Dropdown Menu tương tác thông minh (Hover & Click)** giống như các menu "Hàng hóa", "Cửa hàng" hay menu Tài khoản.
- Cung cấp 2 nhánh điều hướng phân lập rõ ràng:
  1. **Thiết lập thanh toán & VietQR (SePay)**: Chuyển hướng tới trang cấu hình độc lập `/store-owner/payment-config`.
  2. **Gói dịch vụ MT-GRMS (Gia hạn gói)**: Chuyển hướng tới `/store-owner/subscriptions?tab=subscriptions`, `/store-owner/subscriptions?tab=order-history`, giữ nguyên 100% nghiệp vụ và code của thành viên khác.

## 3. Phạm vi (Scope)
- **In-Scope**:
  - Cập nhật icon `Settings` trong `src/layouts/StoreOwnerLayout/AppTopNav.tsx` có state mở/đóng dropdown menu (hỗ trợ hover enter, hover leave với timer dọn sạch, click toggle, và click outside/Escape để đóng).
  - Thiết kế giao diện dropdown popup đẹp mắt, sang trọng theo phong cách thiết kế hiện tại của hệ thống.
  - Hỗ trợ đầy đủ các đường dẫn: `/store-owner/payment-config`, `/store-owner/subscriptions?tab=subscriptions`, `/store-owner/subscriptions?tab=order-history`.
- **Out-of-Scope**:
  - Không sửa đổi bất kỳ dòng code nào trong `StoreSettingsHubPage.tsx` và `StoreSidebarNav.tsx`.

## 4. Người dùng & Phân quyền (Actors & Permissions)
- **STORE_OWNER** (Chủ cửa hàng): Được quyền xem và thao tác đầy đủ cả 2 mục Cấu hình thanh toán và Quản lý gói dịch vụ.

## 5. Tiêu chí thành công (Success Criteria)
- Rê chuột (hover) hoặc bấm vào icon Bánh Răng sẽ mở ra Dropdown Menu Cài Đặt rõ ràng.
- Bấm vào "Cấu hình VietQR & SePay" điều hướng chuẩn xác sang `/store-owner/payment-config`.
- Bấm vào "Gói dịch vụ & Gia hạn" điều hướng chuẩn xác sang `/store-owner/subscriptions`.
- Không gây ảnh hưởng hay phá vỡ layout của thanh TopBar.
- TypeScript kiểm tra không lỗi (`tsc -b`), ứng dụng build thành công 100%.
