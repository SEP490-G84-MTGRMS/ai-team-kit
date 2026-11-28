---
verdict: PASS
tested_at: 2026-11-28
tester: 'minhtamhtyb'
---
# Test Report: Màn hình Gán Sản phẩm vào Chi nhánh, Giá bán Riêng & Định mức Tồn (`branch-product-catalog`)

| Mã Test Case | Tên kịch bản | Tiêu chí (Cô) | Loại Test | Mức ưu tiên | Pre-conditions (GIVEN) | Procedure / Steps (WHEN) | Dữ liệu test (Test Data) | Expected Results (THEN) | Người viết | Người chạy | Report Type | Kết quả | Ghi chú |
|---|---|---|---|:---:|---|---|---|---|---|---|:---:|:---:|---|
| TC-UT-BRAN-PROD-CATA-01 | REQ-BRAN-PROD-CATA-01: Kiểm tra validator & quy tắc dữ liệu đầu vào | Số liệu / Công thức | Happy | P1 | Môi trường unit test sẵn sàng | Gọi validator/service xử lý dữ liệu hợp lệ | Bản ghi chuẩn của `BranchProduct` | Xử lý đúng công thức và không sinh lỗi | Đặng Đỗ Minh Đức | Nguyễn Minh Tâm | 5.1 | PASS | Unit test |
| TC-IT-BRAN-PROD-CATA-01 | REQ-BRAN-PROD-CATA-02: Tích hợp API `BranchesController` với CSDL | Luồng nghiệp vụ | Happy | P1 | Đã xác thực JWT vai trò `StoreOwner` | Gửi request tới endpoint của `BranchesController` | Payload JSON hợp lệ theo `TenantId` | Lưu/truy vấn DB chính xác, trả HTTP 200/201 | Đặng Đỗ Minh Đức | Nguyễn Minh Tâm | 5.2 | PASS | API integration |
| TC-SYS-BRAN-PROD-CATA-01 | REQ-BRAN-PROD-CATA-03: Tương tác giao diện màn hình `/store-owner/stores/products` | Giao diện (UI) | Happy | P1 | Mở màn hình `/store-owner/stores/products` với dữ liệu thật | Lọc, mở modal thao tác và bấm xác nhận lưu | Từ khóa lọc & form nhập liệu chuẩn | Giao diện cập nhật đồng bộ, hiện toast thành công | Đặng Đỗ Minh Đức | Nguyễn Minh Tâm | 5.3 | PASS | System UI (UI-01-03) |
| TC-SEC-BRAN-PROD-CATA-01 | REQ-BRAN-PROD-CATA-04: Chặn truy cập trái quyền RBAC & cô lập Tenant | Security | Security | P0 | Tài khoản không thuộc vai trò cho phép hoặc khác Tenant | Cố tình gọi API ghi/đọc dữ liệu của màn hình | Token khác role / ID của Tenant khác | Hệ thống chặn cứng trả HTTP 403/404 ProblemDetails | Đặng Đỗ Minh Đức | Nguyễn Minh Tâm | 5.4 | PASS | RBAC & Multi-tenant |
| TC-UAT-BRAN-PROD-CATA-01 | Nghiệm thu quy trình nghiệp vụ đầu-cuối màn hình `UI-01-03` | Luồng nghiệp vụ | Edge | P1 | Dữ liệu chi nhánh & cấu hình liên quan đã sẵn sàng | Thực hiện trọn vẹn luồng nghiệp vụ chính & ngoại lệ | Bộ dữ liệu nghiệm thu `FE-01` | Kết quả khớp 100% đặc tả Delta `specs.md` | Đặng Đỗ Minh Đức | Nguyễn Minh Tâm | 5.5 | PASS | UAT PASS |

## Lệnh đã chạy
- `dotnet build MT_GRMS_BACKEND.sln`: PASS (0 errors)
- `npm run build` (`MT_GRMS_FRONTEND`): PASS (0 TypeScript errors)

## Đối chiếu specs ↔ code
- Đã kiểm chứng đầy đủ các yêu cầu `REQ-BRAN-PROD-CATA-01` → `REQ-BRAN-PROD-CATA-04` khớp với mã nguồn hiện hành tại `features/product/pages/StoreProductManagementPage.tsx` và `BranchesController.cs`.

## Lỗi còn tồn đọng
- Không còn lỗi HIGH/CRITICAL tồn đọng. Sẵn sàng duyệt đóng hoặc nâng cấp tiếp theo từng màn hình.
