---
id: DES-MT-GRMS-001
title: "MT-GRMS — Từ Điển Dữ Liệu & Thiết Kế Thực Thể Toàn Hệ Thống (Master Database Schema & Data Dictionary)"
date: "2026-10-12"
author: "SEP490-G84"
project: "MT-GRMS"
tags: [design, database, schema, entities, erd, multi-tenancy]
---

# 🗄️ MT-GRMS — Từ Điển Dữ Liệu & Thiết Kế Thực Thể Toàn Hệ Thống

> **Dự án**: Multi-Tenant Grocery Retail Management System (MT-GRMS / SGMS)  
> **Cập nhật chuẩn**: Khớp 100% với Báo cáo SRS (Report-3) và Sơ đồ Conceptual ERD (Draw.io XML)  
> **Backend Implementation**: .NET 8 Clean Architecture (`MT_GRMS_BACKEND`), Entity Framework Core 8, SQL Server  

---

## 1. Nguyên Tắc Thiết Kế Cơ Sở Dữ Liệu Bất Biến

1. **Phân lập Đa Người Thuê Tuyệt Đối (Multi-Tenancy Partitioning)**:
   - Tất cả các bảng nghiệp vụ kế thừa từ `BaseTenantEntity` **bắt buộc chứa cột `TenantId (varchar(50))`**.
   - EF Core cấu hình tự động: `HasQueryFilter(e => !e.IsDeleted && e.TenantId == _currentTenantId)`.
2. **Khóa chính & Khóa ngoại**:
   - Sử dụng kiểu `Guid (UUID)` sinh tại Application (`Guid.NewGuid()`) để đảm bảo không trùng lặp và tương thích đồng bộ phân tán.
3. **Audit Trail & Xóa Mềm (Soft Delete)**:
   - Mọi bảng có: `CreatedAt`, `UpdatedAt`, `CreatedBy`, `UpdatedBy`, `IsDeleted (bit)`. Tuyệt đối không xóa cứng (Hard Delete) dữ liệu giao dịch tài chính và kho.
4. **Tiền tệ & Số Lượng**:
   - Tiền tệ: `decimal(18,2)` tính theo VND.
   - Số lượng: `decimal(18,3)` để hỗ trợ cả sản phẩm cân ký (Kg, Gram) và đơn vị đóng gói (Lon, Chai, Thùng).
5. **Múi giờ**:
   - Lưu trữ chuẩn UTC (`DateTime.UtcNow`) trong cơ sở dữ liệu.

---

## 2. Bảng Cơ Sở Kế Thừa: `BaseTenantEntity`

| Tên Cột | Kiểu Dữ Liệu | Nullable | Ràng Buộc | Ý Nghĩa Nghiệp Vụ |
|---|---|:---:|:---:|---|
| `Id` | `Guid` | ❌ | PK | Khóa chính duy nhất của bản ghi. |
| `TenantId` | `varchar(50)` | ❌ | Index | Khóa phân vùng Multi-Tenant (Tenant Code). |
| `CreatedAt` | `datetime2` | ❌ | | Thời điểm tạo bản ghi (UTC). |
| `CreatedBy` | `Guid` | ✔️ | | ID người tạo bản ghi. |
| `UpdatedAt` | `datetime2` | ✔️ | | Thời điểm cập nhật cuối cùng (UTC). |
| `UpdatedBy` | `Guid` | ✔️ | | ID người sửa bản ghi cuối cùng. |
| `IsDeleted` | `bit` | ❌ | Def: 0 | Cờ đánh dấu xóa mềm. |

---

## 3. Chi Tiết Các Bảng Theo Phân Hệ (Data Dictionary)

### 3.1 Phân Hệ Nền Tảng & Tổ Chức (Identity & Organization)

