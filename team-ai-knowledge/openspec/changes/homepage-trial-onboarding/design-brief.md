# Design Brief: Homepage Trial Onboarding

## 1. Dependencies

- `proposal.md`
- `exploration.md`
- Capability: `subscription`
- Luồng đăng ký/Email OTP hiện có trong `AuthController`, `AuthService`, `RegisterPage`
- Trạng thái tenant/subscription hiện có trong `Tenant` và `TenantStoreController`

## 2. Phương án tổng thể

Áp dụng luồng lai theo trạng thái:

1. Khách chưa đăng nhập bấm bất kỳ CTA Trial nào → chuyển tới `/auth/register?intent=trial`.
2. Trang đăng ký dùng form và Email OTP hiện có; intent chỉ điều khiển nội dung UI, không quyết định PlanCode hay số ngày.
3. Backend đăng ký thành công tạo user Store Owner, tenant, chi nhánh chính và kích hoạt duy nhất gói `TRIAL` trong 72 giờ trong cùng một giao dịch.
4. Store Owner đã đăng nhập bấm CTA → frontend hỏi trạng thái Trial từ backend:
   - `ACTIVE` → Dashboard;
   - `ELIGIBLE` → popup xác nhận rồi gọi activate;
   - `EXPIRED` hoặc `PAID` → trang quản lý gói;
   - role không phù hợp/không có tenant → không kích hoạt, điều hướng về khu vực hợp lệ hoặc đăng nhập lại.
5. Endpoint kích hoạt Trial hiện có được siết chặt thành thao tác idempotent và không được đặt lại thời hạn.

## 3. Luồng người dùng

### 3.1 Khách chưa đăng nhập

```text
HomePage CTA
  → /auth/register?intent=trial
  → nhập thông tin tài khoản + gian hàng
  → gửi Email OTP
  → xác thực OTP
  → backend transaction: User + Tenant + Branch + Trial 3 ngày
  → cấp phiên đăng nhập
  → Dashboard
```

Trang đăng ký hiển thị banner:

- “Dùng thử Gói Trial miễn phí 3 ngày”
- “Không cần thẻ”
- “Không tự động gia hạn”
- “Sau Trial có thể chọn STANDARD hoặc PRO”

### 3.2 Store Owner đã đăng nhập

```text
HomePage CTA
  → GET trial status
     ├─ ACTIVE  → Dashboard
     ├─ ELIGIBLE → confirmation modal → POST activate → Dashboard
     ├─ EXPIRED → Subscription page
     └─ PAID    → Subscription page
```

### 3.3 Request lặp/đồng thời

- Nếu Trial đang ACTIVE, POST lặp trả cùng `trialStartedAt` và `trialExpiresAt`, không đổi dữ liệu.
- Nếu Trial đã EXPIRED hoặc tenant đã từng dùng Trial, trả lỗi nghiệp vụ; không đặt lại thời hạn.
- Hai request đồng thời chỉ một request được chuyển từ ELIGIBLE sang ACTIVE.

## 4. Frontend

### Thành phần thay đổi

| Thành phần | Thay đổi |
|---|---|
| `HomePage.tsx` | Thay state mở `TrialModal` bằng handler dùng chung cho tất cả CTA |
| `Navbar.tsx`, `HeroSection.tsx`, `CtaBanner.tsx`, floating CTA | Gọi cùng `onStartTrial`; nội dung thống nhất 3 ngày |
| `TrialModal.tsx` | Loại bỏ form đăng ký giả; có thể thay bằng modal xác nhận nhỏ chỉ cho trạng thái ELIGIBLE |
| `RegisterPage.tsx` | Đọc `intent=trial`, hiển thị banner Trial và điều hướng Dashboard sau đăng ký thành công |
| `authService` / store API | Thêm hàm lấy trạng thái và kích hoạt Trial có typed response |
| Router | Giữ route chuẩn `/auth/register`; query intent không tạo route mới |

### Trạng thái giao diện

- **Loading**: khóa CTA trong lúc đọc trạng thái hoặc kích hoạt, hiển thị spinner tĩnh.
- **Error**: thông báo rõ không thể kiểm tra/kích hoạt; không giả lập thành công ở client.
- **OTP pending**: giữ modal OTP và resend policy hiện có.
- **Success**: cập nhật auth state và chuyển Dashboard.
- **Expired/Paid**: chuyển trang Subscription, hiển thị lựa chọn STANDARD/PRO.
- **Unauthorized/role sai**: không hiển thị nút kích hoạt; đưa về login hoặc trang phù hợp role.

### Quy tắc UI

- Không dùng emoji làm icon.
- Nút/badge dùng full pill, màu Electric Blue `#0066FF`, giao diện tĩnh.
- Không còn chuỗi “14 ngày” hoặc danh sách giá/gói cũ trong HomePage Trial.
- Mobile và desktop dùng cùng handler, không tách logic.

## 5. Backend API / Contract

### GET `/api/tenant/subscriptions/trial-status`

- Auth: Store Owner.
- Tenant lấy từ claim `tenant_id`.
- Response:

```json
{
  "state": "ELIGIBLE | ACTIVE | EXPIRED | PAID",
  "planCode": "TRIAL | STANDARD | PRO",
  "trialStartedAt": "UTC ISO-8601 hoặc null",
  "trialExpiresAt": "UTC ISO-8601 hoặc null",
  "destination": "DASHBOARD | SUBSCRIPTIONS | CONFIRM"
}
```

