# Spec: pos-multi-branch-permissions

> Spec gốc của capability. Chỉ cập nhật qua `/sep-archive` (merge delta từ `openspec/changes/<change>/specs.md`).

## Requirements

### Requirement: REQ-01 Cấu trúc Đa Chi Nhánh & Phân Bổ Nhân Sự An Nhiên Mart
Hệ thống CSDL (Seed Data trong `DbInitializer.cs`) MUST khởi tạo ít nhất 3 chi nhánh hoạt động cho chủ tiệm An Nhiên Mart (`tenant_an_nhien_02`) kèm theo tài khoản nhân viên được phân công cụ thể vào từng chi nhánh.

#### Scenario: Khởi tạo dữ liệu mẫu chuỗi An Nhiên Mart
- **GIVEN** Hệ thống chạy nạp dữ liệu ban đầu `DbInitializer.SeedNewStoreOwnerAnNhienAsync`
- **WHEN** Quá trình seed dữ liệu hoàn tất
- **THEN** CSDL phải có:
  - Chi nhánh 1: `BR-AN-01` (An Nhiên Mart - Chi nhánh Ba Đình)
  - Chi nhánh 2: `BR-AN-02` (An Nhiên Mart - Chi nhánh Cầu Giấy)
  - Chi nhánh 3: `BR-AN-03` (An Nhiên Mart - Chi nhánh Đống Đa)
  - Tài khoản chủ tiệm `0918889999` mang vai trò `STORE_OWNER` có quyền truy cập toàn bộ 3 chi nhánh
  - Tài khoản nhân viên `0917778888` mang vai trò `EMPLOYEE` có `BranchId` gắn với `BR-AN-01` (Ba Đình)
  - Tài khoản nhân viên `0916667777` mang vai trò `EMPLOYEE` có `BranchId` gắn với `BR-AN-02` (Cầu Giấy)
  - Sản phẩm và tồn kho được phân bổ đầy đủ trên các chi nhánh.

---

### Requirement: REQ-02 Phân Quyền Điều Chỉnh Chi Nhánh Tại POS Bán Hàng
Giao diện thanh điều hướng POS (`PosHeader.tsx` & `PosCheckoutPage.tsx`) MUST phân tách rõ cách hiển thị chi nhánh làm việc theo vai trò người dùng đăng nhập:
1. Người dùng có vai trò `STORE_OWNER` SHALL có thể chọn và chuyển đổi qua lại giữa các chi nhánh của cửa hàng thông qua menu dropdown.
2. Người dùng có vai trò `EMPLOYEE` MUST bị khóa cố định ở chi nhánh đã được phân công làm việc, hiển thị dưới dạng badge thông tin chỉ đọc (Read-only) và không thể chọn chi nhánh khác.

#### Scenario: STORE_OWNER chuyển đổi chi nhánh trên POS
- **GIVEN** Người dùng đăng nhập với tài khoản `0918889999` (vai trò `STORE_OWNER`)
- **WHEN** Người dùng truy cập màn hình POS bán hàng
- **THEN** Thanh tiêu đề POS hiển thị Dropdown danh sách chi nhánh (Ba Đình, Cầu Giấy, Đống Đa)
- **AND WHEN** Người dùng chọn chuyển sang "An Nhiên Mart - Chi nhánh Cầu Giấy"
- **THEN** Chi nhánh bán hàng hiện tại được cập nhật sang Cầu Giấy, số liệu tồn kho hiển thị theo Cầu Giấy, và các đơn hàng tạo ra mang `BranchId` của Cầu Giấy.

#### Scenario: EMPLOYEE đăng nhập POS bị khóa cố định chi nhánh
- **GIVEN** Người dùng đăng nhập với tài khoản `0917778888` (vai trò `EMPLOYEE`, gắn với Ba Đình)
- **WHEN** Người dùng truy cập màn hình POS bán hàng
- **THEN** Thanh tiêu đề POS chỉ hiển thị Badge tĩnh "An Nhiên Mart - Chi nhánh Ba Đình" kèm icon địa điểm
- **AND** Không xuất hiện dropdown chuyển chi nhánh hoặc bất kỳ thao tác đổi chi nhánh nào.

---

