# Specs: homepage-trial-onboarding

Dependencies: `exploration.md`, `design-brief.md`

## API / Contract

| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `POST` | `/api/auth/register/send-otp` | Thông tin định danh đăng ký hiện có | Email được che, trạng thái gửi OTP | 400 dữ liệu sai; 409 trùng; 429 rate limit |
| `POST` | `/api/auth/register` | Thông tin Store Owner, gian hàng, mật khẩu, OTP | Phiên đăng nhập + user/tenant mới ở TRIAL | 400 OTP thiếu/sai/hết hạn; 409 dữ liệu trùng |
| `GET` | `/api/tenant/subscriptions/trial-status` | Không nhận tenant ID | `state`, `planCode`, `trialStartedAt`, `trialExpiresAt`, `destination` | 401, 403, 404 |
| `POST` | `/api/tenant/subscriptions/trial` | Body rỗng hoặc correlation `requestId`; không nhận PlanCode/số ngày/tenant ID | Trạng thái Trial và thời gian đã lưu | 401, 403, 404, 409 Trial không đủ điều kiện |

## ADDED Requirements

### Requirement: REQ-SUB-07 CTA dùng thử thống nhất trên HomePage

Tất cả CTA **Dùng thử miễn phí** trên HomePage MUST sử dụng cùng một luồng điều hướng theo trạng thái người dùng và MUST không báo kích hoạt thành công nếu backend chưa tạo hoặc cập nhật Trial thành công.

1. Khách chưa đăng nhập SHALL được chuyển tới `/auth/register?intent=trial`.
2. Store Owner đang có Trial còn hiệu lực SHALL được chuyển tới Dashboard.
3. Store Owner đã hết Trial, đã từng dùng Trial hoặc đang dùng STANDARD/PRO SHALL được chuyển tới trang quản lý gói.
4. Store Owner đủ điều kiện nhưng chưa kích hoạt Trial MAY được yêu cầu xác nhận trước khi backend kích hoạt.
5. Role không phải Store Owner MUST không được kích hoạt Trial cho tenant.
6. Navbar, Hero, CTA banner và các điểm gọi Trial khác MUST dùng cùng handler và cùng chính sách.
7. UI MUST thống nhất nội dung “Dùng thử miễn phí 3 ngày”, “Không cần thẻ” và “Không tự động gia hạn”; MUST loại bỏ nội dung 14 ngày và giá/gói cũ trong form Trial.

#### Scenario: Khách chưa đăng nhập bắt đầu dùng thử

- GIVEN người dùng chưa có phiên đăng nhập
- WHEN bấm bất kỳ CTA Dùng thử miễn phí nào trên HomePage
- THEN hệ thống SHALL chuyển tới `/auth/register?intent=trial`
- AND SHALL không hiển thị thông báo kích hoạt thành công trước khi đăng ký hoàn tất.

#### Scenario: Store Owner đang Trial quay lại HomePage

- GIVEN Store Owner đã đăng nhập và gói TRIAL còn hiệu lực
- WHEN bấm CTA Dùng thử
- THEN hệ thống SHALL chuyển tới Dashboard
- AND MUST không thay đổi `trialExpiresAt`.

#### Scenario: Tenant đã hết Trial hoặc đã trả phí

- GIVEN Store Owner đã đăng nhập và Trial đã hết, đã được sử dụng, hoặc tenant đang ở STANDARD/PRO
- WHEN bấm CTA Dùng thử
- THEN hệ thống SHALL chuyển tới trang quản lý gói
- AND MUST không gọi hành động cấp Trial mới.

#### Scenario: Không đọc được trạng thái

- GIVEN người dùng đã đăng nhập
- WHEN API trạng thái Trial lỗi hoặc timeout
- THEN UI MUST hiển thị lỗi có thể thử lại
- AND MUST không giả lập thành công hoặc tự suy đoán thời hạn Trial.

#### Scenario: Role không được phép

- GIVEN người dùng đăng nhập với role Staff hoặc SaaS Admin không sở hữu tenant
- WHEN cố gọi CTA hoặc endpoint kích hoạt Trial
- THEN Backend MUST từ chối với HTTP 403
- AND MUST không thay đổi tenant nào.

### Requirement: REQ-SUB-08 Đăng ký Trial bắt buộc Email OTP và tạo dữ liệu nguyên tử

Khi đăng ký với intent Trial, Backend MUST bắt buộc Email OTP hợp lệ và MUST tạo Store Owner, tenant, ánh xạ quyền, chi nhánh chính và trạng thái Trial trong một transaction nguyên tử.

