# Proposal: Màn hình Tạo Phiếu Điều chuyển FEFO & Yêu cầu Xin hàng Khẩn cấp (`transfer-create-request`)

## Vấn đề
Khi điều chuyển hàng giữa các chi nhánh cần chọn đúng lô hàng chưa hết hạn tại kho gửi, hoặc khi một chi nhánh thiếu hàng đột xuất cho đơn khách đặt trước cần gửi yêu cầu xin hàng khẩn cấp tự động gợi ý kho nguồn còn tồn.

## Mục tiêu
Cung cấp màn hình tạo phiếu điều chuyển chọn lô FEFO/sao chép phiếu cũ/import Excel (`CreateTransferPage`) và màn hình xin hàng khẩn cấp có gợi ý phân bổ tồn toàn chuỗi (`CreateUrgentTransferRequestPage`).

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/transfers/create`, `/store-owner/transfers/request`, `/employee/transfers/request` (`src/features/transfer/pages/CreateTransferPage.tsx`, `src/features/transfer/pages/CreateUrgentTransferRequestPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `SelectBatchModal`, `ImportTransferExcelModal`.
  - Tích hợp đầy đủ với tầng API Backend (`TransfersController`, `TransferRequestsController`) và thực thể nghiệp vụ (`Transfer`, `TransferDetail`, `TransferRequest`, `TransferRequestDetail`, `BranchStock`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/transfers/create`, `/store-owner/transfers/request`, `/employee/transfers/request` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**
- **Nhân viên chi nhánh (Thu ngân / Thủ kho)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/transfers/create`, `/store-owner/transfers/request`, `/employee/transfers/request`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-15-02` (FE-15).
