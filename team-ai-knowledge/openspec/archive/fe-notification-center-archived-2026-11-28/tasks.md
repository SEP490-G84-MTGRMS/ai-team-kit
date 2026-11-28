# Tasks: fe-notification-center

## Nhóm 1: Dữ Liệu & State Management
- [x] T1 — Tạo types và interfaces thông báo tại `src/features/notifications/types/notification.ts` (REQ-NOTIF-01, REQ-NOTIF-03)
- [x] T2 — Tạo mock data ban đầu với 5 phân hệ cốt lõi MT-GRMS tại `src/features/notifications/data/mockNotifications.ts` (REQ-NOTIF-03)
- [x] T3 — Xây dựng Zustand store `useNotificationStore` quản lý unread count, 2 tab, local persistence và mutation tại `src/features/notifications/stores/useNotificationStore.ts` (REQ-NOTIF-02, REQ-NOTIF-05)

## Nhóm 2: UI Components & Styles
- [x] T4 — Xây dựng component `NotificationBadge` hiển thị chuông và badge đếm số lượng chưa đọc tại `src/features/notifications/components/NotificationBadge.tsx` (REQ-NOTIF-01)
- [x] T5 — Xây dựng component `NotificationCard` hiển thị chi tiết thông báo với Icon phân loại, nút Quick Action và Deep Link tại `src/features/notifications/components/NotificationCard.tsx` (REQ-NOTIF-03)
- [x] T6 — Xây dựng component `NotificationPopover` dropdown nổi với 2 tab "Chưa đọc" / "Tất cả", nút "Đánh dấu tất cả" và click-outside listener tại `src/features/notifications/components/NotificationPopover.tsx` (REQ-NOTIF-02)
- [x] T7 — Xây dựng component `NotificationDrawer` trượt từ cạnh phải với bộ lọc trạng thái, tìm kiếm và nút xóa tại `src/features/notifications/components/NotificationDrawer.tsx` (REQ-NOTIF-04)
- [x] T8 — Viết stylesheet `notifications.css` hoàn thiện hiệu ứng animation, badge pulse, scrollbar và responsive tại `src/features/notifications/notifications.css` (REQ-NOTIF-01, REQ-NOTIF-02, REQ-NOTIF-04)

## Nhóm 3: Tích Hợp TopNav & Điều Hướng
- [x] T9 — Tích hợp `NotificationBadge`, `NotificationPopover` và `NotificationDrawer` vào thanh điều hướng `src/layouts/StoreOwnerLayout/AppTopNav.tsx` (REQ-NOTIF-01, REQ-NOTIF-02)

## Nhóm 4: Kiểm Thử & Xác Minh
- [x] T10 — Viết unit tests kiểm thử logic của `useNotificationStore` tại `src/features/notifications/__tests__/notificationStore.test.ts` (REQ-NOTIF-05)
- [x] T11 — Chạy build và test kiểm tra tính toàn vẹn của ứng dụng (REQ-NOTIF-01 đến REQ-NOTIF-05)
