# MT-GRMS — Sơ Đồ Thực Thể Quan Hệ (ERD Diagram)

> **Dự án**: Multi-Tenant Grocery Retail Management System (MT-GRMS / SGMS)  
> **Cập nhật lần cuối**: 2026-10-11  
> **Lệnh đồng bộ**: `npm run sep -- db-sync`

---

## 1. Sơ Đồ ERD Tổng Quan Toàn Hệ Thống

```mermaid
erDiagram
    TENANT ||--o{ USER : "phân vùng"
    TENANT ||--o{ ROLE : "phân vùng"
    TENANT ||--o{ CATEGORY : "phân vùng"
    TENANT ||--o{ PRODUCT : "phân vùng"
    TENANT ||--o{ BATCH : "phân vùng"
    TENANT ||--o{ STOCK_ON_HAND : "phân vùng"
    TENANT ||--o{ ORDER : "phân vùng"
    TENANT ||--o{ CASHBOOK_TRANSACTION : "phân vùng"

    ROLE ||--o{ USER : "cấp quyền cho (RoleId)"
    
    CATEGORY ||--o{ CATEGORY : "danh mục cha-con (ParentCategoryId)"
    CATEGORY ||--o{ PRODUCT : "chứa (CategoryId)"
    
    PRODUCT ||--o{ BATCH : "quản lý theo lô (ProductId)"
    PRODUCT ||--o{ STOCK_ON_HAND : "tồn kho (ProductId)"
    BATCH ||--o{ STOCK_ON_HAND : "tồn kho theo lô (BatchId)"
    
    ORDER ||--|{ ORDER_ITEM : "chi tiết hóa đơn (OrderId)"
    PRODUCT ||--o{ ORDER_ITEM : "bán trong (ProductId)"
    
    ORDER ||..o{ CASHBOOK_TRANSACTION : "sinh phiếu thu bán lẻ (ReferenceCode)"
    
    USER {
        Guid Id PK
        string TenantId
        string Username
        string Email
        string FullName
        string Phone
        Guid RoleId FK
        Guid BranchId
        bool IsActive
        bool IsDeleted
    }

    ROLE {
        Guid Id PK
        string TenantId
        string RoleName
        string Description
        string PermissionsJson
        bool IsDeleted
    }

    CATEGORY {
        Guid Id PK
        string TenantId
        string CategoryCode
        string CategoryName
        Guid ParentCategoryId FK
        bool IsDeleted
    }

    PRODUCT {
        Guid Id PK
        string TenantId
        string SKU
        string Barcode
        string ProductName
        Guid CategoryId FK
        decimal BasePrice
        decimal CostPrice
        string UnitName
        bool HasBatches
        bool IsActive
        bool IsDeleted
    }

    BATCH {
        Guid Id PK
        string TenantId
        Guid ProductId FK
        Guid BranchId
        string BatchCode
        datetime ManufactureDate
        datetime ExpiryDate
        decimal InitialQuantity
        decimal LandedCostPerUnit
        bool IsDeleted
    }

    STOCK_ON_HAND {
        Guid Id PK
        string TenantId
        Guid BranchId
        Guid ProductId FK
        Guid BatchId FK
        decimal Quantity
        decimal ReservedQuantity
        decimal MinAlertThreshold
        bool IsDeleted
    }

    ORDER {
        Guid Id PK
        string TenantId
        string OrderCode
        Guid StoreId
        decimal SubTotal
        decimal DiscountAmount
        decimal TotalAmount
        int PaymentMethod
        int PaymentStatus
        string Note
        bool IsDeleted
    }

    ORDER_ITEM {
        Guid Id PK
        string TenantId
        Guid OrderId FK
        Guid ProductId FK
        string ProductName
        decimal UnitPrice
        decimal Quantity
        decimal TotalLineAmount
        bool IsDeleted
    }

    CASHBOOK_TRANSACTION {
        Guid Id PK
        string TenantId
        string TransactionCode
        Guid BranchId
        int Type
        string Category
        decimal Amount
        string ReferenceCode
        string Description
        Guid CreatedByUserId
        bool IsDeleted
    }
```

---

## 2. Các Ràng Buộc Khóa & Quan Hệ Cốt Lõi

1. **Multi-Tenancy Hierarchy**:
   - Mọi entity đều độc lập theo `TenantId`. Dữ liệu của Tenant A không bao giờ giao thoa với Tenant B.
2. **FEFO Allocation Chain (Luồng kiểm soát hạn sử dụng)**:
   - `Product` $\rightarrow$ `Batch` (sắp xếp `ExpiryDate ASC`) $\rightarrow$ `StockOnHand` $\rightarrow$ `OrderItem`.
   - Khi xuất kho tại quầy POS, hệ thống ưu tiên phân bổ `Batch` có `ExpiryDate` gần nhất (`AvailableQuantity > 0`).
3. **Audit & Soft Delete**:
   - Toàn bộ các bảng đều có `IsDeleted` và `CreatedAt` kế thừa từ `BaseTenantEntity`.
