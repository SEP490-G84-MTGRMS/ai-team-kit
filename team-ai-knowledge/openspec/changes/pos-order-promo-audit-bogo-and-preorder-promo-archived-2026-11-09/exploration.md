---
id: EXP-2026-11-09-001
title: Khám phá luồng ghi vết Khuyến mãi/Voucher trên Quản lý đơn hàng, Mua X tặng Y khép kín và Khuyến mãi tự động cho Đơn đặt trước
project: MT-GRMS
capability: pos-sales-order
date: 2026-11-09
status: active
---

# EXP-2026-11-09-001: Ghi vết Khuyến mãi/Voucher vào Quản lý đơn hàng, hoàn thiện Mua X tặng Y và áp Khuyến mãi tự động cho Đơn đặt trước

## 1. Problem Statement
Hiện tại phân hệ Bán hàng POS (`pos-sales-order`) và Khuyến mãi (`promotions-and-loyalty`) của MT-GRMS đang tồn tại 3 đứt gãy nghiệp vụ liên thông:
1. **Mất dấu vết nguồn giảm giá & chưa cập nhật ngân sách sau thanh toán:** Hóa đơn lưu xuống bảng `Orders` chỉ có tổng `DiscountAmount` gộp chung (KM tự động + Voucher + Điểm thưởng), thuộc tính `Note` trên entity `Order` đang bị đánh dấu `[NotMapped]` nên không lưu xuống CSDL. Do đó, màn **Quản lý đơn hàng** (`InvoiceManagementPage.tsx`) và mẫu in lại hóa đơn không thể cho biết đơn hàng đã dùng chương trình KM hay mã Voucher nào; đồng thời bảng `Promotions` chưa được cộng tăng `UsedCount` và `TotalDiscountGiven` sau khi đơn hoàn tất.
2. **Luồng `Mua X tặng Y` (`BUY_X_GET_Y`) bị đứt đoạn từ cấu hình đến xuất kho và đổi trả:**
   - Trên màn tạo khuyến mãi (`PromotionModal.tsx` / `PromotionListPage.tsx`), loại `BUY_X_GET_Y` mới lưu sản phẩm tặng (`productRole = "GIFT"`) mà thiếu sản phẩm cần mua (`productRole = "BUY"`), khiến hàm thẩm định `EvaluateCartAsync` không kích hoạt được các chương trình tạo từ UI.
   - Trên POS (`PosCheckoutPage.tsx`), danh sách `giftItems` trả về từ `EvaluateCartAsync` mới chỉ hiển thị ở khung tính tiền mà không được gửi kèm khi tạo đơn: không sinh dòng hàng tặng `0 đ`, không trừ tồn kho lô FEFO cho quà tặng, không được quy đổi giá trị để xét chống chồng chéo `Best-Offer`, và ở luồng **Đổi/Trả hàng** (`ReturnExchangeModal.tsx` & `ProcessReturnExchangeAsync`) đang gom theo `ProductId` nhân `UnitPrice` nên nếu có dòng quà tặng dễ dẫn tới hoàn nhầm tiền mặt cho hàng tặng miễn phí.
3. **Đơn đặt trước (`Pre-Order`) chưa hưởng Khuyến mãi tự động & lệch hiển thị trạng thái:** Modal `CreatePreOrderModal.tsx` và `OrderService.CreatePreOrderAsync` mới tính nguyên giá gốc (`số lượng × đơn giá`), chưa tự động thẩm định khuyến mãi chương trình (giảm giá tiền hoặc trích giữ kho quà tặng `0 đ`), làm tiền cọc tối thiểu `10%` và số tiền còn phải thu chưa phản ánh ưu đãi; ngoài ra Frontend đang lọc lệch trạng thái `PendingPickup` và lấy `totalAmount` thay vì `finalAmount` khi tính tiền còn phải thu.