1. OTP MUST tồn tại, đúng, còn TTL và chưa được sử dụng.
2. Không có OTP challenge hợp lệ MUST không được phép đăng ký.
3. Email sau OTP thành công MUST được đánh dấu đã xác minh.
4. Backend MUST tự gán `CurrentPlan = TRIAL`; frontend MUST không được quyết định PlanCode, thời hạn hoặc tenant ID.
5. Nếu bất kỳ bước tạo User/Tenant/Branch/quyền thất bại, transaction MUST rollback toàn bộ.
6. Sau thành công, hệ thống SHALL cấp phiên đăng nhập hợp lệ và điều hướng Store Owner tới Dashboard.
7. Request đăng ký lặp với cùng email/số điện thoại MUST không tạo thêm user, tenant hoặc branch.

#### Scenario: Đăng ký và OTP thành công

- GIVEN khách nhập thông tin hợp lệ và có Email OTP còn hiệu lực
- WHEN gửi đúng OTP để hoàn tất đăng ký
- THEN Backend MUST tạo đúng một Store Owner, một tenant và một chi nhánh chính trong cùng transaction
- AND tenant MUST bắt đầu gói TRIAL 3 ngày
- AND hệ thống SHALL cấp phiên đăng nhập rồi chuyển tới Dashboard.

#### Scenario: Thiếu OTP

- GIVEN khách chưa xác thực Email OTP
- WHEN gọi trực tiếp API đăng ký mà không có OTP
- THEN Backend MUST từ chối với HTTP 400 và mã `OTP_REQUIRED`
- AND MUST không tạo User, Tenant hoặc Branch.

#### Scenario: OTP sai hoặc hết hạn

- GIVEN OTP sai, hết TTL hoặc đã được sử dụng
- WHEN khách hoàn tất đăng ký
- THEN Backend MUST từ chối
- AND MUST giữ nguyên dữ liệu
- AND SHALL áp dụng giới hạn số lần thử theo chính sách OTP hiện có.

#### Scenario: Transaction đăng ký thất bại một phần

- GIVEN OTP hợp lệ
- WHEN việc tạo tenant hoặc chi nhánh phát sinh lỗi
- THEN transaction MUST rollback user, tenant, quyền và branch
- AND OTP/khả năng retry SHALL được xử lý nhất quán, không tạo bản ghi mồ côi.

#### Scenario: Gửi lặp đăng ký

- GIVEN một đăng ký đã hoàn tất với email hoặc số điện thoại đó
- WHEN client gửi lại request do retry mạng
- THEN Backend MUST không tạo tenant/branch/user thứ hai
- AND SHALL trả lỗi trùng hoặc kết quả idempotent theo contract đã xác định.

### Requirement: REQ-SUB-09 Vòng đời gói TRIAL duy nhất trong 3 ngày

Mỗi tenant MUST chỉ được sử dụng duy nhất một gói `TRIAL` kéo dài đúng 72 giờ kể từ thời điểm backend kích hoạt thành công.

1. Backend MUST lưu bền vững `TrialStartedAt` và `TrialExpiresAt`; `TrialExpiresAt = TrialStartedAt + 72 giờ`.
2. Thời gian MUST được tính và lưu UTC; frontend chỉ định dạng hiển thị theo Asia/Ho_Chi_Minh.
3. Trial MUST không yêu cầu thẻ, không tạo giao dịch ví, không thay đổi WalletBalance và không tự động gia hạn.
4. Khi nâng cấp STANDARD/PRO, lịch sử Trial MUST được giữ nguyên.
5. Tenant đã dùng hoặc hết Trial MUST không thể kích hoạt lại.
6. Tenant đang Trial gọi lại hành động kích hoạt MUST nhận lại cùng thời gian đã lưu, không cộng thêm ngày.
7. Hai request kích hoạt đồng thời MUST chỉ tạo một lần chuyển trạng thái.
8. Tenant hiện hữu khi migration MUST được backfill theo hướng không cấp Trial mới ngoài ý muốn.
9. Hết Trial MUST không xóa dữ liệu; hệ thống SHALL hướng Store Owner tới trang nâng cấp.

#### Scenario: Kích hoạt Trial lần đầu

- GIVEN Store Owner của tenant có email đã xác minh và tenant đủ điều kiện
- WHEN xác nhận kích hoạt Trial
- THEN Backend MUST đặt PlanCode `TRIAL`
- AND MUST lưu thời điểm hết hạn đúng 72 giờ sau thời điểm bắt đầu
- AND MUST không thay đổi số dư ví.

#### Scenario: Gọi lặp khi Trial đang hoạt động

- GIVEN tenant đang có Trial còn hiệu lực
- WHEN client gửi lại request kích hoạt với cùng hoặc khác requestId
- THEN Backend SHALL trả trạng thái ACTIVE với cùng `TrialStartedAt` và `TrialExpiresAt`
- AND MUST không kéo dài Trial.

