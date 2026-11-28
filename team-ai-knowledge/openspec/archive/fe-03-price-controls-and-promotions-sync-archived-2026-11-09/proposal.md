# Proposal: fe-03-price-controls-and-promotions-sync

## 1. Vấn đề (Problem Statement)
1. **Mất các bậc thang khuyến mãi**: Trong quản lý khuyến mãi, khi tạo chiết khấu theo đơn hàng (`ORDER_DISCOUNT`) với nhiều bậc thang (ví dụ: bậc 1 đơn từ 100k giảm 5%, bậc 2 đơn từ 300k giảm 10%, bậc 3 đơn từ 500k giảm 15%), dữ liệu các bậc sau không được lưu vào CSDL do ràng buộc khóa ngoại `ProductID` trong bảng `PromotionConditions`, dẫn tới khi tải lại chỉ hiển thị 1 mức cấu hình duy nhất.
2. **Khó chọn quà tặng Mua X tặng Y**: Modal tạo mới khuyến mãi `BUY_X_GET_Y` chưa hỗ trợ chọn trực tiếp sản phẩm quà tặng từ danh mục kho hàng của cửa hàng.
3. **Lỗi ngày hiệu lực Voucher**: Khi áp dụng mã voucher vừa tạo trong ngày, hệ thống báo lỗi *"Voucher chỉ có hiệu lực từ ngày dd/MM/yyyy"* do so sánh thời gian `DateTime.UtcNow` có kèm giờ/phút thay vì so sánh theo ngày lịch dương.
4. **Thiếu kiểm soát giá bán & Lịch sử thay đổi giá (FE-03)**:
   - Hệ thống chưa có cảnh báo khi người dùng thiết lập giá bán thấp hơn giá vốn/giá nhập gần nhất (`FE-03.1 Below-Cost Warning`).
   - Chưa tự động lưu vết lịch sử biến động giá bán theo từng phạm vi: Giá bán chuẩn toàn chuỗi (Master) và Giá bán riêng từng chi nhánh (Branch) (`FE-03.2 Price Change History Tracking`).

---

## 2. Mục tiêu (Objectives)
1. **Đồng bộ khuyến mãi & Voucher**:
   - Lưu trữ trọn vẹn và nạp lại chính xác 100% tất cả các bậc thang khuyến mãi từ CSDL.
   - Cho phép chọn sản phẩm quà tặng trực tiếp từ kho hàng và tự động gán đơn vị tính chuẩn.
   - Sửa logic kiểm tra ngày hiệu lực voucher để voucher có giá trị sử dụng ngay trong ngày bắt đầu.
2. **Hiện thực hóa FE-03 (Selling Price Controls & History Tracking)**:
   - Cung cấp cơ chế cảnh báo bán dưới giá vốn khi sửa giá Master hoặc giá Chi nhánh; yêu cầu xác nhận của Chủ cửa hàng / Quản lý.
   - Tự động ghi nhận nhật ký thay đổi giá bán (giá cũ, giá mới, thời điểm, người đổi, phạm vi Master/Branch, lý do tự sinh ngầm) mà không bắt buộc người dùng phải gõ chữ thủ công gây chậm thao tác.
   - Cung cấp giao diện xem lịch sử biến động giá trực quan ngay trên trang quản lý sản phẩm.

---

## 3. Phạm vi (Scope)

### Trong phạm vi (In Scope):
- **Backend**:
  - Tạo thực thể và bảng CSDL `ProductPriceHistories` (lưu trữ: `ProductId`, `BranchId?`, `PriceScope: MASTER | BRANCH`, `OldPrice`, `NewPrice`, `CostPriceSnapshot`, `IsBelowCost`, `ManagerApprovedBy?`, `Reason`, `CreatedAt`).
  - Endpoint API tra cứu lịch sử thay đổi giá bán theo sản phẩm và chi nhánh: `GET /api/products/{id}/price-history`.
  - Logic xác thực Below-Cost Warning trong dịch vụ cập nhật giá sản phẩm (`CatalogService` & `BranchProductService`).
  - Sửa logic so sánh ngày voucher trong `PromotionService.ValidateVoucherAsync` theo Date.
  - Lưu trữ đa bậc thang khuyến mãi qua metadata `Description` hoặc cấu trúc conditions chuẩn hóa.
- **Frontend**:
  - Tích hợp Modal/Drawer xem lịch sử thay đổi giá bán kèm biến động tăng/giảm trên trang Quản lý sản phẩm Master và Sản phẩm chi nhánh.
  - Cảnh báo trực quan khi nhập giá bán < giá vốn kèm hộp xác nhận của Quản lý.
  - Cập nhật `PromotionModal.tsx` và `PromotionListPage.tsx` để chọn quà tặng từ kho và hiển thị đủ tất cả các bậc thang cấu hình.

### Ngoài phạm vi (Out of Scope):
- Tự động điều chỉnh giá bán theo thuật toán AI hoặc biến động tỷ giá ngoại tệ.
- Các quy định thuế tiêu thụ đặc biệt ngoài thuế GTGT hiện có.

---

## 4. Người dùng & Phân quyền (Roles & Personas)
- **Chủ cửa hàng (`STORE_OWNER`)**: Toàn quyền điều chỉnh giá Master, giá chi nhánh, phê duyệt bán dưới giá vốn và xem toàn bộ lịch sử biến động giá của chuỗi.
- **Quản lý chi nhánh (`BRANCH_MANAGER`)**: Được phép điều chỉnh giá bán riêng tại chi nhánh phụ trách, xác nhận bán dưới giá vốn trong phạm vi chi nhánh.
- **Thu ngân / Nhân viên bán hàng (`EMPLOYEE`)**: Áp dụng voucher khuyến mãi thành công ngay trong ngày tại quầy POS; không bị chặn oan uổng bởi lỗi ngày.

---

## 5. Tiêu chí thành công đo được (Success Criteria)
1. Tạo khuyến mãi chiết khấu đơn hàng 3 bậc thang, bấm Lưu, sau đó F5 tải lại trang hiển thị đầy đủ cả 3 bậc thang từ CSDL.
2. Tạo mới khuyến mãi Mua X tặng Y, chọn được sản phẩm quà tặng từ danh mục kho hàng.
3. Tạo voucher có ngày bắt đầu là hôm nay, áp dụng vào đơn hàng POS thành công mà không bị báo lỗi "chỉ có hiệu lực từ ngày...".
4. Sửa giá bán sản phẩm (ở trang Master hoặc Chi nhánh), hệ thống tự động ghi lại 1 dòng lịch sử biến động giá với thời gian và tài khoản sửa mà người dùng không cần gõ lý do.
5. Sửa giá bán thấp hơn giá vốn, hệ thống hiển thị cảnh báo mức độ cao và yêu cầu quyền Chủ tiệm/Quản lý xác nhận mới cho lưu.
6. Toàn bộ Backend Unit/Integration Tests và Frontend Build vượt qua 100% không lỗi.