#### Bảng `Tenants` (Quản lý Khách thuê / Chủ chuỗi)
*Bảng cấp nền tảng quản lý bởi SaaS Master Admin.*
| Cột | Kiểu | Null | Ràng Buộc | Ý Nghĩa |
|---|---|:---:|:---:|---|
| `Id` | `varchar(50)` | ❌ | PK | Mã định danh Tenant (Slug/Code duy nhất, VD: `taphoa-hoangmai`). |
| `StoreName` | `nvarchar(200)` | ❌ | | Tên thương hiệu chuỗi cửa hàng. |
| `OwnerEmail` | `varchar(150)` | ❌ | Unique | Email đăng ký của chủ sở hữu. |
| `OwnerPhone` | `varchar(20)` | ❌ | | Số điện thoại liên hệ chính. |
| `TaxNumber` | `varchar(50)` | ✔️ | | Mã số thuế hộ kinh doanh / công ty. |
| `SubscriptionPlanId` | `Guid` | ❌ | FK -> Plans | Gói dịch vụ SaaS hiện tại. |
| `SubscriptionExpiredAt` | `datetime2` | ❌ | | Hạn sử dụng gói dịch vụ SaaS. |
| `IsActive` | `bit` | ❌ | Def: 1 | Trạng thái hoạt động (1: Hoạt động, 0: Đang bị khóa). |

#### Bảng `Branches` (Chi nhánh cửa hàng)
*Kế thừa `BaseTenantEntity`.*
| Cột | Kiểu | Null | Ràng Buộc | Ý Nghĩa |
|---|---|:---:|:---:|---|
| `BranchCode` | `varchar(50)` | ❌ | Unique/Tenant | Mã chi nhánh (VD: `CN-01`, `CN-CAUGIAY`). |
| `BranchName` | `nvarchar(200)` | ❌ | | Tên chi nhánh hiển thị. |
| `Address` | `nvarchar(300)` | ❌ | | Địa chỉ mặt bằng cửa hàng. |
| `PhoneNumber` | `varchar(20)` | ✔️ | | Điện thoại liên hệ của chi nhánh. |
| `IsMainBranch` | `bit` | ❌ | Def: 0 | Đánh dấu chi nhánh trung tâm / kho tổng. |

#### Bảng `Users` & `Employees` (Người dùng & Hồ sơ nhân viên)
*Kế thừa `BaseTenantEntity`.*
| Cột | Kiểu | Null | Ràng Buộc | Ý Nghĩa |
|---|---|:---:|:---:|---|
| `EmployeeCode` | `varchar(50)` | ❌ | Unique/Tenant | Mã nhân viên (VD: `NV-001`). |
| `FullName` | `nvarchar(150)` | ❌ | | Họ và tên nhân viên. |
| `Email` | `varchar(150)` | ✔️ | | Email đăng nhập. |
| `PasswordHash` | `varchar(255)` | ✔️ | | Mật khẩu băm (BCrypt / Argon2). |
| `GoogleId` | `varchar(100)` | ✔️ | | ID tài khoản Google liên kết (OAuth 2.0). |
| `Role` | `varchar(50)` | ❌ | | Vai trò (`StoreOwner`, `StoreManager`, `Cashier`, `InventoryStaff`). |
| `AssignedBranchId` | `Guid` | ✔️ | FK -> Branches | Chi nhánh được phân công làm việc. |
| `HourlyRate` | `decimal(18,2)` | ✔️ | | Đơn giá lương theo giờ (VNĐ/giờ). |
| `BaseSalary` | `decimal(18,2)` | ✔️ | | Lương cứng hàng tháng (nếu có). |
| `IsActive` | `bit` | ❌ | Def: 1 | Trạng thái tài khoản (1: Đang làm, 0: Đã nghỉ việc). |

---

### 3.2 Phân Hệ Hàng Hóa & Lô Hạn FEFO (Catalog & Inventory)

#### Bảng `Categories` (Danh mục sản phẩm)
*Kế thừa `BaseTenantEntity`.*
| Cột | Kiểu | Null | Ràng Buộc | Ý Nghĩa |
|---|---|:---:|:---:|---|
| `CategoryCode` | `varchar(50)` | ❌ | Unique/Tenant | Mã nhóm hàng (VD: `CAT-BEV`). |
| `CategoryName` | `nvarchar(150)` | ❌ | | Tên nhóm hàng (Đồ uống, Bánh kẹo, Sữa...). |
| `ParentCategoryId` | `Guid` | ✔️ | FK -> Self | Danh mục cha (nếu có cây phân cấp). |

