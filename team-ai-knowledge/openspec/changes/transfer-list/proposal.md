# Proposal: Màn hình Quản lý Danh sách & Chi tiết Phiếu Điều chuyển Liên chi nhánh (`transfer-list`)

## Vấn đề
Chuỗi cửa hàng nhiều chi nhánh cần luân chuyển hàng hóa từ điểm thừa tồn sang điểm thiếu tồn và theo dõi chặt trạng thái hàng đang đi trên đường (`Đang chuyển`, `Hoàn tất`, `Hoàn tất có chênh lệch`, `Đã hoàn trả kho nguồn`).

## Mục tiêu
Quản lý toàn bộ danh sách phiếu điều chuyển nội bộ, lịch sử chuyển trạng thái, xuất kho xuất phát và xuất báo cáo Excel.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/transfers`, `/store-owner/transfers/:id`, `/transfers`, `/employee/transfers` (`src/features/transfer/pages/TransferListPage.tsx`, `src/features/transfer/pages/TransferDetailPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `TransferDetailModal`, `TablePagination`.
  - Tích hợp đầy đủ với tầng API Backend (`TransfersController`) và thực thể nghiệp vụ (`Transfer`, `TransferDetail`, `TransferStatusHistory`, `BranchStock`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/transfers`, `/store-owner/transfers/:id`, `/transfers`, `/employee/transfers` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**
- **Nhân viên chi nhánh (Thu ngân / Thủ kho)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/transfers`, `/store-owner/transfers/:id`, `/transfers`, `/employee/transfers`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-15-01` (FE-15).
