# EXP-2026-11-05-POS: Khám phá nguyên nhân và giải pháp cho Bố cục in nhiệt, Thu ngân động và Đơn vị đặt trước

## 1. Problem Statement
1. Hóa đơn in nhiệt POS-58 (Font B 40 cột) bị lệch và chèn đè dòng số liệu khi tên sản phẩm dài vượt quá 18 ký tự.
2. Tên người tạo/thu ngân trên hóa đơn in nhiệt và trang Quản lý hóa đơn bị gán cứng ("Thu ngan", "Nguyễn Bá Sơn (NV004)") thay vì hiển thị động theo người dùng đăng nhập hoặc vai trò Chủ cửa hàng.
3. Modal tạo đơn đặt trước giữ kho (`CreatePreOrderModal.tsx`) chưa hỗ trợ chọn đơn vị quy đổi (thùng, lốc, hộp, kg, tấn) và backend chưa tính tỷ lệ quy đổi khi giữ tồn kho.

## 2. Context & Root Cause Analysis

### A. Lệch/chèn dòng in hóa đơn nhiệt POS-58
- **File**: `MT_GRMS_BACKEND/src/MT_GRMS.Infrastructure/Services/Printer/ThermalPrintService.cs` (dòng 83-107).
- **Nguyên nhân**:
  - Dòng tiêu đề bảng định nghĩa 4 cột: `Hang hoa (18) + SL (4) + Don gia (9) + T.Tien (9) = 40`.
  - Khi render sản phẩm, tên sản phẩm được ngắt dòng với `LineWidth = 40`, sau đó dòng tiếp theo thụt lề 18 ký tự trống `new string(' ', 18) + qtyStr + unitPriceStr + lineTotalStr`.
  - Trên giấy in nhiệt 58mm (vùng in 43mm), việc cố định 18 ký tự trống khiến các số liệu không khớp với tiêu đề cột khi tên dài rớt 2-3 dòng, mắt người nhìn vào thấy số liệu đè hoặc chen chúc với dòng hàng tiếp theo.
- **Phương án chuẩn**:
  Áp dụng layout 2 dòng chuẩn bán lẻ siêu thị mini:
  - Dòng 1: `{stt}. {TenSanPham}` (ngắt dòng trọn chữ, dòng cuốn thụt lề 3 khoảng trắng).
  - Dòng 2: `   {SL} x {DonGia}` căn trái, `{ThanhTien}` căn phải sát lề 40.
  - Tiêu đề bảng: `Ten hang / SL x Don gia` (trái) và `Thanh tien` (phải).

### B. Thu ngân & Người tạo đơn cứng
- **File**:
  - `ThermalPrintService.cs` dòng 65: `string cashier = "Thu ngan";`.
  - `InvoiceManagementPage.tsx` dòng 125, 333: `cashierName: 'Thu ngân quầy'`, dòng 656: `NV: Nguyễn Bá Sơn (NV004)`.
  - `OrdersController.cs` & `OrderDtos.cs`: Chưa truyền `CashierName` trong `PrintOrderRequest` và `OrderCreateRequest`.
- **Nguyên nhân**: Dữ liệu mockup và fallback tạm thời chưa được kết nối với session đăng nhập `useAuthStore` của Frontend và thông tin `CashierName` trong Backend DTO.

### C. Đơn vị tính trong Đặt trước
- **File**:
  - Frontend: `CreatePreOrderModal.tsx` và `InvoiceManagementPage.tsx`.
  - Backend: `MT_GRMS_BACKEND/src/MT_GRMS.Application/PosOrders/OrderService.cs` (phương thức `CreatePreOrderAsync`).
- **Nguyên nhân**:
  - `CreatePreOrderModal.tsx` chỉ quản lý `quantity` và `basePrice`, không lưu `unitId`, `unitName`, `conversionRate`.
  - Backend `CreatePreOrderAsync` lấy `item.Quantity` trực tiếp đem so sánh và trừ vào `stock.QuantityOnHand` mà không nhân với `conversionRate` của đơn vị quy đổi (khác với `CreateOrderAsync` đã có xử lý `rate`).

## 3. Constraints
- Khổ in nhiệt POS-58 cố định 40 ký tự (Font B ESC/POS). Bắt buộc tuân thủ không vượt quá 40 ký tự để không bị máy in tự ngắt dòng vật lý.
- Tương thích ngược: Các hóa đơn cũ hoặc request không có `UnitId` vẫn hoạt động bình thường với đơn vị cơ bản (`conversionRate = 1`).

## 4. Assumptions
- **[ASSUMPTION-01]**: Khi người dùng có role `STORE_OWNER` hoặc `Owner`, nhãn hiển thị là `Chủ cửa hàng: [Tên]`. Khi là nhân viên thu ngân (`STAFF` / `CASHIER`), hiển thị `[Tên nhân viên]`.
- **[ASSUMPTION-02]**: Tồn kho khả dụng trong DB (`QuantityOnHand`) luôn được lưu theo đơn vị cơ bản (BaseUnit). Khi chọn đơn vị quy đổi (ví dụ: Thùng = 24), số lượng tối đa có thể đặt là `Math.floor(quantityOnHand / conversionRate)`.

## 5. Scope & Non-Goals
### In Scope
- Cập nhật layout in mặt hàng trong `ThermalPrintService.cs` sang 2 dòng chuẩn siêu thị mini.
- Bổ sung tham số `cashierName` vào `PrintOrderRequest`, `IThermalPrintService` và `ThermalPrintService`.
- Cập nhật hiển thị người tạo/thu ngân động trong `InvoiceManagementPage.tsx` và `PosCheckoutPage.tsx`.
- Thêm dropdown chọn đơn vị đóng gói vào `CreatePreOrderModal.tsx`, cập nhật tính giá và kiểm tra tồn kho.
- Cập nhật `CreatePreOrderAsync` trong `OrderService.cs` hỗ trợ quy đổi `rate` theo đơn vị đã chọn.

### Out of Scope (Non-Goals)
- Không thay đổi cấu trúc bảng cơ sở dữ liệu `Orders` hay `OrderDetails` (dùng các cột hiện có).
- Không can thiệp vào máy in A4/A5 (chỉ tập trung máy in nhiệt POS-58).

## 6. Success Criteria
1. Hóa đơn in POS-58 không còn tình trạng chèn đè chữ hay xô lệch số liệu khi sản phẩm tên dài.
2. Toàn bộ vị trí thu ngân/người tạo hiển thị đúng theo người dùng đăng nhập hiện tại.
3. Modal tạo đơn đặt trước cho phép chọn Thùng/Lốc/Hộp/Kg/Tấn, tính đúng thành tiền và giữ kho đúng số lượng quy đổi.
4. Toàn bộ unit tests và frontend build PASS 100%.
