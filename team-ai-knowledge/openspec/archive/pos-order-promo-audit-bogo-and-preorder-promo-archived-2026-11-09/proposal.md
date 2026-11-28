# Proposal: Ghi vết chi tiết Khuyến mãi & Voucher vào Quản lý đơn hàng, hoàn thiện Mua X tặng Y và tự động áp Khuyến mãi cho Đơn đặt trước

## 1. Vấn đề hiện tại
1. **Thiếu vết chi tiết Khuyến mãi & Voucher trên Quản lý đơn hàng và Ngân sách KM:**
   - Khi thanh toán tại quầy POS, hóa đơn chỉ lưu một con số tổng tiền giảm giá gộp chung, chưa lưu tách biệt tên/mã chương trình Khuyến mãi đã áp dụng, mã Voucher đã dùng hay số tiền quy đổi từ Điểm thưởng. Thu ngân và Chủ cửa hàng khi mở xem chi tiết hóa đơn hoặc in lại bill không đối soát được nguồn giảm giá.
   - Các chương trình Khuyến mãi tự động và Đợt phát hành Voucher chưa tự động cộng tăng số lượt sử dụng (`UsedCount`) và tổng ngân sách đã chi (`TotalDiscountGiven`) sau mỗi đơn hàng thanh toán thành công.
2. **Luồng Mua sản phẩm tặng sản phẩm (`BUY_X_GET_Y`) chưa khép kín từ tạo KM → trừ kho → lên đơn → đổi trả:**
   - Giao diện cấu hình khuyến mãi `Mua X tặng Y` hiện mới chọn sản phẩm tặng (Y) mà thiếu chọn sản phẩm cần mua (X), khiến điều kiện kích hoạt tại POS không khớp thực tế.
   - Trên POS, quà tặng mới chỉ hiển thị tạm ở bảng tính tiền: chưa đẩy thành dòng hàng tặng `0 đ` trong đơn hàng & phiếu in, chưa trừ tồn kho theo lô FEFO cho món quà tặng, và chưa đưa vào cơ chế chống chồng chéo khuyến mãi (`Best-Offer` — dẫn đến khách vừa được giảm tiền hóa đơn vừa được nhận quà tặng).
   - Khi **Đổi/Trả hàng**, hệ thống chưa phân biệt dòng hàng mua thật với dòng quà tặng `0 đ` (cùng hoặc khác mã sản phẩm), tiềm ẩn rủi ro hoàn nhầm tiền mặt cho sản phẩm được tặng miễn phí.
3. **Đơn đặt trước (`Đơn đặt trước & Giữ kho`) chưa được hưởng Khuyến mãi tự động:**
   - Khi tạo đơn đặt trước tại quầy, hệ thống đang tính nguyên giá bán gốc (`số lượng × đơn giá`), chưa tự động áp dụng chương trình khuyến mãi đang chạy (giảm tiền hoặc giữ kho quà tặng kèm theo) để chốt cứng giá cuối, tiền cọc tối thiểu `10%` và số tiền còn phải thu.

## 2. Mục tiêu
- **Minh bạch hóa lịch sử ưu đãi đơn hàng & ngân sách:** Mọi đơn hàng có áp dụng Khuyến mãi, Voucher hoặc Điểm thưởng đều lưu vết rõ ràng và hiển thị trực quan trong **Quản lý đơn hàng** (danh sách, chi tiết mở rộng, phiếu in K80/POS-58), đồng thời cập nhật tức thời lượt dùng & ngân sách đã chi của chương trình Khuyến mãi/Voucher.
- **Hoàn thiện trọn gói `Mua X tặng Y` (`BUY_X_GET_Y`):** Hỗ trợ chọn rõ sản phẩm mua (X) và sản phẩm tặng (Y); quy đổi giá trị quà tặng để xét chống xung đột `Best-Offer` công bằng với các khuyến mãi giảm tiền; tự động ghi dòng quà tặng `0 đ` vào đơn hàng, trừ kho lô FEFO an toàn (cảnh báo linh hoạt nếu kho thiếu quà mà không làm kẹt đơn mua chính) và chặn hoàn tiền mặt cho dòng hàng tặng khi đổi/trả.
- **Đồng bộ Khuyến mãi tự động sang Đơn đặt trước:** Tự động tính và chốt ưu đãi chương trình Khuyến mãi (giảm giá tiền hoặc trích giữ kho FEFO quà tặng `0 đ`) ngay thời điểm tạo Đơn đặt trước, tính chuẩn tiền cọc tối thiểu `10%` và số tiền còn phải thu trên giá sau khuyến mãi.

## 3. Phạm vi (Scope)

### Trong phạm vi (In Scope)
- **Ghi vết Khuyến mãi / Voucher / Điểm thưởng trên Đơn hàng & Quản lý đơn hàng:**
  - Lưu trữ và trả về thông tin ưu đãi chi tiết trên đơn hàng (mã/tên chương trình KM, mã Voucher, tiền giảm từ KM, tiền giảm từ Voucher, tiền giảm từ Điểm thưởng).
  - Hiển thị nhãn & phân rã chi tiết giảm giá trong màn hình **Quản lý đơn hàng** (cả bảng, phần mở rộng chi tiết hóa đơn và bản xem trước/in hóa đơn K80 & POS-58).
  - Tự động cộng dồn `UsedCount` và `TotalDiscountGiven` cho chương trình Khuyến mãi / Đợt phát hành Voucher khi tạo đơn thành công (và hoàn trả tương ứng nếu hủy đơn).
