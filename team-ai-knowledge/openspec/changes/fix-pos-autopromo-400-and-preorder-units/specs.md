---
capability: pos-sales-order
change: fix-pos-autopromo-400-and-preorder-units
dependencies:
  - exploration.md
status: draft
---

# Delta Specification: pos-sales-order (fix-pos-autopromo-400-and-preorder-units)

## Capability Summary
Khắc phục lỗi `400 Bad Request` khi thẩm định khuyến mãi tự động tại POS với định danh chi nhánh/khách hàng dạng chuỗi; đồng bộ hiển thị trạng thái hiệu lực (`ACTIVE`, `UPCOMING`, `EXPIRED`, `PAUSED`) và danh sách chi nhánh thật trên phân hệ Quản lý khuyến mãi; đồng thời khôi phục đầy đủ danh sách Đơn vị tính quy đổi trên modal Tạo đơn đặt trước kèm cơ chế trừ giữ/hoàn trả tồn kho FEFO nhân đúng hệ số quy đổi (`ConversionRate`).

## Architecture Map
`PosCheckoutPage / PromotionListPage / PromotionModal / InvoiceManagementPage / CreatePreOrderModal (React TS)` → `PromotionsController / ProductsController / OrdersController (ASP.NET Core API)` → `PromotionService / CatalogService / OrderService (Application)` → `Promotions, Branches, Products, ProductUnits, Orders, OrderDetails, BranchStocks (EF Core / PostgreSQL)`.

---

## MODIFIED Requirements

### Requirement: REQ-FIX-PROMO-01 Tiếp nhận an toàn `BranchId` / `CustomerId` trên `evaluate-cart` và tự động áp Khuyến mãi tại POS
- Endpoint `POST /api/promotions/evaluate-cart` (`EvaluateCartRequest`) **MUST** tiếp nhận `BranchId` và `CustomerId` dưới dạng chuỗi tùy chọn (`string?`) mà **MUST NOT** ném lỗi `400 Bad Request` khi client gửi mã chi nhánh nội bộ (ví dụ `"BR-AN-01"`, `"BR-02"`) hoặc mã khách lẻ (`"kh_retail"`).
- Khi `BranchId` khác rỗng và khác `"ALL"`, `PromotionRepository.GetActivePromotionsAsync` **MUST** nạp đầy đủ các chương trình khuyến mãi thuộc `TenantId` hiện tại có `TargetBranches == "ALL"` hoặc khớp với `Id`, `BranchCode`, hoặc `Name` của chi nhánh tương ứng; đồng thời so sánh khoảng ngày hiệu lực `StartDate`..`EndDate` theo ngày lịch múi giờ Việt Nam (`UTC+7`).
- Màn hình `PosCheckoutPage` và `CreatePreOrderModal` **SHALL** tự động thẩm định và hiển thị ngay số tiền giảm / quà tặng khuyến mãi khi thêm hoặc thay đổi mặt hàng trong giỏ mà không yêu cầu thu ngân mở hộp thoại Chiết khấu toàn đơn nhập tay.

#### Scenario: Tái hiện lỗi giỏ hàng POS 420.000 đ tại chi nhánh mã chuỗi `BR-AN-01` được tự động giảm giá
**GIVEN** Cửa hàng `tenant_an_nhien_02` có chương trình `ORDER_DISCOUNT` đang trong hạn hiệu lực (Bậc 2: đơn từ `400.000 đ` giảm tối đa `60.000 đ`, `TargetBranches = "ALL"`) và quầy POS đang chọn chi nhánh có `id = "BR-AN-01"`, khách hàng `"kh_retail"`  
**WHEN** Thu ngân thêm sản phẩm tổng tiền `420.000 đ` vào giỏ hàng POS (gửi `POST /api/promotions/evaluate-cart` với `branchId = "BR-AN-01"`, `customerId = "kh_retail"`)  
**THEN** API trả về HTTP `200 OK` với `TotalDiscountAmount = 60000`, `FinalAmount = 360000`  
**AND** Cột Thanh toán POS tự động hiển thị `Giảm giá tự động [KM]: -60.000 đ` mà không cần mở modal nhập tay.

