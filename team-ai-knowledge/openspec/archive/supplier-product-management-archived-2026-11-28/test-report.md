---
verdict: PASS
tested_at: 2026-10-19
tester: '@minhduc118a'
---
# Test Report: supplier-product-management

| Test Case ID | Tên kịch bản | Pre-conditions (GIVEN) | Procedure / Steps (WHEN) | Expected Results (THEN) | Role | Priority | Report Type | Kết quả | Ghi chú |
|---|---|---|---|---|:---:|:---:|:---:|:---:|---|
| TC-UT-SP01-01 | REQ-SP01: Gán sản phẩm mới hợp lệ cho NCC | Đã có NCC Vinamilk và Sản phẩm Sữa tươi 1L trong hệ thống | Gọi AssignSupplierProductAsync với giá 280,000, MOQ 5, Đơn vị Thùng | Trả về SupplierProductDto với Status Active, dữ liệu lưu DB thành công | StoreOwner | High | 5.1 | PASS | Backend xUnit |
| TC-UT-SP01-02 | REQ-SP01 / BR-SP01: Chặn gán trùng lặp SP cùng NCC | Sản phẩm đã được liên kết với NCC trong cùng một Tenant | Gọi AssignSupplierProductAsync với cùng ProductId | Ném BusinessException với mã PRODUCT_ALREADY_ASSIGNED_TO_SUPPLIER (HTTP 409) | StoreOwner | Critical | 5.1 | PASS | Backend xUnit |
| TC-UT-SP01-03 | REQ-SP01 / BR-SP03: Validate Giá thỏa thuận > 0 | Sản phẩm và NCC hợp lệ trong hệ thống | Gọi AssignSupplierProductAsync với Giá = 0 hoặc Giá < 0 | Bị chặn bởi FluentValidation, ném VALIDATION_ERROR | PurchasingStaff | High | 5.1 | PASS | Backend xUnit |
| TC-UT-SP01-04 | REQ-SP01 / BR-SP03: Validate MOQ >= 1 | Sản phẩm và NCC hợp lệ trong hệ thống | Gọi AssignSupplierProductAsync với MOQ = 0 hoặc MOQ < 0 | Bị chặn bởi FluentValidation, ném VALIDATION_ERROR | PurchasingStaff | High | 5.1 | PASS | Backend xUnit |
| TC-UT-SP02-01 | REQ-SP02: Cập nhật giá sỉ thỏa thuận và MOQ | Liên kết sản phẩm - NCC đang tồn tại (giá 18,000, MOQ 10) | Gọi UpdateSupplierProductAsync với giá mới 20,000, MOQ 15 | Bản ghi cập nhật thành công, UnitOfWork lưu CSDL | PurchasingStaff | High | 5.1 | PASS | Backend xUnit |
| TC-UT-SP03-01 | REQ-SP03: Chuyển đổi trạng thái Active sang Inactive (Soft Deactivate) | Liên kết sản phẩm đang ở trạng thái Active đối với NCC | Gọi ToggleSupplierProductStatusAsync với Status Inactive | Trạng thái chuyển sang Inactive, bảo toàn dữ liệu lịch sử đơn PO/GRN | StoreOwner | Medium | 5.1 | PASS | Backend xUnit |
| TC-UT-SP03-02 | REQ-SP03: Tái kích hoạt trạng thái Inactive về Active | Liên kết sản phẩm đang ở trạng thái Inactive đối với NCC | Gọi ToggleSupplierProductStatusAsync với Status Active | Trạng thái chuyển lại thành Active thành công | StoreOwner | Medium | 5.1 | PASS | Backend xUnit |
| TC-UT-SP04-01 | REQ-SP04 / BR-SP02: Độc quyền Primary Supplier | NCC A đang là Primary của SP Coca, NCC B không phải Primary | Gọi SetPrimarySupplierAsync cho NCC B với IsPrimary = true | NCC B thành Primary, NCC A tự động bị gỡ cờ Primary | StoreOwner | Critical | 5.1 | PASS | Backend xUnit |
| TC-UT-SP05-01 | REQ-SP05: Tra cứu ngược danh sách NCC theo sản phẩm (PO Lookup) | SP Gạo ST25 được cung ứng bởi NCC X (Primary) và NCC Y (Phụ) | Gọi GetSuppliersForProductAsync(productId, onlyActive: true) | Trả về danh sách gồm cả NCC X và Y, trong đó NCC X đứng đầu với IsPrimary = true | PurchasingStaff | High | 5.1 | PASS | Backend xUnit |
| TC-UT-FE01-01 | REQ-SP01 / BR-SP03: Validate phía Client Frontend cho form gán SP | Người dùng mở form gán sản phẩm vào NCC | Nhập giá <= 0 hoặc MOQ < 1 hoặc để trống đơn vị giao hàng | Form hiển thị cảnh báo lỗi validate trước khi gửi request lên backend | PurchasingStaff | Medium | 5.1 | PASS | Frontend Vitest |
| TC-IT-SP01-01 | REQ-SP01: API POST gán SP trả về HTTP 201 Created | Token đăng nhập hợp lệ với vai trò StoreOwner / Staff | Gửi HTTP POST /api/v1/suppliers/{id}/products với payload hợp lệ | API trả về HTTP 201 Created kèm dữ liệu DTO đã map | StoreOwner | High | 5.2 | PASS | API Integration |
| TC-IT-SP01-02 | REQ-SP01 / BR-SP01: API POST trả về HTTP 409 Conflict khi trùng lặp | SP đã tồn tại trong danh mục của NCC | Gửi HTTP POST trùng lặp ProductId | ExceptionHandlingMiddleware trả về HTTP 409 Conflict | StoreOwner | High | 5.2 | PASS | API Integration |
| TC-IT-SP02-01 | REQ-SP02: API PUT cập nhật thông tin thỏa thuận | Bản ghi liên kết tồn tại trong CSDL PostgreSQL | Gửi HTTP PUT /api/v1/suppliers/{id}/products/{productId} | API trả về HTTP 200 OK và cập nhật dữ liệu vào DB | PurchasingStaff | High | 5.2 | PASS | API Integration |
| TC-IT-SP04-01 | REQ-SP04 / BR-SP02: API PATCH cập nhật NCC chính độc quyền | SP đang có NCC chính hiện tại | Gửi HTTP PATCH /api/v1/suppliers/{id}/products/{productId}/primary | API trả về HTTP 200 OK, CSDL lưu trữ chính xác cờ IsPrimarySupplier duy nhất | StoreOwner | High | 5.2 | PASS | API Integration |
| TC-IT-SP05-01 | REQ-SP05: API GET tra cứu ngược danh sách NCC theo SP | Có ít nhất 1 NCC cung cấp sản phẩm | Gửi HTTP GET /api/v1/products/{id}/suppliers?OnlyActive=true | API trả về HTTP 200 OK kèm danh sách NCC sắp xếp theo Primary | PurchasingStaff | High | 5.2 | PASS | API Integration |
| TC-SYS-SP01-01 | REQ-SP05: Layout màn hình đồng bộ cấu trúc SupplierListPage | Đăng nhập tài khoản StoreOwner trên trình duyệt | Truy cập màn hình http://localhost:5173/store-owner/suppliers/products | Hiển thị container po-matrix-container full height, header nút chuẩn 32px | StoreOwner | High | 5.3 | PASS | UI Layout Test |
| TC-SYS-SP01-02 | REQ-SP05: Bộ lọc 2 hàng chuẩn hóa Filter Bar | Đang xem danh sách sản phẩm NCC | Nhập từ khóa tìm kiếm (SKU/Tên/Barcode) và chọn lọc ngành hàng | Bảng dữ liệu lọc chính xác danh sách tương ứng với hiệu năng cao | StoreOwner | High | 5.3 | PASS | UI E2E Test |
| TC-SYS-SP01-03 | REQ-SP05: Bảng dữ liệu Fixed Header và Scroll độc lập | Danh sách có nhiều hơn 10 sản phẩm | Cuộn dọc bảng dữ liệu sản phẩm | Header cố định trên đỉnh, thanh cuộn dọc tbody-scroll-container độc lập | StoreOwner | Medium | 5.3 | PASS | UI UX Test |
| TC-SYS-SP01-04 | REQ-SP05: Phân trang tích hợp dưới chân bảng (Table Footer) | Dữ liệu sản phẩm vượt quá kích thước trang | Bấm chuyển sang trang tiếp theo hoặc đổi kích thước trang | Bảng cập nhật hiển thị chính xác trang dữ liệu mới, footer chuẩn UI | StoreOwner | Medium | 5.3 | PASS | UI Paging Test |
| TC-SEC-SP06-01 | REQ-SP06: Cô lập dữ liệu đa người thuê (Multi-tenant Isolation) | Người dùng thuộc Tenant A gửi request | Truy vấn sản phẩm của NCC thuộc Tenant B GET /api/v1/suppliers/{suppBId}/products | Hệ thống tự động lọc theo TenantId của Tenant A và trả về 404 Not Found | StoreOwner | Critical | 5.4 | PASS | Multi-tenant Security |
| TC-SEC-SP06-02 | REQ-SP06: Chặn truy cập trái phép khi thiếu Token xác thực | Người dùng chưa đăng nhập hệ thống | Gửi request GET /api/v1/suppliers/{id}/products không có Bearer token | Hệ thống trả về HTTP 401 Unauthorized | Anonymous | High | 5.4 | PASS | RBAC Security |
| TC-UAT-SP01-01 | REQ-SP01 -> REQ-SP05: Nghiệm thu quy trình quản lý hàng hóa NCC và lập PO | Chủ cửa hàng truy cập màn hình NCC Products | Thêm sản phẩm mới vào NCC Vinamilk, đặt làm NCC chính, tra cứu khi lập đơn PO | Toàn bộ quy trình diễn ra trơn tru, sản phẩm hiển thị chuẩn xác tại bước nhập hàng | StoreOwner | High | 5.5 | PASS | UAT Acceptance |

