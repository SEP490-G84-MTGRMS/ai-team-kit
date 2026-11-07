# Proposal: Quầy POS, Thời gian ca & Concurrency tồn kho

## 1. Vấn đề

Hiện tại hệ thống POS của MT-GRMS có các lỗ hổng nghiệp vụ:

### 1.1 Không có khái niệm Quầy (PosTill)
- `TillId` trên `ShiftZReport` là GUID hardcode cứng (`01a19664-...`), không có entity tương ứng.
- `Order` không có `TillId` nên không truy vết được đơn hàng thuộc quầy nào.
- Frontend `OpenShiftModal` hardcode `tillId` mặc định, không cho nhân viên chọn quầy.
- **Hệ quả**: Cửa hàng có 2+ quầy không thể phân tách ca, két tiền, chênh lệch theo từng quầy.

### 1.2 Không phát hiện đóng ca sớm/muộn
- `ShiftZReport` không có các trường `CloseTiming`, `ScheduledEndUtc`, `IsOverdue`, `CloseMode`.
- Nhân viên đóng ca lúc nào cũng được, hệ thống không phân biệt sớm hay muộn.
- Chủ cửa hàng không nhận thông tin khi nhân viên về sớm hoặc quên đóng ca.
- Không có cơ chế đóng cưỡng bức khi nhân viên quên.

### 1.3 Race condition trừ tồn kho (Critical)
- `OrderService.CreateOrderAsync` đọc tồn kho → tính toán trong bộ nhớ → trừ → SaveChanges **không có locking**.
- 2 nhân viên bán cùng sản phẩm cùng lúc → cả hai đọc tồn kho = 5 → cả hai trừ 3 → tồn kho thành 2 thay vì -1 → **bán quá tồn kho thật**.
- Đây là lỗi dữ liệu nghiêm trọng, đặc biệt khi có nhiều quầy bán song song.

### 1.4 CreatedBy trên Order chưa xác minh
- `Order` kế thừa `CreatedBy` từ `BaseTenantEntity` nhưng cần xác minh pipeline middleware đang gán đúng userId của người đăng nhập khi tạo đơn.

## 2. Mục tiêu

1. **Tạo entity `PosTill`** để quản lý quầy theo chi nhánh, hỗ trợ cửa hàng nhiều quầy.
2. **Nhân viên chọn quầy khi mở ca** trên giao diện web (cửa hàng 1 quầy thì auto-chọn, ẩn bước này).
3. **Thêm TillId vào Order** — server tự gán từ ca đang mở, không tin client gửi.
4. **Phát hiện đóng sớm/muộn** (CloseTiming) và **đóng cưỡng bức** (ForceClose) bởi chủ.
5. **Chống race condition** trừ tồn kho bằng row-level locking hoặc optimistic concurrency.
6. **Xác minh CreatedBy** trên Order đang gán đúng userId.

## 3. Phạm vi

### In scope
- Entity `PosTill` (Code, Name, BranchId, IsActive, DefaultFloat) + migration + API CRUD.
- Auto-seed "Quầy 1" cho mỗi chi nhánh hiện tại.
- Frontend: chọn quầy khi mở ca (ẩn nếu chỉ 1 quầy).
- Thêm `TillId` vào `Order`; server gán tự động từ ShiftZReport.TillId.
- Bổ sung ShiftZReport: `ScheduledEndUtc`, `CloseTiming`, `CloseTimingMinutes`, `CloseTimingReason`, `IsOverdue`, `CloseMode`, `ClosedByUserId`, `VarianceStatus`, `VarianceReviewedByUserId`, `VarianceReviewedAtUtc`, `VarianceReviewNote`.
- API force-close (`POST /api/pos/shifts/{id}/force-close`) chỉ Owner.
- API review-variance (`POST /api/pos/shifts/{id}/review-variance`) chỉ Owner.
- Ràng buộc: 1 quầy chỉ 1 ca Open, 1 NV chỉ 1 ca Open.
- Concurrency control: row-level lock (`SELECT ... FOR UPDATE` hoặc EF Core `ExecuteSqlRawAsync`) khi trừ BranchStocks.
- Verify và sửa pipeline gán `CreatedBy` trên Order.

### Out of scope
- PosDevice / Device binding / Trusted device (giai đoạn 2).
- SharedDrawer mode (để sau).
- Thông báo realtime (push notification, SignalR) — chỉ lưu cờ, chưa gửi realtime.
- Gọi vào sớm / Báo về sớm.
- EmployeeSchedule / lịch làm việc.
- Offline mode.

## 4. Người dùng liên quan

| Role | Tương tác |
|---|---|
| **Nhân viên thu ngân (EMPLOYEE)** | Chọn quầy khi mở ca, bán hàng, đóng ca (có/không sớm muộn) |
| **Chủ cửa hàng (STORE_OWNER)** | Quản lý quầy (CRUD), xem ca quá hạn, đóng cưỡng bức, review chênh lệch |

## 5. Tiêu chí thành công

| # | Tiêu chí | Đo bằng |
|---|---|---|
| 1 | PosTill entity tồn tại, CRUD hoạt động, auto-seed Quầy 1 | Migration + API test |
| 2 | Mở ca chọn quầy trống; quầy bận hiển thị mờ kèm tên NV giữ | Frontend manual test |
| 3 | Order có TillId, server tự gán từ ca đang mở | Unit test: TillId != null sau tạo đơn |
| 4 | 1 quầy = max 1 ca Open, 1 NV = max 1 ca Open | Unit test: mở trùng → 409 |
| 5 | Đóng ca sớm > 30 phút → bắt buộc lý do, gắn cờ Early | Unit test |
| 6 | Ca quá hạn > 120 phút → gắn IsOverdue | Unit test |
| 7 | Owner force-close thành công | API test |
| 8 | 2 request trừ cùng sản phẩm đồng thời → tồn kho chính xác | Concurrency test (multi-thread) |
| 9 | Order.CreatedBy = userId của người đăng nhập | Integration test |
| 10 | Backend build 0 lỗi, tất cả tests pass | dotnet build + dotnet test |
| 11 | Frontend build 0 lỗi | npm run build |
