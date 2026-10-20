# Proposal: branch-order-management

## 1. Vấn đề
Trong hệ thống Multi-Tenant Grocery Retail Management System (MT-GRMS), luồng đặt hàng mua từ nhà cung cấp bắt đầu từ màn hình trung tâm **"Đặt hàng theo chi nhánh"** (`/store-owner/purchase-orders/branches` — `BranchOrderListPage.tsx`). Tuy nhiên, hiện tại màn hình này và hạ tầng backend đang gặp các vấn đề cốt lõi:
1. **Dữ liệu giả lập (Mock Data)**: Frontend đang hoàn toàn phụ thuộc vào danh sách tĩnh `MOCK_BRANCH_LIST`, chưa có kết nối REST API thực tế với cơ sở dữ liệu.
2. **Giao diện chưa đồng bộ Design System**: Màn hình sử dụng định dạng cũ với thanh tìm kiếm `po-unified-bar` đơn sơ, chưa được chuẩn hóa theo format UI mới nhất của `SupplierListPage` (`/store-owner/suppliers`):
   - Thiếu thanh lọc chuyên biệt (`BranchFilterBar`) gồm bộ tìm kiếm từ khóa đa trường, bộ lọc mã chi nhánh, trạng thái hoạt động và các nút bấm Tìm kiếm/Đặt lại.
   - Bảng dữ liệu chưa có cấu trúc Header cố định (Sticky Header) đồng bộ kích thước cột với Body cuộn dọc/ngang độc lập (`po-matrix-container`).
   - Phân trang chưa tích hợp liền mạch vào Footer của thẻ bảng dữ liệu.
3. **Backend thiếu hụt phân hệ Quản lý Chi nhánh (Branch Management)**: Trong kiến trúc .NET 8 Clean Architecture & Code-First, chưa có Entity `Branch`, cấu hình Fluent API, dịch vụ nghiệp vụ `IBranchService` và `BranchesController` hỗ trợ truy vấn phân trang, tìm kiếm và lọc dữ liệu chi nhánh theo từng Tenant.

## 2. Mục tiêu
1. **Xây dựng mới Backend API Quản lý Chi nhánh**:
   - Khởi tạo Entity `Branch` kế thừa `BaseTenantEntity` trong tầng `Domain`.
   - Cấu hình Fluent API Code-First trong `Infrastructure`, sinh Migration EF Core cập nhật cơ sở dữ liệu PostgreSQL (`mtgrms_db`).
   - Cài đặt `IBranchService` và `BranchService` tại tầng `Application`, xử lý phân trang, lọc theo từ khóa, mã chi nhánh, trạng thái hoạt động với Global Query Filter đa người thuê.
   - Cung cấp REST API Controller `BranchesController` chuẩn Thin Controller trả về `ApiResponse<PagedResult<BranchDto>>`.
   - Viết bộ kiểm thử tự động xUnit đảm bảo kiểm chứng chất lượng code.
2. **Tái cấu trúc (Refactor) toàn diện UI Frontend**:
   - Refactor `BranchOrderListPage.tsx` theo 100% format UI của `SupplierListPage`: Header chuẩn, Action buttons (Lịch sử đơn hàng, Xuất Excel, Làm mới), trạng thái xoay loading (`Loader2`).
   - Xây dựng component `BranchFilterBar.tsx` tách biệt: Ô tìm kiếm từ khóa (Mã, Tên, Địa chỉ, Quản lý, SĐT), dropdown lọc Mã chi nhánh, dropdown Trạng thái, nút Tìm kiếm và nút Đặt lại.
   - Chuẩn hóa `BranchOrderTable.tsx`: Khung bảng fixed header, thân bảng cuộn độc lập, badge trạng thái (Hoạt động / Ngừng hoạt động), nút hành động "Đặt hàng" (chuyển sang `OrderMatrixPage`) và "Chi tiết".
   - Tích hợp thanh Footer phân trang đồng bộ: Thông tin bản ghi hiển thị/tổng số, bộ chọn kích cỡ trang (10, 20, 30, 50), chuyển trang Trước/Sau.
   - Xây dựng API client `branchApi.ts` kết nối trực tiếp Backend với cơ chế fallback mock data an toàn.

