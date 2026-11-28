# Specs: Màn hình Cấu hình Chính sách Tích điểm, Đổi thưởng & Sổ cái Điểm Thành viên (`loyalty-config`)

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `GET` | `/api/loyalty-config/ledger` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/loyalty-config/adjustments` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/loyalty-config` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `PUT` | `/api/loyalty-config` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |

## ADDED Requirements

### Requirement: REQ-LOYA-CONF-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Cấu hình Chính sách Tích điểm, Đổi thưởng & Sổ cái Điểm Thành viên** (`/store-owner/loyalty-config`, `/promotions/loyalty-config`): Tải và cập nhật cấu hình tích điểm qua `GET/PUT /api/loyalty-config`: kiểm tra chặt tỷ lệ tiền tích điểm `> 0`, số điểm quy đổi nguyên dương, điểm tối thiểu được tiêu và giới hạn `%` giá trị hóa đơn được trừ bằng điểm (`1%–100%`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-LOYA-CONF-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/loyalty-config` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-LOYA-CONF-01.
- **THEN** Hệ thống xử lý thành công qua `LoyaltyConfigController`, cập nhật chính xác dữ liệu `LoyaltySetting` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-LOYA-CONF-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-LOYA-CONF-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/loyalty-config` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-LOYA-CONF-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Cấu hình Chính sách Tích điểm, Đổi thưởng & Sổ cái Điểm Thành viên** (`/store-owner/loyalty-config`, `/promotions/loyalty-config`): Hiển thị sổ cái biến động điểm toàn cửa hàng từ `GET /api/loyalty-config/ledger` (cộng điểm mua hàng, trừ điểm thanh toán, hoàn điểm trả hàng, điều chỉnh tay).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-LOYA-CONF-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/loyalty-config` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-LOYA-CONF-02.
- **THEN** Hệ thống xử lý thành công qua `LoyaltyConfigController`, cập nhật chính xác dữ liệu `LoyaltySetting` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-LOYA-CONF-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-LOYA-CONF-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/loyalty-config` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-LOYA-CONF-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Cấu hình Chính sách Tích điểm, Đổi thưởng & Sổ cái Điểm Thành viên** (`/store-owner/loyalty-config`, `/promotions/loyalty-config`): Cho phép Chủ cửa hàng cộng/trừ điều chỉnh điểm thủ công cho khách hàng qua `POST /api/loyalty-config/adjustments` (`AdjustPointsModal`) bắt buộc ghi rõ lý do kiểm toán.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-LOYA-CONF-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/loyalty-config` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-LOYA-CONF-03.
- **THEN** Hệ thống xử lý thành công qua `LoyaltyConfigController`, cập nhật chính xác dữ liệu `LoyaltySetting` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-LOYA-CONF-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-LOYA-CONF-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/loyalty-config` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-LOYA-CONF-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Cấu hình Chính sách Tích điểm, Đổi thưởng & Sổ cái Điểm Thành viên** (`/store-owner/loyalty-config`, `/promotions/loyalty-config`): Khi tạm ngưng chính sách tích điểm, quầy POS tự động dừng cộng/đổi điểm mới nhưng vẫn bảo toàn số dư điểm hiện có của khách hàng.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-LOYA-CONF-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/loyalty-config` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-LOYA-CONF-04.
- **THEN** Hệ thống xử lý thành công qua `LoyaltyConfigController`, cập nhật chính xác dữ liệu `LoyaltySetting` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-LOYA-CONF-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-LOYA-CONF-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/loyalty-config` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-LOYA-CONF-01`: Tải và cập nhật cấu hình tích điểm qua `GET/PUT /api/loyalty-config`: kiểm tra chặt tỷ lệ tiền tích điểm `> 0`...
- [x] `REQ-LOYA-CONF-02`: Hiển thị sổ cái biến động điểm toàn cửa hàng từ `GET /api/loyalty-config/ledger` (cộng điểm mua hàng, trừ điểm...
- [x] `REQ-LOYA-CONF-03`: Cho phép Chủ cửa hàng cộng/trừ điều chỉnh điểm thủ công cho khách hàng qua `POST /api/loyalty-config/adjustmen...
- [x] `REQ-LOYA-CONF-04`: Khi tạm ngưng chính sách tích điểm, quầy POS tự động dừng cộng/đổi điểm mới nhưng vẫn bảo toàn số dư điểm hiện...
