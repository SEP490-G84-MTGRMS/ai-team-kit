# Skeptic Review: pos-lookup-branch-scoping-and-loyalty-rules

| Chiều | Điểm (1–5) | Nhận xét |
|---|:---:|---|
| D1 Completeness | 5/5 | Đầy đủ kịch bản phân quyền chi nhánh cho cả 2 vai trò `STORE_OWNER` và `EMPLOYEE` trên `InventoryLookupPage`, gỡ nút thừa trên `PosHeader`, và kịch bản khấu trừ điểm thưởng khi tiêu điểm. |
| D2 Correctness | 5/5 | Logic tiêu điểm và tích điểm chính xác: Trừ điểm đã dùng trước, sau đó tích điểm mới theo `FinalAmount` (10.000đ = 1 điểm). Chống trừ âm điểm bằng `Math.Min(customer.RewardPoints, request.PointsRedeemed)`. |
| D3 Coherence | 5/5 | Đồng bộ nhất quán giữa proposal, design-brief và specs delta. |
| D4 Constraints | 5/5 | Tôn trọng ràng buộc phân quyền chi nhánh, bảo toàn tính tương thích ngược cho các đơn hàng cũ không dùng điểm. |
| D5 Blast Radius | 5/5 | Ảnh hưởng cô lập tại POS Header, trang Tra cứu tồn kho và hàm tạo đơn `OrderService.cs`. Không làm ảnh hưởng 352 unit tests hiện có. |

## Vấn đề
- [LOW] REQ-05: Đảm bảo khi `PointsRedeemed` truyền vào giá trị âm hoặc null thì hệ thống bỏ qua và không làm ảnh hưởng điểm của khách. → Đề xuất: Kiểm tra `request.PointsRedeemed.HasValue && request.PointsRedeemed.Value > 0`.

## Kết luận: Chấp nhận
Spec đạt chất lượng tốt, đầy đủ ràng buộc và sẵn sàng chuyển sang lập kế hoạch tasks thực thi.
