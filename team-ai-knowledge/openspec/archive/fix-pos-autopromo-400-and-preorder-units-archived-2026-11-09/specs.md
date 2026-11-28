---
capability: pos-sales-order
change: fix-pos-autopromo-400-and-preorder-units
dependencies:
  - exploration.md
status: verified
---

# Delta Specification: pos-sales-order (fix-pos-autopromo-400-and-preorder-units)

## Capability Summary
Khắc phục triệt để lỗi `400 Bad Request` khi thẩm định khuyến mãi tự động và chốt đơn POS / Đơn đặt trước với định danh chi nhánh, khách hàng, sản phẩm dạng chuỗi; đồng bộ hiển thị trạng thái hiệu lực (`ACTIVE`, `UPCOMING`, `EXPIRED`, `PAUSED`), cờ `isActive` và danh sách chi nhánh thật trên phân hệ Quản lý khuyến mãi; khôi phục đầy đủ danh sách Đơn vị tính quy đổi (`UnitPrices`) trên modal Tạo đơn đặt trước kèm cơ chế tách 2 bước trừ giữ/hoàn trả tồn kho FEFO nhân đúng hệ số quy đổi (`ConversionRate`) trong giao dịch nguyên tử.

## Architecture Map
`PosCheckoutPage / PromotionListPage / PromotionModal / PromotionTable / InvoiceManagementPage / CreatePreOrderModal / ReturnExchangeModal (React TS)` → `PromotionsController / VouchersController / ProductsController / OrdersController (ASP.NET Core API)` → `PromotionService / VoucherService / CatalogService / OrderService (Application)` → `Promotions, Branches, Products, ProductUnits, Orders, OrderDetails, BranchStocks (EF Core / PostgreSQL)`.

---

## MODIFIED Requirements

### Requirement: REQ-FIX-PROMO-01 Tiếp nhận an toàn định danh chuỗi trên `evaluate-cart` / đặt đơn và tự động áp Khuyến mãi quy đổi ĐVT tại POS
- Endpoint `POST /api/promotions/evaluate-cart` (`EvaluateCartRequest`) dùng một constructor duy nhất nhận `string? BranchId = null`, `string? CustomerId = null`; `CartItemDto` nhận `string ProductId` và `decimal ConversionRate = 1m`; `ValidateVoucherRequest` nhận `string? CustomerId = null`. Các DTO này **MUST NOT** ném lỗi `400 Bad Request` khi client gửi mã chi nhánh nội bộ (`"BR-AN-01"`, `"BR-02"`), mã khách lẻ (`"kh_retail"`) hoặc mã sản phẩm mẫu không phải UUID; đồng thời giới hạn độ dài chuỗi đầu vào (`<= 100` ký tự) và `SubTotal >= 0`.
- Khi thẩm định điều kiện `PRODUCT_DISCOUNT` và `BUY_X_GET_Y`, `PromotionService` **MUST** cộng gộp tổng số lượng đơn vị cơ sở `Sum(Quantity × max(1, ConversionRate))` của mọi dòng cùng `ProductId` trong giỏ để khách mua theo đơn vị quy đổi (`Thùng`, `Lốc`) hoặc tách nhiều dòng ĐVT vẫn được tính đúng ngưỡng khuyến mãi.
- Khi `BranchId` khác rỗng và khác `"ALL"`, `PromotionRepository.GetActivePromotionsAsync` **MUST** kiểm tra `CurrentTenantId` khác rỗng, truy vấn bảng `Branches` lọc tường minh `b.TenantId == currentTenantId && !b.IsDeleted` để thu tập định danh hợp lệ (`Id`, `BranchCode`, `Name`), và đối khớp chính xác theo phần tử mảng `TargetBranches.Split(',', ';')` (hoặc `"ALL"`), **MUST NOT** dùng `.Contains()` gây khớp nhầm chuỗi con; mốc ngày `StartDate`..`EndDate` so sánh theo ngày lịch Việt Nam (`UTC+7`).
- Màn hình `PosCheckoutPage` và `CreatePreOrderModal` **SHALL** nạp danh sách chi nhánh thật của Tenant (`employeeApi.getBranches()`), tự động gửi kèm `conversionRate` của từng dòng lên `evaluate-cart` và hiển thị ngay số tiền giảm / quà tặng mà không cần nhập tay vào modal chiết khấu; đồng thời `CreateOrderAsync` và `CreatePreOrderAsync` hỗ trợ phân giải mã chi nhánh / khách lẻ chuỗi sang bản ghi thực của Tenant để chốt đơn không lỗi `400`.

