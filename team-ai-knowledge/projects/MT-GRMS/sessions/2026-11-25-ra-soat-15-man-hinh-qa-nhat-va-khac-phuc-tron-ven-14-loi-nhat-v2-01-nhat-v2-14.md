---
id: SES-2026-11-25-693
date: '2026-11-25'
author: Ortus24
project: MT-GRMS
goals:
  - >-
    Kiểm tra toàn diện 15 màn hình trong outputs/bug/nhat/listurl.md và lập báo
    cáo Bug_Report_Nhat_2026-11-25.md
  - >-
    Khắc phục tuần tự toàn bộ 14 lỗi (NHAT-V2-01 đến NHAT-V2-14) trên cả Backend
    và Frontend
  - >-
    Tách nhánh refactor/... mô tả rõ chức năng cho từng lỗi, kèm worklog +
    CHANGELOG.md, vượt qua unit tests và đẩy lên remote
status: completed
files_changed:
  - MT_GRMS_BACKEND/src/MT_GRMS.Api/Controllers/AuthController.cs
  - MT_GRMS_BACKEND/src/MT_GRMS.Application/Auth/AuthService.cs
  - MT_GRMS_BACKEND/src/MT_GRMS.Application/Auth/Dtos/AuthDtos.cs
  - >-
    MT_GRMS_BACKEND/src/MT_GRMS.Application/Auth/Validators/LoginRequestValidator.cs
  - MT_GRMS_BACKEND/src/MT_GRMS.Api/Controllers/TenantStoreController.cs
  - >-
    MT_GRMS_BACKEND/src/MT_GRMS.Infrastructure/Services/TenantSubscriptionService.cs
  - >-
    MT_GRMS_BACKEND/src/MT_GRMS.Application/Admin/Services/AdminDashboardService.cs
  - >-
    MT_GRMS_BACKEND/src/MT_GRMS.Application/Admin/Services/SubscriptionPlanService.cs
  - MT_GRMS_BACKEND/src/MT_GRMS.Application/Admin/Services/TenantService.cs
  - MT_GRMS_BACKEND/src/MT_GRMS.Infrastructure/Repositories/TenantRepository.cs
  - >-
    MT_GRMS_BACKEND/src/MT_GRMS.Infrastructure/Repositories/SubscriptionPlanRepository.cs
  - MT_GRMS_FRONTEND/src/pages/store/components/ChangePasswordModal.tsx
  - MT_GRMS_FRONTEND/src/pages/store/components/StoreWalletTopupModal.tsx
  - MT_GRMS_FRONTEND/src/pages/store/AccountManagementPage.tsx
  - MT_GRMS_FRONTEND/src/pages/store/components/AccountProfileTab.tsx
  - MT_GRMS_FRONTEND/src/pages/store/components/EditProfileModal.tsx
  - MT_GRMS_FRONTEND/src/pages/store/components/SubscriptionPricingCards.tsx
  - MT_GRMS_FRONTEND/src/pages/store/components/BranchDetailModal.tsx
  - MT_GRMS_FRONTEND/src/pages/store/components/BranchFormModal.tsx
  - MT_GRMS_FRONTEND/src/pages/store/components/StoreTopStatusBar.tsx
  - MT_GRMS_FRONTEND/src/pages/admin/AdminDashboardPage.tsx
  - MT_GRMS_FRONTEND/src/pages/admin/TenantManagementPage.tsx
  - MT_GRMS_FRONTEND/src/pages/admin/SubscriptionPlanDetailPage.tsx
  - MT_GRMS_FRONTEND/src/pages/admin/SubscriptionPlanCreatePage.tsx
  - >-
    MT_GRMS_FRONTEND/src/features/admin/components/subscriptions/details/PlanTenantsCard.tsx
  - MT_GRMS_FRONTEND/src/features/auth/components/AuthPolicyModal.tsx
  - MT_GRMS_FRONTEND/src/pages/auth/RegisterPage.tsx
  - MT_GRMS_FRONTEND/src/pages/auth/LoginPage.tsx
  - MT_GRMS_FRONTEND/src/pages/auth/ForgotPasswordPage.tsx
  - MT_GRMS_FRONTEND/src/pages/HomePage/components/HeroSection.tsx
  - MT_GRMS_FRONTEND/src/pages/HomePage/components/Footer.tsx
  - MT_GRMS_FRONTEND/src/pages/HomePage/components/ServicesEcosystemSection.tsx
tags:
  - session
  - summary
---

# Session Summary: Rà soát 15 màn hình QA Nhật và khắc phục trọn vẹn 14 lỗi (NHAT-V2-01 → NHAT-V2-14)

Hoàn thành rà soát 15 màn hình thuộc nhóm Auth, Trang chủ, Super Admin SaaS và Store Owner Hub/Account, phát hiện và khắc phục triệt để 14/14 lỗi (NHAT-V2-01 → NHAT-V2-14) theo quy trình SEP:
1. P0 Critical: Triển khai API đổi mật khẩu thật POST /api/auth/me/change-password xoay SecurityStamp thu hồi phiên thiết bị khác và giữ phiên hiện tại (NHAT-V2-01); xóa bỏ hoàn toàn VietQR fallback vào STK cứng 1900 6522 8888 khi lỗi mạng tại StoreWalletTopupModal (NHAT-V2-02); sửa điều kiện kiểm tra boolean false khi chuyển gói sang Tạm ngừng bán (NHAT-V2-03); bổ sung trường Id cho cảnh báo khẩn cấp Admin Dashboard tránh lỗi 404 (NHAT-V2-04).
2. P1 Major: Khôi phục AccountSidebarNav, dọn dữ liệu mẫu và thêm PUT /api/auth/me/profile (NHAT-V2-05); đồng bộ toàn bộ gói ACTIVE từ Admin sang Store Owner không tự hồi sinh gói INACTIVE và giữ đúng MaxStorageGb (NHAT-V2-06); sửa KPI Lượt mua gói thành công tính cả PURCHASE_PLAN và UPGRADE_PLAN (NHAT-V2-07); bổ sung tìm kiếm Email/Họ tên/SĐT chủ tiệm, lọc PENDING và xuất CSV thật trên Quản lý Tenant (NHAT-V2-08); nạp danh sách tenant thực tế sử dụng gói dịch vụ kèm link chi tiết (NHAT-V2-09); sửa pass 2/2 unit tests BranchManagementTab, bỏ checkbox đồng bộ giả và làm mới thanh trạng thái chi nhánh (NHAT-V2-10).
3. P2 Minor: Chuẩn hóa phản hồi 400 chống dò email ở verify-otp/reset-password, giới hạn 5 lần đoán OTP và bắt buộc mật khẩu mạnh (NHAT-V2-11); dùng AdminToast đúng loại lỗi trên SubscriptionPlanCreatePage (NHAT-V2-12); thêm AuthPolicyModal trên RegisterPage & siết kiểm tra redirect theo role trên LoginPage (NHAT-V2-13); thay toàn bộ emoji bằng SVG đơn sắc, cập nhật nội dung/liên hệ THViet trên HomePage và phân màu 3 ngưỡng hạn dùng trên StoreTopStatusBar (NHAT-V2-14).
