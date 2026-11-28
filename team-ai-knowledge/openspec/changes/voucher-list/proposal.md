# Proposal: Màn hình Quản lý Đợt Phát hành Mã Giảm giá Voucher / Coupon (`voucher-list`)

## Vấn đề
Chủ cửa hàng cần phát hành các đợt mã giảm giá Voucher theo tiền tố riêng, giới hạn số lượt sử dụng tối đa/đơn hàng tối thiểu, sinh thêm mã hàng loạt và in phiếu voucher nhiệt cho khách.

## Mục tiêu
Quản lý trọn vẹn các đợt phát hành Voucher, sinh mã tự động không trùng lặp và theo dõi tiến độ lượt quy đổi thực tế từ POS.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/vouchers`, `/promotions/vouchers` (`src/features/promotion/pages/VoucherListPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `VoucherBatchTable`, `VoucherBatchModal`, `GenerateCodesModal`, `ConfirmDialog`.
  - Tích hợp đầy đủ với tầng API Backend (`VouchersController`) và thực thể nghiệp vụ (`VoucherCode`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/vouchers`, `/promotions/vouchers` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/vouchers`, `/promotions/vouchers`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-16-02` (FE-16).
