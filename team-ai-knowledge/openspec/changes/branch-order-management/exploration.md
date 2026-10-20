# Exploration: branch-order-management

## 1. Problem Statement
Màn hình "Đặt hàng theo chi nhánh" (`/store-owner/purchase-orders/branches` — `BranchOrderListPage.tsx`) trong hệ thống MT-GRMS đang gặp 2 vấn đề lớn:
1. **Frontend UI lỗi thời so với Design System**: Giao diện đang dùng bộ lọc `po-unified-bar` thanh đơn, bảng dữ liệu chưa có fixed/sticky header đồng bộ độc lập với vùng scroll body, footer phân trang chưa theo chuẩn phân trang tích hợp của hệ thống như màn hình Quản lý Nhà cung cấp (`SupplierListPage` tại `/store-owner/suppliers`).
2. **Backend chưa có module Quản lý Chi nhánh (Branch Management)**: Chưa có Entity `Branch`, chưa có cấu hình Code-First, migration cơ sở dữ liệu và REST API endpoint để truy vấn danh sách chi nhánh theo từng Tenant.

## 2. Context & Background
- Màn hình `SupplierListPage` (`/store-owner/suppliers`) vừa được chuẩn hóa toàn diện theo Design System MT-GRMS với cấu trúc:
  - `po-matrix-container` làm khung bao ngoài chống tràn layout.
  - Header chuẩn: Tiêu đề, icon, trạng thái tải (`Loader2`), các action buttons ("Lịch sử đơn hàng", "Xuất Excel").
  - Thanh `SupplierFilterBar` riêng biệt: Ô tìm kiếm từ khóa, các dropdown phân loại, nút "Tìm kiếm" và "Đặt lại".
  - Thẻ bảng `SupplierTable`: Sticky Header, cuộn dọc/ngang độc lập tại vùng tbody, badge trạng thái bo tròn ngữ nghĩa rõ ràng, cột hành động ("Đặt hàng", "Chi tiết").
  - Footer phân trang tích hợp: Thông tin số bản ghi hiển thị/tổng số, dropdown chọn số bản ghi/trang (10, 20, 30, 50), nút Trước/Sau và Trang x/y.
- Do đó, màn hình `BranchOrderListPage` cần được tái cấu trúc (refactor) toàn diện để đạt độ hoàn thiện và đồng nhất 100% với `SupplierListPage`.

## 3. Constraints
- **Kiến trúc Backend**: Clean Architecture 4 tầng (.NET 8, EF Core Code-First, PostgreSQL `mtgrms_db`).
- **Multi-Tenancy**: Bắt buộc kế thừa `BaseTenantEntity` (`Id`, `TenantId`, `CreatedAt`, `IsDeleted`) và tuân thủ Global Query Filter.
- **DTO-First Contract**: Controller mỏng (Thin Controller) tuyệt đối không reference Domain Entity ra ngoài, chỉ trả `ApiResponse<PagedResult<BranchDto>>`.
- **Frontend**: React 19, TypeScript, sử dụng hệ thống CSS tokens hiện có, không can thiệp làm vỡ các module lân cận (`OrderMatrixPage`, `SupplierOrderDispatchHubPage`).

## 4. Assumptions
- **[ASSUMPTION-01]**: Mỗi Tenant sở hữu một tập các chi nhánh độc lập. Seed data ban đầu sẽ tạo 5 chi nhánh mẫu chuẩn chuỗi siêu thị mini tại Hà Nội (Kho tổng DC1, Chi nhánh Cầu Giấy, Chi nhánh Đống Đa, Chi nhánh Hà Đông, Chi nhánh Ba Đình).
- **[ASSUMPTION-02]**: Màn hình `BranchOrderListPage` khi click "Đặt hàng" sẽ điều hướng sang `/store-owner/purchase-orders/create-matrix?branchId={branchId}`.
- **[ASSUMPTION-03]**: API Client frontend có cơ chế fallback mock data tự động nếu Backend chưa khởi chạy hoặc gặp sự cố mạng, bảo đảm UI luôn luôn render mượt mà.

## 5. Scope & Non-Goals
### In Scope
- **Backend**:
  - Entity `Branch` trong `MT_GRMS.Domain/Entities/SaaS/`.
  - Cấu hình Fluent API `BranchConfiguration.cs` và migration EF Core.
  - DTOs `BranchDtos.cs`, Service `IBranchService` và `BranchService` có phân trang, tìm kiếm và lọc.
  - API Controller `BranchesController` tại `/api/v1/branches`.
  - Unit tests xUnit kiểm thử nghiệp vụ BranchService và Controller.
- **Frontend**:
  - `BranchFilterBar.tsx` tách biệt (Từ khóa, Mã chi nhánh, Trạng thái, Tìm kiếm, Đặt lại).
  - `BranchOrderTable.tsx` đồng bộ layout `SupplierTable` (Sticky header, body scroll, pagination footer, responsive).
  - `BranchOrderListPage.tsx` kết nối state, gọi API client `branchApi.ts`, quản lý toast notification.

### Out of Scope (Non-Goals)
- Chức năng thêm/sửa/xóa chi nhánh (thuộc module SaaS Admin quản trị hệ thống chuỗi).
- Logic ma trận lưới đặt hàng đa ngày (`OrderMatrixPage`).
- Điều phối chốt đơn cutoff (`SupplierOrderDispatchHubPage`).

## 6. Các phương án kiến trúc
### Phương án 1 (Được chọn): Full-Stack Refactor & Backend Code-First
- Xây dựng Entity `Branch`, Migration EF Core, Service, Controller chuẩn Clean Architecture ở Backend.
- Tái cấu trúc toàn bộ Frontend components thành cấu trúc module hóa chuẩn `SupplierListPage`.
- **Ưu điểm**: Hoàn thành trọn vẹn cả 2 yêu cầu, dữ liệu lưu trữ thật trong PostgreSQL, hệ thống mở rộng bền vững.
- **Nhược điểm**: Cần thực hiện đầy đủ cả 2 repo.

### Phương án 2: Chỉ refactor UI Frontend với Mock Data
- Giữ nguyên mock data, chỉ sửa UI của `BranchOrderListPage`.
- **Ưu điểm**: Triển khai nhanh.
- **Nhược điểm**: Không đáp ứng yêu cầu người dùng ("code mới backend"), nợ kỹ thuật tồn đọng.

## 7. Success Criteria & Rủi ro
- **Tiêu chí thành công**:
  - Backend: Build 0 error, EF migration thành công, `GET /api/v1/branches` trả kết quả phân trang chuẩn, 100% tests xUnit pass.
  - Frontend: Giao diện `BranchOrderListPage` khớp 100% layout, filter bar, sticky header, body scroll và footer paging của `SupplierListPage`.
- **Rủi ro & Giảm thiểu**:
  - *Rủi ro*: Backend thiếu bảng hoặc migrate lỗi do foreign key.
  - *Giảm thiểu*: Cấu hình Entity đơn giản, độc lập trong `Domain/Entities/SaaS`, kế thừa `BaseTenantEntity`.
