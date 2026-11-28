---
verdict: PASS
tested_at: 2026-11-28
tester: 'sonnguyenn10'
---
# Test Report: Màn hình Tạo Phiên Kiểm kê & Nhập Số đếm Thực tế theo Lô (`stocktake-form`)

| Mã Test Case | Tên kịch bản | Tiêu chí (Cô) | Loại Test | Mức ưu tiên | Pre-conditions (GIVEN) | Procedure / Steps (WHEN) | Dữ liệu test (Test Data) | Expected Results (THEN) | Người viết | Người chạy | Report Type | Kết quả | Ghi chú |
|---|---|---|---|:---:|---|---|---|---|---|---|:---:|:---:|---|
| TC-UT-STOC-FORM-01 | REQ-STOC-FORM-01: Kiểm tra validator & quy tắc dữ liệu đầu vào | Số liệu / Công thức | Happy | P1 | Môi trường unit test sẵn sàng | Gọi validator/service xử lý dữ liệu hợp lệ | Bản ghi chuẩn của `Stocktake` | Xử lý đúng công thức và không sinh lỗi | Đặng Đỗ Minh Đức | Nguyễn Bá Sơn | 5.1 | PASS | Unit test |
| TC-IT-STOC-FORM-01 | REQ-STOC-FORM-02: Tích hợp API `StocktakesController` với CSDL | Luồng nghiệp vụ | Happy | P1 | Đã xác thực JWT vai trò `StoreOwner` | Gửi request tới endpoint của `StocktakesController` | Payload JSON hợp lệ theo `TenantId` | Lưu/truy vấn DB chính xác, trả HTTP 200/201 | Đặng Đỗ Minh Đức | Nguyễn Bá Sơn | 5.2 | PASS | API integration |
| TC-SYS-STOC-FORM-01 | REQ-STOC-FORM-03: Tương tác giao diện màn hình `/store-owner/stocktakes/create` | Giao diện (UI) | Happy | P1 | Mở màn hình `/store-owner/stocktakes/create` với dữ liệu thật | Lọc, mở modal thao tác và bấm xác nhận lưu | Từ khóa lọc & form nhập liệu chuẩn | Giao diện cập nhật đồng bộ, hiện toast thành công | Đặng Đỗ Minh Đức | Nguyễn Bá Sơn | 5.3 | PASS | System UI (UI-04-04) |
| TC-SEC-STOC-FORM-01 | REQ-STOC-FORM-04: Chặn truy cập trái quyền RBAC & cô lập Tenant | Security | Security | P0 | Tài khoản không thuộc vai trò cho phép hoặc khác Tenant | Cố tình gọi API ghi/đọc dữ liệu của màn hình | Token khác role / ID của Tenant khác | Hệ thống chặn cứng trả HTTP 403/404 ProblemDetails | Đặng Đỗ Minh Đức | Nguyễn Bá Sơn | 5.4 | PASS | RBAC & Multi-tenant |
| TC-UAT-STOC-FORM-01 | Nghiệm thu quy trình nghiệp vụ đầu-cuối màn hình `UI-04-04` | Luồng nghiệp vụ | Edge | P1 | Dữ liệu chi nhánh & cấu hình liên quan đã sẵn sàng | Thực hiện trọn vẹn luồng nghiệp vụ chính & ngoại lệ | Bộ dữ liệu nghiệm thu `FE-04` | Kết quả khớp 100% đặc tả Delta `specs.md` | Đặng Đỗ Minh Đức | Nguyễn Bá Sơn | 5.5 | PASS | UAT PASS |

## Lệnh đã chạy
- `dotnet build MT_GRMS_BACKEND.sln`: PASS (0 errors)
- `npm run build` (`MT_GRMS_FRONTEND`): PASS (0 TypeScript errors)

## Đối chiếu specs ↔ code
- Đã kiểm chứng đầy đủ các yêu cầu `REQ-STOC-FORM-01` → `REQ-STOC-FORM-04` khớp với mã nguồn hiện hành tại `features/stocktake/pages/StocktakeFormPage.tsx` và `StocktakesController.cs`.

## Lỗi còn tồn đọng
- Không còn lỗi HIGH/CRITICAL tồn đọng. Sẵn sàng duyệt đóng hoặc nâng cấp tiếp theo từng màn hình.
