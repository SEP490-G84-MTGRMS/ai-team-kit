# Design Brief: Homepage Trial Onboarding

## 1. Dependencies

- `proposal.md`
- `exploration.md`
- Capability `subscription`
- Luồng Email OTP trong `AuthController`, `AuthService`, `RegisterPage`
- Trạng thái subscription trong `Tenant` và `TenantStoreController`

## 2. Quyết định thiết kế

Tách việc **tạo gian hàng** khỏi việc **bắt đầu Trial**:

- Đăng ký thường tại `/auth/register`: sau Email OTP tạo User, Tenant và Branch với `SubscriptionStatus = NO_PLAN`; chưa bắt đầu đếm Trial.
- Đăng ký từ CTA tại `/auth/register?intent=trial`: sau Email OTP tạo cùng dữ liệu và kích hoạt `TRIAL` 72 giờ trong một transaction.
- Tenant `NO_PLAN`: sau đăng nhập phải chọn “Bắt đầu dùng thử 3 ngày” hoặc mua STANDARD/PRO trước khi dùng chức năng kinh doanh.
- Eligibility Trial được kiểm tra đồng thời theo account và tenant. Một account chỉ được hưởng Trial một lần trên toàn hệ thống; một tenant cũng chỉ có một Trial.

Query `intent=trial` chỉ điều khiển UI. Frontend gửi yêu cầu `startTrial=true`, nhưng backend tự kiểm tra eligibility, gán PlanCode `TRIAL` và tính 72 giờ.

## 3. Luồng người dùng

### 3.1 Đăng ký thường

```text
/auth/register
  → nhập thông tin
  → Email OTP
  → transaction tạo User + Tenant(NO_PLAN) + Branch
  → cấp phiên
  → /store-owner/subscriptions?onboarding=1
     ├─ Bắt đầu dùng thử 3 ngày
     ├─ Mua STANDARD
     └─ Mua PRO
```

Tenant `NO_PLAN` không được vào Dashboard nghiệp vụ; route guard đưa về trang chọn gói.

### 3.2 CTA Dùng thử trên HomePage

```text
HomePage CTA
  → /auth/register?intent=trial
  → banner “Dùng thử 3 ngày”
  → nhập thông tin + Email OTP
  → transaction tạo User + Tenant + Branch
  → kiểm tra account/tenant chưa từng Trial
  → gán TRIAL, TrialStartedAt, TrialExpiresAt=+72h
  → Dashboard
```

### 3.3 Store Owner đã đăng nhập bấm CTA

```text
GET trial-status
  ├─ ELIGIBLE (NO_PLAN, account+tenant chưa dùng) → popup xác nhận → POST trial → Dashboard
  ├─ ACTIVE → Dashboard
  ├─ EXPIRED → trang gói
  └─ PAID → trang gói
```

## 4. Frontend

| Thành phần | Thay đổi |
|---|---|
| `HomePage.tsx` | Một handler chung cho mọi CTA; bỏ toast thành công giả |
| `Navbar`, `HeroSection`, `CtaBanner`, floating CTA | Gọi `onStartTrial`, nội dung Trial 3 ngày |
| `TrialModal.tsx` | Xóa form 14 ngày; chỉ giữ modal xác nhận cho account ELIGIBLE nếu cần |
| `RegisterPage.tsx` | Đọc intent; gửi `startTrial`; banner 3 ngày; điều hướng Dashboard hoặc trang chọn gói |
| Auth/store API | Typed contract cho register mode, trial-status và activate Trial |
| Route guard | `NO_PLAN` chỉ vào onboarding/subscription/account/logout; chặn Dashboard nghiệp vụ |

### Trạng thái UI

- Loading: khóa CTA và submit trong lúc kiểm tra/gửi.
- OTP error/rate limit: dùng lỗi backend, không tiếp tục đăng ký.
- Register thường thành công: trang chọn gói.
- Register Trial thành công: Dashboard.
- `NO_PLAN`: thẻ rõ “Chưa chọn gói”, nút Trial/Standard/Pro.
- API lỗi: hiển thị retry; không giả lập thành công.
- Giao diện theo KiotViet style, icon SVG đơn sắc, không emoji.

## 5. API Contract

### Registration

`POST /api/auth/register` bổ sung trường:

```json
{
  "startTrial": true
}
```

- `false` hoặc thiếu: tạo tenant `NO_PLAN`, không ghi thời gian Trial.
- `true`: backend kiểm tra account/tenant chưa từng Trial rồi kích hoạt `TRIAL` 72 giờ.
- Backend không nhận PlanCode, số ngày hoặc tenant ID từ frontend.
- Email OTP luôn bắt buộc.

### GET `/api/tenant/subscriptions/trial-status`

Auth Store Owner, tenant từ claim. Response:

