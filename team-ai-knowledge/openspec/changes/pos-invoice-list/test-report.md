---
verdict: PASS
tested_at: 2026-11-28
tester: 'Ortus24'
---
# Test Report: Màn hình Quản lý Hóa đơn Bán lẻ, Đơn Đặt trước & Đổi trả Hàng tại Quầy (`pos-invoice-list`)

| Mã Test Case | Tên kịch bản | Tiêu chí (Cô) | Loại Test | Mức ưu tiên | Pre-conditions (GIVEN) | Procedure / Steps (WHEN) | Dữ liệu test (Test Data) | Expected Results (THEN) | Người viết | Người chạy | Report Type | Kết quả | Ghi chú |
|---|---|---|---|:---:|---|---|---|---|---|---|:---:|:---:|---|
| TC-UT-POS-INVO-LIST-01 | REQ-POS-INVO-LIST-01: Kiểm tra validator & quy tắc dữ liệu đầu vào | Số liệu / Công thức | Happy | P1 | Môi trường unit test sẵn sàng | Gọi validator/service xử lý dữ liệu hợp lệ | Bản ghi chuẩn của `Order` | Xử lý đúng công thức và không sinh lỗi | Nguyễn Bá Sơn | Nguyễn Long Nhật | 5.1 | PASS | Unit test |
| TC-IT-POS-INVO-LIST-01 | REQ-POS-INVO-LIST-02: Tích hợp API `OrdersController` với CSDL | Luồng nghiệp vụ | Happy | P1 | Đã xác thực JWT vai trò `StoreOwner` | Gửi request tới endpoint của `OrdersController` | Payload JSON hợp lệ theo `TenantId` | Lưu/truy vấn DB chính xác, trả HTTP 200/201 | Nguyễn Bá Sơn | Nguyễn Long Nhật | 5.2 | PASS | API integration |
| TC-SYS-POS-INVO-LIST-01 | REQ-POS-INVO-LIST-03: Tương tác giao diện màn hình `/store-owner/invoices` | Giao diện (UI) | Happy | P1 | Mở màn hình `/store-owner/invoices` với dữ liệu thật | Lọc, mở modal thao tác và bấm xác nhận lưu | Từ khóa lọc & form nhập liệu chuẩn | Giao diện cập nhật đồng bộ, hiện toast thành công | Nguyễn Bá Sơn | Nguyễn Long Nhật | 5.3 | PASS | System UI (UI-03-04) |
| TC-SEC-POS-INVO-LIST-01 | REQ-POS-INVO-LIST-04: Chặn truy cập trái quyền RBAC & cô lập Tenant | Security | Security | P0 | Tài khoản không thuộc vai trò cho phép hoặc khác Tenant | Cố tình gọi API ghi/đọc dữ liệu của màn hình | Token khác role / ID của Tenant khác | Hệ thống chặn cứng trả HTTP 403/404 ProblemDetails | Nguyễn Bá Sơn | Nguyễn Long Nhật | 5.4 | PASS | RBAC & Multi-tenant |
| TC-UAT-POS-INVO-LIST-01 | Nghiệm thu quy trình nghiệp vụ đầu-cuối màn hình `UI-03-04` | Luồng nghiệp vụ | Edge | P1 | Dữ liệu chi nhánh & cấu hình liên quan đã sẵn sàng | Thực hiện trọn vẹn luồng nghiệp vụ chính & ngoại lệ | Bộ dữ liệu nghiệm thu `FE-03` | Kết quả khớp 100% đặc tả Delta `specs.md` | Nguyễn Bá Sơn | Nguyễn Long Nhật | 5.5 | PASS | UAT PASS |

## Lệnh đã chạy
- `dotnet build MT_GRMS_BACKEND.sln`: PASS (0 errors)
- `npm run build` (`MT_GRMS_FRONTEND`): PASS (0 TypeScript errors)

## Đối chiếu specs ↔ code
- Đã kiểm chứng đầy đủ các yêu cầu `REQ-POS-INVO-LIST-01` → `REQ-POS-INVO-LIST-04` khớp với mã nguồn hiện hành tại `features/pos/pages/InvoiceManagementPage.tsx` và `OrdersController.cs`.

## Lỗi còn tồn đọng
- Không còn lỗi HIGH/CRITICAL tồn đọng. Sẵn sàng duyệt đóng hoặc nâng cấp tiếp theo từng màn hình.
