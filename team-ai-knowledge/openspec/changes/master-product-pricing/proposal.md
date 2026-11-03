# Proposal: master-product-pricing

## Vấn đề
Trong hệ thống MT-GRMS, tài liệu kiến trúc nghiệp vụ `pricing-layers-business-model.md` đã xác lập rõ mô hình 6 tầng giá từ Catalog, Nhà cung cấp, Chi nhánh, Đặt hàng PO, Nhập kho GRN đến Bán lẻ POS. Tuy nhiên ở mã nguồn backend hiện tại:
1. **Sự mập mờ giữa giá tham chiếu và giá lịch sử**: `Product.CostPrice` trên Master Product dễ bị hiểu nhầm là giá vốn thực tế hoặc giá mua cố định từ nhà cung cấp, dẫn đến rủi ro lập trình viên vô tình dùng giá này để tính lãi gộp (COGS) hoặc ghi đè khi NCC đổi giá thỏa thuận.
2. **Thiếu tính đồng bộ về thuật ngữ miền (Domain Ubiquitous Language)**: Tài liệu nghiệp vụ định nghĩa giá mua tham khảo trên Master là `DefaultPurchasePrice` (fallback cho PO khi chưa có `AgreedPrice` từ NCC), và giá bán lẻ theo đơn vị quy đổi là `ProductUnits.SellingPrice`. Tuy nhiên trong Domain Entity hiện tại, `Product.cs` chưa có alias `DefaultPurchasePrice`, và `ProductUnit.cs` đang dùng thuộc tính `Price` mà không có alias `SellingPrice`.
3. **Thiếu định nghĩa bất biến (Invariants) & XML Documentation**: Thiếu các doc comment làm rõ ranh giới nghiệp vụ tại tầng Domain để ngăn chặn việc sửa giá Master làm ảnh hưởng đến PO cũ, phiếu nhập kho đã chốt hoặc giá vốn tồn kho theo lô (`InventoryLots.UnitCost` / `BranchStock.LandedCostPerUnit`).

## Mục tiêu
1. Chuẩn hóa thực thể `Product` và `ProductUnit` trong domain `MT_GRMS.Domain.Entities.Catalog` để phản ánh chính xác mô hình phân lớp giá (Layer 1 - Master Product) theo `pricing-layers-business-model.md`.
2. Bổ sung các backward-compatible alias (`DefaultPurchasePrice`, `SellingPrice`) và documentation rõ ràng cho các thuộc tính giá, bảo đảm code tự diễn giải đúng nguyên tắc phân lớp.
3. Bảo toàn 100% tính toàn vẹn của database schema, EF Core mapping, các API DTOs hiện tại, và giữ toàn bộ unit tests hiện hữu vượt qua (pass).

## Phạm vi
### In scope:
- Thực thể Domain: `MT_GRMS.Domain.Entities.Catalog.Product` và `MT_GRMS.Domain.Entities.Catalog.ProductUnit`.
- Bổ sung property alias `[NotMapped] public decimal? DefaultPurchasePrice { get => CostPrice; set => CostPrice = value; }` trên `Product`.
- Bổ sung property alias `[NotMapped] public decimal SellingPrice { get => Price; set => Price = value; }` trên `ProductUnit`.
- Bổ sung XML doc comments chi tiết giải thích rõ vai trò phân lớp của `CostPrice` (Layer 1 reference fallback) và `SellingPrice` (Layer 1 base retail).
- Bổ sung Unit Tests kiểm tra tính nhất quán của các alias này và bảo đảm không gây hồi quy (regression) cho các service Catalog.

### Out of scope:
- Không thay đổi tên cột hoặc cấu trúc bảng trong PostgreSQL (không tạo migration phá vỡ cấu trúc DB hiện tại).
- Không sửa đổi logic tính giá của Layer 2 (`SupplierProducts.AgreedPrice`), Layer 3 (`BranchProducts`), Layer 4 (PO), Layer 5 (GRN) hay Layer 6 (POS FEFO COGS).

## Người dùng liên quan
- **Store Owner / Super Admin**: Người thiết lập danh mục hàng hóa và định mức giá tham khảo toàn chuỗi.
- **Backend Developers**: Các lập trình viên phát triển module PO, Nhập kho, Bán hàng POS có sự chỉ dẫn kiến trúc rõ ràng từ Domain entities để không vi phạm quy tắc phân lớp giá.

## Tiêu chí thành công
- [ ] `Product.cs` cung cấp alias `DefaultPurchasePrice` đồng bộ hoàn toàn với `CostPrice`.
- [ ] `ProductUnit.cs` cung cấp alias `SellingPrice` đồng bộ hoàn toàn với `Price`.
- [ ] Code tuân thủ nguyên tắc "Sửa đúng chỗ (surgical)" và "Đơn giản trước" (Karpathy coding).
- [ ] Toàn bộ unit tests hiện hữu tiếp tục PASS và bổ sung test kiểm chứng các alias mới.
- [ ] Không làm thay đổi bất kỳ schema database nào.