## Lệnh đã chạy
- `dotnet test`: PASS (27/27 tests passed: 25 UnitTests + 2 IntegrationTests)
- `npm run lint`: PASS (0 errors, 0 warnings)
- `npm run build`: PASS (TypeScript type-check and Vite build succeeded)

## Đối chiếu specs ↔ code
- **REQ-SP01**: Đạt (Gán sản phẩm với đầy đủ thuộc tính, chống trùng lặp BR-SP01 trả về HTTP 409 Conflict, validate BR-SP03 Giá > 0 và MOQ >= 1).
- **REQ-SP02**: Đạt (Cập nhật giá sỉ thỏa thuận, MOQ, đơn vị giao hàng và mã hàng NCC).
- **REQ-SP03**: Đạt (Bật/tắt trạng thái Active / Inactive qua API PATCH, bảo toàn lịch sử giao dịch).
- **REQ-SP04**: Đạt (Độc quyền Primary Supplier BR-SP02, tự động gỡ cờ Primary của các NCC khác cho cùng một sản phẩm).
- **REQ-SP05**: Đạt (Truy vấn danh sách theo NCC có phân trang, lọc đa tiêu chí; hỗ trợ tra cứu ngược danh sách NCC theo sản phẩm phục vụ màn hình PO).
- **REQ-SP06**: Đạt (Cô lập dữ liệu tuyệt đối theo TenantId trên toàn bộ Entity, Repository và API Controllers).
- **UI Layout**: Đạt (Đồng bộ 100% layout chuẩn `SupplierListPage`: Container full height `po-matrix-container`, header nút 32px, filter bar 2 hàng, bảng dữ liệu fixed header cuộn ngang/dọc độc lập, footer tích hợp phân trang).

## Lỗi còn tồn đọng
- Không có lỗi tồn đọng.
