# Proposal: pos-promotions-gift-db-and-cash-approval-sync

## 1. Vấn Đề (Problem Statement)

Hiện tại hệ thống đang tồn tại 4 vấn đề kỹ thuật và trải nghiệm người dùng trong phân hệ Khuyến mại, Quỹ tiền két và Điều hướng nhân viên:
1. **Thiết lập bậc thang khuyến mãi & Quà tặng**:
   - Khi tạo chương trình khuyến mại mua sản phẩm tặng sản phẩm (hoặc chiết khấu bậc thang), giao diện chỉ cho phép nhập chuỗi tên quà tặng tự do, không cho phép tìm kiếm chọn sản phẩm thực tế từ danh mục kho hàng của cửa hàng và không có tùy chọn đơn vị tính (Unit).
   - Khi người dùng thêm các bậc thang sau (bậc 2, bậc 3...), Frontend chỉ lấy thông tin của bậc 1 gửi lên Backend mà không chuyển đổi danh sách các bậc thành `conditions`. Do đó, khi reload lại trang, các bậc sau hoàn toàn bị mất do chưa từng được lưu vào CSDL.
2. **Hiển thị phiếu chờ duyệt tại trang Hạn Mức & Duyệt Chi Két POS**:
   - Trang `StorePosCashControlPage.tsx` đang gán cứng danh sách chi nhánh dạng mock (`BR-AN-01`), gửi chuỗi string lên Backend API yêu cầu `Guid branchId`, gây lỗi bind dữ liệu và trả về danh sách rỗng.
   - Khi Chủ cửa hàng chọn xem "Toàn bộ chi nhánh" (`ALL`), hệ thống không hỗ trợ truy vấn tất cả các phiếu chờ duyệt của toàn bộ chi nhánh thuộc Tenant, khiến chủ cửa hàng không thấy bất kỳ phiếu thu chi vượt hạn mức nào để phê duyệt.
3. **Phụ thuộc Mock Data trong Voucher và Tích điểm**:
   - Các trang danh sách Khuyến mãi, Voucher và Sổ cái điểm đang khởi tạo bằng mock data (`INITIAL_*`). Khi CSDL chưa có dữ liệu hoặc trả về rỗng, giao diện vẫn hiển thị mock data thay vì trạng thái rỗng thực tế.
   - Danh sách mã voucher con trong đợt luôn hiển thị `(0 mã đã tạo)` sau khi reload trang vì Frontend không tự động gọi API `GET /api/vouchers/{id}/codes` để lấy danh sách mã thật từ CSDL.
4. **Điều hướng của Nhân viên bán hàng trên POS**:
   - Menu thao tác quầy POS chỉ có lối tắt "Về Dashboard Chủ Cửa Hàng" cho vai trò `STORE_OWNER`. Khi nhân viên thu ngân đăng nhập, họ không có nút hay đường dẫn nào để quay về Cổng nhân viên / Dashboard ca làm việc của mình.

---

## 2. Mục Tiêu (Goals)

- Cho phép người dùng tìm kiếm và chọn sản phẩm tặng kèm (kèm đơn vị tính chuẩn) từ danh mục sản phẩm của hệ thống khi cấu hình khuyến mại Mua X tặng Y / Giảm giá theo bậc.
- Lưu trữ trọn vẹn toàn bộ các bậc thang điều kiện (`Conditions`) vào CSDL khi Tạo mới và Cập nhật khuyến mãi.
- Khắc phục triệt để trang duyệt chi két POS: nạp danh sách chi nhánh thật từ CSDL, hỗ trợ lọc theo từng chi nhánh hoặc xem toàn bộ chi nhánh (`ALL`) của Tenant; hiển thị đầy đủ phiếu chờ duyệt và phiếu rút két.
- Xóa bỏ phụ thuộc mock data cho Voucher và Khuyến mại; tự động tải danh sách mã voucher con từ CSDL khi mở rộng xem chi tiết đợt.
- Bổ sung nút quay về Dashboard Nhân viên trong Menu POS và Topbar POS để nhân viên dễ dàng chuyển đổi qua lại giữa bán hàng và quản lý ca làm việc.

