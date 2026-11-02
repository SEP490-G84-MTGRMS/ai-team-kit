# Tasks: dynamic-subscription-plans-from-db

## 1. Helper & Data Transformation (Frontend)
- [ ] T1 — Xây dựng hàm helper `mapBackendPlanToCardItem(backendPlan, currentPlanName, index)` trong `SubscriptionPricingCards.tsx`, trích xuất an toàn danh sách tính năng từ `features`, giới hạn chi nhánh từ `quotas`, format giá tiền, sinh theme color và gán cờ `highlight` (REQ-SUB-01, REQ-SUB-02).

## 2. Dynamic Pricing Component Rendering (Frontend)
- [ ] T2 — Cập nhật component `SubscriptionPricingCards.tsx`: loại bỏ hoàn toàn mảng tĩnh `SUBSCRIPTION_PLANS`, gọi `storeApi.getPricingPlans()` và render động 100% danh sách trả về từ API Backend (REQ-SUB-01).
- [ ] T3 — Thêm trạng thái Skeleton Loader khi đang tải dữ liệu và Empty State rõ ràng nếu danh sách trả về rỗng (REQ-SUB-03).
- [ ] T4 — Xử lý nút hành động trên thẻ: nếu gói đang dùng thì hiển thị "Gói đang dùng" (disabled), nếu gói trả phí thì nút "Mua ngay" mở `SubscriptionCheckoutModal.tsx` (REQ-SUB-02, REQ-SUB-04).

## 3. Modal & Store Hub Integration (Frontend)
- [ ] T5 — Kiểm tra và đảm bảo `SubscriptionCheckoutModal.tsx` nhận gói cước động, hiển thị thông tin tính tiền chính xác và gửi `planCode` hợp lệ lên `storeApi.purchaseSubscription` (REQ-SUB-04).

## 4. Verification & Testing
- [ ] T6 — Chạy kiểm thử tự động Frontend (`npm test` vitest) và Backend (`dotnet test`) để đảm bảo không phát sinh regression (REQ-SUB-01, REQ-SUB-02, REQ-SUB-04).
- [ ] T7 — Kiểm tra trực tiếp trên giao diện trình duyệt: xác nhận hiển thị đúng 2 thẻ cước từ Database (`FREE` và `PRO`) khớp với dữ liệu thực tế (REQ-SUB-01).
