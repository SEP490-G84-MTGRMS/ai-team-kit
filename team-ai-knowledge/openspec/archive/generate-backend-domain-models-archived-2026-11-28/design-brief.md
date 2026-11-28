# Design Brief: generate-backend-domain-models

## 1. Cấu trúc Mô hình & Phân tầng Thư mục

### 1.1 Tầng Domain (`MT_GRMS.Domain`)
```text
src/MT_GRMS.Domain/
├── Common/
│   ├── BaseEntity.cs                 # Base cho thực thể toàn cục (Id, CreatedAt, UpdatedAt, IsDeleted)
│   └── BaseTenantEntity.cs           # Kế thừa BaseEntity, bổ sung TenantId và CreatedBy
├── Enums/                            # Toàn bộ Enums trạng thái, loại hình, phương thức
└── Entities/
    ├── SaaS/                         # SubscriptionPlan, Tenant, Branch
    ├── Identity/                     # User, TenantUser
    ├── System/                       # TaxSnapshot, AuditLog
    ├── Catalog/                      # Category, Product, ProductUnit, ProductCombo
    ├── Inventory/                    # BranchStock, Transfer, TransferDetail
    ├── Supplier/                     # SupplierCategory, Supplier, SupplierDeliveryConfig,
    │                                 # SupplierBlackoutDate, SupplierAPLedger, SupplierProduct,
    │                                 # PurchaseOrder, PurchaseOrderDetail, GoodsReceipt, GoodsReceiptLine
    ├── Sales/                        # Customer, Promotion, Order, OrderDetail
    ├── Finance/                      # CashBook, ServiceExpense
    └── HR/                           # Employee, Payslip, EmployeeSchedule, EmployeeBonusViolation
```

### 1.2 Tầng Infrastructure (`MT_GRMS.Infrastructure`)
```text
src/MT_GRMS.Infrastructure/
└── Persistence/
    ├── AppDbContext.cs               # 34 DbSet, Global Query Filter cho BaseTenantEntity, Auto Audit
    └── Configurations/               # Fluent API mapping tách biệt theo từng phân hệ
        ├── SaaS/                     # SubscriptionPlanConfig, TenantConfig, BranchConfig
        ├── Identity/                 # UserConfig, TenantUserConfig
        ├── System/                   # TaxSnapshotConfig, AuditLogConfig
        ├── Catalog/                  # CategoryConfig, ProductConfig, ProductUnitConfig, ProductComboConfig
        ├── Inventory/                # BranchStockConfig, TransferConfig, TransferDetailConfig
        ├── Supplier/                 # SupplierConfig, PurchaseOrderConfig, GoodsReceiptConfig...
        ├── Sales/                    # CustomerConfig, PromotionConfig, OrderConfig, OrderDetailConfig
        ├── Finance/                  # CashBookConfig, ServiceExpenseConfig
        └── HR/                       # EmployeeConfig, PayslipConfig, EmployeeScheduleConfig, EmployeeBonusViolationConfig
```

---

## 2. Chi tiết 34 Thực thể thuộc 7 Phân hệ Nghiệp vụ

