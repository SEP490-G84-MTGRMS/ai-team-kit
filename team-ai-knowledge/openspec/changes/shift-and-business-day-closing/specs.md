# Specs: Chốt ca và chốt ngày kinh doanh

> Change: shift-and-business-day-closing  
> Capability: pos-shift-management  
> Schema: feature  
> Dependencies: exploration.md, design-brief.md, chot-ca-chot-doanh-thu-ngay.md

## API / Contract

| Method | Path | Request | Response | Lỗi chính |
|---|---|---|---|---|
| GET | /api/pos/shifts/{id}/closing-preview | Path shiftId | ShiftClosingPreview | 403, SHIFT_NOT_FOUND |
| POST | /api/pos/shifts/{id}/start-closing | Notes? | ShiftDetailResponse | SHIFT_NOT_OPEN, CONFLICT |
| POST | /api/pos/shifts/{id}/confirm-close | ActualCashCounted, RetainedFloatAmount, DroppedToSafeAmount, DiscrepancyReason?, DestinationFundId?, PreviewVersion | ShiftDetailResponse | INVALID_CASH_ALLOCATION, PENDING_CASH_MOVEMENTS, STALE_PREVIEW |
| POST | /api/pos/shifts/{id}/confirm-handover | Status, DisputeReason? | ShiftDetailResponse | INVALID_HANDOVER_STATE |
| GET | /api/business-days/current | branchId | BusinessDateResponse | BRANCH_NOT_FOUND, 403 |
| GET | /api/business-days/preview | branchId, businessDate | BusinessDayClosingPreview | INVALID_DATE, 403 |
| POST | /api/business-days/close | BranchId, BusinessDate, FundCounts[] { FundId, ActualCashCounted }, Note?, PreviewToken | BusinessDayClosingResponse | OPEN_SHIFTS_EXIST, PENDING_TRANSACTIONS, STALE_PREVIEW |
| GET | /api/business-days/{branchId}/{businessDate}/history | page, pageSize | Paged BusinessDayClosingVersion | 403 |
| POST | /api/business-days/{id}/reopen | Reason | BusinessDayClosingVersion | REASON_REQUIRED, ALREADY_REOPENED, 403 |

Mọi lỗi nghiệp vụ MUST trả ProblemDetails RFC 7807 có error code ổn định. Mọi command tài chính MUST dùng Idempotency-Key.

## ADDED Requirements

### Requirement: REQ-SBDC-01 Phân loại doanh thu, dòng tiền và chi phí

Hệ thống **MUST** tính và lưu riêng doanh thu bán hàng, tiền mặt trong két, thu/chi ngoài bán hàng, chi phí và chuyển quỹ. Phiếu chi vận hành đã duyệt và đã thực trả **MUST** làm giảm tiền két nhưng **MUST NOT** làm giảm doanh thu bán hàng. Thanh toán không dùng tiền mặt **SHALL** làm tăng doanh thu nhưng không tăng két tiền mặt.

#### Scenario: Phiếu chi làm giảm két nhưng không giảm doanh thu

- **GIVEN** ca có tiền đầu ca 2.000.000đ, doanh thu tiền mặt 5.000.000đ, doanh thu QR 3.000.000đ và phiếu chi mua đá đã hoàn tất 300.000đ
- **WHEN** hệ thống tạo preview chốt ca
- **THEN** doanh thu bán hàng là 8.000.000đ
- **AND** tiền dự kiến trong két là 6.700.000đ
- **AND** chi phí 300.000đ được hiển thị riêng, không bị trừ khỏi doanh thu

#### Scenario: Phiếu chi chưa duyệt không giảm két

- **GIVEN** phiếu chi 300.000đ đang PendingApproval, bị Rejected hoặc Cancelled
- **WHEN** hệ thống tính tiền dự kiến
- **THEN** khoản tiền đó MUST NOT được trừ khỏi két hoặc cộng vào chi phí đã hoàn tất

#### Scenario: Thanh toán QR không tăng két

- **GIVEN** một đơn hợp lệ thanh toán QR 1.000.000đ
- **WHEN** preview ca được tính
- **THEN** doanh thu tăng 1.000.000đ
- **AND** tiền mặt trong két không tăng

---

### Requirement: REQ-SBDC-02 Công thức và snapshot chốt ca

Backend **MUST** là nguồn tính toán duy nhất cho preview chốt ca:

Tiền dự kiến = Tiền đầu ca + tiền bán hàng thực thu bằng tiền mặt + thu khác đã hoàn tất − chi đã duyệt và thực trả − hoàn tiền mặt − tiền đã chuyển khỏi két trước kiểm đếm.

Chênh lệch = Tiền thực đếm − Tiền dự kiến.

#### Scenario: Tính tiền dự kiến đầy đủ

- **GIVEN** tiền đầu ca 2.000.000đ, bán hàng tiền mặt 5.000.000đ, thu khác 200.000đ, chi hoàn tất 300.000đ và hoàn tiền mặt 100.000đ
- **WHEN** gọi closing-preview
- **THEN** tiền dự kiến bằng 6.800.000đ
- **AND** response trả đầy đủ từng thành phần cấu thành

#### Scenario: Dữ liệu thay đổi sau preview

- **GIVEN** người dùng đã nhận preview version 10
- **AND** một phiếu chi được duyệt làm dữ liệu nguồn đổi sang version 11
- **WHEN** người dùng xác nhận đóng ca với preview version 10
- **THEN** backend MUST từ chối với STALE_PREVIEW và HTTP 409
- **AND** không khóa snapshot hoặc tạo chứng từ bàn giao

#### Scenario: Gửi lại cùng yêu cầu

- **GIVEN** confirm-close đã thành công với một Idempotency-Key
- **WHEN** client gửi lại cùng key và cùng payload
- **THEN** hệ thống trả cùng kết quả logic
- **AND** không tạo snapshot hoặc chứng từ chuyển quỹ thứ hai

---

### Requirement: REQ-SBDC-03 Validation toàn bộ trường chốt ca

Backend và frontend **MUST** áp dụng cùng quy tắc cho tiền thực đếm, mệnh giá, tiền giữ lại, tiền bàn giao, quỹ đích, lý do chênh lệch và ghi chú. Backend **MUST** kiểm tra lại dù frontend đã validation.

#### Scenario: Phân bổ tiền hợp lệ

- **GIVEN** tiền thực đếm là 6.900.000đ
- **WHEN** người dùng để lại 2.000.000đ và bàn giao 4.900.000đ
- **THEN** form cho phép xác nhận
- **AND** backend chấp nhận phân bổ

#### Scenario: Phân bổ không khớp

- **GIVEN** tiền thực đếm là 6.900.000đ
- **WHEN** tổng tiền giữ lại và bàn giao là 6.800.000đ
- **THEN** frontend MUST khóa nút xác nhận và hiển thị “Tổng tiền để lại và tiền bàn giao phải bằng tiền thực tế trong két”
- **AND** backend MUST từ chối INVALID_CASH_ALLOCATION nếu request vẫn được gửi

#### Scenario: Giá trị tiền không hợp lệ

- **GIVEN** một trường tiền âm, không hữu hạn, vượt giới hạn decimal(18,2) hoặc số lượng mệnh giá không phải số nguyên không âm
- **WHEN** người dùng nhập hoặc gửi request
- **THEN** frontend và backend MUST từ chối với thông báo đúng trường
- **AND** không thay đổi trạng thái ca

#### Scenario: Ghi chú quá dài

- **GIVEN** ghi chú hoặc lý do dài hơn 500 ký tự sau trim
- **WHEN** xác nhận
- **THEN** frontend và backend MUST từ chối

---

### Requirement: REQ-SBDC-04 Chênh lệch quỹ và lý do giải trình

Hệ thống **MUST** hiển thị chênh lệch thừa/thiếu riêng và **MUST NOT** tự chuyển chênh lệch thành doanh thu hoặc phiếu chi. Mọi chênh lệch khác 0 **MUST** yêu cầu thu ngân nhập lý do. Chỉ khi trị tuyệt đối của chênh lệch vượt ngưỡng cấu hình thì **MUST** yêu cầu quản lý phê duyệt trước khi hoàn tất.

#### Scenario: Thiếu quỹ

- **GIVEN** tiền dự kiến 6.900.000đ và thực đếm 6.850.000đ
- **WHEN** người dùng đóng ca
- **THEN** chênh lệch được lưu là -50.000đ
- **AND** doanh thu không đổi
- **AND** không tự tạo phiếu chi 50.000đ

#### Scenario: Thiếu lý do bắt buộc

