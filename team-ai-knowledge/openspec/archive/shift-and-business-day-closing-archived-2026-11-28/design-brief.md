# Design Brief: Chốt ca và chốt ngày kinh doanh

> Change: shift-and-business-day-closing  
> Capability: pos-shift-management  
> Dependencies: proposal.md, exploration.md, chot-ca-chot-doanh-thu-ngay.md

## 1. Phương án thiết kế

Mở rộng các luồng ShiftService, BusinessDayClosingService, CloseShiftModal và PosShiftPage hiện có. Backend là nguồn duy nhất xác định BusinessDate, công thức tiền két và trạng thái có được chốt hay không. Frontend chỉ hiển thị dữ liệu tổng hợp từ API và validation sớm theo cùng hợp đồng.

Nguồn ghi Cashbook được phân định:

- Giao dịch thuộc ca đã được posting khi xác nhận bàn giao thì chốt ngày chỉ tổng hợp, không posting lại.
- Đơn do chủ bán ngoài ca chưa posting được kết toán một lần tại chốt ngày.
- Tiền nộp từ két ca về két chủ là chuyển quỹ nội bộ có nguồn SHIFT_HANDOVER, không phải EXPENSE.
- Phiếu thu/chi đã posting giữ nguyên nguồn chứng từ, không được tổng hợp thành bút toán trùng.

## 2. Luồng người dùng

### 2.1. Nhân viên đóng ca

1. Nhân viên mở modal “Chốt ca & bàn giao tiền”.
2. Frontend tải snapshot mới nhất gồm BusinessDate, doanh thu theo phương thức, thu/chi đã hoàn tất, pending movements, participants và tiền dự kiến.
3. Nhân viên bấm “Bắt đầu kiểm đếm”; backend chuyển ca từ Open sang Closing.
4. Nhân viên nhập tiền thực đếm hoặc số lượng theo mệnh giá.
5. Giao diện tự tính chênh lệch, đề xuất tiền giữ lại và phần chuyển về két chủ.
6. Nếu chênh lệch khác 0 hoặc vượt ngưỡng cấu hình, giao diện yêu cầu lý do/phê duyệt phù hợp.
7. Nhân viên xác nhận; backend kiểm tra lại toàn bộ trạng thái trong transaction, khóa snapshot và tạo chứng từ bàn giao/chuyển quỹ duy nhất.
8. Ca chuyển Closed hoặc PendingHandover theo chính sách hiện hữu; người/quỹ đích xác nhận nhận tiền nếu được cấu hình.
9. Ca sau mở mới sẽ nhận đề xuất tiền đầu ca từ số giữ lại, không phụ thuộc một người nhận đã nhập trước.

### 2.2. Quản lý chốt ngày kinh doanh

1. Quản lý chọn chi nhánh và BusinessDate.
2. Frontend gọi API preview; backend trả phạm vi thời gian, tổng doanh thu, thu/chi, chuyển quỹ, tiền theo từng quỹ và danh sách blocker.
3. Nếu còn blocker, nút chốt bị khóa và hiển thị liên kết tới ca/giao dịch cần xử lý.
4. Quản lý nhập tiền thực đếm theo quỹ được yêu cầu và ghi chú nếu có.
5. Backend xác thực lại trong transaction, tạo snapshot phiên bản mới và khóa ngày.
6. Frontend hiển thị mã chốt ngày, số liệu đã khóa và trạng thái thành công; không thông báo rằng đã “tạo phiếu thu/chi” cho các giao dịch vốn đã tồn tại.

### 2.3. Mở lại/điều chỉnh ngày đã khóa

1. Chủ cửa hàng/Admin chọn snapshot đã chốt và yêu cầu mở lại.
2. Bắt buộc nhập lý do; hệ thống lưu người yêu cầu/phê duyệt và số liệu trước mở lại.
3. Snapshot cũ chuyển Superseded hoặc Reopened nhưng bất biến.
4. Sau điều chỉnh chứng từ nguồn, quản lý chốt lại để tạo snapshot version kế tiếp.
5. Lịch sử hiển thị được mọi version, người thao tác, lý do và chênh lệch trước/sau.

