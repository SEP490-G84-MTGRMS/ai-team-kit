# Thiết Kế Chi Tiết (Design Brief): Giao Diện Chốt Ca/Mở Ca POS, Phân Quyền & Phê Duyệt Chi Phí

## 1. Luồng Người Dùng (User Flows)

### 1.1. Luồng Bán Hàng Của Chủ Cửa Hàng (`Store Owner`)
1. Chủ cửa hàng đăng nhập vào hệ thống và mở màn hình POS bán hàng (`/pos` hoặc `/employee/pos`).
2. Hệ thống kiểm tra `user.role === 'STORE_OWNER'` (hoặc `ADMIN`):
   - **Không hiển thị modal bắt buộc mở ca**.
   - Thanh Header POS ẩn hoàn toàn các nút: *Mở ca*, *Chốt ca*, *Thu chi két*.
   - Thanh Header POS hiển thị icon Chuông thông báo **"Duyệt Chi Két"** kèm Badge đỏ hiển thị số yêu cầu đang chờ duyệt (`pendingCount`).
3. Chủ bấm vào icon Chuông:
   - Mở Drawer `OwnerCashApprovalDrawer`.
   - Xem danh sách phiếu chi vượt hạn mức của nhân viên: Bấm **Duyệt** (`Recorded`) hoặc **Từ chối** (`Rejected` kèm lý do).
   - Xem danh sách phiếu rút két nộp chủ (`CashDrop`): Bấm **"Xác nhận đã nhận tiền"**.
   - Bấm nút bánh răng **"Cài đặt hạn mức"**: Đổi `CashOutApprovalThreshold` (mặc định 200.000đ) và `CashOutShiftTotalLimit`.
4. Chủ thực hiện bán hàng bình thường:
   - Nếu quầy đang có ca của nhân viên mở ➔ Đơn hàng được tự động gán `ShiftId` ca đó (kèm `CreatedBy = Owner`).
   - Nếu không có ca nào mở ➔ `ShiftId = null`.

### 1.2. Luồng Bán Hàng Của Nhân Viên Thu Ngân (`Cashier / Employee`)
1. Nhân viên đăng nhập vào màn hình POS:
   - Hệ thống tự động gọi API `GET /api/pos/shifts/current?branchId={branchId}`.
   - Nếu **chưa có ca mở** ➔ Khóa màn hình bán hàng và hiển thị modal `OpenShiftModal`.
     + Hiển thị số tiền bàn giao từ ca trước $A_{expected}$ (`OpeningFloatExpected`).
     + Nhân viên đếm tiền két thực tế và nhập $A$ (`OpeningFloat`). Hệ thống tự động tính chênh lệch đầu ca $A - A_{expected}$.
     + Bấm **"Bắt đầu ca bán hàng"** ➔ Gọi `POST /api/pos/shifts/open`.
2. Trong ca làm việc:
   - Thanh Header POS hiển thị Mã ca, Tên ca, giờ mở ca và nút **"Thu/Chi Két"**.
   - Bấm **"Thu/Chi Két"** ➔ Mở modal `CashMovementModal`:
     + **Phiếu Thu** (`CashIn`): Nhập số tiền, lý do ➔ Hiệu lực ngay, cộng vào tiền lý thuyết $G$.
     + **Phiếu Chi** (`CashOut`):
       - Nếu số tiền $\le 200.000$đ: Hiệu lực ngay, trừ vào tiền lý thuyết $G$.
       - Nếu số tiền $> 200.000$đ: Cảnh báo màu cam *"⚠️ Vượt hạn mức phê duyệt (200.000đ) - Cần Chủ cửa hàng duyệt trước khi lấy tiền"*, nút chuyển thành **"Gửi Yêu Cầu Phê Duyệt"** (`PendingApproval`), chưa trừ vào $G$.
     + **Rút két nộp chủ** (`CashDrop`): Rút tiền nộp cho chủ, chuyển vào danh sách chờ chủ xác nhận.
   - Nhân viên có thể xem lịch sử các phiếu trong ca và có nút **Hủy yêu cầu** đối với các phiếu đang chờ duyệt.