- **GIVEN** chênh lệch thuộc trường hợp phải giải trình
- **WHEN** DiscrepancyReason rỗng hoặc chỉ có khoảng trắng
- **THEN** frontend MUST khóa nút xác nhận
- **AND** backend MUST từ chối với DISCREPANCY_REASON_REQUIRED

---

### Requirement: REQ-SBDC-05 Bàn giao tiền là chuyển quỹ nội bộ

Tiền nộp từ két ca về két chủ/két sắt **MUST** được ghi nhận là chuyển quỹ nội bộ, không phải doanh thu mới hoặc chi phí vận hành. Tổng tiền của chi nhánh **MUST** không đổi sau khi chuyển giữa hai quỹ.

#### Scenario: Nộp tiền về két chủ

- **GIVEN** tiền thực đếm 6.900.000đ và tiền để lại 2.000.000đ
- **WHEN** ca được đóng
- **THEN** 4.900.000đ được ghi là tiền bàn giao/chuyển quỹ
- **AND** két ca giảm 4.900.000đ
- **AND** két chủ hoặc tiền đang bàn giao tăng 4.900.000đ
- **AND** doanh thu, chi phí và tổng tiền chi nhánh không đổi

#### Scenario: Chưa xác nhận nhận tiền

- **GIVEN** tiền đã rời két ca nhưng quỹ đích chưa xác nhận
- **WHEN** xem đối soát
- **THEN** tiền nằm trong mục “Tiền đang bàn giao”
- **AND** không được cộng đồng thời vào cả két nguồn và két đích

#### Scenario: Không có tiền bàn giao

- **GIVEN** toàn bộ tiền thực đếm được để lại cho ca sau
- **WHEN** đóng ca
- **THEN** hệ thống không tạo chứng từ chuyển quỹ giá trị 0

---

### Requirement: REQ-SBDC-06 Ca nhiều nhân viên và người nhận ca optional

Một ca **MUST** thuộc tenant, chi nhánh, két và khoảng thời gian; ca **MUST NOT** bị giới hạn vào duy nhất người mở ca. Hệ thống **SHALL** tổng hợp participants từ giao dịch thực tế. ReceiverUserId **MUST** là optional khi đóng ca.

#### Scenario: Hai nhân viên bán trong một ca

- **GIVEN** nhân viên A mở ca và nhân viên B bán hàng trong cùng ca/chi nhánh theo quyền
- **WHEN** ca được preview hoặc đóng
- **THEN** toàn bộ đơn và giao dịch của A, B thuộc ShiftId được tổng hợp
- **AND** participants hiển thị cả A và B
- **AND** từng giao dịch vẫn truy vết đúng người thao tác

#### Scenario: Không biết người làm ca sau

- **GIVEN** chưa phân công người mở ca tiếp theo
- **WHEN** nhân viên đóng ca mà ReceiverUserId rỗng
- **THEN** frontend và backend MUST cho phép tiếp tục nếu các trường khác hợp lệ
- **AND** tiền giữ lại được gắn với két, không gắn bắt buộc với cá nhân

#### Scenario: Người ngoài tenant

- **GIVEN** user hoặc participant thuộc tenant khác
- **WHEN** truy cập hoặc tổng hợp ca
- **THEN** hệ thống MUST từ chối hoặc loại bỏ dữ liệu ngoài tenant
- **AND** không tiết lộ thông tin định danh

---

### Requirement: REQ-SBDC-07 BusinessDate nhất quán theo chi nhánh

Backend **MUST** xác định BusinessDate theo timezone Asia/Ho_Chi_Minh và BusinessDayStartTime của chi nhánh. Đơn hàng, ca, phiếu thu/chi và snapshot ngày **MUST** dùng BusinessDate đã lưu; frontend **MUST NOT** tự suy luận ngày từ openedAtUtc.

#### Scenario: Giao dịch sau nửa đêm

- **GIVEN** chi nhánh bắt đầu ngày kinh doanh lúc 06:00
- **WHEN** giao dịch phát sinh lúc 00:30 ngày 15/11/2026 theo giờ địa phương
- **THEN** BusinessDate là 14/11/2026

#### Scenario: Giao dịch sau giờ chuyển ngày

- **GIVEN** chi nhánh bắt đầu ngày kinh doanh lúc 06:00
- **WHEN** giao dịch phát sinh lúc 06:15 ngày 15/11/2026
- **THEN** BusinessDate là 15/11/2026