### Phân hệ 1: Multi-Tenancy, Gói cước, Xác thực & Kiểm toán (6 bảng)
1. `SubscriptionPlan`: Gói dịch vụ SaaS toàn cục (`PlanID`, `PlanCode`, `PlanName`, `PriceMonthly`, `PriceYearly`, `MaxBranches`, `MaxStaff`, `EnabledModulesJson`, `IsActive`, `CreatedAt`).
2. `Tenant`: Doanh nghiệp/chủ chuỗi thuê SaaS (`TenantID`, `Name`, `Subdomain`, `Code`, `TaxCode`, `Hotline`, `Address`, `City`, `Status`, `CurrentPlan`, `SubscriptionExpiresAt`, `GracePeriodExpiresAt`, `LockType`, `LockReason`, `LockedAt`, `LockedBy`, `CreatedAt`).
3. `User`: Tài khoản người dùng toàn hệ thống (`UserID`, `UserName`, `PasswordHash`, `FullName`, `Email`, `Phone`, `AvatarUrl`, `IsActive`, `IsEmailVerified`, `MustChangePassword`, `LastLoginAt`, `LastLoginIp`, `SecurityStamp`, `PasswordResetOtp`, `OtpExpiry`, `RefreshToken`, `RefreshTokenExpiryTime`, `AccessFailedCount`, `LockoutEnd`, `CreatedAt`).
4. `TenantUser`: Phân quyền người dùng theo Tenant (`TenantID`, `UserID`, `Role`, `IsActive`, `AssignedAt`) - Khóa chính phức hợp `(TenantID, UserID)`.
5. `TaxSnapshot`: Kê khai & quyết toán thuế định kỳ (`TaxID`, `TenantID`, `TaxYear`, `TaxQuarter`, `TotalRevenue`, `TaxRateVat`, `VatAmount`, `TaxRatePit`, `PitPayable`, `VatMethod`, `PitMethod`, `Status`, `SubmittedAt`, `PaidAt`, `GeneratedAt`, `IsLocked`, `CreatedAt`).
6. `AuditLog`: Nhật ký kiểm toán hệ thống (`LogID`, `TenantID`, `ActorID`, `ActorName`, `ActorRole`, `ActionType`, `TargetEntity`, `TargetID`, `OldValuesJson`, `NewValuesJson`, `IpAddress`, `UserAgent`, `CreatedAt`).

### Phân hệ 2: Danh mục, Hàng hóa & Định mức Combo (4 bảng)
7. `Category`: Cây danh mục ngành hàng đa cấp (`CategoryID`, `TenantID`, `ParentCategoryID`, `CategoryCode`, `Name`, `Description`, `DisplayOrder`).
8. `Product`: Mặt hàng sản phẩm (`ProductID`, `TenantID`, `CategoryID`, `ProductCode`, `Barcode`, `Name`, `BaseUnit`, `CostPrice`, `SellingPrice`, `MinStock`, `MaxStock`, `VatRate`, `ProductType`, `Status`, `ImageUrl`, `Description`, `InternalNote`, `HasBatches`, `IsFavorite`, `CreatedAt`, `UpdatedAt`).
9. `ProductUnit`: Đơn vị tính quy đổi (`UnitID`, `ProductID`, `UnitName`, `ConversionRate`, `Price`, `Barcode`, `IsBaseUnit`).
10. `ProductCombo`: Định mức Combo BOM (`ComboID`, `TenantID`, `ComboProductID`, `ComponentProductID`, `Quantity`, `Note`) - Unique Index `(TenantID, ComboProductID, ComponentProductID)`.

### Phân hệ 3: Chi nhánh, Tồn kho & Điều chuyển (4 bảng)
11. `Branch`: Chi nhánh/Cửa hàng bán lẻ (`BranchID`, `TenantID`, `BranchCode`, `Name`, `Address`, `Phone`, `Latitude`, `Longitude`, `CheckinRadiusMeters`, `IsActive`).
12. `BranchStock`: Tồn kho theo lô hạn FEFO (`Id`, `TenantId`, `BranchId`, `ProductId`, `SupplierId`, `BatchCode`, `ManufactureDate`, `ExpiryDate`, `QuantityOnHand`, `QuantityReserved`, `LandedCostPerUnit`, `ShelfLocation`, `ZoneArea`, `RowVersion`, `CreatedAtUtc`, `CreatedBy`, `UpdatedAtUtc`, `UpdatedBy`, `IsDeleted`).
13. `Transfer`: Phiếu điều chuyển kho 2 pha (`TransferID`, `TransferCode`, `FromBranchID`, `ToBranchID`, `Status`, `DispatchedAt`, `ReceivedAt`, `ExpectedDeliveryDate`, `CreatedByStaff`, `TotalAmount`, `Note`, `DiscrepancyNote`, `CancelReason`, `IsFavorite`, `CreatedAt`, `UpdatedAt`).
14. `TransferDetail`: Chi tiết mặt hàng điều chuyển (`TransferDetailID`, `TransferID`, `ProductId`, `SentQuantity`, `ReceivedQuantity`, `DamagedQuantity`, `PackagingUnit`, `BatchNumber`, `ExpiryDate`, `UnitPrice`, `Amount`, `DiscrepancyReason`, `Note`).

