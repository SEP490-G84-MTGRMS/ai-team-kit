# Proposal: Màn hình Danh sách Phiếu Trả / Đổi hàng Nhà cung cấp (RTV List) (`supplier-return-list`)

## Vấn đề
Cửa hàng cần theo dõi tập trung các yêu cầu trả hoặc đổi hàng lỗi/cận hạn/sai quy cách với từng nhà cung cấp từ lúc khởi tạo đến khi NCC phản hồi và bàn giao xong hàng trả.

## Mục tiêu
Hiển thị danh sách chứng từ RTV phân trang theo chi nhánh, trạng thái xử lý, hình thức bồi hoàn và điều hướng nhanh sang Kiểm kê hoặc Nhập kho.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/supplier-returns` (`src/features/supplier-return/pages/SupplierReturnListPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `SupplierReturnFilterBar`, `SupplierReturnTable`.
  - Tích hợp đầy đủ với tầng API Backend (`SupplierReturnsController`) và thực thể nghiệp vụ (`SupplierReturn`, `Supplier`, `GoodsReceipt`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/supplier-returns` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**
- **Nhân viên chi nhánh (Thu ngân / Thủ kho)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/supplier-returns`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-09-08` (FE-09).
