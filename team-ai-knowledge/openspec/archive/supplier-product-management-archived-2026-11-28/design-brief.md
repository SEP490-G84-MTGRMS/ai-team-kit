# Design Brief: Supplier Product Management (FE-09-SPM)

## 1. User Flows & System Interaction

```mermaid
flowchart TD
    A[Store Admin / Thu mua] -->|1. Truy cập màn hình| B[SupplierProductManagementPage]
    B -->|2. Chọn Nhà cung cấp| C[API GET /api/v1/suppliers/{id}]
    C -->|Tải thông tin NCC| B
    B -->|3. Tự động tải danh sách SP| D[API GET /api/v1/suppliers/{id}/products]
    D -->|Hiển thị bảng dữ liệu| E[SupplierProductTable]
    
    B -->|4. Bấm Gán sản phẩm mới| F[AssignProductModal]
    F -->|Chọn SP từ Catalog & Nhập giá/MOQ| G[API POST /api/v1/suppliers/{id}/products]
    G -->|Thành công| D
    
    E -->|5. Bấm Sửa giá/MOQ| H[EditSupplierProductModal]
    H -->|Cập nhật thông tin| I[API PUT /api/v1/suppliers/{id}/products/{productId}]
    I -->|Thành công| D
    
    E -->|6. Bấm Tạm ngưng / Kích hoạt| K[API PATCH /api/v1/suppliers/{id}/products/{productId}/status]
    K -->|Đổi trạng thái liên kết| D
```

---

## 2. API Endpoints & DTO Contracts

| Method | Endpoint | Description | Request Body / Query Params | Response Body | Error Codes |
|---|---|---|---|---|---|
| `GET` | `/api/v1/suppliers/{id}/products` | Lấy danh sách sản phẩm được gán cho NCC | `SearchTerm`, `CategoryId`, `Status`, `PageIndex`, `PageSize` | `PagedResult<SupplierProductDto>` | `200 OK`, `404 Not Found` |
| `POST` | `/api/v1/suppliers/{id}/products` | Gán sản phẩm mới vào danh mục của NCC | `AssignSupplierProductCommand` | `SupplierProductDto` | `201 Created`, `400 Bad Request`, `409 Conflict (Already Assigned)` |
| `PUT` | `/api/v1/suppliers/{id}/products/{productId}` | Cập nhật giá sỉ thỏa thuận, MOQ, ĐVT giao | `UpdateSupplierProductCommand` | `SupplierProductDto` | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `PATCH` | `/api/v1/suppliers/{id}/products/{productId}/status` | Bật / Tắt trạng thái liên kết sản phẩm (Active/Inactive) | `ToggleSupplierProductStatusRequest` | `SupplierProductDto` | `200 OK`, `404 Not Found` |
| `PATCH` | `/api/v1/suppliers/{id}/products/{productId}/primary` | Đặt làm Nhà cung cấp chính cho sản phẩm | `SetPrimarySupplierRequest` | `SupplierProductDto` | `200 OK`, `404 Not Found` |
| `GET` | `/api/v1/products/{id}/suppliers` | Tra cứu các NCC cung cấp một sản phẩm (dùng cho PO) | `OnlyActive (bool)` | `List<ProductSupplierMappingDto>` | `200 OK`, `404 Not Found` |

### DTOs & Command Schemas

```typescript
export interface SupplierProductDto {
  id: string;
  supplierId: string;
  productId: string;
  barcode: string;
  productName: string;
  sku: string;
  categoryName?: string;
  deliveryUoM: string;
  baseUoM: string;
  conversionRate: number; // Tỷ lệ quy đổi DeliveryUoM ra BaseUoM
  agreedWholesalePrice: number;
  minimumOrderQuantity: number;
  isPrimarySupplier: boolean;
  supplierProductCode?: string;
  status: 'Active' | 'Inactive';
  createdAtUtc: string;
  updatedAtUtc?: string;
}

export interface AssignSupplierProductCommand {
  productId: string;
  deliveryUoM: string;
  agreedWholesalePrice: number;
  minimumOrderQuantity: number;
  isPrimarySupplier?: boolean;
  supplierProductCode?: string;
}

export interface UpdateSupplierProductCommand {
  deliveryUoM: string;
  agreedWholesalePrice: number;
  minimumOrderQuantity: number;
  isPrimarySupplier?: boolean;
  supplierProductCode?: string;
}
```

