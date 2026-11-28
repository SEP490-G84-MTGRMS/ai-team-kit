# Skeptic Review: subscription-tier-quota-redesign

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 4/5 | Đã có đầy đủ REQ cho 2 gói cước, option nhân viên, quota chi nhánh và dùng thử 3 ngày. Cần làm rõ thêm hành vi khi tenant gói Thường cố tình gửi request mua thêm chi nhánh. |
| D2 Correctness | 5/5 | Logic tính tiền, VAT 10%, chu kỳ khuyến mại (12m +1m, 24m +3m) và công thức Quota chi nhánh hoàn toàn chính xác, không mâu thuẫn. |
| D3 Coherence | 5/5 | Hoàn toàn nhất quán giữa Proposal, Exploration, Design-Brief và Specs. Không còn vết tích của gói 0đ và kho phụ. |
| D4 Constraints | 5/5 | Tuân thủ tuyệt đối kiến trúc Multi-tenancy (TenantId cô lập), quyền thao tác thuộc về Store Owner/Admin. |
| D5 Blast Radius | 4/5 | Ảnh hưởng chủ yếu ở Tenant và SubscriptionPlan. Cần bổ sung cột an toàn trong Database để không gây gián đoạn các bản ghi Tenant hiện có. |

## Vấn đề
- [MEDIUM] **REQ-04**: Trong trường hợp khách hàng đang ở Gói Thường nhưng cố tình gọi API gửi `ExtraBranches > 0` → **Đề xuất**: API `PurchaseSubscription` cần validate: Nếu `PlanCode == "STANDARD"` và `ExtraBranches > 0`, trả về lỗi `400 BAD_REQUEST: "Gói Thường không hỗ trợ mở rộng thêm chi nhánh. Vui lòng nâng cấp lên Gói Pro."`
- [LOW] **REQ-05**: Khi hết hạn 3 ngày dùng thử (`SubscriptionStatus == "EXPIRED"`), cần đảm bảo API lấy thông tin gói (`/api/tenant/pricing-plans`) và API mua gói (`/api/tenant/subscriptions/purchase`) vẫn cho phép gọi để khách hàng thực hiện nạp tiền và thanh toán.

## Kết luận: Chấp nhận
Các vấn đề ở mức MEDIUM và LOW, không có vấn đề HIGH ngăn cản. Đã bổ sung lưu ý validate vào quy tắc triển khai Backend. Specs sẵn sàng để lập danh sách tasks.