```json
{
  "state": "ELIGIBLE | ACTIVE | EXPIRED | PAID",
  "planCode": null,
  "trialStartedAt": null,
  "trialExpiresAt": null,
  "destination": "CONFIRM | DASHBOARD | SUBSCRIPTIONS"
}
```

ELIGIBLE chỉ khi:

- Tenant đang `NO_PLAN`.
- `Tenant.TrialStartedAt` null.
- Account Store Owner chưa từng Trial.
- Email đã xác minh.

### POST `/api/tenant/subscriptions/trial`

- Chỉ Store Owner của tenant trong claim.
- Không nhận PlanCode, số ngày, tenant ID.
- ELIGIBLE: trong transaction, đánh dấu Trial trên account và tenant, gán `TRIAL` đúng 72 giờ.
- ACTIVE: trả cùng thời gian hiện tại, không cộng ngày.
- EXPIRED/account đã dùng/tenant trả phí: HTTP 409.
- Không thay đổi WalletBalance, không tạo WalletTransaction.

### Lỗi

| HTTP | Code | Ý nghĩa |
|---|---|---|
| 400 | `OTP_REQUIRED`, `INVALID_OTP` | OTP thiếu/sai/hết hạn |
| 401 | `UNAUTHORIZED` | Chưa đăng nhập |
| 403 | `TRIAL_FORBIDDEN` | Role/tenant sai |
| 404 | `TENANT_NOT_FOUND` | Không tìm thấy tenant phiên |
| 409 | `TRIAL_ALREADY_USED` | Account hoặc tenant đã dùng Trial |
| 409 | `TRIAL_NOT_ELIGIBLE` | Tenant trả phí hoặc trạng thái không hợp lệ |
| 429 | `OTP_RATE_LIMITED` | Vượt giới hạn OTP |

## 6. Data Model và Migration

### Tenant

- `SubscriptionStatus`: hỗ trợ `NO_PLAN`, `TRIAL`, `ACTIVE`, `EXPIRED`.
- `CurrentPlan`: null khi `NO_PLAN`.
- `TrialStartedAt timestamp with time zone null`.
- `TrialExpiresAt timestamp with time zone null`.

### User

- `TrialConsumedAt timestamp with time zone null`: dấu account đã hưởng Trial.
- Khi Trial bắt đầu, `User.TrialConsumedAt`, `Tenant.TrialStartedAt` và `Tenant.TrialExpiresAt` được ghi cùng transaction.

### Backfill

- Tenant đang TRIAL: suy ra start từ expiry - 72 giờ; đánh dấu Trial cho Store Owner.
- Tenant STANDARD/PRO hoặc từng có lịch sử Trial: đánh dấu account/tenant đã dùng theo hướng bảo thủ.
- Tenant legacy không xác định: không tự trả ELIGIBLE; yêu cầu xử lý/quản trị rõ ràng.
- Tạo migration mới, không sửa migration đã merge.

## 7. Transaction và đồng thời

- Registration transaction gồm User, Tenant, TenantUser, Branch và tùy chọn Trial.
- Kích hoạt Trial từ `NO_PLAN` khóa/kiểm tra cả User và Tenant.
- Điều kiện ghi: `User.TrialConsumedAt IS NULL`, `Tenant.TrialStartedAt IS NULL`, tenant `NO_PLAN`.
- Hai request đồng thời: chỉ một request được ghi; request còn lại đọc trạng thái ACTIVE hoặc nhận conflict, không cộng ngày.
- Audit `TRIAL_ACTIVATED` đúng một lần, gồm account, tenant, thời gian UTC, IP/correlation; không ghi OTP/token/password.

## 8. Quy tắc nghiệp vụ

1. Trial chỉ là PlanCode `TRIAL`, đúng 72 giờ.
2. Một account chỉ hưởng Trial một lần duy nhất trên toàn hệ thống.
3. Một tenant chỉ có Trial một lần.
4. Đăng ký thường không tự bắt đầu Trial.
5. CTA Trial tự bắt đầu Trial sau OTP nếu account và tenant đủ điều kiện.
6. Tenant `NO_PLAN` phải chọn Trial hoặc gói trả phí trước khi dùng Dashboard nghiệp vụ.
7. Trial không cần thẻ, không trừ ví, không tự gia hạn.
8. Nâng cấp không xóa lịch sử Trial.
9. Hết Trial giữ dữ liệu nhưng đưa Store Owner về trang nâng cấp.

## 9. Test Strategy

- Đăng ký thường → NO_PLAN, không có timestamp Trial.
- Đăng ký CTA → TRIAL 72 giờ và Dashboard.
- Account đã dùng Trial không thể nhận lại qua tenant khác.
- Tenant đã dùng Trial không thể kích hoạt lại.
- Retry/concurrent activation không kéo dài ngày.
- OTP thiếu/sai không tạo dữ liệu.
- Route guard NO_PLAN.
- Tenant isolation, role sai, paid/expired.
- Regression mua STANDARD/PRO và build frontend/backend.