#### Scenario: Frontend hiển thị ca qua đêm

- **GIVEN** API trả BusinessDate 14/11/2026 cho ca mở trước nửa đêm và đóng sau nửa đêm
- **WHEN** frontend lọc danh sách chốt ngày
- **THEN** ca MUST nằm trong ngày 14/11/2026
- **AND** frontend không tính lại bằng openedAtUtc

---

### Requirement: REQ-SBDC-08 Preview và điều kiện chốt ngày

Hệ thống **SHALL** cung cấp preview chốt ngày gồm phạm vi thời gian, doanh thu theo phương thức, thu/chi ngoài bán hàng, chuyển quỹ, tiền đang bàn giao, số dư theo quỹ, chênh lệch và blockers. Hệ thống **MUST** xác thực lại blockers khi commit.

#### Scenario: Chốt ngày hợp lệ

- **GIVEN** mọi ca của BusinessDate đã đóng, snapshot khóa, bàn giao hợp lệ và không còn giao dịch bắt buộc xử lý
- **WHEN** STORE_OWNER xác nhận chốt ngày với preview version hiện tại
- **THEN** hệ thống tạo snapshot Closed
- **AND** trả mã tham chiếu, totals và thời gian chốt UTC

#### Scenario: Còn ca mở

- **GIVEN** BusinessDate còn một ca Open hoặc Closing
- **WHEN** xem preview hoặc gửi close
- **THEN** preview hiển thị blocker OPEN_SHIFTS_EXIST
- **AND** frontend khóa nút chốt
- **AND** backend từ chối nếu API bị gọi trực tiếp

#### Scenario: Còn giao dịch chưa hoàn tất

- **GIVEN** còn PendingPayment, PendingApproval, snapshot ca chưa khóa hoặc bàn giao bắt buộc chưa xác nhận
- **WHEN** chốt ngày
- **THEN** backend MUST từ chối với code tương ứng và không tạo snapshot ngày

#### Scenario: Sai quyền hoặc khác tenant

- **GIVEN** EMPLOYEE hoặc người dùng tenant khác
- **WHEN** preview hoặc chốt ngày
- **THEN** hệ thống MUST trả 403 hoặc 404 phù hợp
- **AND** không trả số liệu của chi nhánh

---

### Requirement: REQ-SBDC-09 Chốt ngày không ghi trùng giao dịch

Chốt ngày **MUST** tổng hợp giao dịch nguồn và **MUST NOT** posting lại doanh thu, thu/chi hoặc chuyển quỹ đã posting ở cấp ca. Chỉ giao dịch chưa từng posting, như đơn hợp lệ ngoài ca, mới được kết toán đúng một lần.

#### Scenario: Ca đã posting khi bàn giao

- **GIVEN** doanh thu và phiếu thu/chi của ca đã có CashbookPostingStatus Posted
- **WHEN** chốt ngày
- **THEN** hệ thống tổng hợp số liệu vào snapshot
- **AND** không tạo bút toán Cashbook trùng

#### Scenario: Đơn chủ bán ngoài ca chưa posting

- **GIVEN** một đơn ShiftId null thuộc BusinessDate, hợp lệ và chưa có BusinessDayClosingId
- **WHEN** chốt ngày
- **THEN** hệ thống posting đơn đúng một lần theo phương thức thanh toán
- **AND** gắn BusinessDayClosingId

#### Scenario: Retry chốt ngày

- **GIVEN** close-day đã thành công
- **WHEN** client retry cùng Idempotency-Key
- **THEN** không tạo snapshot, Cashbook entry hoặc reference thứ hai

---

### Requirement: REQ-SBDC-10 Khóa, mở lại và phiên bản snapshot ngày

Sau khi chốt ngày, giao dịch thuộc kỳ **MUST** bị khóa đối với thao tác thông thường. Mở lại **MUST** yêu cầu quyền, lý do và audit log. Snapshot cũ **MUST** bất biến; lần chốt lại **MUST** tạo version mới liên kết snapshot trước.

#### Scenario: Thêm phiếu vào ngày đã khóa

- **GIVEN** BusinessDate 14/11/2026 đã Closed
- **WHEN** người dùng thông thường tạo/sửa/xóa giao dịch thuộc ngày đó
- **THEN** backend MUST từ chối BUSINESS_DAY_LOCKED
- **AND** dữ liệu snapshot không đổi

