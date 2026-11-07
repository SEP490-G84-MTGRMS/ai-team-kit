# Design Brief: Ca Dùng Chung Theo Chi Nhánh (Nhiều Quầy, Một Két), Khóa Bán Khi Chốt Ca & Concurrency Tồn Kho

## 1. Kiến Trúc & Luồng Nghiệp Vụ

```
[Máy POS 1 (Thu ngân A)] ──┐
                          ├──► [Ca Bán Hàng Chi Nhánh (ShiftZReport - Duy nhất 1 ca Open/Closing)]
[Máy POS 2 (Thu ngân B)] ──┘         │
                                     ├──► [1 Két tiền mặt duy nhất]
                                     ├──► [Khóa bán toàn chi nhánh khi ca = Closing]
                                     └──► [Z-Report: Thống kê doanh thu theo từng Thu ngân]
```

### Luồng nghiệp vụ chuẩn:
1. **Mở ca đầu tiên**:
   - Nhân viên A mở ca đầu tiên trong ngày tại Chi nhánh → Nhập tiền đầu ca (`OpeningFloat`) → Ca chuyển trạng thái `Open`.
2. **Nhân viên khác đăng nhập bán hàng**:
   - Nhân viên B đăng nhập máy POS 2: Hệ thống phát hiện Chi nhánh đã có ca `Open` → Tự động tham gia ca đang chạy, **không hiện popup mở ca**.
   - Khi B tạo đơn hoặc ghi nhận giao dịch: Hệ thống tự động ghi nhận B vào bảng `ShiftParticipants` (`JoinedAtUtc`, `LastActiveAtUtc`).
3. **Nhân viên về sớm**:
   - Nhân viên A về sớm (ví dụ 12h): Ca **vẫn tiếp tục chạy bình thường**. Nhân viên B tiếp tục bán mà không cần chốt két giữa trưa.
4. **Quy trình chốt ca an toàn (`Closing` Lockdown)**:
   - Một nhân viên bấm **"Bắt đầu chốt ca"** (`start-closing`):
     - Server chuyển trạng thái ca sang `Closing`.
     - **Mọi máy POS trong chi nhánh bị khóa bán hàng**: API `POST /api/pos/orders` và `POST /api/pos/shifts/{id}/cash-movements` sẽ từ chối với lỗi `409 Conflict`.
     - Giao diện POS hiển thị thông báo: *"Ca đang được kiểm đếm chốt ca. Tạm thời khóa bán hàng."*
   - Nhân viên đếm tiền két và nhập tổng số đếm $H$.
   - Các nhân viên khác xem số đếm và bấm **"Xác nhận chốt ca"** (`confirm-close`).
   - Có nút **"Hủy chốt ca"** (`cancel-closing`) để chuyển ca trở lại `Open` nếu cần tiếp tục bán hàng.
5. **Chủ cửa hàng bán hàng & Đóng ca thay**:
   - Khi Chủ cửa hàng tạo đơn hàng tại chi nhánh có ca `Open`: Đơn hàng tự động gắn `ShiftId` vào ca đó, và ghi rõ `CreatedBy` là Chủ cửa hàng.
   - Nếu hết giờ làm việc mà nhân viên về hết quên chốt ca: Chủ cửa hàng có thể gọi `POST /api/pos/shifts/{id}/force-close` từ xa kèm lý do và số đếm tiền.

---

## 2. Mô Hình Dữ Liệu (Database Changes)

### 2.1 Cập nhật Entity `ShiftZReport` (`MT_GRMS.Domain/Entities/Finance/ShiftZReport.cs`)
- `ShiftState Status`: Thêm giá trị `Closing = 2` (enum: `Open = 1`, `Closing = 2`, `Closed = 3`).
- `Guid? ClosingStartedByUserId`: Người bấm bắt đầu chốt ca.
- `DateTime? ClosingStartedAtUtc`: Thời điểm bắt đầu chốt ca.
- `Guid? ClosedByUserId`: Người hoàn tất đóng ca (hoặc chủ đóng thay).
- `string? ForceCloseReason`: Lý do đóng cưỡng bức nếu đóng bởi Owner.
- `ICollection<ShiftParticipant> Participants`: Danh sách nhân viên tham gia ca.
- `ICollection<ShiftCloseConfirmation> CloseConfirmations`: Danh sách xác nhận chốt ca.

### 2.2 Bảng mới: `ShiftParticipants` (`MT_GRMS.Domain/Entities/Finance/ShiftParticipant.cs`)
```csharp
public class ShiftParticipant : BaseTenantEntity
{
    public Guid ShiftId { get; set; }
    public Guid UserId { get; set; }
    public string? UserName { get; set; }
    public DateTime JoinedAtUtc { get; set; }
    public DateTime LastActiveAtUtc { get; set; }
}
```

