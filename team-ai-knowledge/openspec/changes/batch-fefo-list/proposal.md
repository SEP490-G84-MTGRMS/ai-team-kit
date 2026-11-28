# Proposal: Màn hình Sổ lô Hàng hóa FEFO, Cảnh báo Hạn dùng & Giảm giá Xả hàng (`batch-fefo-list`)

## Vấn đề
Hàng tạp hóa và thực phẩm có hạn sử dụng ngắn rất dễ thất thoát nếu không theo dõi sát từng lô, cảnh báo cận hạn sớm, áp dụng giảm giá xả hàng (Markdown) hoặc chuyển nhanh sang kiểm kê/trả NCC.

## Mục tiêu
Quản lý sổ cái lô hàng FEFO (`BranchStock`), phân loại tự động Bình thường / Cận hạn / Hết hạn, áp mức giảm giá xả lô cận hạn và chọn nhiều lô để tạo nhanh Phiếu kiểm kê hoặc Phiếu trả NCC.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/batches`, `/store-owner/expiry`, `/batches`, `/expiry`, `/employee/batches` (`src/features/batch/pages/BatchListPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `BatchFilterBar`, `BatchTable`, `BatchDetailDrawer`, `BatchExpiryAlertModal`.
  - Tích hợp đầy đủ với tầng API Backend (`BatchesController`) và thực thể nghiệp vụ (`BranchStock`, `Product`, `Supplier`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/batches`, `/store-owner/expiry`, `/batches`, `/expiry`, `/employee/batches` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**
- **Nhân viên chi nhánh (Thu ngân / Thủ kho)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/batches`, `/store-owner/expiry`, `/batches`, `/expiry`, `/employee/batches`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-02-01` (FE-02).
