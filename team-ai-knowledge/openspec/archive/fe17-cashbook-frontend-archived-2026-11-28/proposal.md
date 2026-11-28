# Proposal: fe17-cashbook-frontend

## Vấn đề
Hiện tại hệ thống bán lẻ MT-GRMS đã có các phân hệ phát sinh dòng tiền như Bán lẻ POS (FE-12), Thu nợ khách hàng (FE-08), Mua sắm dịch vụ vận hành (FE-07) và Chấm công bảng lương (FE-18), nhưng **chưa có phân hệ Frontend Sổ Quỹ (FE-17 Cashbook Ledger & Cash Flow)** tập trung để Chủ cửa hàng (Store Owner) và Quản lý (Store Manager) theo dõi dòng tiền vào/ra và kiểm soát số dư real-time trên các tài khoản quỹ (Két tiền mặt quầy, Két an toàn, Tài khoản ngân hàng nhận tiền VietQR).

Đồng thời, hệ thống thiếu giao diện chuẩn mực để lập phiếu thu/chi tiền mặt ngoài bán hàng, thiếu công cụ hỗ trợ đối soát & kiểm kê két tiền cuối ca (`UC-17.4`), và các giao diện tài chính trước đây cần được chuẩn hoá đồng bộ theo đúng **MT-GRMS Design System** (Deep Teal `#0F766E`, KiotViet pills `9999px`, card bo góc `24px`, font `Be Vietnam Pro`) cùng các shared components của dự án (`AdminToast`, `TablePagination`).

## Mục tiêu
Xây dựng và hoàn thiện phân hệ Frontend cho **FE-17 (Sổ Quỹ & Dòng Tiền)** đáp ứng 100% đặc tả SRS (Report-3) và thiết kế ERD/Database đã thống nhất:
1. **Quản lý Đa Tài Khoản Quỹ (`CashAccounts`)**: Hiển thị thẻ số dư tức thời của Két tiền mặt tại quầy, Két an toàn và các Tài khoản ngân hàng (Vietcombank, MB Bank...).
2. **Bảng Sổ Quỹ Giao Dịch (`LedgerTransactions`)**: Hiển thị nhật ký thu chi phân cấp, lọc theo tài khoản, thời gian, loại phiếu; hiển thị số dư lũy kế sau giao dịch (`BalanceAfter`) và hỗ trợ truy nguyên chứng từ gốc (`ReferenceDocId`).
3. **Hộp thoại Lập Phiếu Thu / Phiếu Chi**: Nhập số tiền, phân loại danh mục, đối tượng nộp/nhận (`Counterparty`), và kiểm tra chặt chẽ điều kiện chặn âm quỹ tiền mặt (`GBR-CSH-03`).
4. **Hộp thoại Kiểm Kê & Đối Soát Quỹ (`UC-17.4`)**: Hỗ trợ đếm tiền thực tế, tính chênh lệch tự động, và ghi nhận bút toán điều chỉnh (`ADJUSTMENT`) kèm lý do giải trình bắt buộc (`GBR-CSH-04`).
5. **Xuất Sổ Quỹ & Xem Trước Bản In A4**: Hỗ trợ xuất file Excel (.CSV UTF-8 có BOM) và xem trước bản in phiếu thu/chi và sổ quỹ.
6. **Chuẩn hoá Design System**: 100% sử dụng Vanilla CSS thuần kết hợp biến CSS toàn cục, tích hợp shared components `AdminToast` và `TablePagination` thay vì sáng tạo phong cách riêng biệt.

## Phạm vi
### In scope
- Xây dựng toàn bộ module giao diện `src/features/cashbook/`:
  - `CashAccountsOverview`: Thẻ danh mục tài khoản quỹ và số dư real-time.
  - `CashbookLedgerTable`: Bảng bút toán sổ quỹ tích hợp `TablePagination`.
  - `CashbookFilterToolbar`: Thanh lọc chuẩn KiotViet pill (Chi nhánh, Tài khoản, Mốc thời gian, Loại phiếu Thu/Chi).
  - `CreateReceiptModal` & `CreatePaymentModal`: Form lập phiếu thu/chi hợp chuẩn.
  - `CashReconciliationModal`: Modal kiểm kê đối soát tiền mặt cuối ngày/cuối ca.
  - `CashbookExportModal`: Modal xuất Excel (.csv) và xem trước bản in A4.
- Tích hợp `AdminToast` cho toàn bộ các tương tác phản hồi (tạo phiếu, kiểm kê, làm mới, xuất file).
- Service / Mock API client `cashbookService.ts` mô phỏng dữ liệu chuẩn theo thiết kế thực thể `CashAccount` và `LedgerTransaction`.
- Bộ Unit tests và Component tests (Vitest) kiểm thử toàn diện logic nghiệp vụ, tính toán số dư và các ràng buộc.

### Out of scope
- Không sửa đổi mã nguồn Backend C# (chờ tích hợp API ở bước sau).
- Không tích hợp Open Banking API trực tiếp (chỉ đối soát sổ sách và mã VietQR tĩnh/động).

## Người dùng liên quan
- **Store Owner (Chủ cửa hàng)**: Toàn quyền truy cập tất cả tài khoản quỹ, xem tài khoản ngân hàng, tạo phiếu chi tiền mặt, duyệt biên bản kiểm kê quỹ.
- **Store Manager (Quản lý cửa hàng)**: Quản lý quỹ trong phạm vi chi nhánh được phân công, lập phiếu thu/chi chi nhánh, kiểm kê ca làm việc.
- **Cashier (Thu ngân)**: Xem phiếu thu/chi phát sinh trong ca bán hàng POS (chỉ đọc).

## Tiêu chí thành công
- [ ] Giao diện FE-17 hiển thị đúng 100% MT-GRMS Design System (Deep Teal `#0F766E`, pill `9999px`, card bo góc `24px`, font `Be Vietnam Pro`, Vanilla CSS thuần không phụ thuộc Tailwind runtime).
- [ ] Tích hợp đầy đủ và hoạt động mượt mà 2 shared components: `AdminToast` và `TablePagination`.
- [ ] Đáp ứng đầy đủ các Use Cases SRS: `UC-17.1` (Xem sổ quỹ), `UC-17.2` (Lập phiếu thu), `UC-17.3` (Lập phiếu chi), `UC-17.4` (Kiểm kê quỹ).
- [ ] Thực thi đầy đủ các Business Rules: `GBR-CSH-01` (khóa sửa/xóa giao dịch hệ thống), `GBR-CSH-02` (phân quyền lập phiếu chi), `GBR-CSH-03` (chặn âm quỹ tiền mặt), `GBR-CSH-04` (bắt buộc lý do kiểm kê lệch tiền).
- [ ] 100% Unit/Component tests pass (Vitest) và TypeScript build thành công 0 lỗi.
