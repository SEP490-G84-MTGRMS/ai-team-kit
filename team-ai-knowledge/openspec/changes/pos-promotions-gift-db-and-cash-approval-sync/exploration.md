# Exploration: pos-promotions-gift-db-and-cash-approval-sync

## 1. Hiện Trạng Code Liên Quan (Current State)

1. **Khuyến mãi & Bậc thang**:
   - `MT_GRMS_FRONTEND/src/features/promotion/components/promotions/PromotionModal.tsx`:
     - Khối Mua X tặng Y (`BUY_X_GET_Y`) chỉ có `<input type="text" value={tier.giftProductName || ''} placeholder="Tên sản phẩm tặng kèm..." />`. Chưa có dropdown/search chọn sản phẩm thực tế từ kho và chưa có chọn đơn vị tính (`unit`).
   - `MT_GRMS_FRONTEND/src/features/promotion/pages/PromotionListPage.tsx`:
     - Hàm `handleSavePromo` (dòng 167–202) chỉ lấy `savedPromo.tiers[0]`, không gửi mảng `conditions` lên Backend `createPromotion` / `updatePromotion`. Toàn bộ các bậc 2, 3... bị bỏ qua, dẫn đến khi F5 trang thì các bậc sau biến mất.
   - `MT_GRMS_BACKEND/src/MT_GRMS.Application/Promotions/PromotionService.cs`:
     - Đã cài đặt sẵn xử lý `Conditions` (Create: `promo.Conditions.Add(...)`; Update: `_promotionRepository.ReplaceConditionsAsync(...)`).
2. **Kiểm soát quỹ tiền két POS**:
   - `MT_GRMS_FRONTEND/src/features/pos/pages/StorePosCashControlPage.tsx`:
     - Danh sách chi nhánh đang dùng mock cứng `AN_NHIEN_BRANCHES` (`BR-AN-01`, `BR-AN-02`...).
     - Khi chọn `ALL`, code tự ý lấy `availableBranches[0]?.id` gửi chuỗi `'BR-AN-01'` lên Backend qua `GET /api/pos/cash-movements/pending?branchId=BR-AN-01`.
   - `MT_GRMS_BACKEND/src/MT_GRMS.Api/Controllers/ShiftsController.cs`:
     - Endpoint `GET /api/pos/cash-movements/pending` nhận `[FromQuery] Guid branchId`. Khi nhận chuỗi `'BR-AN-01'` thì bind thất bại hoặc trả lỗi 400 Bad Request, khiến Frontend nhận danh sách rỗng.
     - Chưa hỗ trợ trường hợp `branchId` null hoặc Guid.Empty để lấy toàn bộ phiếu chờ duyệt của cả cửa hàng (Tenant).
3. **Mock Data trong Voucher & Tích điểm**:
   - `VoucherListPage.tsx` & `PromotionListPage.tsx`: Khởi tạo state bằng `INITIAL_*`. Khi API trả về mảng rỗng thì giữ nguyên mock data.
   - `VoucherBatchTable.tsx`: Danh sách mã code trong đợt đọc từ `batch.codes` trong RAM (vốn là `[]` khi load từ API), không tự gọi `promotionApi.getVoucherCodes(batch.id)` để lấy mã thật từ CSDL.
4. **Điều hướng POS của Nhân viên**:
   - `PosHeader.tsx`: Chỉ có nút "Về Dashboard Chủ Cửa Hàng" khi `isStoreOwner = true`. Nhân viên thu ngân không có lối thoát về Cổng nhân viên (`/employee/schedule`).

---

## 2. Giả Định (Assumptions)

