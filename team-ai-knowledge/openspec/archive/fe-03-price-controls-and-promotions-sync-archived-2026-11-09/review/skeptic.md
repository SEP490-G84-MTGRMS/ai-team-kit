# Review: Skeptic Persona — fe-03-price-controls-and-promotions-sync

## 1. Đánh giá 5 Tiêu chí (Dimensions D1 - D5)

| Tiêu chí | Điểm (1-5) | Nhận xét chi tiết |
|---|:---:|---|
| **D1: Completeness** (Đầy đủ) | 5/5 | Bao quát trọn vẹn FE-03.1 (Below-cost), FE-03.2 (History tracking), bảo toàn bậc thang khuyến mãi, chọn quà tặng và chuẩn hóa ngày voucher. |
| **D2: Correctness** (Chính xác) | 5/5 | Giải quyết đúng nguyên nhân gốc rễ: lỗi khóa ngoại `ProductId` trong promotion conditions, lỗi lệch múi giờ date voucher, và phân tách đúng phạm vi Master/Branch giá. |
| **D3: Coherence** (Nhất quán) | 5/5 | Nhất quán hoàn toàn với Clean Architecture 4 tầng, Clean DDD entities, REST API conventions và mô hình đa chi nhánh của hệ thống MT-GRMS. |
| **D4: Constraints** (Ràng buộc & Quy tắc) | 5/5 | Tuân thủ tuyệt đối quy tắc Zero-Friction UX: không ép người dùng nhập lý do thủ công khi đổi giá thông thường; bảo đảm multi-tenant isolation. |
| **D5: Blast Radius** (Phạm vi ảnh hưởng) | 5/5 | Kiểm soát vùng ảnh hưởng tốt; các thay đổi CSDL cho `ProductPriceHistories` độc lập, không làm hỏng cấu trúc sản phẩm hiện hành. |

---

## 2. Điểm kiểm tra rủi ro (Risk Checklist)
- [x] **Tránh làm phiền người dùng**: Giá bán ≥ Giá vốn tự động gán lý do `"Điều chỉnh giá bán"` và ghi log ngầm.
- [x] **Xử lý bậc thang khuyến mãi đơn hàng**: Dùng metadata `Description` (`[TIERS_JSON]...`) đảm bảo không vi phạm khóa ngoại CSDL khi bậc không gắn sản phẩm.
- [x] **Hiệu lực voucher**: Dùng `Date` địa phương tránh lệch giờ UTC.
- [x] **Quyền hạn**: Chỉ Quản lý / Chủ tiệm mới được xác nhận duyệt bán dưới giá vốn.

---

## 3. Kết luận
- **Kết luận**: **CHẤP NHẬN (Approved)**. Đủ điều kiện phê duyệt để triển khai `tasks.md`.
