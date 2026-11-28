# Proposal: Màn hình Kê khai & Chốt sổ Thuế Hộ kinh doanh TT 152 (7 Sổ Kế toán & XML 01/CNKD) (`household-tax-snapshot`)

## Vấn đề
Chủ hộ kinh doanh tạp hóa cần lập đầy đủ 7 sổ kế toán hộ kinh doanh theo Thông tư 152/2025/TT-BTC, tự động tách nhóm ngành thuế GTGT + TNCN, chốt kỳ tính thuế bảo vệ bằng mã PIN và kết xuất tờ khai `01/CNKD` định dạng XML chuẩn Tổng cục Thuế.

## Mục tiêu
Tự động hóa trọn vẹn quy trình xem sổ sách kế toán, chốt Snapshot thuế bất biến bảo mật bằng mã PIN, xuất Excel/XML `01/CNKD` và xác nhận hoàn tất nộp thuế.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/tax-snapshots`, `/store-owner/tax`, `/store-owner/accounting-books`, `/tax-snapshots` (`src/features/tax-snapshot/pages/TaxSnapshotPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `TaxOverviewCard`, `AccountingBooksView`, `TaxDeclarationFormView`, `TaxSnapshotsHistoryView`, `CreateTaxSnapshotModal`, `SecurityPinModal`, `TaxRateConfigModal`, `TaxSnapshotDetailDrawer`, `TaxDeclarationPreviewModal`, `TaxExportModal`.
  - Tích hợp đầy đủ với tầng API Backend (`HouseholdTaxController`, `TaxFilingConfirmationsController`) và thực thể nghiệp vụ (`HouseholdTaxSnapshot`, `TaxFilingConfirmation`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/tax-snapshots`, `/store-owner/tax`, `/store-owner/accounting-books`, `/tax-snapshots` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/tax-snapshots`, `/store-owner/tax`, `/store-owner/accounting-books`, `/tax-snapshots`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-19-01` (FE-19).
