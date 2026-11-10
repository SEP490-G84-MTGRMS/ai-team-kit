# Thiết Kế Chi Tiết (Design Brief): pos-owner-shift-mode-prompt-and-cashier-history

## 1. Luồng Người Dùng (User Flow)

### 1.1. Luồng Chủ Cửa Hàng Vào POS Khi Có Ca Nhân Viên Hoạt Động
```mermaid
flowchart TD
    A[Chủ cửa hàng / Admin vào POS] --> B[Gọi posShiftApi.getCurrentShift(branchId)]
    B --> C{Chi nhánh có ca đang mở?}
    C -- Không có ca --> D[Chế độ mặc định: Shiftless Két sắt<br/>Badge: Bán riêng - Chưa có ca mở]
    C -- Có ca Open --> E{Đã chọn chế độ trong session chưa?}
    E -- Đã chọn --> F[Áp dụng chế độ đã chọn<br/>Hiển thị Badge trên POS Header]
    E -- Chưa chọn --> G[Mở Modal OwnerShiftModeModal]
    G --> H[Người dùng chọn Chế độ 1: Bỏ chung ngăn kéo quầy]
    G --> I[Người dùng chọn Chế độ 2: Tự giữ / Cất két sắt]
    H --> J[Lưu mode = 'attach'<br/>Đơn hàng gửi shiftId = currentShift.id<br/>Tiền mặt cộng vào Till quầy]
    I --> K[Lưu mode = 'shiftless'<br/>Đơn hàng gửi shiftId = null<br/>Tiền mặt ghi nhận vào Safe két sắt]
    F --> L[Bấm nút Đổi trên Badge POS Header] --> G
```

### 1.2. Luồng Hiển Thị Nhân Viên Trong Ca (Lịch Sử Ca & Bàn Giao)
- Khi mở ca (`OpenShiftAsync`), backend tự động truy vấn các nhân viên được xếp ca tại chi nhánh (`GetBranchCashierSchedulesAsync`) và nạp vào bảng `ShiftParticipants`.
- Khi bất kỳ nhân viên nào tạo đơn hàng trong ca, backend kiểm tra và bổ sung vào `ShiftParticipants` nếu chưa có.
- Màn hình Lịch sử ca (`/pos/shift`, `/store-owner/shifts`) và modal Bàn giao quầy đọc danh sách `participants` từ API và hiển thị toàn bộ dạng badges kèm role.

---

## 2. Thiết Kế Giao Diện & Component Frontend

### 2.1. `OwnerShiftModeModal.tsx`
- **Mô tả**: Hộp thoại popup kiểu Ant Design Modal / Custom modal bo tròn KiotViet theme:
  - Header: Icon cửa hàng + Tiêu đề: *"Chi nhánh đang có ca bán hàng hoạt động"*
  - Body: Giới thiệu thông tin ca đang mở (Mã ca, Giờ mở, Danh sách nhân viên trực).
  - 2 Thẻ bấm lựa chọn (Option Cards):
    - **Card 1: 🛒 Bỏ chung ngăn kéo quầy (Bán vào ca)**
      - Giải thích: Tiền mặt thu từ khách được bỏ trực tiếp vào ngăn kéo quầy thu ngân. Hệ thống tự động cộng doanh thu tiền mặt vào số tiền dự kiến kiểm đếm (`ExpectedCash`) của ca này và ghi nhận bạn cùng trực ca.
      - Nút: *"Bán chung vào quầy"*
    - **Card 2: 🔒 Tự giữ / Cất két sắt (Bán riêng)**
      - Giải thích: Tiền mặt thu được bạn tự giữ hoặc cất riêng vào két sắt chi nhánh. Ngăn kéo quầy của nhân viên giữ nguyên độc lập, nhân viên không kiểm đếm số tiền này khi chốt ca.
      - Nút: *"Bán riêng két sắt"*
  - Footer: Nút *"Ghi nhớ lựa chọn cho phiên này"* (Checkbox mặc định checked).

### 2.2. POS Header Mode Badge (`PosHeader.tsx`)
- Khi `isStoreOwner = true`:
  - Nếu `ownerShiftMode === 'attach'`:
    - Badge màu Teal nhạt: `🛒 Bán vào ca #{shiftCode} (Ngăn kéo quầy)` kèm icon bút chì / nút `[Đổi chế độ]`.
  - Nếu `ownerShiftMode === 'shiftless'`:
    - Badge màu Slate xám: `🔒 Bán riêng (Két sắt)` kèm icon bút chì / nút `[Đổi chế độ]`.
  - Click vào nút `[Đổi chế độ]` sẽ mở lại `OwnerShiftModeModal` để chuyển đổi tức thì.

