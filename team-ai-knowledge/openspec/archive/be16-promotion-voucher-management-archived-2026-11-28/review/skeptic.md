# Skeptic Review: be16-promotion-voucher-management

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Bao quát đầy đủ các yêu cầu cốt lõi (CRUD, $M:N$ conditions, Cart evaluation, Batch vouchers, Validate & Redeem, Multi-Tenancy). Các scenarios có đủ edge case: trùng mã, quá hạn, không đạt min order, chặn trần max discount. |
| D2 Correctness | 5/5 | Logic tính toán chiết khấu % và tiền cố định chuẩn xác, đảm bảo không bao giờ âm tiền giỏ hàng. Trạng thái vòng đời voucher UNUSED -> USED rõ ràng. |
| D3 Coherence | 5/5 | Thống nhất 100% giữa proposal, exploration, design brief và specs. Thuật ngữ nghiệp vụ chuẩn mực khớp với ERD và tài liệu CSDL. |
| D4 Constraints | 5/5 | ID thực thể toàn bộ dùng GUIDv7 (`Uuid7.NewGuid()`), dữ liệu đa người thuê lọc theo `TenantId`, tiền tệ dùng `decimal(18,2)`, ngày giờ lưu UTC. |
| D5 Blast Radius | 5/5 | Không gây phá vỡ (breaking change) các module hiện có. `Promotion` mở rộng thêm trường có giá trị mặc định, `OrderDetail` và `Order` đã có sẵn các trường liên kết. |

## Vấn đề
- [LOW] REQ-PV04: Khi sinh mã voucher tự động hàng loạt theo prefix, cần có cơ chế thử lại (retry) trong trường hợp chuỗi ngẫu nhiên sinh ra bị trùng lặp với mã đã tồn tại trong database. → Đề xuất: Sinh mã kèm hậu tố ngẫu nhiên chữ + số (ví dụ 6-8 ký tự alphanumeric) và kiểm tra tính duy nhất trước khi lưu.

## Kết luận: Chấp nhận
