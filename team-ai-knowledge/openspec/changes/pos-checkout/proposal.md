# Proposal: Màn hình Bán hàng & Thu ngân Quầy POS (Barcode, FEFO, Khuyến mãi, VietQR & Bán nợ) (`pos-checkout`)

## Vấn đề
Quầy thu ngân tạp hóa cần tốc độ xử lý đơn hàng cực nhanh bằng máy quét mã vạch (cả hàng thường lẫn khay cân ký), tự động trừ lô hạn gần nhất FEFO, tự động tính khuyến mãi/quà tặng BOGO/voucher/tích điểm, hỗ trợ đa phương thức thanh toán và in hóa đơn nhiệt K80.

## Mục tiêu
Vận hành màn hình POS toàn diện bám sát danh mục & tồn kho riêng của từng chi nhánh, phân quyền ca trực nhân viên chặt chẽ và linh hoạt chế độ bán cho Chủ cửa hàng.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/pos`, `/employee/pos` (`src/features/pos/pages/PosCheckoutPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `PosHeader`, `PosCartTable`, `PosPaymentPanel`, `PosCatalogModal`, `VietQrModal`, `BelowCostWarningModal`, `OrderDiscountModal`, `PosReceiptModal`, `PosInventoryLookupModal`, `OpenShiftModal`, `CashMovementModal`, `CloseShiftModal`.
  - Tích hợp đầy đủ với tầng API Backend (`OrdersController`, `PromotionsController`, `VouchersController`, `ProductsController`, `RepackOrdersController`) và thực thể nghiệp vụ (`Order`, `OrderDetail`, `BranchStock`, `Package`, `Promotion`, `VoucherCode`, `Customer`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/pos`, `/employee/pos` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**
- **Nhân viên chi nhánh (Thu ngân / Thủ kho)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/pos`, `/employee/pos`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-03-01` (FE-03).
