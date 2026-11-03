# Skeptic Review: dynamic-subscription-plans-from-db

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đầy đủ scenarios tái hiện lỗi cũ, trường hợp 2 gói DB hiện tại, trường hợp mở rộng N gói và edge case gói 0đ. |
| D2 Correctness | 5/5 | Đánh đúng root cause (bỏ duyệt mảng tĩnh, render trực tiếp từ Backend API). |
| D3 Coherence | 5/5 | Thống nhất tuyệt đối giữa proposal, exploration và specs. |
| D4 Constraints | 5/5 | Tuân thủ bảo mật JWT, giữ vững design token và responsive layout KiotViet, có Skeleton loader. |
| D5 Blast Radius | 5/5 | Phạm vi cô lập trong component SubscriptionPricingCards, không ảnh hưởng xấu đến các module khác. |

## Vấn đề
- [MEDIUM] REQ-SUB-02: Backend DTO có thể trả về `Quotas` hoặc `Features` dạng null nếu bản ghi DB bị thiếu json. → Đề xuất: Trong hàm `mapBackendPlanToCardItem`, dùng optional chaining `?.` và fallback mặc định để ngăn ngừa `TypeError` tại runtime. (Đã ghi nhận để đưa vào Task xử lý).
- [LOW] REQ-SUB-02: Nếu tên gói trùng khớp với gói tenant đang kích hoạt (`storeInfo.currentPlan`), nút bấm nên đổi sang nhãn "Gói đang dùng" để tăng trải nghiệm trực quan.

## Kết luận: Chấp nhận
Specs đã đủ rõ ràng, an toàn và sẵn sàng để lập task thực thi.