#### Bảng `Products` (Sản phẩm)
*Kế thừa `BaseTenantEntity`.*
| Cột | Kiểu | Null | Ràng Buộc | Ý Nghĩa |
|---|---|:---:|:---:|---|
| `SKU` | `varchar(50)` | ❌ | Unique/Tenant | Mã quản lý nội bộ sản phẩm. |
| `Barcode` | `varchar(50)` | ❌ | Index | Mã vạch quét tại quầy (EAN-13, Code-128). |
| `ProductName` | `nvarchar(250)` | ❌ | | Tên sản phẩm hiển thị. |
| `CategoryId` | `Guid` | ✔️ | FK -> Categories | Nhóm hàng hóa. |
| `BaseUnit` | `nvarchar(50)` | ❌ | Def: 'Cái' | Đơn vị tính cơ bản nhỏ nhất (Lon, Gói, Chai, Kg). |
| `BasePrice` | `decimal(18,2)` | ❌ | | Giá niêm yết bán lẻ lẻ tại quầy. |
| `CostPrice` | `decimal(18,2)` | ❌ | | Giá vốn nhập hàng bình quân gia quyền. |
| `HasBatches` | `bit` | ❌ | Def: 1 | Bật/Tắt quản lý theo Lô và Hạn sử dụng (FEFO). |
| `NearExpiryDaysThreshold` | `int` | ❌ | Def: 30 | Số ngày tính là cận date để bắn cờ cảnh báo. |
| `IsActive` | `bit` | ❌ | Def: 1 | Trạng thái kinh doanh (1: Đang bán, 0: Ngừng bán). |

#### Bảng `ProductUnits` (Quy đổi đơn vị tính sản phẩm)
*Kế thừa `BaseTenantEntity`.*
| Cột | Kiểu | Null | Ràng Buộc | Ý Nghĩa |
|---|---|:---:|:---:|---|
| `ProductId` | `Guid` | ❌ | FK -> Products | Sản phẩm quy đổi. |
| `UnitName` | `nvarchar(50)` | ❌ | | Tên đơn vị quy đổi (VD: `Thùng`, `Lốc`). |
| `ConversionFactor` | `decimal(18,3)` | ❌ | | Hệ số quy đổi ra đơn vị cơ bản (VD: 1 Thùng = 24 Lon -> `24.0`). |
| `SellingPrice` | `decimal(18,2)` | ❌ | | Giá bán lẻ áp dụng cho đơn vị này. |
| `Barcode` | `varchar(50)` | ✔️ | | Mã vạch riêng của đơn vị quy đổi (Mã thùng). |

#### Bảng `Batches` (Lô hàng & Hạn sử dụng - Trái tim FEFO)
*Kế thừa `BaseTenantEntity`.*
| Cột | Kiểu | Null | Ràng Buộc | Ý Nghĩa |
|---|---|:---:|:---:|---|
| `ProductId` | `Guid` | ❌ | FK -> Products | Sản phẩm thuộc lô. |
| `BatchCode` | `varchar(100)` | ❌ | | Số lô sản xuất từ nhà sản xuất (VD: `LOT20261012`). |
| `ManufacturingDate` | `date` | ✔️ | | Ngày sản xuất (MFG). |
| `ExpiryDate` | `date` | ❌ | Index | Hạn sử dụng (EXP) — Dùng để sort ưu tiên xuất FEFO. |
| `SupplierId` | `Guid` | ✔️ | FK -> Suppliers | Nhà cung cấp lô hàng. |

#### Bảng `Inventory` (Tồn kho vật lý theo Chi nhánh + Lô)
*Kế thừa `BaseTenantEntity`.*
| Cột | Kiểu | Null | Ràng Buộc | Ý Nghĩa |
|---|---|:---:|:---:|---|
| `BranchId` | `Guid` | ❌ | FK -> Branches | Chi nhánh lưu kho. |
| `ProductId` | `Guid` | ❌ | FK -> Products | Sản phẩm tồn. |
| `BatchId` | `Guid` | ✔️ | FK -> Batches | Lô hàng cụ thể (nếu `HasBatches = true`). |
| `QuantityOnHand` | `decimal(18,3)` | ❌ | Def: 0 | Số lượng tồn kho thực tế khả dụng. |
| `MinStockAlert` | `decimal(18,3)` | ✔️ | | Ngưỡng tồn tối thiểu cần báo động nhập hàng. |
| `MaxStockAlert` | `decimal(18,3)` | ✔️ | | Ngưỡng tồn tối đa tránh đọng vốn. |

