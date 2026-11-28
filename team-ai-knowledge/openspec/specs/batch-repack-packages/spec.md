# Spec: batch-repack-packages

> Spec gốc (Living Source of Truth) của capability `batch-repack-packages`. Tự động tổng hợp từ delta `specs.md` của các change khi `/sep-archive`.

## Requirements

### Requirement: REQ-BATC-REPA-PACK-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Đóng khay Chia nhỏ Hàng tươi sống Cân ký & In Tem Barcode Khay** (`/store-owner/batches/:batchId/packages`, `/employee/batches/:batchId/packages`): Chỉ cho phép tạo đợt đóng khay (`POST /api/repack-orders`) trên các sản phẩm có cấu hình `AllowRepack = true` và tổng trọng lượng các khay đang mở không được vượt quá tồn khả dụng của lô gốc.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-BATC-REPA-PACK-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/batches/:batchId/packages` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-BATC-REPA-PACK-01.
- **THEN** Hệ thống xử lý thành công qua `RepackOrdersController`, cập nhật chính xác dữ liệu `RepackOrder` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-BATC-REPA-PACK-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-BATC-REPA-PACK-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/batches/:batchId/packages` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-BATC-REPA-PACK-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Đóng khay Chia nhỏ Hàng tươi sống Cân ký & In Tem Barcode Khay** (`/store-owner/batches/:batchId/packages`, `/employee/batches/:batchId/packages`): Hiển thị danh sách khay của lô từ `GET /api/branch-stocks/{branchStockId}/packages` lọc theo đợt đóng khay và trạng thái (`Chưa bán`, `Đã bán`, `Cách ly`, `Đã hủy`), hỗ trợ xuất PDF tem mã vạch để in dán khay.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-BATC-REPA-PACK-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/batches/:batchId/packages` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-BATC-REPA-PACK-02.
- **THEN** Hệ thống xử lý thành công qua `RepackOrdersController`, cập nhật chính xác dữ liệu `RepackOrder` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-BATC-REPA-PACK-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-BATC-REPA-PACK-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/batches/:batchId/packages` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-BATC-REPA-PACK-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Đóng khay Chia nhỏ Hàng tươi sống Cân ký & In Tem Barcode Khay** (`/store-owner/batches/:batchId/packages`, `/employee/batches/:batchId/packages`): Cho phép điều chỉnh giá bán khay (`PATCH /api/packages/{id}/price`), chuyển cách ly khay nghi ngờ hỏng (`POST .../quarantine`), mở lại khay (`POST .../release`) hoặc hủy khay hoàn trả trọng lượng về lô gốc (`POST .../void`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-BATC-REPA-PACK-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/batches/:batchId/packages` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-BATC-REPA-PACK-03.
- **THEN** Hệ thống xử lý thành công qua `RepackOrdersController`, cập nhật chính xác dữ liệu `RepackOrder` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-BATC-REPA-PACK-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-BATC-REPA-PACK-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/batches/:batchId/packages` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-BATC-REPA-PACK-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Đóng khay Chia nhỏ Hàng tươi sống Cân ký & In Tem Barcode Khay** (`/store-owner/batches/:batchId/packages`, `/employee/batches/:batchId/packages`): Khi quét mã vạch khay tại quầy POS (`GET /api/packages/scan`), hệ thống nạp đúng trọng lượng và đơn giá chốt của khay đó vào giỏ hàng.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-BATC-REPA-PACK-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/batches/:batchId/packages` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-BATC-REPA-PACK-04.
- **THEN** Hệ thống xử lý thành công qua `RepackOrdersController`, cập nhật chính xác dữ liệu `RepackOrder` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-BATC-REPA-PACK-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-BATC-REPA-PACK-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/batches/:batchId/packages` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Lịch sử
- 2026-11-28 · `batch-repack-packages (baseline AS-IS)` · +4 ~0 -0
