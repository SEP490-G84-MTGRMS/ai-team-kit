# Guardian Review: pos-order-promo-audit-bogo-and-preorder-promo

| Hạng mục | Tình trạng (OK / Rủi ro / Thiếu) | Ghi chú |
|---|---|---|
| Multi-tenant | OK | Mọi truy vấn `Promotions`, `VoucherCodes`, `BranchStocks` và `Orders` đều cô lập theo `TenantId`; chặn sử dụng mã Voucher hoặc chương trình KM chéo tenant. |
| AuthN/AuthZ | OK | Giữ nguyên khóa cứng chỉ `STORE_OWNER` được hủy đơn `Completed` (`REQ-POS-SEC-02`); chặn hoàn tiền vượt `ActualPrice` và ép `0 đ` cho dòng `IsGift` ngay tại tầng Application (`ProcessReturnExchangeAsync`). |
| Validation | OK | FluentValidation & domain guards kiểm tra các khoản giảm giá `>= 0`, kẹp `DiscountAmount <= TotalAmount`, bắt buộc ít nhất 1 mặt hàng mua trả tiền (`!IsGift`), và chặn `VoucherCode` trên `CreatePreOrderAsync`. |
| Toàn vẹn dữ liệu | OK | Ưu tiên trừ kho FEFO cho hàng mua trước, hàng tặng sau; gạch mã Voucher nguyên tử `UNUSED` → `USED`; migration CSDL đi kèm `ALTER TABLE IF NOT EXISTS` an toàn dữ liệu cũ. |
| Vận hành & audit | OK | Lưu vết đầy đủ `AppliedPromotionId`, `AppliedPromotionSummary`, `AppliedVoucherCode`, `PointsRedeemed` và `Note` trên `Orders` phục vụ kiểm toán sau bán hàng. |

## Vấn đề
- Không còn vấn đề HIGH hay bảo mật mở sau khi đã khóa validation dòng `IsGift` và trần hoàn tiền `ActualPrice` tại Backend.

## Kết luận: An toàn
