# Proposal: Màn hình Cấu hình Tài khoản Ngân hàng, Két quỹ & Kết nối SePay Cửa hàng (`store-finance-accounts`)

## Vấn đề
Cửa hàng cần quản lý danh sách két tiền mặt tại từng chi nhánh, tài khoản ngân hàng nhận tiền bán hàng POS qua VietQR và kết nối API Key SePay được mã hóa an toàn.

## Mục tiêu
Cấu hình tập trung tài khoản ngân hàng & két quỹ chi nhánh, đồng bộ tài khoản SePay và chỉ định tài khoản VietQR mặc định cho từng điểm bán.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/subscriptions?tab=finance-accounts`, `/store-owner/payment-config` (`src/features/finance-accounts/pages/FinanceAccountsSettingsPage.tsx`, `src/features/pos/pages/StorePaymentConfigPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `SepayVisualGuide`, `TablePagination`, `SortableHeader`.
  - Tích hợp đầy đủ với tầng API Backend (`FinanceAccountsController`, `PaymentsController`) và thực thể nghiệp vụ (`FinanceAccount`, `PaymentTransaction`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/subscriptions?tab=finance-accounts`, `/store-owner/payment-config` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/subscriptions?tab=finance-accounts`, `/store-owner/payment-config`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-17-02` (FE-17).