#### Scenario: Giỏ hàng POS 420.000 đ tại chi nhánh mã chuỗi `BR-AN-01` được tự động giảm giá và thanh toán thành công
**GIVEN** Cửa hàng `tenant_an_nhien_02` có chương trình `ORDER_DISCOUNT` đang trong hạn hiệu lực (Bậc 2: đơn từ `400.000 đ` giảm tối đa `60.000 đ`, `TargetBranches = "ALL"`) và quầy POS đang chọn chi nhánh có `id = "BR-AN-01"` (hoặc UUID chi nhánh của Tenant), khách hàng `"kh_retail"`  
**WHEN** Thu ngân thêm sản phẩm tổng tiền `420.000 đ` vào giỏ hàng POS (`POST /api/promotions/evaluate-cart` với `branchId = "BR-AN-01"`, `customerId = "kh_retail"`)  
**THEN** API trả về HTTP `200 OK` với `TotalDiscountAmount = 60000`, `FinalAmount = 360000` và cột Thanh toán POS tự động hiển thị `Giảm giá tự động [KM]: -60.000 đ`.

#### Scenario: Đối khớp chính xác mã chi nhánh token tránh khớp nhầm chuỗi con và tính đúng BOGO theo đơn vị Thùng
**GIVEN** Chi nhánh `CN1` có `BranchCode = "BR-AN-01"`, chi nhánh `CN10` có `BranchCode = "BR-AN-010"`, CTKM `P1` có `TargetBranches = "BR-AN-010"`, và CTKM `P2` (`TargetBranches = "ALL"`) quy định mua `6 Hộp` tặng `1 Hộp`  
**WHEN** Giỏ hàng tại `"BR-AN-01"` mua `1 Thùng` (`ConversionRate = 8`, tương đương `8 Hộp`)  
**THEN** Giỏ hàng **không** khớp nhầm `P1` của `"BR-AN-010"`, nhưng đạt điều kiện `P2` (`8 >= 6`) và nhận đủ `1 Hộp` quà tặng.

---

### Requirement: REQ-FIX-PROMO-02 Đồng bộ trạng thái hiệu lực (`EXPIRED` / `PAUSED` / `UPCOMING` / `ACTIVE`), bảo toàn `isActive` và nạp Chi nhánh thật trên Quản lý Khuyến mãi
- Cả Backend (`PromotionRepository.GetPagedListAsync`) và Frontend (`PromotionListPage.tsx`) **MUST** thống nhất thứ tự ưu tiên xác định trạng thái theo ngày lịch Việt Nam (`UTC+7` / `YYYY-MM-DD` local):
  1. `today > endDate` → `EXPIRED` (*Đã kết thúc*)
  2. `isActive == false` → `PAUSED` (*Tạm dừng*)
  3. `today < startDate` → `UPCOMING` (*Sắp diễn ra*)
  4. `isActive == true` và `startDate <= today <= endDate` → `ACTIVE` (*Đang chạy*)
- Đối tượng `PromotionItem` trên Frontend **MUST** lưu độc lập trường `isActive: boolean` tách khỏi `status` hiển thị: khi mở Sửa và bấm Lưu một chương trình `UPCOMING` (`isActive == true`), hệ thống **MUST** giữ nguyên `isActive = true` (không bị ghi đè thành `PAUSED`); nút gạt Toggle trên `PromotionTable` dựa vào `item.isActive`; khi API lưu trả lỗi, `PromotionListPage` **MUST** hiển thị thông báo lỗi thay vì báo lưu thành công giả.
- Khi tạo/sửa khuyến mãi trên `PromotionModal`, chuỗi ngày `YYYY-MM-DD` được giữ nguyên theo giờ địa phương (không dùng `toISOString()` làm lùi ngày UTC). `PromotionListPage`, `PromotionModal`, `PromotionFilterBar` và `PromotionTable` **SHALL** nạp danh sách chi nhánh thật của Tenant hiện tại (tách mảng `targetBranches.split(',')` và ánh xạ UUID sang tên chi nhánh hiển thị thay vì `MOCK_BRANCHES` hay UUID thô).

#### Scenario: Chương trình có ngày bắt đầu tương lai hiển thị `Sắp diễn ra` và không bị tắt nhầm khi chỉnh sửa
**GIVEN** Ngày hệ thống là `2026-11-09` và chương trình `KM-202611-950` có `isActive = true`, `startDate = 2026-11-12`, `endDate = 2026-12-30`  
**WHEN** Chủ cửa hàng mở Quản lý khuyến mãi, sửa tên chương trình rồi bấm Lưu  
**THEN** Chương trình hiển thị nhãn `UPCOMING` (`● Sắp diễn ra`), nút kích hoạt vẫn ở trạng thái bật (`isActive = true`), và sau khi lưu vẫn giữ nguyên `isActive = true` (không bị đổi sang `Tạm dừng`).

