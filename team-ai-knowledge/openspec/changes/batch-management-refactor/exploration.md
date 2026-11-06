# Khám phá (Exploration): Refactor & Hoàn thiện Màn hình Quản lý Lô Hàng & Hạn Dùng (FEFO)

## 1. Hiện trạng Code & Bản đồ ảnh hưởng (Code Map)
- **Frontend**:
  - `MT_GRMS_FRONTEND/src/features/batch/pages/BatchListPage.tsx`: Khởi tạo state tĩnh `useState(MOCK_BATCH_ITEMS)` từ `mockBatchData.ts`. Giao diện cấu trúc cũ, chưa áp dụng bộ class của `src/styles/so-list-page.css`.
  - `MT_GRMS_FRONTEND/src/features/batch/components/BatchFilterBar.tsx`: Chứa các input lọc inline, layout chiếm nhiều diện tích, chưa có footer phân tách nút Search/Reset như `SupplierFilterBar.tsx`.
  - `MT_GRMS_FRONTEND/src/features/batch/components/BatchTable.tsx`: Bảng dữ liệu tự định nghĩa inline scroll, chưa đồng bộ chuẩn `.so-list-table-card` gồm `.so-list-table-head` và `.so-list-table-body`, footer phân trang chưa theo `.so-list-pager`.
  - `MT_GRMS_FRONTEND/src/features/batch/api/`: Hiện tại chưa có file `batchApi.ts`.
- **Backend**:
  - `MT_GRMS_BACKEND/src/MT_GRMS.Api/Controllers/BatchesController.cs`: Đã có `GetBatches`, `GetById`, `GetExpiryAlerts`, `CreateBatch`.
  - `MT_GRMS_BACKEND/src/MT_GRMS.Application/Batches/Dtos/BatchDtos.cs`: `BatchFilterQuery` chỉ mới có `Keyword`, `BranchId`, `Status`, `PageIndex`, `PageSize`.
  - `MT_GRMS_BACKEND/src/MT_GRMS.Infrastructure/Repositories/BatchRepository.cs`: Truy vấn bảng `Batches`, chưa hỗ trợ lọc riêng rẽ theo `ProductName`, `Sku`, `BatchCode`, `SupplierName` và chưa map tên Supplier thật.
  - `MT_GRMS_BACKEND/src/MT_GRMS.Infrastructure/Persistence/DatabaseSeeder.cs`: Chưa có dữ liệu mẫu thực tế cho bảng `Batches` với 4 trạng thái hạn dùng FEFO (`Expired`, `Critical`, `Warning`, `Normal`).

## 2. Assumptions (Giả định)
- Hệ thống hỗ trợ đa người thuê (Multi-tenancy) với `tenant_mt_mart_01` là tenant mặc định.
- Bảng `Batches` đã có trong database thông qua EF Core Migrations và được đồng bộ an toàn qua `DbInitializer.cs`.
- Chuẩn thiết kế `so-list-page.css` là chuẩn chung cho toàn bộ các màn hình danh sách của phân hệ Store Owner (`/store-owner/suppliers`, `/store-owner/supplier-returns`, `/store-owner/batches`).

## 3. Non-Goals (Những gì không làm)
- Không can thiệp vào nghiệp vụ trừ tồn kho POS bán lẻ hoặc quy trình duyệt nhập kho PO.
- Không sửa đổi cấu trúc bảng cơ sở dữ liệu `Batches` gốc (giữ nguyên các cột cốt lõi).
- Không chạy bước Test báo cáo kiểm thử và bước Archive theo chỉ đạo của người dùng.

## 4. Phương án xem xét
- **Phương án 1**: Chỉ thay đổi CSS trên Frontend giữ nguyên mock data.
  - *Ưu điểm*: Nhanh chóng.
  - *Nhược điểm*: Không đáp ứng yêu cầu người dùng ("hoàn thiện backend và frontend màn hình này"), dữ liệu không liên kết thực tế với hệ thống.
- **Phương án 2 (Được chọn)**: Hoàn thiện đồng bộ cả Backend và Frontend.
  - *Backend*: Mở rộng query lọc chi tiết, map dữ liệu nhà cung cấp thật, nạp seed data phong phú đủ 4 nhóm trạng thái hạn dùng FEFO, bổ sung schema check an toàn.
  - *Frontend*: Xây dựng `batchApi.ts` gọi backend thật, chuyển đổi toàn bộ `BatchListPage`, `BatchFilterBar`, `BatchTable` sang cấu trúc chuẩn `.so-list-header`, `.so-list-filter`, `.so-list-table-card`, `.so-list-pager` giống hệt `/store-owner/suppliers`. Bổ sung tính năng xuất Excel danh sách lô hàng.
  - *Lý do*: Đảm bảo tính nhất quán toàn diện về trải nghiệm người dùng, dữ liệu vận hành thật và tuân thủ chặt chẽ design system của dự án.

## 5. Rủi ro & Biện pháp giảm thiểu
- *Rủi ro*: Bảng `Batches` bị thiếu hoặc trống dữ liệu khi chạy môi trường mới.
- *Biện pháp*: Viết hàm `EnsureBatchSchemaAsync` trong `DbInitializer.cs` và nạp seed data 12+ lô hàng mẫu phong phú với đủ 4 dải hạn dùng trong `DatabaseSeeder.cs`.
