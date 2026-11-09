# EXP-2026-11-09-002: Phân tích nguyên nhân gốc (Root Cause) lỗi Tự động áp Khuyến mãi POS (400 Bad Request / Trạng thái hiệu lực) & Mất chọn Đơn vị quy đổi trên Đơn đặt trước

## 1. Problem Statement & Kết Quả Tái Hiện Thực Tế
Đã tái hiện thành công 100% cả hai cụm lỗi trực tiếp trên môi trường chạy thực tế (`MT_GRMS.Api` port `5232`, CSDL PostgreSQL, dữ liệu cửa hàng `tenant_an_nhien_02` và `tenant_mt_mart_01`):

1. **Tái hiện Cụm lỗi 1 (Khuyến mãi tự động trả về `0 đ` & Nhãn trạng thái sai)**:
   - Gửi request `POST /api/promotions/evaluate-cart` với `subTotal = 420000` và `branchId = "BR-AN-01"` (mã chi nhánh đang gán trên POS của cửa hàng An Nhiên) → API trả về **`HTTP 400 Bad Request`** do lỗi ép kiểu JSON sang `System.Nullable<System.Guid>`.
   - Kiểm tra bản ghi `KM-202611-950` (*"Giảm giá mùng 1"*, bậc 2: đơn từ `400.000 đ` giảm tối đa `60.000 đ`) trên `tenant_an_nhien_02`: `startDate = 2026-11-12` trong khi ngày hệ thống là `2026-11-09` (chưa tới ngày bắt đầu), nhưng danh sách trên giao diện Quản lý khuyến mãi vẫn hiển thị nhãn **Đang chạy (`ACTIVE`)** thay vì **Sắp diễn ra (`UPCOMING`)**.
   - Mở modal Tạo/Sửa khuyến mãi: ô **Phạm vi áp dụng** chỉ liệt kê 4 chi nhánh mẫu cứng (`Quận 1`, `Bình Thạnh`, `Thủ Đức`, `Gò Vấp`) không khớp chi nhánh thật của cửa hàng.
2. **Tái hiện Cụm lỗi 2 (Mất chọn Đơn vị quy đổi trên `+ Tạo đơn đặt trước` & lệch lượng giữ kho)**:
   - Mở **Quản lý đơn hàng** với quyền `STORE_OWNER` (bộ lọc mặc định `branchFilter = "ALL"`), bấm `+ Tạo đơn đặt trước` → sản phẩm tải từ `GET /api/products` trả về không có trường `unitPrices` (`undefined`), làm điều kiện `hasMultipleUnits` trên `CreatePreOrderModal` bằng `false`, ẩn hoàn toàn ô `<select>` chọn đơn vị quy đổi.

---

## 2. Context & Root Cause (Chi tiết File / Dòng lệnh)

### 2.1. Root Cause Cụm lỗi 1 (Khuyến mãi tự động & Quản lý KM)
- **`MT_GRMS.Application/Promotions/Dtos/CartEvaluationDtos.cs` (dòng 10–16)**:
  - `EvaluateCartRequest` định nghĩa `Guid? BranchId = null, Guid? CustomerId = null`, và `CartItemDto` định nghĩa `Guid ProductId`. Khi Frontend gửi mã chi nhánh dạng chuỗi (`"BR-AN-01"`, `"BR-02"`) hoặc mã khách lẻ (`"kh_retail"`), bộ giải tuần tự JSON của ASP.NET Core từ chối ngay từ tầng Model Binding với mã `400 Bad Request` trước khi vào Controller.
- **`MT_GRMS_FRONTEND/src/features/pos/pages/PosCheckoutPage.tsx` (dòng 652–683)**:
  - Truyền trực tiếp `branchId: activeBranch.id` và `customerId: currentTab.customer?.id` không qua kiểm tra định dạng, đồng thời `.catch(() => {})` nuốt lỗi `400` khiến `autoPromoDiscount` giữ nguyên `0`.