### Phân hệ 4: Nhà cung cấp, Mua hàng PO & Nhập kho GRN (10 bảng)
15. `SupplierCategory`: Nhóm ngành hàng nhà cung cấp (`Id`, `TenantId`, `Code`, `Name`, `Description`, `CreatedAtUtc`, `CreatedBy`, `UpdatedAtUtc`, `UpdatedBy`, `IsDeleted`).
16. `Supplier`: Hồ sơ nhà cung cấp (`Id`, `TenantId`, `Code`, `Name`, `SupplierType`, `Status`, `TaxCode`, `Phone`, `Email`, `Address`, `ContactPerson`, `CategoryId`, `PaymentTermDays`, `CreditLimit`, `CurrentDebt`, `LinkedCustomerId`, `BankName`, `BankAccountNo`, `BankAccountHolder`, `RowVersion`, `CreatedAtUtc`, `CreatedBy`, `UpdatedAtUtc`, `UpdatedBy`, `IsDeleted`).
17. `SupplierDeliveryConfig`: Cấu hình giao hàng NCC (`Id`, `TenantId`, `SupplierId`, `LeadTimeHours`, `CutoffTime`, `LockHour`, `DeliveryDaysMask`, `MinOrderValue`, `MinOrderQuantity`, `AllowUrgentDelivery`, `UrgentLeadTimeHours`, `UrgentSurchargePercent`, `CreatedAtUtc`, `CreatedBy`, `UpdatedAtUtc`, `UpdatedBy`, `IsDeleted`).
18. `SupplierBlackoutDate`: Lịch nghỉ giao hàng của NCC (`Id`, `TenantId`, `SupplierId`, `StartDate`, `EndDate`, `Reason`, `IsRecurringAnnual`, `CreatedAtUtc`, `CreatedBy`, `UpdatedAtUtc`, `UpdatedBy`, `IsDeleted`).
19. `SupplierAPLedger`: Sổ nợ phải trả NCC bất biến (`Id`, `TenantId`, `SupplierId`, `DocNo`, `DocType`, `Amount`, `Direction`, `BalanceAfter`, `SourceType`, `SourceId`, `IdempotencyKey`, `DueDate`, `AppliedToEntryId`, `OutstandingAmount`, `Status`, `Note`, `PostingDateUtc`, `CreatedAtUtc`, `CreatedBy`).
20. `SupplierProduct`: Chính sách giá sỉ & MOQ của NCC (`Id`, `TenantId`, `SupplierId`, `ProductId`, `SupplierProductCode`, `AgreedWholesalePrice`, `MinimumOrderQuantity`, `DeliveryUomId`, `ConversionRate`, `IsPrimarySupplier`, `Status`, `RowVersion`, `CreatedAtUtc`, `CreatedBy`, `UpdatedAtUtc`, `UpdatedBy`, `IsDeleted`).
21. `PurchaseOrder`: Đơn đặt hàng nhập kho (`Id`, `TenantId`, `Code`, `SupplierId`, `BranchId`, `DeliveryDate`, `ViewFromDate`, `ViewToDate`, `Status`, `OrderedAtUtc`, `TotalQty`, `TotalAmount`, `Note`, `ParentDraftId`, `DispatchedAtUtc`, `ConfirmedBySupplierAtUtc`, `CreatedByRole`, `SubmittedByUserId`, `SubmittedAtUtc`, `ApprovedByUserId`, `ApprovedAtUtc`, `RejectedByUserId`, `RejectedAtUtc`, `RejectionReason`, `RowVersion`, `CreatedAtUtc`, `CreatedBy`, `UpdatedAtUtc`, `UpdatedBy`, `IsDeleted`).
22. `PurchaseOrderDetail`: Chi tiết mặt hàng đặt mua PO (`Id`, `TenantId`, `PurchaseOrderId`, `ProductId`, `DeliveryDate`, `EmployeeQty`, `StoreQty`, `FinalQty`, `OrderedQty`, `ReceivedQty`, `UnitPrice`, `DeliveryUoM`, `LineAmount`, `RemainOption`, `IsClosed`, `CreatedAtUtc`, `CreatedBy`, `UpdatedAtUtc`, `UpdatedBy`, `IsDeleted`).
23. `GoodsReceipt`: Phiếu nhập kho GRN (`Id`, `TenantId`, `Code`, `PurchaseOrderId`, `SupplierId`, `BranchId`, `Status`, `ReceivedAtUtc`, `InvoiceNo`, `ReceiverUserId`, `ConfirmedByUserId`, `ConfirmedAtUtc`, `RejectedByUserId`, `RejectedAtUtc`, `RejectionReason`, `SubTotal`, `FreightFee`, `DiscountAmount`, `VatPercent`, `VatAmount`, `GrandTotal`, `PaymentMethod`, `PaymentDueDate`, `CreateApOnConfirm`, `AttachmentUrlsJson`, `Note`, `RowVersion`, `CreatedAtUtc`, `CreatedBy`, `UpdatedAtUtc`, `UpdatedBy`, `IsDeleted`).
24. `GoodsReceiptLine`: Chi tiết kiểm đếm hàng nhập kho (`Id`, `TenantId`, `GoodsReceiptId`, `ProductId`, `PurchaseOrderDetailId`, `OrderedQty`, `DeliveredQty`, `AcceptedQty`, `RejectedQty`, `UnitPrice`, `LineAmount`, `BatchCode`, `ManufactureDate`, `ExpiryDate`, `FreightAllocated`, `DiscountAllocated`, `VatAllocated`, `LandedUnitCost`, `RemainOption`, `QualityStatus`, `RejectionReason`, `BranchStockId`, `Note`, `CreatedAtUtc`, `CreatedBy`, `UpdatedAtUtc`, `UpdatedBy`, `IsDeleted`).

