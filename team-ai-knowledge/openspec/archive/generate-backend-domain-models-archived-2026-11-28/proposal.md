# Proposal: generate-backend-domain-models

## Vấn đề
Hiện tại, dự án backend `MT_GRMS_BACKEND` (.NET 8 Clean Architecture) chỉ mới có một số ít thực thể Domain mẫu (User, Product, Supplier, Branch...) và chưa phản ánh đầy đủ mô hình cơ sở dữ liệu hoàn chỉnh 34 bảng thuộc 7 phân hệ nghiệp vụ đã được chuẩn hóa 3NF trong `MT_GRMS_Full_Database.sql`.
Điều này gây cản trở cho việc phát triển các tính năng nghiệp vụ tiếp theo (Bán hàng POS, Quản lý kho đa chi nhánh, Quản lý chuỗi cung ứng, Chấm công tính lương, Quản lý thu chi tài chính, Kê khai thuế và Multi-tenant SaaS).

## Mục tiêu
- Xây dựng đầy đủ các Domain Entities trong tầng `MT_GRMS.Domain/Entities` tương ứng với 34 bảng trong cơ sở dữ liệu `MT_GRMS_Full_Database.sql`.
- Đảm bảo tuân thủ kiến trúc Clean Architecture, kế thừa chuẩn `BaseTenantEntity` cho các thực thể phạm vi Tenant (Tenant-scoped) và phân loại theo đúng thư mục phân hệ nghiệp vụ (SaaS, Identity, Catalog, Inventory, Supplier, Sales, Finance, HR, System).
- Thiết lập các `DbSet<T>` và Entity Type Configurations (Fluent API) tương ứng trong `MT_GRMS.Infrastructure/Persistence` để sẵn sàng cho EF Core mapping, Migration, và phục vụ các tầng Application/API.

## Phạm vi
### In scope:
- **Tầng Domain (`MT_GRMS.Domain`)**:
  - Tạo mới và chuẩn hóa 34 Domain Entities tương ứng 34 bảng trong `MT_GRMS_Full_Database.sql`, chia thành 7 phân hệ:
    1. Multi-Tenancy & Identity: `SubscriptionPlan`, `Tenant`, `User`, `TenantUser`, `TaxSnapshot`, `AuditLog`.
    2. Catalog & Products: `Category`, `Product`, `ProductUnit`, `ProductCombo`.
    3. Branch & Inventory: `Branch`, `BranchStock`, `Transfer`, `TransferDetail`.
    4. Supplier & Purchasing: `SupplierCategory`, `Supplier`, `SupplierDeliveryConfig`, `SupplierBlackoutDate`, `SupplierAPLedger`, `SupplierProduct`, `PurchaseOrder`, `PurchaseOrderDetail`, `GoodsReceipt`, `GoodsReceiptLine`.
    5. Sales & Customer: `Customer`, `Promotion`, `Order`, `OrderDetail`.
    6. Finance: `CashBook`, `ServiceExpense`.
    7. HR & Payroll: `Employee`, `Payslip`, `EmployeeSchedule`, `EmployeeBonusViolation`.
  - Định nghĩa Enums tương ứng cho các trường kiểu trạng thái, phương thức và vai trò (Status, Role, PaymentMethod, VatMethod, etc.).
- **Tầng Infrastructure (`MT_GRMS.Infrastructure`)**:
  - Khai báo các `DbSet<T>` đầy đủ trong `AppDbContext`.
  - Cấu hình Entity Type Configurations (Fluent API) cho các composite primary keys (`TenantUsers`, `SupplierProducts`, `BranchStocks`, `TransferDetails`, `PurchaseOrderDetails`, `GoodsReceiptLines`, `OrderDetails`, `ProductCombos`), khóa ngoại, chỉ mục (Index) và precision cho các trường tiền tệ `decimal(18,2)`.
- **Kiểm chứng**:
  - Biên dịch toàn bộ solution `MT_GRMS_BACKEND.sln` thành công (`dotnet build` PASS, 0 Error).

### Out of scope:
- Viết Repository, Service xử lý business logic nghiệp vụ chi tiết cho từng bảng (sẽ thực hiện theo từng user story cụ thể).
- Viết Controller / API Endpoints RESTful CRUD cho toàn bộ 34 bảng.
- Thực thi chạy migration trực tiếp lên DB production.

## Người dùng liên quan
- **Developer / AI Coding Agent**: Có bộ models Domain & Infrastructure chuẩn hóa, type-safe, đầy đủ quan hệ để triển khai các use case Application.
- **Tech Lead / System Architect**: Dễ dàng kiểm soát cấu trúc dữ liệu theo đúng chuẩn 3NF và kiến trúc Multi-tenancy.
- **End-users (Tenant Admin, Branch Manager, Cashier, Warehouse Staff)**: Hưởng lợi gián tiếp từ sự ổn định và tính toàn vẹn dữ liệu của hệ thống backend.

## Tiêu chí thành công
- [ ] 34 bảng trong `MT_GRMS_Full_Database.sql` được mô hình hóa đầy đủ thành C# POCO Entities trong `MT_GRMS.Domain/Entities`.
- [ ] Các entity thuộc Tenant kế thừa `BaseTenantEntity` để hỗ trợ Global Query Filter và Soft Delete.
- [ ] `AppDbContext` đăng ký đầy đủ 34 `DbSet<...>` tương ứng.
- [ ] Fluent API Configurations định nghĩa chính xác khóa chính (bao gồm composite keys), khóa ngoại và mối quan hệ giữa các bảng.
- [ ] Solution `MT_GRMS_BACKEND.sln` chạy `dotnet build` đạt 0 Error.
