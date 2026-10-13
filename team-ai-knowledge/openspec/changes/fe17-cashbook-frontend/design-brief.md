# Thiết kế kỹ thuật: fe17-cashbook-frontend

## 1. Luồng Người Dùng (User Flows)

### Flow 1: Theo dõi Sổ quỹ & Biến động số dư Real-time (UC-17.1)
1. Người dùng (Store Owner / Manager) truy cập màn hình Sổ Quỹ (`/store-owner/cashbook`).
2. Hệ thống tải danh sách tài khoản quỹ (`CashAccounts`: Két tiền mặt, Tài khoản ngân hàng) và hiển thị thẻ KPI số dư tức thời.
3. Người dùng chọn tài khoản quỹ, chọn mốc thời gian (Hôm nay, 7 ngày qua, Tháng này...), và loại phiếu (Tất cả, Thu, Chi).
4. Bảng Sổ quỹ (`CashbookLedgerTable`) kết xuất danh sách giao dịch kèm số dư lũy kế (`BalanceAfter`) và phân trang `TablePagination`.

### Flow 2: Lập Phiếu Thu tiền (UC-17.2)
1. Nhấn nút "Lập Phiếu Thu" trên thanh công cụ.
2. Modal `CreateReceiptModal` mở ra, người dùng chọn tài khoản thụ hưởng, nhập số tiền (`Amount > 0`), danh mục (Bán hàng, Thu nợ, Thu khác), người nộp (`CounterpartyName`), và diễn giải.
3. Bấm "Lưu Phiếu Thu" -> Hệ thống validate -> Tăng `current_balance` của tài khoản, tạo bút toán `RECEIPT`, và hiển thị `AdminToast` thành công màu xanh lá.

### Flow 3: Lập Phiếu Chi tiền mặt (UC-17.3)
1. Nhấn nút "Lập Phiếu Chi" trên thanh công cụ.
2. Modal `CreatePaymentModal` mở ra, người dùng chọn tài khoản xuất tiền, nhập số tiền, danh mục (Chi phí dịch vụ, Trả nợ NCC, Tạm ứng lương, Khác), người nhận tiền (`CounterpartyName`).
3. **Kiểm tra Rule GBR-CSH-03**: Nếu tài khoản tiền mặt và số tiền chi > số dư hiện tại -> Cảnh báo tức thì màu đỏ, vô hiệu hóa nút lưu.
4. Bấm "Xác Nhận Chi" -> Giảm `current_balance` của tài khoản, tạo bút toán `PAYMENT`, hiển thị `AdminToast` thành công.

### Flow 4: Kiểm kê & Đối soát Két tiền mặt (UC-17.4)
1. Nhấn nút "Kiểm Kê Quỹ" trên thanh công cụ.
2. Modal `CashReconciliationModal` hiển thị số dư lý thuyết trên hệ thống (`SystemBalance`).
3. Người dùng nhập số tiền thực đếm trong két (`ActualCountedBalance`).
4. Hệ thống tự động tính chênh lệch (`Difference = Actual - System`):
   - Nếu chênh lệch != 0: Bắt buộc người dùng nhập lý do giải trình (`Reason`) theo quy định `GBR-CSH-04`.
5. Bấm "Chốt Kiểm Kê" -> Hệ thống cập nhật `current_balance` khớp với thực tế và tự động tạo bút toán `ADJUSTMENT` trong sổ quỹ.

### Flow 5: Xuất Sổ Quỹ & In Ấn Khổ A4
1. Nhấn nút "Xuất & In Sổ Quỹ" -> Modal `CashbookExportModal` mở ra.
2. Tab 1 (Excel): Tải file .CSV mã hóa UTF-8 có BOM chống lỗi font tiếng Việt.
3. Tab 2 (Bản in A4): Xem trước bản in chuẩn khổ giấy A4 có quốc hiệu, chi nhánh, bảng kê giao dịch và khối chữ ký; bấm nút in gọi `window.print()`.

---

## 2. Kiến Trúc Component & Thư Mục Frontend

```
src/features/cashbook/
├── components/
│   ├── CashAccountsCardSection.tsx   # Danh sách thẻ tài khoản quỹ (Két tiền mặt, Ngân hàng)
│   ├── CashbookFilterToolbar.tsx     # Thanh lọc KiotViet pill (Chi nhánh, Tài khoản, Thời gian, Thu/Chi)
│   ├── CashbookLedgerTable.tsx       # Bảng bút toán sổ quỹ tích hợp TablePagination
│   ├── CreateReceiptModal.tsx        # Modal lập phiếu thu tiền mặt / chuyển khoản
│   ├── CreatePaymentModal.tsx        # Modal lập phiếu chi tiền mặt (chặn âm quỹ)
│   ├── CashReconciliationModal.tsx   # Modal kiểm kê đối soát két tiền mặt (UC-17.4)
│   └── CashbookExportModal.tsx       # Modal xuất Excel .CSV và xem trước in A4
├── pages/
│   └── CashbookPage.tsx              # Trang chính phân hệ Sổ quỹ (tích hợp AdminToast)
├── services/
│   └── cashbookService.ts            # Mock API client xử lý lưu vết và tính toán số dư
├── types/
│   └── cashbook.types.ts             # TypeScript interfaces cho CashAccount & LedgerTransaction
├── cashbook.css                      # 100% Vanilla CSS tuân thủ MT-GRMS Design System
└── __tests__/
    └── cashbook.test.ts              # Unit tests cho logic tính toán số dư, lọc và validation
```

---

## 3. Tái Sử Dụng Shared Components & Design Tokens

1. **`AdminToast`**:
   - Nhúng từ `src/features/admin/components/common/AdminToast.tsx`.
   - Phản hồi tức thì cho mọi tương tác: Lập phiếu thu, Lập phiếu chi, Chốt kiểm kê, Cảnh báo âm quỹ, Xuất báo cáo.
2. **`TablePagination`**:
   - Nhúng từ `src/components/common/TablePagination/TablePagination.tsx`.
   - Áp dụng trực tiếp vào bảng `CashbookLedgerTable` với các tùy chọn `10`, `20`, `50` dòng/trang.
3. **Design Tokens (`index.css`)**:
   - Màu chủ đạo: `var(--blue-primary, #0F766E)`, `var(--blue-subtle, #CCFBF1)`, `var(--blue-border, #99F6E4)`.
   - Màu trạng thái thu/chi: Xanh lá (`var(--green-money, #00c853)`) cho Thu (`+`), Đỏ cam (`var(--red-accent, #ff3b30)`) cho Chi (`-`).
   - Bo góc: Nút pill bo tròn `var(--radius-pill, 9999px)`, khung card bo tròn `var(--radius-card, 24px)`.
   - Typography: Font `Be Vietnam Pro`, số tiền dùng font `tabular-nums`.
