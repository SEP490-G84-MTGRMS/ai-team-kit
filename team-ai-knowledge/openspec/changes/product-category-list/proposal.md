# Proposal: Màn hình Quản lý Nhóm hàng & Phân loại Ngành hàng (`product-category-list`)

## Vấn đề
Chủ cửa hàng cần tổ chức hàng hóa theo nhóm ngành hàng (Sữa, Đồ uống, Thực phẩm tươi sống, Hóa mỹ phẩm...) để lọc nhanh trên POS, tính thuế suất và cấu hình ngưỡng cận hạn.

## Mục tiêu
Cung cấp màn hình CRUD nhóm hàng hóa trực quan kèm thống kê số lượng sản phẩm liên kết và bảo vệ toàn vẹn khóa ngoại.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/categories`, `/categories`, `/products/categories` (`src/features/product/pages/CategoryListPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `CategoryModal`, `TablePagination`, `NotificationModal`.
  - Tích hợp đầy đủ với tầng API Backend (`CategoriesController`) và thực thể nghiệp vụ (`Category`, `Product`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/categories`, `/categories`, `/products/categories` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/categories`, `/categories`, `/products/categories`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-01-02` (FE-01).
