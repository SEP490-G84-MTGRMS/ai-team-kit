# Proposal: Màn hình Quản lý Chương trình Khuyến mãi, Chiết khấu Bậc thang & Mua X Tặng Y (`promotion-list`)

## Vấn đề
Cửa hàng tạp hóa cần thiết lập các chương trình khuyến mãi linh hoạt (giảm % hoặc tiền theo tổng hóa đơn, giảm giá trực tiếp sản phẩm, mua sản phẩm X tặng sản phẩm Y kèm đơn vị tính quà tặng) áp dụng tự động tại POS chống xung đột.

## Mục tiêu
Cung cấp màn hình quản lý danh sách và cấu hình điều kiện bậc thang `PromotionCondition` đồng bộ trực tiếp với bộ máy tính giá giỏ hàng POS.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/promotions`, `/promotions` (`src/features/promotion/pages/PromotionListPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `PromotionFilterBar`, `PromotionTable`, `PromotionModal`, `ConfirmDialog`.
  - Tích hợp đầy đủ với tầng API Backend (`PromotionsController`) và thực thể nghiệp vụ (`Promotion`, `PromotionCondition`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/promotions`, `/promotions` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/promotions`, `/promotions`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-16-01` (FE-16).
