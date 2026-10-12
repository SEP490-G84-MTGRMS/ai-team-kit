# MT-GRMS — Database Schema & Data Dictionary (Từ điển dữ liệu toàn hệ thống)

> **Dự án**: Multi-Tenant Grocery Retail Management System (MT-GRMS / SGMS)  
> **Cập nhật lần cuối**: 2026-10-11  
> **Nguồn sự thật (Single Source of Truth)**: `MT_GRMS_BACKEND/src/MT_GRMS.Domain/Entities` & `AppDbContext.cs`  
> **Lệnh đồng bộ tự động**: `npm run sep -- db-sync`

---

## 1. Quy Chuẩn Chung Của Database (Global Conventions)

- **Đa người thuê (Multi-Tenancy)**: Mọi bảng nghiệp vụ kế thừa từ `BaseTenantEntity` bắt buộc chứa trường `TenantId (varchar/nvarchar)`. Mọi câu truy vấn EF Core được tự động áp dụng `Global Query Filter: e => !e.IsDeleted && e.TenantId == _tenantContext.CurrentTenantId`.
- **Xóa mềm (Soft Delete)**: Cột `IsDeleted (boolean)` đánh dấu bản ghi bị xóa, không xóa vật lý khỏi database để phục vụ Audit Trail.
- **Khóa chính**: `Id (Guid / UUID)` sinh tự động tại Application (`Guid.NewGuid()`).
- **Tiền tệ**: Mọi trường tiền tệ lưu kiểu `decimal(18,2)` tính theo VND.
- **Thời gian**: Lưu thời gian chuẩn UTC (`DateTime.UtcNow`), hiển thị ở Frontend theo múi giờ `Asia/Ho_Chi_Minh` (GMT+7).

---

## 2. Bảng Kế Thừa Gốc: `BaseTenantEntity`

Tất cả Entity kế thừa các trường cơ bản sau:

| Tên Cột | Kiểu Dữ Liệu | Nullable | Mô Tả Nghiệp Vụ |
|---|---|:---:|---|
| `Id` | `Guid` | ❌ | Khóa chính của thực thể (Primary Key). |
| `TenantId` | `string` | ❌ | Mã định danh người thuê / chuỗi cửa hàng (Multi-tenant partition key). |
| `CreatedAt` | `DateTime` | ❌ | Thời điểm tạo bản ghi (UTC). |
| `UpdatedAt` | `DateTime` | ✔️ | Thời điểm cập nhật gần nhất (UTC). |
| `CreatedBy` | `Guid` | ✔️ | ID người dùng thực hiện tạo bản ghi. |
| `IsDeleted` | `bool` | ❌ | Trạng thái xóa mềm (mặc định: `false`). |

---

## 3. Danh Mục Các Bảng Dữ Liệu (Data Dictionary)

### 3.1 Bảng `Product` (Sản phẩm)
Quản lý thông tin hàng hóa trong chuỗi siêu thị/tạp hóa.

| Tên Cột | Kiểu Dữ Liệu | Nullable | Khóa / Quan Hệ | Mô Tả Nghiệp Vụ |
|---|---|:---:|:---:|---|
| `SKU` | `string` | ❌ | Unique / Tenant | Mã quản lý nội bộ của sản phẩm (VD: `SP-00123`). |
| `Barcode` | `string` | ❌ | Index | Mã vạch quét tại quầy thu ngân (EAN-13, Code-128). |
| `ProductName` | `string` | ❌ | | Tên hiển thị của sản phẩm. |
| `CategoryId` | `Guid` | ✔️ | FK -> `Category.Id` | Danh mục hàng hóa cha. |
| `BasePrice` | `decimal(18,2)` | ❌ | | Giá niêm yết bán lẻ lẻ tại quầy. |
| `CostPrice` | `decimal(18,2)` | ❌ | | Giá vốn bình quân / giá nhập gần nhất. |
| `UnitName` | `string` | ❌ | | Đơn vị tính (Lon, Chai, Gói, Hộp, Kg...). Mặc định: `Cái`. |
| `HasBatches` | `bool` | ❌ | | Đánh dấu sản phẩm có quản lý theo lô & hạn sử dụng hay không. |
| `IsActive` | `bool` | ❌ | | Trạng thái kinh doanh (Đang bán / Ngừng bán). |

---

### 3.2 Bảng `Category` (Danh mục sản phẩm)
Phân loại hàng hóa theo cây danh mục cha - con.

| Tên Cột | Kiểu Dữ Liệu | Nullable | Khóa / Quan Hệ | Mô Tả Nghiệp Vụ |
|---|---|:---:|:---:|---|
| `CategoryCode` | `string` | ❌ | Unique / Tenant | Mã định danh danh mục (VD: `CAT-BEV`). |
| `CategoryName` | `string` | ❌ | | Tên nhóm hàng (Đồ uống, Bánh kẹo, Gia vị...). |
| `ParentCategoryId` | `Guid` | ✔️ | Self-FK | ID danh mục cha (dùng cho phân cấp danh mục). |

