# Proposal: Màn hình Quản lý Danh mục Hàng hóa Master, Đa Đơn vị tính & Bảng giá (`product-catalog-list`)

## Vấn đề
Cửa hàng tạp hóa kinh doanh hàng nghìn mặt hàng có nhiều cấp đơn vị quy đổi (Lon/Lốc/Thùng, Kg/Khay), cần tự động điền thông tin từ mã vạch chuẩn và kiểm soát lịch sử thay đổi giá bán/giá vốn.

## Mục tiêu
Xây dựng màn hình quản lý danh mục sản phẩm toàn chuỗi hỗ trợ đa ĐVT (`ProductUnit`), tra cứu nhanh từ kho mẫu toàn cầu, cấu hình hàng cân ký chia khay (`AllowRepack`) và lưu vết lịch sử giá.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/products`, `/products` (`src/features/product/pages/ProductListPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `MasterProductFilterBar`, `MasterProductTable`, `ProductFormModal`, `ProductDetailModal`, `ProductDeleteConfirmModal`, `CategoryModal`.
  - Tích hợp đầy đủ với tầng API Backend (`ProductsController`, `ProductUnitsController`) và thực thể nghiệp vụ (`Product`, `ProductUnit`, `ProductPriceHistory`, `Category`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/products`, `/products` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**
- **Nhân viên chi nhánh (Thu ngân / Thủ kho)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/products`, `/products`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-01-01` (FE-01).
