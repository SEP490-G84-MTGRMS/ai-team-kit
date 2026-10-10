# Design Brief: Master Supplier Management & AP Ledger (FE-09)

## 1. User Flows & System Interaction

```mermaid
flowchart TD
    A[Người dùng / Kế toán] -->|1. Xem danh sách| B[SupplierListPage]
    B -->|2. Lọc / Tìm kiếm| C[Query API GET /suppliers]
    B -->|3. Thêm mới NCC| D[SupplierFormModal]
    D -->|Validate & Submit| E[API POST /suppliers]
    B -->|4. Xem chi tiết / Nợ AP| F[SupplierDetailDrawer]
    F -->|Tab AP Ledger| G[API GET /suppliers/{id}/ap/ledger]
    F -->|Thao tác đổi trạng thái| H[API PATCH /suppliers/{id}/status]
    F -->|Gán Khách hàng liên kết| I[API POST /suppliers/{id}/link-customer]
```

---

## 2. API Endpoints & DTO Contracts

| Method | Endpoint | Description | Request Body / Query | Response DTO | Error Codes |
|---|---|---|---|---|---|
| `GET` | `/api/v1/suppliers` | Lấy danh sách NCC có phân trang, lọc | `SearchTerm`, `SupplierType`, `Status`, `CategoryId`, `PageIndex`, `PageSize` | `PagedResult<SupplierSummaryDto>` | `400` |
| `GET` | `/api/v1/suppliers/{id}` | Chi tiết hồ sơ NCC | — | `SupplierDetailDto` | `404` |
| `POST` | `/api/v1/suppliers` | Tạo mới Hồ sơ NCC | `CreateSupplierCommand` | `SupplierDetailDto` | `400 (Duplicate Code, Invalid TaxCode)` |
| `PUT` | `/api/v1/suppliers/{id}` | Cập nhật Hồ sơ NCC | `UpdateSupplierCommand` | `SupplierDetailDto` | `400 (BR-S07 Type Narrowing Violation), 404` |
| `PATCH` | `/api/v1/suppliers/{id}/status` | Đổi trạng thái Active/Inactive | `UpdateSupplierStatusRequest` | `SupplierDetailDto` | `400 (BR-S03 Inactivation Guard), 404` |
| `DELETE` | `/api/v1/suppliers/{id}` | Thử xóa NCC (Chỉ xóa mềm nếu chưa phát sinh GD) | — | `204 No Content` | `400 (BR-S03 Has Transactions Guard)` |
| `GET` | `/api/v1/suppliers/{id}/ap/ledger` | Xem sổ cái biến động nợ AP | `FromDate`, `ToDate`, `PageIndex`, `PageSize` | `PagedResult<SupplierAPLedgerDto>` | `404` |
| `POST` | `/api/v1/suppliers/{id}/ap/transactions` | Ghi nhận biến động công nợ AP (Internal/PO/GRN/Payment) | `RecordAPTransactionCommand` | `SupplierAPLedgerDto` | `400, 409 (Duplicate IdempotencyKey)` |
| `POST` | `/api/v1/suppliers/{id}/link-customer` | Liên kết hồ sơ Khách hàng (Dual-role) | `LinkCustomerRequest` | `SupplierDetailDto` | `400, 404` |

---

## 3. Frontend UI Component Design

Thành phần giao diện được xây dựng chuẩn **KiotViet Brand Blue** (`#0066FF`, `#F7FAFF`), font `Be Vietnam Pro` cho văn bản và `JetBrains Mono` cho tiền tệ/mã đơn:

