# Proposal: Ca Dùng Chung Theo Chi Nhánh (Nhiều Quầy, Một Két), Khóa Bán Khi Chốt Ca & Concurrency Tồn Kho

## 1. Vấn đề

Hệ thống quản lý ca và bán hàng tại chi nhánh của MT-GRMS đang gặp các bất cập thực tế:

### 1.1 Quản lý ca không khớp thực tế cửa hàng tạp hóa (Nhiều máy, 1 két tiền)
- Cửa hàng tạp hóa / siêu thị mini có thể có 2-3 nhân viên hoặc 2 màn hình bán hàng, nhưng **thực tế chỉ dùng chung 1 két tiền mặt duy nhất**.
- Hiện tại logic ca gắn cứng với `CashierUserId` hoặc giả định mỗi máy 1 ca riêng, dẫn đến:
  - Khi nhân viên A đã mở ca, nhân viên B đăng nhập máy bên cạnh thì bị chặn hoặc hiện popup bắt mở ca riêng, gây xung đột két tiền.
  - Khi nhân viên A về trước lúc 12h, nhân viên B tiếp tục ca chiều thì không biết chuyển giao thế nào nếu không đóng ca đếm tiền giữa chừng.
  - Chủ cửa hàng đứng bán phụ giờ cao điểm không biết đơn gắn vào ca nào.

### 1.2 Không có cơ chế khóa bán khi đếm tiền (`Closing`)
- Khi một nhân viên bắt đầu kiểm đếm tiền mặt trong két để chốt ca, các máy khác vẫn tạo đơn thu tiền bán hàng.
- Hệ quả: Số tiền thực đếm $H$ bị lệch ngay lập tức so với số tiền hệ thống tính $G$, gây chênh lệch ảo $I = H - G$ và khó đối soát.

### 1.3 Race condition khi 2 thu ngân bán cùng lúc (Critical)
- Khi 2 nhân viên ở 2 máy cùng quét bán 1 sản phẩm có tồn kho thấp cùng một thời điểm:
- Cả 2 luồng đọc tồn kho từ DB cùng lúc (không có locking) → tính trừ tồn kho in-memory → cùng ghi xuống DB → **bán âm/bán quá tồn kho thực tế**.

---

## 2. Mục tiêu & Quyết định cốt lõi [ĐÃ CHỐT]

1. **Một chi nhánh – Một ca – Một két tiền (S1, S2)**:
   - Tại một thời điểm, mỗi chi nhánh chỉ có **duy nhất 1 ca ở trạng thái `Open` hoặc `Closing`**.
   - Mọi máy POS và mọi nhân viên trong chi nhánh đó cùng bán hàng trong ca này.
2. **Tự động vào ca đang mở (S4)**:
   - Nhân viên đăng nhập nếu chi nhánh đã có ca mở thì **vào thẳng màn hình bán hàng**, không hiện popup mở ca.
   - Chỉ hiện popup mở ca khi chi nhánh chưa có ca nào đang chạy.
   - Ghi nhận người tham gia ca (`ShiftParticipants`) khi nhân viên phát sinh đơn hàng hoặc giao dịch.
3. **Quy trình chốt ca chung an toàn (S5, S6, S7)**:
   - Bấm **"Bắt đầu chốt ca"** (`start-closing`): Ca chuyển trạng thái `Closing`. **Tất cả các máy bị khóa bán** (chỉ cho xem).
   - Một người nhập số tiền đếm $H$. Máy khác hiển thị số đếm và có thể bấm **Xác nhận** (`confirm-close`).
   - Có nút **"Hủy chốt ca"** (`cancel-closing`) để chuyển ca trở lại `Open` nếu cần bán tiếp.
   - Chặn đóng ca nếu còn phiếu chi tiền mặt `PendingApproval` chưa duyệt/hủy.
4. **Nhân viên về sớm / Chủ bán hàng (S11, S12)**:
   - Người mở ca (`OpenedByUserId`) về trước thì ca **vẫn tiếp tục**, các nhân viên khác tiếp tục bán bình thường.
   - Đơn do Chủ cửa hàng tạo tự động gắn vào ca đang mở của chi nhánh (nếu có ca mở).
   - Chủ cửa hàng có quyền **Đóng ca cưỡng bức** (`force-close`) từ xa nếu nhân viên về hết mà quên đóng ca.
5. **Chống race condition trừ tồn kho**:
   - Áp dụng cơ chế khóa mức hàng (Row-level locking hoặc Concurrency Check) trong `OrderService` khi trừ `BranchStocks` theo FEFO để đảm bảo tính toàn vẹn dữ liệu khi bán đồng thời.

---

