# Proposal: Màn hình Chi tiết Duyệt Phản hồi NCC, Sinh PO Đổi hàng & Bàn giao RTV (`supplier-return-detail`)

## Vấn đề
Sau khi gửi yêu cầu trả hàng, cửa hàng cần ghi nhận kết quả thương lượng với NCC, thanh toán phần chia sẻ chi phí đổi hàng (nếu có), sinh đơn PO nhận hàng đổi bù và xác nhận xuất kho bàn giao hàng lỗi cho xe NCC.

## Mục tiêu
Quản lý quy trình 4 bước khép kín trên `SupplierReturnDetailPage`: Gửi yêu cầu + Email NCC → Ghi nhận phản hồi NCC → Tạo PO đổi hàng / Thanh toán bù chi phí → Bàn giao tất toán tồn kho & công nợ.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/supplier-returns/:id` (`src/features/supplier-return/pages/SupplierReturnDetailPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `RecordSupplierResponseModal`, `CompleteHandoverModal`.
  - Tích hợp đầy đủ với tầng API Backend (`SupplierReturnsController`) và thực thể nghiệp vụ (`SupplierReturn`, `PurchaseOrder`, `SupplierAPLedger`, `BranchStock`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/supplier-returns/:id` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/supplier-returns/:id`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-09-10` (FE-09).
