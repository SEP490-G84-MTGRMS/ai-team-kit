# Spec: tax-snapshot

> Spec gốc của capability. Chỉ cập nhật qua `/sep-archive` (merge delta từ `openspec/changes/<change>/specs.md`).

## Requirements

### Requirement: REQ-FE19-01 Quản lý danh sách kỳ tính thuế (Tax Snapshot List)
Hệ thống SHALL hiển thị danh sách các kỳ tính thuế `TaxSnapshot` thuộc Tenant đang đăng nhập, kèm theo các bộ lọc theo Năm, Quý, Trạng thái và các thẻ KPI thống kê nghĩa vụ thuế.

#### Scenario: Xem danh sách kỳ tính thuế thành công
**GIVEN** Người dùng đăng nhập với vai trò `StoreOwner` hoặc `Accountant`  
**WHEN** Người dùng điều hướng tới trang `/admin/tax-snapshots`  
**THEN** Hệ thống hiển thị bảng danh sách các kỳ tính thuế với các cột: Năm, Quý, Doanh thu chịu thuế, Thuế GTGT (1%), Thuế TNCN (0.5%), Tổng tiền thuế, Số đơn hàng, Trạng thái, và Ngày chốt  
**AND** 4 thẻ KPI hiển thị tổng doanh thu lũy kế, tổng thuế GTGT, tổng thuế TNCN và tổng số tiền thuế đã nộp / còn nợ.

#### Scenario: Lọc danh sách kỳ tính thuế
**GIVEN** Trang danh sách kỳ tính thuế đang hiển thị  
**WHEN** Người dùng chọn lọc Năm = "2026", Quý = "Q3", Trạng thái = "Submitted"  
**THEN** Bảng dữ liệu chỉ hiển thị các bản ghi khớp với điều kiện lọc  
**AND** Nếu không có bản ghi nào, hiển thị trạng thái `Empty` với thông điệp rõ ràng.

---

### Requirement: REQ-FE19-02 Tạo kỳ tính thuế & Xem trước số liệu (Create Snapshot & Preview)
Hệ thống MUST cho phép người dùng chọn Năm và Quý để xem trước số liệu doanh thu thực thu (`TaxableRevenue`) và số thuế tạm tính trước khi lưu bản ghi `TaxSnapshot`.

#### Scenario: Xem trước số liệu thành công khi tạo kỳ thuế mới
**GIVEN** Người dùng mở modal "+ Tạo kỳ tính thuế"  
**WHEN** Người dùng chọn Năm = 2026 và Quý = 3  
**THEN** Hệ thống gọi API preview tính tổng doanh thu từ các hóa đơn `Paid` trong Quý 3/2026  
**AND** Hiển thị Doanh thu chịu thuế, Thuế GTGT = 1%, Thuế TNCN = 0.5%, Tổng thuế = 1.5% và số lượng đơn hàng cấu thành.

#### Scenario: Ngăn chặn tạo trùng kỳ thuế đã tồn tại
**GIVEN** Kỳ tính thuế Quý 3 Năm 2026 đã tồn tại ở trạng thái `Finalized` hoặc `Submitted`  
**WHEN** Người dùng chọn lại Quý 3 Năm 2026 trong modal tạo mới  
**THEN** Hệ thống hiển thị cảnh báo: "Kỳ thuế Quý 3/2026 đã được chốt số liệu. Không thể tạo mới."  
**AND** Vô hiệu hóa (disable) nút "Lưu kỳ thuế".

---

### Requirement: REQ-FE19-03 Chốt số liệu & Quản lý vòng đời tờ khai (Lifecycle & Immutability)
Hệ thống MUST hỗ trợ chuyển trạng thái vòng đời của kỳ tính thuế: `Draft` (Nháp) -> `Finalized` (Đã chốt) -> `Submitted` (Đã nộp thuế). Kỳ tính thuế một khi đã `Finalized` hoặc `Submitted` MUST là bất biến (không được chỉnh sửa hay xóa).

#### Scenario: Chốt số liệu kỳ thuế từ trạng thái Draft
**GIVEN** Một kỳ tính thuế đang ở trạng thái `Draft`  
**WHEN** Người dùng bấm nút "Chốt số liệu" và xác nhận hộp thoại cảnh báo  
**THEN** Trạng thái kỳ thuế chuyển sang `Finalized`  
**AND** Không còn nút chỉnh sửa hay xóa cho kỳ thuế này.

#### Scenario: Đánh dấu đã nộp thuế
**GIVEN** Một kỳ tính thuế đang ở trạng thái `Finalized`  
**WHEN** Người dùng bấm nút "Xác nhận đã nộp thuế" và nhập ngày nộp  
**THEN** Trạng thái kỳ thuế chuyển sang `Submitted`  
**AND** Badge trạng thái hiển thị màu xanh lá "Đã nộp".

---

### Requirement: REQ-FE19-04 Xem bảng kê hóa đơn & Xuất biểu mẫu báo cáo (Invoice Breakdown & Export)
Hệ thống SHALL cung cấp bảng kê phân rã danh sách các hóa đơn POS thuộc kỳ tính thuế và hỗ trợ xuất biểu mẫu tờ khai Form 01/CNKD theo Thông tư 40/2021/TT-BTC.

#### Scenario: Xem bảng kê hóa đơn cấu thành
**GIVEN** Người dùng mở chi tiết một kỳ tính thuế trong Drawer  
**WHEN** Chuyển sang tab "Bảng kê hóa đơn"  
**THEN** Hệ thống hiển thị danh sách hóa đơn với các cột: Mã hóa đơn, Ngày bán, Khách hàng, Hình thức thanh toán, Số tiền thực thu.

#### Scenario: Xuất tờ khai thuế Form 01/CNKD
**GIVEN** Kỳ tính thuế đang ở trạng thái `Finalized` hoặc `Submitted`  
**WHEN** Người dùng bấm nút "Xuất tờ khai thuế" và chọn định dạng Excel hoặc XML  
**THEN** Hệ thống tải về file báo cáo tờ khai thuế với đầy đủ thông tin mã số thuế, cơ quan thuế, doanh thu chịu thuế và số thuế GTGT, TNCN tương ứng.

---

## Lịch sử
- 2026-10-14 · `fe19-tax-snapshot-frontend` · +4 ~0 -0
