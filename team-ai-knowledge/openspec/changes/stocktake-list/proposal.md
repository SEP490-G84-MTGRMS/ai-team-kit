# Proposal: Màn hình Danh sách Phiên Kiểm kê Kho Đa Chi nhánh (`stocktake-list`)

## Vấn đề
Chủ cửa hàng và nhân viên kho cần theo dõi tiến độ các phiên kiểm kê định kỳ hoặc đột xuất (Nháp, Chờ duyệt, Đã duyệt, Từ chối, Yêu cầu đếm lại) trên từng chi nhánh.

## Mục tiêu
Cung cấp bảng quản lý các phiên kiểm kê có tìm kiếm, sắp xếp đa cột, lọc trạng thái/phạm vi kiểm kê và phân quyền theo chi nhánh nhân viên.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/stocktakes`, `/stocktakes`, `/employee/stocktakes`, `/employees/stocktakes` (`src/features/stocktake/pages/StocktakeListPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `TablePagination`.
  - Tích hợp đầy đủ với tầng API Backend (`StocktakesController`) và thực thể nghiệp vụ (`Stocktake`, `Branch`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/stocktakes`, `/stocktakes`, `/employee/stocktakes`, `/employees/stocktakes` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**
- **Nhân viên chi nhánh (Thu ngân / Thủ kho)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/stocktakes`, `/stocktakes`, `/employee/stocktakes`, `/employees/stocktakes`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-04-03` (FE-04).
