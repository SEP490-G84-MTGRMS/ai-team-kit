# Đề Xuất Kỹ Thuật (Proposal): Phân Hệ Quản Lý Công Nợ Khách Hàng (FE-08)
## Change: be08-customer-debt-management

### 1. Bối Cảnh & Vấn Đề (Problem Statement)
- Hiện tại, việc quản lý khách hàng mua chịu (ghi sổ nợ) tại các cửa hàng bán lẻ MT-GRMS còn dựa vào cách cộng trừ thủ công hoặc ghi nhận đơn giản trên một trường số dư `CurrentDebt`, dẫn đến các rủi ro nghiêm trọng:
  1. **Thất thoát & mập mờ dữ liệu nợ:** Không có sổ cái nợ bất biến (Append-Only Debt Ledger), không thể truy vết xem số nợ hiện tại bắt nguồn từ những hóa đơn nào, đã thu những đợt nào.
  2. **Bán chịu quá đà gây đọng vốn:** Không kiểm soát hạn mức tín dụng (`CreditLimit`) và thời hạn nợ tối đa (`MaxDebtDays`), dẫn đến tình trạng khách nợ dây dưa kéo dài không bị chặn kịp thời tại quầy POS.
  3. **Sai lệch khi trả hàng đơn mua chịu:** Khi khách trả lại hàng của đơn mua chịu, nhân viên lúng túng chi tiền mặt ra khỏi két thay vì giảm trừ nợ, gây tổn thất dòng tiền mặt thực tế.
  4. **Thanh toán nợ không có quy tắc rõ ràng:** Khi khách trả một phần tiền nợ, không biết phân bổ cấn trừ cho hóa đơn nào, gây tranh chấp khi đối chiếu công nợ.

### 2. Mục Tiêu (Objectives)
- Xây dựng phân hệ Backend Quản lý Công Nợ Khách Hàng (`FE-08`) chuẩn mực, minh bạch, chính xác 100%:
  - Thiết lập **Sổ cái công nợ bất biến** (`CustomerDebtEntry`), mọi biến động tăng/giảm nợ đều được ghi nhận nguyên vẹn kèm `BalanceAfter`.
  - Triển khai **Thuật toán phân bổ thanh toán FIFO** (First-In, First-Out): Hóa đơn nợ trước được ưu tiên thanh toán trước.
  - Triển khai **Quy trình xử lý trả hàng đơn nợ**: Tự động giảm trừ nợ theo thứ tự ưu tiên (nợ chính đơn đó $\rightarrow$ nợ các đơn cũ theo FIFO $\rightarrow$ chỉ hoàn tiền mặt nếu tổng nợ khách hàng bằng 0).
  - Triển khai **Động cơ kiểm soát tín dụng**: Cảnh báo và tự động chặn bán chịu khi vượt hạn mức hoặc có nợ quá hạn; hỗ trợ cơ chế phê duyệt vượt hạn mức (Manager Bypass Code).
  - Tích hợp **Đồng bộ Sổ Quỹ hai chiều**: Thu nợ bằng tiền mặt tự động tăng quỹ quầy/két sắt; thu nợ qua ngân hàng tự động tăng tài khoản ngân hàng.

### 3. Phạm Vi (Scope)
- **In Scope (Thuộc phạm vi Phase 2):**
  - Quản lý hồ sơ công nợ khách hàng: `CreditLimit`, `MaxDebtDays`, `CurrentDebtBalance`, `DebtStatus` (Active, Overdue, Blocked).
  - Sổ cái nợ bất biến `CustomerDebtEntry` và liên kết chi tiết hóa đơn nợ `CustomerDebtInvoice`.
  - Bút toán ghi nợ khi POS bán chịu đơn hàng (`DebtIncurred`).
  - Giao dịch thu nợ (`DebtRepayment`) tiền mặt / ngân hàng kèm phân bổ FIFO tự động.
  - Cấn trừ nợ khi trả hàng mua chịu (`GoodsReturnDebtOffset`).
  - Bút toán điều chỉnh nợ kế toán (`DebtAdjustment`) và xóa nợ xấu (`BadDebtWriteOff`) cần thẩm quyền.
  - Kiểm tra và chặn bán nợ tự động tại POS API.
  - Đồng bộ bút toán thu sổ quỹ `CashbookEntry` tương ứng với giao dịch thu nợ.
- **Out of Scope (Dành cho các phase tiếp theo):**
  - Báo cáo kết quả kinh doanh P&L (`FE-10`) và Thuế hộ kinh doanh (`FE-19`).
  - Tích hợp cổng thanh toán trực tuyến tự động quét QR động (sẽ tích hợp ở Phase Open Banking).

### 4. Người Dùng & Vai Trò (Actors & Roles)
- **Thu ngân (Cashier):** Bán chịu cho khách đủ điều kiện hạn mức, ghi nhận thu nợ tại quầy, tiếp nhận hàng trả mua chịu.
- **Cửa hàng trưởng / Quản lý chi nhánh (Store Manager):** Duyệt mở hạn mức nợ đặc biệt, nhập mã Bypass cho đơn bán chịu quá hạn/vượt mức theo thẩm quyền.
- **Kế toán / Chủ hộ kinh doanh (Owner):** Thiết lập hạn mức tín dụng khách hàng, phê duyệt điều chỉnh nợ sai sót, duyệt xóa nợ xấu, xem báo cáo tuổi nợ và đối chiếu công nợ.

### 5. Tiêu Chí Thành Công Đo Được (Success Criteria)
- [x] Không còn tình trạng âm nợ hoặc sai lệch số dư công nợ khách hàng (100% khớp với tổng các hóa đơn nợ mở).
- [x] Thuật toán phân bổ thanh toán FIFO phân bổ chính xác 100% từng đồng vào các hóa đơn nợ cũ nhất.
- [x] 100% các đơn trả hàng mua chịu đều ưu tiên cấn trừ nợ trước khi cho phép xuất quỹ tiền mặt.
- [x] Đạt 100% tests pass (Unit & Integration tests) và Code Coverage $\ge 85\%$.
- [x] Hoàn thành đầy đủ 6 bước của quy trình SEP Kit và merge spec vào capability `customer-debt`.
