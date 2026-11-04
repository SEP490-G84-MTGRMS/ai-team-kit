# Exploration: pos-branch-pricing-and-fefo (Bán Hàng POS: Giá Bán Chi Nhánh, Đơn Vị Tính Quy Đổi & Trừ Kho FEFO)

## 1. Problem Statement
- Hiện tại phân hệ POS bán hàng chưa đồng bộ chặt chẽ với mô hình đa tầng:
  1. **Giá bán chi nhánh**: Giá hiển thị và giá lưu đơn cần ưu tiên lấy từ cấu hình chi nhánh `BranchProducts.SellingPriceOverride`, nếu không có mới dùng `Products.SellingPrice`.
  2. **Đa đơn vị tính quy đổi**: Khách hàng tại siêu thị/tạp hóa thường mua lẻ (Lon/Gói/Cái), mua lốc (Lốc 6 lon, Lốc 6 hũ) hoặc mua sỉ theo thùng (Thùng 24 lon, Thùng 30 hũ). Đơn vị tính và đơn giá bán phải lấy từ bảng giá chi nhánh `BranchProductUnitPrices.SellingPriceOverride` hoặc `ProductUnits.Price`.
  3. **Trừ kho FEFO theo đơn vị quy đổi**: Khi bán 1 Thùng (hệ số quy đổi = 24), hệ thống phải trừ 24 đơn vị cơ bản trong `BranchStocks` theo nguyên tắc FEFO (lô có hạn sử dụng gần nhất trừ trước).
  4. **Giao diện POS**: Cột đơn vị tính (ĐVT) trên bảng giỏ hàng hiện là text tĩnh, chưa có dropdown chọn đơn vị tính để tự động nhảy đơn giá tương ứng.
  5. **Dữ liệu kiểm thử**: Cần nạp dữ liệu chuẩn cho cửa hàng An Nhiên (`tenant_an_nhien_02`) của chủ tiệm Trần Quốc An với 4 sản phẩm thực tế có đầy đủ mã vạch, nhiều đơn vị tính và các lô hạn dùng khác nhau.

## 2. Context & Background
- **Entity liên quan**:
  - `Product`: Sản phẩm tổng, giá gốc `SellingPrice`, đơn vị cơ bản `BaseUnit`.
  - `ProductUnit`: Đơn vị quy đổi (`UnitName`, `ConversionRate`, `Price`, `Barcode`).
  - `BranchProduct`: Gán sản phẩm vào chi nhánh, có `SellingPriceOverride`.
  - `BranchProductUnitPrice`: Giá override theo từng ĐVT tại chi nhánh (`SellingPriceOverride`).
  - `BranchStock`: Tồn kho chi nhánh theo lô FEFO (`BatchCode`, `ExpiryDate`, `QuantityOnHand`, `QuantityReserved`, `LandedCostPerUnit`).
  - `Order` & `OrderDetail`: Hóa đơn bán hàng và chi tiết các dòng hàng.
- **Frontend POS**:
  - `PosCartTable.tsx`: Bảng hiển thị giỏ hàng.
  - `PosCheckoutPage.tsx`: Màn hình bán hàng POS chính, tiếp nhận quét mã vạch USB HID và tính toán thanh toán.

## 3. Constraints
- Tuân thủ Clean Architecture 4 tầng của backend .NET 8 và cấu trúc feature-based của frontend React 19.
- Không phá vỡ các API hiện có; các DTO phải tương thích ngược (backward-compatible).
- Multi-tenancy: Mọi truy vấn phải cô lập dữ liệu theo `TenantId` của cửa hàng An Nhiên (`tenant_an_nhien_02`).
- Unit tests: Phải viết bộ test đầy đủ trong `PosOrderServiceTests.cs` và đảm bảo 100% tests PASS.