## 2. Context & Background
- **Entities & CSDL hiện trạng:**
  - `MT_GRMS.Domain/Entities/Sales/Order.cs` & `OrderConfiguration.cs`: Có `TotalAmount`, `DiscountAmount`, `FinalAmount`, `DepositAmount`, `ShiftId`, `CashierName`, `FulfilledByCashierName`, `FulfilledAtUtc`; chưa có các trường phân rã ưu đãi và `Note` đang `[NotMapped]`.
  - `MT_GRMS.Domain/Entities/Sales/OrderDetail.cs` & `OrderDetailConfiguration.cs`: **Đã có sẵn** cột `PromotionId` (`Guid?`) và `IsGift` (`bool`, default `false`) trong CSDL, nhưng tầng DTO (`OrderDtos.cs`), `OrderService.cs` và Frontend chưa truyền và sử dụng 2 trường này.
  - `MT_GRMS.Domain/Entities/Sales/Promotion.cs`: Đã có sẵn `UsedCount`, `UsageLimit`, `BudgetLimit`, `TotalDiscountGiven`.
- **Services & API hiện trạng:**
  - `PromotionService.EvaluateCartAsync`: Đã giải quyết xung đột `Best-Offer` giữa `ORDER_DISCOUNT` và `PRODUCT_DISCOUNT`, nhưng `BUY_X_GET_Y` vẫn chạy nhánh độc lập và chưa đọc metadata bậc thang `[TIERS_JSON]` có `buyProductId`.
  - `OrderService.CreateOrderAsync` / `CreatePreOrderAsync` / `CancelOrderAsync` / `ProcessReturnExchangeAsync`: Xử lý trừ kho FEFO, thu quỹ, đổi voucher `RedeemVoucherCodeAtomicAsync`, hoàn trả kho khi hủy/đổi trả.
- **Frontend hiện trạng:**
  - `PosCheckoutPage.tsx`, `PosPaymentPanel.tsx`, `PosReceiptModal.tsx`
  - `InvoiceManagementPage.tsx`, `CreatePreOrderModal.tsx`, `ReturnExchangeModal.tsx`
  - `PromotionModal.tsx`, `PromotionListPage.tsx`, `promotion.types.ts`

## 3. Constraints
- **Không phá vỡ dữ liệu lịch sử & bài test hiện hữu:** Toàn bộ 580 bài test Backend (Unit + Integration) hiện có và các đơn hàng cũ (chưa có metadata ưu đãi chi tiết) phải tiếp tục đọc/hiển thị bình thường (`null-safe`, tương thích ngược 100%).
- ** Đa chi nhánh & Đa Tenant (`TenantId`):** Mọi truy vấn chương trình khuyến mãi, tồn kho lô FEFO, mã voucher và đơn hàng bắt buộc cô lập chặt theo `TenantId` và `BranchId`.
- **Không chặn thanh toán đơn chính khi hết quà tặng:** Trong thực tế bán lẻ tại quầy, nếu mặt hàng khách mua chính đủ tồn kho nhưng sản phẩm quà tặng khuyến mãi đã hết (hoặc còn ít hơn định mức tặng), hệ thống không được văng lỗi làm hỏng giao dịch bán hàng chính mà phải cấp tối đa số quà còn tồn và thông báo rõ.
- **Tiền tệ & Thời gian:** Tiền tệ VND dùng `decimal(18,2)` không âm; thời gian lưu `UTC` và hiển thị múi giờ Việt Nam.

## 4. Assumptions
- **[ASSUMPTION-01]:** Đơn đặt trước (`Pre-Order`) **chỉ tự động áp dụng Khuyến mãi chương trình** (gồm giảm giá tiền hoặc giữ kho quà tặng `Mua X tặng Y`) ngay thời điểm tạo đơn đặt cọc; **không** cho phép áp dụng mã Voucher dùng 1 lần và không tiêu Điểm thưởng trên đơn đặt trước.
- **[ASSUMPTION-02]:** Nguyên tắc chống chồng chéo khuyến mãi tự động (`Best-Offer`) áp dụng thống nhất cho cả 3 loại (`ORDER_DISCOUNT`, `PRODUCT_DISCOUNT`, `BUY_X_GET_Y`): giá trị quy đổi của gói quà tặng (`số lượng tặng × giá bán sản phẩm tặng`) được so sánh trực tiếp với số tiền giảm của các chương trình khác; mỗi đơn chỉ tự động hưởng **1 chương trình KM có lợi nhất** (riêng mã Voucher trên đơn bán lẻ POS vẫn áp dụng sau KM tự động theo luồng hiện có).
- **[ASSUMPTION-03]:** Khi khách thực hiện **Đổi/Trả hàng**, dòng sản phẩm quà tặng (`IsGift = true`) có đơn giá hoàn tiền bằng `0 đ` (trả lại quà chỉ cộng lại tồn kho nếu hàng nguyên vẹn `Restock`, không phát sinh hoàn tiền mặt hay giảm công nợ từ bản thân món quà).
- **[ASSUMPTION-04]:** Khi Chủ cửa hàng hủy đơn hàng (`CancelOrderAsync`), tồn kho của cả hàng mua lẫn hàng tặng đều được hoàn lại, đồng thời bộ đếm `UsedCount` và `TotalDiscountGiven` của chương trình khuyến mãi áp dụng trên đơn đó được khấu trừ hoàn lại tương ứng.

