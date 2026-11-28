# Proposal: Màn hình Chi tiết Hồ sơ Nhà cung cấp, Chính sách Đổi trả & Sổ cái Công nợ AP (`supplier-detail`)

## Vấn đề
Mỗi nhà cung cấp có lịch giao hàng/giờ chốt đơn (Cut-off), ngày nghỉ lễ (Blackout), quy tắc đổi trả hàng cận hạn/lỗi (chia sẻ chi phí) và sổ cái công nợ phải trả theo từng hóa đơn khác nhau.

## Mục tiêu
Tích hợp đầy đủ 6 Tab cấu hình chuyên sâu và quản lý công nợ AP thời gian thực trên trang chi tiết Nhà cung cấp.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/suppliers/:id`, `/suppliers/:id` (`src/features/supplier/pages/SupplierDetailPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `SupplierDetailHeader`, `SupplierGeneralProfileTab`, `SupplierDeliveryConfigTab`, `SupplierHolidaysTab`, `SupplierReturnPolicyTab`, `SupplierPayablesTab`, `SupplierHistoryTab`, `SupplierBankModal`, `SupplierVatModal`.
  - Tích hợp đầy đủ với tầng API Backend (`SuppliersController`) và thực thể nghiệp vụ (`Supplier`, `SupplierReturnPolicy`, `SupplierReturnPolicyCategoryCostShare`, `SupplierBlackoutDate`, `SupplierAPLedger`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/suppliers/:id`, `/suppliers/:id` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/suppliers/:id`, `/suppliers/:id`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-09-03` (FE-09).
