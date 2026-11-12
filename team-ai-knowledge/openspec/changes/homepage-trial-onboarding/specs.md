# Specs: homepage-trial-onboarding

Dependencies: `exploration.md`, `design-brief.md`

## API / Contract

| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `POST` | `/api/auth/register/send-otp` | Thông tin đăng ký hiện có | Email che và trạng thái gửi | 400, 409, 429 |
| `POST` | `/api/auth/register` | Thông tin đăng ký, OTP, `startTrial` | Phiên + tenant `NO_PLAN` hoặc `TRIAL` | 400 OTP; 409 trùng/đã dùng Trial |
| `GET` | `/api/tenant/subscriptions/trial-status` | Không nhận tenant ID | State và thời gian Trial | 401, 403, 404 |
| `POST` | `/api/tenant/subscriptions/trial` | Body rỗng/correlation; không nhận PlanCode/số ngày/tenant ID | Trial ACTIVE hoặc conflict | 401, 403, 404, 409 |

## ADDED Requirements

### Requirement: REQ-SUB-07 CTA Trial và đăng ký thường là hai ý định khác nhau

Hệ thống SHALL phân biệt đăng ký gian hàng thông thường với đăng ký từ CTA dùng thử, nhưng MUST dùng chung validation, Email OTP và cơ chế tạo tài khoản an toàn.

1. CTA Trial trên Navbar, Hero, CTA banner và các điểm HomePage MUST dẫn tới `/auth/register?intent=trial`.
2. Đăng ký trực tiếp tại `/auth/register` MUST không tự bắt đầu Trial.
3. Query `intent=trial` chỉ điều khiển UI; backend MUST tự kiểm tra eligibility và tự quyết định PlanCode/thời hạn.
4. UI MUST thống nhất nội dung “Dùng thử miễn phí 3 ngày”, “Không cần thẻ”, “Không tự động gia hạn”; MUST loại bỏ nội dung 14 ngày/form giả.
5. Frontend MUST không báo thành công nếu backend chưa commit đăng ký/Trial.

#### Scenario: Đăng ký thông thường

- GIVEN khách mở `/auth/register` không có intent Trial
- WHEN hoàn tất Email OTP và đăng ký thành công
- THEN hệ thống MUST tạo tenant `NO_PLAN`
- AND MUST không ghi `TrialStartedAt`, `TrialExpiresAt` hoặc dấu Trial của account
- AND SHALL chuyển tới trang chọn gói.

#### Scenario: Đăng ký từ CTA dùng thử

- GIVEN khách bấm CTA Dùng thử và tới `/auth/register?intent=trial`
- WHEN hoàn tất Email OTP và đăng ký thành công
- THEN Backend MUST tạo tenant với gói `TRIAL` đúng 72 giờ
- AND SHALL chuyển tới Dashboard.

#### Scenario: API đăng ký Trial lỗi

- GIVEN khách đăng ký từ CTA
- WHEN API lỗi hoặc transaction rollback
- THEN UI MUST hiển thị lỗi có thể thử lại
- AND MUST không hiển thị toast kích hoạt thành công giả.

### Requirement: REQ-SUB-08 Đăng ký bắt buộc OTP và tạo dữ liệu nguyên tử

Backend MUST bắt buộc Email OTP hợp lệ và MUST tạo User, Tenant, ánh xạ Store Owner, Branch cùng trạng thái subscription được chọn trong một transaction.

1. OTP MUST tồn tại, đúng, còn TTL và chưa dùng.
2. Thiếu OTP challenge hợp lệ MUST bị từ chối.
3. Email MUST được đánh dấu xác minh sau OTP thành công.
4. `startTrial=false` hoặc thiếu MUST tạo `NO_PLAN`; `startTrial=true` MAY tạo `TRIAL` chỉ khi account/tenant đủ điều kiện.
5. Backend MUST không nhận PlanCode, số ngày hoặc tenant ID do client quyết định.
6. Lỗi bất kỳ bước nào MUST rollback toàn bộ.
7. Retry/trùng email hoặc số điện thoại MUST không tạo user/tenant/branch thứ hai.

#### Scenario: Thiếu OTP

