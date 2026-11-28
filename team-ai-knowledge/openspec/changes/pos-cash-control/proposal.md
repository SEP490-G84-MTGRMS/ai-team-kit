# Proposal: Màn hình Kiểm soát Két tiền mặt Quầy POS, Hạn mức & Phê duyệt Chi két (`pos-cash-control`)

## Vấn đề
Thu ngân tại quầy thường phát sinh các khoản chi lặt vặt (mua đá, trả tiền ship) hoặc rút bớt tiền mặt từ ngăn kéo nộp về két sắt khi ngăn kéo đầy; Chủ cửa hàng cần đặt hạn mức tự duyệt và phê duyệt các khoản vượt trần.

## Mục tiêu
Cung cấp trung tâm kiểm soát dòng tiền mặt tại quầy POS theo thời gian thực gồm cấu hình hạn mức duyệt chi, duyệt/từ chối phiếu chi két và xác nhận nhận tiền rút két (Cash Drop).

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/pos-cash-control`, `/store-owner/cash-control`, `/pos-cash-control` (`src/features/pos/pages/StorePosCashControlPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `TablePagination`.
  - Tích hợp đầy đủ với tầng API Backend (`ShiftsController`, `CashbookController`) và thực thể nghiệp vụ (`ShiftCashMovement`, `CashbookEntry`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/pos-cash-control`, `/store-owner/cash-control`, `/pos-cash-control` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/pos-cash-control`, `/store-owner/cash-control`, `/pos-cash-control`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-03-05` (FE-03).
