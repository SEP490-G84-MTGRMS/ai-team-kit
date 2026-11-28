# Proposal: pos-bank-cashbook-promo-conflict-and-ui-polish

## Vấn đề & Mô tả lỗi

Hệ thống bán hàng POS, Khuyến mãi và Quản lý sản phẩm của MT-GRMS đang gặp 5 lỗi nghiệp vụ và bất cập giao diện ảnh hưởng trực tiếp đến thao tác thu ngân và chủ cửa hàng:

1. **Lỗi chặn thanh toán chuyển khoản tại POS (`"Lỗi tạo đơn hàng: Không tìm thấy tài khoản quỹ."`)**:
   - **Bước tái hiện**: Mở ca bán hàng POS mới (hệ thống tự tạo tài khoản két tiền mặt `Till`), thêm sản phẩm vào giỏ, chọn phương thức thanh toán **Chuyển khoản VietQR** và bấm hoàn tất đơn hàng.
   - **Thực tế vs Mong đợi**: Hệ thống báo lỗi *"Lỗi tạo đơn hàng: Không tìm thấy tài khoản quỹ."* và hủy đơn hàng (do đã có 1 tài khoản `Till` nên hàm khởi tạo quỹ bỏ qua việc tạo tài khoản `Bank` cho Tenant hiện tại, rơi về ID mặc định không tồn tại). Mong đợi: Tự động ghi nhận doanh thu vào tài khoản quỹ Ngân hàng hợp lệ của cửa hàng và tạo đơn thành công.
2. **Khuyến mãi tự động `[KM]` không tự trừ tiền vào hóa đơn & chưa khử xung đột (Promotion Conflict)**:
   - **Bước tái hiện**: Tạo chương trình khuyến mãi chiết khấu đơn hàng (1 bậc hoặc nhiều bậc thang), thêm hàng đủ điều kiện vào giỏ POS.
   - **Thực tế vs Mong đợi**: Màn hình thanh toán hiển thị dòng `🎁 Tên chương trình (-X đ)` bên dưới `Giảm giá (0%) [KM]:`, nhưng cột tiền giảm vẫn là `-0 đ` và tổng khách cần trả không hề được trừ. Đồng thời khi có nhiều chương trình `ORDER_DISCOUNT` hoặc chương trình nhiều bậc thang, hệ thống chưa tự chọn bậc cao nhất / ưu đãi lợi nhất (Best-Offer) để chống cộng dồn chồng chéo. Mong đợi: Hệ thống tự động giải quyết conflict (chọn bậc cao nhất của từng chương trình, chọn 1 chương trình giảm đơn hàng có lợi nhất khi trùng lặp) và **tự động trừ thẳng số tiền khuyến mãi vào hóa đơn**.
3. **Giao diện Modal Lịch sử giá bị vỡ bố cục & còn sót mã kỹ thuật `FE-03`**:
   - **Bước tái hiện**: Mở chỉnh sửa sản phẩm (Master hoặc Chi nhánh) -> bấm nút **Lịch sử giá** hoặc nhập giá bán thấp hơn giá vốn.
   - **Thực tế vs Mong đợi**: Modal lịch sử giá bị mất viền chuẩn, nút `X` và `Đóng` hiện khung mặc định trình duyệt, badge tên chi nhánh đè lên chữ do dùng class Tailwind không tương thích với hệ thống CSS hiện tại; tiêu đề và cảnh báo hiển thị mã kỹ thuật `(FE-03.1)` / `(FE-03.2)`. Mong đợi: Giao diện modal lịch sử giá đồng bộ thẩm mỹ với toàn bộ modal sản phẩm, câu chữ nghiệp vụ tự nhiên không chứa mã `FE-03`.
4. **Nút `← Về Dashboard` hiển thị thừa bên ngoài thanh POS Header**:
   - **Bước tái hiện**: Đăng nhập tài khoản Nhân viên và vào màn hình bán hàng POS.
   - **Thực tế vs Mong đợi**: Trên thanh Topbar xuất hiện nút `← Về Dashboard` nằm lộ thiên cạnh tên nhân viên trong khi bên trong menu `☰ Thao tác` ngay kế bên đã có sẵn mục *Về Dashboard Nhân Viên*. Mong đợi: Ẩn/xóa nút bên ngoài Topbar, gom gọn trong menu `☰ Thao tác` nhất quán với Chủ cửa hàng.
5. **Ba mục điều hướng phụ bị thừa trên thanh menu Khuyến mãi**:
   - **Bước tái hiện**: Mở menu **Khuyến mãi** trên thanh điều hướng Chủ cửa hàng (`AppTopNav`).
   - **Thực tế vs Mong đợi**: Hiển thị 3 nút phụ dư thừa (*Khuyến mãi theo khung giờ*, *Phát hành mã quà tặng*, *Hạng thành viên & Chiết khấu*) chỉ trỏ lặp lại các trang hiện có. Mong đợi: Xóa bỏ 3 nút thừa này, giữ menu tinh gọn đúng chức năng thực tế.