## 5. Scope & Non-Goals

### In Scope
- Lưu trữ bền vững thông tin ưu đãi chi tiết trên đơn hàng (KM đã áp, mã Voucher, giảm từ KM / Voucher / Điểm thưởng, ghi chú đơn hàng) và hiển thị trên **Quản lý đơn hàng** + mẫu in hóa đơn.
- Cập nhật tự động `UsedCount` và `TotalDiscountGiven` cho chương trình Khuyến mãi tự động và Đợt phát hành Voucher khi tạo/hủy đơn.
- Bổ sung chọn sản phẩm cần mua (X) cho loại `Mua X tặng Y` trên UI quản lý khuyến mãi; quy đổi giá trị quà tặng để xét `Best-Offer`; tự động lên đơn dòng quà tặng `0 đ` (`IsGift = true`), trừ tồn kho lô FEFO an toàn khi thiếu quà, và tách bạch dòng quà tặng `0 đ` khi Đổi/Trả hàng.
- Tích hợp thẩm định khuyến mãi tự động & giữ kho quà tặng `0 đ` ngay khi tạo **Đơn đặt trước**, đồng bộ cách tính cọc tối thiểu `10%` và tiền còn phải thu theo giá sau khuyến mãi.

### Out of Scope (Non-Goals)
- Không cho phép nhập mã Voucher dùng 1 lần hoặc đổi Điểm thưởng trong luồng Đơn đặt trước (kể cả lúc đặt cọc lẫn lúc tất toán nhận hàng).
- Không xây dựng cơ chế cộng dồn nhiều chương trình khuyến mãi tự động cùng lúc trên 1 hóa đơn.
- Không tự động thu hồi bắt buộc quà tặng bằng quy tắc khóa cứng nếu khách chỉ đổi ngang sản phẩm lỗi cùng loại; thu ngân tích chọn dòng trả trên modal Đổi/Trả với giá hoàn của dòng quà tặng cố định `0 đ`.
- Không thay đổi luồng phê duyệt hạn mức két tiền mặt hoặc báo cáo thuế hiện hành.

## 6. Options Considered (Phương án cân nhắc)

### Vấn đề A: Cách lưu vết thông tin Khuyến mãi / Voucher / Điểm thưởng trên Đơn hàng
- **Phương án A1 — Nhồi chuỗi văn bản vào cột `Note` của `Order`:**
  - *Ưu điểm:* Ít sửa trường dữ liệu.
  - *Nhược điểm:* Dễ vỡ format khi nối thêm ghi chú hủy/đổi trả/hẹn giờ lấy hàng; không truy vấn định danh được `AppliedPromotionId` để hoàn lại `UsedCount` / `TotalDiscountGiven` khi hủy đơn; không tách bạch số tiền giảm từng nguồn trên UI và phiếu in.
- **Phương án A2 (Chọn) — Mở rộng các cột tường minh trên `Order` kết hợp tận dụng `IsGift` & `PromotionId` có sẵn trên `OrderDetail`:**
  - *Ưu điểm:* Chuẩn dữ liệu tường minh, an toàn kiểu (`AppliedPromotionId`, `AppliedPromotionSummary`, `PromotionDiscountAmount`, `AppliedVoucherCode`, `VoucherDiscountAmount`, `PointsRedeemed`, `PointsDiscountAmount`, cùng việc map cột `Note` xuống DB), hỗ trợ hoàn trả chính xác ngân sách khi hủy đơn và hiển thị sạch sẽ trên `InvoiceManagementPage` mà không cần tạo bảng phụ rườm rà.
  - *Nhược điểm:* Cần thêm 1 migration / câu lệnh `ALTER TABLE IF NOT EXISTS` đồng bộ schema.

