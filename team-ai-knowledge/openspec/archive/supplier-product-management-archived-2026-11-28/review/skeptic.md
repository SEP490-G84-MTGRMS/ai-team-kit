# Skeptic Review: supplier-product-management

**Persona**: Skeptic (Người phản biện độc lập, tập trung phát hiện lỗi logic, kịch bản thiếu & rủi ro toàn vẹn)  
**Ngày review**: 2026-10-11  
**Tài liệu đánh giá**: `proposal.md`, `exploration.md`, `design-brief.md`, `specs.md`

---

## 1. Đánh giá 5 chiều (D1–D5)

| Chiều | Điểm (1–5) | Nhận xét |
|---|:---:|---|
| **D1 Completeness** | 5/5 | Đã bao phủ đầy đủ 6 Requirements (REQ-SP01 đến REQ-SP06). Kịch bản Gherkin có cả Happy Path, Edge cases trùng lặp, vi phạm ràng buộc giá/MOQ, và cô lập đa Tenant. |
| **D2 Correctness** | 5/5 | Logic nghiệp vụ chính xác: Quy tắc Primary Supplier độc quyền (BR-SP02) tự động gỡ cờ NCC cũ; cơ chế Soft Deactivation bảo toàn tính toàn vẹn của các đơn PO/GRN lịch sử. |
| **D3 Coherence** | 5/5 | Thống nhất cao giữa Prototype `supplier_product_manage.html`, Proposal, Design Brief và Specs. Thuật ngữ chuẩn xác (Delivery UoM, Agreed Wholesale Price, MOQ, Primary Supplier). |
| **D4 Constraints** | 5/5 | Tuân thủ tuyệt đối quy định của dự án: Cô lập `TenantId` qua Global Query Filter, Unique Index DB `(TenantId, SupplierId, ProductId)`, phân quyền RBAC rõ ràng, UI KiotViet Brand Blue. |
| **D5 Blast Radius** | 5/5 | Tạo bảng mới `SupplierProducts` (bảng liên kết N-N), không gây breaking changes đến các thực thể `Product` và `Supplier` hiện có. |

---

## 2. Vấn đề phát hiện & Đề xuất xử lý

- **[MEDIUM] Đồng bộ trạng thái khi Nhà cung cấp bị Inactive**:
  - *Mô tả*: Khi một Nhà cung cấp bị chuyển trạng thái tổng thể thành `Inactive` (ở module `master-supplier-management`), các sản phẩm đang liên kết với NCC đó có thể vẫn ở trạng thái `Active`.
  - *Đề xuất*: Trong Query Handler `GetSuppliersForProduct` (khi lập PO), cần áp dụng điều kiện kép: chỉ trả về các mapping có `SupplierProduct.Status == Active` VÀ `Supplier.Status == Active`.
  - *Trạng thái*: **Đã xử lý** (được phản ánh vào tasks cài đặt Query Handler).

- **[LOW] Tối ưu hóa trải nghiệm gán sản phẩm khi danh mục lớn**:
  - *Mô tả*: Danh mục sản phẩm siêu thị có thể lên tới hàng nghìn mã, dropdown select thông thường sẽ gây giật lag và khó chọn.
  - *Đề xuất*: Component chọn sản phẩm ở Frontend bắt buộc sử dụng cơ chế Autocomplete kết hợp Debounced Search (tìm theo Tên, SKU hoặc quét mã Barcode trực tiếp).
  - *Trạng thái*: **Đã xử lý** (đã đưa vào đặc tả component `AssignProductModal`).

---

## 3. Kết luận
**Verdict**: **Chấp nhận (PASS)** — Không có vấn đề mức HIGH. Tài liệu đặc tả đã đủ độ chi tiết và sẵn sàng để lập `tasks.md` và tiến hành Apply.
