# Proposal: Màn hình Quản lý Chi phí Vận hành & Mua sắm Dịch vụ Ngoài (`service-expenses`)

## Vấn đề
Các khoản chi phí vận hành cửa hàng (tiền điện nước, thuê mặt bằng, bao bì, vận chuyển, sửa chữa) cần có quy trình lập đề xuất đính kèm hóa đơn, phê duyệt, xuất quỹ giải ngân và tổng hợp tự động vào báo cáo Lãi/Lỗ P&L.

## Mục tiêu
Quản lý trọn vẹn vòng đời chứng từ chi phí `ExpenseVoucher` từ tạo đề xuất, kiểm duyệt cờ nghi vấn, giải ngân từ Sổ quỹ đến đảo bút toán hủy chi.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/expenses`, `/expenses` (`src/features/service-expenses/pages/ServiceExpensesPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `ExpenseFilterBar`, `ExpenseTable`, `CreateExpenseModal`, `PayExpenseModal`, `BillPreviewModal`, `ConfirmModal`.
  - Tích hợp đầy đủ với tầng API Backend (`ExpensesController`) và thực thể nghiệp vụ (`ExpenseVoucher`, `CashbookEntry`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/expenses`, `/expenses` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**
- **Nhân viên chi nhánh (Thu ngân / Thủ kho)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/expenses`, `/expenses`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-07-01` (FE-07).
