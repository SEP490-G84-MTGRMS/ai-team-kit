# Skeptic Review: fe19-tax-snapshot-frontend

| Chiều | Điểm (1–5) | Nhận xét |
|---|:---:|---|
| **D1 Completeness** | 5/5 | Đầy đủ 4 Requirements cốt lõi, mỗi requirement đều có GIVEN/WHEN/THEN chi tiết cho cả main flow và edge cases (trùng kỳ, khóa bất biến, bảng kê rỗng). |
| **D2 Correctness** | 5/5 | Bám sát 100% Thông tư 40/2021/TT-BTC: Thuế GTGT 1%, Thuế TNCN 0.5% trên doanh thu bán lẻ hộ kinh doanh. Khớp chính xác với thực thể `TaxSnapshot` trong sơ đồ ERD. |
| **D3 Coherence** | 5/5 | Nhất quán hoàn toàn giữa Proposal, Exploration, Design Brief và Specs. Không còn vết tích của Hóa đơn điện tử cũ. |
| **D4 Constraints** | 5/5 | Ràng buộc Multi-tenant (`TenantId`), phân quyền truy cập (`StoreOwner`, `Accountant`), nguyên tắc kế toán bất biến dữ liệu được đảm bảo chặt chẽ. |
| **D5 Blast Radius** | 5/5 | Module độc lập tại `src/features/tax-snapshot/`, chỉ đọc dữ liệu từ `Orders` và `TaxSnapshots`, không làm gãy vỡ hay ảnh hưởng tiêu cực tới POS hay các phân hệ khác. |

## Vấn đề & Góp ý cải tiến
- **[MEDIUM] Xử lý trừ tiền hoàn trả hàng (Return Orders):**
  - *Hiện tượng:* Nếu trong kỳ có khách trả lại hàng và cửa hàng hoàn tiền (`ReturnOrders`), doanh thu thực nhận sẽ giảm.
  - *Đề xuất:* Đảm bảo công thức tính doanh thu chịu thuế tự động trừ đi giá trị hoàn tiền: $\text{TaxableRevenue} = \sum \text{Orders.FinalAmount} - \sum \text{ReturnOrders.TotalRefundAmount}$.
- **[LOW] Trải nghiệm khi kỳ tính thuế chưa có đơn hàng:**
  - *Hiện tượng:* Khi người dùng chọn Quý hiện tại vừa mới bắt đầu hoặc Quý chưa có phát sinh giao dịch bán hàng (`ordersCount = 0`).
  - *Đề xuất:* Cho phép tạo nháp với doanh thu = 0đ và hiển thị Tag thông tin nhắc nhở người dùng, không báo lỗi hệ thống.

## Kết luận: Chấp nhận (Accepted)
Specs và thiết kế đã hoàn toàn sẵn sàng để lập `tasks.md` và tiến hành code trong bước Apply.
