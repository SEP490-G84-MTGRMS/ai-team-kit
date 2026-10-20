# Design Brief: fe-notification-center

## 1. Luồng Người Dùng (User Flows)

```
[ Người dùng nhìn thấy TopNav ]
               │
               ▼
   Có thông báo mới?
   ├── Có ──> Badge hiển thị số lượng đỏ (VD: '3') + Hiệu ứng Pulse nhẹ
   └── Không ──> BellIcon hiển thị bình thường, không có badge
               │
               ▼
 [ Click vào BellIcon trên AppTopNav ]
               │
               ▼
[ Mở NotificationPopover Dropdown (ngay dưới BellIcon) ]
  ├── Xem danh sách thông báo theo Tab:
  │     ├── Tab 'Chưa đọc' (chỉ hiện tin có isRead = false)
  │     └── Tab 'Tất cả' (hiển thị toàn bộ theo thứ tự mới nhất)
  ├── Nhấp [✓ Đánh dấu tất cả đã đọc] ──> Cập nhật toàn bộ isRead = true, Badge biến mất
  ├── Nhấp vào [Nút Action nhanh trên Card] ──> Thực thi hành động cụ thể, tự đánh dấu đã đọc
  ├── Nhấp vào [Thân Card thông báo] ──> Điều hướng Deep Link đến trang phân hệ, tự đánh dấu đã đọc
  └── Nhấp [📋 Xem tất cả thông báo ➔]
               │
               ▼
[ Mở NotificationDrawer (Trượt từ cạnh phải màn hình) ]
  ├── Tìm kiếm thông báo theo từ khóa
  ├── Bộ lọc theo mức độ cảnh báo: Tất cả / Cảnh báo / Nhắc nhở / Giao dịch
  ├── Xóa từng thông báo hoặc xóa toàn bộ thông báo đã đọc
  └── Đóng Drawer bằng nút [✕] hoặc click Backdrop
```

## 2. Cấu Trúc Component & Các Trạng Thái (Component Hierarchy & States)

### 2.1. Cấu trúc Component
- `src/features/notifications/`
  - `types/notification.ts`: Types, Enums & Interfaces.
  - `stores/useNotificationStore.ts`: Quản lý danh sách, filter, unread count, đồng bộ localStorage.
  - `components/NotificationBadge.tsx`: Nút chuông và badge đếm số lượng chưa đọc.
  - `components/NotificationCard.tsx`: Card hiển thị từng thông báo (Icon, Title, Message, Relative Time, Quick Action, Unread Indicator).
  - `components/NotificationPopover.tsx`: Khung popover nổi với Header, Tabs, List, Footer.
  - `components/NotificationDrawer.tsx`: Slide drawer trượt từ cạnh phải, quản lý toàn bộ lịch sử.
  - `notifications.css`: Stylesheet đồng bộ theo design system MT-GRMS.

### 2.2. Các trạng thái giao diện (UI States)
- **Normal / Has Unread:** Badge màu đỏ `#EF4444`, bo tròn viên thuốc, số màu trắng đậm, hiệu ứng scale khi nhảy số.
- **Card Unread:** Nền có tint xanh nhạt (`bg-blue-50/50` hoặc viền sáng), có chấm tròn xanh unread dot.
- **Card Read:** Nền trong suốt hoặc xám mờ nhẹ, tiêu đề màu dịu hơn.
- **Empty State:**
  - Tab "Chưa đọc" rỗng: Hiển thị icon chuông ngủ `BellOff` + text *"Bạn đã đọc hết mọi thông báo!"*.
  - Tab "Tất cả" rỗng: Hiển thị icon hộp thư rỗng + text *"Chưa có thông báo nào"*.
- **Drawer Filter Empty State:** Hiển thị *"Không tìm thấy thông báo phù hợp với bộ lọc"*.

## 3. Mô Hình Dữ Liệu & TypeScript Types

```typescript
export type NotificationSeverity = 'critical' | 'warning' | 'info' | 'success';

export type NotificationCategory = 
  | 'inventory_fefo'
  | 'cashbook_shift'
  | 'customer_credit'
  | 'service_expense'
  | 'tax_compliance'
  | 'hr_attendance';

export interface NotificationAction {
  label: string;
  url: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  category: NotificationCategory;
  isRead: boolean;
  createdAt: string; // ISO 8601
  action?: NotificationAction;
  metadata?: Record<string, unknown>;
}
```

## 4. Bảng Quy Chuẩn Màu Sắc & Icon Cảnh Báo

| Mức độ | Màu chủ đạo | Background Tint | Icon đề xuất |
|---|---|---|---|
| `critical` | `#DC2626` (Red-600) | `#FEF2F2` (Red-50) | `AlertTriangleIcon` |
| `warning` | `#D97706` (Amber-600) | `#FFFBEB` (Amber-50) | `ClockIcon` / `AlertCircleIcon` |
| `info` | `#2563EB` (Blue-600) | `#EFF6FF` (Blue-50) | `InfoIcon` |
| `success` | `#059669` (Emerald-600) | `#ECFDF5` (Emerald-50) | `CheckCircle2Icon` |

## 5. Quy Tắc Nghiệp Vụ & Phân Quyền (Business Rules & RBAC)
- **Store Owner (Chủ tiệm):** Có quyền xem 100% tất cả loại thông báo (Kho, Két tiền, Nợ, Chi phí, Thuế, Nhân sự).
- **Store Manager (Quản lý cửa hàng):** Xem thông báo Kho, Hàng cận date, Chi phí, Ca làm việc; không hiển thị thông báo Kê khai thuế cá nhân chủ tiệm.
- **Tự động chuyển trạng thái:**
  - Nhấp vào card hoặc nút Action ➔ Ngay lập tức đổi `isRead = true`.
  - Nút "Đánh dấu tất cả đã đọc" ➔ Đổi toàn bộ danh sách `isRead = true`.