- **`MT_GRMS_FRONTEND/src/features/promotion/pages/PromotionListPage.tsx` (dòng 113)**:
  - Gán cứng `status: dto.isActive ? 'ACTIVE' : 'PAUSED'`, bỏ qua hoàn toàn phép so sánh ngày hiện tại với `dto.startDate` và `dto.endDate` (dù `PromotionTable.tsx` dòng 47–53 đã có sẵn giao diện cho `UPCOMING` và `EXPIRED`, và Backend `GetPagedListAsync` dòng 50–64 cũng đã phân biệt 4 trạng thái này).
- **`MT_GRMS_FRONTEND/src/features/promotion/components/promotions/PromotionModal.tsx` (dòng 8, 355–359) & `PromotionFilterBar.tsx` (dòng 4, 73–77)**:
  - Import trực tiếp mảng hằng `MOCK_BRANCHES` từ `promotionMockData.ts` thay vì lấy danh sách chi nhánh thật của Tenant.

### 2.2. Root Cause Cụm lỗi 2 (Đơn vị quy đổi trên Đơn đặt trước)
- **`MT_GRMS_FRONTEND/src/features/pos/pages/InvoiceManagementPage.tsx` (dòng 150–163)**:
  - Khi `branchFilter === 'ALL'` (mặc định của Chủ cửa hàng) và `assignedBranch.id` là `'BR-01'` / `'BR-AN-01'`, biến `targetBranchId` tính ra `undefined` (không lấy fallback từ `dbBranches[0]?.id` vốn đã tải danh sách UUID chi nhánh thật từ Backend).
- **`MT_GRMS.Infrastructure/Repositories/ProductRepository.cs` (dòng 20–24), `CatalogService.cs` (dòng 40–72) & `posOrderApi.ts` (dòng 138–160)**:
  - Nhánh fallback `GET /api/products` chưa `.Include(p => p.Units)`, `ProductResponse` chưa trả kèm danh sách đơn vị tính, và `posOrderApi.getAllProducts` nhánh `/products` chưa ánh xạ sang `Product.unitPrices`.
- **`MT_GRMS.Application/PosOrders/OrderService.cs` (dòng 814–870, 1134–1141, 1466–1483)**:
  - `CreatePreOrderAsync` chưa quy đổi `requiredBaseQty = item.Quantity * conversionRate` khi kiểm tra/trừ giữ kho `BranchStock` và chưa phân giải đơn giá theo `UnitId` như `CreateOrderAsync`.
  - `OrderDetail` chưa lưu bền vững `UnitName` và `ConversionRate`, khiến `MapToOrderResponse` luôn trả về `d.Product?.BaseUnit` và `CancelOrderAsync` chỉ hoàn lại `detail.Qty` thay vì `detail.Qty * detail.ConversionRate`.

---

## 3. Các Chỗ Khác Có Cùng Lỗi (Blast Radius Scan)
- **`CreatePreOrderModal.tsx` (dòng 126–127)**: Đã chặn `branchId.startsWith('BR-')`, nhưng `selectedCustomerId` nếu mang chuỗi khác `'kh_retail'` không phải UUID vẫn có nguy cơ gây `400` trên `evaluate-cart`.
- **`ReturnExchangeModal.tsx` & `CancelOrderAsync`**: Nếu hóa đơn bán lẻ hoặc đơn đặt trước bán theo đơn vị quy đổi (`Thùng` / `Lốc`), việc lưu `ConversionRate` & `UnitName` trên `OrderDetail` giúp đồng bộ hiển thị đơn vị và hoàn kho chính xác trên toàn luồng đơn hàng.

---

## 4. Constraints & Assumptions
### Constraints
- Giữ tương thích ngược 100% với toàn bộ chữ ký hàm C# đang được gọi từ 588 Unit/Integration Tests hiện hữu.
- Mọi truy vấn chi nhánh, sản phẩm và khuyến mãi phải tuân thủ cô lập đa người thuê (`TenantId`).
- Thay đổi cột trên `OrderDetails` phải kèm EF Core Migration và câu lệnh an toàn `ADD COLUMN IF NOT EXISTS` trong `DbInitializer`.

