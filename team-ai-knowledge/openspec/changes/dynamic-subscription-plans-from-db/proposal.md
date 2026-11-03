# Proposal: dynamic-subscription-plans-from-db

## 1. Mô tả lỗi
- Trên màn hình Gói dịch vụ (`/store-owner/subscriptions?tab=subscriptions`), giao diện hiển thị 3 thẻ giá cước (Gói hỗ trợ 270.000 đ, Gói Doanh Nghiệp Toàn Năng 999.000 đ, Gói cao cấp 490.000 đ).
- Trong khi đó, tại cơ sở dữ liệu (`mtgrms_db.SubscriptionPlans`), thực tế hiện tại chỉ có 2 gói cước đang được lưu trữ là `FREE` (Gói Cơ Bản Miễn Phí - 0 đ) và `PRO` (Gói Doanh Nghiệp Toàn Năng - 999.000 đ).
- Nguyên nhân: Component `SubscriptionPricingCards.tsx` đang duyệt trên mảng tĩnh hardcode 3 phần tử (`SUBSCRIPTION_PLANS`) và chỉ ghi đè thuộc tính khi trùng `PlanCode`. Do đó, các gói không có trong Database vẫn hiển thị dữ liệu tĩnh mẫu, còn các gói cước thực tế trong Database như gói `FREE` lại bị bỏ qua, dẫn đến tình trạng Database có 2 gói nhưng giao diện hiển thị 3 gói.

## 2. Các bước tái hiện lỗi
1. Truy vấn cơ sở dữ liệu bảng `SubscriptionPlans`: Kiểm tra thấy chỉ có 2 bản ghi (`plan_free` và `plan_pro`).
2. Khởi chạy hệ thống Frontend và Backend.
3. Đăng nhập Store Owner và truy cập trang `http://localhost:5173/store-owner/subscriptions?tab=subscriptions`.
4. Quan sát số lượng thẻ cước hiển thị: Giao diện hiển thị 3 thẻ (thẻ giữa cập nhật theo DB 999k, 2 thẻ còn lại vẫn giữ nguyên dữ liệu tĩnh 270k và 490k).

## 3. Kết quả thực tế vs Kết quả mong đợi
- **Kết quả thực tế**: Giao diện hiển thị 3 thẻ giá cước lai ghép giữa dữ liệu tĩnh và dữ liệu DB, gây nhầm lẫn cho chủ gian hàng.
- **Kết quả mong đợi**: Giao diện hiển thị danh sách thẻ cước hoàn toàn động 100% dựa trên dữ liệu trả về từ API `GET /api/v1/tenant/pricing-plans` (truy vấn trực tiếp từ bảng `SubscriptionPlans`). Trong Database có bao nhiêu gói `IsActive = true` thì hiển thị chính xác bấy nhiêu gói (hiện tại hiển thị đúng 2 gói `FREE` và `PRO`, khi Admin thêm hoặc chỉnh sửa gói thì giao diện tự động cập nhật đồng bộ).

## 4. Mức độ ảnh hưởng
- **Đối tượng ảnh hưởng**: Chủ cửa hàng (Store Owner), nhân viên bán hàng và Master Admin.
- **Rủi ro nghiệp vụ**: Người dùng thấy thông tin sai lệch giữa danh mục gói dịch vụ của hệ thống và trang thanh toán; có thể bấm mua gói không tồn tại trong cấu hình hệ thống.
- **Tính toàn vẹn dữ liệu**: Dữ liệu DB không bị hỏng, lỗi nằm ở tầng hiển thị và mapping dữ liệu của Frontend.

## 5. Tiêu chí thành công (Definition of Done)
- [ ] Loại bỏ hoàn toàn mảng tĩnh `SUBSCRIPTION_PLANS` khỏi luồng render chính của `SubscriptionPricingCards.tsx`.
- [ ] Giao diện render động 100% danh sách gói cước nhận được từ API `GET /api/v1/tenant/pricing-plans`.
- [ ] Hỗ trợ mapping trực tiếp từ dữ liệu DB sang UI: Tên gói (`PlanName`), giá tháng (`PriceMonthly`), giá năm (`PriceYearly`), giới hạn (`MaxBranches`, `MaxStaff`), và danh sách tính năng từ `EnabledModulesJson` / `Features`.
- [ ] Hiển thị chính xác số lượng gói cước khớp với Database (2 gói `FREE` và `PRO`).
- [ ] Hỗ trợ trạng thái Loading (Skeleton / Spinner) và Empty State khi chưa tải xong dữ liệu.
- [ ] Hộp thoại thanh toán `SubscriptionCheckoutModal.tsx` nhận gói cước động và thực hiện giao dịch chính xác với backend.
- [ ] 100% test kiểm thử tự động Frontend (`vitest`) và Backend (`dotnet test`) đều Passed.
