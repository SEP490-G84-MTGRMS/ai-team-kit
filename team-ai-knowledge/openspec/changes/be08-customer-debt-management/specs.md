# Đặc Tả Kỹ Thuật (Specs): Phân Hệ Công Nợ Khách Hàng (FE-08)
## Capability: customer-debt

## ADDED Requirements

### REQ-DEBT-01: Hồ Sơ Tín Dụng & Quản Lý Hạn Mức Nợ (Customer Debt Profile & Limits)
- Hệ thống duy trì một thực thể `CustomerDebtProfile` gắn với từng khách hàng:
  - `CreditLimit` (mặc định 0đ cho khách lạ, cấu hình riêng cho khách quen, kiểu `DECIMAL(18,2)`).
  - `MaxDebtDays` (thời hạn nợ tối đa, mặc định 30 ngày).
  - `CurrentDebtBalance` (tổng số dư nợ hiện tại, luôn bằng tổng `RemainingDebtAmount` của các hóa đơn nợ mở).
  - `PrepaymentBalance` (số tiền khách hàng gửi lại/thừa sau khi cấn trừ nợ).
  - `DebtStatus` (`GoodStanding`, `Warning`, `OverdueBlocked`, `LimitExceededBlocked`).
- Bắt buộc kiểm tra khóa bi quan `UPDLOCK, ROWLOCK` khi thực hiện biến động nợ.

### REQ-DEBT-02: Sổ Cái Công Nợ Bất Biến (Immutable Customer Debt Ledger)
- Mọi biến động tăng hoặc giảm công nợ bắt buộc phải tạo bản ghi `CustomerDebtEntry` mới (Append-Only):
  - `EntryCode`: Mã định danh bút toán nợ duy nhất (`CDE-yyyyMMddHHmmssfff`).
  - `CustomerId`: Khách hàng thụ nợ.
  - `EntryType`: Loại bút toán (`DebtIncurred`, `DebtRepayment`, `GoodsReturnOffset`, `DebtAdjustment`, `BadDebtWriteOff`).
  - `Amount`: Số tiền phát sinh (luôn dương $> 0$).
  - `BalanceAfter`: Số dư nợ của khách hàng ngay sau bút toán.
  - `ReferenceCode`: Mã tham chiếu (mã đơn hàng POS, mã phiếu thu nợ, mã phiếu trả hàng).
  - `CreatedByUserId`, `OccurredAtUtc`, `Notes`.
- Nghiêm cấm mọi hành vi cập nhật (`UPDATE`) hoặc xóa (`DELETE`) bản ghi sổ nợ.

### REQ-DEBT-03: Theo Dõi Hóa Đơn Nợ & Phân Bổ FIFO (Debt Invoices & FIFO Allocation)
- Khi phát sinh bán nợ, hệ thống tạo bản ghi `CustomerDebtInvoice`:
  - `InvoiceId`: Khóa chính.
  - `OrderId`: Mã đơn hàng POS.
  - `TotalDebtAmount`: Tổng tiền nợ ban đầu của đơn hàng.
  - `RemainingDebtAmount`: Số tiền nợ còn lại chưa thanh toán.
  - `DueDate`: Ngày đến hạn trả nợ (`CreatedAt + MaxDebtDays`).
  - `Status`: `Unpaid`, `PartiallyPaid`, `FullyPaid`.
- Khi khách hàng thanh toán nợ (`DebtRepayment`), hệ thống áp dụng thuật toán **FIFO**:
  - Tự động cấn trừ vào hóa đơn nợ có `CreatedAt` cũ nhất đang mở.
  - Lưu bảng phân bổ `CustomerDebtAllocation` để đối chiếu minh bạch từng đợt trả tiền.

### REQ-DEBT-04: Xử Lý Trả Hàng Đơn Mua Chịu (Debt-backed Goods Return Offset)
- Khi khách hàng trả hàng thuộc đơn hàng đã mua chịu:
  - Hệ thống tự động tìm hóa đơn nợ gốc của đơn hàng đó.
  - Ưu tiên cấn trừ vào `RemainingDebtAmount` của chính hóa đơn nợ đó trước.
  - Nếu số tiền trả hàng vượt quá nợ còn lại của đơn hàng đó, hệ thống tiếp tục cấn trừ theo FIFO vào các hóa đơn nợ khác của khách hàng.
  - Tuyệt đối không cho phép xuất quỹ tiền mặt hoàn lại cho khách hàng chừng nào tổng nợ của khách hàng chưa về 0.

### REQ-DEBT-05: Chặn Bán Chịu Tự Động & Cơ Chế Quản Lý Phê Duyệt (Credit Control & Manager Bypass)
- Tại POS API, trước khi hoàn tất đơn hàng có hình thức thanh toán "Ghi Nợ":
  - Kiểm tra 1: Khách hàng có hóa đơn nợ nào có `DueDate < DateTime.UtcNow` mà còn nợ không $\rightarrow$ Báo lỗi `DEBT_OVERDUE_BLOCKED`.
  - Kiểm tra 2: `CurrentDebtBalance + OrderAmount > CreditLimit` $\rightarrow$ Báo lỗi `CREDIT_LIMIT_EXCEEDED`.
  - Ngoại lệ: Nếu có đính kèm `ManagerBypassCode` hợp lệ của Quản lý chi nhánh, hệ thống cho phép vượt hạn mức và ghi nhận audit log.

### REQ-DEBT-06: Tích Hợp Đồng Bộ Hai Chiều Với Sổ Quỹ (Cashbook Integration)
- Khi khách hàng trả nợ:
  - Nếu trả tiền mặt tại quầy $\rightarrow$ Hệ thống tự động gọi `CashbookService.ReceiveCashAsync(...)` tăng tiền két quầy, sinh bút toán thu quỹ nguồn `DEBT_REPAYMENT`.
  - Nếu trả qua chuyển khoản ngân hàng $\rightarrow$ Hệ thống tự động ghi tăng số dư tài khoản ngân hàng thụ hưởng và sinh bút toán thu sổ quỹ nguồn `DEBT_REPAYMENT_BANK`.

## MODIFIED Requirements
- Không có (Bổ sung tính năng mới hoàn toàn, tích hợp trực tiếp với Sổ Quỹ hiện hữu).

## REMOVED Requirements
- Không có.
