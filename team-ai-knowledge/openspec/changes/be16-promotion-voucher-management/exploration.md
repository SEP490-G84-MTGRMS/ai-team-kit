# Exploration: Phân hệ Quản lý Khuyến mại & Voucher Backend (BE-16)

## 1. Hiện trạng Code & Bối cảnh kỹ thuật
- **Backend Domain (`MT_GRMS.Domain`)**:
  - `Promotion.cs`: Hiện tại chỉ có vài trường sơ khai (`PromotionCode`, `PromotionName`, `Type`, `DiscountValue`, `StartDate`, `EndDate`, `IsActive`). Thiếu các trường quan trọng: `MinOrderValue`, `MaxDiscountAmount`, `UsageLimit`, `UsedCount`, `BudgetLimit`, `TotalDiscountGiven`, `TargetBranches`, `VoucherPrefix`.
  - `OrderDetail.cs`: Đã có sẵn thuộc tính `PromotionId`, `IsGift`, `DiscountAmount`, `ActualPrice`.
  - `Order.cs`: Đã có `TotalAmount`, `DiscountAmount`, `FinalAmount`, `PaymentStatus`.
  - Khóa chính thực thể toàn bộ kế thừa `BaseTenantEntity` với ID là `Guid` sinh bằng `Uuid7.NewGuid()` (UUIDv7 chuẩn RFC 9562).
- **Backend Application & Infrastructure**:
  - Chưa có `IPromotionRepository`, `IPromotionService`, `PromotionService`, DTOs hay Validators.
  - `OrdersController` đang ở dạng scaffold trống.
- **Frontend Contract (`MT_GRMS_FRONTEND`)**:
  - `src/features/promotion/types/promotion.types.ts`: Định nghĩa sẵn các DTOs: `PromotionItemDTO`, `PromotionTierDTO`, `VoucherBatchItemDTO`, `VoucherCodeItemDTO`.
  - `PosPaymentPanel.tsx`: Hỗ trợ nhập mã coupon (`couponCode`), tính toán chiết khấu đơn và hiển thị tiền sau giảm.

## 2. Assumptions (Giả định cốt lõi)
1. **[ASSUMPTION - GUIDv7]**: Tất cả ID thực thể (`Promotion.Id`, `PromotionCondition.Id`, `VoucherCode.Id`) đều là kiểu `Guid` và được khởi tạo tự động bằng `Uuid7.NewGuid()` kế thừa từ `BaseTenantEntity` hoặc `BaseEntity`.
2. **[ASSUMPTION - Multi-Tenancy]**: Mọi truy vấn, kiểm tra mã trùng lặp, tính toán và cập nhật đều bị cô lập chặt chẽ theo `TenantId`.
3. **[ASSUMPTION - Timezone]**: Thời gian hiệu lực `StartDate` và `EndDate` được lưu trữ dưới dạng UTC trong CSDL và so sánh theo `DateTime.UtcNow`.
4. **[ASSUMPTION - Discount Safety]**: Chiết khấu khuyến mại không bao giờ được vượt quá tổng giá trị đơn hàng (`FinalAmount >= 0`).

## 3. Non-Goals (Phạm vi từ chối trong giai đoạn này)
- Không xây dựng SMS/Email Gateway để tự động gửi tin nhắn mã voucher cho khách hàng.
- Không can thiệp vào nghiệp vụ tích điểm hội viên Loyalty (Sổ cái điểm thưởng sẽ được tích hợp ở Capability riêng).
- Không sửa đổi mã nguồn Frontend React (Frontend đã hoàn thiện UI theo mock, backend sẽ cung cấp API chuẩn khớp với contract của FE).

## 4. Phân tích các phương án kiến trúc

### Phương án 1: Tách riêng bảng Voucher và bảng Promotion
- **Mô tả:** Tạo cụm bảng `VoucherBatches` + `VoucherCodes` tách biệt hoàn toàn khỏi `Promotions`.
- **Ưu điểm:** Tách biệt rõ 2 màn hình quản trị.
- **Nhược điểm:**
  - Vi phạm mô hình ERD 3NF đã được Giảng viên phê duyệt (trong ERD, `Promotion` là thực thể mẹ duy nhất gắn với `OrderDetail` và `Tenant`).
  - Trùng lặp code: Cả Voucher và Promotion đều có chung các thuộc tính (thời gian hiệu lực, giá trị giảm %, giảm tiền cố định, giá trị đơn tối thiểu, chặn trần giảm).
  - Thu ngân tại POS phải gọi 2 logic tính toán khác nhau gây phân mảnh.

### Phương án 2 (Được chọn): Hợp nhất 3NF theo ERD & Tài liệu đặc tả `Database_Design_POS_Promotion_Detail.md`
- **Mô tả:**
  - `Promotion`: Thực thể mẹ quản lý cả chương trình khuyến mại lẫn chiến dịch Voucher (`Type = ORDER_DISCOUNT | FIXED_AMOUNT | PERCENT | BUY_X_GET_Y | VOUCHER`).
  - `PromotionCondition`: Thực thể kết hợp đại diện cho quan hệ nhiều - nhiều $M:N$ `eligible_for` giữa `Promotion` và `Product` với các thuộc tính `ProductRole` (BUY, GIFT, DISCOUNT) và `MinQty`.
  - `VoucherCode`: Thực thể quản lý chi tiết từng mã voucher thuộc chiến dịch (`PromotionId` FK), trạng thái `UNUSED`, `USED`, `EXPIRED`.
- **Lý do chọn:**
  - Khớp 100% với ERD và tài liệu thiết kế CSDL của dự án.
  - Tái sử dụng tối đa logic tính toán chiết khấu (Discount Engine) cho cả Promotion tự động lẫn mã Voucher nhập tay.
  - Đảm bảo tính nhất quán của lịch sử hạch toán đơn hàng tại `OrderDetail.PromotionId`.

## 5. Rủi ro & Cách giảm thiểu
1. **Rủi ro sử dụng đồng thời (Concurrency) trên cùng một mã Voucher:**
   - *Nguy cơ:* Hai thu ngân cùng lúc áp dụng một mã voucher chỉ có 1 lượt dùng.
   - *Cách giảm thiểu:* Xử lý Atomic Update trong Database `UPDATE VoucherCodes SET Status = 'USED', UsedAt = @Now WHERE Id = @Id AND Status = 'UNUSED'`. Nếu số dòng affected = 0 nghĩa là mã đã bị dùng trước đó.
2. **Rủi ro chiết khấu vượt giá trị đơn hàng:**
   - *Cách giảm thiểu:* Logic tính toán luôn dùng `Math.Min(calculatedDiscount, totalAmount)`.
