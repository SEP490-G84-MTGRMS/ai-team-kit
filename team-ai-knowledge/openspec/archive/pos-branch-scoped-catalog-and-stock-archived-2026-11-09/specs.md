---
capability: pos-sales-order
change: pos-branch-scoped-catalog-and-stock
dependencies:
  - exploration.md
status: draft
---

# Delta Specification: pos-sales-order (pos-branch-scoped-catalog-and-stock)

## Capability Summary
POS bán hàng, đặt trước và đổi/trả chỉ làm việc trên danh mục `BranchProducts` Active của đúng chi nhánh; giá theo quy tắc chi nhánh → giá chung; tồn kho hiển thị và bị trừ lấy từ `BranchStocks` của chi nhánh đó theo FEFO.

## Architecture Map
`PosCheckoutPage / InvoiceManagementPage / CreatePreOrderModal / ReturnExchangeModal (React TS)` → `posOrderApi.getAllProducts` → `GET /api/branches/{branchId}/products` (`BranchProductRepository`: `BranchProducts` + `BranchStocks`) ; `POST /api/orders`, `POST /api/orders/pre-order`, `POST /api/orders/{id}/return-exchange` → `OrderService` → `OrderRepository.GetBranchProductsByProductIdsAsync` / `GetBranchStocksForProductFefoAsync` → `BranchProducts`, `BranchStocks`.

---

## MODIFIED Requirements

### Requirement: REQ-BRANCH-SCOPE-01 Frontend chỉ nạp danh mục bán hàng của chi nhánh đã chọn
- `posOrderApi.getAllProducts(branchId)` **MUST** chỉ gọi `GET /branches/{branchId}/products` (`Status=Active`) và **MUST NOT** rơi sang `GET /products` khi đã có `branchId`. Khi API lỗi, hàm **MUST** ném lỗi cho nơi gọi; khi trả rỗng, trả mảng rỗng.
- `PosCheckoutPage` và `InvoiceManagementPage` **MUST NOT** thay danh mục bằng dữ liệu mock (`getInitialProducts`, `mockProducts`) khi đã xác định được chi nhánh; **SHALL** hiển thị trạng thái rỗng “Chi nhánh chưa được gán sản phẩm” hoặc thông báo lỗi thật.
- Chi nhánh làm việc **MUST** là chi nhánh thật của người dùng (`user.branchId`) hoặc chi nhánh chủ cửa hàng chọn rõ; **MUST NOT** tự dùng `summaries[0]` / `dbBranches[0]` khi không khớp. Khi đang lọc “Tất cả chi nhánh”, các thao tác bán, tạo đơn đặt trước, đổi/trả **SHALL** yêu cầu chọn 1 chi nhánh cụ thể trước.
- `quantityOnHand` hiển thị **MUST** là `currentStock` (tổng `BranchStocks` của chi nhánh), không dùng tồn mặc định.

#### Scenario: Chi nhánh chưa gán sản phẩm không hiện danh mục chung
**GIVEN** Chi nhánh A không có `BranchProducts` Active nào, Tenant có 10 sản phẩm chung  
**WHEN** Thu ngân chi nhánh A mở POS  
**THEN** Danh sách sản phẩm rỗng kèm thông báo “Chi nhánh chưa được gán sản phẩm”; `GET /products` không được gọi.

#### Scenario: API danh mục chi nhánh lỗi thì báo lỗi, không dùng dữ liệu mock
**GIVEN** `/branches/{A}/products` trả lỗi 500  
**WHEN** POS tải danh mục  
**THEN** Hiển thị lỗi tải danh mục, không hiện danh mục chung hay sản phẩm mock.

#### Scenario: Lọc “Tất cả chi nhánh” phải chọn chi nhánh trước khi tạo đơn đặt trước
**GIVEN** Chủ cửa hàng ở Quản lý đơn với bộ lọc `ALL`  
**WHEN** Bấm `+ Tạo đơn đặt trước`  
**THEN** Hệ thống yêu cầu chọn một chi nhánh; không tự lấy chi nhánh đầu tiên; danh mục và tồn hiển thị theo chi nhánh đã chọn.

---

### Requirement: REQ-BRANCH-SCOPE-02 Backend từ chối sản phẩm không thuộc danh mục chi nhánh trước khi trừ tồn
- `OrderService.CreateOrderAsync`, `CreatePreOrderAsync` và chiều `NewItems` của `ProcessReturnExchangeAsync` **MUST** kiểm tra mỗi sản phẩm **trả tiền** (`IsGift = false`) có `BranchProduct` cùng `BranchId`, `!IsDeleted` và `Status = "Active"` (so sánh không phân biệt hoa thường) trước mọi thao tác trừ tồn/ghi đơn; thiếu thì **MUST** ném `BusinessException` mã `PRODUCT_NOT_IN_BRANCH` nêu tên sản phẩm, và **MUST NOT** thay đổi `BranchStocks`, `Orders`, ngân sách khuyến mãi hay voucher.
- Chi nhánh của đơn dùng để kiểm tra là `request.BranchId` (tạo đơn / đặt trước) hoặc `originalOrder.BranchId` (đổi/trả), không phải giá trị client tự đặt khác.
- Dòng quà tặng (`IsGift = true`) thuộc sản phẩm không có `BranchProduct` Active **SHALL** được xử lý như quà hết tồn: bỏ dòng quà (số lượng thực tặng 0) và thêm cảnh báo, **MUST NOT** làm thất bại cả đơn.
- `GetBranchProductsByProductIdsAsync` **SHALL** tiếp tục lọc theo `BranchId` và `!IsDeleted`; việc lọc `Status` do `OrderService` thực hiện để không đổi hợp đồng repository.