#### Scenario: Mở lại hợp lệ

- **GIVEN** STORE_OWNER hoặc ADMIN có quyền và ngày đang Closed
- **WHEN** gửi yêu cầu reopen với lý do hợp lệ tối đa 500 ký tự
- **THEN** hệ thống lưu actor, UTC timestamp, reason và snapshot trước
- **AND** ngày chuyển trạng thái Reopened theo transaction

#### Scenario: Mở lại thiếu lý do

- **GIVEN** ngày đã Closed
- **WHEN** reason rỗng, chỉ có khoảng trắng hoặc quá 500 ký tự
- **THEN** frontend và backend MUST từ chối
- **AND** không thay đổi trạng thái

#### Scenario: Chốt lại sau điều chỉnh

- **GIVEN** version 1 đã được mở lại và chứng từ nguồn được điều chỉnh hợp lệ
- **WHEN** quản lý chốt lại
- **THEN** hệ thống tạo version 2 liên kết version 1
- **AND** version 1 vẫn xem được và không bị sửa đè

---

### Requirement: REQ-SBDC-11 Giao diện nghiệp vụ và validation trạng thái

Frontend **SHALL** chia màn hình chốt ca thành Kết quả bán hàng, Biến động tiền trong két, Kiểm đếm và Bàn giao; màn hình chốt ngày thành Doanh thu, Thu/chi ngoài bán hàng, Luân chuyển nội bộ và Đối soát theo quỹ. Frontend **MUST** xử lý loading, empty, error, conflict và success.

#### Scenario: Nhãn dễ hiểu

- **GIVEN** người dùng mở chốt ca
- **WHEN** giao diện hiển thị dữ liệu
- **THEN** không hiển thị G, H, Δ, Retained, Dropped, Pending Handover hoặc “Invariant violation”
- **AND** dùng nhãn tiếng Việt mô tả đúng nghiệp vụ

#### Scenario: Loading và gửi lặp

- **GIVEN** request confirm đang xử lý
- **WHEN** người dùng bấm lại nút xác nhận
- **THEN** nút MUST bị khóa
- **AND** không phát sinh request logic thứ hai

#### Scenario: Dữ liệu rỗng

- **GIVEN** ngày không có ca hoặc đơn hợp lệ
- **WHEN** xem preview chốt ngày
- **THEN** giao diện hiển thị trạng thái rỗng rõ ràng
- **AND** không tự coi dữ liệu rỗng là một ngày hợp lệ để chốt nếu backend không cho phép

#### Scenario: Conflict

- **GIVEN** backend trả HTTP 409 STALE_PREVIEW
- **WHEN** frontend nhận lỗi
- **THEN** hiển thị yêu cầu tải lại số liệu
- **AND** refetch preview trước khi cho xác nhận lại

---

### Requirement: REQ-SBDC-12 Unit test, isolation và tính toàn vẹn

Backend **MUST** có unit test cho công thức, validation, BusinessDate, blocker, idempotency, concurrency, role và tenant isolation. Frontend **MUST** có kiểm thử validation phù hợp với hạ tầng test hiện có và MUST vượt qua TypeScript build/lint.

#### Scenario: Unit test công thức doanh thu và két

- **GIVEN** test có cash sale, bank sale, cash in, expense, refund và transfer
- **WHEN** chạy unit test
- **THEN** doanh thu và expected cash khớp công thức độc lập
- **AND** expense không làm giảm revenue

#### Scenario: Test tenant isolation

- **GIVEN** dữ liệu ca/ngày thuộc tenant A
- **WHEN** service/repository được gọi trong context tenant B
- **THEN** kết quả không chứa dữ liệu tenant A
- **AND** command không thay đổi dữ liệu tenant A

#### Scenario: Build frontend

- **GIVEN** types, API và components đã thay đổi
- **WHEN** chạy build và lint theo dự án
- **THEN** không có lỗi TypeScript liên quan
- **AND** validation UI khớp error contract backend

## Quy tắc chuẩn hóa bắt buộc sau review

Các quy tắc dưới đây là normative và thay thế mọi cách diễn đạt mơ hồ trước đó.

### A. Nguồn và công thức doanh thu thuần

