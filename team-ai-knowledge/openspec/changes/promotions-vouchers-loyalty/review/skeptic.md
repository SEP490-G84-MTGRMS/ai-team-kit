# Skeptic Review: promotions-vouchers-loyalty

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| **D1 Completeness** | 5/5 | Đã bao phủ toàn diện 3 loại khuyến mãi (% đơn, theo sản phẩm, Buy X Get Y), chu trình phát hành & đổi mã voucher, cấu hình tích điểm và màn hình POS. Các kịch bản edge case (vượt quá giá trị giỏ hàng, mã đã dùng, không đủ điểm tối thiểu) được định nghĩa rõ ràng. |
| **D2 Correctness** | 5/5 | Công thức tính toán điểm thưởng tích lũy và quy đổi giảm trừ tiền mặt nhất quán, đúng chuẩn số học VND. Logic gán quà tặng 0đ (IsGift = true) bảo toàn tính đúng đắn kế toán. |
| **D3 Coherence** | 5/5 | Đồng nhất 100% thuật ngữ giữa Proposal, Exploration, Design-Brief và Specs. Cấu trúc DTOs đồng bộ với các entities hiện có. |
| **D4 Constraints** | 5/5 | Đảm bảo triệt để Multi-tenancy (`TenantId`) cho bảng cấu hình `LoyaltySettings` và các chiến dịch khuyến mại; phân quyền rõ ràng giữa StoreOwner và Thu ngân. |
| **D5 Blast Radius** | 4.5/5 | Tác động khu biệt vào phân hệ Promotions, Vouchers và module POS Checkout. Không làm vỡ cấu trúc ca làm việc (`CashierShift`) hay sổ quỹ (`LedgerTransaction`). |

## Vấn đề & Khuyến nghị

### [MEDIUM] Đảm bảo tính nguyên tử (Atomic) khi đổi mã Voucher tại quầy POS
- **Mô tả**: Nếu màn hình POS gọi API tạo đơn hàng thành công nhưng bước gọi API đổi mã voucher (`RedeemVoucherAsync`) bị mất mạng giữa chừng, mã voucher có thể bị giữ nguyên trạng thái `UNUSED` và bị tái sử dụng.
- **Đề xuất**: Bổ sung `string? VoucherCode = null` trực tiếp vào `OrderCreateRequest`. `OrderService.CreateOrderAsync` sẽ tự động validate và redeem mã voucher trong cùng DbContext Transaction của đơn hàng. Nếu voucher không hợp lệ, đơn hàng sẽ rollback ngay lập tức.

### [LOW] Kiểm soát số tiền giảm do tiêu điểm không vượt quá số tiền còn lại của giỏ hàng
- **Mô tả**: Khi kết hợp Khuyến mại + Voucher + Điểm thưởng, số tiền giảm có thể vượt tổng tiền giỏ hàng dẫn đến `FinalAmount` bị âm.
- **Đề xuất**: Trong `OrderService` và tại POS UI, số tiền giảm do tiêu điểm luôn được chặn trần: `MaxDiscountFromPoints = Math.Max(0, SubTotal - PromoDiscount - VoucherDiscount)`.

## Kết luận: Chấp nhận
Bộ đặc tả đã sẵn sàng chuyển sang giai đoạn lập kế hoạch chi tiết (`tasks.md`) và triển khai code (`/sep-apply`).