#### Scenario: Chương trình giới hạn theo chi nhánh cụ thể khớp theo UUID hoặc mã chi nhánh
**GIVEN** Chi nhánh Cầu Giấy có `Id = "cd5e8d1b-..."` và `BranchCode = "CN01"`, chương trình KM `P1` chỉ áp dụng cho `TargetBranches = "cd5e8d1b-..."`  
**WHEN** Gọi `EvaluateCartAsync` với `BranchId = "CN01"` (hoặc `"cd5e8d1b-..."`) so với chi nhánh khác `"CN02"`  
**THEN** Giỏ hàng tại `"CN01"` được hưởng khuyến mãi `P1`, còn giỏ hàng tại `"CN02"` không được áp dụng `P1`.

---

### Requirement: REQ-FIX-PROMO-02 Đồng bộ trạng thái hiệu lực theo ngày (`UPCOMING` / `EXPIRED`) và danh sách Chi nhánh thật trên Quản lý Khuyến mãi
- Màn hình `PromotionListPage` khi ánh xạ dữ liệu từ API **MUST** xác định trạng thái hiển thị theo thứ tự ưu tiên: nếu `isActive == false` là `PAUSED` (*Tạm dừng*); ngược lại đối chiếu ngày hiện tại (`YYYY-MM-DD` theo giờ địa phương) với `startDate` và `endDate`: nếu `today < startDate` là `UPCOMING` (*Sắp diễn ra*), nếu `today > endDate` là `EXPIRED` (*Đã kết thúc*), trong khoảng `[startDate, endDate]` là `ACTIVE` (*Đang chạy*).
- Khi lưu mới hoặc cập nhật chương trình khuyến mãi từ `PromotionModal`, ngày bắt đầu và ngày kết thúc **MUST** giữ đúng ngày lịch người dùng đã chọn mà không bị lùi ngày do lệch múi giờ UTC.
- `PromotionModal` và `PromotionFilterBar` **SHALL** hiển thị danh sách chi nhánh thực tế của cửa hàng (nạp từ API chi nhánh của Tenant hiện tại, kèm tùy chọn `Toàn hệ thống`), thay thế danh sách mẫu cứng `MOCK_BRANCHES`.

#### Scenario: Chương trình có ngày bắt đầu trong tương lai hiển thị đúng nhãn Sắp diễn ra
**GIVEN** Ngày hệ thống hiện tại là `2026-11-09` và chương trình `KM-202611-950` có `isActive = true`, `startDate = 2026-11-12`, `endDate = 2026-12-30`  
**WHEN** Chủ cửa hàng mở màn hình Quản lý khuyến mãi  
**THEN** Chương trình `KM-202611-950` hiển thị trạng thái `UPCOMING` (`● Sắp diễn ra`) và lọc đúng khi chọn bộ lọc trạng thái `Sắp diễn ra`.

---

### Requirement: REQ-FIX-PREUNIT-01 Cung cấp đầy đủ danh sách Đơn vị tính quy đổi (`UnitPrices`) cho Tạo đơn đặt trước
- API danh sách sản phẩm `GET /api/products` (`ProductResponse` / `CatalogService.GetProductsPagedAsync`) **MUST** trả kèm danh sách đơn vị tính khả dụng (`UnitPrices` gồm đơn vị cơ sở `BaseUnit` với `ConversionRate = 1` và các `ProductUnits` chưa xóa mềm của sản phẩm).
- Hàm `posOrderApi.getAllProducts` (ở cả nhánh `/branches/{branchId}/products` lẫn nhánh fallback `/products`) **MUST** ánh xạ đầy đủ mảng `unitPrices` về cho Frontend; đồng thời `InvoiceManagementPage` **SHALL** ưu tiên truyền UUID chi nhánh thực tế (từ bộ lọc hoặc `dbBranches[0]`) khi tải danh mục sản phẩm cho modal `CreatePreOrderModal` và `ReturnExchangeModal`.

#### Scenario: Mở `+ Tạo đơn đặt trước` khi đang lọc Tất cả chi nhánh vẫn chọn được Đơn vị Thùng / Lốc
**GIVEN** Chủ cửa hàng đang ở màn hình Quản lý đơn hàng với bộ lọc `Tất cả chi nhánh (ALL)` và sản phẩm `Bánh Choco-Pie` có đơn vị cơ sở `Hộp` (`55.000 đ`, `x1`) và đơn vị quy đổi `Thùng` (`420.000 đ`, `x8`)  
**WHEN** Bấm `+ Tạo đơn đặt trước` và chọn sản phẩm `Bánh Choco-Pie`  
**THEN** Cột **Đơn vị** hiển thị ô `<select>` chứa cả `Hộp` và `Thùng (x8)`; khi đổi sang `Thùng (x8)`, đơn giá tự động cập nhật thành `420.000 đ` và tự động kích hoạt thẩm định khuyến mãi theo thành tiền mới.

