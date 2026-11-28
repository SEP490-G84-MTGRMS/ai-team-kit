# Proposal: Màn hình Ma trận Đặt hàng Nhiều ngày & Kiểm soát Cut-off / MOQ (`po-order-matrix`)

## Vấn đề
Đặt hàng tạp hóa lặp lại theo lịch giao nhiều ngày trong tuần của nhiều NCC; nhập từng form đơn lẻ rất chậm và dễ đặt nhầm vào ngày nghỉ của NCC hoặc sau giờ khóa sổ Cut-off.

## Mục tiêu
Xây dựng lưới Ma trận đặt hàng đa ngày (`OrderMatrixPage`) tự động gợi ý số lượng cần đặt dựa trên tồn kho, khóa ô vi phạm lịch giao/Cut-off, hỗ trợ import Excel và tách PO tự động theo từng NCC + Ngày giao.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/purchase-orders/create-matrix`, `/branch/purchase-orders/create-matrix`, `/employee/purchase-orders/create-matrix` (`src/features/purchase-order/pages/OrderMatrixPage.tsx`, `src/features/purchase-order/pages/EmployeeOrderMatrixPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `OrderMatrixHeader`, `OrderMatrixFilterBar`, `OrderMatrixTable`, `OrderMatrixSplitModal`, `OrderMatrixImportPreviewModal`.
  - Tích hợp đầy đủ với tầng API Backend (`PurchaseOrdersController`) và thực thể nghiệp vụ (`PurchaseOrder`, `PurchaseOrderDetail`, `SupplierBranchAssignment`, `SupplierBlackoutDate`, `SupplierProduct`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/purchase-orders/create-matrix`, `/branch/purchase-orders/create-matrix`, `/employee/purchase-orders/create-matrix` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**
- **Nhân viên chi nhánh (Thu ngân / Thủ kho)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/purchase-orders/create-matrix`, `/branch/purchase-orders/create-matrix`, `/employee/purchase-orders/create-matrix`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-05-02` (FE-05).
