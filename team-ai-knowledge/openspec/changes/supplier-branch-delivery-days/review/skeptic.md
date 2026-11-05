# Review (Skeptic): supplier-branch-delivery-days

## 1. Đánh giá 5 Chiều (D1 – D5)

| Chiều đánh giá | Điểm (1–5) | Nhận xét chi tiết |
|---|---|---|
| **D1: Completeness** (Độ đầy đủ) | 5/5 | Đã bao phủ toàn diện từ Database, Entity, Backend Service, API Endpoints đến UI Modals, Table và tích hợp Order Matrix. |
| **D2: Correctness** (Tính đúng đắn) | 5/5 | Logic fallback về lịch gốc của Supplier khi chi nhánh chưa có override đảm bảo an toàn 100% cho dữ liệu cũ. |
| **D3: Coherence** (Tính nhất quán) | 5/5 | Đồng nhất quy ước đánh chỉ số thứ trong tuần `0 = Sunday` đến `6 = Saturday` trên toàn bộ hệ thống BE và FE. |
| **D4: Constraints** (Ràng buộc kiến trúc) | 5/5 | Tuân thủ Clean Architecture, Multi-tenant Isolation theo `TenantId`, phân quyền nghiêm ngặt theo Role `STORE_OWNER`. |
| **D5: Blast Radius** (Phạm vi ảnh hưởng) | 5/5 | Tác động cục bộ trong module Supplier-Branch, không gây hồi quy đến luồng bán hàng POS hay quản lý tồn kho. |

## 2. Các vấn đề phân loại

- **HIGH**: Không có.
- **MEDIUM**: Trường hợp Store Owner bỏ chọn tất cả 7 ngày trong tuần.
  - *Giải pháp*: Frontend hiển thị cảnh báo yêu cầu chọn ít nhất 1 ngày giao hàng hoặc xác nhận chi nhánh tạm thời không nhận hàng từ NCC này. Backend lưu mảng rỗng `[]` và hiển thị `SUPPLIER_OFF` trên mọi ngày của ma trận.
- **LOW**: Định dạng chuỗi hiển thị khi chi nhánh nhận hàng cả 7 ngày trong tuần.
  - *Giải pháp*: Hiển thị nhãn `Tất cả các ngày` hoặc `CN, T2–T7`.

## 3. Kết luận
**CHẤP NHẬN (Approved)**. Tài liệu đặc tả kỹ thuật và kiến trúc giải pháp đạt chất lượng xuất sắc, sẵn sàng cho khâu áp dụng và nghiệm thu.
