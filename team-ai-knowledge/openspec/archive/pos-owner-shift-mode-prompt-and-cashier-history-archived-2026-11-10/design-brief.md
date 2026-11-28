# Thiết Kế Chi Tiết (Design Brief): pos-owner-shift-mode-prompt-and-cashier-history

## 1. Luồng Người Dùng (User Flow)

### 1.1. Luồng Chủ Cửa Hàng Vào POS Khi Có Ca Nhân Viên Hoạt Động
```mermaid
flowchart TD
    A[Chủ cửa hàng / Admin vào POS] --> B[Gọi posShiftApi.getCurrentShift(branchId)]
    B --> C{Chi nhánh có ca đang mở?}
    C -- Không có ca --> D[Chế độ mặc định: Shiftless Két sắt<br/>Badge: 🔒 Bán riêng - Chưa có ca mở]
    C -- Có ca Open --> E{Đã có session mtgrms_owner_shift_mode_{branchId}?}
    E -- Đã có mode hợp lệ --> F[Áp dụng mode đã chọn<br/>Hiển thị Badge trên POS Header]
    E -- Chưa chọn --> G[Mở Modal OwnerShiftModeModal (maskClosable=false)]
    G --> H[Người dùng chọn: Bỏ chung ngăn kéo quầy]
    G --> I[Người dùng chọn: Tự giữ / Cất két sắt]
    H --> J[Lưu sessionStorage mode = 'attach'<br/>Đơn hàng gửi shiftId = activeShift.id<br/>Tiền mặt ghi nhận vào Till quầy]
    I --> K[Lưu sessionStorage mode = 'shiftless'<br/>Đơn hàng gửi shiftId = null<br/>Tiền mặt ghi nhận vào Safe két sắt]
    F --> L[Bấm nút Đổi trên Badge POS Header] --> G
    F --> M{Ca đóng giữa chừng?}
    M -- Có --> N[POS tự động chuyển mode = 'shiftless'<br/>Toast thông báo cho chủ cửa hàng]
```

---

## 2. Thiết Kế Giao Diện & Component Frontend

### 2.1. `OwnerShiftModeModal.tsx`
- **Mô tả**: Hộp thoại popup kiểu Ant Design Modal / Custom modal bo tròn KiotViet theme:
  - Cấu hình: `maskClosable={false}`, `closable={false}`, chặn đóng tự do để buộc chủ cửa hàng đưa ra lựa chọn rõ ràng.
  - Header: Icon cửa hàng + Tiêu đề: *"Chi nhánh đang có ca bán hàng hoạt động"*
  - Body: Giới thiệu thông tin ca đang mở (Mã ca, Giờ mở, Danh sách nhân viên trực).
  - 2 Thẻ bấm lựa chọn (Option Cards):
    - **Card 1: 🛒 Bỏ chung ngăn kéo quầy (Bán vào ca)**
      - Giải thích: Tiền mặt thu từ khách được bỏ trực tiếp vào ngăn kéo quầy thu ngân. Hệ thống tự động tính doanh thu đơn hàng vào doanh số ca (cập nhật số tiền dự kiến kiểm đếm `ExpectedCash` khi đóng ca) và ghi nhận bạn cùng trực ca.
      - Nút: *"Bán chung vào quầy"*
    - **Card 2: 🔒 Tự giữ / Cất két sắt (Bán riêng)**
      - Giải thích: Tiền mặt thu được bạn tự giữ hoặc cất riêng vào két sắt chi nhánh. Ngăn kéo quầy của nhân viên giữ nguyên độc lập, nhân viên không kiểm đếm số tiền này khi chốt ca.
      - Nút: *"Bán riêng két sắt"*

### 2.2. POS Header Mode Badge (`PosHeader.tsx`)
- Khi `isStoreOwner = true`:
  - Nếu `ownerShiftMode === 'attach'`:
    - Badge màu Teal nhạt: `🛒 Bán vào ca #{shiftCode} (Ngăn kéo quầy)` kèm nút `[Đổi chế độ]`.
  - Nếu `ownerShiftMode === 'shiftless'`:
    - Badge màu Slate xám: `🔒 Bán riêng (Két sắt)` kèm nút `[Đổi chế độ]`.
  - Click vào nút `[Đổi chế độ]` sẽ mở lại `OwnerShiftModeModal` để chuyển đổi tức thì.
  - Tự động fallback: Nếu phát hiện ca chuyển sang `Closing` hoặc `Closed`, tự động đổi về badge Bán riêng và hiển thị toast.

