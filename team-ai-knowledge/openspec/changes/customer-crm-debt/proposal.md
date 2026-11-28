# Proposal: Màn hình Quản lý Khách hàng CRM, Hạn mức Công nợ Phải thu (AR) & Thu nợ (`customer-crm-debt`)

## Vấn đề
Tiệm tạp hóa khu dân cư thường xuyên cho khách quen mua ghi sổ nợ; cửa hàng cần quản lý hồ sơ khách hàng, thiết lập hạn mức nợ tối đa theo từng người, xem sổ cái nợ phải thu (AR) và lập phiếu thu nợ liên thông Sổ quỹ.

## Mục tiêu
Quản lý danh mục khách hàng CRM tích hợp theo dõi dư nợ thời gian thực, thu nợ Tiền mặt/VietQR và kết xuất báo cáo công nợ khách hàng.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/customers`, `/customers` (`src/features/customer-crm/pages/CustomerManagementPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `CustomerFilterBar`, `CustomerTable`, `CustomerDrawerDetail`, `CustomerFormModal`, `DebtCollectionModal`, `CustomerDebtLedgerDrawer`.
  - Tích hợp đầy đủ với tầng API Backend (`CustomersController`, `CustomerDebtController`) và thực thể nghiệp vụ (`Customer`, `CashbookEntry`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/customers`, `/customers` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**
- **Nhân viên chi nhánh (Thu ngân / Thủ kho)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/customers`, `/customers`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-08-01` (FE-08).
