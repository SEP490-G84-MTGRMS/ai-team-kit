# Design Brief: branch-employee-order-matrix

## 1. Luồng người dùng (User Flow)

```
[Nhân viên chi nhánh]
        │
        ▼
Truy cập: /employee/purchase-orders/create-matrix
(hoặc từ link Đặt hàng nội bộ tại chi nhánh)
        │
        ▼
[Màn hình Đặt hàng Ma trận Chi nhánh]
- Chi nhánh được tự động gán cố định (VD: BR-01 Cầu Giấy)
- Toolbar không có dropdown chọn chi nhánh
        │
        ├─► [Bộ lọc]: Chọn NCC, Danh mục, Tìm kiếm sản phẩm, Ẩn/Hiện SOH, Lọc MOQ
        ├─► [Điều hướng thời gian]: Xem 7 ngày / 14 ngày, Tuần này / Tuần sau, Copy tuần trước
        ├─► [Nhập ma trận]: Nhập số lượng từng ô sản phẩm x ngày giao hợp lệ
        ├─► [Import/Export]: Tải mẫu Excel, Nhập dữ liệu từ file Excel
        │
        ▼
Kiểm tra tổng tiền, số lượng vi phạm MOQ, cảnh báo hạn mức
        │
        ├─► [Nút Lưu nháp]: Lưu lại ma trận số lượng tạm thời
        └─► [Nút Gửi đơn]: Tạo đơn đặt hàng chính thức gửi Quản lý / Store Owner
```

## 2. Kiến trúc Component & Màn hình

### 2.1. File & Component mới
- **`src/features/purchase-order/pages/EmployeeOrderMatrixPage.tsx`**:
  - Quản lý state cho màn hình ma trận của nhân viên: `selectedBranchId` cố định (mặc định lấy theo branch của nhân viên đăng nhập).
  - Tái sử dụng các sub-component chuyên biệt của matrix:
    - `OrderMatrixHeader`: Hiển thị tiêu đề "Đặt hàng theo ma trận - Nhân viên chi nhánh", thông tin chi nhánh công tác, tổng số tiền, tổng sản phẩm và nút thao tác.
    - `OrderMatrixFilterBar`: Cung cấp prop `hideBranchSelect={true}` và `fixedBranchName="BR-01 - Siêu thị Mini Cầu Giấy"`.
    - `OrderMatrixTable`: Bảng ma trận dữ liệu, tính toán ô số lượng, kiểm tra vi phạm MOQ và trạng thái ngày (khóa/mở).
    - `OrderMatrixSupplierInfo`, `OrderMatrixCreditSummary`, `OrderMatrixFooter`.

### 2.2. Nâng cấp Component dùng chung
- **`OrderMatrixFilterBar.tsx`**:
  - Bổ sung props tùy chọn:
    ```typescript
    hideBranchSelect?: boolean;
    fixedBranchLabel?: string;
    ```
  - Khi `hideBranchSelect` là `true`: Không render khối `<select>` chi nhánh. Nếu có `fixedBranchLabel`, có thể render một badge nhỏ gọn để người dùng biết chi nhánh đang làm việc mà không thể thao tác đổi.
  - Các khối còn lại (NCC selector, Date Range, Category, Keyword search, Advance Filter dropdown, Week navigation, Excel buttons) co giãn linh hoạt và giữ nguyên style UI.

### 2.3. Cấu hình Routing (`src/app/router.tsx`)
- Thêm route:
  - `/employee/purchase-orders/create-matrix` -> trỏ tới `EmployeeOrderMatrixPage`.
  - Có thể thêm alias `/branch/purchase-orders/create-matrix` để linh hoạt điều hướng.

## 3. Trạng thái Giao diện (UI States)
- **Normal state**: Bảng ma trận đầy đủ các sản phẩm theo NCC đã chọn, các cột ngày giao hàng hiển thị rõ trạng thái:
  - Cột ngày mở: Nhập liệu bình thường (nền trắng).
  - Cột ngày khóa / vi phạm lead time / ngày lễ: Nền xám mờ (`#f1f5f9`), ô input bị disabled.
  - Ô có số lượng vi phạm MOQ: Hiển thị badge / border cam cảnh báo.
- **Empty state**: Khi chọn NCC không có sản phẩm hoặc tìm kiếm không khớp: Hiển thị Empty Data component với thông báo "Không tìm thấy sản phẩm phù hợp".
- **Action states**:
  - Lưu nháp thành công: Toast xanh "Đã lưu nháp kế hoạch đặt hàng thành công".
  - Gửi đơn hàng thành công: Toast xanh "Đơn đặt hàng chi nhánh đã được gửi thành công".

## 4. Dữ liệu & Mock Context
- **Branch Context**: Cố định `branchId = "BR-01"` (hoặc query param `branchId` fallback sang default branch của employee).
- **Suppliers & Products**: Dùng chung nguồn dữ liệu chuẩn hóa từ `MOCK_PO_SUPPLIERS` và `MOCK_MATRIX_PRODUCTS`.
- **Dữ liệu số lượng**: `QtyMatrixMap = Record<string, Record<string, number>>`.

## 5. Quy tắc Nghiệp vụ & Phân quyền
- **Phân quyền vai trò**:
  - Employee chỉ được xem và tạo đơn hàng cho đúng chi nhánh phụ trách.
  - Employee không được phép can thiệp vào dữ liệu đặt hàng của chi nhánh khác trong hệ thống.
- **Quy tắc đặt hàng**:
  - Lead time: Không cho phép đặt hàng vào các ngày trước `Today + leadDays`.
  - Delivery days: Chỉ cho phép đặt hàng vào các ngày NCC có lịch giao.
  - MOQ: Hiển thị cảnh báo rõ ràng nếu số lượng nhập nhỏ hơn mức đặt hàng tối thiểu của sản phẩm.

## 6. Tuân thủ UI Design System (`RULE_UI_DESIGN_SYSTEM.md`)
- Màu chủ đạo: Teal (`#0d9488` / `#0f766e`).
- Font & Typography: Sentence case (viết hoa chữ cái đầu), số liệu căn phải (`text-align: right`), mã code dạng Monospace.
- Spacing: Khoảng cách gọn gàng, padding chuẩn enterprise, độ cao dòng tối ưu để xem nhiều thông tin cùng lúc.
- Action column & buttons: Đầy đủ nhãn và icon, không bao giờ bị cắt viền màn hình.