## 3. Phạm vi

### In Scope:
- **Backend (.NET 8 Clean Architecture)**:
  - Cập nhật `ShiftZReport` (hoặc `Shift`): thêm trạng thái `Closing`, `ClosingStartedByUserId`, `ClosingStartedAt`, `CountedCash`, `ClosedByUserId`, `ForceCloseReason`.
  - Bảng mới `ShiftParticipant`: lưu `ShiftId`, `UserId`, `JoinedAt`, `LastActiveAt`.
  - Bảng mới `ShiftCloseConfirmation`: lưu `ShiftId`, `UserId`, `ConfirmedCountedCash`, `ConfirmedAt`.
  - Unique Index trên DB: Chỉ cho phép tối đa 1 ca `Open`/`Closing` trên mỗi `(TenantId, BranchId)`.
  - API chốt ca chung:
    - `POST /api/pos/shifts/{id}/start-closing`
    - `POST /api/pos/shifts/{id}/cancel-closing`
    - `PUT /api/pos/shifts/{id}/counted-cash`
    - `POST /api/pos/shifts/{id}/confirm-close`
    - `POST /api/pos/shifts/{id}/force-close` (chỉ Owner)
  - Khóa API bán hàng & thu/chi: Trả về lỗi rõ ràng (400/409) khi ca đang ở trạng thái `Closing` hoặc `Closed`.
  - Concurrency Lock trong `OrderService.CreateOrderAsync`: bảo vệ trừ tồn kho `BranchStocks` khi 2 máy gọi đồng thời.
  - Tự động gán đơn của Chủ vào ca `Open` hiện tại của chi nhánh.
  - Z-Report phân bổ doanh thu theo từng nhân viên (`CreatedBy`) và danh sách người tham gia ca.
- **Frontend (React 19 / Vite / TS)**:
  - `PosCheckoutPage`: Khi vào trang, nếu chi nhánh đã có ca mở thì tự động tham gia, không popup.
  - Khi ca ở trạng thái `Closing`: Hiển thị banner/overlay **"Ca đang được chốt bởi [Tên NV]. Máy tạm thời khóa bán hàng."**
  - Màn hình chốt ca (`CloseShiftModal`): Tách biệt luồng nhập số đếm, hiển thị chênh lệch, nút xác nhận và nút hủy chốt.

### Out of Scope:
- Phân chia két tiền riêng biệt cho từng quầy trong cùng chi nhánh (để sau nếu mở rộng mô hình).
- Đồng bộ WebSocket realtime (dùng cơ chế polling/fetch status khi thao tác).
- Chế độ bán offline khi mất mạng hoàn toàn.

---

## 4. Người dùng liên quan

| Role | Tương tác |
|---|---|
| **Thu ngân 1 (EMPLOYEE)** | Mở ca đầu tiên, bán hàng, bắt đầu chốt ca hoặc xác nhận số đếm |
| **Thu ngân 2 (EMPLOYEE)** | Đăng nhập tự vào ca, bán hàng song song, xem trạng thái closing và xác nhận |
| **Chủ cửa hàng (STORE_OWNER)** | Bán hàng (đơn vào ca chung), xem báo cáo Z-Report theo nhân viên, đóng ca cưỡng bức khi cần |

---

## 5. Tiêu chí thành công

| # | Tiêu chí | Đo bằng |
|---|---|---|
| 1 | Mỗi chi nhánh chỉ mở được đúng 1 ca đồng thời (mở lần 2 báo 409) | Unit & Integration Test |
| 2 | Nhân viên thứ 2 đăng nhập tự động dùng chung ca, không bị chặn mở ca | Kiểm thử luồng Frontend/API |
| 3 | Khi 1 máy bấm `start-closing`, các máy khác bị khóa bán hàng (API từ chối tạo đơn) | Integration Test + UI test |
| 4 | Có thể hủy chốt ca (`cancel-closing`) để mở lại trạng thái `Open` và tiếp tục bán | API test |
| 5 | Đóng ca bị chặn nếu còn phiếu chi `PendingApproval` | Unit Test |
| 6 | 2 máy gửi đơn cùng mua 1 sản phẩm tồn kho thấp đồng thời: không xảy ra bán âm (Concurrency safe) | Multi-threaded test |
| 7 | Chủ cửa hàng có thể đóng ca thay qua API `force-close` kèm lý do | API test |
| 8 | Z-Report hiển thị đầy đủ tổng két, chênh lệch và doanh thu phân bổ theo từng nhân viên | Test Z-Report |
| 9 | Toàn bộ backend tests pass (`dotnet test`) và frontend build 0 lỗi (`npm run build`) | CI/Build verification |
