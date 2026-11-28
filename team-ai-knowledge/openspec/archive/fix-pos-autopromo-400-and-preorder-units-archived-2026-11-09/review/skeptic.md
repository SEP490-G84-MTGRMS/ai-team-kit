# Skeptic Review: fix-pos-autopromo-400-and-preorder-units

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5 | Đã bao phủ đầy đủ sau vòng 2: tách 2 bước trừ nhiều lô FEFO trên `CreatePreOrderAsync`, nhiều dòng cùng `ProductId` khác ĐVT, quy đổi `ConversionRate` cho `BUY_X_GET_Y`/`PRODUCT_DISCOUNT`, `NewItems` khi Đổi/Trả, `CartItemDto.ProductId` + `ValidateVoucherRequest.CustomerId` chuỗi, và nút Hủy + hiển thị ĐVT trên Tab Đơn đặt trước. |
| D2 Correctness | 5 | Đã khử bẫy nhân giá gấp `ConversionRate` lần khi tách lô FEFO, bảo toàn `isActive = true` khi sửa CTKM `UPCOMING`, đồng bộ ưu tiên `EXPIRED` → `PAUSED` → `UPCOMING` → `ACTIVE` theo `UTC+7`, và bỏ tồn kho giả `?? 100` cùng `.catch` sinh đơn `PO` giả. |
| D3 Coherence | 5 | `proposal.md` ↔ `exploration.md` ↔ `specs.md` khớp hoàn toàn trên cả 4 Requirement, đường dẫn đầy đủ `src/features/pos/api/posOrderApi.ts` và phạm vi `CreatePreOrderAsync` / `CreateOrderAsync` / `ProcessReturnExchangeAsync`. |
| D4 Constraints | 5 | Giữ 1 constructor duy nhất trên `EvaluateCartRequest` tránh lỗi `CS0121` / `System.Text.Json`, kiểm tra `CurrentTenantId` khác rỗng khi phân giải chi nhánh theo token, và bọc `IsNpgsql()` cho DDL trong `DbInitializer`. |
| D5 Blast Radius | 5 | Dữ liệu cũ an toàn với `ConversionRate = 1.00`, nạp chi nhánh thật trên cả `PosCheckoutPage` & `InvoiceManagementPage` tránh nổ `400` lúc Thanh toán, tính đúng `CostPriceAtSale` theo ĐVT quy đổi và map tên chi nhánh trên `PromotionTable`. |

## Vấn đề (Vòng 1 phát hiện → Đã cập nhật triệt để vào `specs.md` ở Vòng 2)
- [RESOLVED - Vòng 1 HIGH] REQ-FIX-PREUNIT-02: Tách nhiều lô FEFO hoặc đặt nhiều dòng cùng `ProductId` khác ĐVT trong `CreatePreOrderAsync` làm đội thành tiền gấp `ConversionRate` lần và mất dòng thứ 2 → Đã cập nhật `REQ-FIX-PREUNIT-02` bắt buộc tách 2 bước (cộng tổng lượng cơ sở trừ kho FEFO trước, tạo `OrderDetail` độc lập theo từng dòng sau) và kiểm tra tổng lượng cơ sở trên `CreatePreOrderModal`.
- [RESOLVED - Vòng 1 HIGH] REQ-FIX-PROMO-01: Thiếu `ConversionRate` trên `CartItemDto` cho `BUY_X_GET_Y` / `PRODUCT_DISCOUNT`, sót `CartItemDto.ProductId` chuỗi và `ValidateVoucherRequest.CustomerId` → Đã cập nhật đầy đủ vào `REQ-FIX-PROMO-01`.
- [RESOLVED - Vòng 1 HIGH] REQ-FIX-PROMO-02: Lưu sửa CTKM `UPCOMING` làm tắt nhầm `isActive = false` và lệch thứ tự `EXPIRED` vs `PAUSED` với Backend → Đã bổ sung cờ `isActive` độc lập trên `PromotionItem`, đồng bộ thứ tự `EXPIRED` → `PAUSED` → `UPCOMING` → `ACTIVE` theo `UTC+7` và map tên chi nhánh trên `PromotionTable`.
- [RESOLVED - Vòng 1 HIGH] REQ-FIX-PREUNIT-01 & REQ-FIX-PREUNIT-02: `InvoiceManagementPage` gán cứng UUID chi nhánh khác Tenant, `.catch` tự sinh đơn `PO` giả, thiếu chiều `NewItems` khi Đổi/Trả và thiếu nút Hủy Đơn đặt trước → Đã cập nhật vào `REQ-FIX-PREUNIT-01` và `REQ-FIX-PREUNIT-02`.
- [LOW] `ThermalPrintService.cs` & bản xem trước K80: Khuyến nghị hiển thị kèm `UnitName` bên cạnh tên/số lượng mặt hàng khi bán theo đơn vị quy đổi (`Thùng`/`Lốc`) trong bước Apply.

## Kết luận: Chấp nhận