- Chỉ đơn ở trạng thái Completed và phần thanh toán/đặt cọc đã thực nhận mới được tính.
- Doanh thu thuần của đơn bằng tiền hàng sau giảm giá, trừ giá trị void, trả hàng toàn bộ hoặc một phần đã hoàn tất.
- Đơn void trước hoàn tất không tạo doanh thu hoặc dòng tiền.
- Refund làm giảm doanh thu theo giá trị hàng trả; quỹ chỉ giảm theo phương thức thực hoàn. Bán QR nhưng hoàn tiền mặt làm giảm doanh thu và giảm két tiền mặt, dù lần bán không tăng két.
- FinalAmount, discount, return lines, refund status và payment records là nguồn tính; không suy ra doanh thu từ số tiền còn trong két.

#### Scenario: Hoàn một phần khác phương thức
- **GIVEN** đơn QR 1.000.000đ đã Completed và khách trả hàng 200.000đ, cửa hàng hoàn 200.000đ từ két
- **WHEN** tính preview ca/ngày
- **THEN** doanh thu thuần còn 800.000đ
- **AND** két tiền mặt giảm 200.000đ
- **AND** không sửa ngược doanh thu QR đã nhận thành tiền mặt

### B. State machine phiếu tiền mặt

- PendingApproval: chưa duyệt, chưa giao/nhận tiền, không ảnh hưởng két.
- Recorded: tiền đã thực sự giao hoặc nhận; đây là trạng thái duy nhất ảnh hưởng két và chi phí/thu tương ứng.
- Rejected và Cancelled: không ảnh hưởng két.
- Với phiếu vượt hạn mức, thao tác approve và xác nhận giao tiền MUST diễn ra atomically để chuyển thẳng PendingApproval sang Recorded; không dùng trạng thái Approved chưa chi.
- Nếu nghiệp vụ cần tách duyệt và giao tiền trong tương lai thì phải tạo change riêng, không diễn giải Recorded là chỉ mới duyệt.

#### Scenario: Duyệt phiếu atomically
- **GIVEN** phiếu chi đang PendingApproval
- **WHEN** chủ duyệt và hệ thống chuyển thành Recorded trong transaction
- **THEN** tiền két giảm đúng một lần và RecordedAtUtc/ApprovedBy/ApprovedAtUtc được lưu
- **AND** transaction lỗi thì cả trạng thái và số két đều rollback

### C. Aggregate và state machine chuyển quỹ

- ShiftZReport handover với DroppedToSafeAmount là aggregate nguồn chuẩn cho chuyển tiền lúc chốt ca.
- ShiftCashMovement category CASH_DRAW chỉ dùng cho lần rút két chủ động khi ca còn Open; số đã rút trước kiểm đếm phải nằm trong TotalCashOut/TransferredOut và MUST NOT được tạo lại khi đóng ca.
- Mỗi lần chốt có tối đa một transfer document liên kết ClosingId duy nhất.
- PendingReceipt: tiền giảm khỏi quỹ nguồn và tăng vào quỹ trung gian “Tiền đang bàn giao”.
- Received: tiền giảm khỏi quỹ trung gian và tăng quỹ đích.
- Cancelled/Disputed: không sửa/xóa ledger cũ; tạo reversal đưa tiền từ quỹ trung gian về quỹ nguồn hoặc adjustment được phê duyệt.
- DestinationFundId MUST tồn tại, active, cùng tenant/branch, khác source fund; nếu chỉ có một quỹ hợp lệ frontend tự chọn read-only, nếu không có quỹ thì chặn DroppedToSafeAmount > 0.
- Người xác nhận Received MUST có quyền quản lý quỹ đích.

### D. Ma trận chốt ca, bàn giao và posting

| ShiftState | HandoverStatus | CashbookPostingStatus | Chốt ngày |
|---|---|---|---|
| Open hoặc Closing | bất kỳ | bất kỳ | Chặn |
| Closed | PendingReceipt | NotPosted | Chặn, trừ khi cấu hình AllowInTransitAcrossDay bật; khi bật phải tính vào quỹ trung gian |
| Closed | Received/CONFIRMED | Posted | Cho phép |
| ForceClosed | CONFIRMED | Posted | Cho phép |
| Closed/ForceClosed | DISPUTED | bất kỳ | Chặn |
| bất kỳ | bất kỳ | Failed/Partial | Chặn và yêu cầu recovery |