- **[ASSUMPTION-01]**: CSDL đã có bảng `Promotions`, `PromotionConditions`, `ShiftCashMovements`, `StorePaymentConfigs` và `VoucherCodes`. Không cần tạo mới migration DB.
- **[ASSUMPTION-02]**: Chủ cửa hàng khi xem trang Duyệt chi két POS muốn xem được cả danh sách gộp của toàn bộ chi nhánh (`ALL`) lẫn lọc chi tiết theo từng chi nhánh cụ thể.
- **[ASSUMPTION-03]**: Sản phẩm tặng kèm trong chương trình khuyến mãi phải là sản phẩm đang kinh doanh và có sẵn trong danh mục sản phẩm của hệ thống (`/catalog` hoặc `/products`).

---

## 3. Non-Goals (Những gì không làm)

- Không thay đổi bảng CSDL hoặc tạo thêm bảng phân cấp mới.
- Không thay đổi logic thuật toán đánh giá giỏ hàng tự động `EvaluateCartAsync` trong Backend.
- Không thay đổi quy trình chốt ca POS bắt buộc giải quyết phiếu chi pending trước khi đóng ca.

---

## 4. Các Phương Án Kỹ Thuật (Options Analysis)

### Vấn đề 1: Chọn sản phẩm tặng & đơn vị tính trong Khuyến mãi
- **Phương án A**: Thêm modal popup riêng để tìm kiếm sản phẩm.
  - *Ưu điểm*: Tách biệt giao diện.
  - *Nhược điểm*: Phức tạp, nhiều tầng modal lồng nhau (modal chọn quà đè lên modal tạo khuyến mãi).
- **Phương án B (Chọn)**: Sử dụng dropdown tìm kiếm inline (Product Select Picker) có autocomplete dựa trên danh mục sản phẩm đã tải hoặc cache từ hệ thống (`productApi` hoặc danh sách sản phẩm POS). Cho phép chọn sản phẩm và đơn vị tính (baseUnit hoặc conversion unit).
  - *Ưu điểm*: Trực quan, mượt mà, thao tác nhanh trên cùng một dòng bậc thang.

### Vấn đề 2: Xử lý branchId cho trang Duyệt chi két
- **Phương án A**: Bắt buộc Chủ cửa hàng phải luôn chọn 1 chi nhánh cụ thể, xóa bỏ tùy chọn `ALL`.
  - *Ưu điểm*: Không cần sửa Backend.
  - *Nhược điểm*: Trải nghiệm kém; chủ có nhiều chi nhánh phải chuyển qua lại từng chi nhánh mới biết có phiếu đang chờ duyệt.
- **Phương án B (Chọn)**: Sửa Backend cho phép `Guid? branchId` là nullable (hoặc `Guid.Empty`). Nếu không truyền `branchId` (hoặc rỗng), Backend truy vấn tất cả các phiếu chờ duyệt của toàn bộ chi nhánh thuộc `CurrentTenantId`. Đồng thời Frontend nạp danh sách chi nhánh thật từ `branchManagementApi.getBranches()`.
  - *Ưu điểm*: Đúng chuẩn nghiệp vụ quản trị chuỗi đa chi nhánh, giải quyết triệt để lỗi không có data.

---

## 5. Phương Án Lựa Chọn & Lý Do

Chọn **Phương án B** cho cả 2 vấn đề vì:
1. Đảm bảo đúng chuẩn Clean Architecture và tính toàn vẹn dữ liệu đa tenant.
2. Nâng cao trải nghiệm người dùng, giúp chủ cửa hàng bao quát được dòng tiền két của toàn bộ chuỗi cửa hàng mà không bị sót phiếu chi vượt hạn mức.

---

## 6. Rủi Ro & Biện Pháp Giảm Thiểu

| Rủi ro | Mức độ | Biện pháp giảm thiểu |
|---|---|---|
| Khách hàng cũ có sản phẩm tặng kèm lưu dạng text | Thấp | Hỗ trợ fallback: nếu `productId` rỗng thì vẫn hiển thị `productName` chuỗi text cũ. |
| Query `ALL` chi nhánh có thể trả về nhiều bản ghi | Thấp | Giới hạn sắp xếp theo `OccurredAtUtc` giảm dần và phân trang nếu cần. |