### Assumptions
- **[ASSUMPTION-01]**: Tồn kho vật lý tại bảng `BranchStocks` luôn được quản lý theo **đơn vị cơ sở (`BaseUnit`)** của sản phẩm; mọi đơn vị quy đổi (`ProductUnit`) đều có `ConversionRate >= 1` quy đổi ra đơn vị cơ sở.
- **[ASSUMPTION-02]**: Chương trình khuyến mãi có `TargetBranches == "ALL"` được áp dụng cho mọi chi nhánh thuộc cùng `TenantId`, kể cả khi quầy POS đang chọn mã chi nhánh chuỗi nội bộ (`BR-...`).
- **[ASSUMPTION-03]**: Dữ liệu khuyến mãi và đơn hàng lịch sử trong CSDL không bị hỏng cấu trúc; các dòng `OrderDetails` cũ sẽ mặc định `ConversionRate = 1` và fallback `UnitName = Product.BaseUnit`.

---

## 5. Scope & Non-Goals
### In Scope
- Xử lý triệt để lỗi `400 Bad Request` trên `evaluate-cart` với `BranchId` / `CustomerId` chuỗi và đối khớp chi nhánh theo `Id`, `BranchCode`, `Name` hoặc `"ALL"`.
- Tính đúng trạng thái `ACTIVE` / `UPCOMING` / `EXPIRED` / `PAUSED` trên danh sách Khuyến mãi và nạp chi nhánh thật của cửa hàng vào bộ lọc + modal Khuyến mãi.
- Trả đầy đủ `UnitPrices` từ danh mục sản phẩm, truyền UUID chi nhánh khả dụng trên `InvoiceManagementPage`, và hỗ trợ đầy đủ quy đổi `ConversionRate` + lưu `UnitName` cho Đơn đặt trước & Đơn POS.

### Out of Scope (Non-Goals)
- Không thay đổi thuật toán xếp hạng `Best-Offer` giữa các loại khuyến mãi hay chính sách không dùng Voucher trên Đơn đặt trước.
- Không thay đổi cấu trúc bảng `ProductUnits` hoặc `BranchStocks`.

---

## 6. Đánh Giá Phương Án Xử Lý

| Tiêu chí | Phương án A: Chỉ chặn lọc chuỗi ở Frontend (Workaround) | Phương án B (Chọn): Chuẩn hóa cả DTO/Service Backend + Đồng bộ Frontend |
|---|---|---|
| Xử lý `BranchId` trên `evaluate-cart` | Nếu `branchId` không phải UUID thì xóa thành `undefined` ở FE | Đổi `EvaluateCartRequest` nhận `string? BranchId`, `string? CustomerId` (giữ constructor tương thích ngược) và đối khớp cả `Id` lẫn `BranchCode`/`Name` tại Repository |
| Đơn vị tính cho Đơn đặt trước | Chỉ sửa `targetBranchId` ở `InvoiceManagementPage` | Vừa truyền `targetBranchId` từ `dbBranches`, vừa bổ sung `UnitPrices` vào `ProductResponse` (`GET /api/products`), vừa lưu `UnitId`/`UnitName`/`ConversionRate` trên `OrderDetail` & nhân `ConversionRate` trong `CreatePreOrderAsync` |
| Ưu / Nhược điểm | Nhanh nhưng bỏ sót kiểm tra KM giới hạn theo mã chi nhánh và vẫn giữ kho sai số lượng khi đặt theo Thùng/Lốc | Triệt để tận gốc ở cả API lẫn CSDL, không còn bất kỳ ngách nào gây lỗi `400` hay lệch tồn kho quy đổi |

**Kết luận chọn**: Chọn **Phương án B**; không cần chạy script sửa dữ liệu cũ vì giá trị mặc định `ConversionRate = 1` tương thích hoàn toàn với các đơn hàng trước đó.

---

## 7. Success Criteria
1. `POST /api/promotions/evaluate-cart` với `branchId = "BR-AN-01"` và `customerId = "kh_retail"` trả `200 OK` cùng số tiền giảm chính xác.
2. Danh sách khuyến mãi hiển thị đúng nhãn `Sắp diễn ra` / `Đã kết thúc` theo ngày hiệu lực; modal Khuyến mãi hiển thị đúng chi nhánh của Tenant.
3. Modal `+ Tạo đơn đặt trước` hiển thị dropdown chọn đơn vị quy đổi và giữ/hoàn kho đúng `Quantity × ConversionRate`.
