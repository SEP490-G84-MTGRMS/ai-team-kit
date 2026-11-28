# Proposal: Màn hình Sổ quỹ Tiền mặt & Ngân hàng, Chuyển quỹ Nội bộ & Chuỗi Hash Kiểm toán (`cashbook-ledger`)

## Vấn đề
Chủ chuỗi cần kiểm soát tập trung toàn bộ dòng tiền vào/ra trên các két sắt chi nhánh và tài khoản ngân hàng, thực hiện chuyển quỹ nội bộ đối ứng, xử lý giao dịch ngân hàng chờ phân loại (Triage) và chống sửa xóa gian lận sổ quỹ.

## Mục tiêu
Vận hành Sổ quỹ đa tài khoản bất biến có kiểm chứng chuỗi băm `AuditHash`, hỗ trợ lập phiếu thu/chi, chuyển quỹ đối ứng, gạch bỏ bằng bút toán bù trừ và in phiếu thu/chi.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/cashbook`, `/cashbook` (`src/features/cashbook/pages/CashbookPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `CashbookFilterToolbar`, `CashbookLedgerTable`, `CreateReceiptModal`, `CreatePaymentModal`, `InternalTransferModal`, `CashbookExportModal`, `PrintReceiptModal`, `ReverseTransactionModal`, `TriageInboxModal`.
  - Tích hợp đầy đủ với tầng API Backend (`CashbookController`) và thực thể nghiệp vụ (`CashbookEntry`, `FinanceAccount`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/cashbook`, `/cashbook` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/cashbook`, `/cashbook`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-17-01` (FE-17).
