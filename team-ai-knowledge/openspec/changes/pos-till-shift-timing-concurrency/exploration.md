# EXP-2026-11-07-POS: Ca Dùng Chung Theo Chi Nhánh (Nhiều Quầy, Một Két), Khóa Bán Khi Chốt Ca & Concurrency Tồn Kho

## 1. Problem Statement (Vấn đề)
Trong mô hình siêu thị mini và cửa hàng tạp hóa thực tế:
1. Chi nhánh có thể có từ 1-2 quầy thanh toán (máy POS hoặc thiết bị đăng nhập web), nhưng **chỉ sử dụng 1 két tiền mặt duy nhất tại quầy**.
2. Hệ thống cũ giả định mỗi nhân viên hoặc máy có 1 ca riêng hoặc kiểm tra ca theo người dùng đơn lẻ, dẫn đến:
   - Nhân viên thứ 2 đăng nhập bị hiện popup bắt mở ca riêng, gây nhầm lẫn và xung đột két tiền.
   - Khi nhân viên A về sớm (ví dụ 12h), nhân viên B bán tiếp buổi chiều bị gián đoạn nếu bắt buộc phải chốt ca đếm két giữa trưa.
3. Khi 1 nhân viên bấm chốt ca để đếm tiền, các máy khác vẫn tạo đơn thu tiền, làm số tiền thực đếm $H$ bị lệch tức thì so với số tiền lý thuyết $G$, sinh ra chênh lệch ảo $I = H - G$.
4. Khi 2 nhân viên ở 2 máy quét bán cùng một sản phẩm tồn kho thấp tại cùng một giây, hệ thống đọc tồn kho song song và trừ in-memory mà không có cơ chế khóa (locking), dẫn đến **race condition** làm bán âm kho (vượt quá tồn kho thực tế).

---

## 2. Context & Background (Hiện trạng)
- `ShiftZReport` hiện quản lý ca bán hàng (`BranchId`, `CashierUserId`, `Status`).
- `OrderService.CreateOrderAsync` trừ `BranchStocks` theo FEFO (`QuantityOnHand -= deduct`) rồi gọi `SaveChangesAsync()` nhưng chưa có Concurrency Token (`RowVersion`/`xmin`) hoặc pessimistic row lock (`SELECT FOR UPDATE`).
- Giao diện `PosCheckoutPage.tsx` và `OpenShiftModal.tsx` kiểm tra ca theo chi nhánh nhưng hardcode `tillId` và chưa xử lý tự động tham gia ca đang mở khi người dùng khác đăng nhập.
- `CloseShiftModal.tsx` đã có giao diện đếm tiền chi tiết 9 mệnh giá và ràng buộc giữ lại tiền lẻ + nộp két an toàn, nhưng chưa hỗ trợ trạng thái `Closing` (khóa bán) và chưa có cơ chế xác nhận số đếm giữa các nhân viên.

---

## 3. Constraints (Ràng buộc kỹ thuật & nghiệp vụ)
1. **Multi-Tenancy**: Mọi bảng và truy vấn bắt buộc cách ly theo `TenantId`.
2. **Kiến trúc Clean Architecture**:
   - Domain: Entity `ShiftZReport`, `ShiftParticipant`, `ShiftCloseConfirmation`.
   - Application: Service & DTOs cho quy trình ca chung, validation FluentValidation.
   - Infrastructure: EF Core 8 + PostgreSQL Code-First.
   - Api: Controller RESTful với kiểm tra quyền RBAC và tenant filter.
   - Frontend: React 19 + TypeScript + Vite.
3. **Hiệu năng & Đồng thời (Concurrency)**:
   - Trừ kho FEFO phải atomic và an toàn dưới tải đa luồng đồng thời mà không làm sập DB.
   - Thao tác chuyển trạng thái ca (`start-closing`, `cancel-closing`, `confirm-close`) phải an toàn chống ghi đè (Optimistic Concurrency với `RowVersion` hoặc `xmin`).

---

## 4. Assumptions (Giả định)
- **[ASSUMPTION-01]**: Mỗi chi nhánh sử dụng chung 1 két tiền mặt vật lý duy nhất. Tất cả thu ngân cùng nạp/rút tiền tại két này.
- **[ASSUMPTION-02]**: Mọi đơn hàng tạo trong khi ca đang `Open` tại chi nhánh đều thuộc về ca đó.
- **[ASSUMPTION-03]**: Chủ cửa hàng bán hàng thì đơn hàng cũng ghi nhận vào ca đang chạy của chi nhánh, đồng thời ghi rõ `CreatedBy` là Chủ cửa hàng.

---

## 5. Scope & Non-Goals

