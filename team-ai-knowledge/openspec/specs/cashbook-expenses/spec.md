# Spec: cashbook-expenses

> Spec gốc của capability. Chỉ cập nhật qua `/sep-archive` (merge delta từ `openspec/changes/<change>/specs.md`).

## Requirements

### Requirement: REQ-CB-01 Quản lý Quỹ & Chống Âm Két Tiền Mặt
Hệ thống SHALL quản lý số dư độc lập cho từng tài khoản quỹ (`BranchCashTill`, `BranchSafe`, `CashInTransit`, `TenantBankAccount`). Trước khi thực hiện bất kỳ giao dịch giảm tiền nào từ Két quầy hoặc Két sắt, hệ thống MUST kiểm tra số dư tức thời bằng khóa bi quan `UPDLOCK, ROWLOCK` trong database transaction và MUST từ chối nếu số dư sau khi trừ nhỏ hơn 0.

#### Scenario: Xuất quỹ khi két tiền mặt đủ số dư
- **GIVEN** Két quầy `Till_01` có số dư hiện tại là 500.000 VNĐ.
- **WHEN** Thu ngân thực hiện phiếu chi 200.000 VNĐ.
- **THEN** Hệ thống trừ 200.000 VNĐ, số dư `Till_01` cập nhật thành 300.000 VNĐ, sinh 1 `CashbookEntry` loại `Payment` với `BalanceAfter = 300.000 VNĐ`.

#### Scenario: Chặn đứng khi két không đủ tiền mặt (EXC-01)
- **GIVEN** Két quầy `Till_01` có số dư hiện tại là 120.000 VNĐ.
- **WHEN** Thu ngân cố gắng chi 200.000 VNĐ.
- **THEN** Hệ thống MUST ném `InsufficientFundsException`, hủy bỏ transaction và giữ nguyên số dư 120.000 VNĐ.

---

### Requirement: REQ-CB-02 Quy trình Ca Thu Ngân & Chốt Ca Z-Report
Hệ thống SHALL yêu cầu thu ngân mở ca trước khi giao dịch. `OpeningFloat` MUST được tự điền từ `RetainedFloat` của ca trước trên cùng két. Khi chốt ca, hệ thống MUST tính toán `ExpectedCash` và `Discrepancy`. Nếu chênh lệch nằm trong dung sai $\le 2000$ VNĐ, hệ thống tự động ghi nhận; nếu thừa tiền MUST chuyển vào tài khoản treo `CASH_OVER_SUSPENSE`; nếu thiếu tiền MUST ghi giảm két ngay và treo ở `CASH_SHORTAGE_PENDING`.

#### Scenario: Mở ca kế thừa tiền lẻ ca trước
- **GIVEN** Ca trước trên `Till_01` đóng ca và giữ lại `RetainedFloat = 1.000.000 VNĐ`.
- **WHEN** Thu ngân mới mở ca trên `Till_01` và xác nhận đếm đủ 1.000.000 VNĐ.
- **THEN** Ca mới chuyển trạng thái `OPEN` với `OpeningFloat = 1.000.000 VNĐ` ở trạng thái `HELD_FLOAT`, không tính vào doanh thu bán hàng.

#### Scenario: Chốt ca thừa tiền lẻ ngoài dung sai
- **GIVEN** Ca làm việc có `OpeningFloat = 1.000.000 VNĐ`, thu tiền mặt trong ca là 2.000.000 VNĐ, chi 0 VNĐ (`ExpectedCash = 3.000.000 VNĐ`).
- **WHEN** Thu ngân đếm két thực tế là 3.030.000 VNĐ (thừa 30.000 VNĐ).
- **THEN** Hệ thống ghi tăng két thêm 30.000 VNĐ, đối ứng tài khoản `CASH_OVER_SUSPENSE`, ca chuyển sang `CLOSED`, không cộng 30.000 VNĐ này vào doanh thu hay P&L trước khi chủ duyệt.

---

### Requirement: REQ-CB-03 Nộp Tiền Ngân Hàng 2 Bước qua CashInTransit
Hệ thống SHALL xử lý lệnh nộp tiền ngân hàng qua 2 bước. Bước 1: Tiền xuất khỏi Két sắt chi nhánh MUST chuyển sang tài khoản trung gian `CashInTransit` và ghi nhận định danh người mang tiền (`CarrierUserId`). Bước 2: Số dư `TenantBankAccount` chỉ được phép tăng khi Chủ chuỗi xác nhận tiền đã vào app ngân hàng thực tế.

#### Scenario: Nộp tiền ngân hàng đủ số tiền
- **GIVEN** Két sắt chi nhánh có 20.000.000 VNĐ. Quản lý tạo lệnh nộp 20.000.000 VNĐ với người mang tiền `User_B`.
- **WHEN** Lệnh được tạo thành công.
- **THEN** Két sắt giảm còn 0 VNĐ, `CashInTransit` ghi nhận 20.000.000 VNĐ ở trạng thái `PENDING_BANK_CONFIRMATION`, số dư ngân hàng chưa tăng.
- **WHEN** Chủ chuỗi bấm "Xác nhận đã nhận đủ tiền".
- **THEN** `CashInTransit` chuyển sang `COMPLETED`, tài khoản ngân hàng tăng 20.000.000 VNĐ.