### Requirement: REQ-03 Phân Quyền Hủy Hóa Đơn vs Đổi Trả Hàng
Tại màn hình Quản lý đơn hàng (`InvoiceManagementPage.tsx`):
1. Người dùng vai trò `EMPLOYEE` SHALL được phép tạo phiếu Đổi trả hàng (Returns) cho khách hàng tại chi nhánh mình quản lý, nhưng MUST bị ẩn hoặc cấm bấm nút Hủy đơn hàng (Void / Cancel Invoice).
2. Người dùng vai trò `STORE_OWNER` MUST có toàn quyền thực hiện Hủy hóa đơn lẫn Đổi trả hàng trên toàn bộ chi nhánh.

#### Scenario: STORE_OWNER thực hiện hủy hóa đơn
- **GIVEN** Chủ cửa hàng đăng nhập với vai trò `STORE_OWNER` tại trang Quản lý hóa đơn
- **WHEN** Chủ cửa hàng bấm vào một hóa đơn đã thanh toán
- **THEN** Nút "Hủy hóa đơn" hiển thị rõ ràng với màu cảnh báo đỏ
- **AND WHEN** Chủ cửa hàng bấm "Hủy hóa đơn" và xác nhận lý do
- **THEN** Trạng thái hóa đơn chuyển sang ĐÃ HỦY (CANCELLED/VOIDED) và tồn kho được hoàn trả.

#### Scenario: EMPLOYEE thực hiện đổi trả hàng và không thể hủy đơn
- **GIVEN** Nhân viên đăng nhập với vai trò `EMPLOYEE` tại trang Quản lý hóa đơn
- **WHEN** Nhân viên xem chi tiết một hóa đơn tại chi nhánh của mình
- **THEN** Nút "Đổi trả hàng" hiển thị đầy đủ và cho phép thao tác tạo phiếu đổi trả
- **AND** Nút "Hủy hóa đơn" bị ẩn hoàn toàn (hoặc bị vô hiệu hóa với tooltip thông báo quyền hạn).

---

### Requirement: REQ-04 Tùy Chọn Tra Cứu Tồn Kho & Chọn Bán Theo Lô FEFO Tại POS
Hệ thống POS MUST cung cấp nút công cụ tùy chọn "Tra cứu Lô FEFO" ngay trên giao diện bán hàng để mở Modal tra cứu nhanh (`PosInventoryLookupModal`):
1. Modal SHALL hỗ trợ tìm kiếm sản phẩm theo tên hoặc quét barcode.
2. Modal MUST hiển thị tồn kho hiện tại của chi nhánh đang bán và bảng so sánh tồn kho của các chi nhánh khác trong cùng chuỗi.
3. Modal MUST hiển thị danh sách các lô hàng (`Batches`) kèm số ngày còn lại và ngày hết hạn, sắp xếp theo nguyên tắc FEFO (lô cận date nhất lên đầu).
4. Mỗi dòng lô hàng trong Modal MUST có nút **"✓ Chọn bán lô này"** cho phép thu ngân chỉ định đích danh lô hàng đưa vào giỏ hàng POS với mã lô cụ thể (thay vì mặc định tự động trừ theo FEFO).

#### Scenario: Thu ngân mở modal tra cứu lô FEFO và chọn bán đích danh một lô
- **GIVEN** Thu ngân đang ở màn hình bán hàng POS có giỏ hàng đang phục vụ khách
- **WHEN** Thu ngân bấm vào nút "Tra cứu Lô FEFO" trên thanh công cụ
- **THEN** Modal tra cứu nhanh mở ra tại chỗ mà không làm mất giỏ hàng hay chuyển hướng trang
- **AND WHEN** Thu ngân tra cứu sản phẩm "Bia Hà Nội Sleek" và thấy các lô hàng
- **AND WHEN** Thu ngân bấm "✓ Chọn bán lô này" tại dòng lô `LOT-BIA-202612`
- **THEN** Sản phẩm được thêm vào giỏ hàng POS với mã lô cụ thể `LOT-BIA-202612`, hiển thị nhãn lô trực quan trên dòng sản phẩm trong giỏ hàng và Modal tự động đóng lại.

---

## Lịch sử
- 2026-11-05 · `pos-multi-branch-role-scoping-and-pos-fefo-refinement` · +4 ~0 -0
