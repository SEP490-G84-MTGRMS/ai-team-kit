# Bản Thiết Kế Giao Diện & API Contract (Design Brief)
## Change: be08-customer-debt-management — Phân Hệ Công Nợ Khách Hàng (FE-08)

### 1. Mô Hình Thực Thể & Trạng Thái (Data Models & States)

#### 1.1. Các Loại Giao Dịch Nợ (`CustomerDebtType` Enum)
- `DebtIncurred` (+Nợ): Phát sinh nợ khi mua chịu tại quầy POS.
- `DebtRepayment` (-Nợ): Khách thanh toán nợ (tiền mặt / chuyển khoản).
- `GoodsReturnOffset` (-Nợ): Cấn trừ nợ khi trả lại hàng đã mua chịu.
- `DebtAdjustment` (+/- Nợ): Bút toán điều chỉnh sai sót kế toán (cần quản lý duyệt).
- `BadDebtWriteOff` (-Nợ): Xóa sổ nợ xấu không thể thu hồi (chỉ chủ cửa hàng duyệt).

#### 1.2. Trạng Thái Hóa Đơn Nợ (`DebtInvoiceStatus` Enum)
- `Unpaid`: Chưa thanh toán đồng nào (`RemainingDebtAmount == TotalDebtAmount`).
- `PartiallyPaid`: Đã thanh toán một phần (`0 < RemainingDebtAmount < TotalDebtAmount`).
- `FullyPaid`: Đã thanh toán đủ 100% (`RemainingDebtAmount == 0`).
- `Cancelled`: Hóa đơn nợ bị hủy do đơn hàng POS bị hủy.

#### 1.3. Trạng Thái Khách Hàng (`CustomerDebtStatus` Enum)
- `GoodStanding`: Không nợ hoặc nợ trong hạn mức cho phép.
- `Warning`: Nợ đạt $\ge 80\%$ hạn mức hoặc nợ sắp đến hạn ($\le 3$ ngày).
- `OverdueBlocked`: Có hóa đơn quá hạn chưa trả $\rightarrow$ Hệ thống tự động khóa bán chịu.
- `LimitExceededBlocked`: Tổng nợ vượt hạn mức tín dụng $\rightarrow$ Tự động khóa bán chịu.

---

### 2. Thiết Kế API Endpoints (RESTful Contract)

#### Base Route: `/api/customers/debt`

| Method | Endpoint | Quyền / Vai Trò | Mô Tả Nghiệp Vụ |
|:---|:---|:---|:---|
| `POST` | `/record-sale-debt` | Cashier, Manager | Ghi nhận đơn hàng bán chịu từ POS API (kiểm tra hạn mức & ngày nợ). |
| `POST` | `/repay` | Cashier, Manager | Khách trả nợ (tiền mặt / ngân hàng), phân bổ FIFO và ghi thu Sổ Quỹ. |
| `POST` | `/goods-return-offset` | Cashier, Manager | Cấn trừ nợ khi tiếp nhận hàng trả của đơn mua chịu. |
| `POST` | `/adjust` | Manager, Owner | Bút toán điều chỉnh nợ sai sót (ghi rõ lý do và mã phê duyệt). |
| `POST` | `/write-off` | Owner Only | Xóa nợ xấu đính kèm biên bản xử lý tổn thất. |
| `GET` | `/profile/{customerId}` | Cashier, Manager | Xem hạn mức, tổng nợ, trạng thái chặn và danh sách hóa đơn mở. |
| `GET` | `/ledger/{customerId}` | Cashier, Manager | Xem lịch sử sổ cái công nợ bất biến (phân trang). |
| `GET` | `/aging-report` | Manager, Owner | Báo cáo tuổi nợ đa chi nhánh (trong hạn, 1-30 ngày, 31-60 ngày, >60 ngày). |

---

### 3. Quy Ước Mã Lỗi (Error Codes)

| Mã Lỗi (Error Code) | HTTP Status | Giải Thích & Hành Vi Frontend |
|---|---|---|
| `CREDIT_LIMIT_EXCEEDED` | 400 Bad Request | Tổng nợ sau đơn hàng vượt hạn mức tín dụng của khách. Hiển thị modal yêu cầu thanh toán bớt hoặc nhập mã Bypass của quản lý. |
| `DEBT_OVERDUE_BLOCKED` | 400 Bad Request | Khách hàng có hóa đơn nợ đã quá hạn thanh toán. POS chặn không cho chọn hình thức "Ghi Nợ". |
| `CUSTOMER_NOT_FOUND` | 404 Not Found | Không tìm thấy mã khách hàng hoặc khách hàng vãng lai không có hồ sơ nợ. |
| `INVALID_REPAYMENT_AMOUNT` | 400 Bad Request | Số tiền thanh toán $\le 0$ hoặc vượt quá số tiền cần trả. |
| `INSUFFICIENT_TILL_CASH` | 400 Bad Request | Khi hoàn tiền dư hàng trả ra két mà két quầy không đủ tiền mặt. |
| `UNAUTHORIZED_WRITE_OFF` | 403 Forbidden | Người dùng không phải là Chủ cửa hàng khi thực hiện xóa nợ xấu. |