---

### Requirement: REQ-EXP-01 Vòng Đời Phiếu Chi Vận Hành & Tách Khâu Xuất Quỹ
Phiếu chi chi phí vận hành MUST trải qua các trạng thái: `DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `PAID`, `PAYMENT_FAILED`, `REVERSED`. Khi phiếu được duyệt (`APPROVED`), hệ thống SHALL KHÔNG tự động trừ tiền quỹ ngay mà chỉ trừ tiền khi thực hiện lệnh xuất quỹ `Disburse`. Nếu tại thời điểm xuất quỹ mà tài khoản chi không đủ tiền, phiếu MUST chuyển sang `PAYMENT_FAILED`.

#### Scenario: Xuất quỹ chi phí thất bại do hết tiền mặt
- **GIVEN** Phiếu chi tiền điện 800.000 VNĐ đã được Chủ chuỗi duyệt (`APPROVED`) nguồn chi là Két quầy `Till_01`.
- **WHEN** Thu ngân bấm xuất quỹ nhưng lúc này `Till_01` chỉ còn 500.000 VNĐ.
- **THEN** Hệ thống chặn xuất quỹ, chuyển phiếu sang `PAYMENT_FAILED`, gửi thông báo cho quản lý đổi sang nguồn chi Két sắt hoặc Ngân hàng.

---

### Requirement: REQ-EXP-02 Thuật Toán Chống Tách Nhỏ Hóa Đơn (Anti-Splitting)
Hệ thống SHALL tự động gộp các phiếu chi có cùng `(BranchId, Đối tượng thụ hưởng / Hạng mục, Ngày)` và so sánh với hạn mức tự duyệt $T1 = 500.000$ VNĐ. Nếu tổng vượt $T1$, phiếu làm vượt và các phiếu sau MUST chuyển sang `PENDING_APPROVAL`. Đồng thời, nếu 1 nhân viên tạo $\ge 3$ phiếu tự duyệt trong vòng 60 phút có giá trị $\ge 300.000$ VNĐ, hệ thống MUST gắn cờ nghi vấn và đẩy lên cấp quản lý duyệt.

#### Scenario: Phát hiện cố tình chia nhỏ hóa đơn
- **GIVEN** Thu ngân đã tạo phiếu chi mua túi ni-lông 400.000 VNĐ vào lúc 14:00 (đã duyệt).
- **WHEN** Cùng thu ngân đó tạo tiếp phiếu chi mua túi ni-lông 200.000 VNĐ vào lúc 14:15 cùng chi nhánh.
- **THEN** Tổng chi cùng đối tượng trong ngày đạt 600.000 VNĐ ($> 500.000$ VNĐ) $\rightarrow$ Phiếu 200.000 VNĐ MUST bị khóa tự duyệt và chuyển sang `PENDING_APPROVAL`.

---

### Requirement: REQ-SEC-01 Sổ Cái Bất Biến & Chuỗi Băm HMAC-SHA256
Bảng `CashbookEntries` MUST là tập hợp chỉ thêm mới (Append-Only). Hệ thống MUST từ chối mọi thao tác `UPDATE` hoặc `DELETE` trên bảng này. Mỗi bản ghi phát sinh MUST được tính toán mã băm kiểm toán:
$$\text{Hash}_n = \text{HMAC\_SHA256}(\text{SecretKey}, \text{Hash}_{n-1} + \text{CanonicalData})$$

#### Scenario: Bắt quả tang can thiệp sửa trực tiếp dữ liệu
- **GIVEN** Chuỗi bản ghi sổ quỹ đang có mã băm toàn vẹn.
- **WHEN** Một tác nhân can thiệp trực tiếp vào database SQL Server sửa cột `Amount` của bản ghi số 5.
- **THEN** Job kiểm tra toàn vẹn phát hiện mã băm của bản ghi số 5 và các bản ghi tiếp theo bị đứt gãy, hệ thống lập tức phát cảnh báo đỏ cho Chủ chuỗi.

---

### Requirement: REQ-SEC-02 Chống Trùng Lặp Idempotency-Key
Mọi API làm biến động tài sản MUST yêu cầu Header `Idempotency-Key` (UUIDv4). Nếu nhận cùng khóa và cùng payload trong vòng 24 giờ, hệ thống MUST trả về kết quả đã xử lý trước đó mà không sinh giao dịch mới. Nếu cùng khóa nhưng khác payload, hệ thống MUST trả về mã lỗi `409 Conflict`.

#### Scenario: Click đúp khi xác nhận chi tiền
- **GIVEN** Thu ngân gửi request chi tiền với `Idempotency-Key: e1a8...`
- **WHEN** Do mạng lag, thu ngân bấm tiếp nút chi lần thứ 2 với cùng `Idempotency-Key` và cùng payload.
- **THEN** Request thứ 2 được nhận diện trùng lặp, hệ thống trả về kết quả thành công của request 1, số dư két chỉ bị trừ đúng 1 lần.

---

## Lịch sử
- 2026-10-26 · `be07-17-cashbook-and-service-expenses` · +7 ~0 -0
