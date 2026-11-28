# Proposal: Màn hình Lập Phiếu Yêu cầu Trả / Đổi hàng Nhà cung cấp (`supplier-return-form`)

## Vấn đề
Khi phát hiện hàng cận hạn, hư hỏng hoặc giao sai từ các phiếu nhập kho đã hoàn tất, cửa hàng cần lập yêu cầu trả/đổi hàng tuân thủ đúng hạn mức số lượng còn được phép trả và chính sách của từng NCC.

## Mục tiêu
Xây dựng form lập phiếu RTV từ phiếu nhập `COMPLETED` hoặc từ lô hàng chọn sẵn, tự động kiểm tra `availableReturnQty` và chính sách đổi trả `SupplierReturnPolicy`.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/supplier-returns/create` (`src/features/supplier-return/pages/SupplierReturnFormPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: Bố cục màn hình chuẩn hệ thống.
  - Tích hợp đầy đủ với tầng API Backend (`SupplierReturnsController`) và thực thể nghiệp vụ (`SupplierReturn`, `SupplierReturnPolicy`, `GoodsReceipt`, `BranchStock`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/supplier-returns/create` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**
- **Nhân viên chi nhánh (Thu ngân / Thủ kho)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/supplier-returns/create`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-09-09` (FE-09).
