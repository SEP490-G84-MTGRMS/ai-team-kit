# Specs: store-product-management

## ADDED/MODIFIED Requirements (Phase 2)

### Requirement: REQ-STOREPROD-07 Cột ảnh và giá bán theo ĐVT trên danh sách
Hệ thống MUST hiển thị trên bảng `/store-owner/stores/products`:
- Cột **Ảnh**: thumbnail từ `imageUrl` của Master Product; khi thiếu ảnh MUST hiện placeholder.
- Cột **Giá bán theo ĐVT**: tổng hợp các mức giá theo đơn vị tính (từ unit prices hiệu lực tại CN).

#### Scenario: Hiển thị đủ ảnh và ĐVT
- **WHEN** sản phẩm có ImageUrl và ≥1 ProductUnit
- **THEN** hàng trên table hiện ảnh và chuỗi tổng hợp giá theo từng ĐVT

#### Scenario: Thiếu ảnh
- **WHEN** không có ImageUrl
- **THEN** hiện placeholder, không lỗi layout

---

### Requirement: REQ-STOREPROD-08 Nguồn giá vốn & khóa chỉnh sửa giá nhập / MOQ
- Giá vốn trên list/edit MUST lấy từ **SupplierProduct** (giá mua hiệu lực).
- Màn cửa hàng MUST NOT cho sửa giá nhập (cost/agreed) hay MOQ.
- API update BranchProduct MUST ignore/reject payload cố sửa cost/MOQ/Agreed.

#### Scenario: Edit không đổi MOQ/giá nhập
- **WHEN** Store Owner mở Edit
- **THEN** giá vốn và MOQ read-only; lưu chỉ ảnh hưởng giá bán (và trạng thái nếu có)

---

### Requirement: REQ-STOREPROD-09 Gán SP — tìm chi nhánh + giá bán mặc định Master
Assign modal MUST:
- Cho tìm/chọn chi nhánh bằng **ô nhập text** (mã hoặc tên).
- Hiển thị địa chỉ chi nhánh dạng text/input theo CN đã chọn.
- Không yêu cầu nhập giá vốn/MOQ.
- Giá bán khởi tạo/mặc định từ Master Product / ProductUnit.

#### Scenario: Tìm chi nhánh bằng text
- **WHEN** user gõ một phần mã/tên CN
- **THEN** danh sách gợi ý lọc đúng; chọn xong địa chỉ cập nhật theo CN

---

### Requirement: REQ-STOREPROD-10 Edit giá bán theo từng ĐVT
Edit modal MUST cho sửa giá bán theo từng đơn vị tính và lưu override tại chi nhánh (không sửa giá nhập/MOQ).

#### Scenario: Lưu giá theo ĐVT
- **WHEN** user đổi giá một ĐVT và Lưu
- **THEN** reload list phản ánh giá mới trong cột tổng hợp ĐVT / giá bán hiệu lực

---

## Requirements Phase 1 (giữ nguyên ý)
- REQ-STOREPROD-01 … 06: list/filter/assign/edit status/remove như đã triển khai; Phase 2 bổ sung 07–10 ở trên.

## Acceptance Checklist (Phase 2)
- [ ] REQ-STOREPROD-07: Cột ảnh + giá bán theo ĐVT trên table
- [ ] REQ-STOREPROD-08: Cost từ SupplierProduct; không sửa giá nhập/MOQ
- [ ] REQ-STOREPROD-09: Assign — search CN text + địa chỉ; default giá bán Master
- [ ] REQ-STOREPROD-10: Edit — sửa giá bán từng ĐVT thành công
