# EXP-2026-11-09-001: Selling Price Controls (FE-03) & Promotions Synchronization

## 1. Problem Statement
1. **Khuyến mãi bậc thang & Quà tặng**:
   - Khi tạo khuyến mãi chiết khấu đơn hàng (`ORDER_DISCOUNT`), người dùng cấu hình nhiều bậc thang tiền (`tiers`). Vì bảng `PromotionConditions` yêu cầu `ProductID` khóa ngoại tới bảng `Products`, các bậc tiền đơn hàng không có `ProductId` khiến thao tác lưu bị lỗi CSDL và chỉ giữ lại 1 mức cấu hình.
   - Modal tạo mới `BUY_X_GET_Y` chưa nạp danh mục sản phẩm kho để người dùng chọn quà tặng và đơn vị tính.
   - Mã voucher bị chặn với thông báo *"Chỉ có hiệu lực từ ngày 09/11/2026"* ngay trong ngày 09/11 do so sánh `DateTime.UtcNow` có giờ/phút.
2. **Kiểm soát giá bán & Lịch sử đổi giá (FE-03)**:
   - Hệ thống chưa có cơ chế kiểm tra và cảnh báo khi giá bán thấp hơn giá vốn (`FE-03.1 Below-Cost Warning`).
   - Hệ thống chưa lưu vết lịch sử biến động giá (`FE-03.2 Price Change History Tracking`) phân biệt giữa Giá bán Master toàn chuỗi và Giá bán riêng từng chi nhánh.
   - Về mặt trải nghiệm: Nếu bắt buộc người dùng gõ lý do thủ công mỗi lần đổi giá sẽ làm chậm thao tác kinh doanh.

## 2. Context & Background
- **Hệ thống giá hiện tại**:
  - `Product.SellingPrice`: Giá niêm yết toàn chuỗi (Master).
  - `BranchProduct.SellingPriceOverride`: Giá bán riêng của chi nhánh (`null` = thừa hưởng giá Master).
  - `Product.CostPrice`: Giá vốn chuẩn để đối chiếu.
- **Files liên quan**:
  - Backend: `ProductsController.cs`, `CatalogService.cs`, `BranchProductService.cs`, `PromotionService.cs`, `AppDbContext.cs`.
  - Frontend: `EditStoreProductModal.tsx`, `ProductFormModal.tsx`, `PromotionModal.tsx`, `PromotionListPage.tsx`, `PromotionTable.tsx`.

## 3. Constraints
- **Trải nghiệm tối giản (Zero Friction UX)**: Đổi giá thông thường tự động lưu ngầm, không bắt buộc người dùng gõ lý do. Chỉ hiển thị cảnh báo và chọn nhanh khi giá bán < giá vốn.
- **Đa Tenant**: Toàn bộ dữ liệu lịch sử giá và khuyến mãi đều phải gắn `TenantId`.
- **Bảo toàn dữ liệu**: Không làm hỏng hoặc xóa các migration/CSDL đã có.

## 4. Assumptions
- Master selling price áp dụng mặc định cho tất cả chi nhánh nếu chi nhánh chưa override.
- Giá vốn đối chiếu (`CostPriceSnapshot`) lấy từ `Product.CostPrice` hoặc chi phí nhập kho gần nhất.
- Voucher có hiệu lực theo ngày lịch dương (tính từ 00:00:00 của ngày bắt đầu đến 23:59:59 của ngày kết thúc theo giờ địa phương).

## 5. Scope & Non-Goals
### In Scope
- Bảng CSDL và thực thể `ProductPriceHistory` lưu vết thay đổi giá Master và giá Chi nhánh.
- Logic kiểm tra cảnh báo bán dưới giá vốn và yêu cầu duyệt của Quản lý/Chủ tiệm.
- Endpoint `GET /api/products/{id}/price-history` và UI xem lịch sử giá.
- Sửa lưu bậc thang khuyến mãi và chọn quà tặng trong `PromotionModal` / `PromotionListPage`.
- Sửa so sánh ngày voucher trong `PromotionService`.

### Out of Scope (Non-Goals)
- Tự động thay đổi giá bán theo AI / thị trường.
- Thay đổi cấu trúc tính thuế VAT.

## 6. Options & Alternatives Evaluated

| Tiêu chí | Phương án A: Tách 2 bảng riêng (`MasterPriceHistory` & `BranchPriceHistory`) | Phương án B (CHỌN): Bảng chung `ProductPriceHistory` có `PriceScope` |
|---|---|---|
| **Cấu trúc CSDL** | 2 bảng trùng lặp nhiều cột (OldPrice, NewPrice, ChangedBy...) | 1 bảng duy nhất, cột `BranchId` nullable (`null` = Master) |
| **Truy vấn lịch sử** | Phải union 2 bảng khi muốn xem tổng quan biến động giá của một mặt hàng | Truy vấn đơn giản `WHERE ProductId = @id AND (BranchId IS NULL OR BranchId = @bId)` |
| **Bảo trì code** | Nhân đôi entity, repository, DTO | Thống nhất 1 luồng service và 1 component xem lịch sử |

## 7. Success Criteria
- Thêm 3 bậc khuyến mãi, lưu và F5 hiển thị đầy đủ 3 bậc.
- Tạo mới Mua X tặng Y chọn được sản phẩm quà tặng từ danh mục.
- Voucher tạo hôm nay dùng được ngay tại quầy POS.
- Thay đổi giá bán Master hoặc Chi nhánh tự động ghi nhận 1 bản ghi lịch sử, không cần gõ lý do.
- Đặt giá < giá vốn hiển thị cảnh báo đỏ và yêu cầu xác nhận.
