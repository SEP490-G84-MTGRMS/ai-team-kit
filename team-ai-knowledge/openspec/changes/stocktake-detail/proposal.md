# Proposal: Màn hình Đối chiếu Chênh lệch, Phê duyệt Cân bằng Kho & Tạo Trả hàng từ Kiểm kê (`stocktake-detail`)

## Vấn đề
Trước khi điều chỉnh tồn kho thực tế, Chủ cửa hàng cần rà soát bảng chênh lệch thừa/thiếu, xác minh nguồn hàng thừa, quyết định xuất hủy hay cách ly chờ trả NCC đối với hàng lỗi và khởi tạo trực tiếp phiếu RTV từ kết quả kiểm kê.

## Mục tiêu
Cung cấp màn hình phê duyệt kiểm kê chuyên sâu hỗ trợ Duyệt cân bằng kho, Từ chối, Yêu cầu đếm lại và Sinh phiếu trả hàng Nhà cung cấp ngay sau khi duyệt.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/stocktakes/:id`, `/stocktakes/:id`, `/employee/stocktakes/:id` (`src/features/stocktake/pages/StocktakeDetailPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: Bố cục màn hình chuẩn hệ thống.
  - Tích hợp đầy đủ với tầng API Backend (`StocktakesController`, `SupplierReturnsController`) và thực thể nghiệp vụ (`Stocktake`, `BranchStock`, `StockOnHand`, `SupplierReturn`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/stocktakes/:id`, `/stocktakes/:id`, `/employee/stocktakes/:id` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**
- **Nhân viên chi nhánh (Thu ngân / Thủ kho)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/stocktakes/:id`, `/stocktakes/:id`, `/employee/stocktakes/:id`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-04-06` (FE-04).
