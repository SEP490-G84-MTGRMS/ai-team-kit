# Proposal: Màn hình Tạo Phiên Kiểm kê & Nhập Số đếm Thực tế theo Lô (`stocktake-form`)

## Vấn đề
Nhân viên kho cần lập phiếu kiểm kê nhanh cho một nhóm hàng hoặc từ các lô cận hạn được chọn, nhập số lượng đếm thực tế và phân loại số lượng hàng hư hỏng/hết hạn ngay tại kệ.

## Mục tiêu
Xây dựng form tạo/chỉnh sửa phiên kiểm kê hỗ trợ nạp tự động các lô có tồn `> 0`, lưu nháp nhiều lần và gửi trình Chủ cửa hàng phê duyệt.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/stocktakes/create`, `/store-owner/stocktakes/:id/edit`, `/employee/stocktakes/create`, `/employee/stocktakes/:id/edit` (`src/features/stocktake/pages/StocktakeFormPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `StocktakeFormHeaderCard`, `StocktakeProductEntryTable`, `StocktakeAddProductModal`, `StocktakeFormFooter`.
  - Tích hợp đầy đủ với tầng API Backend (`StocktakesController`) và thực thể nghiệp vụ (`Stocktake`, `BranchStock`, `Product`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/stocktakes/create`, `/store-owner/stocktakes/:id/edit`, `/employee/stocktakes/create`, `/employee/stocktakes/:id/edit` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**
- **Nhân viên chi nhánh (Thu ngân / Thủ kho)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/stocktakes/create`, `/store-owner/stocktakes/:id/edit`, `/employee/stocktakes/create`, `/employee/stocktakes/:id/edit`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-04-04` (FE-04).
