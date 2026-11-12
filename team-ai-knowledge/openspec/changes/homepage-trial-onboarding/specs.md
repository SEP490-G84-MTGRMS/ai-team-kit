# Spec: subscription

> Spec gốc / seed của capability. Delta nghiệp vụ nằm trong `openspec/changes/<change>/specs.md`. `/sep-archive` không merge vào đây; `/sep-refactor` sửa specs của change.

## Requirements

### Requirement: REQ-SUB-10 Backend subscription gate và trải nghiệm hết hạn gói

1. Backend MUST chặn `NO_PLAN`, `REVIEW_REQUIRED`, `EXPIRED`, Trial hết hạn (`TrialExpiresAt <= UtcNow`), và gói trả phí đã hết hạn (`ACTIVE` có `SubscriptionExpiresAt <= UtcNow`) khỏi mọi API nghiệp vụ bằng HTTP 403 RFC 7807 `ProblemDetails` (`code = "SUBSCRIPTION_REQUIRED"`, không trả dữ liệu nghiệp vụ).
2. Allowlist MUST giới hạn ở auth/me/logout/account, trial status/access-status/activate, pricing/subscription purchase, wallet balance/top-up, checkout/payment callback và store-info cần cho onboarding.
3. Backend MUST cung cấp trạng thái truy cập gói (`ELIGIBLE|ACTIVE|EXPIRED|PAID|REVIEW_REQUIRED`) dựa trên JWT `tenant_id` và membership active cho cả `STORE_OWNER`/`ADMIN` và nhân viên (`STAFF`/`CASHIER`/`EMPLOYEE`); MUST không tin `X-Tenant-Id` hoặc fallback tenant đầu tiên.
4. Khi tenant ở trạng thái `NO_PLAN` (chưa chọn gói), frontend route guard MUST giữ điều hướng `STORE_OWNER` tới `/store-owner/subscriptions?tab=subscriptions&onboarding=1`.
5. Khi tenant ở trạng thái hết hạn gói (`EXPIRED` — hết hạn Trial hoặc hết hạn gói trả phí), frontend MUST vẫn cho phép người dùng vào các trang mà vai trò của họ có quyền theo route guard (Dashboard, POS, Kho, Nhân viên, Lịch làm việc, v.v.) và hiển thị lớp phủ tối (`SubscriptionLockOverlay`) kèm icon ổ khóa đơn sắc (`lucide-react`) và thông báo nhắc thanh toán/gia hạn để chặn thao tác lên phần nội dung bên dưới:
   - Với `STORE_OWNER`/`ADMIN`: hiển thị nút pill CTA dẫn tới `/store-owner/subscriptions?tab=subscriptions` để gia hạn/chọn gói; các trang allowlist (`/store-owner/subscriptions`, `/store-owner/account`, `/store-owner/settings`) MUST KHÔNG bị phủ khóa để chủ shop có thể nạp ví và thanh toán.
   - Với `STAFF`/`CASHIER`/`EMPLOYEE`: hiển thị lớp phủ tối và ổ khóa nhắc liên hệ Chủ cửa hàng gia hạn gói (không hiển thị nút thanh toán).
6. Khi bất kỳ API nghiệp vụ nào trả về 403 `SUBSCRIPTION_REQUIRED`, `httpClient` MUST phát tín hiệu đồng bộ để màn hình đang mở lập tức kích hoạt trạng thái khóa nếu chưa ở trang allowlist.
7. UI MUST map lỗi sang tiếng Việt, tuân thủ monochrome SVG icons (không emoji, không animation nhún nhảy) và không hiển thị enum nội bộ.

#### Scenario: Gọi trực tiếp API nghiệp vụ khi hết hạn gói trả phí hoặc Trial
- GIVEN tenant `NO_PLAN`, Trial hết hạn hoặc gói trả phí có `SubscriptionExpiresAt <= UtcNow`
- WHEN gọi trực tiếp API kho/POS/sản phẩm
- THEN backend MUST trả 403 ProblemDetails `SUBSCRIPTION_REQUIRED` và không trả dữ liệu nghiệp vụ.

#### Scenario: Vào trang theo quyền khi hết hạn gói trên Frontend
- GIVEN người dùng thuộc tenant đã hết hạn gói (`EXPIRED`)
- WHEN điều hướng tới route mà vai trò của họ có quyền (ví dụ `/store-owner/dashboard`, `/pos`, `/employee/pos`)
- THEN hệ thống KHÔNG đá ra khỏi trang mà hiển thị tấm phủ đen + ổ khóa + thông báo nhắc gia hạn gói
- AND khi `STORE_OWNER` truy cập `/store-owner/subscriptions`, `/store-owner/account`, `/store-owner/settings` thì không bị phủ khóa để thực hiện thanh toán.

#### Scenario: NO_PLAN mua gói
- GIVEN tenant `NO_PLAN`
- WHEN truy cập ví/nạp tiền/checkout và mua gói thành công
- THEN request MUST được allowlist
- AND Tenant MUST đặt `FirstPaidAt`, chuyển PAID/ACTIVE
- AND MUST không tự ghi lịch sử Trial.

#### Scenario: Giả mạo tenant
- GIVEN user tenant A gửi header tenant B
- WHEN gọi status/access-status/kích hoạt
- THEN backend MUST bỏ qua/từ chối header và chỉ dùng tenant claim + membership
- AND MUST không tiết lộ tenant B.

## Lịch sử
- 2026-11-12 · `sep-refactor:Cập-nhật-REQ-SUB-10:-chặn-cả-gói-trả-phí` · +0 ~1 -0