---

## 3. Frontend UI Component Design

Thiết kế giao diện tuân thủ tiêu chuẩn **KiotViet Brand Blue** (`#0066FF`, `#F7FAFF`), font văn bản `Be Vietnam Pro` và font số liệu `JetBrains Mono`:

1. **`SupplierProductManagementPage` (`src/features/supplier/pages/SupplierProductManagementPage.tsx`)**:
   - **Header Bar**:
     - Tiêu đề: "Quản lý Sản phẩm theo Nhà cung cấp".
     - Navigation links: `← Danh sách Nhà cung cấp`, `Xem chi tiết NCC`, `Trang chủ`.
     - Nút Action chính: "+ Gán sản phẩm mới" (Full Pill `#0066FF`).
   - **Thẻ Ngữ cảnh Nhà cung cấp (`SupplierContextCard` - Bo góc 24px)**:
     - Dropdown chọn NCC (kèm tìm kiếm nhanh theo mã/tên/SĐT).
     - Nhãn tóm tắt: Trạng thái (Pill xanh/xám), Thời hạn thanh toán (`Payment Term`), Hạn mức công nợ (`Credit Limit` format VNĐ), Tổng số mặt hàng đang liên kết.
   - **Thanh Công cụ & Bộ lọc (`SupplierProductFilterBar`)**:
     - Lọc theo Nhóm ngành hàng (`All Categories`, `Fresh`, `Dairy`, `Snack`, `Beverage`...).
     - Lọc theo Trạng thái liên kết (`Tất cả`, `Đang áp dụng`, `Tạm ngưng`).
     - Ô tìm kiếm nhanh theo Tên SP, SKU, Barcode (Debounced 300ms).
   - **Bảng Dữ liệu (`SupplierProductTable`)**:
     - Cột: STT (width 40px), Mã vạch Barcode (`font-mono`), Tên sản phẩm, ĐVT giao nhận, Giá nhập sỉ thỏa thuận (`font-mono tabular-nums`, màu xanh đậm), Số lượng đặt tối thiểu (MOQ), NCC chính (Badge vàng "Mặc định"), Trạng thái (Active Pill `#00C853`, Inactive Pill `#8E8E93`), Thao tác (Sửa giá/MOQ, Tạm ngưng/Kích hoạt lại).
   - **Các trạng thái UI**:
     - *Loading*: Bảng skeleton 6 dòng hiệu ứng mượt.
     - *Empty*: Minh họa "Nhà cung cấp chưa có sản phẩm nào được gán. Bấm nút gán sản phẩm để bắt đầu!" kèm nút kêu gọi hành động.
     - *Error*: Banner cảnh báo đỏ nhạt kèm nút thử lại.

2. **Modal Gán Sản phẩm Mới (`AssignProductModal`)**:
   - Form gán trong Modal bo góc 24px:
     - Chọn sản phẩm từ Master Catalog (Dropdown autocomplete với Barcode + Tên + ĐVT cơ sở).
     - Đơn vị tính giao hàng (`Delivery UoM`): Chai/Lọ, Hộp, Thùng, Két, Gói, Kg...
     - Giá nhập sỉ thỏa thuận (VNĐ): Input định dạng số có dấu phẩy phân cách hàng nghìn.
     - Số lượng đặt hàng tối thiểu (`MOQ`): Input số nguyên, tối thiểu = 1.
     - Checkbox "Đặt làm Nhà cung cấp chính cho sản phẩm này".
     - Mã sản phẩm riêng của NCC (tùy chọn).
     - Nút Huỷ và Nút "Xác nhận gán" (Full Pill).

3. **Modal Chỉnh sửa Giá & MOQ (`EditSupplierProductModal`)**:
   - Hiển thị thông tin cố định: Tên sản phẩm, Barcode, Tên NCC.
   - Cho phép cập nhật nhanh: Giá nhập thỏa thuận mới, MOQ mới, Đổi ĐVT giao hàng, Cờ NCC chính.

