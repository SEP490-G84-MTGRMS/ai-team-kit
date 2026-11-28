# Proposal: Màn hình Kho Danh mục Hàng hóa Mẫu Toàn cầu FMCG (`admin-master-catalog`)

## Vấn đề
Các tiệm tạp hóa mới mất nhiều thời gian nhập tay hàng nghìn mặt hàng FMCG phổ thông; nền tảng cần một thư viện sản phẩm mẫu chuẩn hóa theo mã vạch EAN/Barcode dùng chung toàn hệ thống.

## Mục tiêu
Cho phép Master Admin quản lý CRUD thư viện `MasterProduct`, đơn vị quy đổi mẫu và nhập/xuất hàng loạt bằng Excel để các cửa hàng tra cứu tự động khi tạo sản phẩm.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/admin/master-catalog` (`src/pages/admin/MasterCatalogPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `MasterCatalogKpiBanner`, `MasterCatalogFilterBar`, `MasterCatalogTable`, `MasterProductModal`, `MasterExcelImportModal`.
  - Tích hợp đầy đủ với tầng API Backend (`AdminMasterCatalogController`) và thực thể nghiệp vụ (`MasterProduct`, `MasterProductUnit`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/admin/master-catalog` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Quản trị viên nền tảng (Master Admin)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/admin/master-catalog`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-21-04` (FE-21).