## 3. Frontend

### 3.1. Components

#### CloseShiftModal.tsx

Chia thành bốn khối:

1. **Kết quả bán hàng**
   - Doanh thu thuần.
   - Tiền mặt.
   - QR/chuyển khoản.
   - Số đơn.

2. **Biến động tiền trong két**
   - Tiền đầu ca.
   - Tiền bán hàng thu bằng tiền mặt.
   - Thu khác đã hoàn tất.
   - Chi vận hành đã duyệt và thực trả.
   - Hoàn tiền mặt.
   - Chuyển ra khỏi két trước kiểm đếm.
   - Tiền hệ thống dự kiến.

3. **Kiểm đếm**
   - Chế độ nhập nhanh hoặc mệnh giá.
   - Tiền thực đếm.
   - Chênh lệch.
   - Lý do chênh lệch khi bắt buộc.

4. **Bàn giao**
   - Tiền để lại cho ca sau.
   - Tiền chuyển về két chủ/két sắt, tự tính mặc định.
   - Quỹ đích nếu có nhiều két chủ.
   - Không bắt buộc “người nhận ca tiếp theo”.
   - Danh sách nhân viên hoạt động trong ca chỉ đọc.

Không hiển thị G, H, Δ, “Invariant violation”, Retained, Dropped hoặc Pending Handover trong nội dung cho người dùng.

#### PosShiftPage.tsx và khối chốt ngày

- Dùng BusinessDate từ API, không tự tính từ openedAtUtc.
- Hiển thị preview theo ba khối: Doanh thu; Thu/chi ngoài bán hàng; Đối soát quỹ.
- Hiển thị “Luân chuyển nội bộ” và “Tiền đang bàn giao” riêng.
- Hiển thị blocker theo từng ca/chứng từ.
- Có lịch sử phiên bản chốt ngày và dialog yêu cầu mở lại.

#### Types/API

Bổ sung DTO/type cho:

- ShiftClosingPreview.
- BusinessDayClosingPreview.
- BusinessDayClosingResponse đầy đủ.
- BusinessDayClosingVersion và ReopenBusinessDayRequest.
- BusinessDate trên shift response.
- DestinationFundId hoặc quỹ nhận trên request bàn giao nếu hệ thống có nhiều quỹ.

### 3.2. Validation frontend

| Trường | Quy tắc |
|---|---|
| Tiền thực đếm | Bắt buộc, hữu hạn, không âm, tối đa giới hạn decimal(18,2); VND UI chỉ nhận số nguyên nếu chính sách không dùng xu |
| Số lượng mệnh giá | Số nguyên không âm, có giới hạn an toàn |
| Tiền để lại | Bắt buộc, không âm, không vượt tiền thực đếm |
| Tiền bàn giao | Không âm; tổng với tiền để lại bằng tiền thực đếm |
| Quỹ đích | Bắt buộc khi tiền bàn giao > 0 và có nhiều quỹ đích |
| Người nhận ca sau | Không bắt buộc |
| Lý do chênh lệch | Bắt buộc khi chênh lệch khác 0 hoặc vượt ngưỡng; trim; tối đa 500 ký tự |
| Ghi chú | Không bắt buộc; trim; tối đa 500 ký tự |
| Lý do mở lại | Bắt buộc; trim; tối đa 500 ký tự |
| BranchId | GUID hợp lệ và thuộc phạm vi người dùng |
| BusinessDate | ISO YYYY-MM-DD, không nằm ngoài phạm vi chính sách |
| Idempotency-Key | UUIDv7 mới cho một thao tác logic; giữ lại cùng key khi retry cùng request |

Nút xác nhận bị disable khi loading, dữ liệu không hợp lệ, có blocker hoặc ca/ngày đã thay đổi phiên bản.

### 3.3. Trạng thái UI

