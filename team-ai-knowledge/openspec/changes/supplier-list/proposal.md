# Proposal: Màn hình Danh mục Nhà cung cấp & Quản lý Hồ sơ Chung (`supplier-list`)

## Vấn đề
Cửa hàng làm việc với nhiều nhà cung cấp (tươi sống, FMCG, đông lạnh) cần quản lý tập trung thông tin pháp lý, mã số thuế, nhóm ngành, dư nợ phải trả hiện tại và trạng thái giao dịch.

## Mục tiêu
Cung cấp màn hình tra cứu, tạo mới, cập nhật nhanh, đổi trạng thái hoạt động và xuất Excel danh sách Nhà cung cấp trong phạm vi Tenant.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/suppliers`, `/suppliers` (`src/features/supplier/pages/SupplierListPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `SupplierFilterBar`, `SupplierTable`, `CreateSupplierModal`, `EditSupplierModal`.
  - Tích hợp đầy đủ với tầng API Backend (`SuppliersController`) và thực thể nghiệp vụ (`Supplier`, `SupplierAPLedger`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/suppliers`, `/suppliers` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**
- **Nhân viên chi nhánh (Thu ngân / Thủ kho)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/suppliers`, `/suppliers`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-09-01` (FE-09).
