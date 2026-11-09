# Proposal: fix-pos-autopromo-400-and-preorder-units

## 1. Mô tả lỗi
Trong quá trình vận hành thực tế tại quầy bán hàng POS và màn hình Quản lý đơn hàng (tab Đơn đặt trước), người dùng phát hiện **2 cụm lỗi nghiêm trọng** làm gián đoạn trải nghiệm bán hàng tự động:

1. **Cụm lỗi 1 — Khuyến mãi tự động không tự áp vào đơn POS (hiện `0 đ`) & hiển thị sai trạng thái hiệu lực trên Quản lý khuyến mãi**:
   - Khi bán hàng tại chi nhánh có mã định danh dạng chuỗi (ví dụ `"BR-AN-01"`, `"BR-02"`, hoặc khách hàng vãng lai/mock không phải UUID 36 ký tự), API thẩm định giỏ hàng `POST /api/promotions/evaluate-cart` trả lỗi **`400 Bad Request`** do DTO Backend ép kiểu cứng `Guid? BranchId` / `Guid? CustomerId`, còn Frontend bắt lỗi ngầm nên dòng `Giảm giá tự động [KM]` và `Khuyến mại tự động` luôn bằng `0 đ`.
   - Trên màn hình **Quản lý khuyến mãi** (`PromotionListPage`), trạng thái chương trình chỉ xét cờ `isActive` mà bỏ qua đối chiếu `startDate` và `endDate` với thời điểm hiện tại: chương trình có ngày bắt đầu trong tương lai (`UPCOMING` — *Sắp diễn ra*) hoặc đã qua ngày kết thúc (`EXPIRED` — *Đã hết hạn*) vẫn hiển thị nhãn **Đang hoạt động (`ACTIVE`)**, gây hiểu nhầm cho chủ cửa hàng và thu ngân.
   - Trong modal **Tạo / Sửa khuyến mãi** (`PromotionModal`), ô chọn **Phạm vi áp dụng** đang đọc danh sách chi nhánh giả lập cố định (`MOCK_BRANCHES`) thay vì danh sách chi nhánh thực tế của cửa hàng (Tenant).

2. **Cụm lỗi 2 — Modal `+ Tạo đơn đặt trước` bị mất ô chọn Đơn vị quy đổi (Lốc / Thùng / Hộp) & giữ kho chưa nhân hệ số quy đổi**:
   - Khi Chủ cửa hàng mở `+ Tạo đơn đặt trước` trong lúc bộ lọc chi nhánh đang ở `Tất cả chi nhánh (ALL)` (hoặc chi nhánh mang mã `BR-...`), màn hình truyền `branchId = undefined` vào `posOrderApi.getAllProducts()`, khiến hàm rơi xuống nhánh fallback `GET /api/products` — nhánh này không trả về và không ánh xạ danh sách đơn vị quy đổi (`unitPrices`), làm toàn bộ sản phẩm bị ẩn mất ô chọn Đơn vị tính trên bảng đặt trước.
   - Ở chiều lưu đơn tại Backend (`OrderService.CreatePreOrderAsync`), khi khách đặt theo đơn vị lớn (ví dụ `1 Thùng = 12 Chai`), logic kiểm tra và trừ giữ tồn kho lô FEFO đang trừ theo số lượng đơn vị đặt (`1`) thay vì số lượng đơn vị cơ sở quy đổi (`1 × 12 = 12`), đồng thời chưa lưu lại `ProductUnitId` / `UnitName` trên chi tiết đơn đặt trước.

---

## 2. Bước tái hiện

### Kịch bản A: Tái hiện lỗi Khuyến mãi tự động `0 đ` và nhãn trạng thái sai
1. Đăng nhập tài khoản cửa hàng (ví dụ cửa hàng An Nhiên `tenant_an_nhien_02`), vào **Quản lý khuyến mãi**, kiểm tra chương trình chiết khấu đơn hàng có bậc giảm `400.000 đ -> giảm 60.000 đ` (hoặc tạo chương trình mới, quan sát dropdown Chi nhánh chỉ hiện tên chi nhánh mẫu Quận 1 / Bình Thạnh).
2. Nếu ngày bắt đầu chương trình lớn hơn ngày hiện tại của hệ thống, quan sát bảng danh sách vẫn hiện trạng thái **Đang hoạt động**.
3. Chuyển sang **Bán hàng POS** (chi nhánh hiện tại có mã `BR-AN-01` hoặc `BR-02`), thêm sản phẩm đạt tổng tiền `420.000 đ` vào giỏ hàng.
4. Quan sát mục `Giảm giá [KM]` bên cột phải và mở popup **Chiết khấu toàn đơn**.

