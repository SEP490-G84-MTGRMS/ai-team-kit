# Specs: supplier-store-assignment (Delta Refactor)

> Delta specs bổ sung cho capability `supplier`. Sẽ được merge vào `openspec/specs/supplier/spec.md` khi archive.

## MODIFIED REQUIREMENTS

### Requirement: REQ-SBA01 Branch-Centric Supplier Allocation (Refactored Flow)
Hệ thống MUST chuyển đổi luồng phân bổ trên popup từ "Chọn 1 NCC -> Gán nhiều chi nhánh" sang **"Chọn 1 Chi nhánh -> Thêm nhiều NCC cho chi nhánh đó"**.
- Quan hệ giữa Branch và Supplier là quan hệ nhiều - nhiều (`Many-to-Many`).
- Một chi nhánh có thể được gán nhiều nhà cung cấp.
- Một nhà cung cấp có thể phục vụ nhiều chi nhánh.
- Một cặp `(BranchId, SupplierId)` chỉ được tồn tại một bản ghi duy nhất trong cùng Tenant.
- Khi chọn Chi nhánh A, hệ thống tự động loại trừ các nhà cung cấp đã được gán (ở trạng thái `Active`) cho Chi nhánh A. Nhà cung cấp đó vẫn hiển thị khả dụng khi phân bổ cho Chi nhánh B nếu chưa tồn tại quan hệ.

#### Scenario: Gán nhiều NCC cho một chi nhánh thành công
- **GIVEN** Chi nhánh `MT-Mart Quận 1` hiện chưa được gán `NCC A` và `NCC B`.
- **WHEN** Store Owner mở popup, chọn chi nhánh `MT-Mart Quận 1`, tìm kiếm và tích chọn `NCC A`, `NCC B`, rồi nhấn "Lưu phân bổ".
- **THEN** Hệ thống lưu thành công 2 liên kết `(MT-Mart Quận 1, NCC A)` và `(MT-Mart Quận 1, NCC B)`, đóng popup và tự động làm mới danh sách phân bổ.

---

## ADDED REQUIREMENTS

### Requirement: REQ-SBA04 Available Suppliers Filtering for Selected Branch
Hệ thống MUST cung cấp danh sách nhà cung cấp khả dụng cho một chi nhánh được chọn với các tiêu chí nghiêm ngặt:
1. **Trạng thái NCC**: Chỉ hiển thị các nhà cung cấp đang ở trạng thái hoạt động (`Status == Active`). NCC bị `Inactive` toàn hệ thống MUST bị ẩn hoàn toàn (SUP-03).
2. **Loại trừ NCC đã gán**: Bất kỳ NCC nào đã có liên kết `Active` với chi nhánh đang chọn MUST không xuất hiện trong danh sách lựa chọn (SUP-02).
3. **Trường hợp đã từng ngừng phân bổ**: NCC đã từng được gán nhưng hiện đang ở trạng thái `Inactive` với chi nhánh đó thì ĐƯỢC PHÉP hiển thị lại để Store Owner có thể tái kích hoạt quan hệ phân bổ.
4. **Empty States**:
   - Nếu chi nhánh đã được gán toàn bộ các NCC đang hoạt động: Hiển thị thông báo *"Tất cả nhà cung cấp đang hoạt động đã được gán cho chi nhánh này"* (SUP-06).
   - Nếu từ khóa tìm kiếm không khớp NCC nào: Hiển thị thông báo *"Không tìm thấy nhà cung cấp phù hợp"* (SUP-07).

#### Scenario: Ẩn NCC đã được gán khi đổi chi nhánh
- **GIVEN** `MT-Mart Quận 1` đã gán `NCC A, NCC B, NCC C`. `MT-Mart Cầu Giấy` đã gán `NCC A, NCC D`.
- **WHEN** Người dùng chọn chi nhánh `MT-Mart Quận 1`:
- **THEN** Danh sách NCC khả dụng không chứa `NCC A, NCC B, NCC C`.
- **WHEN** Người dùng đổi sang chọn chi nhánh `MT-Mart Cầu Giấy`:
- **THEN** Hệ thống xóa toàn bộ lựa chọn cũ (BR-04), tải lại danh sách mới không chứa `NCC A, NCC D`, nhưng `NCC B` và `NCC C` xuất hiện bình thường.

---

### Requirement: REQ-SBA05 Comprehensive Validation Matrix & Re-activation
Hệ thống MUST kiểm soát chặt chẽ 4 nhóm validation nghiệp vụ:

#### 1. Nhóm A — Validation Chi nhánh:
- **BR-01**: Chưa chọn chi nhánh -> Không cho tích chọn/lưu NCC; hiển thị yêu cầu chọn chi nhánh.
- **BR-02**: Chi nhánh bị vô hiệu hóa -> Chặn phân bổ.
- **BR-03**: Chi nhánh không tồn tại hoặc sai Tenant -> Backend từ chối 404/403.
- **BR-04**: Đổi chi nhánh -> Tự động xóa danh sách NCC đã chọn và tải lại danh sách khả dụng.

#### 2. Nhóm B — Validation Nhà cung cấp:
- **SUP-01**: Chưa chọn NCC nào -> Disable nút Lưu hoặc báo lỗi yêu cầu chọn ít nhất 1 NCC.
- **SUP-04**: NCC không tồn tại trong Tenant -> Backend từ chối request.
- **SUP-05**: Cho phép tích chọn và lưu đồng thời nhiều NCC hợp lệ.

#### 3. Nhóm C — Validation Lưu Phân bổ & Data Integrity:
- **MAP-01**: Loại bỏ các ID trùng lặp trong request trước khi xử lý.
- **MAP-02**: Unique Index `UX_BranchSuppliers_Branch_Supplier` hoặc `(TenantId, SupplierId, BranchId)` ngăn chặn race-condition khi 2 người dùng cùng gán đồng thời.
- **MAP-03 & MAP-04**: Backend kiểm tra lại trạng thái `Active` của chi nhánh và toàn bộ NCC trước khi commit.
- **MAP-05**: Nguyên tắc **All-or-Nothing**: Thực thi trong 1 Database Transaction duy nhất. Nếu 1 NCC không hợp lệ, rollback toàn bộ để tránh dữ liệu phân bổ dở dang.
- **MAP-06**: Tái kích hoạt thông minh: Nếu cặp `(BranchId, SupplierId)` đã tồn tại bản ghi nhưng `Status == Inactive`, cập nhật lại thành `Active` và xóa `InactiveReason`, không insert mới gây lỗi Duplicate Key.
- **MAP-07**: Chống spam double-click: Disable nút "Lưu phân bổ" và hiển thị trạng thái loading trong khi đang gửi request.

#### 4. Nhóm D — Thao tác UI & Tìm kiếm:
- Tìm kiếm không phân biệt chữ hoa/chữ thường, tìm theo cả Mã và Tên NCC.
- Nút "Chọn tất cả" chỉ áp dụng cho các NCC đang hiển thị khớp với từ khóa tìm kiếm và còn khả dụng.
- Cập nhật tức thời số lượng đã chọn (`Đã chọn: X nhà cung cấp`).
- Nút "Hủy" hoặc đóng popup không làm thay đổi dữ liệu hiện tại.