- **Loading**: skeleton/spinner cho preview; khóa nút gửi.
- **Empty**: ngày không có ca/đơn hiển thị rõ “Không có dữ liệu để chốt”, không giả định tổng bằng 0 là hợp lệ.
- **Error**: hiển thị ProblemDetails/code từ backend bằng thông báo nghiệp vụ tiếng Việt.
- **Conflict**: HTTP 409 yêu cầu tải lại preview vì ca/chứng từ vừa thay đổi.
- **Success**: toast ngắn, đóng modal và refetch shift/day.
- **Unauthorized/Forbidden**: 401/403 và không hiển thị hành động không có quyền.

## 4. API / Application

### 4.1. Shift endpoints

| Method | Path | Mục đích |
|---|---|---|
| GET | /api/pos/shifts/{id}/closing-preview | Trả snapshot tính toán mới nhất và blockers |
| POST | /api/pos/shifts/{id}/start-closing | Khóa phát sinh mới, chuyển Closing |
| POST | /api/pos/shifts/{id}/cancel-closing | Hủy kiểm đếm có lý do |
| POST | /api/pos/shifts/{id}/confirm-close | Xác nhận kiểm đếm, phân bổ và khóa snapshot |
| POST | /api/pos/shifts/{id}/confirm-handover | Xác nhận quỹ đích/người nhận đã nhận |

ConfirmCloseShiftRequest giữ các trường tiền hiện hữu, làm ReceiverUserId optional, bổ sung DiscrepancyReason, DestinationFundId khi cần và PreviewVersion/concurrency token.

Backend xác thực:

- Ca thuộc tenant/branch của người dùng.
- Trạng thái ca hợp lệ.
- Mọi số tiền hữu hạn, trong giới hạn decimal và không âm.
- Phân bổ khớp tiền thực đếm.
- Không còn pending movement.
- Preview version chưa thay đổi.
- Lý do chênh lệch/đóng sớm muộn theo chính sách.
- Không tạo lại chứng từ bàn giao khi retry.

### 4.2. Business-day endpoints

| Method | Path | Mục đích |
|---|---|---|
| GET | /api/business-days/preview?branchId=&businessDate= | Tổng hợp số liệu và blockers |
| POST | /api/business-days/close | Tạo snapshot và khóa ngày |
| GET | /api/business-days/{branchId}/{businessDate}/history | Danh sách version snapshot |
| POST | /api/business-days/{id}/reopen | Mở lại ngày có lý do và quyền |
| GET | /api/business-days/current?branchId= | Trả BusinessDate hiện tại theo cấu hình chi nhánh |

CloseBusinessDayRequest dùng số thực đếm theo quỹ hoặc tổng tương thích hiện trạng, thêm PreviewVersion để phát hiện dữ liệu thay đổi. Mọi lỗi nghiệp vụ trả ProblemDetails RFC 7807 với code ổn định.

## 5. Domain và dữ liệu

### 5.1. Tái sử dụng

- ShiftZReport.BusinessDate, SnapshotLocked, CashbookPostingStatus.
- ShiftCashMovement và trạng thái approval/posting.
- ShiftParticipant, ShiftCloseConfirmation.
- BusinessDayClosing.
- Branch.BusinessDayStartTime.
- BusinessDateResolver.

### 5.2. Thay đổi dự kiến

#### ShiftZReport

- Đảm bảo response có BusinessDate.
- Lưu DiscrepancyReason riêng thay vì trộn trong notes.
- Lưu ClosingVersion hoặc concurrency token.
- ReceiverUserId tiếp tục nullable.
- Nếu bàn giao tới quỹ cụ thể, lưu DestinationFundId.

#### BusinessDayClosing

Bổ sung:

- Version — số phiên bản theo branch/date.
- SupersedesClosingId — snapshot trước.
- ReopenedAtUtc, ReopenedByUserId, ReopenReason.
- Tổng doanh thu thuần, hoàn tiền, tiền đang bàn giao và breakdown quỹ nếu dữ liệu nguồn hỗ trợ.
- PreviewVersion hoặc checksum nguồn.
- Unique index TenantId + BranchId + BusinessDate + Version.
- Chỉ một version active/closed tại một thời điểm bằng constraint hoặc transaction check.

#### Audit