---

### 3.3 Bảng `Batch` (Lô hàng & Hạn sử dụng - FEFO Engine)
Theo dõi từng lô hàng nhập kho phục vụ thuật toán xuất kho cận hạn trước (First-Expired, First-Out).

| Tên Cột | Kiểu Dữ Liệu | Nullable | Khóa / Quan Hệ | Mô Tả Nghiệp Vụ |
|---|---|:---:|:---:|---|
| `ProductId` | `Guid` | ❌ | FK -> `Product.Id` | Sản phẩm thuộc lô hàng. |
| `BranchId` | `Guid` | ❌ | | Chi nhánh / Cửa hàng đang giữ lô hàng này. |
| `BatchCode` | `string` | ❌ | Index | Số lô do nhà sản xuất hoặc hệ thống in (VD: `LOT-202610-01`). |
| `ManufactureDate`| `DateTime` | ❌ | | Ngày sản xuất (MFG). |
| `ExpiryDate` | `DateTime` | ❌ | Index (ASC) | Hạn sử dụng (EXP) — dùng sắp xếp FEFO khi bán hàng. |
| `InitialQuantity`| `decimal(18,2)` | ❌ | | Số lượng nhập ban đầu theo chứng từ PO. |
| `LandedCostPerUnit`| `decimal(18,2)`| ❌ | | Giá nhập thực tế trên từng đơn vị sau thuế & phí vận chuyển. |
| *DaysUntilExpiry*| `int` | - | Computed | Số ngày còn lại đến hạn sử dụng (`ExpiryDate - UtcNow`). |
| *IsExpired* | `bool` | - | Computed | Cờ xác định lô đã quá hạn (`UtcNow > ExpiryDate`). |

---

### 3.4 Bảng `StockOnHand` (Tồn kho tức thời)
Quản lý tồn kho thực tế, tồn kho giữ chỗ (khách đang chờ thanh toán) và ngưỡng cảnh báo.

| Tên Cột | Kiểu Dữ Liệu | Nullable | Khóa / Quan Hệ | Mô Tả Nghiệp Vụ |
|---|---|:---:|:---:|---|
| `BranchId` | `Guid` | ❌ | | Chi nhánh / Kho hàng lưu trữ. |
| `ProductId` | `Guid` | ❌ | FK -> `Product.Id` | Sản phẩm được kiểm soát tồn. |
| `BatchId` | `Guid` | ✔️ | FK -> `Batch.Id` | Lô hàng cụ thể (nếu sản phẩm có quản lý lô). |
| `Quantity` | `decimal(18,2)` | ❌ | | Tổng số lượng vật lý thực tế trong kho. |
| `ReservedQuantity`| `decimal(18,2)`| ❌ | | Số lượng tạm giữ (cho đơn hàng đang tạo / đang chuyển kho). |
| *AvailableQuantity*| `decimal(18,2)`| - | Computed | Số lượng thực tế có thể bán (`Quantity - ReservedQuantity`). |
| `MinAlertThreshold`| `decimal(18,2)`| ❌ | | Ngưỡng tồn tối thiểu để kích hoạt cảnh báo hết hàng (mặc định: `10`). |

---

### 3.5 Bảng `Order` (Đơn hàng bán lẻ / POS)
Lưu trữ hóa đơn thanh toán tại quầy POS hoặc đơn online.

| Tên Cột | Kiểu Dữ Liệu | Nullable | Khóa / Quan Hệ | Mô Tả Nghiệp Vụ |
|---|---|:---:|:---:|---|
| `OrderCode` | `string` | ❌ | Unique / Tenant | Mã hóa đơn bán lẻ (VD: `HD-20261011-001`). |
| `StoreId` | `Guid` | ❌ | | Cửa hàng phát sinh giao dịch. |
| `SubTotal` | `decimal(18,2)` | ❌ | | Tổng tiền hàng trước chiết khấu. |
| `DiscountAmount` | `decimal(18,2)` | ❌ | | Số tiền giảm giá / khuyến mãi. |
| `TotalAmount` | `decimal(18,2)` | ❌ | | Số tiền thực thu của khách (`SubTotal - DiscountAmount`). |
| `PaymentMethod` | `PaymentMethod` | ❌ | Enum | Phương thức thanh toán: `Cash` (1), `Banking` (2), `VietQR` (3). |
| `PaymentStatus` | `PaymentStatus` | ❌ | Enum | Trạng thái: `Pending` (1), `Paid` (2), `Failed` (3), `Refunded` (4). |
| `Note` | `string` | ✔️ | | Ghi chú thêm của thu ngân hoặc yêu cầu của khách. |

---

### 3.6 Bảng `OrderItem` (Chi tiết dòng hóa đơn)
Lưu chi tiết từng sản phẩm, đơn giá và số lượng trong đơn hàng.

