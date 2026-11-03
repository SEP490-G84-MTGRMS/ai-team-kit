# Tasks: generate-backend-domain-models

## Backend: Domain Layer (POCO Entities & Common)
- [x] T1 — Tạo BaseEntity.cs và cập nhật BaseTenantEntity.cs trong MT_GRMS.Domain/Common (REQ-01)
- [x] T2 — Tạo/cập nhật các Entities phân hệ SaaS, Identity và System (SubscriptionPlan, Tenant, Branch, User, TenantUser, TaxSnapshot, AuditLog) (REQ-01)
- [x] T3 — Tạo/cập nhật các Entities phân hệ Catalog (Category, Product, ProductUnit, ProductCombo) kèm alias tương thích ngược (REQ-01)
- [x] T4 — Tạo/cập nhật các Entities phân hệ Inventory & Điều chuyển (BranchStock, Transfer, TransferDetail) (REQ-01)
- [x] T5 — Hoàn thiện các Entities phân hệ Supplier & Purchasing (Supplier, SupplierCategory, SupplierDeliveryConfig, SupplierBlackoutDate, SupplierAPLedger, SupplierProduct, PurchaseOrder, PurchaseOrderDetail, GoodsReceipt, GoodsReceiptLine) (REQ-01)
- [x] T6 — Tạo/cập nhật các Entities phân hệ Sales & Finance (Customer, Promotion, Order, OrderDetail, CashBook, ServiceExpense) (REQ-01)
- [x] T7 — Tạo các Entities phân hệ HR & Payroll (Employee, Payslip, EmployeeSchedule, EmployeeBonusViolation) (REQ-01)

## Backend: Infrastructure Layer (EF Core Configurations & DbContext)
- [x] T8 — Tạo các lớp Fluent API EntityTypeConfiguration tương ứng cho 34 thực thể trong MT_GRMS.Infrastructure/Persistence/Configurations/ (REQ-02)
- [x] T9 — Khai báo 34 DbSet<T> và đồng bộ Global Query Filter cùng SaveChanges Audit trong AppDbContext.cs (REQ-03)

## Test & Verification
- [x] T10 — Chạy biên dịch toàn bộ solution `dotnet build MT_GRMS_BACKEND.sln` xác nhận 0 Error, 0 Warning nghiêm trọng (REQ-04)
