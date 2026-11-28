# Spec: service-expenses

> Spec gốc (Living Source of Truth) của capability `service-expenses`. Tự động tổng hợp từ delta `specs.md` của các change khi `/sep-archive`.

## Requirements

### Requirement: REQ-SERV-EXPE-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Chi phí Vận hành & Mua sắm Dịch vụ Ngoài** (`/store-owner/expenses`, `/expenses`): Tạo phiếu đề xuất chi phí phân loại theo danh mục chuẩn qua `POST /api/expenses` kèm ảnh chụp hóa đơn chứng từ (`BillPreviewModal`) và thống kê tổng hợp từ `GET /api/expenses/summary`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-SERV-EXPE-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/expenses` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-SERV-EXPE-01.
- **THEN** Hệ thống xử lý thành công qua `ExpensesController`, cập nhật chính xác dữ liệu `ExpenseVoucher` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-SERV-EXPE-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-SERV-EXPE-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/expenses` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-SERV-EXPE-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Chi phí Vận hành & Mua sắm Dịch vụ Ngoài** (`/store-owner/expenses`, `/expenses`): Quy trình phê duyệt minh bạch: Store Owner duyệt (`POST .../approve` — bắt buộc nhập giải trình nếu khoản chi bị gắn cờ nghi vấn) hoặc từ chối (`POST .../reject`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-SERV-EXPE-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/expenses` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-SERV-EXPE-02.
- **THEN** Hệ thống xử lý thành công qua `ExpensesController`, cập nhật chính xác dữ liệu `ExpenseVoucher` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-SERV-EXPE-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-SERV-EXPE-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/expenses` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-SERV-EXPE-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Chi phí Vận hành & Mua sắm Dịch vụ Ngoài** (`/store-owner/expenses`, `/expenses`): Khi xuất quỹ thanh toán (`POST /api/expenses/{id}/disburse` qua `PayExpenseModal`), hệ thống trừ số dư tài khoản quỹ nguồn và tự động sinh dòng chi trong `CashbookEntry`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-SERV-EXPE-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/expenses` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-SERV-EXPE-03.
- **THEN** Hệ thống xử lý thành công qua `ExpensesController`, cập nhật chính xác dữ liệu `ExpenseVoucher` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-SERV-EXPE-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-SERV-EXPE-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/expenses` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-SERV-EXPE-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Chi phí Vận hành & Mua sắm Dịch vụ Ngoài** (`/store-owner/expenses`, `/expenses`): Nếu hủy khoản chi đã giải ngân (`POST .../cancel`), hệ thống tự động sinh bút toán đảo hoàn trả tiền về đúng quỹ nguồn ban đầu thay vì xóa cứng lịch sử.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-SERV-EXPE-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/expenses` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-SERV-EXPE-04.
- **THEN** Hệ thống xử lý thành công qua `ExpensesController`, cập nhật chính xác dữ liệu `ExpenseVoucher` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-SERV-EXPE-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-SERV-EXPE-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/expenses` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Lịch sử
- 2026-11-28 · `service-expenses (baseline AS-IS)` · +4 ~0 -0