3. Cuối ca làm việc (Chốt ca):
   - Nhân viên chọn menu **"Sổ ca & Chốt ca quầy"** ➔ Mở modal `CloseShiftModal`:
     + Bảng kiểm đếm 9 mệnh giá tiền mặt (500k, 200k, 100k, 50k, 20k, 10k, 5k, 2k, 1k) tự động tính tổng tiền thực tế $H$ (`ActualCashCounted`).
     + Bảng đối chiếu tự động: $G = A + B + C - D - E$ và chênh lệch $\Delta = H - G$.
     + **Ràng buộc khóa chốt ca**:
       - Nếu còn phiếu chi `PendingApproval` ➔ Khóa nút Chốt ca, hiển thị cảnh báo đỏ và danh sách nút "Hủy yêu cầu".
       - Phân bổ tiền: Nhập `RetainedFloatAmount` (tiền để lại két) và `DroppedToSafeAmount` (tiền nộp két an toàn). Bắt buộc $Retained + Dropped = H$. Nếu không khớp, nút Chốt ca bị vô hiệu hóa.
     + Chọn nhân viên nhận ca sau ➔ Bấm **"Chốt Ca & Bàn Giao"** ➔ Gọi `POST /api/pos/shifts/{id}/close`.
     + Hiển thị modal `ZReportModal` in phiếu kết ca Z-Report.

---

## 2. Kiến Trúc Component Frontend

```text
src/features/pos/
├── api/
│   └── posShiftApi.ts                # API client kết nối Backend /api/pos/shifts & /api/pos/cash-movements
├── components/
│   ├── PosHeader.tsx                 # Header phân quyền Owner (chuông duyệt) vs Cashier (trạng thái ca + thu chi)
│   ├── modals/
│   │   ├── OpenShiftModal.tsx        # Modal mở ca kế thừa tiền ca trước
│   │   ├── CashMovementModal.tsx     # Modal lập phiếu Thu/Chi/Rút két có kiểm tra hạn mức
│   │   ├── CloseShiftModal.tsx       # Modal kiểm đếm 9 mệnh giá, đối soát G vs H, phân bổ Retained+Dropped=H
│   │   └── ZReportModal.tsx          # Modal xem và in báo cáo kết toán Z-Report
│   └── drawers/
│       └── OwnerCashApprovalDrawer.tsx # Drawer Chủ: Duyệt/Từ chối chi, Xác nhận CashDrop, Cài đặt hạn mức
├── pages/
│   ├── PosCheckoutPage.tsx           # Tích hợp kiểm tra ca theo vai trò khi tải trang
│   ├── PosShiftPage.tsx              # Trang quản lý chi tiết ca & lịch sử ca
│   └── StorePaymentConfigPage.tsx    # Bổ sung Card cấu hình CashOutApprovalThreshold
└── types/
    └── posShift.types.ts             # Type definitions chuẩn hóa cho ca & thu chi két
```

---

## 3. Thiết Kế Endpoints & Hợp Đồng Dữ Liệu (API Contracts)

### 3.1. Nhóm API Ca Làm Việc (POS Shifts)
- `POST /api/pos/shifts/open`: Mở ca làm việc mới (`OpenShiftRequest`).
- `GET /api/pos/shifts/current?branchId={id}&tillId={id}`: Lấy ca đang mở.
- `GET /api/pos/shifts/{id}`: Chi tiết ca và danh sách các phiếu thu chi.
- `POST /api/pos/shifts/{id}/close`: Chốt ca (`CloseShiftRequest` validate $Retained + Dropped = H$).
- `POST /api/pos/shifts/{id}/confirm-handover`: Xác nhận (`CONFIRMED`) hoặc khiếu nại (`DISPUTED`) bàn giao.
- `GET /api/pos/shifts/{id}/z-report`: Xuất báo cáo Z-Report.
- `GET /api/pos/shifts/history?branchId={id}`: Lịch sử ca làm việc.

### 3.2. Nhóm API Phê Duyệt Thu Chi (Cash Movements & Approvals)
- `POST /api/pos/shifts/{id}/cash-movements`: Tạo phiếu thu/chi (`CashMovementRequest`). Server tự quyết định `Status = Recorded` hoặc `PendingApproval`.
- `POST /api/pos/cash-movements/{id}/cancel`: Nhân viên hủy yêu cầu của mình khi còn `PendingApproval`.
- `GET /api/pos/cash-movements/pending?branchId={id}`: Chủ lấy danh sách phiếu chi chờ duyệt.
- `POST /api/pos/cash-movements/{id}/approve`: Chủ duyệt phiếu chi.
- `POST /api/pos/cash-movements/{id}/reject`: Chủ từ chối phiếu chi (body `{ note: string }` bắt buộc).
- `POST /api/pos/cash-movements/{id}/confirm-drop`: Chủ xác nhận đã nhận tiền mặt từ phiếu rút két `CashDrop`.
- `GET /api/pos/settings/cash-movement?branchId={id}`: Đọc cấu hình `CashOutApprovalThreshold`, `CashOutShiftTotalLimit`.
- `PUT /api/pos/settings/cash-movement?branchId={id}`: Chủ cập nhật hạn mức duyệt chi.
