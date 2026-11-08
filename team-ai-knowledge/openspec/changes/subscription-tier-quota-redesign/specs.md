# Specs: subscription-tier-quota-redesign

## API / Contract
| Method | Path | Request DTO | Response DTO | Lỗi |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/tenant/pricing-plans` | — | `ApiResponse<IReadOnlyList<PlanSummaryResponse>>` | `500` |
| `POST` | `/api/tenant/subscriptions/purchase` | `PurchaseSubscriptionRequest` | `ApiResponse<PurchaseSubscriptionResponse>` | `400 INSUFFICIENT_WALLET_BALANCE`, `400 BAD_REQUEST`, `404 PLAN_NOT_FOUND` |
| `GET` | `/api/branches/quota` | — | `ApiResponse<BranchQuotaDto>` | `401`, `404 TENANT_NOT_FOUND` |
| `POST` | `/api/branches` | `CreateBranchRequest` | `ApiResponse<BranchDto>` | `400 QUOTA_EXCEEDED`, `400 DUPLICATE_CODE` |

---

## ADDED Requirements

### Requirement: REQ-01 Chuẩn Hóa Danh Mục 2 Gói Cước SaaS (Giá Đột Phá 99k)
Hệ thống MUST chỉ nạp và kích hoạt 2 gói cước chính thức trong CSDL:
1. `STANDARD`: **99.000 đ/tháng**, 1 chi nhánh kiêm kho, 1 tài khoản chủ shop.
2. `PRO`: **249.000 đ/tháng**, mặc định sẵn 2 chi nhánh, không giới hạn tài khoản nhân viên.

#### Scenario: Lấy danh sách gói cước hoạt động
- **GIVEN** Chủ cửa hàng đã đăng nhập vào hệ thống
- **WHEN** Gửi request `GET /api/tenant/pricing-plans`
- **THEN** Hệ thống trả về 2 gói `STANDARD` (99k) và `PRO` (249k) với đầy đủ giá tháng, giá năm và hạn mức chi nhánh.

---

### Requirement: REQ-02 Quy Tắc Chi Nhánh Kiêm Kho Hàng Tại Chỗ
Mỗi chi nhánh (`Branch`) của cửa hàng MUST là một điểm bán hàng POS kiêm kho hàng lưu trữ tại chỗ. Hệ thống MUST loại bỏ hoàn toàn các trường và option liên quan đến "Kho phụ".

#### Scenario: Khởi tạo và quản lý chi nhánh
- **GIVEN** Chủ cửa hàng tạo một chi nhánh mới
- **WHEN** Chi nhánh được thêm vào CSDL
- **THEN** Chi nhánh tự động có kho hàng và danh mục hàng hóa để xuất nhập tồn và bán hàng POS ngay lập tức mà không cần tạo thực thể kho riêng biệt.

---

### Requirement: REQ-03 Option Quản Lý Nhân Viên Cho Gói Thường
Chủ cửa hàng sử dụng `Gói Thường (STANDARD)` SHALL có thể mua thêm tiện ích mở rộng tính năng Quản lý & Phân quyền nhân viên với mức giá **+30.000 đ / tháng**.

#### Scenario: Mua Gói Thường kèm Option Nhân viên
- **GIVEN** Khách hàng chọn mua Gói Thường chu kỳ 12 tháng và tích chọn Option Quản lý nhân viên
- **WHEN** Thực hiện thanh toán qua `POST /api/tenant/subscriptions/purchase`
- **THEN** Tiền gói = $99.000 \times 12 = 1.188.000$ đ, tiền Option NV = $30.000 \times 12 = 360.000$ đ.
- **THEN** Tổng tiền trước thuế = $1.548.000$ đ, VAT 10% = $154.800$ đ. Tổng thanh toán = $1.702.800$ đ.
- **THEN** `Tenant.HasStaffManagementAddon` được cập nhật thành `true`.

---

### Requirement: REQ-04 Mua Thêm Chi Nhánh Cho Gói Pro
Chủ cửa hàng sử dụng `Gói Pro (PRO)` SHALL có thể mua thêm số lượng chi nhánh vượt hạn mức mặc định (2 chi nhánh) với mức giá ưu đãi **+80.000 đ / chi nhánh / tháng**.

#### Scenario: Mua Gói Pro và thêm 2 chi nhánh mở rộng
- **GIVEN** Khách hàng chọn Gói Pro chu kỳ 12 tháng và tăng số chi nhánh thêm `extraBranches = 2`
- **WHEN** Thực hiện thanh toán
- **THEN** Tiền gói gốc = $249.000 \times 12 = 2.988.000$ đ.
- **THEN** Tiền chi nhánh thêm = $2 \times 80.000 \times 12 = 1.920.000$ đ.
- **THEN** Thuế VAT 10% = $490.800$ đ. Tổng tiền = $5.398.800$ đ.
- **THEN** Hạn mức mới của Tenant = $2 \text{ (gốc)} + 2 \text{ (thêm)} = 4$ chi nhánh.

---

### Requirement: REQ-05 Dùng Thử 3 Ngày Full Tính Năng Gói Pro
Tất cả khách hàng mới đăng ký tài khoản Tenant MUST được cấp tự động gói `PRO` ở chế độ `TRIAL` với thời hạn chính xác là 3 ngày (`DateTime.UtcNow.AddDays(3)`).

#### Scenario: Khách mới đăng ký trải nghiệm
- **GIVEN** Người dùng hoàn tất đăng ký tài khoản gian hàng mới
- **WHEN** Tài khoản được tạo trong CSDL
- **THEN** `Tenant.CurrentPlan = "PRO"`, `Tenant.SubscriptionStatus = "TRIAL"`, và `Tenant.SubscriptionExpiresAt = DateTime.UtcNow.AddDays(3)`.
- **THEN** Header hiển thị huy hiệu đếm ngược "⏳ Dùng thử còn 3 ngày".

#### Scenario: Hết hạn dùng thử 3 ngày
- **GIVEN** Tenant có `SubscriptionExpiresAt < DateTime.UtcNow` và `SubscriptionStatus == "TRIAL"`
- **WHEN** Người dùng thao tác các chức năng bán hàng POS hoặc tạo chi nhánh
- **THEN** Hệ thống thông báo lỗi `SUBSCRIPTION_EXPIRED` và hiển thị Modal yêu cầu chọn thanh toán gói cước.

---

## MODIFIED Requirements

### Requirement: Kiểm Tra Hạn Mức Chi Nhánh (Quota Guard)
Hệ thống MUST kiểm tra hạn mức cho phép tạo chi nhánh dựa trên công thức:
$$\text{MaxAllowedBranches} = \text{Plan.MaxBranches} + \text{Tenant.ExtraBranches}$$

#### Scenario: Tạo chi nhánh trong hạn mức
- **GIVEN** Tenant gói Pro có sẵn 2 chi nhánh và `ExtraBranches = 1` (Tổng 3 chi nhánh), hiện đã tạo 2 chi nhánh
- **WHEN** Chủ cửa hàng gửi request `POST /api/branches` tạo chi nhánh thứ 3
- **THEN** Hệ thống cho phép tạo thành công (201 Created).

#### Scenario: Tạo chi nhánh vượt hạn mức
- **GIVEN** Tenant đã tạo đủ 3 chi nhánh
- **WHEN** Gửi request `POST /api/branches` tạo chi nhánh thứ 4
- **THEN** Hệ thống ném ngoại lệ `BusinessException("QUOTA_EXCEEDED")` với mã lỗi 400 Bad Request.

---

## REMOVED Requirements

### Requirement: Gói Dịch Vụ Miễn Phí Vĩnh Viễn (FREE Forever)
- **Lý do xóa bỏ**: Loại bỏ để tối ưu tài nguyên hạ tầng và chuyển sang mô hình dùng thử 3 ngày chuyên nghiệp.

### Requirement: Tiện Ích Mua Thêm Kho Phụ (+150k)
- **Lý do xóa bỏ**: Loại bỏ hoàn toàn vì mỗi chi nhánh đã kiêm luôn kho hàng tại chỗ.

---

## Acceptance Checklist
- [ ] Bảng `SubscriptionPlans` có đúng 2 gói `STANDARD` (99k) và `PRO` (249k) trong CSDL.
- [ ] Bảng `Tenants` có đủ cột `ExtraBranches`, `HasStaffManagementAddon`, `SubscriptionStatus`.
- [ ] Đăng ký mới có thời hạn dùng thử 3 ngày gói Pro.
- [ ] Modal thanh toán tính đúng tiền cho Gói Thường (Option NV +30k) và Gói Pro (Chi nhánh +80k) kèm VAT 10%.
- [ ] Quota chi nhánh tính đúng theo `Plan.MaxBranches + ExtraBranches`.
- [ ] Frontend hiển thị 2 thẻ giá chuẩn và không còn trường nhập "Kho phụ".
- [ ] Toàn bộ test suite và build Frontend/Backend pass 100%.