## 4. Assumptions
- **[ASSUMPTION-01]**: Mỗi sản phẩm luôn có ít nhất một đơn vị cơ bản (`BaseUnit`) với `ConversionRate = 1.00m`.
- **[ASSUMPTION-02]**: Khi bán theo đơn vị quy đổi, số lượng cơ sở cần trừ tồn kho được tính bằng `Quantity * ConversionRate`.
- **[ASSUMPTION-03]**: Tồn kho thực tế trong `BranchStocks` luôn lưu trữ theo đơn vị cơ bản (`BaseUnit`).
- **[ASSUMPTION-04]**: Trừ kho FEFO sắp xếp theo `ExpiryDate ASC` (không phân biệt mã lô do nhà cung cấp nào nếu cùng SKU).

## 5. Scope & Non-Goals
### In Scope
- Cập nhật backend `OrderService` và `IOrderRepository` để giải quyết giá chi nhánh, giá ĐVT quy đổi và trừ kho FEFO theo số lượng quy đổi.
- Bổ sung `UnitId` và `UnitName` vào `OrderItemCreateDto`.
- Cập nhật giao diện `PosCartTable.tsx` bổ sung dropdown chọn đơn vị tính (`Select` component), tự động cập nhật đơn giá và thành tiền.
- Viết bộ Unit Tests toàn diện cho `OrderService` trong `PosOrderServiceTests.cs`.
- Viết script seed dữ liệu mẫu cửa hàng An Nhiên cho chủ tiệm Trần Quốc An với 4 sản phẩm thực tế:
  1. Cà phê hòa tan G7 3in1 (`8935024122310`)
  2. Bánh Orion Choco-Pie truyền thống (`8936036020380`)
  3. Muối chấm Hảo Hảo tôm chua cay (`8934563065249`)
  4. Bia Hà Nội Sleek (`8936000440824`)

### Out of Scope (Non-Goals)
- Không can thiệp vào máy in nhiệt vật lý hoặc cổng phần cứng POS.
- Không sửa đổi logic kế toán thuế TT152 đã hoàn thiện trước đó.

## 6. Options Comparison (So sánh phương án kỹ thuật)

### Phương án A: Client-side Price Trust (Client tự tính giá và gửi `UnitPrice` lên, Server chấp nhận trực tiếp)
- **Ưu điểm**: Đơn giản, server không cần tra cứu lại bảng giá.
- **Nhược điểm**: Rất nguy hiểm trong bán lẻ; người dùng hoặc hacker có thể sửa đổi request gửi giá 0đ hoặc giá tùy tiện. Không xác định được hệ số quy đổi chính xác để trừ kho.

### Phương án B (Đề xuất): Server-side Price & Unit Resolution
- **Ưu điểm**:
  - Bảo mật tuyệt đối: Server luôn tra cứu và xác thực đơn giá từ `BranchProductUnitPrice` / `BranchProduct` / `ProductUnit`.
  - Tính toán trừ kho chuẩn xác: Server tự lấy `ConversionRate` của đơn vị để nhân với số lượng mua, đảm bảo trừ đúng số lượng đơn vị cơ bản trong `BranchStocks`.
  - Giữ nguyên tính năng giảm giá thủ công hợp lệ (`DiscountAmount`) của thu ngân khi có quyền.
- **Nhược điểm**: Cần thêm logic join/tra cứu `BranchProduct` và `ProductUnit` trong repository.

## 7. Risks & Mitigations
- **Rủi ro bán âm kho**: Khách mua 1 Thùng (24 lon) nhưng trong kho chỉ còn 20 lon rải rác các lô $\rightarrow$ **Giải pháp**: Kiểm tra tổng tồn kho trước khi trừ: `if (totalOnHand < requiredBaseQty) throw new InvalidOperationException(...)`.
- **Rủi ro thiếu đơn vị tính trong giỏ hàng**: Sản phẩm không có đơn vị quy đổi phụ $\rightarrow$ **Giải pháp**: Dropdown chỉ hiển thị đơn vị cơ sở mặc định, không bắt buộc người dùng chọn lại nếu chỉ có 1 ĐVT.