### 2.3. Lịch Sử Chốt Ca & Bàn Giao Quầy (`PosShiftPage.tsx`)
- Cột **Nhân viên thu ngân / Trực ca**:
  - Render thẻ bọc `display: flex, flexWrap: wrap, gap: 4px`.
  - Mỗi nhân viên hiển thị 1 badge bo tròn: `<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">{p.fullName || p.userName}</span>`.
  - Không cắt cụt chuỗi bằng `maxWidth: 160`.
- Modal Bàn Giao Quầy:
  - Trường "Nhân viên ca bàn giao": hiển thị danh sách tên tất cả nhân viên tham gia ca.

### 2.4. Chuẩn Hóa Font Số & Bảo Toàn Template In Nhiệt
- **Phần tử màn hình POS & Quản lý**:
  - `pos.css`: `.pos-product-price`, `.pos-catalog-modal-dialog .pos-product-price`, `.pos-modal-dialog input.font-mono`, `.pos-shift-page-root input.font-mono` áp dụng `var(--font-sans)` + `tabular-nums` (loại bỏ `JetBrains Mono` để số 0 hiển thị tròn bình thường không chấm giữa).
- **Phần tử in nhiệt (`.pos-receipt-paper`, `.pos-receipt-preview`)**:
  - **GIỮ NGUYÊN font monospace** (`JetBrains Mono`, `Consolas`, `monospace`) để đảm bảo các cột in bill 58mm/80mm thẳng hàng tuyệt đối.

---

## 3. Thiết Kế API & DTO Backend

### 3.1. Endpoint Tạo Đơn Hàng `POST /api/orders`
- **Request DTO (`CreateOrderRequest`)**:
  - `shiftId`: `Guid?`
- **Xử lý tại `OrderService.CreateOrderAsync`**:
  - **Validation**:
    - Nếu `request.ShiftId.HasValue`: Bắt buộc kiểm tra `activeShift != null`, `activeShift.Status == ShiftState.Open`, và `request.ShiftId.Value == activeShift.Id`. Nếu không khớp, throw `BusinessException("SHIFT_CLOSED_OR_INVALID", "Ca làm việc đã kết thúc hoặc không hợp lệ. Vui lòng kiểm tra lại.")`.
  - Khi thanh toán `CASH`:
    - Nếu `shiftId.HasValue`:
      - Tiền nhận vào tài khoản `Till` (Két quầy).
      - Doanh thu đơn hàng tự động tính vào doanh số tiền mặt của ca (phục vụ tính toán `ExpectedCash` động của ca).
      - Ghi nhận `ShiftParticipant` với `UserId`, `FullName`, `UserName`.
    - Nếu `!shiftId.HasValue` và là `isOwnerOrAdmin`:
      - Tiền nhận vào tài khoản `Safe` (Két sắt chi nhánh).
      - Không cộng doanh thu ca, không ghi nhận participant.

### 3.2. Endpoint Quản Lý Ca `ShiftService`
- `OpenShiftAsync`:
  - Lấy danh sách nhân viên có lịch làm việc trong ngày tại chi nhánh (`GetBranchCashierSchedulesAsync`).
  - Nạp toàn bộ nhân viên này vào `ShiftParticipants` của ca mới mở.
- `GetShiftHistoryAsync`:
  - Đảm bảo danh sách `Participants` được nạp đầy đủ cho toàn bộ ca.

---

## 4. Thay Đổi Cơ Sở Dữ Liệu
- **Không thay đổi Schema DB (Zero Migration)**:
  - Bảng `ShiftParticipants` tận dụng các cột sẵn có: `ShiftId`, `UserId`, `UserName`, `FullName`, `JoinedAtUtc`, `LastActiveAtUtc`. Không thêm cột mới.
  - Bảng `SalesOrders` đã có sẵn cột `ShiftId (Guid, Nullable)`.
  - Bảng `FinanceAccounts` đã có phân loại `Till` (két quầy) và `Safe` (két sắt).