#### Scenario: Kích hoạt lại sau khi hết hạn

- GIVEN tenant có `TrialStartedAt` và Trial đã hết hạn
- WHEN Store Owner gọi API kích hoạt
- THEN Backend MUST trả HTTP 409 với mã `TRIAL_ALREADY_USED`
- AND MUST không thay đổi ngày hết hạn.

#### Scenario: Tenant đang trả phí

- GIVEN tenant đang sử dụng STANDARD hoặc PRO
- WHEN gọi API kích hoạt Trial
- THEN Backend MUST trả HTTP 409 với mã `TRIAL_NOT_ELIGIBLE`
- AND MUST không hạ cấp tenant về TRIAL.

#### Scenario: Hai request đồng thời

- GIVEN tenant đủ điều kiện và chưa có `TrialStartedAt`
- WHEN hai request kích hoạt đến đồng thời
- THEN chỉ một request MUST ghi thời gian kích hoạt
- AND cả hai response thành công nếu có MUST tham chiếu cùng một khoảng Trial 72 giờ
- AND MUST không tạo hai audit event kích hoạt thành công.

#### Scenario: Truy cập tenant khác

- GIVEN Store Owner có phiên thuộc tenant A
- WHEN cố truyền hoặc giả mạo tenant B để đọc/kích hoạt Trial
- THEN Backend MUST bỏ qua tenant ID do client cung cấp hoặc từ chối HTTP 403
- AND MUST không tiết lộ hay sửa trạng thái tenant B.

### Requirement: REQ-SUB-10 Trạng thái Trial và audit an toàn

Backend MUST cung cấp trạng thái Trial đáng tin cậy cho chính tenant trong phiên và MUST ghi audit khi Trial được kích hoạt lần đầu.

1. Trạng thái SHALL là một trong `ELIGIBLE`, `ACTIVE`, `EXPIRED`, `PAID`.
2. Response MUST chứa destination phù hợp để frontend điều hướng nhưng frontend không được dùng destination thay cho kiểm soát quyền backend.
3. Audit log MUST gồm tenant, user, hành động, thời gian UTC, IP/correlation; MUST không ghi OTP, mật khẩu hoặc token.
4. Endpoint MUST truy vấn theo claim tenant và role, không nhận tenant ID tùy ý.
5. Trạng thái rỗng/mâu thuẫn MUST được xử lý theo hướng an toàn, không tự cấp Trial.

#### Scenario: Đọc trạng thái của chính tenant

- GIVEN Store Owner có phiên hợp lệ
- WHEN gọi API trial-status
- THEN Backend SHALL trả trạng thái chỉ của tenant trong claim
- AND SHALL trả thời gian Trial đã lưu nếu có.

#### Scenario: Dữ liệu trạng thái mâu thuẫn

- GIVEN tenant có dữ liệu legacy thiếu hoặc mâu thuẫn giữa CurrentPlan và thời gian Trial
- WHEN Backend xác định trạng thái
- THEN Backend MUST không trả ELIGIBLE nếu việc đó có thể cấp lại Trial
- AND SHALL trả trạng thái an toàn để người dùng tới trang quản lý gói.

#### Scenario: Audit kích hoạt

- GIVEN Trial được kích hoạt lần đầu thành công
- WHEN transaction commit
- THEN hệ thống MUST có đúng một audit event `TRIAL_ACTIVATED`
- AND event MUST không chứa OTP, mật khẩu hoặc token.

## MODIFIED Requirements

Không sửa giá, quota hoặc hành vi thanh toán của STANDARD/PRO trong change này.

## REMOVED Requirements

Không có.

## Acceptance checklist

- [ ] REQ-SUB-07: Mọi CTA HomePage dùng cùng handler và không còn modal/toast Trial giả.
- [ ] REQ-SUB-07: Nội dung toàn luồng thống nhất gói TRIAL 3 ngày, không cần thẻ, không tự gia hạn.
- [ ] REQ-SUB-08: API đăng ký bắt buộc Email OTP và tạo User/Tenant/Branch nguyên tử.
- [ ] REQ-SUB-08: Retry không tạo dữ liệu trùng hoặc mồ côi.
- [ ] REQ-SUB-09: Mỗi tenant chỉ có một Trial đúng 72 giờ, không trừ ví và không kéo dài khi gọi lặp.
- [ ] REQ-SUB-09: Concurrent requests và tenant isolation được kiểm thử.
- [ ] REQ-SUB-10: Trial status chỉ đọc tenant trong phiên và có audit không chứa dữ liệu nhạy cảm.
- [ ] Migration/backfill không cấp Trial mới cho tenant hiện hữu.
- [ ] Build frontend/backend và test unit/integration/UI đều PASS.