---

## 4. Database Schema Changes (EF Core 8 Code-First)

### Bảng `SupplierProducts`
```sql
CREATE TABLE [SupplierProducts] (
    [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    [TenantId] UNIQUEIDENTIFIER NOT NULL,
    [SupplierId] UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES [Suppliers]([Id]),
    [ProductId] UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES [Products]([Id]),
    [SupplierProductCode] NVARCHAR(100) NULL,
    [AgreedWholesalePrice] DECIMAL(18,2) NOT NULL,
    [MinimumOrderQuantity] INT NOT NULL DEFAULT 1,
    [DeliveryUoM] NVARCHAR(50) NOT NULL,
    [ConversionRate] DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    [IsPrimarySupplier] BIT NOT NULL DEFAULT 0,
    [Status] INT NOT NULL DEFAULT 1, -- 1: Active, 2: Inactive
    [RowVersion] ROWVERSION NOT NULL,
    [CreatedAtUtc] DATETIME2 NOT NULL,
    [CreatedBy] NVARCHAR(100) NULL,
    [UpdatedAtUtc] DATETIME2 NULL,
    [UpdatedBy] NVARCHAR(100) NULL,
    [IsDeleted] BIT NOT NULL DEFAULT 0
);

-- Unique index ngăn chặn gán trùng 1 sản phẩm cho cùng 1 NCC trong 1 Tenant
CREATE UNIQUE INDEX [IX_SupplierProducts_TenantId_SupplierId_ProductId] 
ON [SupplierProducts]([TenantId], [SupplierId], [ProductId]) 
WHERE [IsDeleted] = 0;

-- Index phục vụ tra cứu ngược sản phẩm do NCC nào cung cấp & NCC chính
CREATE INDEX [IX_SupplierProducts_TenantId_ProductId_IsPrimary] 
ON [SupplierProducts]([TenantId], [ProductId], [IsPrimarySupplier]) 
WHERE [IsDeleted] = 0;
```

---

## 5. Business Rules & RBAC Permissions

### Quy tắc nghiệp vụ (Business Rules):
- **BR-SP01 (Chống gán trùng)**: Một sản phẩm chỉ được gán tối đa 1 lần cho cùng 1 Nhà cung cấp trong phạm vi Tenant. Nếu đã tồn tại nhưng ở trạng thái `Inactive`, hệ thống hướng dẫn người dùng kích hoạt lại (`Reactivate`) thay vì tạo mới.
- **BR-SP02 (Primary Supplier Độc quyền)**: Mỗi sản phẩm trong một Tenant chỉ có tối đa 1 Nhà cung cấp được gán cờ `IsPrimarySupplier = true`. Khi đánh dấu NCC mới là Primary, hệ thống tự động gỡ cờ Primary của NCC cũ.
- **BR-SP03 (Ràng buộc giá trị hợp lệ)**: Giá nhập sỉ thỏa thuận (`AgreedWholesalePrice`) bắt buộc > 0. Số lượng đặt hàng tối thiểu (`MOQ`) bắt buộc là số nguyên >= 1.
- **BR-SP04 (Bảo toàn dữ liệu lịch sử)**: Khi tạm ngưng liên kết (`Status = Inactive`), không làm ảnh hưởng đến các đơn đặt hàng (PO) hay phiếu nhập kho (GRN) đã tạo trước đó. Các đơn PO mới sẽ không được phép chọn sản phẩm từ NCC đã bị tạm ngưng.
- **BR-SP05 (Đồng bộ đa Tenant)**: Dữ liệu liên kết cô lập hoàn toàn giữa các Tenant thông qua Global Query Filter.

### Phân quyền (RBAC):
- `Owner` / `Admin`: Toàn quyền gán sản phẩm, sửa giá thỏa thuận, thiết lập Primary Supplier, bật/tắt trạng thái.
- `StoreManager` / `PurchasingStaff`: Được gán sản phẩm, đề xuất giá nhập thỏa thuận và xem danh sách.
- `InventoryStaff` / `Cashier`: Chỉ đọc (tra cứu sản phẩm và NCC để phục vụ nhập kho hoặc kiểm tra nguồn gốc).
