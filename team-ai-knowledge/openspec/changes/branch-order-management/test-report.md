---
verdict: PASS
tested_at: 2026-10-21
tester: '@minhduc118a'
---
# Test Report: branch-order-management

| Test Case ID | Tên kịch bản | Pre-conditions (GIVEN) | Procedure / Steps (WHEN) | Expected Results (THEN) | Role | Priority | Report Type | Kết quả | Ghi chú |
|---|---|---|---|---|:---:|:---:|:---:|:---:|---|
| TC-UT-BR01-01 | REQ-BR-01: Truy vấn danh sách chi nhánh với phân trang mặc định | Cơ sở dữ liệu của Tenant có 5 chi nhánh | Gọi GetPagedBranchesAsync với PageIndex=1, PageSize=10 | Trả về đủ 5 chi nhánh, TotalItems=5, Page=1, PageSize=10 | StoreOwner | High | 5.1 | PASS | Backend xUnit |
| TC-UT-BR01-02 | REQ-BR-01: Tìm kiếm chi nhánh theo từ khóa Tên/Mã/Địa chỉ/SĐT | Dữ liệu khởi tạo có các chi nhánh khác nhau | Gọi GetPagedBranchesAsync với Keyword="cầu giấy" hoặc "Thái Hà" | Trả về chính xác chi nhánh khớp từ khóa | StoreOwner | High | 5.1 | PASS | Backend xUnit |
| TC-UT-BR01-03 | REQ-BR-01: Lọc chi nhánh theo mã chính xác | Có các chi nhánh BR-01, DC-01 | Gọi GetPagedBranchesAsync với BranchCode="DC-01" | Chỉ trả về duy nhất "Kho tổng DC1 (Long Biên)" | StoreOwner | Medium | 5.1 | PASS | Backend xUnit |
| TC-UT-BR01-04 | REQ-BR-01: Lọc chi nhánh theo trạng thái hoạt động | Có 4 chi nhánh Active và 1 Inactive | Gọi GetPagedBranchesAsync với Status="Active" và Status="Inactive" | Trả về chính xác 4 Active và 1 Inactive | StoreOwner | Medium | 5.1 | PASS | Backend xUnit |
| TC-UT-BR01-05 | REQ-BR-01: Giới hạn an toàn tham số phân trang bất thường | Client truyền PageIndex=-5, PageSize=0 hoặc PageSize=500 | Gọi GetPagedBranchesAsync với tham số ngoại lệ | PageIndex tự động clamp về 1, PageSize clamp về [1, 100] | StoreOwner | Low | 5.1 | PASS | Backend xUnit |
| TC-UT-BR02-01 | REQ-BR-02: Tra cứu chi tiết chi nhánh theo ID hợp lệ | Chi nhánh ID 11111111-1111-1111-1111-111111111111 tồn tại | Gọi GetBranchByIdAsync với ID hợp lệ | Trả về đầy đủ thông tin chi tiết của chi nhánh BR-01 | StoreOwner | High | 5.1 | PASS | Backend xUnit |
| TC-UT-BR02-02 | REQ-BR-02: Tra cứu chi nhánh không tồn tại ném NotFoundException | ID không tồn tại trong cơ sở dữ liệu | Gọi GetBranchByIdAsync với ID ngẫu nhiên | Hệ thống ném NotFoundException với thông báo chuẩn | StoreOwner | Medium | 5.1 | PASS | Backend xUnit |
| TC-IT-BR01-01 | REQ-BR-01: API GET /api/v1/branches trả về kết quả phân trang chuẩn | Token xác thực hợp lệ với vai trò StoreOwner | Gửi HTTP GET /api/v1/branches?pageIndex=1&pageSize=10 | API trả về 200 OK kèm ApiResponse<PagedResult<BranchDto>> | StoreOwner | High | 5.2 | PASS | API Integration |
| TC-IT-BR02-01 | REQ-BR-02: API GET /api/v1/branches/{id} trả về chi tiết chi nhánh | Chi nhánh tồn tại trong CSDL | Gửi HTTP GET /api/v1/branches/{id} | API trả về 200 OK kèm ApiResponse<BranchDto> | StoreOwner | High | 5.2 | PASS | API Integration |
| TC-IT-BR02-02 | REQ-BR-02: API GET /api/v1/branches/{id} trả về 404 khi không tìm thấy | ID không tồn tại trong CSDL | Gửi HTTP GET /api/v1/branches/{nonExistentId} | API trả về HTTP 404 Not Found theo chuẩn RFC 7807 | StoreOwner | High | 5.2 | PASS | API Integration |
| TC-SYS-BR01-01 | REQ-BR-03: Layout khung màn hình đồng bộ chuẩn SupplierListPage | Mở trang http://localhost:5173/store-owner/purchase-orders/branches | Tải giao diện trang | Khung po-matrix-container full height, header chuẩn nút 32px | StoreOwner | High | 5.3 | PASS | UI Layout Test |
| TC-SYS-BR01-02 | REQ-BR-03: Bộ lọc BranchFilterBar tách biệt hoạt động draft state | Nhập từ khóa tìm kiếm và chọn dropdown mã chi nhánh | Bấm nút "Tìm kiếm" hoặc gõ phím Enter | Bảng cập nhật danh sách chi nhánh tương ứng không giật lag | StoreOwner | High | 5.3 | PASS | UI E2E Test |
| TC-SYS-BR01-03 | REQ-BR-03: Bảng dữ liệu Sticky Header và Scroll body độc lập | Màn hình có bảng dữ liệu chi nhánh | Cuộn chuột dọc và cuộn ngang bảng dữ liệu | Dòng tiêu đề thead cố định, vùng tbody cuộn độc lập | StoreOwner | Medium | 5.3 | PASS | UI UX Test |
| TC-SYS-BR01-04 | REQ-BR-03: Footer phân trang tích hợp chuyển trang mượt mà | Dữ liệu chi nhánh vượt quá kích thước trang | Bấm nút "Sau" hoặc đổi Bản ghi/trang | Bảng dữ liệu cập nhật trang mới, dải số hiển thị chính xác | StoreOwner | Medium | 5.3 | PASS | UI Paging Test |
| TC-SEC-BR01-01 | REQ-BR-01: Cô lập dữ liệu đa người thuê (Multi-Tenancy Isolation) | Tenant A và Tenant B có các chi nhánh riêng biệt | Người dùng thuộc Tenant A gọi GET /api/v1/branches | Chỉ hiển thị các chi nhánh của Tenant A, không rò rỉ dữ liệu Tenant B | StoreOwner | Critical | 5.4 | PASS | Multi-tenant Security |
| TC-SEC-BR01-02 | REQ-BR-01: Chặn truy cập trái phép khi thiếu Token xác thực | Người dùng chưa đăng nhập hệ thống | Gửi request GET /api/v1/branches không kèm Bearer token | API trả về HTTP 401 Unauthorized | Anonymous | High | 5.4 | PASS | RBAC Security |
| TC-UAT-BR01-01 | REQ-BR-03: Nghiệm thu luồng chọn chi nhánh và tạo ma trận đặt hàng | Chủ cửa hàng truy cập màn hình đặt hàng theo chi nhánh | Tìm chi nhánh cần đặt và bấm nút "Đặt hàng" | Ứng dụng điều hướng chuẩn xác sang /store-owner/purchase-orders/create-matrix?branchId={id} | StoreOwner | High | 5.5 | PASS | UAT Acceptance |

## Lệnh đã chạy
- `dotnet test`: PASS (37/37 tests passed, trong đó bao gồm 10 tests mới của `BranchManagementTests`)
- `npm run lint`: PASS (0 errors, 65 warnings)
- `npm run build`: PASS (TypeScript type-checking và Vite build hoàn tất thành công trong 751ms)

## Đối chiếu specs ↔ code
- **REQ-BR-01**: Đạt (Entity `Branch`, cấu hình Fluent API, Migration EF Core, `IBranchService` và `BranchesController` hỗ trợ phân trang, tìm kiếm từ khóa, lọc theo mã chi nhánh/trạng thái và cô lập multi-tenant).
- **REQ-BR-02**: Đạt (API `GET /api/v1/branches/{id}` trả về chi tiết chi nhánh hoặc 404 Not Found khi không tìm thấy).
- **REQ-BR-03**: Đạt (Giao diện `BranchOrderListPage` đồng bộ 100% layout `SupplierListPage` với khung `po-matrix-container`, `BranchFilterBar` tách biệt, `BranchOrderTable` có sticky header, scroll body độc lập và footer phân trang tích hợp).

## Lỗi còn tồn đọng
- Không có lỗi tồn đọng.
