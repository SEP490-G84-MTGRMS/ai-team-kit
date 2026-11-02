# Design Brief: Thiết Kế Dropdown Menu Cài Đặt Trên TopBar Của Chủ Cửa Hàng

## 1. Luồng Người Dùng (User Flow)
1. **Mở menu**:
   - Khi Chủ cửa hàng rê chuột (hover) hoặc click vào icon Bánh Răng (`Settings`) trên thanh TopBar:
   - State `settingsMenuOpen` kích hoạt, icon bánh răng sáng nhẹ, menu dropdown xổ xuống ngay bên dưới với animation êm ái.
2. **Khám phá lựa chọn**:
   - Menu rộng 320px, bo góc 14px, đổ bóng elevation chuẩn design system.
   - Gồm Header và 3 phân nhóm rõ ràng:
     - **Nhóm 1: Thanh toán & Thu ngân**:
       - `Cấu hình VietQR & SePay`: Dẫn sang `/store-owner/payment-config` (Màu xanh ngọc chủ đạo, có badge "Mới").
     - **Nhóm 2: Gói dịch vụ MT-GRMS (Gia hạn gói)**:
       - `Gói dịch vụ & Gia hạn nâng cấp`: Dẫn sang `/store-owner/subscriptions?tab=subscriptions`.
       - `Lịch sử mua hàng`: Dẫn sang `/store-owner/subscriptions?tab=order-history`.
       - `Bản xác nhận dịch vụ`: Dẫn sang `/store-owner/subscriptions?tab=service-confirm`.
     - **Nhóm 3: Gian hàng**:
       - `Thông tin gian hàng & Chi nhánh`: Dẫn sang `/store-owner/subscriptions?tab=store-info`.
3. **Đóng menu**:
   - Rê chuột ra khỏi dropdown: Tự động đóng sau 220ms (debounce timer để tránh vô tình đóng khi di chuyển chuột).
   - Click bên ngoài hoặc bấm phím `Escape`: Đóng ngay lập tức.
   - Click vào bất kỳ item nào: Đóng menu và chuyển trang thông qua React Router `Link`.

## 2. Thiết Kế Giao Diện Component (UI Design Spec)
- **Vị trí**: Nằm trong component `MT_GRMS_FRONTEND/src/layouts/StoreOwnerLayout/AppTopNav.tsx`.
- **Anchor Wrapper**: Bọc nút bánh răng trong một container `relative`, ref `settingsMenuRef`.
- **Dropdown Container**:
  - `position: absolute`, `top: 100%`, `right: 0`, `paddingTop: 8px`, `zIndex: 1000`.
  - Box bên trong: `width: 320px`, `borderRadius: 14px`, `boxShadow: 0 12px 32px rgba(0,0,0,0.16)`, `border: 1px solid #E2E8F0`.
- **Item Styling**:
  - Mỗi item có Icon đại diện bo tròn trong khung 36x36px với màu nền nhẹ.
  - Tên chức năng in đậm (13.5px, #0f172a), phụ đề mô tả bên dưới (11.5px, #64748b).
  - Hover state: Đổi nền sang `#f8fafc` mượt mà.

## 3. Thay Đổi Database & API
- **Database**: Không có thay đổi DB.
- **Backend API**: Không cần endpoint mới (tái sử dụng toàn bộ hệ thống API sẵn có).
- **Phân quyền**: Chỉ hiển thị và thao tác bởi tài khoản vai trò `STORE_OWNER`.
