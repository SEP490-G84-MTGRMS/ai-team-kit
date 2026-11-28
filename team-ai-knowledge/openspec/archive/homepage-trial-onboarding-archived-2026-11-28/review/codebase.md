# Codebase Review: homepage-trial-onboarding

## Bản đồ ảnh hưởng

| Requirement | Backend | Frontend | Rủi ro hiện tại |
|---|---|---|---|
| REQ-SUB-07 | `AuthService.RegisterTenantAsync`, DTO đăng ký | `HomePage`, `TrialModal`, `RegisterPage` | Backend luôn tạo TRIAL; HomePage dùng modal/toast giả |
| REQ-SUB-08 | Auth OTP store/service, repository transaction | Form OTP đăng ký | OTP có thể fail-open, bị xóa trước transaction và lưu trong bộ nhớ tiến trình |
| REQ-SUB-09 | `Tenant`, `User`, EF configurations, migration, subscription service/controller | API client và trạng thái Trial | Chưa có dấu account/tenant bền vững; endpoint Trial hiện có thể cấp/cộng lại ngày |
| REQ-SUB-10 | Subscription authorization policy/middleware, tenant resolver, quota services | `ProtectedRoute`, subscription onboarding | Chỉ guard frontend; tenant resolver tin header; fallback plan có thể cấp quyền STANDARD |

## Tái sử dụng được

- Transaction tạo Store Owner/Tenant/TenantUser/Branch trong repository hiện có.
- Luồng Email OTP, Email service và màn hình nhập OTP có thể tái sử dụng sau khi chuyển sang fail-closed và distributed state.
- Trang Subscription, API mua STANDARD/PRO, ví/nạp tiền có thể làm allowlist cho tenant `NO_PLAN`.
- Cấu trúc ProblemDetails/error code và authorization policy hiện có có thể mở rộng cho subscription gate.

## Xung đột và rủi ro

- [HIGH] `AuthService.RegisterTenantAsync` hiện mặc định `CurrentPlan=TRIAL`, `SubscriptionStatus=TRIAL`, expiry +3 ngày; trái luồng đăng ký thường `NO_PLAN`.
- [HIGH] OTP chỉ được kiểm tra khi client gửi OTP hoặc store có key; trường hợp không có challenge vẫn có thể đăng ký. OTP bị remove trước khi DB commit và store in-memory không an toàn đa instance.
- [HIGH] `TenantStoreController.ResolveCurrentTenantAsync` nhận `X-Tenant-Id` và fallback tenant đầu tiên; endpoint Trial có nguy cơ chéo tenant.
- [HIGH] Backend chưa có subscription gate dùng chung; `ProtectedRoute` phía frontend không ngăn gọi trực tiếp API nghiệp vụ.
- [HIGH] Endpoint `ActivateTrialSubscription` hiện tái dùng purchase flow và có thể đặt lại/cộng hạn Trial; không đảm bảo một lần.
- [HIGH] Entity/configuration/database initializer đang default TRIAL; migration phải đổi đồng bộ và backfill có kiểm soát.
- [HIGH] `BranchService` fallback plan thiếu dữ liệu thành `STANDARD`, có thể cấp quota trả phí cho `NO_PLAN`.
- [MEDIUM] Frontend mapping fallback sang “Gói Chuyên Nghiệp” khi thiếu plan, khiến `NO_PLAN` bị hiển thị sai.
- [MEDIUM] Auth state hiện chưa đủ subscription status cho UX guard; backend vẫn phải là nguồn quyết định.
- [MEDIUM] Cần giữ tương thích purchase/wallet/top-up để `NO_PLAN` có đường mua gói.

## Kết luận

Cần sửa đặc tả trước khi lập task. Phải khóa tenant theo claim/membership, bắt buộc backend subscription gate, làm OTP fail-closed và nguyên tử, thêm dấu lịch sử paid/trial bền vững, quy định migration/backfill xác định, đồng thời loại bỏ mọi fallback mặc định sang TRIAL/STANDARD.
