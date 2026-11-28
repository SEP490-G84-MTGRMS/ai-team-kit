# Skeptic Review: pos-order-promo-audit-bogo-and-preorder-promo

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Bao phủ đầy đủ 6 requirements từ lưu vết phân rã KM/Voucher/Điểm thưởng, đồng bộ `UsedCount`/`TotalDiscountGiven`, cấu hình & xét `Best-Offer` `Mua X tặng Y`, trừ kho FEFO ưu tiên hàng mua, khóa hoàn tiền `0 đ` khi đổi trả, đến khuyến mãi tự động Đơn đặt trước. Đủ các edge case: kho thiếu/hết quà tặng, trùng mã SP mua & tặng khi đổi trả, đồng thời gạch mã Voucher, đơn toàn hàng tặng `0 đ`, hủy đơn hoàn ngân sách. |
| D2 Correctness | 5/5 | Công thức tách bạch rõ: dòng `IsGift = true` lưu `ActualPrice = 0`, không cộng dồn làm méo `Order.TotalAmount` hay `Order.DiscountAmount`, trong khi ngân sách `Promotion.TotalDiscountGiven` vẫn ghi nhận đúng giá trị quy đổi quà tặng (`DiscountAmount` của dòng `IsGift`) và hoàn lại chính xác khi hủy đơn. |
| D3 Coherence | 5/5 | Khớp 100% giữa `proposal.md`, `exploration.md`, `design-brief.md` và `specs.md`; tái sử dụng sẵn cột `IsGift` và `PromotionId` trên `OrderDetails`. |
| D4 Constraints | 5/5 | Tôn trọng cô lập `TenantId`, phân quyền `STORE_OWNER` khi hủy đơn hoàn thành, `decimal(18,2)` cho tiền tệ VND, và tương thích ngược `null-safe` với toàn bộ đơn lịch sử. |
| D5 Blast Radius | 4.5/5 | Phạm vi tác động kiểm soát chặt ở `Orders`, `OrderService`, `PromotionService` và 5 màn hình/modal POS & Khuyến mãi; các tham số DTO mới đều có giá trị mặc định để không phá vỡ 580 bài test sẵn có. |

## Vấn đề (Đã rà soát & cập nhật đóng trong `specs.md`)
- [MEDIUM — Đã đóng] `REQ-ORD-BOGO-02` & `REQ-ORD-PROMO-02`: Ban đầu cần làm rõ cách hoàn trả `TotalDiscountGiven` khi hủy đơn `BUY_X_GET_Y` (vì `PromotionDiscountAmount = 0`). → Đã chuẩn hóa trong `specs.md`: dòng `IsGift` lưu giá trị tham chiếu vào `OrderDetail.DiscountAmount` (không cộng vào `Order.TotalAmount`/`DiscountAmount`), dùng chính giá trị này để cộng/hoàn `Promotion.TotalDiscountGiven`.
- [MEDIUM — Đã đóng] `REQ-ORD-BOGO-02`: Nguy cơ gửi payload tạo đơn chỉ gồm dòng `IsGift = true`. → Đã bổ sung ràng buộc bắt buộc có ít nhất `1` dòng `IsGift == false` trong `specs.md`.
- [LOW — Đã đóng] `REQ-ORD-PROMO-02`: Khi hủy đơn có dùng mã Voucher, đã bổ sung quy tắc mở khóa lại mã về `UNUSED` và hoàn `UsedCount`/`TotalDiscountGiven` của đợt Voucher.

## Kết luận: Chấp nhận