- Posting giao dịch ca và transfer Received MUST hoàn tất cùng transaction với CashbookPostingStatus hoặc qua outbox idempotent; không được nuốt exception rồi coi ca thành công.
- Chốt ngày chỉ tổng hợp ca Posted; không posting lại doanh thu, thu/chi hoặc transfer của ca.
- Chốt ngày chỉ posting phần đơn ngoài ca chưa từng posting.
- Route đóng ca legacy MUST bị deprecate hoặc gọi cùng application service/guards; không được bypass quy tắc mới.

### E. Contract kiểm đếm ngày theo quỹ

CloseBusinessDayRequest MUST chỉ dùng:

~~~text
FundCounts: [
  { FundId: Guid, ActualCashCounted: decimal }
]
~~~

- Không hỗ trợ song song tổng ActualCashCounted legacy trong UI mới.
- Preview trả Funds gồm FundId, FundType, FundName, ExpectedCash, RequiresPhysicalCount và IsInTransit.
- Mỗi FundId xuất hiện đúng một lần; quỹ phải active, cùng tenant/branch và thuộc preview token.
- Quỹ RequiresPhysicalCount bắt buộc có count; quỹ trung gian IsInTransit không nhập đếm vật lý hai lần và dùng expected amount làm actual cho tổng phạm vi.
- FundDiscrepancy = ActualCashCounted − ExpectedCash.
- TotalDiscrepancy bằng tổng FundDiscrepancy của các quỹ trong phạm vi; TotalActualCash do backend cộng.
- VND ở UI nhập số nguyên đồng không âm. Backend lưu decimal(18,2), scale phải bằng 0 cho input VND và MUST từ chối silent rounding, overflow hoặc tổng vượt giới hạn.

### F. PreviewToken và đồng thời

PreviewToken là chuỗi opaque/hash do backend tạo từ phiên bản của shift rows, order/payment/refund/return, movements, handovers, fund balances và BusinessDayClosing active version. Mọi mutation các nguồn trên MUST invalidate token. Confirm-close và close-day MUST kiểm tra token trong transaction với isolation/row locks phù hợp; mismatch trả HTTP 409 STALE_PREVIEW và không ghi một phần dữ liệu.

Idempotency record MUST có scope TenantId + ActorId + Method + Route + Key, request payload hash và kết quả. Cùng key khác payload trả HTTP 409. Record nghiệp vụ và idempotency MUST commit atomically.

### G. Tenant, branch và fund isolation

Mọi repository query/command của shift và business day MUST nhận TenantId từ ITenantContext và lọc TenantId + BranchId. Trước preview, close, history, reopen và transfer, hệ thống MUST xác minh branch/fund thuộc tenant và phạm vi actor. Tài nguyên khác tenant trả 404 để không tiết lộ sự tồn tại. ADMIN trong requirement này là tenant/system admin có quyền trên tenant đích; platform admin không tự động có quyền dữ liệu tenant nếu không impersonate/audit theo cơ chế hiện có.

### H. BusinessDate và khóa kỳ dùng chung

- ShiftCashMovement phát sinh trong ca kế thừa Shift.BusinessDate, kể cả ca bất thường kéo qua cutoff; giao dịch ngoài ca resolve theo occurred UTC và Branch.BusinessDayStartTime.
- Frontend luôn dùng BusinessDate backend trả.
- BusinessDayLockGuard MUST được gọi trước mọi create/update/delete/approve/cancel/post có BranchId + BusinessDate tại các luồng: order, payment, void, return/refund, preorder create/fulfill/cancel, debt collection, ShiftCashMovement, handover, direct Cashbook adjustment và background jobs tương ứng.
- Guard từ chối BUSINESS_DAY_LOCKED khi version active là Closed; chỉ cho phép adjustment được cấp quyền khi ngày Reopened.

### I. Reopen và ledger bất biến

Change này chọn mô hình reopen một bước có đặc quyền: STORE_OWNER có permission ReopenBusinessDay hoặc ADMIN trong tenant được tự mở lại; không có PendingReopenApproval và không yêu cầu người phê duyệt thứ hai. Audit MUST ghi rõ đây là self-authorized privileged action.