### 2.3. Lịch Sử Chốt Ca & Bàn Giao Quầy (`PosShiftPage.tsx`)
- Cột **Nhân viên thu ngân / Trực ca**:
  - Render thẻ bọc `display: flex, flexWrap: wrap, gap: 4px`.
  - Mỗi nhân viên hiển thị 1 badge bo tròn: `<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">{name} ({role})</span>`.
  - Không cắt cụt chuỗi bằng `maxWidth: 160`.
- Modal Bàn Giao Quầy:
  - Trường "Nhân viên ca bàn giao": hiển thị danh sách tên tất cả nhân viên tham gia ca.

### 2.4. Chuẩn Hóa Font Số
- `src/index.css`:
  - `--font-mono: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;`
  - `.font-mono`: Áp dụng font sans chuẩn kèm `font-variant-numeric: tabular-nums`.
- `pos.css`:
  - `.pos-product-price`: Sử dụng `var(--font-sans)` + `tabular-nums` (loại bỏ `JetBrains Mono`).
  - `.pos-modal-dialog input.font-mono`: Sử dụng `var(--font-sans)` + `tabular-nums`.

---

## 3. Thiết Kế API & DTO Backend

### 3.1. Endpoint Tạo Đơn Hàng `POST /api/orders`
- **Request DTO (`CreateOrderRequest`)**:
  - `shiftId`: `Guid?`
    - Nếu `isOwnerOrAdmin` và chọn "Bỏ chung ngăn kéo quầy": Frontend truyền `shiftId = activeShift.id`.
    - Nếu `isOwnerOrAdmin` và chọn "Bán riêng": Frontend truyền `shiftId = null`.
    - Nếu `isStaff`: Frontend bắt buộc truyền hoặc backend tự gán `activeShift.id`.
- **Xử lý tại `OrderService.CreateOrderAsync`**:
  - Khi thanh toán `CASH`:
    - Nếu `shiftId.HasValue` (kể cả do chủ cửa hàng gửi lên):
      - Tiền nhận vào tài khoản `Till` (Két quầy).
      - `activeShift.ExpectedCash += finalAmount`.
      - Ghi nhận `ShiftParticipant` (UserId, UserName, Role = "STORE_OWNER" / "ADMIN").
    - Nếu `!shiftId.HasValue` và là `isOwnerOrAdmin`:
      - Tiền nhận vào tài khoản `Safe` (Két sắt chi nhánh).
      - Không cộng `ExpectedCash` của ca, không ghi nhận participant.

### 3.2. Endpoint Quản Lý Ca `ShiftService`
- `OpenShiftAsync`:
  - Lấy danh sách nhân viên có lịch làm việc trong ngày tại chi nhánh (`GetBranchCashierSchedulesAsync`).
  - Nạp toàn bộ nhân viên này vào `ShiftParticipants` của ca mới mở.
- `GetShiftHistoryAsync`:
  - Đảm bảo danh sách `Participants` được nạp đầy đủ (kể cả các ca cũ trước đó nếu có nhân viên trực ca).

---

## 4. Thay Đổi Cơ Sở Dữ Liệu
- **Không thay đổi Schema DB**:
  - Bảng `SalesOrders` đã có sẵn cột `ShiftId (Guid, Nullable)`.
  - Bảng `ShiftParticipants` đã có sẵn quan hệ `ShiftId`, `UserId`, `UserName`, `Role`, `JoinedAt`.
  - Bảng `FinanceAccounts` đã có phân loại `Till` (két quầy) và `Safe` (két sắt).

---

## 5. Quy Tắc Nghiệp Vụ & Phân Quyền (Permissions)
| Vai trò | Hành vi khi có ca mở | Hành vi khi không có ca mở |
|---|---|---|
| `STORE_OWNER` / `ADMIN` | Được chọn "Bán vào ca" hoặc "Bán riêng két sắt". Đổi chế độ bất kỳ lúc nào. | Bán shiftless vào Két sắt, không cần mở ca. |
| `STAFF` | Bắt buộc bán vào ca mở. Tiền mặt bắt buộc vào `Till`. | Bị chặn bán hàng, bắt buộc mở ca và kiểm đếm tiền đầu ca. |