---

### 3.3 Phân Hệ Bán Hàng POS & Thanh Toán (POS & Orders)

#### Bảng `Customers` (Khách hàng & CRM)
*Kế thừa `BaseTenantEntity`.*
| Cột | Kiểu | Null | Ràng Buộc | Ý Nghĩa |
|---|---|:---:|:---:|---|
| `PhoneNumber` | `varchar(20)` | ❌ | Index | Số điện thoại khách hàng (Khóa tìm kiếm chính). |
| `FullName` | `nvarchar(150)` | ❌ | | Họ tên khách hàng. |
| `Email` | `varchar(100)` | ✔️ | | Email nhận hóa đơn điện tử và thông báo điểm. |
| `Address` | `nvarchar(255)` | ✔️ | | Địa chỉ giao hàng / cư trú. |
| `LoyaltyPoints` | `int` | ❌ | Def: 0 | Số điểm thưởng tích lũy khả dụng. |
| `MembershipTier` | `varchar(50)` | ❌ | Def: 'Standard' | Hạng thẻ: `Standard`, `Silver`, `Gold`, `VIP`. |
| `CurrentDebtAR` | `decimal(18,2)` | ❌ | Def: 0 | Tổng công nợ khách đang nợ cửa hàng (Phải thu AR). |
| `DebtLimit` | `decimal(18,2)` | ❌ | Def: 0 | Hạn mức cho phép mua nợ tối đa. |

#### Bảng `Orders` (Hóa đơn bán lẻ POS)
*Kế thừa `BaseTenantEntity`.*
| Cột | Kiểu | Null | Ràng Buộc | Ý Nghĩa |
|---|---|:---:|:---:|---|
| `OrderCode` | `varchar(50)` | ❌ | Unique/Tenant | Mã hóa đơn duy nhất (VD: `HD-20261012-0001`). |
| `BranchId` | `Guid` | ❌ | FK -> Branches | Chi nhánh bán hàng. |
| `CashierId` | `Guid` | ❌ | FK -> Employees | Thu ngân thực hiện giao dịch. |
| `ShiftId` | `Guid` | ✔️ | FK -> Shifts | Ca làm việc gắn với giao dịch. |
| `CustomerId` | `Guid` | ✔️ | FK -> Customers | Khách hàng (NULL nếu khách vãng lai). |
| `TotalAmount` | `decimal(18,2)` | ❌ | | Tổng tiền hàng trước chiết khấu. |
| `DiscountAmount` | `decimal(18,2)` | ❌ | Def: 0 | Tổng số tiền giảm giá/khuyến mãi/voucher. |
| `FinalAmount` | `decimal(18,2)` | ❌ | | Số tiền thực thu sau chiết khấu. |
| `PaymentMethod` | `varchar(50)` | ❌ | | Hình thức: `Cash`, `VietQR`, `Split`, `Debt`. |
| `PaymentStatus` | `varchar(50)` | ❌ | | Trạng thái: `Pending`, `Paid`, `Cancelled`, `Refunded`. |

#### Bảng `OrderItems` (Dòng chi tiết hóa đơn)
*Kế thừa `BaseTenantEntity`.*
| Cột | Kiểu | Null | Ràng Buộc | Ý Nghĩa |
|---|---|:---:|:---:|---|
| `OrderId` | `Guid` | ❌ | FK -> Orders | Hóa đơn mẹ. |
| `ProductId` | `Guid` | ❌ | FK -> Products | Sản phẩm bán. |
| `BatchId` | `Guid` | ✔️ | FK -> Batches | Lô hàng xuất bán (theo thuật toán FEFO). |
| `UnitName` | `nvarchar(50)` | ❌ | | Đơn vị bán (Lon, Thùng...). |
| `Quantity` | `decimal(18,3)` | ❌ | | Số lượng bán (theo đơn vị bán). |
| `BaseQuantity` | `decimal(18,3)` | ❌ | | Số lượng quy đổi chuẩn để trừ kho. |
| `UnitPrice` | `decimal(18,2)` | ❌ | | Đơn giá bán tại thời điểm giao dịch. |
| `CostPrice` | `decimal(18,2)` | ❌ | | Giá vốn tại thời điểm bán để tính lãi gộp. |
| `LineTotal` | `decimal(18,2)` | ❌ | | Thành tiền dòng sản phẩm. |