### In Scope
- Ràng buộc DB: Mỗi `(TenantId, BranchId)` chỉ có duy nhất 1 ca ở trạng thái `Open` hoặc `Closing`.
- Nhân viên thứ 2 đăng nhập tự động vào ca đang chạy, ghi nhận vào `ShiftParticipants`.
- Vòng đời ca: `Open` → `Closing` (khóa tạo đơn/phiếu chi trên mọi máy) → `Closed` (đủ xác nhận).
- Cho phép hủy chốt ca (`Closing` → `Open`) nếu cần bán tiếp.
- Chặn đóng ca nếu còn phiếu chi `PendingApproval`.
- Chủ cửa hàng có quyền `force-close` từ xa kèm lý do khi nhân viên quên đóng.
- Concurrency control khi trừ tồn kho `BranchStocks` theo FEFO.
- Báo cáo Z-Report phân bổ doanh thu theo từng nhân viên tham gia ca.

### Out of Scope (Non-Goals)
- Nhiều két tiền riêng biệt trong cùng 1 chi nhánh (để giai đoạn sau).
- WebSocket / SignalR push realtime (giai đoạn này dùng client polling / re-fetch khi có thao tác).
- Chế độ bán offline khi đứt mạng hoàn toàn.

---

## 6. Đánh giá phương án kỹ thuật (Options Evaluation)

### Vấn đề 1: Nhận diện và quản lý ca đa nhân viên
- **Phương án 1 (Gắn ca theo từng Nhân viên / Máy)**: Mỗi nhân viên mở 1 ca riêng trên 1 két riêng.
  - *Ưu điểm*: Trách nhiệm tiền mặt quy rõ từng người.
  - *Nhược điểm*: Không đúng với thực tế cửa hàng tạp hóa (chỉ có 1 két chung), nhân viên đổi máy hoặc bán phụ bị kẹt ca.
- **Phương án 2 (Ca dùng chung theo Chi nhánh - CHỌN)**: Chi nhánh có 1 ca duy nhất, mọi thu ngân cùng bán trong ca.
  - *Ưu điểm*: Đúng 100% với tài liệu nghiệp vụ thực tế `BO_SUNG_CA_DUNG_CHUNG_CHI_NHANH_NHIEU_QUAY_MOT_KET.md`. Nhân viên A về sớm thì nhân viên B bán tiếp không cần chốt giữa chừng. Đơn giản hóa vận hành tối đa.
  - *Nhược điểm*: Chênh lệch tiền cuối ca tính chung cho cả ca (khắc phục bằng cách Z-Report liệt kê rõ doanh thu từng nhân viên).

### Vấn đề 2: Chống race condition trừ tồn kho FEFO
- **Phương án 1 (Optimistic Concurrency với RowVersion / xmin)**:
  - Khi 2 luồng đọc cùng 1 dòng stock, luồng commit sau sẽ nhận `DbUpdateConcurrencyException`, bắt retry lại logic FEFO.
  - *Ưu điểm*: Chuẩn EF Core, không khóa database lâu.
  - *Nhược điểm*: Cần cơ chế retry loop khi có xung đột.
- **Phương án 2 (Pessimistic Row-Level Lock: `SELECT ... FOR UPDATE` - CHỌN)**:
  - Khi chuẩn bị trừ kho cho `ProductId`, transaction thực hiện `SELECT ... FROM "BranchStocks" WHERE ... FOR UPDATE`.
  - Luồng thứ 2 mua cùng sản phẩm sẽ đợi transaction 1 commit (vài mili-giây) rồi đọc giá trị tồn kho mới nhất để trừ.
  - *Ưu điểm*: Hoàn toàn loại bỏ retry loop, đảm bảo thứ tự bán hàng chính xác theo FEFO, không bao giờ trừ âm kho.

---

## 7. Rủi ro & Cách giảm thiểu
1. **Rủi ro**: Máy khác không biết ca đang `Closing` và tiếp tục thanh toán.
   - *Giảm thiểu*: API `CreateOrderAsync` và `AddCashMovementAsync` kiểm tra trạng thái ca ngay trong transaction. Nếu ca không phải `Open` (ví dụ đang `Closing`), API từ chối với mã lỗi 409: *"Ca bán hàng đang được kiểm đếm chốt ca, vui lòng đợi hoàn tất hoặc hủy chốt."*
2. **Rủi ro**: Hai nhân viên cùng bấm "Bắt đầu chốt ca" đồng thời.
   - *Giảm thiểu*: Thao tác `start-closing` sử dụng điều kiện `WHERE Status = 'Open'`. Chỉ 1 người thành công, người thứ hai nhận lỗi 409 và giao diện tự chuyển sang chế độ xem đếm tiền.