| Tên Cột | Kiểu Dữ Liệu | Nullable | Khóa / Quan Hệ | Mô Tả Nghiệp Vụ |
|---|---|:---:|:---:|---|
| `OrderId` | `Guid` | ❌ | FK -> `Order.Id` | Đơn hàng cha. |
| `ProductId` | `Guid` | ❌ | FK -> `Product.Id` | Sản phẩm được mua. |
| `ProductName` | `string` | ❌ | | Tên sản phẩm lưu tại thời điểm xuất hóa đơn (Snapshot). |
| `UnitPrice` | `decimal(18,2)` | ❌ | | Đơn giá bán tại thời điểm giao dịch. |
| `Quantity` | `decimal(18,2)` | ❌ | | Số lượng sản phẩm bán ra. |
| `TotalLineAmount`| `decimal(18,2)` | ❌ | | Thành tiền của dòng (`UnitPrice * Quantity`). |

---

### 3.7 Bảng `User` (Người dùng hệ thống)
Tài khoản đăng nhập của nhân viên, thu ngân, chủ cửa hàng và quản trị viên.

| Tên Cột | Kiểu Dữ Liệu | Nullable | Khóa / Quan Hệ | Mô Tả Nghiệp Vụ |
|---|---|:---:|:---:|---|
| `Username` | `string` | ❌ | Unique / Tenant | Tên đăng nhập của người dùng. |
| `Email` | `string` | ❌ | Index | Địa chỉ email liên hệ và nhận thông báo. |
| `PasswordHash` | `string` | ❌ | | Chuỗi mật khẩu băm bảo mật (BCrypt / PBKDF2). |
| `FullName` | `string` | ❌ | | Họ và tên đầy đủ của nhân viên. |
| `Phone` | `string` | ❌ | | Số điện thoại di động. |
| `RoleId` | `Guid` | ❌ | FK -> `Role.Id` | Vai trò và nhóm quyền hạn được gán. |
| `BranchId` | `Guid` | ✔️ | | Chi nhánh nhân viên đang làm việc (null nếu là Quản trị chuỗi). |
| `IsActive` | `bool` | ❌ | | Trạng thái tài khoản (Đang kích hoạt / Khóa). |

---

### 3.8 Bảng `Role` (Vai trò & Phân quyền RBAC)
Định nghĩa vai trò và danh sách các quyền hạn được cấp trong tenant.

| Tên Cột | Kiểu Dữ Liệu | Nullable | Khóa / Quan Hệ | Mô Tả Nghiệp Vụ |
|---|---|:---:|:---:|---|
| `RoleName` | `string` | ❌ | Unique / Tenant | Tên vai trò (Owner, StoreManager, Cashier, StockKeeper). |
| `Description` | `string` | ❌ | | Diễn giải trách nhiệm của vai trò. |
| `PermissionsJson`| `string` | ❌ | | Mảng JSON chứa danh sách permission codes (VD: `["catalog:read", "pos:checkout"]`). |

---

### 3.9 Bảng `CashbookTransaction` (Sổ quỹ tiền mặt & Ngân hàng)
Quản lý dòng tiền thu / chi phát sinh từ bán hàng, nhập hàng và các chi phí vận hành.

| Tên Cột | Kiểu Dữ Liệu | Nullable | Khóa / Quan Hệ | Mô Tả Nghiệp Vụ |
|---|---|:---:|:---:|---|
| `TransactionCode`| `string` | ❌ | Unique / Tenant | Mã phiếu thu / chi (VD: `PT-001`, `PC-002`). |
| `BranchId` | `Guid` | ❌ | | Chi nhánh phát sinh khoản tiền. |
| `Type` | `CashbookType` | ❌ | Enum | Loại phiếu: `Receipt` = 1 (Phiếu thu), `Payment` = 2 (Phiếu chi). |
| `Category` | `string` | ❌ | | Hạng mục thu chi (Bán hàng, Nhập hàng, Điện nước, Lương...). |
| `Amount` | `decimal(18,2)` | ❌ | | Số tiền phát sinh. |
| `ReferenceCode` | `string` | ❌ | | Mã chứng từ liên quan (Mã đơn hàng POS hoặc mã phiếu nhập kho). |
| `Description` | `string` | ❌ | | Ghi chú lý do phát sinh khoản thu chi. |
| `CreatedByUserId`| `Guid` | ❌ | | Người tạo phiếu thu chi. |

---

## 4. Lịch Sử Thay Đổi Schema (Changelog)

- **2026-10-11**: Khởi tạo Schema Dictionary toàn hệ thống phiên bản v1.0. Quét 9 thực thể Domain cơ bản từ `MT_GRMS_BACKEND`.
- **2026-10-11**: Đồng bộ tự động qua `sep db-sync`. Quét 9 entities (Product, Category, CashbookTransaction, User, Role, Batch, StockOnHand, Order, OrderItem).