#### Bảng `PaymentTransactions` (Giao dịch thanh toán VietQR / Ngân hàng)
*Kế thừa `BaseTenantEntity`.*
| Cột | Kiểu | Null | Ràng Buộc | Ý Nghĩa |
|---|---|:---:|:---:|---|
| `OrderId` | `Guid` | ❌ | FK -> Orders | Hóa đơn thanh toán. |
| `TransactionReference` | `varchar(100)` | ❌ | Index | Mã giao dịch phía ngân hàng / VietQR. |
| `Amount` | `decimal(18,2)` | ❌ | | Số tiền giao dịch thực tế. |
| `BankAccountNumber` | `varchar(50)` | ❌ | | Số tài khoản thụ hưởng của cửa hàng. |
| `BankCode` | `varchar(50)` | ❌ | | Mã ngân hàng (VD: `MB`, `VCB`, `ICB`). |
| `WebhookPayload` | `nvarchar(max)`| ✔️ | | Toàn bộ nội dung JSON Webhook ngân hàng bắn về. |
| `ConfirmedAt` | `datetime2` | ✔️ | | Thời điểm nhận xác nhận tiền vào. |

---

### 3.4 Phân Hệ Mua Hàng & Nhà Cung Cấp (Purchasing & Supply Chain)

#### Bảng `Suppliers` (Nhà cung cấp)
*Kế thừa `BaseTenantEntity`.*
| Cột | Kiểu | Null | Ràng Buộc | Ý Nghĩa |
|---|---|:---:|:---:|---|
| `SupplierCode` | `varchar(50)` | ❌ | Unique/Tenant | Mã nhà cung cấp (VD: `NCC-UNILEVER`). |
| `SupplierName` | `nvarchar(200)` | ❌ | | Tên nhà cung cấp / Công ty phân phối. |
| `TaxNumber` | `varchar(50)` | ✔️ | | Mã số thuế NCC. |
| `PhoneNumber` | `varchar(20)` | ✔️ | | Điện thoại liên hệ đặt hàng. |
| `CurrentDebtAP` | `decimal(18,2)` | ❌ | Def: 0 | Công nợ hiện tại cửa hàng đang nợ NCC (Phải trả AP). |

#### Bảng `PurchaseOrders` (Đơn đặt mua hàng NCC)
*Kế thừa `BaseTenantEntity`.*
| Cột | Kiểu | Null | Ràng Buộc | Ý Nghĩa |
|---|---|:---:|:---:|---|
| `POCode` | `varchar(50)` | ❌ | Unique/Tenant | Mã đơn đặt hàng (VD: `PO-20261012-001`). |
| `SupplierId` | `Guid` | ❌ | FK -> Suppliers | Nhà cung cấp. |
| `BranchId` | `Guid` | ❌ | FK -> Branches | Chi nhánh dự kiến nhận hàng. |
| `Status` | `varchar(50)` | ❌ | Def: 'Draft' | Trạng thái: `Draft`, `Approved`, `PartialReceived`, `Completed`, `Cancelled`. |
| `TotalAmount` | `decimal(18,2)` | ❌ | | Tổng giá trị đơn đặt hàng. |

#### Bảng `GoodsReceipts` (Phiếu nhập kho thực tế)
*Kế thừa `BaseTenantEntity`.*
| Cột | Kiểu | Null | Ràng Buộc | Ý Nghĩa |
|---|---|:---:|:---:|---|
| `ReceiptCode` | `varchar(50)` | ❌ | Unique/Tenant | Mã phiếu nhập kho (VD: `PNK-20261012-001`). |
| `PurchaseOrderId` | `Guid` | ✔️ | FK -> POs | Đơn PO tương ứng (nếu nhập theo PO). |
| `BranchId` | `Guid` | ❌ | FK -> Branches | Chi nhánh nhập kho. |
| `ReceiverId` | `Guid` | ❌ | FK -> Employees | Nhân viên kho nhận và kiểm đếm hàng. |
| `FreightFee` | `decimal(18,2)` | ❌ | Def: 0 | Chi phí vận chuyển phát sinh (Landed cost). |
| `TotalAmount` | `decimal(18,2)` | ❌ | | Tổng tiền hàng thực nhập. |

