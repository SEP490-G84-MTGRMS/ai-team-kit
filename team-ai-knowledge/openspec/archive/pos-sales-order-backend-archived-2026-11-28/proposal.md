# Proposal: Phân Hệ Bán Hàng POS Backend & Tích Hợp Thiết Bị Phần Cứng (Máy In + Máy Quét)

## 1. Vấn Đề (Problem Statement)
- Hiện tại giao diện bán hàng POS (`MT_GRMS_FRONTEND`) đã hoàn thiện giao diện checkout đa tab, giỏ hàng, bảng chọn danh mục và panel thanh toán nhưng vẫn đang dùng dữ liệu mock (`posMockData.ts`).
- Phía Backend (`MT_GRMS_BACKEND`), `OrdersController`, `IOrderService`, và `OrderService` chỉ là khung rỗng chưa có logic nghiệp vụ xử lý tạo hóa đơn, tính tiền, giảm giá, tích/tiêu điểm và cập nhật tồn kho.
- Cửa hàng bán lẻ MT-GRMS cần kết nối máy in hóa đơn nhiệt qua cổng USB (chuẩn POS-58 / ESC-POS) để in hóa đơn 1-Click tức thì (không hiện popup trình duyệt) và máy quét mã vạch USB HID để quét thêm sản phẩm vào giỏ hàng siêu tốc.
- Backend cần tuân thủ nghiêm ngặt Clean Architecture và có bộ Unit Tests bao phủ đầy đủ các ca nghiệp vụ bán hàng.

## 2. Mục Tiêu (Objectives)
- Xây dựng hoàn chỉnh luồng nghiệp vụ Bán hàng POS phía Backend từ API Controller, Application Service, DTOs, Repository/DbContext đến Domain Entity.
- Hiện thực hóa dịch vụ in nhiệt 1-Click trực tiếp qua Windows Spooler (`winspool.drv` với kiểu dữ liệu `RAW` và lệnh nhị phân ESC/POS khổ 58mm).
- Cung cấp API quét/tra cứu mã vạch và tích hợp React Hook tự động lắng nghe máy quét mã vạch USB trên Frontend.
- Tích hợp kết nối Frontend POS với Backend API (thanh toán tiền mặt, chuyển khoản VietQR, bán nợ ghi sổ).
- Viết bộ Unit Tests toàn diện đạt 100% test case pass cho toàn bộ luồng bán hàng POS.

## 3. Phạm Vi (Scope)

### In-Scope:
1. **Backend POS Services & APIs (`MT_GRMS_BACKEND`)**:
   - `POST /api/orders`: Tạo mới hóa đơn bán hàng POS (tính thành tiền, chiết khấu dòng, chiết khấu đơn, thuế VAT, điểm thưởng, ghi nhận thanh toán tiền mặt/VietQR/nợ).
   - `GET /api/orders/{id}`: Xem chi tiết hóa đơn.
   - `GET /api/orders`: Danh sách hóa đơn có phân trang, lọc theo chi nhánh, ngày, trạng thái thanh toán.
   - `GET /api/products/barcode/{barcode}`: Tra cứu thông tin sản phẩm và đơn vị quy đổi theo mã vạch.
   - `POST /api/orders/{id}/print`: Kích hoạt lệnh in hóa đơn nhiệt 1-Click xuống máy in POS-58 kết nối USB.
2. **Hardware Integration (`Infrastructure & Frontend`)**:
   - `RawPrinterHelper` & `ThermalPrintService`: Sinh byte ESC/POS khổ 58mm, căn chỉnh độ rộng 32 ký tự, xử lý số tiền lớn và gọi P/Invoke `winspool.drv`.
   - `useBarcodeScanner.ts` trên Frontend: Hook tự động phát hiện chuỗi ký tự gõ siêu tốc (<50ms) từ máy quét USB HID và tự động thêm vào giỏ hàng.
3. **Frontend Integration (`MT_GRMS_FRONTEND`)**:
   - Kết nối `PosCheckoutPage` gọi API tạo đơn hàng thực tế thay vì mock data.
   - Tích hợp nút in hóa đơn 1-Click gọi API backend.
4. **Unit Tests**:
   - Viết bộ Unit Tests (xUnit + FluentAssertions + Moq) kiểm thử toàn bộ logic tính toán tiền hàng, chiết khấu, hạn mức nợ, tích điểm, và validation.

### Out-of-Scope:
- Cấu hình mạng máy in qua LAN / Wi-Fi (chỉ tập trung cổng USB Win32 Spooler theo tài liệu kiểm thử).
- Tích hợp cổng thanh toán trực tuyến tự động webhook của ngân hàng (chỉ hỗ trợ mã VietQR tĩnh/động hiển thị cho thu ngân đối soát).

## 4. Người Dùng & Phân Quyền (User Roles)
- **Thu ngân (Cashier)**: Tạo đơn, quét mã vạch, áp dụng khuyến mãi, nhận tiền, in hóa đơn.
- **Quản lý / Chủ cửa hàng (Store Owner / Manager)**: Xem lịch sử hóa đơn, xem báo cáo doanh thu, xử lý nợ khách hàng.

## 5. Tiêu Chí Thành Công (Acceptance Criteria)
1. Backend biên dịch `0 error, 0 warning`.
2. Tạo đơn hàng POS thành công qua API, lưu đầy đủ `Orders` và `OrderDetails` vào cơ sở dữ liệu.
3. Lệnh in `/api/orders/{id}/print` bắn thẳng byte RAW xuống máy in `POS-58` không xuất hiện hộp thoại Print Preview.
4. Quét mã vạch trên giao diện POS tự động tìm thấy mặt hàng và cộng dồn số lượng vào giỏ hàng.
5. Unit Tests bao phủ đầy đủ kịch bản (Success, Validation Error, Out of stock, Debt limit check, Point redemption) và pass 100%.
