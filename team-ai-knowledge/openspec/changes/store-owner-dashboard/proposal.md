# Proposal: Màn hình Tổng quan Chủ cửa hàng (Store Owner Dashboard) (`store-owner-dashboard`)

## Vấn đề
Chủ cửa hàng cần một bảng điều khiển duy nhất ngay khi đăng nhập để nắm bắt doanh thu thực tế theo giờ/ngày, tăng trưởng so với kỳ trước, cảnh báo tồn kho thấp/lô cận hạn và dòng tiền.

## Mục tiêu
Tổng hợp dữ liệu thời gian thực từ đơn hàng POS, sổ quỹ, nhập hàng và tồn kho theo từng chi nhánh hoặc toàn chuỗi.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner`, `/store-owner/dashboard` (`src/features/store-owner-dashboard/pages/StoreOwnerDashboardPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: Bố cục màn hình chuẩn hệ thống.
  - Tích hợp đầy đủ với tầng API Backend (`StoreOwnerDashboardController`) và thực thể nghiệp vụ (`Order`, `CashbookEntry`, `GoodsReceipt`, `BranchStock`, `StockOnHand`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner`, `/store-owner/dashboard` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner`, `/store-owner/dashboard`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-10-00` (FE-10).