## Mức độ ảnh hưởng

- **Mức độ**: **High (Nghiêm trọng)** — Lỗi số 1 chặn hoàn toàn luồng bán hàng chuyển khoản/VietQR cho các cửa hàng mở ca mới; lỗi số 2 làm sai lệch số tiền khách phải trả khi có chương trình khuyến mãi tự động.
- **Tính toàn vẹn dữ liệu**: Đơn hàng chuyển khoản bị rollback an toàn nên chưa làm hỏng sổ cái cũ, nhưng ngăn cản phát sinh giao dịch mới.

## Mục tiêu

- Khắc phục triệt để lỗi thiếu tài khoản quỹ Ngân hàng khi thanh toán chuyển khoản trên POS đa Tenant.
- Tự động giải quyết xung đột khuyến mãi (Best-Offer & Multi-tier evaluation) và tự động khấu trừ tiền khuyến mãi vào hóa đơn POS.
- Chuẩn hóa giao diện Modal Lịch sử giá, loại bỏ nhãn kỹ thuật `FE-03`, dọn gọn nút điều hướng thừa trên POS Header và menu Khuyến mãi.

## Phạm vi

- **In scope**:
  - Backend `CashbookService` & `OrderService`: Tự động lấy hoặc khởi tạo tài khoản `FinanceAccountType.Bank` theo Tenant (đồng bộ thông tin từ `StorePaymentConfig` nếu có) khi thu tiền đơn POS chuyển khoản.
  - Backend `PromotionService.EvaluateCartAsync`: Đọc bậc thang `[TIERS_JSON]` để áp dụng bậc cao nhất thỏa điều kiện; giải quyết conflict giữa các chương trình `ORDER_DISCOUNT` theo nguyên tắc **Best-Offer** (chọn 1 ưu đãi giảm nhiều nhất, không cộng dồn chồng chéo).
  - Frontend `PosCheckoutPage`, `PosPaymentPanel`, `OrderDiscountModal`: Tự động trừ tiền khuyến mãi tự động (`autoPromoDiscount`) vào tổng thanh toán, xử lý ưu tiên không cộng trùng với chiết khấu tay của thu ngân, tôn trọng cờ `allowPointsWithPromotions`.
  - Frontend `PriceHistoryModal`, `ProductFormModal`, `EditStoreProductModal`: Thiết kế lại UI `PriceHistoryModal` bằng hệ thống CSS/inline-style chuẩn và xóa mọi chuỗi `FE-03` / `FE-03.1` / `FE-03.2`.
  - Frontend `PosHeader` & `AppTopNav`: Xóa nút `← Về Dashboard` bên ngoài Topbar POS và xóa 3 sub-item thừa trong menu Khuyến mãi.
- **Out of scope**:
  - Thay đổi cổng webhook SePay hoặc cấu trúc bảng kế toán thuế TT152.

## Người dùng liên quan

- **Thu ngân / Nhân viên bán hàng (`EMPLOYEE` / `CASHIER`)**: Thanh toán đơn chuyển khoản mượt mà, thấy tiền khuyến mãi tự động trừ ngay trên hóa đơn, giao diện POS Topbar gọn gàng.
- **Chủ cửa hàng / Quản lý chi nhánh (`STORE_OWNER` / `BRANCH_MANAGER`)**: Xem lịch sử biến động giá trực quan, menu Khuyến mãi tinh gọn, kiểm soát chính xác ngân sách khuyến mãi không bị cộng dồn sai.

## Tiêu chí thành công

- [ ] Thanh toán đơn hàng POS bằng phương thức Chuyển khoản (`BANK` / `VietQR`) thành công 100% ở mọi chi nhánh/Tenant (kể cả khi chưa từng vào trang Sổ quỹ), ghi nhận đúng bút toán thu vào quỹ Ngân hàng.
- [ ] Khi giỏ hàng POS thỏa mãn chương trình khuyến mãi (kể cả bậc 2, bậc 3), hệ thống tự động chọn mức ưu đãi tốt nhất (chống conflict cộng dồn) và **tự động trừ thẳng số tiền giảm vào `Khách cần trả`**, hiển thị số tiền giảm thực tế trên dòng `Giảm giá [KM]`.
- [ ] `PriceHistoryModal` hiển thị sắc nét, cân đối, đồng bộ thiết kế với `EditStoreProductModal` / `ProductFormModal`, không còn bất kỳ chữ `FE-03`, `FE-03.1`, `FE-03.2` nào trên toàn giao diện.
- [ ] Không còn nút `← Về Dashboard` bên ngoài trên thanh POS Header (vẫn hoạt động bình thường trong menu `☰ Thao tác`).
- [ ] Không còn 3 nút *Khuyến mãi theo khung giờ*, *Phát hành mã quà tặng*, *Hạng thành viên & Chiết khấu* trong `AppTopNav`.
- [ ] `dotnet test MT_GRMS_BACKEND.sln` đạt 100% PASS và `npm --prefix MT_GRMS_FRONTEND run build` đạt 0 lỗi biên dịch.