### Phân hệ 5: Khách hàng, Khuyến mãi & Bán lẻ POS (4 bảng)
25. `Customer`: Khách hàng thành viên & công nợ (`CustomerID`, `TenantID`, `CustomerCode`, `Name`, `Phone`, `Email`, `Address`, `MembershipTier`, `RewardPoints`, `TotalSpending`, `TotalDebt`, `DebtLimit`, `IsBlockedForDebt`, `AllowDebt`, `CreatedAt`).
26. `Promotion`: Chương trình khuyến mại (`PromotionID`, `TenantID`, `PromotionCode`, `PromotionName`, `Type`, `DiscountValue`, `StartDate`, `EndDate`, `IsActive`).
27. `Order`: Hóa đơn bán lẻ POS (`OrderID`, `BranchID`, `CustomerID`, `OrderCode`, `OrderDate`, `TotalAmount`, `DiscountAmount`, `FinalAmount`, `DepositAmount`, `PaymentMethod`, `PaymentStatus`, `Status`).
28. `OrderDetail`: Chi tiết dòng hàng hóa đơn (`OrderDetailID`, `OrderID`, `ProductID`, `PromotionID`, `LineNumber`, `Qty`, `UnitPrice`, `DiscountAmount`, `ActualPrice`, `IsGift`).