---

### Requirement: REQ-FIX-PREUNIT-02 Giữ kho, lưu vết Đơn vị tính và hoàn kho theo hệ số quy đổi (`ConversionRate`) trên Đơn đặt trước & Đơn POS
- Bảng `OrderDetails` **MUST** lưu trữ `ProductUnitId` (`Guid?`), `UnitName` (`string?`) và `ConversionRate` (`decimal`, mặc định `1.00`) cho từng dòng chi tiết đơn hàng.
- Khi tạo Đơn đặt trước (`OrderService.CreatePreOrderAsync`), đối với mặt hàng có truyền `UnitId` (hoặc `UnitName` khớp `ProductUnits`), hệ thống **MUST** xác định `ConversionRate` (`>= 1`), phân giải đơn giá theo `UnitPriceOverride` chi nhánh / `ProductUnit.Price` (nếu client không truyền giá ghi đè hợp lệ), kiểm tra và trừ giữ tồn kho lô FEFO theo số lượng cơ sở `Quantity × ConversionRate`, đồng thời lưu `ProductUnitId`, `UnitName`, `ConversionRate` vào `OrderDetail`.
- Khi hủy đơn hàng (`CancelOrderAsync`) hoặc trả hàng nhập lại kho (`ProcessReturnExchangeAsync` với `Condition == "Restock"`), hệ thống **MUST** cộng hoàn vào `BranchStock` đúng lượng đơn vị cơ sở tương ứng `Qty × ConversionRate`.

#### Scenario: Tạo và hủy Đơn đặt trước đặt theo đơn vị Thùng (hệ số quy đổi x12)
**GIVEN** Sản phẩm `Sữa tươi` có tồn kho chi nhánh `30 Chai` (`BaseUnit = "Chai"`, giá `39.000 đ`) và đơn vị quy đổi `Thùng` (`ConversionRate = 12`, giá `450.000 đ`)  
**WHEN** Thu ngân tạo Đơn đặt trước đặt `2 Thùng` (`Quantity = 2`, `UnitId` của `Thùng`, `DepositAmount = 90.000 đ`)  
**THEN** Hệ thống trừ giữ `2 × 12 = 24 Chai` trong `BranchStock` (tồn kho còn `6 Chai`), lưu `OrderDetail` với `Qty = 2`, `UnitName = "Thùng"`, `ConversionRate = 12`, `TotalAmount = 900.000 đ`  
**AND** Khi Chủ cửa hàng hủy Đơn đặt trước này, tồn kho `BranchStock` được cộng hoàn đủ `24 Chai` (về lại `30 Chai`).

#### Scenario: Đặt trước vượt quá số Thùng quy đổi từ tồn kho cơ sở bị từ chối
**GIVEN** Kho chi nhánh chỉ còn `10 Chai` Sữa tươi và đơn vị `Thùng` có `ConversionRate = 12`  
**WHEN** Gọi `CreatePreOrderAsync` đặt `1 Thùng` (`Quantity = 1`, cần `12 Chai`)  
**THEN** Hệ thống từ chối tạo đơn với thông báo không đủ tồn kho để đặt trước (`Hiện còn: 10, Cần đặt: 12`).

---

## Acceptance Checklist
- [ ] `POST /api/promotions/evaluate-cart` nhận `branchId = "BR-AN-01"` và `customerId = "kh_retail"` trả `200 OK`, tự động tính giảm giá ngay trên cột Thanh toán POS.
- [ ] `PromotionListPage` hiển thị chính xác 4 trạng thái `ACTIVE`, `UPCOMING`, `EXPIRED`, `PAUSED` theo ngày hiệu lực; `PromotionModal` & `PromotionFilterBar` hiển thị chi nhánh thật của cửa hàng.
- [ ] `GET /api/products` và `posOrderApi.getAllProducts` trả đầy đủ `unitPrices`; modal `+ Tạo đơn đặt trước` cho phép chọn mọi đơn vị quy đổi của sản phẩm.
- [ ] `CreatePreOrderAsync`, `CreateOrderAsync`, `CancelOrderAsync`, `ProcessReturnExchangeAsync` lưu đúng `UnitName`/`ConversionRate` trên `OrderDetails` và trừ/hoàn tồn kho FEFO đúng `Qty × ConversionRate`.
