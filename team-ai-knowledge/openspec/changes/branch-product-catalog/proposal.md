# Proposal: Màn hình Gán Sản phẩm vào Chi nhánh, Giá bán Riêng & Định mức Tồn (`branch-product-catalog`)

## Vấn đề
Trong chuỗi nhiều cửa hàng, mỗi chi nhánh có danh mục mặt hàng kinh doanh riêng, mức giá bán theo từng ĐVT khác nhau theo khu vực và ngưỡng cảnh báo tồn tối thiểu/tối đa riêng.

## Mục tiêu
Quản lý bảng `BranchProducts` và `BranchProductUnitPrices` cho phép gán hàng loạt sản phẩm vào chi nhánh, chỉnh giá bán theo ĐVT và nhập/xuất bảng giá Excel.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/stores/products`, `/store-owner/stores/:id/products`, `/store-owner/branches/products` (`src/features/product/pages/StoreProductManagementPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `StoreProductContextCard`, `StoreProductFilterBar`, `StoreProductTable`, `AssignStoreProductModal`, `EditStoreProductModal`, `StoreProductImportResultModal`.
  - Tích hợp đầy đủ với tầng API Backend (`BranchesController`) và thực thể nghiệp vụ (`BranchProduct`, `BranchProductUnitPrice`, `Branch`, `Product`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/stores/products`, `/store-owner/stores/:id/products`, `/store-owner/branches/products` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/stores/products`, `/store-owner/stores/:id/products`, `/store-owner/branches/products`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-01-03` (FE-01).
