# Proposal: Màn hình Quản lý Đa Chi nhánh & Mua thêm Hạn mức Chi nhánh (`store-branch-management`)

## Vấn đề
Chuỗi cửa hàng tạp hóa cần mở thêm chi nhánh mới, quản lý trạng thái hoạt động từng điểm bán và mua thêm hạn ngạch chi nhánh khi chạm trần gói cước.

## Mục tiêu
Quản lý danh sách chi nhánh của Tenant kèm kiểm tra chặt chẽ hạn ngạch `MaxBranches` của gói dịch vụ và luồng mua Branch Add-on.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/settings?tab=branches` (`src/pages/store/StoreSettingsHubPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `BranchManagementTab`, `BranchAddonModal`.
  - Tích hợp đầy đủ với tầng API Backend (`BranchesController`, `TenantBranchAddonController`) và thực thể nghiệp vụ (`Branch`, `Tenant`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/settings?tab=branches` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/settings?tab=branches`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-21-09` (FE-21).
