# Tasks: subscription-tier-quota-redesign

## DB & Entity
- [ ] T1 — Bổ sung cột ExtraBranches, HasStaffManagementAddon, SubscriptionStatus vào Entity Tenant & DDL DbInitializer (REQ-01, REQ-03, REQ-05)
- [ ] T2 — Cập nhật Seed Data SubscriptionPlans (STANDARD 270k, PRO 490k, xóa gói FREE 0đ) trong DbInitializer.cs (REQ-01, REQ-05)

## Backend Application & API
- [ ] T3 — Cập nhật DTO PurchaseSubscriptionRequest (thêm HasStaffManagementAddon, bỏ ExtraWarehouses) trong TenantStoreDtos (REQ-02, REQ-03, REQ-04)
- [ ] T4 — Nâng cấp logic tính tiền, cộng dồn hạn mức chi nhánh và validation tại TenantStoreController.PurchaseSubscription (REQ-03, REQ-04)
- [ ] T5 — Cập nhật BranchService.GetBranchQuotaAsync tính Quota động = Plan.MaxBranches + Tenant.ExtraBranches (MODIFIED)

## Frontend UI
- [ ] T6 — Cập nhật SubscriptionPricingCards.tsx hiển thị 2 gói Thường (270k) & Pro (490k), loại bỏ gói Free 0đ (REQ-01)
- [ ] T7 — Cập nhật SubscriptionCheckoutModal.tsx: Bỏ stepper kho phụ, thêm checkbox option nhân viên (Gói Thường) và stepper thêm chi nhánh (Gói Pro) (REQ-02, REQ-03, REQ-04)
- [ ] T8 — Cập nhật hiển thị Quota và thời hạn dùng thử 3 ngày tại BranchManagement.tsx (REQ-05, MODIFIED)

## Test & Verification
- [ ] T9 — Kiểm thử toàn diện API tính tiền mua gói, kiểm tra Quota tạo chi nhánh và xác nhận build Backend + Frontend pass 100%
