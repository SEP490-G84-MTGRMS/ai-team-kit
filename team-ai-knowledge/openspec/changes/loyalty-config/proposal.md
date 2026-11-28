# Proposal: Màn hình Cấu hình Chính sách Tích điểm, Đổi thưởng & Sổ cái Điểm Thành viên (`loyalty-config`)

## Vấn đề
Cửa hàng cần giữ chân khách quen thông qua cơ chế tích điểm tự động theo giá trị hóa đơn, quy đổi điểm trừ tiền trực tiếp tại POS có giới hạn trần `%` hóa đơn và tra cứu sổ cái biến động điểm.

## Mục tiêu
Thiết lập công thức tích/tiêu điểm thành viên (`LoyaltySetting`) và quản lý sổ cái giao dịch điểm kèm chức năng điều chỉnh điểm thủ công có lý do.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/loyalty-config`, `/promotions/loyalty-config` (`src/features/promotion/pages/LoyaltyConfigPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `LoyaltyConfigForm`, `LoyaltyLedgerTable`, `AdjustPointsModal`.
  - Tích hợp đầy đủ với tầng API Backend (`LoyaltyConfigController`) và thực thể nghiệp vụ (`LoyaltySetting`, `LoyaltyPointAdjustment`, `Customer`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/loyalty-config`, `/promotions/loyalty-config` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/loyalty-config`, `/promotions/loyalty-config`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-16-03` (FE-16).