## 3. Phạm vi (Scope)

### Trong phạm vi (In Scope)
- **Backend (.NET 8 Clean Architecture)**:
  - `Domain/Entities/SaaS/Branch.cs`: `Code`, `Name`, `Address`, `Phone`, `ManagerName`, `Status`, `PendingOrdersCount`, `LastOrderDate`.
  - `Infrastructure/Persistence/Configurations/SaaS/BranchConfiguration.cs`: Khóa chính, chỉ mục B-Tree, độ dài trường, multi-tenant index.
  - EF Core Migration tạo bảng `branches` và nạp seed data mẫu ban đầu cho tenant mặc định.
  - `Application/Branches/Dtos/BranchDtos.cs`: `BranchDto`, `BranchFilterQuery`, `CreateBranchRequest`.
  - `Application/Branches/IBranchService.cs` & `BranchService.cs`: Nghiệp vụ tìm kiếm, phân trang và truy vấn chi tiết.
  - `Api/Controllers/BranchesController.cs`: Endpoint `GET /api/v1/branches`, `GET /api/v1/branches/{id}`.
  - `tests/MT_GRMS.UnitTests/BranchManagementTests.cs`: Unit tests xUnit cho Branch Service và Controller.
- **Frontend (React 19 + TypeScript + Vite)**:
  - `features/purchase-order/api/branchApi.ts`: Giao tiếp axios với `/api/v1/branches`.
  - `features/purchase-order/types/branch.types.ts`: Định nghĩa interfaces DTO và Filter state.
  - `features/purchase-order/components/branch/BranchFilterBar.tsx`: Thanh lọc đa tiêu chí chuẩn thiết kế.
  - `features/purchase-order/components/branch/BranchOrderTable.tsx`: Tái cấu trúc layout table header, body scroll, action links và pagination footer.
  - `features/purchase-order/pages/BranchOrderListPage.tsx`: Ghép nối trang hoàn chỉnh, quản lý state, toast notification.

### Ngoài phạm vi (Out of Scope)
- Luồng ma trận chọn sản phẩm nhập hàng đa ngày (`OrderMatrixPage` - đã có màn hình riêng).
- Luồng chốt PO cutoff hub (`SupplierOrderDispatchHubPage`).
- Nghiệp vụ nhập kho GRN thực tế (`GoodsReceiptListPage`).

## 4. Người dùng liên quan
| Vai trò | Quyền hạn & Nghiệp vụ |
|---|---|
| **Store Owner (Chủ cửa hàng / Chủ chuỗi)** | Quản lý danh sách chi nhánh trực thuộc chuỗi, kiểm tra số đơn PO đang chờ xử lý của từng chi nhánh, truy cập nhanh sang ma trận đặt hàng (`OrderMatrixPage`) cho từng chi nhánh. |
| **System Admin** | Quản trị thiết lập chi nhánh trên toàn hệ thống SaaS. |

## 5. Tiêu chí thành công (Success Criteria)
- [ ] Backend: Solution `MT_GRMS_BACKEND.sln` biên dịch 0 Error, 0 Warning. Bộ kiểm thử xUnit cho Branch đạt 100% PASS.
- [ ] Database: Migration EF Core cập nhật thành công bảng `branches` với seed data các chi nhánh mẫu tại Hà Nội.
- [ ] API Endpoint: Gọi `GET /api/v1/branches` trả về đúng cấu trúc chuẩn `ApiResponse<PagedResult<BranchDto>>` kèm theo thông tin phân trang và bộ lọc hoạt động chính xác.
- [ ] Frontend UI: Màn hình `http://localhost:5173/store-owner/purchase-orders/branches` hiển thị đồng bộ 100% phong cách của `SupplierListPage` (cấu trúc `po-matrix-container`, `BranchFilterBar`, table header cố định, thân bảng cuộn độc lập, footer phân trang tích hợp).
- [ ] Frontend Quality: Chạy lệnh `npm run lint` và `npm run build` ở `MT_GRMS_FRONTEND` không phát sinh lỗi.
