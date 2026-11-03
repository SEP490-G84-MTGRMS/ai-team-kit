# Skeptic Review: Pre-Order FEFO Allocation & Smart Product Selector UX

## 1. Đánh giá 5 chiều (Dimensions D1 - D5)
| Dimension | Điểm (1-5) | Nhận xét |
|---|:---:|---|
| **D1: Completeness** | 5/5 | Bao quát đầy đủ cả tầng Backend (test phân bổ nhiều lô FEFO) và tầng Frontend (tìm kiếm gợi ý sản phẩm). |
| **D2: Correctness** | 5/5 | Logic FEFO đúng chuẩn `ORDER BY ExpireDate ASC`, trừ lô hết hạn sớm nhất trước; UI tìm kiếm xử lý tốt trường hợp không tìm thấy. |
| **D3: Coherence** | 5/5 | Đồng nhất với cấu trúc Clean Architecture của Backend và pattern React modal của POS. |
| **D4: Constraints** | 5/5 | Tuân thủ tuyệt đối quy định cọc $\ge 10\%$, không thay đổi database schema. |
| **D5: Blast Radius** | 5/5 | Phạm vi khoanh vùng hẹp: chỉ tác động `PosOrderServiceTests.cs` và `CreatePreOrderModal.tsx`, không ảnh hưởng tính năng khác. |

## 2. Điểm phản biện & Giải pháp (Findings)
- **Vấn đề 1 (Low):** Khi người dùng gõ tìm kiếm nhưng không tìm thấy sản phẩm nào?
  - *Giải pháp:* Hiển thị thông báo "Không tìm thấy sản phẩm phù hợp" trong dropdown với hướng dẫn nhập lại.
- **Vấn đề 2 (Low):** Khi gõ tiếng Việt có dấu và không dấu (ví dụ: "sua" vs "sữa")?
  - *Giải pháp:* Sử dụng hàm chuẩn hóa bỏ dấu `normalize('NFD').replace(/[\u0300-\u036f]/g, '')` để tìm kiếm mượt mà cả 2 trường hợp.

## 3. Kết luận
- **Phán quyết:** CHẤP NHẬN (PASS). Đủ điều kiện chuyển sang bước thực thi (Apply).
