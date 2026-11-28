# Tasks: subscription-tier-quota-redesign

## DB & Entity
- [x] T1 — Bổ sung cột ExtraBranches, HasStaffManagementAddon, SubscriptionStatus vào Entity Tenant & DDL DbInitializer (REQ-01, REQ-03, REQ-05)
- [x] T2 — Cập nhật Seed Data SubscriptionPlans (STANDARD 99k, PRO 249k, xóa gói FREE 0đ) trong DbInitializer.cs (REQ-01, REQ-05)

## Backend Application & API
- [x] T3 — Cập nhật DTO PurchaseSubscriptionRequest (thêm HasStaffManagementAddon, bỏ ExtraWarehouses) trong TenantStoreDtos (REQ-02, REQ-03, REQ-04)
- [x] T4 — Nâng cấp logic tính tiền (Gói Thường 99k, Option NV 30k; Gói Pro 249k, thêm CN 80k), cộng dồn hạn mức chi nhánh và validation tại TenantStoreController.PurchaseSubscription (REQ-03, REQ-04)
- [x] T5 — Cập nhật BranchService.GetBranchQuotaAsync tính Quota động = Plan.MaxBranches + Tenant.ExtraBranches (MODIFIED)

## Frontend UI
- [x] T6 — Cập nhật SubscriptionPricingCards.tsx hiển thị 2 gói Thường (99k) & Pro (249k), loại bỏ gói Free 0đ (REQ-01)
- [x] T7 — Cập nhật SubscriptionCheckoutModal.tsx: Bỏ stepper kho phụ, thêm checkbox option nhân viên (+30k cho Gói Thường) và stepper thêm chi nhánh (+80k cho Gói Pro) (REQ-02, REQ-03, REQ-04)
- [x] T8 — Cập nhật hiển thị Quota và thời hạn dùng thử 3 ngày tại BranchManagement (REQ-05, MODIFIED)

## Test & Verification
- [x] T9 — Kiểm thử toàn diện API tính tiền mua gói, kiểm tra Quota tạo chi nhánh và xác nhận build Backend + Frontend pass 100%

## REQ-01 / REQ-06: Dung lượng lưu trữ và mua thêm GB
- [x] T10 — Lưu quota/usage/GB mua thêm/tệp theo tenant và migration an toàn.
- [x] T11 — Tính giá addon 15k/GB/tháng + VAT khi mua gói, ghi giao dịch ví và chống thanh toán lặp.
- [x] T12 — API báo giá và mua GB giữa kỳ theo thời gian còn lại; kiểm tra quyền chủ gian hàng.
- [x] T13 — API đo usage, chặn upload vượt mức, xử lý upload/delete/expiry nhất quán.
- [x] T14 — UI hiển thị usage và mua thêm GB ở checkout và trang gói.
- [x] T15 — Test bảo mật tenant, thanh toán, hạn mức, expiry và build.