### Vấn đề B: Xử lý xung đột (`Conflict Resolution`) cho `Mua X tặng Y`
- **Phương án B1 — Cho `Mua X tặng Y` chạy song song độc lập với giảm giá hóa đơn:**
  - *Ưu điểm:* Không cần tính giá trị quy đổi của quà tặng.
  - *Nhược điểm:* Gây lỗ kép ngoài ý muốn khi cửa hàng vừa bật giảm giá tổng đơn vừa bật tặng hàng, đồng thời không kiểm soát được trần ngân sách (`BudgetLimit`) của chương trình tặng quà.
- **Phương án B2 (Chọn) — Quy đổi giá trị quà tặng (`giftQty × giá bán SP tặng`) đưa chung vào bộ chọn `Best-Offer` & kiểm tra `BudgetLimit`:**
  - *Ưu điểm:* Nhất quán 100% với triết lý chống chồng chéo khuyến mãi vừa chốt, bảo vệ biên lợi nhuận cửa hàng và trừ đúng giá trị quà tặng vào ngân sách chương trình `BudgetLimit`.
  - *Nhược điểm:* Cần tra cứu giá bán của sản phẩm quà tặng trong lúc đánh giá giỏ hàng.

## 7. Risks & Mitigations
- **Rủi ro 1 — Sản phẩm mua chính và sản phẩm quà tặng là CÙNG MỘT MẶT HÀNG (VD: Mua 2 chai Trà xanh tặng 1 chai Trà xanh), nhưng tồn kho chỉ còn đúng 2 chai:**
  - *Giảm thiểu:* Luôn ưu tiên phân bổ và trừ kho FEFO cho các dòng hàng khách mua trả tiền (`IsGift = false`) trước; phần tồn kho còn dư mới cấp phát cho dòng quà tặng (`IsGift = true`). Nếu dư `0` thì bỏ qua dòng quà tặng và gắn cảnh báo thiếu quà, đảm bảo khách vẫn mua được 2 chai chính.
- **Rủi ro 2 — Lợi dụng hoàn tiền dòng quà tặng khi Đổi/Trả hàng:**
  - *Giảm thiểu:* Khóa cứng cả ở Frontend (`ReturnExchangeModal.tsx`) lẫn Backend (`ProcessReturnExchangeAsync`): tách nhận diện theo `OrderDetailId` (hoặc cặp `ProductId + IsGift`), nếu `origDetail.IsGift == true` thì đơn giá hoàn trả bắt buộc bằng `0 đ` bất kể payload gửi lên.
- **Rủi ro 3 — Lệch schema CSDL trên môi trường dev/test hiện có:**
  - *Giảm thiểu:* Bổ sung đầy đủ EF Core Migration chuẩn kết hợp câu lệnh `ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS ...` idempotent trong `DbInitializer.cs` theo đúng convention sẵn có của dự án.

## 8. Success Criteria
1. Đơn hàng POS có áp dụng KM / Voucher / Điểm thưởng lưu đầy đủ phân rã ưu đãi và hiển thị rõ tên chương trình KM, mã Voucher, số điểm đổi trong chi tiết **Quản lý đơn hàng** và bản in hóa đơn.
2. Chương trình KM và Đợt Voucher tự động tăng `UsedCount` & `TotalDiscountGiven` ngay sau khi tạo đơn, và giảm tương ứng khi hủy đơn.
3. Chương trình `Mua X tặng Y` cho phép chọn sản phẩm mua (X) và sản phẩm tặng (Y), xét `Best-Offer` không cộng dồn, tự động sinh dòng `[Quà tặng KM]` `0 đ` trừ kho FEFO (xử lý êm khi kho thiếu quà) và khóa hoàn tiền `0 đ` khi Đổi/Trả.
4. Modal **Tạo đơn đặt trước** và API Backend tự động tính khuyến mãi chương trình & giữ kho quà tặng `0 đ`, tính đúng tiền cọc tối thiểu `10%` và tiền còn phải thu theo `FinalAmount` (không có ô nhập Voucher).