### Phân hệ 6: Tài chính, Sổ quỹ & Chi phí (2 bảng)
29. `CashBook`: Sổ quỹ tiền mặt & ngân hàng (`CashBookID`, `BranchID`, `TransactionCode`, `SourceDocType`, `SourceDocID`, `TransactionType`, `Amount`, `OpeningBalance`, `CurrentBalance`, `Description`, `CreatedAt`).
30. `ServiceExpense`: Chi phí vận hành cửa hàng (`ExpenseID`, `TenantID`, `BranchID`, `ExpenseCode`, `Category`, `Amount`, `ExpenseDate`, `DueDate`, `VendorName`, `Status`, `InvoiceNumber`, `Note`, `CreatedAt`).

### Phân hệ 7: Nhân sự, Ca kíp, Chấm công GPS & Lương thưởng (4 bảng)
31. `Employee`: Hồ sơ nhân sự (`EmployeeID`, `TenantID`, `BranchID`, `UserID`, `EmployeeCode`, `FullName`, `CitizenId`, `DateOfBirth`, `Gender`, `Phone`, `Email`, `AvatarUrl`, `JobTitle`, `SalaryType`, `BaseRate`, `BankAccountNumber`, `BankName`, `BankAccountHolder`, `LunchAllowance`, `TravelAllowance`, `DebtAmount`, `Status`, `CreatedAt`).
32. `Payslip`: Phiếu lương tháng nhân viên (`PayslipID`, `EmployeeID`, `PayslipCode`, `PeriodMonth`, `StandardDays`, `WorkedDays`, `OtHours`, `ContractBaseSalary`, `BaseSalaryEarned`, `OvertimePay`, `LunchAllowance`, `TravelAllowance`, `Bonus`, `TotalEarnings`, `AdvanceDeduction`, `SocialInsurance`, `ViolationDeduction`, `TotalDeductions`, `NetSalary`, `Status`, `PaidAt`, `PaymentMethod`, `CreatedAt`).
33. `EmployeeSchedule`: Lịch làm việc & chấm công GPS (`ScheduleID`, `EmployeeID`, `PayslipID`, `WorkDate`, `ShiftCode`, `ShiftName`, `PlannedStartTime`, `PlannedEndTime`, `DurationHours`, `AllowedCheckInStart`, `AllowedCheckInEnd`, `CheckInTime`, `CheckOutTime`, `CheckInLatitude`, `CheckInLongitude`, `IsGpsValid`, `LateMinutes`, `ActualWorkHours`, `Status`, `ApprovalType`, `ApprovalStatus`, `ApprovalReason`, `EvidenceImageUrl`, `ApprovedBy`, `ApprovedAt`).
34. `EmployeeBonusViolation`: Thưởng, phạt & tạm ứng lương (`BonusViolationID`, `TenantID`, `EmployeeID`, `PayslipID`, `Type`, `Amount`, `IncidentDate`, `Reason`, `EvidenceUrl`, `CreatedAt`).

---

## 3. Quy tắc Nghiệp vụ & Kỹ thuật Cốt lõi
1. **Multi-tenancy Isolation**: Mọi entity kế thừa `BaseTenantEntity` tự động được lọc qua Global Query Filter:
   ```csharp
   e => !e.IsDeleted && (_tenantContext == null || string.IsNullOrEmpty(_tenantContext.CurrentTenantId) || e.TenantId == _tenantContext.CurrentTenantId)
   ```
2. **Optimistic Concurrency Control**: Cột `RowVersion` kiểu `int` tại các bảng `BranchStocks`, `Suppliers`, `SupplierProducts`, `PurchaseOrders`, `GoodsReceipts` được cấu hình `.IsConcurrencyToken()` trong Fluent API.
3. **Decimal Precision**: Tất cả trường tiền tệ cấu hình rõ `HasColumnType("decimal(18,2)")`, các trường số lượng cấu hình `HasColumnType("decimal(18,3)")` hoặc `HasColumnType("decimal(12,2)")`.
4. **Delete Behavior**: Các ràng buộc khóa ngoại chính tuân thủ chặt chẽ hành vi DDL trong `MT_GRMS_Full_Database.sql` (`Cascade`, `Restrict`, hoặc `SetNull`).