- **Hoàn thiện luồng `Mua X tặng Y` (`BUY_X_GET_Y`):**
  - Bổ sung chọn **Sản phẩm mua (X)** (hoặc áp dụng cho sản phẩm chỉ định theo bậc) trong màn hình tạo/sửa Khuyến mãi `Mua X tặng Y` và đồng bộ đánh giá điều kiện tại Backend.
  - Đưa giá trị quy đổi của quà tặng (`số lượng tặng × giá bán sản phẩm tặng`) vào bộ giải quyết xung đột **Best-Offer** (không cộng dồn nhiều chương trình KM tự động trên cùng 1 đơn).
  - Tự động ghi nhận dòng sản phẩm quà tặng thành chi tiết đơn hàng riêng biệt giá thu khách `0 đ` (nhãn `[Quà tặng KM]`), trừ tồn kho lô FEFO thực tế; nếu tồn kho quà tặng không đủ thì cấp phát tối đa số lượng còn tồn kèm thông báo rõ cho thu ngân, không chặn thanh toán đơn chính.
  - Cập nhật luồng **Đổi/Trả hàng** tách dòng theo từng chi tiết hóa đơn: dòng quà tặng có giá trị hoàn tiền bằng `0 đ` (chỉ thu hồi nhập kho khi trả hàng, tuyệt đối không hoàn tiền mặt).
- **Tự động áp dụng Khuyến mãi cho Đơn đặt trước (`Pre-Order`):**
  - Trên modal **Tạo đơn đặt trước** và API tạo đơn đặt trước: tự động thẩm định giỏ hàng để trừ khuyến mãi chương trình hoặc kèm dòng giữ kho FEFO quà tặng `0 đ` ngay lúc đặt cọc.
  - Tính tiền cọc tối thiểu `10%` và hiển thị chính xác `Tổng tiền sau KM` / `Tiền cọc` / `Còn phải thu` trên danh sách **Đơn đặt trước & Giữ kho** (đồng bộ cả mã trạng thái đơn đặt trước giữa Backend và Frontend).
  - **Không** cho phép nhập mã Voucher dùng 1 lần trên Đơn đặt trước (Voucher chỉ áp dụng cho đơn mua thanh toán ngay tại quầy POS).

### Ngoài phạm vi (Out of Scope)
- Áp dụng mã Voucher dùng 1 lần hoặc tiêu Điểm thưởng trên Đơn đặt trước.
- Cộng dồn nhiều chương trình khuyến mãi tự động khác nhau trên cùng một hóa đơn.
- Thay đổi công thức tích điểm thành viên hiện hành hay quy trình phê duyệt hạn mức két tiền mặt.

## 4. Người dùng & Vai trò liên quan
- **Chủ cửa hàng (`STORE_OWNER`):** Thiết lập chương trình `Mua X tặng Y` / chiết khấu, theo dõi tiến độ sử dụng ngân sách khuyến mãi và kiểm tra chi tiết ưu đãi trên từng hóa đơn bán lẻ / đơn đặt trước / đơn đổi trả.
- **Quản lý chi nhánh (`BRANCH_MANAGER`) & Thu ngân (`CASHIER` / `STAFF`):** Bán hàng tại POS, tạo & tất toán Đơn đặt trước, in hóa đơn và xử lý Đổi/Trả hàng chính xác mà không sợ lệch tồn kho quà tặng hay hoàn nhầm tiền.
- **Khách hàng mua lẻ & đặt trước:** Nhận đầy đủ ưu đãi tốt nhất (`Best-Offer`), minh bạch trên phiếu in hóa đơn và được giữ chắc giá khuyến mãi / quà tặng khi đặt cọc trước.

## 5. Tiêu chí thành công đo được
1. **100% hóa đơn có ưu đãi** tạo mới từ POS hiển thị rõ nguồn giảm giá (tên/mã KM, mã Voucher, giảm Điểm thưởng) trong chi tiết **Quản lý đơn hàng** và trên mẫu in bill; đồng thời `UsedCount` & `TotalDiscountGiven` của chương trình KM / đợt Voucher tăng đúng sau khi thanh toán.
2. **100% đơn đủ điều kiện `Mua X tặng Y`** (khi là phương án `Best-Offer` thắng cuộc) tự động sinh dòng hàng tặng `0 đ` trong đơn hàng, trừ đúng số lượng tồn kho FEFO của sản phẩm tặng, không bị tính tiền khách, và khi mở **Đổi/Trả hàng** dòng quà tặng hiển thị mức tiền hoàn = `0 đ`.
3. Khi tồn kho của sản phẩm quà tặng bằng `0` hoặc ít hơn mức tặng chuẩn, đơn hàng mua chính **vẫn thanh toán thành công** với số lượng quà thực cấp tương ứng tồn kho còn lại (kèm thông báo rõ cho thu ngân).
4. Khi tạo **Đơn đặt trước**, hệ thống tự động tính & hiển thị mức giảm giá khuyến mãi / quà tặng giữ kho ngay trên modal đặt cọc, tính mốc cọc tối thiểu `10%` theo tổng tiền sau khuyến mãi và đồng bộ đúng số tiền `Còn phải thu` ở tab **Đơn đặt trước & Giữ kho** (không có ô nhập Voucher).
