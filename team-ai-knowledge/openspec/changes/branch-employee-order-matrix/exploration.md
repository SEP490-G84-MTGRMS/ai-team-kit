# EXP-2026-10-13-PO-EMP: Khám phá màn hình Đặt hàng Ma trận cho Nhân viên Chi nhánh (Branch Employee Order Matrix)

## 1. Problem Statement
Hệ thống MT-GRMS hiện đã có tính năng Đặt hàng ma trận (`OrderMatrixPage` tại URL `/store-owner/purchase-orders/create-matrix`), tuy nhiên tính năng này được thiết kế cho cấp Chủ cửa hàng (Store Owner) với bộ lọc cho phép tự do chuyển đổi giữa các chi nhánh khác nhau trong chuỗi.
Thực tế vận hành tại các cửa hàng tạp hóa, nhân viên tại chi nhánh (Branch Staff / Store Employee) chỉ có thẩm quyền và nhiệm vụ lập đơn đặt hàng cho **chính chi nhánh mà mình đang làm việc**. Việc hiển thị dropdown chọn chi nhánh không những dư thừa mà còn tiềm ẩn rủi ro đặt nhầm đơn hàng cho chi nhánh khác. Cần có một màn hình đặt hàng ma trận dành riêng cho nhân viên chi nhánh, kế thừa trọn vẹn sức mạnh của bảng ma trận nhưng khóa chặt phạm vi chi nhánh (loại bỏ dropdown chọn chi nhánh).

## 2. Context & Background
- Màn hình tham chiếu: `http://localhost:5173/store-owner/purchase-orders/create-matrix`.
- Cấu trúc frontend hiện tại:
  - `src/features/purchase-order/pages/OrderMatrixPage.tsx`: Trang quản lý ma trận đặt hàng của Store Owner.
  - `src/features/purchase-order/components/matrix/OrderMatrixFilterBar.tsx`: Thanh công cụ lọc phạm vi (hiện có dropdown chọn Chi nhánh tại dòng 133–148).
  - `src/features/purchase-order/components/matrix/OrderMatrixTable.tsx`: Bảng ma trận dữ liệu ngày x sản phẩm, tính toán tự động số lượng và tổng tiền.
  - `src/features/purchase-order/components/matrix/OrderMatrixHeader.tsx`: Tiêu đề trang, trạng thái ngân sách/công nợ và các nút hành động (Lưu nháp, Gửi đơn, Quay lại).
  - Router: `src/app/router.tsx` định nghĩa các layout và route của ứng dụng.

## 3. Constraints
- **UI/UX Consistency**: Phải tuân thủ bộ quy chuẩn thiết kế `RULE_UI_DESIGN_SYSTEM.md` (compact density, style bảng ma trận, phân cấp màu sắc, không clipping).
- **Tính kế thừa logic**: Không được làm sai lệch các thuật toán nghiệp vụ quan trọng đã có (tính lead days, ngày giao hoạt động `activeDeliveryDays`, ngày nghỉ lễ `holidays`, tính MOQ, copy đơn tuần trước, export/import Excel).
- **Không phá vỡ màn hình Store Owner**: Màn hình Store Owner (`/store-owner/purchase-orders/create-matrix`) vẫn phải tiếp tục hoạt động bình thường với đầy đủ dropdown chi nhánh.

## 4. Assumptions
- **[ASSUMPTION-01]**: Nhân viên chi nhánh đăng nhập thuộc về một chi nhánh mặc định (trong phạm vi mock frontend, giả định là chi nhánh `BR-01 - Siêu thị Mini Cầu Giấy`, hoặc chi nhánh được chọn từ context/URL).
- **[ASSUMPTION-02]**: Không cần dropdown chọn chi nhánh trên toolbar; thay vào đó có thể hiển thị mã/tên chi nhánh dưới dạng chip/badge thông tin chỉ đọc (Read-only) trong header/toolbar để nhân viên nhận biết ngữ cảnh làm việc.
- **[ASSUMPTION-03]**: Đơn đặt hàng được gửi từ nhân viên chi nhánh sẽ ghi nhận theo đúng ID chi nhánh được cố định.