### Kịch bản B: Tái hiện lỗi không chọn được Đơn vị quy đổi khi Tạo đơn đặt trước
1. Vào màn hình **Quản lý đơn hàng** dưới quyền Chủ cửa hàng (bộ lọc chi nhánh mặc định `Tất cả chi nhánh (Toàn chuỗi)`).
2. Bấm nút **`+ Tạo đơn đặt trước`**, tìm và chọn một sản phẩm có nhiều đơn vị tính (ví dụ Sữa tươi có đơn vị `Chai` và `Thùng (12 chai)`, hoặc Bánh Choco-Pie có `Hộp` và `Thùng`).
3. Quan sát cột **Đơn vị** của sản phẩm vừa thêm trong bảng.

---

## 3. Kết quả thực tế vs Kết quả mong đợi

| Hạng mục | Kết quả thực tế (Lỗi) | Kết quả mong đợi (Đúng) |
|---|---|---|
| Thẩm định KM tự động tại POS (`evaluate-cart`) | Request gửi `branchId: "BR-AN-01"` bị `400 Bad Request`; `Khuyến mại tự động = 0 đ`, không tự trừ tiền giảm vào hóa đơn. | `evaluate-cart` chấp nhận linh hoạt `BranchId` chuỗi/UUID (tự ánh xạ mã chi nhánh / tên chi nhánh / `ALL`) và xử lý an toàn `CustomerId`/`ProductId`; tự động trừ thẳng khuyến mãi vào đơn ngay khi thêm món mà không cần mở modal nhập tay. |
| Trạng thái hiệu lực & Chi nhánh trên Quản lý KM | Chương trình chưa tới `startDate` hoặc đã quá `endDate` vẫn hiện `ACTIVE`; modal Tạo/Sửa KM hiện chi nhánh mẫu Quận 1, Bình Thạnh. | Hiển thị chuẩn xác 4 trạng thái: `ACTIVE` (Đang chạy), `UPCOMING` (Sắp diễn ra), `EXPIRED` (Đã hết hạn), `PAUSED` (Tạm dừng); modal Tạo/Sửa KM nạp đúng danh sách chi nhánh thật của cửa hàng (kèm tùy chọn `Toàn hệ thống`). |
| Chọn Đơn vị tính trên `+ Tạo đơn đặt trước` | Cột **Đơn vị** chỉ hiện nhãn tĩnh đơn vị cơ sở (`Chai` / `Hộp`), không có dropdown chọn `Lốc` / `Thùng`. | Hiển thị đầy đủ dropdown chọn mọi đơn vị tính của sản phẩm (`Hộp`, `Lốc (x6)`, `Thùng (x24)`...), tự động cập nhật đơn giá và giới hạn tồn kho khả dụng theo hệ số quy đổi. |
| Giữ tồn kho FEFO Đơn đặt trước theo đơn vị quy đổi | Đặt `1 Thùng (x12)` chỉ trừ giữ `1` đơn vị gốc trong `BranchStock` và không lưu đơn vị đã chọn. | Kiểm tra và trừ giữ đúng `Quantity × ConversionRate` đơn vị cơ sở trên lô FEFO, lưu vết đơn vị đặt mua và hiển thị đúng đơn vị trên chi tiết Đơn đặt trước. |

---

