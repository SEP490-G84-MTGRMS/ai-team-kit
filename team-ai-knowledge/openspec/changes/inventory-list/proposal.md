# Proposal: Màn hình Tồn kho Thời gian thực & Nhập đổi Trực tiếp Sales Nhà cung cấp (`inventory-list`)

## Vấn đề
Cửa hàng cần giám sát tồn kho khả dụng, tồn cách ly, hàng đang đặt theo thời gian thực tại từng chi nhánh, đồng thời xử lý nhanh nghiệp vụ thực tế khi nhân viên Sales của NCC ghé trực tiếp vừa giao thêm hàng mới vừa thu hồi đổi ngang hàng cận hạn/hư hỏng.

## Mục tiêu
Hiển thị bảng tồn kho đa chi nhánh (kèm xuất Excel/in A4) tích hợp luồng giao dịch nguyên tử `SupplierVisitModal` (nhập hàng mới + thu hồi đổi 1-1 tại chỗ).

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/inventory` (`src/features/inventory/pages/InventoryListPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `InventoryFilterBar`, `InventoryTable`, `SupplierVisitModal`.
  - Tích hợp đầy đủ với tầng API Backend (`InventoryController`, `SupplierDirectVisitsController`) và thực thể nghiệp vụ (`StockOnHand`, `BranchStock`, `GoodsReceipt`, `SupplierReturn`, `SupplierAPLedger`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/inventory` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**
- **Nhân viên chi nhánh (Thu ngân / Thủ kho)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/inventory`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-04-01` (FE-04).