- Không nhận tenant ID từ query/body.

### POST `/api/tenant/subscriptions/trial`

- Auth: Store Owner.
- Request body rỗng hoặc có `requestId` dùng cho correlation; không nhận PlanCode, số ngày hay tenant ID.
- Hành vi:
  - ELIGIBLE: đặt `CurrentPlan = TRIAL`, `SubscriptionStatus = TRIAL`, thời gian bắt đầu backend UTC và hết hạn đúng +72 giờ.
  - ACTIVE: trả 200 với thời gian Trial hiện tại, không thay đổi expiry.
  - EXPIRED/PAID/already used: trả 409 ProblemDetails với mã `TRIAL_ALREADY_USED` hoặc `TRIAL_NOT_ELIGIBLE`.
  - tenant/role sai: 403; không tìm thấy tenant: 404.
- Không tạo WalletTransaction và không thay đổi WalletBalance.

### Registration API hiện có

- `POST /api/auth/register/send-otp`: giữ contract.
- `POST /api/auth/register`: bắt buộc OTP hợp lệ, chưa dùng và còn TTL; không chấp nhận nhánh đăng ký thiếu OTP.
- Việc tạo User, Tenant, Branch và Trial nằm trong một transaction.
- Backend luôn gán PlanCode `TRIAL`; frontend không gửi PlanCode/thời hạn.

### Lỗi

Dùng ProblemDetails RFC 7807 cho contract mới:

| Status | Code | Khi nào |
|---|---|---|
| 400 | `INVALID_OTP` / `OTP_REQUIRED` | OTP thiếu, sai hoặc hết hạn |
| 401 | `UNAUTHORIZED` | Chưa đăng nhập |
| 403 | `TRIAL_FORBIDDEN` | Role hoặc tenant không thuộc phiên |
| 404 | `TENANT_NOT_FOUND` | Phiên không ánh xạ tenant |
| 409 | `TRIAL_ALREADY_USED` | Trial đã hết/đã dùng hoặc tenant trả phí |
| 429 | `OTP_RATE_LIMITED` | Vượt giới hạn gửi/thử OTP |

## 6. Data Model và Migration

Bổ sung vào `Tenants`:

| Cột | Kiểu | Null | Ý nghĩa |
|---|---|---|---|
| `TrialStartedAt` | `timestamp with time zone` | Có | Thời điểm Trial đầu tiên được kích hoạt |
| `TrialExpiresAt` | `timestamp with time zone` | Có | Bằng `TrialStartedAt + 72 giờ`, không bị ghi đè khi nâng cấp |

Index phục vụ kiểm tra trạng thái theo tenant dùng primary key hiện có; chưa cần index riêng.

Migration/backfill an toàn:

- Tenant hiện đang `TRIAL` và có `SubscriptionExpiresAt`: `TrialExpiresAt = SubscriptionExpiresAt`, `TrialStartedAt = SubscriptionExpiresAt - 72 giờ`.
- Tenant hiện là STANDARD/PRO hoặc trạng thái khác: đánh dấu đã dùng Trial theo hướng bảo thủ để không cấp Trial mới; giá trị lịch sử dùng `CreatedAt` và `CreatedAt + 72 giờ` khi phù hợp.
- Tenant mới: hai cột được gán trong transaction đăng ký.
- Không sửa migration đã merge; tạo migration mới.

## 7. Transaction, Idempotency và đồng thời

- Registration transaction bao gồm User, Tenant, TenantUser/role mapping và Branch.
- Kích hoạt Trial dùng transaction mức cô lập phù hợp và khóa/cập nhật có điều kiện trên tenant.
- Điều kiện ghi: `TrialStartedAt IS NULL` và tenant chưa ở gói trả phí.
- Sau khi ghi, response luôn đọc lại thời gian đã lưu; không tính lại expiry ở frontend.
- Request lặp khi ACTIVE trả cùng dữ liệu.
- Ghi AuditLog `TRIAL_ACTIVATED` với tenant, user, timestamp, IP/correlation; không ghi OTP.

## 8. Quy tắc nghiệp vụ và phân quyền

1. Trial chỉ có PlanCode `TRIAL`.
2. Trial kéo dài đúng 72 giờ, tương ứng 3 ngày, tính từ UTC backend.
3. Mỗi tenant chỉ có một Trial suốt vòng đời.
4. Chỉ Store Owner của chính tenant được kiểm tra/kích hoạt.
5. Email phải được xác minh trước khi Trial bắt đầu.
6. Trial không yêu cầu thẻ, không trừ ví, không tự gia hạn.
7. Hết Trial giữ nguyên dữ liệu; quyền truy cập nghiệp vụ được xử lý theo policy subscription hiện có và người dùng được hướng tới trang nâng cấp.
8. Nâng cấp STANDARD/PRO không xóa `TrialStartedAt`/`TrialExpiresAt`.

## 9. Test Strategy

- Frontend: CTA ở Navbar/Hero/CTA banner cùng điều hướng; query intent; các nhánh ACTIVE/ELIGIBLE/EXPIRED/PAID; loading/error.
- Backend unit: OTP bắt buộc; tính đúng +72 giờ; không thay đổi ví; active request idempotent.
- Integration: transaction tạo user/tenant/branch; request đồng thời; tenant isolation; role sai; Trial đã hết/trả phí.
- Regression: login, registration OTP, dashboard navigation, purchase STANDARD/PRO.
