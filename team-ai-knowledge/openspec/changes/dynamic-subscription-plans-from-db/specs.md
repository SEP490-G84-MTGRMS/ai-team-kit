# Specs: dynamic-subscription-plans-from-db

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `GET` | `/api/v1/tenant/pricing-plans` | — | `ApiResponse<IReadOnlyList<PlanSummaryResponse>>` | 401 Unauthorized |
| `POST` | `/api/v1/tenant/subscriptions/purchase` | `PurchaseSubscriptionRequest` | `ApiResponse<PurchaseSubscriptionResponse>` | 400 Bad Request, 404 Not Found |

## MODIFIED Requirements

### Requirement: REQ-SUB-01 Dynamic Subscription Plans Loading
Hệ thống Frontend MUST tải danh sách gói cước trực tiếp từ API Backend `GET /api/v1/tenant/pricing-plans`.
Hệ thống Frontend MUST NOT sử dụng mảng tĩnh hardcode `SUBSCRIPTION_PLANS` để render danh sách thẻ cước. Số lượng thẻ cước hiển thị trên màn hình MUST khớp chính xác 1:1 với số lượng bản ghi `IsActive = true` trả về từ Backend.

#### Scenario: Hiển thị đúng số lượng gói cước khớp với Database hiện tại
- **GIVEN** Cơ sở dữ liệu Postgres `mtgrms_db` hiện có 2 gói cước đang hoạt động: `FREE` (0 đ) và `PRO` (999.000 đ).
- **WHEN** Chủ gian hàng truy cập màn hình `http://localhost:5173/store-owner/subscriptions?tab=subscriptions`.
- **THEN** Giao diện chỉ hiển thị đúng 2 thẻ cước tương ứng là "Gói Cơ Bản (Miễn Phí) 01" và "Gói Doanh Nghiệp (Toàn Năng)".
- **AND** Không xuất hiện các thẻ ảo không tồn tại trong DB như "Gói hỗ trợ 270k" hay "Gói cao cấp 490k".

#### Scenario: Tự động cập nhật khi Database thay đổi số lượng gói cước
- **GIVEN** Admin thêm mới 1 gói cước `VIP` (490.000 đ) hoặc kích hoạt thêm gói cước trong Database.
- **WHEN** Người dùng làm mới hoặc tải trang Gói dịch vụ.
- **THEN** Giao diện tự động render thành 3 thẻ cước mà không cần sửa code hay rebuild Frontend.

---

### Requirement: REQ-SUB-02 Plan Presentation & Feature Mapping
Hệ thống MUST tự động trích xuất các thuộc tính hiển thị trực quan từ đối tượng `PlanSummaryResponse`:
1. **Giá tiền**: Nếu `MonthlyPrice == 0` thì hiển thị "0 đ" (Miễn phí); nếu `> 0` thì format chuẩn tiếng Việt (vd `999.000 đ`).
2. **Quy mô chi nhánh / kho**: Trích xuất từ `Quotas.MaxBranches` (vd: "Tối đa 10 chi nhánh" hoặc "1 chi nhánh/tháng").
3. **Danh sách tính năng**: Trích xuất các tính năng `true` từ `Features` (Cảnh báo cận date FEFO, Quy đổi Thùng sang Lon, Thanh toán VietQR Napas247, Sổ nợ & CSKH Zalo, Quét barcode bán hàng, Báo cáo tài chính & P&L).
4. **Nút hành động (CTA)**:
   - Với gói đang sử dụng (trùng tên với `storeInfo.currentPlan`): Hiển thị nút "Gói hiện tại" (disabled hoặc viền xám).
   - Với gói miễn phí khác: Hiển thị nút "Dùng ngay".
   - Với gói trả phí: Hiển thị nút "Mua ngay" / "Nâng cấp".

#### Scenario: Gói cước hiển thị đầy đủ tính năng và hạn mức từ DB
- **GIVEN** Dữ liệu gói `PRO` có `MaxBranches = 10`, `MaxEmployees = 100`, và các module nghiệp vụ `true`.
- **WHEN** Thẻ cước `PRO` hiển thị.
- **THEN** Thẻ cước liệt kê rõ ràng hạn mức chi nhánh, tài khoản truy cập và các tính năng nghiệp vụ đã bật.

---

### Requirement: REQ-SUB-03 Loading & Empty State
Hệ thống MUST hiển thị hiệu ứng Skeleton Loader trong thời gian chờ API trả về dữ liệu.
Hệ thống MUST hiển thị Empty State nếu Backend trả về mảng rỗng (không có gói cước nào kích hoạt).

#### Scenario: Hiển thị Skeleton khi đang tải
- **GIVEN** Người dùng vừa chuyển sang tab Gói dịch vụ.
- **WHEN** API `GET /api/v1/tenant/pricing-plans` đang thực thi.
- **THEN** Giao diện hiển thị các khung Skeleton màu xám chuyển động nhẹ, không bị giật trang.

---

### Requirement: REQ-SUB-04 Checkout Modal Integration
Hộp thoại `SubscriptionCheckoutModal.tsx` MUST nhận đối tượng gói cước động từ thẻ cước được click, hiển thị đúng giá cước và tính năng, và gửi đúng `planCode` lên API `POST /api/v1/tenant/subscriptions/purchase`.

#### Scenario: Thanh toán thành công gói cước động
- **GIVEN** Người dùng chọn mua gói cước động `PRO` (999.000 đ/tháng).
- **WHEN** Người dùng chọn kỳ hạn 12 tháng và xác nhận thanh toán qua Ví hoặc VietQR.
- **THEN** Request gửi đi có `planCode = "PRO"`, `months = 12`, nhận về phản hồi gia hạn thành công từ Backend và cập nhật giao diện ngay lập tức.

## Acceptance Checklist
- [ ] REQ-SUB-01: Loại bỏ mảng tĩnh `SUBSCRIPTION_PLANS`, hiển thị đúng số lượng gói từ Database (2 gói hiện tại).
- [ ] REQ-SUB-02: Map động tên gói, giá cước, hạn mức quotas và danh sách features.
- [ ] REQ-SUB-03: Có trạng thái Skeleton loading và Empty state.
- [ ] REQ-SUB-04: Mua và kích hoạt gói cước động thành công qua modal.
