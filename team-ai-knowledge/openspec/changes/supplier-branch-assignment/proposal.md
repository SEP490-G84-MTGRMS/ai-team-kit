# Proposal: Màn hình Phân bổ Nhà cung cấp Phụ trách Chi nhánh & Lịch Giao hàng (`supplier-branch-assignment`)

## Vấn đề
Trong chuỗi nhiều chi nhánh, không phải nhà cung cấp nào cũng giao tới mọi điểm bán và lịch thứ giao hàng trong tuần tại mỗi chi nhánh có thể khác nhau.

## Mục tiêu
Quản lý bảng phân bổ `SupplierBranchAssignment` kiểm soát phạm vi phục vụ, lịch ngày giao trong tuần và trạng thái hợp tác giữa từng cặp NCC – Chi nhánh.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/suppliers/branches`, `/store-owner/suppliers/:id/branches`, `/suppliers/branches` (`src/features/supplier/pages/SupplierBranchManagementPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `SupplierBranchFilterBar`, `SupplierBranchTable`, `AssignBranchModal`, `EditAssignmentModal`.
  - Tích hợp đầy đủ với tầng API Backend (`SuppliersController`) và thực thể nghiệp vụ (`SupplierBranchAssignment`, `Supplier`, `Branch`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/suppliers/branches`, `/store-owner/suppliers/:id/branches`, `/suppliers/branches` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/suppliers/branches`, `/store-owner/suppliers/:id/branches`, `/suppliers/branches`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-09-05` (FE-09).