- Snapshot Closed cũ bất biến và chuyển Superseded/Reopened.
- Ledger entry đã posting không được sửa hoặc xóa.
- Điều chỉnh tăng/giảm tạo adjustment hoặc reversal liên kết OriginalEntryId, ClosingId, ClosingVersion, reason và idempotency key.
- Lần chốt lại tạo version tiếp theo và chỉ posting delta chưa posting.
- Unique index là TenantId + BranchId + BusinessDate + Version; transaction bảo đảm tối đa một active version.
- Audit append-only gồm tenant, branch, date, version, actor, UTC, reason, correlation/idempotency key, before/after hash và linked adjustment IDs.

#### Scenario: Điều chỉnh giảm sau reopen
- **GIVEN** version 1 đã posting thừa 200.000đ
- **WHEN** owner mở lại, tạo adjustment giảm và chốt version 2
- **THEN** entry version 1 vẫn bất biến
- **AND** có reversal/adjustment -200.000đ liên kết entry gốc
- **AND** retry không tạo adjustment thứ hai

### J. Participants và ca sau

Participant được upsert theo unique ShiftId + UserId khi user mở ca, tạo/hoàn tất đơn hoặc payment, tạo/duyệt movement, bắt đầu/hủy/hoàn tất đóng ca hoặc xác nhận handover. Chỉ login/xem màn hình không tạo participant.

Ca sau lấy RetainedFloatAmount làm OpeningFloatExpected; người mở ca sau nhập OpeningFloat thực đếm. Chênh lệch đầu ca được lưu ở ca sau và MUST NOT sửa snapshot ca trước.

### K. Giải trình và phê duyệt chênh lệch

- Mọi chênh lệch khác 0 yêu cầu DiscrepancyReason đã trim, tối đa 500 ký tự.
- Nếu trị tuyệt đối chênh lệch không vượt ngưỡng, thu ngân được hoàn tất với lý do.
- Nếu vượt ngưỡng, ca giữ Closing/PendingManagerApproval và chỉ STORE_OWNER/ADMIN trong tenant được phê duyệt.
- Phê duyệt, từ chối và retry MUST có audit/idempotency.

### L. Blocker và trải nghiệm frontend

Blocker DTO MUST có Code, EntityType, EntityId, DisplayName, Amount?, Status và ActionPath. UI hiển thị “Việc cần xử lý” cùng nút Xem/Xử lý.

Khi STALE_PREVIEW, frontend giữ draft local của tiền đếm, phân bổ, lý do và ghi chú; chỉ refetch số hệ thống, đánh dấu các giá trị bị ảnh hưởng và yêu cầu xác nhận lại. UI phải có focus lỗi đầu tiên, label/aria, keyboard navigation, format VND không đổi raw value và modal cuộn được trên màn hình POS thấp/tablet. Mỗi dòng tổng SHALL cho phép drill-down chứng từ cấu thành.


## MODIFIED Requirements

Không sửa nguyên văn requirement cũ trong change này; các requirement ADDED chuẩn hóa và mở rộng hành vi chốt ca/chốt ngày hiện có. Nếu review phát hiện requirement gốc xung đột, bước verify-spec MUST chuyển requirement tương ứng sang MODIFIED với toàn bộ nội dung mới.

## REMOVED Requirements

Không có.

## Acceptance checklist

- [ ] REQ-SBDC-01 Doanh thu, tiền két, chi phí và chuyển quỹ được tách đúng.
- [ ] REQ-SBDC-02 Backend cung cấp preview và chống stale/idempotency.
- [ ] REQ-SBDC-03 Mọi trường chốt ca được validation ở frontend/backend.
- [ ] REQ-SBDC-04 Chênh lệch có giải trình và không sửa doanh thu.
- [ ] REQ-SBDC-05 Bàn giao tiền là chuyển quỹ nội bộ.
- [ ] REQ-SBDC-06 Ca hỗ trợ nhiều nhân viên; receiver ca sau optional.
- [ ] REQ-SBDC-07 BusinessDate nhất quán cho ca qua đêm.
- [ ] REQ-SBDC-08 Chốt ngày có preview và blocker đầy đủ.
- [ ] REQ-SBDC-09 Chốt ngày không posting trùng.
- [ ] REQ-SBDC-10 Ngày khóa có reopen/version/audit.
- [ ] REQ-SBDC-11 UI dùng nhãn nghiệp vụ và đủ trạng thái.
- [ ] REQ-SBDC-12 Unit test, isolation, build và lint đạt.
