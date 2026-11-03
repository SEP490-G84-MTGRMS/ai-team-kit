# Proposal: Quản lý Khuyến mại & Voucher Backend (BE-16)

## 1. Vấn đề

Hệ thống MT-GRMS hiện tại chỉ có Entity `Promotion` ở mức khung sơ khai (chỉ gồm vài thuộc tính cơ bản), dẫn đến các hạn chế nghiêm trọng sau:
1. **Thiếu quan hệ ERD cốt lõi `eligible_for` giữa Khuyến mại & Hàng hóa:** Chưa có thực thể `PromotionCondition` mang 2 thuộc tính quan trọng trên ERD là `ProductRole` (BUY, GIFT, DISCOUNT) và `MinQty` (số lượng tối thiểu kích hoạt). Điều này khiến hệ thống không thể xử lý các hình thức khuyến mãi bán lẻ phổ biến như "Mua X tặng Y", "Chiết khấu riêng cho nhóm sản phẩm".
2. **Thiếu quản lý mã Voucher/Coupon chi tiết:** Chưa có thực thể `VoucherCode` để quản lý trạng thái từng mã phát hành (chưa dùng, đã dùng, hết hạn), dẫn đến rủi ro gian lận hoặc dùng trùng voucher.
3. **Chưa có Service tính toán & API:** Chưa có nghiệp vụ tự động thẩm định điều kiện đơn hàng tại POS, chưa có API kết nối với giao diện quản lý khuyến mãi/voucher của Chủ cửa hàng (`/store-owner/promotions`, `/store-owner/vouchers`) và màn hình thu ngân POS.

## 2. Mục tiêu

1. **Chuẩn hóa CSDL 3NF khớp 100% ERD & Tài liệu đặc tả:**
   - Mở rộng Entity `Promotion` với đầy đủ các thuộc tính theo đặc tả: `MinOrderValue`, `MaxDiscountAmount`, `UsageLimit`, `UsedCount`, `BudgetLimit`, `TotalDiscountGiven`, `TargetBranches`, `VoucherPrefix`...
   - Hiện thực hóa quan hệ nhiều - nhiều $M:N$ `PromotionCondition` với Composite PK `(PromotionID, ProductID)` hoặc Surrogate PK, lưu trữ `ProductRole`, `MinQty`, `Note`.
   - Bổ sung Entity `VoucherCode` quản lý vòng đời từng mã voucher/coupon theo đợt phát hành.
2. **Xây dựng Tầng Nghiệp vụ (Application Layer):**
   - Bộ thuật toán tính toán & thẩm định khuyến mãi:
     - Giảm giá toàn đơn (Order Discount): theo % (có chặn trần tối đa `MaxDiscountAmount`) hoặc theo số tiền cố định (`FixedAmount`).
     - Mua X tặng Y (Buy X Get Y): Mua đủ số lượng sản phẩm trigger thì tự động tặng quà hoặc giảm giá sản phẩm đích.
     - Khuyến mãi theo sản phẩm (Product Discount).
   - Nghiệp vụ Voucher/Coupon:
     - Sinh mã voucher hàng loạt (Batch generation) theo prefix và số lượng chỉ định.
     - Kiểm tra tính hợp lệ của mã voucher tại POS (đúng thời hạn `[StartDate, EndDate]`, đơn hàng đạt `MinOrderValue`, mã ở trạng thái `UNUSED`, chưa vượt `UsageLimit`).
     - Đánh dấu mã đã sử dụng gắn với `OrderID` / `OrderCode`.
3. **Cung cấp REST API Controllers:**
   - `PromotionsController`: CRUD chương trình khuyến mãi, thiết lập điều kiện sản phẩm, API preview/tính toán chiết khấu giỏ hàng POS.
   - `VouchersController`: Quản lý đợt voucher, sinh mã, tra cứu/xác thực mã voucher cho quầy POS.
4. **Kiểm thử tự động (Unit Testing):**
   - Viết toàn diện các ca kiểm thử xUnit cho: Tính toán chiết khấu, ràng buộc điều kiện ngày giờ, chặn trần giảm giá, mua X tặng Y, sinh mã voucher, bảo vệ cô lập đa người thuê (Multi-Tenancy).

## 3. Phạm vi

### In Scope
- Entity: `Promotion`, `PromotionCondition`, `VoucherCode` trong `MT_GRMS.Domain.Entities.Sales`.
- EF Core Configurations & ánh xạ trong `AppDbContext`.
- Repository & Unit of Work: `IPromotionRepository`, `PromotionRepository`.
- DTOs & FluentValidation Validators trong `MT_GRMS.Application.Promotions`.
- Service xử lý nghiệp vụ: `IPromotionService`, `PromotionService`.
- REST API Controllers: `PromotionsController`, `VouchersController` trong `MT_GRMS.Api`.
- Unit Tests trong `MT_GRMS.UnitTests`.

### Out of Scope
- Code giao diện React Frontend (sử dụng API để khớp với UI đã tạo ở FE-16).
- Sổ cái tích/tiêu điểm Loyalty Point Ledger (thuộc capability riêng).

## 4. Người dùng & Role liên quan
- **Store Owner (Chủ chuỗi / Cửa hàng trưởng):** Tạo và quản lý các chiến dịch khuyến mại, phát hành đợt voucher ưu đãi.
- **Cashier (Thu ngân POS):** Áp dụng tự động khuyến mãi hợp lệ khi quét giỏ hàng hoặc nhập mã voucher của khách hàng.
- **Customer (Khách hàng):** Hưởng ưu đãi chiết khấu hoặc quà tặng theo đúng thể lệ chương trình.

## 5. Tiêu chí thành công
1. `dotnet build` toàn bộ solution MT_GRMS thành công 0 Error, 0 Warning mới.
2. 100% Unit Tests viết mới cho Promotion & Voucher đều đạt `PASS`.
3. Khớp 100% với ERD (hình vẽ thực thể `Promotion`, `eligible_for`, `Product`, `OrderDetail`) và tài liệu phân tích CSDL của dự án.
4. Tương thích hoàn toàn với DTO và UI Frontend (`promotion.types.ts`, `PosPaymentPanel.tsx`).
