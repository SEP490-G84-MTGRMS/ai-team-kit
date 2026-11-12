# Spec: subscription

> Spec gốc / seed của capability. Delta nghiệp vụ nằm trong `openspec/changes/<change>/specs.md`. `/sep-archive` không merge vào đây; `/sep-refactor` sửa specs của change.

## Requirements

### Requirement: REQ-SUB-10 Backend subscription gate và trải nghiệm hết hạn gói

1. Người dùng **chưa đăng nhập** MUST tiếp tục bị chặn hoàn toàn bởi frontend route guard và điều hướng về `/auth/login` (cùng backend `[Authorize]` 401).
2. Backend MUST chặn `NO_PLAN`, `REVIEW_REQUIRED`, `EXPIRED`, Trial hết hạn (`TrialExpiresAt <= UtcNow`), và gói trả phí đã hết hạn (`ACTIVE` có `SubscriptionExpiresAt <= UtcNow`) khỏi mọi API nghiệp vụ bằng HTTP 403 RFC 7807 `ProblemDetails` (`code = "SUBSCRIPTION_REQUIRED"`, không trả dữ liệu nghiệp vụ).
3. Allowlist MUST giới hạn ở auth/me/logout/account, trial status/access-status/activate, pricing/subscription purchase, wallet balance/top-up, checkout/payment callback và store-info cần cho onboarding.
4. Backend MUST cung cấp trạng thái truy cập gói (`ELIGIBLE|ACTIVE|EXPIRED|PAID|REVIEW_REQUIRED`) dựa trên JWT `tenant_id` và membership active cho cả `STORE_OWNER`/`ADMIN` và nhân viên (`STAFF`/`CASHIER`/`EMPLOYEE`); MUST không tin `X-Tenant-Id` hoặc fallback tenant đầu tiên.
5. Khi người dùng **đã đăng nhập** nhưng tenant chưa mua gói (`NO_PLAN` / `ELIGIBLE` / `REVIEW_REQUIRED`) **hoặc** đã hết hạn gói (`EXPIRED`), frontend MUST vẫn cho phép người dùng vào các màn hình quản lý/nghiệp vụ mà vai trò của họ có quyền theo route guard (Dashboard, POS, Nhập hàng, Kho, Nhân viên, Lịch làm việc... ở trạng thái không có dữ liệu từ API bị chặn 403), và hiển thị lớp phủ tối toàn màn hình (`SubscriptionLockOverlay`) chặn mọi thao tác lên nội dung bên dưới kèm icon ổ khóa đơn sắc (`lucide-react`):
   - Khi **chưa có gói (`NO_PLAN` / `ELIGIBLE` / `REVIEW_REQUIRED`)**: hiển thị tiêu đề và thông báo nhắc **"Cần mua gói để sử dụng dịch vụ"**; với `STORE_OWNER`/`ADMIN` hiển thị nút pill CTA dẫn tới `/store-owner/subscriptions?tab=subscriptions` để chọn Dùng thử 3 ngày hoặc mua gói Thường/Pro; với `STAFF`/`CASHIER`/`EMPLOYEE` nhắc liên hệ Chủ cửa hàng mua gói (không hiển thị nút thanh toán).
   - Khi **hết hạn gói (`EXPIRED`)**: hiển thị thông báo **"Gói dịch vụ đã hết hạn"** nhắc thanh toán/gia hạn gói kèm nút CTA như trên theo vai trò.
   - Các trang allowlist (`/store-owner/subscriptions`, `/store-owner/account`, `/store-owner/settings`) MUST KHÔNG bị phủ khóa để chủ shop có thể nạp ví, kích hoạt dùng thử và mua gói.
6. Khi bất kỳ API nghiệp vụ nào trả về 403 `SUBSCRIPTION_REQUIRED`, `httpClient` MUST phát tín hiệu đồng bộ để màn hình đang mở lập tức kích hoạt lớp phủ khóa nếu chưa ở trang allowlist.
7. UI MUST map lỗi sang tiếng Việt, tuân thủ monochrome SVG icons (không emoji, không animation nhún nhảy) và không hiển thị enum nội bộ.

#### Scenario: Đã đăng nhập nhưng chưa mua gói (NO_PLAN) vào màn hình quản lý
- GIVEN người dùng đã đăng nhập thuộc tenant `NO_PLAN` (`ELIGIBLE`)
- WHEN truy cập các trang được phân quyền như `/store-owner/dashboard`, `/pos`, `/goods-receipts`
- THEN frontend KHÔNG điều hướng cưỡng bức ra khỏi trang mà vẫn vào route đó với API nghiệp vụ bị backend chặn 403 (không có dữ liệu)
- AND hiển thị lớp phủ tối chặn thao tác kèm icon ổ khóa và thông báo "Cần mua gói để sử dụng dịch vụ" (có nút tới `/store-owner/subscriptions?tab=subscriptions` cho Chủ cửa hàng, nhắc liên hệ Chủ cửa hàng cho Nhân viên)
- AND truy cập `/store-owner/subscriptions`, `/store-owner/account`, `/store-owner/settings` không bị phủ khóa.

#### Scenario: Chưa đăng nhập truy cập màn hình quản lý
- GIVEN người dùng chưa đăng nhập
- WHEN truy cập route được bảo vệ
- THEN frontend MUST chuyển hướng về `/auth/login`.

## Lịch sử
- 2026-11-12 · `sep-refactor:Cập-nhật-REQ-SUB-10:-chặn-cả-gói-trả-phí` · +0 ~1 -0
- 2026-11-12 · `sep-refactor:Cập-nhật-REQ-SUB-10:-người-dùng-đã-đăng-` · +0 ~1 -0
