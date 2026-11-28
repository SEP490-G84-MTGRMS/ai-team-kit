# Proposal: Hệ Thống Quản Lý Khuyến Mãi, Voucher & Cấu Hình Tích Điểm (Promotions, Vouchers & Loyalty)

## 1. Bối cảnh & Vấn đề (Context & Problem)
Hệ thống MT-GRMS đã có khung thực thể (Entities/DTOs) và một số API cơ bản cho Khuyến mãi và Voucher, đồng thời Frontend đã có giao diện mẫu (Mock data). Tuy nhiên, các phân hệ này chưa được liên kết thành một chu trình khép kín hoàn chỉnh từ Quản lý (Admin/Store Owner) đến Bán hàng (POS Cashier).
Hiện tại:
- Cửa hàng chưa có khả năng tạo và áp dụng tự động các chương trình khuyến mại phổ biến (giảm % theo hóa đơn, giảm giá theo từng mặt hàng, mua X tặng Y).
- Quản lý voucher chưa cho phép sinh mã hàng loạt và xác thực, trừ tiền trực tiếp trên giỏ hàng POS.
- Điểm thưởng thành viên (`RewardPoints`) đã có trường trong CSDL nhưng chưa có cơ chế cấu hình quy đổi tích điểm và tiêu điểm tại quầy bán hàng.

## 2. Mục tiêu (Objectives)
- Xây dựng hệ thống quản lý khuyến mãi linh hoạt hỗ trợ 3 hình thức chính:
  1. Giảm % trên tổng hóa đơn (kèm điều kiện giá trị đơn tối thiểu và mức giảm tối đa).
  2. Giảm giá theo sản phẩm/mặt hàng cụ thể (% hoặc số tiền trực tiếp).
  3. Mua sản phẩm tặng sản phẩm (Buy X Get Y: mua đủ số lượng sản phẩm A được tặng miễn phí sản phẩm B hoặc cùng loại).
- Chuẩn hóa quản lý Voucher/Coupon: Tạo đợt phát hành, sinh mã tự động, kiểm tra hợp lệ (`validate`) và trừ tiền trực tiếp trên hóa đơn POS, cập nhật trạng thái `USED`.
- Hiện thực hóa cấu hình tích điểm (Loyalty Points): Thiết lập tỷ lệ tích điểm từ doanh số (ví dụ 10.000đ = 1 điểm) và tỷ lệ tiêu điểm (ví dụ 1 điểm = 1.000đ), cho phép khách hàng dùng điểm để giảm trừ thanh toán tại quầy POS.

## 3. Phạm vi (Scope)

### Trong phạm vi (In-Scope)
- **Backend API (`MT_GRMS_BACKEND`)**:
  - `PromotionsController` (`/api/promotions`):
    - CRUD chương trình khuyến mãi (ORDER_DISCOUNT, PRODUCT_DISCOUNT, BUY_X_GET_Y).
    - API thẩm định giỏ hàng (`POST /api/promotions/evaluate-cart`): Tính toán chiết khấu tự động và danh sách quà tặng dựa trên giỏ hàng POS hiện tại.
    - Bật/tắt trạng thái hoạt động (`PATCH /api/promotions/{id}/toggle`).
  - `VouchersController` (`/api/vouchers`):
    - Quản lý đợt voucher (Voucher Batch), sinh mã tự động hàng loạt theo tiền tố (Prefix).
    - API thẩm định mã voucher (`POST /api/vouchers/validate`): Kiểm tra hạn dùng, đơn tối thiểu, trạng thái chưa dùng.
    - API ghi nhận đổi mã (`POST /api/vouchers/redeem`): Khóa mã và đánh dấu `USED` khi hoàn tất đơn hàng.
  - `LoyaltyController` / `Settings` (`/api/loyalty-config` & Tích hợp POS Order):
    - API lấy và cập nhật cấu hình tích điểm của chi nhánh/cửa hàng.
    - Logic cộng điểm thưởng (`RewardPoints`) cho khách hàng khi đơn hàng hoàn tất.
    - Logic trừ điểm thưởng khi khách hàng chọn thanh toán bằng điểm tích lũy tại quầy POS.