- GIVEN khách chưa xác thực OTP
- WHEN gọi API đăng ký
- THEN Backend MUST trả HTTP 400 mã `OTP_REQUIRED`
- AND MUST không tạo dữ liệu.

#### Scenario: OTP sai hoặc hết hạn

- GIVEN OTP sai, hết TTL hoặc đã sử dụng
- WHEN hoàn tất đăng ký
- THEN Backend MUST từ chối và giữ nguyên dữ liệu
- AND SHALL áp dụng giới hạn thử OTP hiện có.

#### Scenario: Transaction lỗi một phần

- GIVEN OTP hợp lệ
- WHEN tạo tenant, quyền hoặc branch thất bại
- THEN transaction MUST rollback User, Tenant, mapping, Branch và Trial
- AND MUST không để dữ liệu mồ côi.

#### Scenario: Hai request đăng ký đồng thời

- GIVEN cùng email hoặc số điện thoại gửi hai request đăng ký
- WHEN Backend xử lý đồng thời
- THEN chỉ một User, Tenant và Branch MUST được tạo
- AND nếu có Trial thì chỉ một khoảng Trial được ghi.

### Requirement: REQ-SUB-09 Một account và một tenant chỉ được Trial một lần

Backend MUST giới hạn Trial một lần duy nhất theo cả tài khoản và tenant.

1. Account MUST có dấu bền vững `TrialConsumedAt`.
2. Tenant MUST lưu `TrialStartedAt` và `TrialExpiresAt`.
3. Trial chỉ được bắt đầu khi account chưa có `TrialConsumedAt`, tenant chưa có `TrialStartedAt`, tenant đang `NO_PLAN`, email đã xác minh.
4. Khi bắt đầu, backend MUST ghi account và tenant trong cùng transaction.
5. `TrialExpiresAt` MUST bằng `TrialStartedAt + 72 giờ`, tính UTC.
6. Account đã dùng Trial MUST không nhận Trial qua tenant khác.
7. Tenant đã dùng Trial MUST không nhận Trial qua account khác.
8. Request lặp khi ACTIVE MUST trả cùng thời gian, không cộng ngày.
9. Trial MUST không yêu cầu thẻ, không trừ ví, không tạo WalletTransaction và không tự gia hạn.
10. Nâng cấp STANDARD/PRO MUST giữ dấu lịch sử Trial.

#### Scenario: Tenant NO_PLAN tự bắt đầu Trial

- GIVEN Store Owner có email xác minh, account chưa dùng Trial và tenant NO_PLAN chưa dùng Trial
- WHEN bấm “Bắt đầu dùng thử 3 ngày”
- THEN Backend MUST ghi Trial trên account và tenant
- AND MUST cấp gói `TRIAL` đúng 72 giờ
- AND MUST không thay đổi WalletBalance.

#### Scenario: Account đã dùng Trial trên tenant khác

- GIVEN account đã có `TrialConsumedAt`
- WHEN cố kích hoạt Trial cho tenant khác
- THEN Backend MUST trả HTTP 409 mã `TRIAL_ALREADY_USED`
- AND MUST không sửa tenant.

#### Scenario: Tenant đã dùng Trial

- GIVEN tenant đã có `TrialStartedAt`
- WHEN một account khác cố kích hoạt Trial cho tenant đó
- THEN Backend MUST từ chối
- AND MUST không đặt lại thời gian.

#### Scenario: Request lặp khi Trial ACTIVE

- GIVEN Trial đang hoạt động
- WHEN client gửi lại request kích hoạt
- THEN Backend SHALL trả cùng `TrialStartedAt` và `TrialExpiresAt`
- AND MUST không kéo dài Trial hoặc tạo audit thứ hai.

#### Scenario: Hai request kích hoạt đồng thời

- GIVEN account và tenant đủ điều kiện
- WHEN hai request kích hoạt đến đồng thời
- THEN chỉ một transaction MUST ghi Trial
- AND kết quả thành công nếu có MUST tham chiếu cùng một khoảng 72 giờ.

#### Scenario: Tenant đang trả phí hoặc Trial đã hết