1. **`SupplierListPage`**:
   - **Header Bar**: Tiêu đề "Quản lý Nhà cung cấp", nút "Thêm nhà cung cấp mới" (Full Pill `#0066FF`).
   - **Stat Cards Grid** (Bo góc 24px):
     - Card 1: Tổng số NCC.
     - Card 2: Tổng công nợ AP (`font-family: JetBrains Mono`, màu `#FF9500`).
     - Card 3: Số NCC đang hoạt động (`#00C853`).
   - **Filter & Search Bar**: Input tìm kiếm (Tên, Mã, SĐT, MST), Select lọc Loại NCC (Goods / Service / Both), Select Nhóm NCC, Select Trạng thái.
   - **Data Table**:
     - Cột: Mã NCC (`font-mono`), Tên NCC, Loại NCC (Pill Badge), Số điện thoại, Công nợ hiện tại (VND format `tabular-nums`), Trạng thái (Active Pill `#00C853`, Inactive Pill Gray), Hành động (Xem chi tiết, Sửa).
   - **Trạng thái UI**:
     - *Loading*: Skeleton table 5 dòng.
     - *Empty*: Placeholder minh họa "Chưa có nhà cung cấp nào. Tạo ngay!" kèm nút bấm.
     - *Error*: Banner cảnh báo sự cố kèm nút "Tải lại".

2. **`SupplierFormModal`**:
   - Modal bo góc 24px, bao gồm 3 Tabs:
     - *Thông tin chung*: Mã NCC (Tự sinh/Nhập tay), Tên NCC (*), Nhóm NCC, Loại NCC (*), Mã số thuế, Số điện thoại (*), Email, Địa chỉ.
     - *Điều khoản thanh toán*: Hạn mức nợ (`CreditLimit`), Thời hạn nợ ngày (`PaymentTermDays`).
     - *Tài khoản ngân hàng*: Tên ngân hàng, Số tài khoản, Chủ tài khoản.

3. **`SupplierDetailDrawer`**:
   - Drawer bên phải hiển thị tổng quan thông tin NCC.
   - Tab 1: Thông tin hồ sơ & Nút liên kết Hồ sơ Khách hàng.
   - Tab 2: Sổ cái công nợ AP Ledger (Bảng lịch sử tăng/giảm nợ, dư nợ sau mỗi GD).

---

## 4. Database Schema Changes (EF Core 8 Code-First)

### Bảng `SupplierCategories`
```sql
CREATE TABLE [SupplierCategories] (
    [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    [TenantId] UNIQUEIDENTIFIER NOT NULL,
    [Code] NVARCHAR(50) NOT NULL,
    [Name] NVARCHAR(255) NOT NULL,
    [Description] NVARCHAR(500) NULL,
    [CreatedAtUtc] DATETIME2 NOT NULL,
    [CreatedBy] NVARCHAR(100) NULL,
    [UpdatedAtUtc] DATETIME2 NULL,
    [UpdatedBy] NVARCHAR(100) NULL,
    [IsDeleted] BIT NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX [IX_SupplierCategories_TenantId_Code] ON [SupplierCategories]([TenantId], [Code]) WHERE [IsDeleted] = 0;
```

### Bảng `Suppliers`
```sql
CREATE TABLE [Suppliers] (
    [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    [TenantId] UNIQUEIDENTIFIER NOT NULL,
    [Code] NVARCHAR(50) NOT NULL,
    [Name] NVARCHAR(255) NOT NULL,
    [SupplierType] INT NOT NULL, -- 1: Goods, 2: Service, 3: Both
    [Status] INT NOT NULL DEFAULT 1, -- 1: Active, 2: Inactive
    [TaxCode] NVARCHAR(20) NULL,
    [Phone] NVARCHAR(20) NULL,
    [Email] NVARCHAR(100) NULL,
    [Address] NVARCHAR(500) NULL,
    [CategoryId] UNIQUEIDENTIFIER NULL FOREIGN KEY REFERENCES [SupplierCategories]([Id]),
    [PaymentTermDays] INT NOT NULL DEFAULT 0,
    [CreditLimit] DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    [CurrentDebt] DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    [LinkedCustomerId] UNIQUEIDENTIFIER NULL,
    [BankName] NVARCHAR(100) NULL,
    [BankAccountNo] NVARCHAR(50) NULL,
    [BankAccountHolder] NVARCHAR(100) NULL,
    [RowVersion] ROWVERSION NOT NULL,
    [CreatedAtUtc] DATETIME2 NOT NULL,
    [CreatedBy] NVARCHAR(100) NULL,
    [UpdatedAtUtc] DATETIME2 NULL,
    [UpdatedBy] NVARCHAR(100) NULL,
    [IsDeleted] BIT NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX [IX_Suppliers_TenantId_Code] ON [Suppliers]([TenantId], [Code]) WHERE [IsDeleted] = 0;
CREATE INDEX [IX_Suppliers_TenantId_Status] ON [Suppliers]([TenantId], [Status]);
```

