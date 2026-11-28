# Proposal: Màn hình Gán Sản phẩm Cung ứng theo Nhà cung cấp & Bảng giá Mua (`supplier-product-mapping`)

## Vấn đề
Để đặt hàng chính xác trên Ma trận PO, cửa hàng cần xác định rõ nhà cung cấp nào cung ứng mặt hàng nào, đơn vị đặt mua, giá nhập thỏa thuận, số lượng đặt tối thiểu (MOQ) và NCC ưu tiên chính.

## Mục tiêu
Quản lý ma trận liên kết `SupplierProduct` kèm tính năng gán hàng loạt, chỉ định NCC chính (`Primary Supplier`) và nhập/xuất Excel bảng giá mua.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/suppliers/products`, `/store-owner/suppliers/:id/products`, `/suppliers/products` (`src/features/supplier/pages/SupplierProductManagementPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `SupplierProductFilterBar`, `SupplierProductTable`, `AssignProductModal`, `EditSupplierProductModal`, `SupplierProductImportResultModal`.
  - Tích hợp đầy đủ với tầng API Backend (`SuppliersController`) và thực thể nghiệp vụ (`SupplierProduct`, `Supplier`, `Product`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/suppliers/products`, `/store-owner/suppliers/:id/products`, `/suppliers/products` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/suppliers/products`, `/store-owner/suppliers/:id/products`, `/suppliers/products`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-09-04` (FE-09).
