# Proposal: Hoàn thiện Backend & Frontend Màn hình Quản lý Lô Hàng & Hạn Dùng (FEFO) theo chuẩn UI Suppliers

## 1. Vấn đề của code hiện tại
- **Frontend đang dùng Mock Data**: `BatchListPage.tsx` khởi tạo state từ `MOCK_BATCH_ITEMS` trong `mockBatchData.ts`, chưa hề có API client (`batchApi.ts`) để gọi backend thực tế.
- **UI chưa đồng bộ với Design System mới**: Màn hình `BatchListPage.tsx`, `BatchFilterBar.tsx`, và `BatchTable.tsx` đang dùng layout và inline-style cũ, không nhất quán với màn hình chuẩn mẫu `SupplierListPage.tsx` (`src/styles/so-list-page.css`: `.so-list-header`, `.so-list-title`, `.so-list-filter`, `.so-list-table-card`, `.so-list-pager`).
- **Backend chưa tối ưu cho bộ lọc chi tiết**: `BatchFilterQuery` và `BatchRepository` chỉ mới có lọc theo một `Keyword` chung chung, chưa hỗ trợ lọc riêng rẽ theo `ProductName`, `Sku`, `BatchCode`, `SupplierName` như người dùng thao tác trên form.
- **Thiếu Seed Data thực tế cho Batches**: `DatabaseSeeder.cs` chưa nạp sẵn dữ liệu cho bảng `Batches` với đầy đủ các mức độ cảnh báo hạn dùng (Expired, Critical, Warning, Normal) khiến giao diện trống khi khởi chạy.

## 2. Mục tiêu
- **Hoàn thiện Backend**: Mở rộng Dto và Repository hỗ trợ lọc đa tiêu chí, phân trang, sắp xếp và cung cấp dữ liệu lô hàng FEFO phong phú từ database.
- **Kết nối Backend & Frontend**: Xây dựng `batchApi.ts` sử dụng `httpClient` chuẩn hệ thống, hỗ trợ lấy danh sách, chi tiết và cập nhật vị trí lưu kho.
- **Đồng bộ UI theo chuẩn Suppliers**: Tái cấu trúc toàn bộ giao diện màn hình `BatchListPage` theo phong cách chuẩn của `SupplierListPage` (`so-list-page.css`), bao gồm:
  - Tiêu đề & Action bar trên cùng (`.so-list-header`, `.so-list-title`, `.so-list-header-actions`).
  - Thanh bộ lọc thống nhất (`.so-list-filter`, `.so-list-filter-row--footer`).
  - Bảng dữ liệu có sticky header, chia rõ vùng cuộn (`.so-list-table-card`, `.so-list-table-head`, `.so-list-table-body`).
  - Thanh phân trang footer đồng bộ (`.so-list-pager`).
- **Xuất Excel chuẩn doanh nghiệp**: Bổ sung tính năng xuất dữ liệu lô hàng ra file Excel (.xlsx) chuẩn thương hiệu giống màn hình Nhà cung cấp.

## 3. Phạm vi (Scope)
- **In-Scope**:
  - `MT_GRMS_BACKEND`: Cập nhật `BatchDtos.cs`, `BatchRepository.cs`, `BatchesController.cs`, `DbInitializer.cs`, `DatabaseSeeder.cs`.
  - `MT_GRMS_FRONTEND`: Thêm `batchApi.ts`, `batchExcelExporter.ts`. Refactor `BatchListPage.tsx`, `BatchFilterBar.tsx`, `BatchTable.tsx`.
- **Out-of-Scope**:
  - Thay đổi logic khấu trừ tồn kho POS bán lẻ hoặc quy trình duyệt chuyển kho.

## 4. Người dùng liên quan
- **Chủ cửa hàng (Store Owner)**: Theo dõi rủi ro hạn dùng trên toàn chuỗi hoặc theo từng chi nhánh, ra quyết định giảm giá hoặc xuất hủy hàng cận date.
- **Nhân viên kho (Employee)**: Tra cứu nhanh vị trí kệ hàng, ngày hết hạn và số lượng tồn thực tế của từng lô.

## 5. Tiêu chí thành công
- Màn hình `http://localhost:5173/store-owner/batches` tải dữ liệu trực tiếp từ API `GET /api/v1/batches`.
- Bộ lọc theo từ khóa, chi nhánh, trạng thái hạn dùng và phân trang hoạt động chính xác.
- Giao diện khớp 100% với phong cách của `SupplierListPage` (`so-list-page.css`).
- Build frontend và backend thành công với exit code 0.
