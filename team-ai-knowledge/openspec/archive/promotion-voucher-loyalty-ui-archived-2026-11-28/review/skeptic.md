# Skeptic Review: promotion-voucher-loyalty-ui

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Bao phủ đầy đủ 3 màn hình nghiệp vụ (Khuyến mãi, Voucher/Coupon, Tích điểm) tương ứng với 3 file wireframe mẫu; bao gồm cả các modal tạo mới, sửa, phát hành mã, điều chỉnh điểm, bộ lọc và chi tiết dạng accordion. |
| D2 Correctness | 5/5 | Luồng route `/store-owner/promotions`, `/store-owner/vouchers`, `/store-owner/loyalty-config` khớp với cấu trúc URL hiện có của Store Owner Layout. Các công thức tính toán và trạng thái (Đang chạy, Sắp diễn ra, Tạm dừng, Hết hạn) đúng chuẩn POS/Retail. |
| D3 Coherence | 5/5 | Nhất quán hoàn toàn với design system MT-GRMS: tông màu Deep Teal (#0F766E), font Be Vietnam Pro, rounded-pill, cấu trúc feature dạng `src/features/promotion/` tương tự `customer-crm`. |
| D4 Constraints | 5/5 | Tuân thủ nghiêm ngặt nguyên tắc chỉ thêm mock data, không gọi API backend giả định, sử dụng lucide-react icons sẵn có trong package, tuân thủ TypeScript strict typing, không ảnh hưởng đến build. |
| D5 Blast Radius | 5/5 | Blast radius rất hẹp: module mới nằm trọn trong `src/features/promotion/`. Chỉ tác động phẫu thuật (surgical) vào 2 file hiện có: `src/app/router.tsx` (thêm 3 route con) và `src/layouts/StoreOwnerLayout/AppTopNav.tsx` (thêm 1 nav group). |

## Vấn đề
- [MEDIUM] REQ-UI-01: Bộ lọc ngày và chi nhánh có thể gây lỗi undefined nếu người dùng reset filter mà state không có giá trị fallback. → Đề xuất: Đảm bảo initial state và hàm reset filter fallback về giá trị mặc định rõ ràng ('all', '', mảng rỗng).
- [LOW] REQ-UI-02: Modal tạo bậc thang khuyến mãi có thể tạo nhiều điều kiện phức tạp. → Đề xuất: Trong phiên bản UI mock này, cung cấp sẵn dữ liệu mẫu kịch bản bậc thang mua X tặng Y hoặc giảm giá theo giá trị đơn để người dùng dễ thao tác và kiểm thử giao diện.
- [LOW] REQ-UI-03: Bảng mã voucher chi tiết trong accordion cần hỗ trợ copy nhanh mã voucher ra clipboard. → Đề xuất: Thêm nút copy nhanh kèm tooltip/toast feedback trực quan.

## Kết luận: Chấp nhận
Specs đã đầy đủ, rõ ràng, thiết kế kiến trúc chuẩn mực theo Clean Feature Architecture của MT-GRMS Frontend, sẵn sàng chuyển sang triển khai (Apply).
