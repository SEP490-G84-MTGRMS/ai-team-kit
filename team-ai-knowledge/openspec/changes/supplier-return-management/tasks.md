# Tasks: supplier-return-management

## Backend
- [x] B1 — Tạo Domain Entities & DbSets: `SupplierReturn`, `SupplierReturnLine` trong `MT_GRMS.Domain/Entities/Supplier/`, cấu hình trong `AppDbContext.cs`
- [x] B2 — Xây dựng DTOs & Commands (`SupplierReturnDtos.cs`): DTO danh sách, DTO chi tiết, `CreateSupplierReturnCommand`, `RecordSupplierResponseCommand`, `CompleteHandoverCommand`, `CancelSupplierReturnCommand`
- [x] B3 — Xây dựng Repository (`ISupplierReturnRepository.cs` / `SupplierReturnRepository.cs`): Truy vấn phân trang, tìm kiếm, lấy các GRN đủ điều kiện trả (`COMPLETED`), tính toán `AvailableReturnQty`
- [x] B4 — Hoàn thiện Business Service (`SupplierReturnService.cs`):
  - Kiểm tra phiếu nhập gốc phải ở trạng thái `COMPLETED`.
  - Kiểm tra số lượng trả không vượt quá `AvailableReturnQty`.
  - Khóa hàng chờ trả vào `PENDING_RETURN` khi gửi yêu cầu `PENDING_SUPPLIER`.
  - Ghi nhận phản hồi NCC: `APPROVED` (chấp nhận toàn bộ / một phần) hoặc `REJECTED`.
  - Hoàn tất bàn giao `COMPLETED`: Trừ tồn kho `BranchStocks` đúng bằng `HandedOverQty`.
  - Hủy phiếu `CANCELLED`: Giải phóng số lượng đang chờ trả.
- [x] B5 — Mở Controller Endpoints (`SupplierReturnsController.cs`): Đầy đủ các REST API theo hợp đồng specs.md
- [x] B6 — Viết bộ Unit Tests (`SupplierReturnTests.cs`): Kiểm thử toàn diện các luồng nghiệp vụ

## Frontend
- [x] T1 — Xây dựng Types & API Client (`supplierReturn.types.ts`, `supplierReturnApi.ts`): Kết nối backend endpoints kèm fallback dữ liệu mẫu
- [x] T2 — Xây dựng Màn hình Danh sách Phiếu Trả Hàng (`SupplierReturnListPage.tsx`): Bảng 10 cột, thẻ KPI tổng quan, thanh lọc đa tiêu chí, phân trang
- [x] T3 — Xây dựng Màn hình Tạo Phiếu Trả Hàng (`SupplierReturnFormPage.tsx`): Chọn GRN gốc, bảng sản phẩm tính `AvailableReturnQty`, cảnh báo nhập quá số lượng, nhập lý do
- [x] T4 — Xây dựng Màn hình Chi tiết Phiếu Trả Hàng (`SupplierReturnDetailPage.tsx`): Tiến trình trạng thái, Modal ghi nhận phản hồi NCC, Modal xác nhận bàn giao thực tế, Hủy phiếu
- [x] T5 — Cập nhật `router.tsx` và `AppTopNav.tsx`: Đăng ký route `/store-owner/supplier-returns` và thêm mục menu "Trả hàng NCC"

## Test & Verification
- [x] T6 — Chạy kiểm tra biên dịch Vite (`npm run build`) và Unit Tests Backend (`dotnet test`) bảo đảm 100% đạt