### Bảng `SupplierAPLedgers`
```sql
CREATE TABLE [SupplierAPLedgers] (
    [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    [TenantId] UNIQUEIDENTIFIER NOT NULL,
    [SupplierId] UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES [Suppliers]([Id]),
    [DocNo] NVARCHAR(50) NOT NULL,
    [DocType] INT NOT NULL, -- 1: PurchaseInvoice/GRN, 2: PaymentVoucher, 3: ReturnAdjustment, 4: OpeningDebt
    [Amount] DECIMAL(18,2) NOT NULL,
    [Direction] INT NOT NULL, -- 1: Increase Debt (+), -1: Decrease Debt (-)
    [BalanceAfter] DECIMAL(18,2) NOT NULL,
    [SourceType] NVARCHAR(50) NOT NULL,
    [SourceId] UNIQUEIDENTIFIER NOT NULL,
    [IdempotencyKey] NVARCHAR(100) NOT NULL,
    [Note] NVARCHAR(500) NULL,
    [PostingDateUtc] DATETIME2 NOT NULL,
    [CreatedAtUtc] DATETIME2 NOT NULL,
    [CreatedBy] NVARCHAR(100) NULL
);
CREATE UNIQUE INDEX [IX_SupplierAPLedgers_TenantId_IdempotencyKey] ON [SupplierAPLedgers]([TenantId], [IdempotencyKey]);
CREATE INDEX [IX_SupplierAPLedgers_TenantId_SupplierId_PostingDateUtc] ON [SupplierAPLedgers]([TenantId], [SupplierId], [PostingDateUtc] DESC);
```

---

## 5. Business Rules & RBAC Permissions

### Quy tắc nghiệp vụ (Business Rules):
- **BR-S01**: Mã Nhà cung cấp là duy nhất trong cùng một Tenant.
- **BR-S03**: Không cho phép xóa cứng (Hard Delete) hoặc chuyển sang `Inactive` nếu NCC đang có Đơn đặt hàng (PO) chưa hoàn tất, Phiếu nhập kho (GRN) chưa thanh toán, hoặc Dư nợ AP > 0.
- **BR-S07**: Không cho phép thu hẹp `SupplierType` (ví dụ: chuyển từ `Both` về `Goods` nếu NCC đã từng có giao dịch thanh toán Dịch vụ `Service`).
- **BR-S08**: Ghi nhận biến động công nợ AP phải đảm bảo tính `Idempotent`. Không chấp nhận ghi trùng giao dịch có cùng `IdempotencyKey`.
- **BR-S11**: Khi liên kết Hồ sơ Khách hàng (Dual-role), nợ AR và nợ AP độc lập tuyệt đối, không tự động offset.

### Phân quyền (RBAC):
- `Owner` / `Admin`: Toàn quyền CRUD NCC, xem/điều chỉnh Sổ cái AP Ledger, đổi trạng thái.
- `StoreManager` / `Accountant`: Xem danh sách, tạo mới, sửa thông tin hành chính, ghi nhận giao dịch thanh toán.
- `InventoryStaff`: Chỉ xem danh sách NCC loại `Goods` hoặc `Both` để lập đơn PO/GRN.
