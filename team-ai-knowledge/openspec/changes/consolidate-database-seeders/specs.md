# Đặc Tả Kỹ Thuật (Delta Specs) - Refactor Database Seeders

## MODIFIED Requirements

### Requirement: REQ-SEED-01 Điểm Khởi Tạo Duy Nhất (Single Entrypoint)
Hệ thống Backend MUST chỉ sử dụng duy nhất phương thức `DbInitializer.InitializeAsync(AppDbContext context)` trong `Program.cs` để khởi tạo cấu trúc CSDL và nạp dữ liệu mẫu. Tệp `DatabaseSeeder.cs` SHALL được loại bỏ hoàn toàn khỏi mã nguồn.

#### Scenario: Khởi động API trên máy chủ hoặc Cloud
- **GIVEN** Cơ sở dữ liệu PostgreSQL (mới tinh hoặc đã có dữ liệu từ trước).
- **WHEN** Ứng dụng Backend Web API khởi động và tạo scope service.
- **THEN** Chỉ duy nhất `DbInitializer.InitializeAsync(dbContext)` được thực thi, hoàn thành quá trình nạp dữ liệu mẫu thành công mà không có lỗi ngoại lệ (exception).

---

### Requirement: REQ-SEED-02 Tính Lũy Đẳng Theo Mô-đun (Idempotent Modular Seeding)
Tất cả các khối nạp dữ liệu (SaaS, Identity, Catalog, Thuế, Sổ quỹ, Khách hàng công nợ, Nhà cung cấp, Đơn hàng) MUST kiểm tra tính tồn tại (`!await context.Entities.AnyAsync(...)`) trước khi thực hiện thêm mới (`AddRangeAsync`).

#### Scenario: Khởi động lại ứng dụng lần thứ hai (Restart Idempotency)
- **GIVEN** Cơ sở dữ liệu đã được nạp dữ liệu mẫu thành công ở lần khởi động trước.
- **WHEN** Ứng dụng Backend được restart (ví dụ redeploy trên Render).
- **THEN** Không có bất kỳ lỗi vi phạm ràng buộc Unique Index hay Foreign Key nào xảy ra, và số lượng bản ghi không bị nhân bản (duplicate).

---

### Requirement: REQ-SEED-03 Bảo Toàn Tính Bất Biến Của Dữ Liệu Kiểm Thử (Demo Data Invariants)
Dữ liệu mẫu sau khi gộp MUST giữ nguyên toàn bộ các định danh và thuộc tính nghiệp vụ quan trọng phục vụ kiểm thử giao diện Frontend:
1. Gói cước SaaS: `plan_free`, `plan_pro`, `plan_support`, `plan_vip`.
2. Tài khoản quản trị và người dùng:
   - `admin` / `Admin@123` (SUPER_ADMIN)
   - `store_owner` (Mã PIN 1234 băm PBKDF2 phục vụ xác thực bảo mật)
   - `manager01` / `Manager@123` (Quản lý chi nhánh)
   - `cashier01` / `Cashier@123` (Thu ngân POS)
3. Danh mục & Sản phẩm phân loại thuế:
   - `FMCG-001`, `FMCG-002`, `FMCG-003` gắn `TaxCategory = Standard1Pct` (thuế 0.8%).
   - `ALC-001`, `ALC-002`, `TOB-001` gắn `TaxCategory = NoReduction1Pct` (thuế TTĐB 1.0%).
4. Doanh thu Báo cáo Thuế Q3/2026 (385 triệu VNĐ) và các phiếu chi mặt bằng, điện nước.
5. Tài khoản tài chính `FinanceAccounts` (Két Till, Két Safe, Ngân hàng Bank) và hồ sơ công nợ FIFO khách hàng.
6. Nhà cung cấp và cấu hình ma trận đặt hàng (Lead time, Cutoff time).

#### Scenario: Kiểm thử đăng nhập và tải báo cáo thuế từ Frontend
- **GIVEN** Dữ liệu đã được nạp bởi `DbInitializer`.
- **WHEN** Người dùng đăng nhập tài khoản `admin` hoặc `store_owner` và truy cập màn hình Báo cáo thuế / Sổ quỹ / Đặt hàng.
- **THEN** Dữ liệu mẫu hiển thị đầy đủ, không bị rỗng hoặc lỗi 404/500.
