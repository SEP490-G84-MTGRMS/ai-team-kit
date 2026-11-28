# Báo Cáo Khảo Sát Kỹ Thuật & Kiến Trúc (Exploration)
## Change: be08-customer-debt-management — Phân Hệ Công Nợ Khách Hàng (FE-08)

### 1. Phân Tích Thực Trạng & Các Thách Thức Kỹ Thuật
- **Thách thức 1: Tính toàn vẹn số dư (Balance Integrity):** Nếu chỉ cập nhật trực tiếp `Customer.CurrentDebt`, khi có nhiều giao dịch bán nợ/thu nợ đồng thời sẽ gây Lost Update hoặc âm nợ. Sổ nợ bắt buộc phải là **Sổ cái bất biến (Append-Only)**, mọi thay đổi số dư đều do các bản ghi `CustomerDebtEntry` sinh ra.
- **Thách thức 2: Phân bổ thanh toán nhiều hóa đơn (Multi-Invoice Allocation):** Một khách hàng có thể có 5 hóa đơn nợ ở các thời điểm khác nhau. Khi khách trả một cục tiền (ví dụ 1.000.000đ), hệ thống cần thuật toán phân bổ khách quan, minh bạch và xác định chính xác hóa đơn nào đã tất toán, hóa đơn nào còn nợ bao nhiêu.
- **Thách thức 3: Trả hàng của đơn mua chịu (Debt-backed Return):** Đây là góc khuất nguy hiểm nhất trong bán lẻ. Nếu nhân viên thối tiền mặt cho đơn mua chịu chưa trả tiền, cửa hàng bị mất kép (mất hàng + mất tiền). Cần cơ chế cấn trừ nợ tự động theo chuỗi ưu tiên.
- **Thách thức 4: Chặn bán nợ quá hạn (Overdue Hard-stop):** Khách hàng có thể chưa vượt hạn mức tiền nhưng đã có khoản nợ quá hạn $> 30$ ngày. Cần chặn tự động ở mức API POS.

---

### 2. So Sánh Các Phương Án Kiến Trúc

| Tiêu Chí Đánh Giá | Phương Án 1: Flat Balance (Chỉ lưu số dư nợ) | Phương Án 2: Two-Tier (Sổ Cái + Hóa Đơn Nợ) ⭐ *(Được chọn)* |
|---|---|---|
| **Cấu trúc dữ liệu** | 1 bảng `Customer` có trường `DebtBalance` | 3 bảng: `CustomerDebtProfile`, `CustomerDebtInvoice`, `CustomerDebtEntry` + `DebtAllocation` |
| **Theo dõi tuổi nợ (Aging)** | ❌ Không thể xác định hóa đơn nào quá hạn | ✅ Chính xác 100% từng hóa đơn theo ngày tạo & DueDate |
| **Thuật toán FIFO** | ❌ Không thực hiện được | ✅ Tự động phân bổ tuần tự từ hóa đơn cũ nhất đến mới nhất |
| **Trả hàng cấn trừ nợ** | ⚠️ Chỉ trừ mò vào số dư tổng | ✅ Cấn trừ đúng hóa đơn mua gốc, phần dư cấn trừ theo FIFO |
| **Khả năng kiểm toán (Audit)** | ❌ Rất kém, dễ gian lận | ✅ Minh bạch tuyệt đối, đối chiếu công nợ 2 chiều với khách |

---

### 3. Thiết Kế Thuật Toán Trọng Tâm

#### 3.1. Thuật toán Phân bổ Thu nợ FIFO (Debt Repayment Engine)
```text
INPUT: CustomerId, RepaymentAmount, PaymentMethod (Cash/Bank)
1. Lock CustomerDebtProfile với UPDLOCK, ROWLOCK.
2. Lấy danh sách Open Invoices (Status IN [Unpaid, PartiallyPaid]) ORDER BY CreatedAt ASC.
3. RemainingCash = RepaymentAmount.
4. FOREACH invoice IN Open Invoices:
     IF RemainingCash <= 0 THEN BREAK;
     PayAmount = MIN(RemainingCash, invoice.RemainingDebtAmount);
     invoice.RemainingDebtAmount -= PayAmount;
     invoice.Status = (invoice.RemainingDebtAmount == 0) ? FullyPaid : PartiallyPaid;
     RemainingCash -= PayAmount;
     Tạo DebtAllocation(EntryId, invoice.Id, PayAmount);
5. IF RemainingCash > 0 THEN:
     // Khách trả thừa tiền so với tổng nợ
     Ghi nhận CustomerDebtProfile.PrepaymentBalance += RemainingCash;
6. Ghi nhận CustomerDebtEntry(Type: DebtRepayment, Amount: RepaymentAmount, BalanceAfter: NewTotalDebt).
7. Ghi nhận bút toán Sổ Quỹ đối ứng:
     IF Cash -> CashbookService.ReceiveCashAsync(Till/Safe, Amount);
     IF Bank -> CashbookService.ReceiveCashAsync(Bank, Amount);
```

#### 3.2. Thuật toán Cấn trừ Trả hàng Mua chịu (Goods Return Debt Offset)
```text
INPUT: CustomerId, OriginalOrderId, ReturnGoodsValue
1. Lock CustomerDebtProfile.
2. Tìm invoice nợ gốc liên kết với OriginalOrderId:
     IF invoice tồn tại VÀ invoice.RemainingDebtAmount > 0:
         OffsetThisInvoice = MIN(ReturnGoodsValue, invoice.RemainingDebtAmount);
         invoice.RemainingDebtAmount -= OffsetThisInvoice;
         invoice.Status = (invoice.RemainingDebtAmount == 0) ? FullyPaid : PartiallyPaid;
         ReturnGoodsValue -= OffsetThisInvoice;
3. IF ReturnGoodsValue > 0 VÀ Customer còn hóa đơn nợ khác mở:
     Chạy tiếp phân bổ FIFO cấn trừ vào các hóa đơn khác cho đến khi ReturnGoodsValue = 0 hoặc hết nợ.
4. IF ReturnGoodsValue > 0 (Khách đã sạch 100% nợ):
     Tùy chọn:
     a) Hoàn tiền mặt ra két (Gọi CashbookService.DisburseCashAsync) NẾU khách yêu cầu.
     b) Hoặc cộng vào PrepaymentBalance (Tiền đặt cọc/dư cho lần mua sau).
```

---

### 4. Phân Tích Rủi Ro & Giải Pháp Phòng Ngừa
- **Rủi ro 1: Race Condition khi 2 quầy cùng thu nợ hoặc bán nợ cho 1 khách hàng.**
  - *Giải pháp:* Đọc hồ sơ khách hàng bằng khóa bi quan `SELECT ... WITH (UPDLOCK, ROWLOCK)` trong cùng một Database Transaction.
- **Rủi ro 2: Khách hàng quen nợ quá hạn nhưng thu ngân tự ý bán nợ.**
  - *Giải pháp:* POS API trả về lỗi `DEBT_OVERDUE_BLOCKED` hoặc `CREDIT_LIMIT_EXCEEDED`. Bắt buộc gửi kèm `ManagerBypassCode` hợp lệ mới cho phép hoàn tất đơn hàng nợ.
