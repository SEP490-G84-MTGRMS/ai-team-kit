# Delta Specifications: Đồng Bộ MT-GRMS Design System & Shared Components Cho FE-10

## MODIFIED Requirements

### Requirement: REQ-FE10-DESIGN-01 Đồng Bộ Thẩm Mỹ MT-GRMS Design System
The system MUST adopt the MT-GRMS Design System:
- Color Palette: Primary Deep Teal (`#0F766E`), Dark Teal (`#115E59`), Soft Blue/Teal background (`#F0FDFA`), Border (`#99F6E4` / `#CCFBF1`).
- Typography: Use `var(--font-sans, 'Be Vietnam Pro', sans-serif)`.
- Buttons: All primary and secondary buttons SHALL use KiotViet Pills (`rounded-full`, `btn-primary-pill`, `btn-secondary-pill`).
- Page Header: The page header MUST feature a branded 44x44px Deep Teal icon box with rounded-14px corners and subtle teal shadow.
- Cards: All KPI cards, chart containers, and table boxes MUST use 20px rounded corners with clean borders.

#### Scenario: Người dùng mở trang Dashboard P&L
**GIVEN** Người dùng truy cập trang `/store-owner/reports/pnl`  
**WHEN** Giao diện tải hoàn tất  
**THEN** Nền trang hiển thị màu Soft Teal dịu mắt `#F0FDFA`, tiêu đề trang có icon box màu Deep Teal `#0F766E` sắc nét, các nút thao tác có hình dạng viên thuốc (Pill) bo tròn hoàn hảo.

---

### Requirement: REQ-FE10-SHARED-02 Tích Hợp Shared Component AdminToast
The system MUST integrate `AdminToast` from `src/features/admin/components` to provide visual user feedback.
The system SHALL display an `AdminToast` notification when:
1. Người dùng làm mới dữ liệu báo cáo (Refresh).
2. Người dùng xuất thành công file Excel (.csv).
3. Người dùng kích hoạt lệnh In ấn / Lưu PDF.
4. Xảy ra lỗi trong quá trình tải dữ liệu.

#### Scenario: Bấm nút Làm mới số liệu
**GIVEN** Người dùng đang ở màn hình Báo cáo P&L  
**WHEN** Người dùng bấm nút "Làm mới số liệu" (Refresh)  
**THEN** Dữ liệu được tải lại và một Toast màu xanh Deep Teal nổi lên ở góc thông báo: "Đã cập nhật số liệu báo cáo tài chính mới nhất!".

#### Scenario: Bấm tải file Excel
**GIVEN** Người dùng đang ở Modal Xuất Báo Cáo  
**WHEN** Người dùng bấm "Tải Xuống File .CSV"  
**THEN** Trình duyệt tải file và một Toast hiển thị: "Đã xuất dữ liệu báo cáo P&L sang file Excel (.csv) thành công!".

---

### Requirement: REQ-FE10-SHARED-03 Tích Hợp Shared Component TablePagination Cho Top Sản Phẩm
The system MUST integrate `TablePagination` from `src/components/common/TablePagination` into the Top Selling Products card.
The pagination component SHALL allow:
- Switching pages (Previous, Next, Page Numbers).
- Changing page size (5, 10, 20 items per page).
- Displaying total items count.

#### Scenario: Phân trang danh sách Top sản phẩm
**GIVEN** Danh sách sản phẩm bán chạy có nhiều hơn 5 sản phẩm  
**WHEN** Người dùng chọn page size là 5 và bấm sang trang 2  
**THEN** Danh sách chuyển sang hiển thị các sản phẩm từ vị trí số 6 trở đi, thông tin hiển thị rõ: "Hiển thị 6 - 10 trong tổng số ... sản phẩm".

---

## SYSTEM INVARIANTS (Bất biến giữ nguyên 100%)
- **INV-01**: Đẳng thức kế toán bán lẻ:
  + `Doanh thu thuần = Doanh thu gộp - Chiết khấu - Trả hàng`
  + `Lợi nhuận gộp = Doanh thu thuần - Giá vốn hàng bán (FEFO)`
  + `Lợi nhuận ròng = Lợi nhuận gộp - Chi phí vận hành (FE-07) - Hao hụt kho (FE-06)`
- **INV-02**: Hàm `calculateMarginPct` tuyệt đối không gây lỗi chia cho 0.
- **INV-03**: 22/22 unit tests Vitest và lệnh build Vite production tiếp tục PASS 100%.

---

## Acceptance Checklist
- [ ] Dedicated stylesheet `reports-pnl.css` được tạo và import vào trang chính.
- [ ] Header trang có icon box Deep Teal 44x44px và các nút KiotViet Pills `btn-primary-pill`.
- [ ] Tích hợp `AdminToast` cho mọi tương tác quan trọng.
- [ ] Tích hợp `TablePagination` với đầy đủ tính năng chọn pageSize và chuyển trang.
- [ ] 22/22 Vitest tests pass và `npm run build` thành công 100%.