### 2.3 Bảng mới: `ShiftCloseConfirmations` (`MT_GRMS.Domain/Entities/Finance/ShiftCloseConfirmation.cs`)
```csharp
public class ShiftCloseConfirmation : BaseTenantEntity
{
    public Guid ShiftId { get; set; }
    public Guid UserId { get; set; }
    public string? UserName { get; set; }
    public decimal ConfirmedCountedCash { get; set; }
    public DateTime ConfirmedAtUtc { get; set; }
}
```

### 2.4 Unique Index Ràng Buộc Ca Duy Nhất
```sql
CREATE UNIQUE INDEX IF NOT EXISTS "IX_ShiftZReports_TenantId_BranchId_ActiveShift"
ON "ShiftZReports" ("TenantId", "BranchId")
WHERE "Status" IN (1, 2) AND "IsDeleted" = false;
```
*(Đảm bảo mỗi chi nhánh chỉ có tối đa 1 ca ở trạng thái Open hoặc Closing).*

---

## 3. Concurrency Control Trừ Tồn Kho FEFO (`OrderService.cs`)

Để ngăn chặn 2 thu ngân quét bán cùng 1 món hàng tại cùng một giây làm bán âm kho:
```csharp
// Khi kiểm tra và trừ tồn kho BranchStocks theo FEFO trong CreateOrderAsync:
// Sử dụng PostgreSQL row-level lock FOR UPDATE trên các dòng kho của chi nhánh
var stocks = await _context.BranchStocks
    .FromSqlInterpolated($@"
        SELECT * FROM ""BranchStocks""
        WHERE ""BranchId"" = {branchId} 
          AND ""ProductId"" = {item.ProductId} 
          AND ""QuantityOnHand"" > 0 
          AND ""IsDeleted"" = false
        ORDER BY ""ExpiryDate"" ASC NULLS LAST
        FOR UPDATE")
    .ToListAsync(cancellationToken);
```
- Cơ chế `FOR UPDATE` khóa các bản ghi tồn kho của sản phẩm đó trong phạm vi transaction bán hàng.
- Luồng thanh toán thứ 2 sẽ đợi vài mili-giây cho transaction thứ nhất hoàn tất và đọc số tồn kho chính xác vừa được trừ, triệt tiêu hoàn toàn race condition.

---

## 4. Đặc Tả API (Endpoints & DTOs)

| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/pos/shifts/open` | Cashier, Owner | Mở ca mới (Trả lỗi 409 nếu chi nhánh đã có ca `Open` hoặc `Closing`) |
| `GET` | `/api/pos/shifts/current?branchId={id}` | Cashier, Owner | Lấy ca đang chạy của chi nhánh kèm trạng thái (`Open`/`Closing`) và người tham gia |
| `POST` | `/api/pos/shifts/{id}/start-closing` | Cashier | Chuyển ca sang trạng thái `Closing`, kích hoạt khóa bán hàng |
| `POST` | `/api/pos/shifts/{id}/cancel-closing` | Cashier, Owner | Hủy kiểm đếm, trả ca về `Open` để tiếp tục bán hàng |
| `PUT` | `/api/pos/shifts/{id}/counted-cash` | Cashier | Cập nhật số tiền thực đếm $H$ trong két |
| `POST` | `/api/pos/shifts/{id}/confirm-close` | Cashier | Xác nhận số đếm và chuyển ca sang `Closed` |
| `POST` | `/api/pos/shifts/{id}/force-close` | Owner | Chủ cửa hàng đóng ca cưỡng bức từ xa kèm lý do bắt buộc |
| `POST` | `/api/pos/orders` | Cashier, Owner | Tạo đơn hàng (Bị từ chối nếu ca đang ở trạng thái `Closing` hoặc `Closed`) |

---

## 5. Thiết Kế Giao Diện Frontend (UI/UX)

1. **`PosCheckoutPage.tsx`**:
   - Khi tải trang: Lấy thông tin ca hiện tại của chi nhánh qua `posShiftApi.getCurrentShift(activeBranch.id)`.
   - Nếu ca đang `Open`: Thu ngân vào bán hàng bình thường, không hiện modal mở ca.
   - Nếu ca đang `Closing`: Hiển thị thanh cảnh báo đỏ trên đầu màn hình:
     > ⚠️ **Ca bán hàng đang được kiểm đếm chốt ca bởi [Tên nhân viên]. Toàn bộ quầy tạm thời khóa thanh toán.**
   - Nút **"Thanh toán"** bị vô hiệu hóa (disabled) khi ca đang `Closing`.
2. **`CloseShiftModal.tsx`**:
   - Nút **"Bắt đầu chốt ca"**: Gọi `startClosingShift(shiftId)`.
   - Ô nhập số tiền thực tế $H$: Cho phép nhập trực tiếp hoặc đếm 9 mệnh giá tiền mặt.
   - Hiển thị chênh lệch $I = H - G$.
   - Nút **"Hủy chốt ca"** (`cancel-closing`) cho phép thu ngân mở lại quầy nếu có khách cần thanh toán gấp.
   - Nút **"Xác nhận & Đóng ca"** hoàn tất quy trình và in Z-Report.
