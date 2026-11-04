# Tasks: pos-branch-pricing-and-fefo

## Phase 1: Database Seeding (Cửa hàng An Nhiên)
- [ ] T1 — Viết script SQL chèn dữ liệu 4 sản phẩm mẫu thực tế (G7 3in1, Choco-Pie, Muối Hảo Hảo, Bia Hà Nội Sleek) kèm `ProductUnits`, `BranchProducts`, `BranchProductUnitPrices` và các lô `BranchStocks` FEFO cho `tenant_an_nhien_02` (REQ-POS-13).

## Phase 2: Backend Order Service & DTO
- [ ] T2 — Bổ sung `UnitId` và `UnitName` vào `OrderItemCreateDto` trong `OrderDtos.cs` (REQ-POS-10).
- [ ] T3 — Cập nhật `IOrderRepository` và `OrderRepository.cs`: Thêm hàm lấy thông tin `BranchProduct`, `BranchProductUnitPrice` và `ProductUnit` theo `BranchId` và `ProductId` (REQ-POS-09, REQ-POS-10).
- [ ] T4 — Nâng cấp `OrderService.CreateOrderAsync`: Tra cứu giá bán chi nhánh, quy đổi số lượng cơ sở `BaseQty = Quantity * ConversionRate`, trừ tồn kho `BranchStocks` theo FEFO, và lưu `Order`, `OrderDetail` (REQ-POS-09, REQ-POS-10, REQ-POS-11).

## Phase 3: Backend Unit Tests
- [ ] T5 — Viết 6 Unit Tests bao phủ toàn bộ các kịch bản trong `PosOrderServiceTests.cs`: Giá override chi nhánh, giá override ĐVT, trừ kho FEFO 1 lô, trừ kho FEFO nhiều lô, từ chối khi không đủ tồn, hoàn trả kho khi hủy đơn (REQ-POS-09, REQ-POS-10, REQ-POS-11).

## Phase 4: Frontend POS Cart & Multi-Unit Dropdown
- [ ] T6 — Cập nhật `PosCartTable.tsx`: Thay thế cột ĐVT tĩnh bằng dropdown `<select className="pos-unit-select">` khi sản phẩm có nhiều đơn vị tính, tự động cập nhật đơn giá hiển thị (REQ-POS-12).
- [ ] T7 — Cập nhật `PosCheckoutPage.tsx`: Bổ sung callback `onUpdateItemUnit`, tính toán lại thành tiền và gửi `unitId`, `unitName` khi submit đơn hàng (REQ-POS-10, REQ-POS-12).

## Phase 5: Verification & Build
- [ ] T8 — Chạy `dotnet test` xác minh toàn bộ 341+ unit tests backend đều PASS và kiểm tra `npm run build` frontend (REQ-POS-13).
