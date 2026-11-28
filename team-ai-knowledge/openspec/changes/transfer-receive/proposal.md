# Proposal: Màn hình Xác nhận Nhận hàng Điều chuyển & Ghi nhận Chênh lệch (`transfer-receive`)

## Vấn đề
Khi hàng điều chuyển tới chi nhánh nhận, nhân viên kho cần kiểm đếm số lượng thực nhận theo từng lô; nếu xảy ra thiếu hụt hoặc hư hỏng dọc đường cần bắt buộc giải trình lý do chênh lệch trước khi nhập kho đích.

## Mục tiêu
Xây dựng màn hình kiểm nhận hàng điều chuyển bảo toàn thông tin mã lô/hạn sử dụng gốc từ chi nhánh gửi sang chi nhánh nhận.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/transfers/:id/receive`, `/transfers/:id/receive`, `/employee/transfers/:id/receive` (`src/features/transfer/pages/ReceiveTransferPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: Bố cục màn hình chuẩn hệ thống.
  - Tích hợp đầy đủ với tầng API Backend (`TransfersController`) và thực thể nghiệp vụ (`Transfer`, `TransferDetail`, `BranchStock`, `StockOnHand`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/transfers/:id/receive`, `/transfers/:id/receive`, `/employee/transfers/:id/receive` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**
- **Nhân viên chi nhánh (Thu ngân / Thủ kho)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/transfers/:id/receive`, `/transfers/:id/receive`, `/employee/transfers/:id/receive`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-15-03` (FE-15).
