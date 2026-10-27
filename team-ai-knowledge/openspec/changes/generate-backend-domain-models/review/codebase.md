# Codebase Review: generate-backend-domain-models

## Bản đồ ảnh hưởng
| REQ | Code hiện có | Cần thêm/sửa | Ghi chú |
|---|---|---|---|
| REQ-01 | `MT_GRMS.Domain/Common/BaseTenantEntity.cs` | Thêm `BaseEntity.cs`, cập nhật `BaseTenantEntity : BaseEntity` | Tách biệt thực thể Global và Tenant-scoped |
| REQ-01 | `MT_GRMS.Domain/Entities/Identity/User.cs` | Cập nhật `User` đầy đủ theo bảng `Users`, thêm `TenantUser.cs` | Bổ sung `[NotMapped]` alias nếu cần |
| REQ-01 | `MT_GRMS.Domain/Entities/Catalog/Product.cs` | Cập nhật `Product`, `Category`, thêm `ProductUnit.cs`, `ProductCombo.cs` | Thêm `[NotMapped]` SKU, ProductName |
| REQ-01 | `MT_GRMS.Domain/Entities/SaaS/Branch.cs` | Cập nhật `Branch`, thêm `SubscriptionPlan.cs`, `Tenant.cs` | Bổ sung GPS lat/long, radius |
| REQ-01 | `MT_GRMS.Domain/Entities/Inventory/` | Thêm `BranchStock.cs`, `Transfer.cs`, `TransferDetail.cs` | Thay thế `StockOnHand.cs` bằng `BranchStock.cs` |
| REQ-01 | `MT_GRMS.Domain/Entities/Supplier/` | Cập nhật `Supplier` và thêm `PurchaseOrder`, `PurchaseOrderDetail`, `GoodsReceipt`, `GoodsReceiptLine` | Hoàn thiện chuỗi cung ứng |
| REQ-01 | `MT_GRMS.Domain/Entities/Sales/` | Thêm `Customer.cs`, `Promotion.cs`, chuẩn hóa `Order.cs`, `OrderDetail.cs` | Thay thế `OrderItem` bằng `OrderDetail` |
| REQ-01 | `MT_GRMS.Domain/Entities/Finance/` | Thêm `CashBook.cs`, `ServiceExpense.cs` | Chuẩn hóa bảng tiền tệ |
| REQ-01 | `MT_GRMS.Domain/Entities/HR/` | Tạo thư mục mới và 4 entities: `Employee`, `Payslip`, `EmployeeSchedule`, `EmployeeBonusViolation` | Phân hệ HR & Chấm công GPS |
| REQ-02 | `MT_GRMS.Infrastructure/Persistence/Configurations/` | Bổ sung configurations cho toàn bộ 34 entities chia theo thư mục | Composite keys, FKs, Decimals |
| REQ-03 | `MT_GRMS.Infrastructure/Persistence/AppDbContext.cs` | Khai báo 34 `DbSet<T>`, kiểm tra ApplyConfigurationsFromAssembly và Global Query Filter | Đồng bộ đầy đủ DbContext |
| REQ-04 | Toàn bộ solution | Chạy `dotnet build` kiểm tra | 0 Errors |

## Tái sử dụng được
- `src/MT_GRMS.Domain/Common/BaseTenantEntity.cs` — Kế thừa cho các entity Tenant-scoped.
- `src/MT_GRMS.Infrastructure/Persistence/AppDbContext.cs` — Đã có sẵn cơ chế Global Query Filter và tự động gán Audit info.
- `src/MT_GRMS.Domain/Entities/Supplier/*.cs` — Đã có 6 entities supplier sơ khởi, chỉ cần bổ sung thêm PO & GRN.

## Xung đột / rủi ro
- [MEDIUM] `MT_GRMS.Application` có thể tham chiếu trực tiếp đến `Product.ProductName` hoặc `User.Username`.
  - **Đề xuất**: Giữ các thuộc tính alias có accessor `[NotMapped]` để đảm bảo 100% không gãy build ở tầng Application.

## Kết luận: Khả thi
Toàn bộ mã nguồn sẵn sàng cho việc mở rộng mô hình dữ liệu.