---

### 3.5 Phân Hệ Vận Hành, Ca Kíp & Sổ Quỹ (Operations, Shifts & Cashbook)

#### Bảng `CashierShifts` (Ca làm việc & Kiểm soát két tiền)
*Kế thừa `BaseTenantEntity`.*
| Cột | Kiểu | Null | Ràng Buộc | Ý Nghĩa |
|---|---|:---:|:---:|---|
| `BranchId` | `Guid` | ❌ | FK -> Branches | Chi nhánh ca làm. |
| `CashierId` | `Guid` | ❌ | FK -> Employees | Thu ngân phụ trách ca. |
| `OpenedAt` | `datetime2` | ❌ | | Thời điểm mở ca. |
| `StartingCash` | `decimal(18,2)` | ❌ | | Số tiền mặt lẻ đầu ca có trong két. |
| `ClosedAt` | `datetime2` | ✔️ | | Thời điểm đóng ca kết sổ. |
| `ExpectedCash` | `decimal(18,2)` | ✔️ | | Tiền mặt lý thuyết theo hệ thống tính toán. |
| `ActualCash` | `decimal(18,2)` | ✔️ | | Tiền mặt thu ngân thực đếm khi kết ca. |
| `CashDifference` | `decimal(18,2)` | ✔️ | | Chênh lệch ca (`ActualCash - ExpectedCash`). |
| `ZReportSummary` | `nvarchar(max)`| ✔️ | | Dữ liệu tóm tắt doanh số ca (Z-Report). |

#### Bảng `Cashbooks` & `CashbookEntries` (Sổ quỹ & Bút toán thu chi)
*Kế thừa `BaseTenantEntity`.*
| Cột | Kiểu | Null | Ràng Buộc | Ý Nghĩa |
|---|---|:---:|:---:|---|
| `BranchId` | `Guid` | ❌ | FK -> Branches | Chi nhánh quản lý quỹ. |
| `AccountType` | `varchar(20)` | ❌ | Def: 'CASH' | Nguồn tiền: `CASH` (Tiền mặt két) / `BANK` (Tài khoản ngân hàng). |
| `EntryCode` | `varchar(50)` | ❌ | Unique/Tenant | Mã phiếu thu/chi (VD: `PT-001`, `PC-001`). |
| `EntryType` | `varchar(20)` | ❌ | | Loại phiếu: `RECEIPT` (Thu) / `PAYMENT` (Chi). |
| `Amount` | `decimal(18,2)` | ❌ | | Số tiền giao dịch quỹ. |
| `Category` | `varchar(50)` | ❌ | | Danh mục: `Sales`, `DebtCollection`, `SupplierPayment`, `ServiceExpense`, `Salary`. |
| `ReferenceCode` | `varchar(100)` | ✔️ | | Mã chứng từ liên kết (Mã hóa đơn, Mã phiếu chi...). |
| `CreatedByStaff` | `nvarchar(150)` | ✔️ | | Nhân viên lập phiếu thu/chi. |
| `Note` | `nvarchar(255)` | ✔️ | | Diễn giải nội dung thu/chi. |

#### Bảng `CashReconciliations` (Biên bản kiểm kê & đối soát quỹ tiền mặt)
*Kế thừa `BaseTenantEntity`.*
| Cột | Kiểu | Null | Ràng Buộc | Ý Nghĩa |
|---|---|:---:|:---:|---|
| `BranchId` | `Guid` | ❌ | FK -> Branches | Chi nhánh thực hiện kiểm kê quỹ. |
| `ReconciledAt` | `datetime2` | ❌ | | Thời điểm chốt kiểm đếm tiền mặt. |
| `SystemBalance` | `decimal(18,2)` | ❌ | | Số dư tiền mặt lý thuyết trên sổ quỹ. |
| `ActualCountedBalance` | `decimal(18,2)` | ❌ | | Số tiền mặt thực tế đếm được trong két an toàn. |
| `DifferenceAmount` | `decimal(18,2)` | ❌ | | Chênh lệch tiền mặt (`Actual - System`). |
| `Reason` | `nvarchar(255)` | ✔️ | | Lý do chênh lệch (thừa/thiếu tiền). |
| `CountedByStaff` | `nvarchar(150)` | ❌ | | Nhân viên kiểm đếm. |
| `ApprovedByManager` | `nvarchar(150)` | ✔️ | | Quản lý hoặc Chủ cửa hàng phê duyệt chốt sổ. |
| `Status` | `varchar(50)` | ❌ | Def: 'Approved' | Trạng thái biên bản kiểm kê quỹ. |

