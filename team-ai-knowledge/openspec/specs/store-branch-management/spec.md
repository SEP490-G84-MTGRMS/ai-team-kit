# Spec: store-branch-management

> Spec gốc (Living Source of Truth) của capability `store-branch-management`. Tự động tổng hợp từ delta `specs.md` của các change khi `/sep-archive`.

## Requirements

### Requirement: REQ-STOR-BRAN-MANA-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Đa Chi nhánh & Mua thêm Hạn mức Chi nhánh** (`/store-owner/settings?tab=branches`): Hiển thị danh sách chi nhánh và bộ đếm hạn ngạch (`đang dùng / tối đa`) từ `GET /api/branches` và `GET /api/branches/quota`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOR-BRAN-MANA-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/settings?tab=branches` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOR-BRAN-MANA-01.
- **THEN** Hệ thống xử lý thành công qua `BranchesController`, cập nhật chính xác dữ liệu `Branch` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOR-BRAN-MANA-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOR-BRAN-MANA-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/settings?tab=branches` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-STOR-BRAN-MANA-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Đa Chi nhánh & Mua thêm Hạn mức Chi nhánh** (`/store-owner/settings?tab=branches`): Khi tạo chi nhánh mới (`POST /api/branches`), Backend kiểm tra nghiêm ngặt hạn ngạch gói cước; nếu vượt trần thì chặn và gợi ý mở `BranchAddonModal` hoặc nâng cấp gói Pro.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOR-BRAN-MANA-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/settings?tab=branches` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOR-BRAN-MANA-02.
- **THEN** Hệ thống xử lý thành công qua `BranchesController`, cập nhật chính xác dữ liệu `Branch` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOR-BRAN-MANA-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOR-BRAN-MANA-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/settings?tab=branches` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-STOR-BRAN-MANA-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Đa Chi nhánh & Mua thêm Hạn mức Chi nhánh** (`/store-owner/settings?tab=branches`): Hỗ trợ báo giá và mua thêm slot chi nhánh qua `GET /api/tenant/branch-addon/quote` và `POST /api/tenant/branch-addon/purchase`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOR-BRAN-MANA-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/settings?tab=branches` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOR-BRAN-MANA-03.
- **THEN** Hệ thống xử lý thành công qua `BranchesController`, cập nhật chính xác dữ liệu `Branch` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOR-BRAN-MANA-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOR-BRAN-MANA-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/settings?tab=branches` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-STOR-BRAN-MANA-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Đa Chi nhánh & Mua thêm Hạn mức Chi nhánh** (`/store-owner/settings?tab=branches`): Cho phép cập nhật thông tin, tạm ngưng hoạt động chi nhánh (`PATCH /api/branches/{id}/status`) và chặn xóa vật lý chi nhánh đã phát sinh tồn kho hoặc hóa đơn.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOR-BRAN-MANA-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/settings?tab=branches` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOR-BRAN-MANA-04.
- **THEN** Hệ thống xử lý thành công qua `BranchesController`, cập nhật chính xác dữ liệu `Branch` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOR-BRAN-MANA-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOR-BRAN-MANA-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/settings?tab=branches` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Lịch sử
- 2026-11-28 · `store-branch-management (baseline AS-IS)` · +4 ~0 -0