#### Scenario: Sản phẩm có tồn nhưng chưa gán chi nhánh bị từ chối khi gọi trực tiếp
**GIVEN** Chi nhánh A có `BranchStocks` 20 đơn vị cho sản phẩm X, nhưng X không có `BranchProducts` của A  
**WHEN** Gửi `POST /orders` (hoặc pre-order) cho chi nhánh A với 2 đơn vị X  
**THEN** Backend trả lỗi `PRODUCT_NOT_IN_BRANCH` nêu tên X; tồn X vẫn 20; không tạo đơn.

#### Scenario: `BranchProduct` ở trạng thái Inactive bị từ chối
**GIVEN** X có `BranchProducts` của A với `Status = "Inactive"` và có tồn  
**WHEN** Bán X tại A  
**THEN** Backend từ chối `PRODUCT_NOT_IN_BRANCH`, không trừ tồn.

#### Scenario: Đổi hàng sang sản phẩm không thuộc chi nhánh của đơn gốc bị từ chối
**GIVEN** Đơn gốc thuộc chi nhánh A; sản phẩm Y không có `BranchProducts` Active của A  
**WHEN** Gửi `return-exchange` với `NewItems` chứa Y  
**THEN** Backend từ chối `PRODUCT_NOT_IN_BRANCH`; không hoàn kho hàng trả và không tạo đơn mới (toàn giao dịch không đổi).

#### Scenario: Quà tặng ngoài chi nhánh bị bỏ qua kèm cảnh báo, đơn vẫn thành công
**GIVEN** Đơn gồm sản phẩm trả tiền thuộc chi nhánh A và 1 dòng quà Z không thuộc `BranchProducts` của A  
**WHEN** Chốt đơn tại A  
**THEN** Đơn thành công không có dòng quà Z, có cảnh báo quà Z tạm không khả dụng; tồn Z không đổi.

---

### Requirement: REQ-BRANCH-SCOPE-03 Giá và tồn kho cô lập theo chi nhánh (không đổi quy tắc)
- Giá: sản phẩm thuộc chi nhánh mà **không** đặt giá riêng dùng giá chung (`Product.SellingPrice` hoặc `ProductUnit.Price`); **có** đặt giá riêng (`SellingPriceOverride` hoặc `UnitPriceOverrides`) dùng giá chi nhánh. Thứ tự ưu tiên hiện tại trong `CreateOrderAsync` **MUST** giữ nguyên.
- Tồn: kiểm tra và trừ **MUST** chỉ dùng `BranchStocks` của `BranchId` của đơn theo FEFO; tồn của chi nhánh khác **MUST NOT** được tính. Hoàn kho khi hủy/đổi trả **MUST** cộng vào đúng chi nhánh của đơn gốc.
- Danh mục POS **SHALL** trả kèm `unitPrices` và `currentStock` của đúng chi nhánh.

#### Scenario: Giá chung khi chi nhánh không đặt giá riêng, giá chi nhánh khi có
**GIVEN** X có `Product.SellingPrice = 12.000`; chi nhánh A có `BranchProduct` không đặt giá riêng; chi nhánh B có `SellingPriceOverride = 15.000`  
**WHEN** Bán 1 X tại A rồi tại B  
**THEN** Đơn tại A có đơn giá `12.000`; đơn tại B có đơn giá `15.000`.

#### Scenario: Tồn chi nhánh A không dùng cho chi nhánh B
**GIVEN** X có `BranchProducts` Active ở cả A và B; tồn A = 20, tồn B = 3  
**WHEN** Bán 5 X tại B  
**THEN** Backend từ chối vì không đủ tồn (3 < 5); tồn A vẫn 20.

#### Scenario: Bán đúng chi nhánh trừ đúng tồn FEFO
**GIVEN** X thuộc `BranchProducts` Active của A với 2 lô (3 gói hạn gần, 7 gói hạn xa)  
**WHEN** Bán 5 X tại A  
**THEN** Lô hạn gần còn 0, lô hạn xa còn 5; `BranchStocks` của chi nhánh khác không đổi.

---

## Acceptance Checklist
- [ ] `getAllProducts(branchId)` không còn gọi `/products` và POS không dùng mock khi đã có chi nhánh; lỗi API hiển thị lỗi thật, danh mục rỗng hiển thông báo chi nhánh chưa gán sản phẩm.
- [ ] `ALL` không tự lấy `dbBranches[0]` / `summaries[0]`; phải chọn chi nhánh trước khi bán, đặt trước, đổi/trả.
- [ ] `CreateOrderAsync`, `CreatePreOrderAsync`, `NewItems` của `ProcessReturnExchangeAsync` ném `PRODUCT_NOT_IN_BRANCH` cho sản phẩm trả tiền không có `BranchProduct` Active, không đổi tồn/đơn; quà ngoài chi nhánh bị bỏ kèm cảnh báo.
- [ ] Quy tắc giá và trừ tồn FEFO theo chi nhánh không đổi, có test cho giá chung/giá chi nhánh và tồn không lẫn chi nhánh.
- [ ] Toàn bộ backend test và frontend build pass.
