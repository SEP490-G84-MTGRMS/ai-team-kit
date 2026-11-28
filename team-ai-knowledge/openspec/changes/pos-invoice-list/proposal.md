# Proposal: Màn hình Quản lý Hóa đơn Bán lẻ, Đơn Đặt trước & Đổi trả Hàng tại Quầy (`pos-invoice-list`)

## Vấn đề
Cửa hàng cần tra cứu toàn bộ hóa đơn bán lẻ và đơn khách đặt trước (Pre-order), xem chi tiết khuyến mãi/quà tặng đã áp dụng, giao hàng tất toán đơn đặt trước và xử lý khách mang hàng ra đổi/trả hoàn tiền tại quầy.

## Mục tiêu
Quản lý tập trung chứng từ bán hàng & đặt trước trên `InvoiceManagementPage`, hỗ trợ in lại bill K80, hoàn tất đơn đặt trước và đổi/trả hàng phân loại tình trạng kho.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/invoices`, `/store-owner/orders`, `/pos/invoices`, `/pos/orders`, `/employee/pos/invoices` (`src/features/pos/pages/InvoiceManagementPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `ReturnExchangeModal`, `CreatePreOrderModal`, `FulfillPreOrderModal`, `PosReceiptModal`, `TablePagination`, `SortableHeader`.
  - Tích hợp đầy đủ với tầng API Backend (`OrdersController`) và thực thể nghiệp vụ (`Order`, `OrderDetail`, `BranchStock`, `ShiftCashMovement`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/invoices`, `/store-owner/orders`, `/pos/invoices`, `/pos/orders`, `/employee/pos/invoices` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**
- **Nhân viên chi nhánh (Thu ngân / Thủ kho)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/invoices`, `/store-owner/orders`, `/pos/invoices`, `/pos/orders`, `/employee/pos/invoices`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-03-04` (FE-03).