- GIVEN tenant đang STANDARD/PRO hoặc Trial đã hết
- WHEN gọi API Trial
- THEN Backend MUST trả HTTP 409
- AND MUST không hạ cấp hoặc cấp lại Trial.

### Requirement: REQ-SUB-10 Tenant NO_PLAN và điều hướng theo trạng thái

Tenant đăng ký thường MUST ở trạng thái `NO_PLAN` cho tới khi chủ động chọn Trial hoặc mua gói trả phí.

1. `NO_PLAN` MUST không được truy cập chức năng Dashboard nghiệp vụ/POS/kho.
2. `NO_PLAN` SHALL được truy cập trang tài khoản, đăng xuất và trang chọn gói.
3. Trang chọn gói SHALL hiển thị nút Trial nếu state `ELIGIBLE`, cùng STANDARD/PRO.
4. API trial-status MUST trả một trong `ELIGIBLE`, `ACTIVE`, `EXPIRED`, `PAID`.
5. HomePage CTA với Store Owner đã đăng nhập:
   - ELIGIBLE → popup xác nhận;
   - ACTIVE → Dashboard;
   - EXPIRED/PAID → trang quản lý gói.
6. Mọi truy vấn MUST lấy tenant từ claim và kiểm tra Store Owner; không nhận tenant ID tùy ý.
7. Trạng thái legacy mâu thuẫn MUST xử lý an toàn, không tự trả ELIGIBLE.
8. Kích hoạt Trial lần đầu MUST ghi đúng một audit event, không chứa OTP/password/token.

#### Scenario: NO_PLAN truy cập Dashboard

- GIVEN tenant đang NO_PLAN
- WHEN Store Owner mở Dashboard nghiệp vụ
- THEN route guard MUST chuyển tới trang chọn gói
- AND SHALL giải thích cần bắt đầu Trial hoặc mua gói.

#### Scenario: NO_PLAN chọn gói trả phí

- GIVEN tenant NO_PLAN chưa dùng Trial
- WHEN mua STANDARD hoặc PRO thành công
- THEN tenant SHALL chuyển sang PAID/ACTIVE
- AND account/tenant chưa dùng Trial MUST không được tự đánh dấu đã Trial
- AND tenant trả phí MUST không được quay lại Trial.

#### Scenario: Đọc trạng thái chính tenant

- GIVEN Store Owner có phiên hợp lệ
- WHEN gọi trial-status
- THEN Backend SHALL trả state của tenant trong claim
- AND MUST không tiết lộ tenant khác.

#### Scenario: Role hoặc tenant giả mạo

- GIVEN Staff hoặc người dùng tenant A
- WHEN cố đọc/kích hoạt Trial tenant B
- THEN Backend MUST trả HTTP 403
- AND MUST không sửa hoặc tiết lộ tenant B.

#### Scenario: Backfill tenant hiện hữu

- GIVEN dữ liệu tồn tại trước migration
- WHEN migration/backfill chạy
- THEN tenant/account có bằng chứng đã dùng Trial MUST được đánh dấu đã dùng
- AND dữ liệu không rõ MUST không tự được cấp eligibility.

## MODIFIED Requirements

Không thay đổi giá, quota hoặc thanh toán STANDARD/PRO.

## REMOVED Requirements

Không có.

## Acceptance checklist

- [ ] REQ-SUB-07: Đăng ký thường tạo NO_PLAN; CTA Trial tạo TRIAL sau OTP.
- [ ] REQ-SUB-07: Không còn modal 14 ngày/toast thành công giả.
- [ ] REQ-SUB-08: OTP bắt buộc và transaction không tạo dữ liệu mồ côi.
- [ ] REQ-SUB-09: Một account một Trial; một tenant một Trial; đúng 72 giờ.
- [ ] REQ-SUB-09: Retry/concurrent không cộng ngày, không trừ ví.
- [ ] REQ-SUB-10: NO_PLAN bị chặn nghiệp vụ và được đưa tới trang chọn gói.
- [ ] Tenant isolation, role, legacy backfill và audit được kiểm thử.
- [ ] Build frontend/backend và test unit/integration/UI PASS.
