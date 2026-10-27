# Exploration: generate-backend-domain-models

## 1. Hiện trạng Codebase
- **Tầng Domain (`MT_GRMS.Domain`)**:
  - Mới chỉ có một số Entity sơ khai: `User` (rất đơn giản, thiếu các trường bảo mật/auth), `Product` & `Category` (chưa có định mức combo, đơn vị quy đổi, tồn kho min/max, thuế VAT), `Supplier` cùng 5 bảng phụ của supplier, `Branch` (thiếu tọa độ GPS bán kính check-in), `Order` & `OrderItem` (chưa khớp schema hóa đơn bán lẻ POS 3NF có khuyến mãi và liên kết chi nhánh), `StockOnHand` và `CashbookTransaction`.
  - Hoàn toàn chưa có các phân hệ:
    - **SaaS & Multi-Tenancy**: `SubscriptionPlan`, `Tenant`, `TenantUser`, `TaxSnapshot`, `AuditLog`.
    - **Purchasing / Chuỗi cung ứng**: `PurchaseOrder`, `PurchaseOrderDetail`, `GoodsReceipt`, `GoodsReceiptLine`.
    - **Kho vận & Điều chuyển**: `BranchStock` (lô hạn FEFO), `Transfer`, `TransferDetail`.
    - **Bán hàng & Khuyến mãi**: `Customer`, `Promotion`.
    - **Tài chính**: `CashBook`, `ServiceExpense`.
    - **Nhân sự & Tiền lương**: `Employee`, `Payslip`, `EmployeeSchedule`, `EmployeeBonusViolation`.
- **Tầng Infrastructure (`MT_GRMS.Infrastructure`)**:
  - `AppDbContext` mới chỉ khai báo 8 `DbSet` và áp dụng cấu hình tự động qua `ApplyConfigurationsFromAssembly`.
  - Global Query Filter đang gắn vào `BaseTenantEntity` (`e.TenantId == _tenantContext.CurrentTenantId && !e.IsDeleted`).
  - Trong schema SQL, các bảng gốc hệ thống (`SubscriptionPlans`, `Tenants`, `Users`) không chứa cột `TenantID` nên không thể kế thừa `BaseTenantEntity` (sẽ bị lỗi runtime nếu filter cố truy xuất `TenantId`).

## 2. Giả định (Assumptions)
1. **Kiểu dữ liệu Khóa chính (Primary Key)**: File SQL `MT_GRMS_Full_Database.sql` định nghĩa toàn bộ khóa chính dạng `VARCHAR(50)` (ví dụ `PlanID`, `TenantID`, `UserID`, `ProductID`...). Trong C#, các trường này sẽ được mô hình hóa bằng `string` (hỗ trợ Nanoid / Guid string / Business Code) nhằm tương thích 100% với schema DDL.
2. **Phân cấp Base Entity**:
   - `BaseEntity`: Dành cho các thực thể toàn cục hệ thống (Global/SaaS root như `SubscriptionPlan`, `Tenant`, `User`) gồm `Id`, `CreatedAt`, `UpdatedAt`, `IsDeleted`.
   - `BaseTenantEntity : BaseEntity`: Dành cho các thực thể thuộc phạm vi Tenant, bổ sung `TenantId` và `CreatedBy`.
3. **Mối quan hệ & Khóa chính phức hợp**: Các bảng N-N hoặc bảng chi tiết có composite key (`TenantUsers`, `ProductCombos`, etc.) cần cấu hình Fluent API `HasKey` tường minh.

## 3. Ngoài phạm vi (Non-Goals)
- Không chỉnh sửa file DDL gốc `MT_GRMS_Full_Database.sql`.
- Không triển khai các Handler MediatR, CQRS queries, Repository nghiệp vụ hoặc REST Controller trong change này.
- Không tự động thực thi migrate làm thay đổi CSDL production.

## 4. Đánh giá Phương án Kỹ thuật

### Phương án 1: Dùng lệnh `dotnet ef dbcontext scaffold` (Reverse Engineering)
- **Cách làm**: Chạy migration/scaffold tự động từ một instance database MySQL có sẵn vào project.
- **Ưu điểm**: Sinh code nhanh chóng, không tốn công gõ tay.
- **Nhược điểm**:
  - Đòi hỏi phải cấu hình và chạy sẵn MySQL Server chứa đủ 34 bảng.
  - Code sinh ra là anemic classes, tên thuộc tính và quan hệ bị sinh máy móc.
  - Không kế thừa được `BaseTenantEntity` và `BaseEntity` của Clean Architecture, làm vô hiệu hóa cơ chế Global Query Filter tự động và Soft Delete.
  - Khó kiểm soát định dạng PascalCase / camelCase và XML documentation.

### Phương án 2: Mô hình hóa Code-First tường minh theo Clean Architecture (Được chọn)
- **Cách làm**:
  - Phân nhóm 34 thực thể vào 8 thư mục phân hệ trong `MT_GRMS.Domain/Entities`: `SaaS`, `Identity`, `Catalog`, `Inventory`, `Supplier`, `Sales`, `Finance`, `HR`.
  - Tách `BaseEntity` và `BaseTenantEntity` chuẩn hóa.
  - Viết Entity Type Configuration (Fluent API) cho từng thực thể trong `MT_GRMS.Infrastructure/Persistence/Configurations/` tương ứng.
  - Khai báo đầy đủ 34 `DbSet<T>` trong `AppDbContext`.
- **Ưu điểm**:
  - Tuân thủ 100% kiến trúc Clean Architecture của dự án.
  - Bảo toàn hoàn toàn cơ chế cô lập Tenant (Multi-tenancy Isolation) và Soft Delete qua Global Query Filter.
  - Type-safe, cấu hình khóa ngoại, precision tiền tệ `decimal(18,2)` và index tường minh.
  - Hỗ trợ tốt cả SQL Server, PostgreSQL lẫn MySQL qua EF Core abstractions.
- **Nhược điểm**:
  - Cần viết cẩn thận, đảm bảo 34 thực thể và các cấu hình mapping khớp từng thuộc tính với schema SQL.

## 5. Phương án Lựa chọn & Rationale
Chọn **Phương án 2**. Đây là phương án tiêu chuẩn cho dự án Enterprise SaaS Clean Architecture, đảm bảo tính nhất quán của domain model, tận dụng triệt để Global Query Filter, và không phụ thuộc vào trạng thái kết nối DB lúc build.

## 6. Rủi ro & Giải pháp Giảm thiểu
| Rủi ro | Mức độ | Biện pháp giảm thiểu |
|---|---|---|
| Lệch kiểu dữ liệu giữa SQL và C# (ví dụ `BIT(1)` vs `bool`, `TIME` vs `TimeSpan`, `DECIMAL(18,2)` vs `decimal`) | Trung bình | Định nghĩa tường minh kiểu dữ liệu C# tương ứng và chỉ định `HasColumnType` trong Fluent API. |
| Entity hệ thống bị Global Query Filter lọc nhầm | Cao | Tách `BaseEntity` (không có TenantId) cho thực thể Root (`SubscriptionPlan`, `Tenant`, `User`) và chỉ áp dụng filter cho lớp con `BaseTenantEntity`. |
| Composite primary key ở các bảng liên kết gây lỗi EF Core | Trung bình | Khai báo `builder.HasKey(...)` rõ ràng trong Fluent API Configuration. |
