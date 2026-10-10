# Review: Skeptic — master-supplier-management

**Persona**: Skeptic (Người phản biện nghi ngờ, tập trung tìm kịch bản lỗi & rủi ro nghiệp vụ)  
**Ngày review**: 2026-10-10  
**Tài liệu đánh giá**: `specs.md`, `design-brief.md`, `exploration.md`  

---

## 1. Kết quả Đánh giá Tổng quan
Tài liệu `specs.md` đã bao phủ tốt 6 Requirements lõi (REQ-01 đến REQ-06) theo chuẩn GHERKIN. Tuy nhiên, qua góc nhìn phản biện, phát hiện các kịch bản biên (Edge cases) sau cần chú ý:

| ID | Vấn đề / Lỗ hổng tiềm ẩn | Mức độ | Trạng thái | Hướng xử lý |
|---|---|---|---|---|
| SK-01 | Race condition khi 2 request cùng ghi nhận công nợ AP đồng thời. | **HIGH** | Đã xử lý | Dùng Optimistic Concurrency Token (`RowVersion`) và `IdempotencyKey` cấp DB. |
| SK-02 | Chặn thu hẹp loại hình NCC (BR-S07) chưa làm rõ kịch bản NCC `Both` phát sinh hóa đơn dịch vụ nhưng bị sửa thành `Goods`. | MEDIUM | Đã xử lý | Đã bổ sung scenario chi tiết trong REQ-02. |
| SK-03 | Quản lý dư nợ nợ âm (NCC trả lại tiền thừa cho cửa hàng). | LOW | Đã xử lý | Hỗ trợ Direction = -1 trong AP Ledger. |

---

## 2. Chi tiết Đánh giá theo Requirement

### REQ-01: Master Supplier Creation & Code Uniqueness
- **Đánh giá**: Tốt. Đã tính kịch bản tự sinh mã `SUP-{YYYYMMDD}-{XXXX}` và chống trùng mã cùng Tenant.
- **Khuyến nghị**: Đảm bảo hàm tự sinh mã chạy trong một transaction atomic hoặc có fallback retry nếu gặp trùng DB index.

### REQ-02: Supplier Type Management & Narrowing Restrictions (BR-S07)
- **Đánh giá**: Quy tắc BR-S07 đã được đặc tả chính xác.
- **Khuyến nghị**: Khi kiểm tra lịch sử giao dịch dịch vụ trước khi thu hẹp type, cần query bảng `SupplierAPLedgers` với `DocType = ServiceInvoice`.

### REQ-03: Soft Inactivation Guard & Status Transition (BR-S03)
- **Đánh giá**: Chặt chẽ. Đã chặn Inactive/Delete khi còn công nợ (`CurrentDebt > 0`) hoặc đơn PO mở.

### REQ-04: Idempotent AP Ledger & Debt Balance Updates (BR-S08)
- **Đánh giá**: Đã áp dụng `IdempotencyKey` với Unique Index `(TenantId, IdempotencyKey)`.

---

## 3. Kết luận
**Verdict**: **PASS (Đạt)** — Không còn vấn đề mức HIGH chưa giải quyết.