## 4. Mức độ ảnh hưởng
- **Đối tượng ảnh hưởng**: Chủ cửa hàng (`STORE_OWNER`) và Nhân viên thu ngân (`CASHIER` / `EMPLOYEE`) trên toàn bộ các cửa hàng/chi nhánh.
- **Mức độ nghiêm trọng**: **Cao (High)** — thu ngân không nhận được mức giảm tự động tại quầy POS (phải tính nhẩm hoặc gõ tay dễ sai sót), và đơn đặt trước theo thùng/lốc bị sai lệch cả giá bán lẫn số lượng giữ kho thực tế.
- **Ảnh hưởng dữ liệu lịch sử**: Không làm hỏng dữ liệu hóa đơn hay chương trình khuyến mãi đã lưu trong CSDL (các bản ghi `Promotions` trong DB vẫn nguyên vẹn, chỉ bị hiển thị sai nhãn trạng thái hoặc bị chặn ở bước gọi API `evaluate-cart`).

---

## 5. Phạm vi (Scope)
- **Trong phạm vi (In scope)**:
  1. Nâng cấp DTO & logic `EvaluateCartAsync` / `GetActivePromotionsAsync` nhận `string? BranchId` và `string? CustomerId` an toàn (không ném `400` khi nhận mã chi nhánh như `BR-AN-01` hoặc ID khách lẻ), đối khớp linh hoạt `TargetBranches` theo cả `Branch.Id`, `Branch.BranchCode` và `"ALL"`.
  2. Chuẩn hóa gửi payload thẩm định giỏ hàng trên `PosCheckoutPage.tsx` và `CreatePreOrderModal.tsx` (kèm đồng bộ ngày địa phương `YYYY-MM-DD` khi tạo/sửa KM để tránh lệch múi giờ UTC làm lùi/tiến ngày bắt đầu).
  3. Tính toán đúng trạng thái `ACTIVE` / `UPCOMING` / `EXPIRED` / `PAUSED` trên `PromotionListPage.tsx` & `PromotionTable.tsx`, và nạp danh sách chi nhánh thật của Tenant trong `PromotionModal.tsx` & `PromotionFilterBar.tsx`.
  4. Bổ sung trả về `Units` (`ProductUnits`) trên API danh sách sản phẩm / fallback `posOrderApi.getAllProducts`, đồng thời truyền đúng chi nhánh UUID khả dụng trên `InvoiceManagementPage.tsx` để `CreatePreOrderModal.tsx` luôn có đầy đủ `unitPrices`.
  5. Cập nhật `OrderService.CreatePreOrderAsync` (và hoàn kho `CancelOrderAsync` nếu đơn đặt trước có hệ số quy đổi) tính đúng `Quantity × ConversionRate`, phân giải giá theo `UnitId` và lưu `UnitName` cho dòng đặt trước.
- **Ngoài phạm vi (Out of scope)**:
  - Không thay đổi công thức `Best-Offer` hay cơ chế Voucher / Tích điểm đã nghiệm thu.

---

## 6. Tiêu chí coi là đã sửa (Success Criteria)
1. Gọi `POST /api/promotions/evaluate-cart` với `branchId = "BR-AN-01"` (hoặc UUID chi nhánh, hoặc rỗng) và `customerId = "kh_retail"` trả HTTP `200 OK` và tính đúng tiền giảm / quà tặng tự động ngay trên cột Thanh toán POS.
2. Chương trình khuyến mãi có `startDate > hôm nay` hiển thị rõ trạng thái **Sắp diễn ra (`UPCOMING`)**, quá `endDate` hiển thị **Đã hết hạn (`EXPIRED`)**; `PromotionModal` hiển thị đúng các chi nhánh thật của cửa hàng đang đăng nhập.
3. Mở `+ Tạo đơn đặt trước` ở bất kỳ chế độ lọc chi nhánh nào (`Tất cả chi nhánh` hoặc từng chi nhánh), chọn mặt hàng có nhiều đơn vị tính đều xổ ra dropdown chọn đơn vị (`Hộp` / `Lốc` / `Thùng`) kèm đơn giá quy đổi chính xác.
4. Tạo đơn đặt trước với đơn vị quy đổi (ví dụ `2 Thùng`, hệ số `12`) trừ giữ đúng `24` đơn vị gốc trong `BranchStock` theo FEFO; khi hủy đơn đặt trước hoàn trả đúng `24` đơn vị gốc về kho.
5. Toàn bộ bộ kiểm thử tự động (`dotnet test` bao gồm regression tests tái hiện 2 cụm lỗi, `npm run build`, `npx oxlint`) đạt `100% PASS` (`0` lỗi).