## 5. Scope & Non-Goals
### In Scope
- Tạo màn hình mới `EmployeeOrderMatrixPage.tsx` tại route riêng (ví dụ `/employee/purchase-orders/create-matrix` và route alias thuận tiện).
- Nâng cấp `OrderMatrixFilterBar.tsx` để hỗ trợ cờ cấu hình `hideBranchSelect?: boolean` hoặc `isBranchFixed?: boolean` (đồng thời có thể hiển thị badge tên chi nhánh cố định nếu cần).
- Giữ nguyên toàn bộ tính năng nghiệp vụ: chọn NCC, lọc category, lọc keyword, lọc MOQ vi phạm, lọc sản phẩm đã đặt, ẩn/hiện SOH, điều hướng tuần, nhập số lượng, kiểm tra cảnh báo MOQ, tính tổng tiền.
- Bổ sung breadcrumb / header phù hợp với vai trò Nhân viên chi nhánh.
- Tích hợp route vào `router.tsx` và liên kết điều hướng trong hệ thống.

### Out of Scope (Non-Goals)
- Không triển khai hệ thống xác thực JWT phân quyền đa tầng backend trong change này (chỉ mock session chi nhánh phía frontend).
- Không thay đổi cấu trúc bảng cơ sở dữ liệu backend.
- Không sửa đổi hoặc ảnh hưởng tiêu cực đến tính năng của Store Owner.

## 6. So sánh các Phương án Kỹ thuật

### Phương án 1: Copy-Paste toàn bộ thành component độc lập riêng biệt
- **Cách làm**: Tạo file `EmployeeOrderMatrixPage.tsx` và copy toàn bộ nội dung từ `OrderMatrixPage.tsx`, tự viết riêng một filter bar không có dropdown branch.
- **Ưu điểm**: Hoàn toàn độc lập, không sợ ảnh hưởng đến trang Store Owner.
- **Nhược điểm**: Trùng lặp code (>500 dòng logic phức tạp như tính `computeDayColumns`, `computeDefaultQtyMap`, xử lý excel, state management). Khó bảo trì, vi phạm nguyên tắc DRY.

### Phương án 2 (Được chọn): Component Composition & Reusable Filter Configuration
- **Cách làm**:
  1. Mở rộng `OrderMatrixFilterBarProps` với `hideBranchSelect?: boolean` và `fixedBranchLabel?: string`.
  2. Khi `hideBranchSelect === true`, ẩn dropdown `<select>` chọn chi nhánh, có thể hiển thị một badge cố định `🏪 Chi nhánh: {fixedBranchLabel}`.
  3. Tạo trang `EmployeeOrderMatrixPage.tsx` sử dụng cấu hình chi nhánh cố định (`selectedBranchId` cố định từ session/default), tái sử dụng các component dùng chung `OrderMatrixTable`, `OrderMatrixHeader`, `OrderMatrixFilterBar`.
  4. Cấu hình route mới trong `src/app/router.tsx`.
- **Ưu điểm**:
  - Tái sử dụng 100% logic phức tạp và UI của matrix, đảm bảo trải nghiệm đồng nhất.
  - Dễ bảo trì, sửa lỗi 1 nơi sẽ cập nhật cho cả 2 màn hình.
  - Mã nguồn gọn gàng, đúng triết lý Clean Code và Karpathy Coding (surgical change).
- **Rủi ro & Cách giảm thiểu**:
  - Rủi ro làm vỡ layout filter toolbar: Kiểm tra kỹ style CSS flexbox của `.po-unified-bar` để khi ẩn dropdown branch thì các ô tìm kiếm, NCC, date range vẫn dàn đều cân đối.

## 7. Success Criteria
- [ ] Nhân viên chi nhánh truy cập route đặt hàng ma trận thành công.
- [ ] Toolbar hoàn toàn không có dropdown chọn chi nhánh.
- [ ] Toàn bộ logic đặt hàng, kiểm tra MOQ, tính tiền, copy tuần, import/export hoạt động chính xác.
- [ ] Màn hình Store Owner gốc vẫn hoạt động bình thường, không bị ảnh hưởng.