---

### Requirement: REQ-FIX-PREUNIT-01 Cung cấp đầy đủ danh sách Đơn vị quy đổi (`UnitPrices`) và chi nhánh thực cho Tạo đơn đặt trước
- API `GET /api/products` (`ProductRepository.GetPagedListAsync`, `GetByIdWithCategoryAsync` kèm `.Include(p => p.Units)` và `CatalogService.MapToResponse`) **MUST** trả kèm mảng `UnitPrices` gồm đơn vị cơ sở (`BaseUnit`, `ConversionRate = 1`) và các `ProductUnits` chưa xóa mềm có `ConversionRate > 0`.
- Hàm `getAllProducts` trong `src/features/pos/api/posOrderApi.ts` (cả nhánh `/branches/{branchId}/products` lẫn fallback `/products` với `pageSize` đủ lớn) **MUST** ánh xạ đầy đủ `unitPrices` và giữ đúng `quantityOnHand` thực tế (`p.quantityOnHand ?? 0`, **MUST NOT** gán khống tồn kho `100` khi dữ liệu trả về `0`).
- `InvoiceManagementPage.tsx` **MUST** đưa `dbBranches` vào dependency tải sản phẩm, ưu tiên truyền UUID chi nhánh thực của Tenant hiện tại (`branchFilter` hợp lệ hoặc `dbBranches[0]?.id`, xóa bỏ hoàn toàn UUID cứng chéo Tenant) cho cả tải danh mục, `CreatePreOrderModal`, `ReturnExchangeModal` và `handleConfirmCreatePreOrder`; nếu API tạo đơn đặt trước trả lỗi (như thiếu tồn kho), UI **MUST** hiển thị thông báo lỗi rõ ràng và **MUST NOT** tự sinh đơn `PO` giả trong state.

#### Scenario: Mở `+ Tạo đơn đặt trước` khi đang lọc Tất cả chi nhánh vẫn chọn được Đơn vị Thùng / Lốc và cập nhật giá + KM
**GIVEN** Chủ cửa hàng đang ở Quản lý đơn hàng với bộ lọc `Tất cả chi nhánh (ALL)` và sản phẩm `Bánh Choco-Pie` có `Hộp` (`55.000 đ`, `x1`) và `Thùng` (`420.000 đ`, `x8`)  
**WHEN** Bấm `+ Tạo đơn đặt trước` và chọn `Bánh Choco-Pie`  
**THEN** Cột **Đơn vị** hiển thị `<select>` chứa cả `Hộp` và `Thùng (x8)`; khi đổi sang `Thùng (x8)`, đơn giá tự động cập nhật `420.000 đ` và tự động thẩm định khuyến mãi theo thành tiền mới.

---

### Requirement: REQ-FIX-PREUNIT-02 Lưu vết Đơn vị tính và giữ/xuất/hoàn kho FEFO 2 bước theo `ConversionRate` trên Đơn đặt trước & Đơn POS
- Bảng `OrderDetails` **MUST** bổ sung `ProductUnitId` (cột `"ProductUnitID" uuid NULL`), `UnitName` (`"UnitName" character varying(50) NULL`) và `ConversionRate` (`"ConversionRate" numeric(18,4) NOT NULL DEFAULT 1.00`), đồng bộ chính xác tên cột giữa `OrderDetailConfiguration`, EF Core Migration và khối `ALTER TABLE "OrderDetails" ADD COLUMN IF NOT EXISTS` (bọc trong `context.Database.IsNpgsql()`) tại `DbInitializer.cs`.
- `OrderService.CreatePreOrderAsync` (cũng như `CreateOrderAsync` và chiều hàng đổi mới `NewItems` của `ProcessReturnExchangeAsync`) **MUST** chặn `Quantity <= 0` hoặc `ConversionRate <= 0`, bọc toàn bộ thao tác kho + đơn hàng + ngân sách KM trong giao dịch `_unitOfWork.ExecuteInTransactionAsync`, và thực thi tách biệt **2 bước**:
  1. **Bước giữ/trừ kho FEFO**: Cộng dồn tổng lượng cơ sở `Sum(item.Quantity × ConversionRate)` của mọi dòng không phải quà tặng theo từng `ProductId` (kiểm tra đồng nhất trên cả `CreatePreOrderModal` khi giỏ có nhiều dòng cùng `ProductId` khác ĐVT), đối chiếu `totalOnHand` và trừ lần lượt qua các lô `BranchStocks` theo FEFO; với dòng quà tặng `IsGift`, phân giải `ConversionRate` theo `UnitId` hoặc `UnitName` để trừ đúng `actualGiftQty × ConversionRate`.
  2. **Bước tạo `OrderDetail`**: Duyệt độc lập từng dòng yêu cầu để lưu 1 dòng `OrderDetail` với `Qty = item.Quantity` (theo ĐVT đặt, không nhân `deduct` từng lô vào thành tiền), `CostPriceAtSale = (prod.CostPrice ?? 0m) × ConversionRate`, `ProductUnitId`, `UnitName`, `ConversionRate`, kèm gán `Order.CreatedBy`; `MapToOrderResponse` trả về `UnitName` đã lưu (fallback `Product.BaseUnit`).