---

## 3. Phạm Vi (Scope)

### In-Scope:
- Cập nhật `PromotionModal.tsx`: Tích hợp tìm kiếm chọn sản phẩm thật từ kho, chọn đơn vị tính, lưu `productId`, `productRole`, `giftQty`, `discountValue`.
- Cập nhật `PromotionListPage.tsx`: Chuyển đổi toàn bộ mảng `tiers` thành `conditions` gửi lên Backend khi Tạo và Sửa khuyến mại; loại bỏ fallback mock data.
- Cập nhật Backend `ShiftsController.cs` và `ShiftRepository.cs`: Hỗ trợ `Guid? branchId` (null = xem toàn bộ chi nhánh của Tenant) cho endpoint `GET /api/pos/cash-movements/pending`.
- Cập nhật `StorePosCashControlPage.tsx`: Lấy danh sách chi nhánh thật từ `branchManagementApi.getBranches()`, gửi `branchId` chuẩn xác, hiển thị đầy đủ các phiếu chi vượt ngưỡng chờ duyệt và phiếu rút két.
- Cập nhật `VoucherListPage.tsx` & `VoucherBatchTable.tsx`: Tự động gọi API `promotionApi.getVoucherCodes(batch.id)` nạp danh sách mã voucher từ CSDL khi mở chi tiết.
- Cập nhật `PosHeader.tsx`: Bổ sung nút "Về Dashboard Nhân Viên" dẫn tới `/employee/schedule` hoặc `/pos/cashier-shift`.

### Out-of-Scope:
- Thay đổi cấu trúc bảng CSDL `Promotions` hoặc `ShiftCashMovements` (giữ nguyên schema hiện tại).
- Thay đổi logic tính toán khuyến mại tự động trong `PromotionService.EvaluateCartAsync` (đã có sẵn).

---

## 4. Người Dùng & Vai Trò (Target Users)

- **Chủ cửa hàng (Store Owner)**:
  - Cấu hình khuyến mãi bậc thang, chọn sản phẩm tặng kèm từ danh mục.
  - Xem danh sách và phê duyệt/từ chối các phiếu chi vượt hạn mức của tất cả chi nhánh hoặc từng chi nhánh.
  - Quản lý các đợt phát hành voucher và tra cứu danh sách mã code thật đã sinh.
- **Nhân viên thu ngân (Cashier / Employee)**:
  - Tạo phiếu chi tiền mặt vượt hạn mức gửi yêu cầu lên chủ cửa hàng.
  - Sử dụng nút điều hướng nhanh trên POS để quay về xem lịch làm việc, bảng chấm công hoặc dashboard ca.

---

## 5. Tiêu Chí Thành Công Đo Được (Success Criteria)

1. Tạo chương trình khuyến mại có từ 2 bậc thang trở lên, sau khi lưu và F5 reload trang, toàn bộ các bậc thang vẫn hiển thị đầy đủ từ CSDL.
2. Trong modal khuyến mãi Mua X tặng Y, người dùng chọn được sản phẩm thật từ danh mục và hiển thị đơn vị tính tương ứng.
3. Khi nhân viên tạo phiếu chi tiền vượt hạn mức, Chủ cửa hàng mở trang "Hạn Mức & Duyệt Chi Két POS" lập tức nhìn thấy phiếu ở trạng thái Chờ duyệt (cả khi chọn "Toàn bộ chi nhánh" hoặc chọn chi nhánh cụ thể).
4. Danh sách đợt voucher sau khi sinh thêm mã, reload trang và bấm mở chi tiết hiển thị đúng số lượng và danh sách mã code từ CSDL.
5. Nhân viên thu ngân trên POS bấm được nút "Về Dashboard Nhân Viên" để quay về cổng nhân viên thành công.
6. Toàn bộ Unit Tests Backend và Build Frontend đạt 100% không lỗi.
