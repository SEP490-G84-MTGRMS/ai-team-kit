# Skeptic Review: create-purchase-order

**Persona**: Skeptic (Người phản biện nghi ngờ, tập trung tìm kịch bản lỗi, mâu thuẫn & rủi ro nghiệp vụ)  
**Ngày review**: 2026-10-12  
**Tài liệu đánh giá**: `specs.md`, `design-brief.md`, `exploration.md`, `proposal.md`  

---

## 1. Bảng Điểm 5 Chiều (D1–D5)

| Chiều | Điểm (1–5) | Nhận xét chi tiết |
|---|:---:|---|
| **D1 Completeness** | 4.5/5 | 8 Requirements được mô tả chi tiết, bao quát đầy đủ 5 quy tắc nghiệp vụ cốt lõi (BR-1 đến BR-5), có đầy đủ kịch bản chính và edge case Gherkin. |
| **D2 Correctness** | 4.0/5 | Logic tính toán hạn mức tín dụng và công thức định danh 1 PO = 1 NCC + 1 Chi nhánh + 1 Ngày giao là chính xác. Tuy nhiên có bất cập về kiểu dữ liệu số lượng đối với hàng cân ký. |
| **D3 Coherence** | 5.0/5 | Thống nhất chặt chẽ giữa proposal ↔ exploration ↔ design-brief ↔ specs; thuật ngữ và mã quy tắc BR-1 đến BR-5 được giữ nhất quán. |
| **D4 Constraints** | 4.5/5 | Tuân thủ triệt để đa tenant qua `TenantId`, định dạng tiền tệ `decimal(18,2)` và phân quyền Store Owner vs Branch Staff. |
| **D5 Blast Radius** | 5.0/5 | Thiết kế module độc lập, thêm bảng mới `SupplierDeliveryConfigs`, `PurchaseOrders`, `PurchaseOrderDetails`; không gây breaking changes cho Master Supplier hay Catalog hiện hữu. |

---

## 2. Danh sách Vấn đề & Khuyến nghị

### [HIGH] SK-01: Bất cập kiểu dữ liệu số lượng `INT` đối với hàng nông sản / thịt tươi sống bán theo Kg
- **Trích dẫn**: `design-brief.md` khai báo `[OrderedQuantity] INT NOT NULL` và DTO `quantity: number`.
- **Rủi ro**: Hàng nông sản tươi sống (rau, thịt, củ quả Đà Lạt) thường xuyên nhập theo số lượng lẻ (ví dụ: `2.5 kg` thịt bò xay, `1.75 kg` cá hồi, `3.2 kg` rau xà lách). Nếu giới hạn ở số nguyên `INT`, người dùng sẽ không thể đặt đúng khối lượng thực tế.
- **Đề xuất**: Sửa kiểu dữ liệu `OrderedQuantity` và `TotalQuantity` trong CSDL thành `DECIMAL(12,3)` để hỗ trợ cả số lượng nguyên (thùng, két, gói) lẫn số lượng lẻ tới 3 chữ số thập phân (kg, tấn, lít).

### [MEDIUM] SK-02: Nguy cơ Race Condition khi kiểm tra hạn mức tín dụng Credit Limit đồng thời
- **Trích dẫn**: REQ-PO-03 (Kiểm soát Hạn Mức Tín Dụng).
- **Rủi ro**: Nếu 2 chi nhánh cùng mở ma trận lúc hạn mức còn đủ, và cùng bấm Submit POs gần như đồng thời, cả 2 request đều thấy "Safe" ở bước đọc dữ liệu, dẫn đến việc commit cả 2 đợt PO và làm vượt hạn mức nợ thực tế cấp DB.
- **Đề xuất**: Tại Backend API `POST /api/v1/purchase-orders/batch-from-grid`, bắt buộc thực hiện kiểm tra hạn mức trong cùng một Database Transaction với mức cô lập phù hợp (hoặc kiểm tra `RowVersion` / Lock nợ NCC) trước khi ghi dữ liệu.

### [LOW] SK-03: Cảnh báo mất dữ liệu khi người dùng đổi Nhà cung cấp hoặc Chi nhánh trên thanh bộ lọc
- **Trích dẫn**: REQ-PO-01 & REQ-PO-08.
- **Rủi ro**: Người dùng đã nhập liệu dở dang nhiều ô số lượng nhưng vô tình bấm đổi dropdown Nhà cung cấp hoặc Chi nhánh khác làm mất trắng dữ liệu chưa lưu.
- **Đề xuất**: Nếu `dirty = true` (có ô đã sửa), hệ thống hiển thị hộp thoại xác nhận: *"Bạn có thay đổi chưa lưu trên ma trận. Bạn có chắc chắn muốn chuyển sang NCC/Chi nhánh khác?"*.

---

## 3. Kết luận
**Trạng thái**: **Chấp nhận (Đã xử lý các khuyến nghị)**  
Các vấn đề đã được ghi nhận và cập nhật vào `specs.md` & `design-brief.md` (chuyển số lượng sang `DECIMAL(12,3)`, bổ sung transaction check cho Credit Limit, và xác nhận khi chuyển filter lúc có dữ liệu dirty).
