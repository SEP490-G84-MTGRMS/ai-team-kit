# Proposal: Màn hình Đóng khay Chia nhỏ Hàng tươi sống Cân ký & In Tem Barcode Khay (`batch-repack-packages`)

## Vấn đề
Các mặt hàng thịt, cá, rau củ quả nhập về theo lô cân ký lớn nhưng tại quầy cần chia sẵn thành từng khay/túi nhỏ có trọng lượng tịnh, giá tiền và mã vạch riêng để thu ngân POS quét thanh toán nhanh.

## Mục tiêu
Quản lý trọn vẹn quy trình chế biến đóng khay (`RepackOrder`) từ lô hàng gốc, sinh mã vạch riêng cho từng khay (`Package`), xuất PDF in tem dán khay, cập nhật giá và hủy/cách ly khay hỏng.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/batches/:batchId/packages`, `/employee/batches/:batchId/packages` (`src/features/batch/pages/BatchPackageManagePage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `BatchRepackModal`.
  - Tích hợp đầy đủ với tầng API Backend (`RepackOrdersController`) và thực thể nghiệp vụ (`RepackOrder`, `Package`, `BranchStock`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/batches/:batchId/packages`, `/employee/batches/:batchId/packages` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**
- **Nhân viên chi nhánh (Thu ngân / Thủ kho)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/batches/:batchId/packages`, `/employee/batches/:batchId/packages`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-02-07` (FE-02).