Tái sử dụng audit infrastructure hiện có nếu đủ trường. Nếu không, bổ sung record audit cho hành động BUSINESS_DAY_REOPEN chứa actor, approver, reason, before snapshot, after reference và UTC timestamp.

### 5.3. Migration

Tạo migration mới, không chỉnh migration đã merge. Trường mới nullable/default phù hợp để đọc dữ liệu lịch sử. Backfill Version = 1 cho snapshot hiện tại.

## 6. Quy tắc nghiệp vụ

~~~text
Doanh thu thuần
= Doanh thu gộp
− Giảm giá bán hàng
− Giá trị hoàn/trả hợp lệ
~~~

~~~text
Tiền dự kiến trong két ca
= Tiền đầu ca
+ Tiền bán hàng thực thu bằng tiền mặt
+ Thu tiền mặt khác đã hoàn tất
− Chi tiền mặt đã duyệt và đã thực trả
− Hoàn tiền mặt cho khách
− Tiền đã chuyển khỏi két trước kiểm đếm
~~~

~~~text
Chênh lệch = Tiền thực đếm − Tiền dự kiến
~~~

~~~text
Tiền thực đếm = Tiền để lại cho ca sau + Tiền bàn giao
~~~

- Chi phí không làm giảm doanh thu.
- Chuyển quỹ không phải doanh thu hoặc chi phí.
- QR/chuyển khoản làm tăng doanh thu nhưng không tăng két tiền mặt.
- Pending/rejected/cancelled movement không làm thay đổi số dự kiến.
- BusinessDate do backend tính theo giờ địa phương và thời điểm bắt đầu ngày của chi nhánh.
- Chốt ngày tổng hợp dữ liệu gốc và không posting lại giao dịch đã posting.
- Snapshot đã khóa bất biến; điều chỉnh tạo version mới.

## 7. Phân quyền và isolation

| Hành động | EMPLOYEE/CASHIER | STORE_OWNER | ADMIN |
|---|:---:|:---:|:---:|
| Xem/đóng ca đang tham gia | Có theo chi nhánh/quyền | Có | Có |
| Force-close ca người khác | Không | Có trong tenant/branch | Có theo phạm vi |
| Xác nhận nhận tiền két chủ | Không mặc định | Có | Có |
| Preview chốt ngày | Không | Có | Có |
| Chốt ngày | Không | Có | Có |
| Mở lại ngày | Không | Có với quyền nâng cao | Có |
| Xem audit/history | Theo quyền | Có | Có |

Repository luôn lọc TenantId; BranchId phải thuộc tenant và phạm vi người dùng. Không tin TenantId từ request.

## 8. Concurrency và idempotency

- Mọi command tài chính yêu cầu Idempotency-Key.
- Confirm-close và close-day chạy transaction.
- Preview trả version/checksum; command từ chối với 409 nếu dữ liệu nguồn thay đổi.
- Unique constraint bảo vệ một snapshot/version và một chứng từ bàn giao.
- Duyệt phiếu chi đồng thời với đóng ca cho kết quả tuần tự: hoặc phiếu được tính và preview đổi version, hoặc đóng ca bị từ chối để tải lại.

## 9. Kiểm thử

### Backend unit tests

- Công thức expected cash với cash sale, bank sale, cash in/out, refund và transfer.
- Expense giảm két nhưng không giảm revenue.
- Pending/rejected/cancelled movement không giảm két.
- Allocation đúng/sai và trường âm/quá giới hạn.
- Receiver ca sau optional.
- Discrepancy reason.
- BusinessDate trước/sau giờ cutoff.
- Blocker chốt ngày.
- Không posting trùng.
- Retry cùng idempotency key.
- Concurrency conflict.
- Reopen/reclose tạo version và giữ snapshot cũ.
- Role, tenant và branch isolation.

### Frontend tests/build

- Validation từng trường và thông báo tiếng Việt.
- Disable submit theo blocker/loading/conflict.
- Không bắt receiver ca sau.
- Dùng BusinessDate từ backend.
- Breakdown doanh thu không bị trừ expense.
- Build TypeScript và lint liên quan.