- `FulfillPreOrderAsync` chống gọi trùng khi đơn đã `Completed`/`Cancelled` và không trừ kho lần 2. Khi hủy đơn (`CancelOrderAsync`, lấy role từ JWT Claims) hoặc trả hàng nhập kho (`ProcessReturnExchangeAsync` với `Condition == "Restock"`), hệ thống **MUST** cộng hoàn vào `BranchStock` đúng `Qty × ConversionRate` trong giao dịch; Tab `Đơn Đặt Trước` trên `InvoiceManagementPage.tsx` hiển thị tóm tắt mặt hàng kèm `UnitName` và nút `Hủy đơn` để hoàn kho cho đơn `PendingPickup`.

#### Scenario: Đặt trước `2 Thùng` tách qua 2 lô FEFO hoặc đặt chung `1 Thùng + 2 Chai` cùng sản phẩm rồi Hủy đơn
**GIVEN** Sản phẩm `Sữa tươi` (`BaseUnit = "Chai"`, giá `39.000 đ`) có Lô 1 = `10 Chai`, Lô 2 = `20 Chai` (tổng `30 Chai`), và ĐVT `Thùng` (`ConversionRate = 12`, giá `450.000 đ`)  
**WHEN** Tạo Đơn đặt trước `2 Thùng` (`Quantity = 2`, cần `24 Chai`)  
**THEN** Lô 1 còn `0 Chai`, Lô 2 còn `6 Chai` (tổng còn `6 Chai`), bảng `OrderDetails` lưu **1 dòng** `Qty = 2`, `UnitName = "Thùng"`, `ConversionRate = 12`, `TotalAmount = 900.000 đ` (không bị nhân lên `24 × 450.000 đ`)  
**AND** Khi bấm Hủy Đơn đặt trước này, `BranchStock` được cộng hoàn đúng `2 × 12 = 24 Chai` (về đủ `30 Chai`).

#### Scenario: Đặt trước vượt quá tổng lượng cơ sở quy đổi bị từ chối và không sinh đơn giả
**GIVEN** Kho chi nhánh chỉ còn `15 Chai` Sữa tươi và giỏ đặt trước có dòng 1: `1 Thùng` (`12 Chai`) + dòng 2: `5 Chai` (tổng cần `17 Chai > 15 Chai`)  
**WHEN** Gửi yêu cầu tạo Đơn đặt trước  
**THEN** Hệ thống từ chối với lỗi không đủ tồn kho (`Hiện còn: 15, Cần đặt: 17`) và giao diện hiển thị thông báo lỗi mà không tạo đơn `PO` giả.

---

## Acceptance Checklist
- [ ] `POST /api/promotions/evaluate-cart` nhận `branchId = "BR-AN-01"`, `customerId = "kh_retail"`, `conversionRate` trả `200 OK`; tự động áp giảm giá / BOGO theo ĐVT quy đổi và chốt đơn POS không lỗi `400`.
- [ ] `PromotionListPage`, `PromotionModal`, `PromotionFilterBar`, `PromotionTable` và `PromotionRepository` đồng bộ 4 trạng thái `EXPIRED` / `PAUSED` / `UPCOMING` / `ACTIVE` theo `UTC+7`, bảo toàn `isActive` khi sửa CTKM `UPCOMING`, và hiển thị chi nhánh thật của Tenant.
- [ ] `GET /api/products` và `src/features/pos/api/posOrderApi.ts` trả đầy đủ `unitPrices` với tồn kho thật; `InvoiceManagementPage` dùng UUID chi nhánh thực của Tenant và không nuốt lỗi tạo đơn `PO` giả.
- [ ] `CreatePreOrderAsync`, `CreateOrderAsync`, `CancelOrderAsync`, `ProcessReturnExchangeAsync` tách 2 bước trừ/hoàn tồn kho FEFO nhân đúng `ConversionRate` trong transaction, lưu `ProductUnitID`/`UnitName`/`ConversionRate` (migration + `DbInitializer` bọc `IsNpgsql()`), và Tab Đơn đặt trước hiển thị ĐVT + nút Hủy đơn.