#### Bảng `ServiceExpenses` (Chi phí dịch vụ vận hành & Mua ngoài)
*Kế thừa `BaseTenantEntity`.*
| Cột | Kiểu | Null | Ràng Buộc | Ý Nghĩa |
|---|---|:---:|:---:|---|
| `BranchId` | `Guid` | ❌ | FK -> Branches | Chi nhánh phát sinh chi phí. |
| `Category` | `nvarchar(100)` | ❌ | | Loại chi phí: Tiền điện, Tiền nước, Thuê mặt bằng, Internet, Sửa chữa... |
| `Amount` | `decimal(18,2)` | ❌ | | Số tiền chi phí. |
| `Status` | `varchar(50)` | ❌ | Def: 'Pending' | Trạng thái: `Pending` (Chờ chi), `Paid` (Đã thanh toán), `Cancelled`. |
| `ExpenseDate` | `date` | ❌ | | Ngày phát sinh hóa đơn chi phí. |
| `DueDate` | `date` | ✔️ | | Hạn chót thanh toán để cảnh báo quá hạn. |
| `VendorName` | `nvarchar(200)` | ✔️ | | Đơn vị cung cấp dịch vụ / Người thụ hưởng. |
| `CashBookEntryId` | `Guid` | ✔️ | FK -> Cashbook | Bút toán phiếu chi tương ứng khi thanh toán xong. |
| `AttachedBillUrl` | `nvarchar(500)` | ✔️ | | Link ảnh chụp hóa đơn / biên lai đỏ đính kèm. |
| `Note` | `nvarchar(500)` | ✔️ | | Ghi chú chi tiết khoản chi. |

#### Bảng `TaxSnapshots` (Kỳ kê khai & Báo cáo thuế Hộ kinh doanh)
*Kế thừa `BaseTenantEntity`.*
| Cột | Kiểu | Null | Ràng Buộc | Ý Nghĩa |
|---|---|:---:|:---:|---|
| `TaxYear` | `int` | ❌ | Index | Năm tính thuế (VD: 2026). |
| `TaxQuarter` | `int` | ❌ | Index | Quý kê khai thuế (1, 2, 3, 4 theo Thông tư 40). |
| `TotalRevenue` | `decimal(18,2)` | ❌ | | Tổng doanh thu bán hàng chịu thuế trong kỳ. |
| `TaxRateVat` | `decimal(5,2)` | ❌ | Def: 1.00 | Tỷ lệ thuế GTGT ngành phân phối bán lẻ (1%). |
| `VatAmount` | `decimal(18,2)` | ❌ | | Số thuế GTGT phải nộp (`TotalRevenue * 1%`). |
| `TaxRatePit` | `decimal(5,2)` | ❌ | Def: 0.50 | Tỷ lệ thuế TNCN ngành phân phối bán lẻ (0.5%). |
| `PitPayable` | `decimal(18,2)` | ❌ | | Số thuế TNCN phải nộp (`TotalRevenue * 0.5%`). |
| `TaxMethod` | `varchar(50)` | ❌ | Def: 'RevenueRate' | Phương pháp tính thuế: Tỷ lệ trên doanh thu. |
| `Status` | `varchar(50)` | ❌ | Def: 'Draft' | Trạng thái tờ khai: `Draft`, `Finalized`, `Submitted`, `Paid`. |
| `GeneratedAt` | `datetime2` | ❌ | | Thời điểm chốt số liệu tờ khai thuế. |
- **2026-10-12**: Đồng bộ tự động qua `sep db-sync`. Quét 9 entities (Product, Category, CashbookTransaction, User, Role, Batch, StockOnHand, Order, OrderItem).