- **Frontend UI (`MT_GRMS_FRONTEND`)**:
  - Thay thế Mock Data bằng API Client thực tế (`src/features/promotion/api/promotionApi.ts`).
  - `PromotionListPage` & `PromotionModal`: Tạo mới, sửa, bật/tắt 3 loại khuyến mãi (Đơn hàng, Sản phẩm, Mua X tặng Y).
  - `VoucherListPage` & Modals: Tạo đợt, sinh mã hàng loạt, xem danh sách mã và trạng thái sử dụng.
  - `LoyaltyConfigPage`: Cấu hình tỷ lệ tích điểm (VNĐ -> Điểm), tỷ lệ tiêu điểm (Điểm -> VNĐ) và điều kiện tiêu điểm.
  - `PosCheckoutPage`:
    - Tự động gọi `evaluate-cart` khi giỏ hàng thay đổi để hiển thị mức chiết khấu khuyến mãi và quà tặng tặng kèm.
    - Tích hợp ô nhập mã Voucher (áp dụng giảm trừ ngay nếu hợp lệ).
    - Tích hợp chọn tiêu điểm thành viên (hiển thị số điểm khả dụng của khách và số tiền tương ứng được giảm).

### Ngoài phạm vi (Out-of-Scope)
- Tích hợp tin nhắn SMS Brandname gửi mã voucher tự động đến điện thoại khách hàng.
- Bán hàng đa kênh đồng bộ sang Shopee/Lazada/TikTok Shop.
- Xác thực mã OTP qua điện thoại khi tiêu điểm tại quầy (thu ngân xác nhận trực tiếp với khách qua số điện thoại đăng ký).

## 4. Người dùng & Phân quyền (Users & Roles)
- **Chủ cửa hàng (StoreOwner)**:
  - Toàn quyền tạo, cấu hình, tạm dừng các chương trình khuyến mãi và đợt phát hành voucher.
  - Cấu hình tỷ lệ tích điểm và tiêu điểm thành viên cho cửa hàng.
- **Thu ngân / Nhân viên bán hàng (Employee / Cashier)**:
  - Bán hàng tại quầy POS: Hệ thống tự động áp dụng khuyến mãi hợp lệ.
  - Nhập mã voucher và kiểm tra áp dụng giảm trừ cho khách.
  - Tra cứu điểm tích lũy của khách hàng và chọn áp dụng tiêu điểm theo yêu cầu của khách.

## 5. Tiêu chí thành công (Success Criteria)
1. **Khuyến mãi**: Tạo thành công và kiểm thử đạt cả 3 hình thức:
   - Đơn hàng đạt giá trị tối thiểu được giảm % (có chặn mức giảm tối đa).
   - Sản phẩm chỉ định được giảm giá theo % hoặc tiền mặt khi đưa vào giỏ hàng.
   - Giỏ hàng đủ số lượng sản phẩm A thì tự động xuất hiện quà tặng B với giá 0đ.
2. **Voucher**:
   - Sinh đợt voucher tạo ra danh sách mã duy nhất (status `UNUSED`).
   - Tại POS, nhập mã hợp lệ sẽ giảm trừ tiền đơn hàng; sau khi thanh toán thành công, mã chuyển thành `USED` và không được dùng lại.
3. **Tích điểm**:
   - Cấu hình tích điểm lưu thành công và áp dụng đúng vào đơn hàng.
   - Đơn hàng hoàn tất cộng điểm chính xác theo tỷ lệ cấu hình; đơn hàng có tiêu điểm giảm trừ đúng tiền và trừ số điểm tương ứng của khách hàng.
4. **Kiểm thử & Chất lượng**:
   - Backend chạy `dotnet test` vượt qua 100% (bao gồm Unit/Integration tests cho Khuyến mãi, Voucher, Điểm thưởng).
   - Frontend chạy `npm run build` không có lỗi Type/Linting.
