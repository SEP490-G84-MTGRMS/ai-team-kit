# Specs: supplier-store-assignment

> Delta specs bổ sung cho capability `supplier`. Sẽ được merge vào `openspec/specs/supplier/spec.md` khi archive.

## ADDED REQUIREMENTS

### Requirement: REQ-SBA01 Supplier Store Assignment Creation (BR-SBA01)
Hệ thống MUST cho phép Store Owner gán một Nhà cung cấp (`Supplier`) cho một hoặc nhiều Cửa hàng / Chi nhánh (`Branch`) trong cùng Tenant. Hệ thống MUST ngăn chặn việc tạo trùng lặp cặp liên kết `(SupplierId, BranchId)` đã tồn tại.

#### Scenario: Gán NCC cho nhiều chi nhánh cùng lúc thành công
- **GIVEN** Nhà cung cấp `Vinamilk` và 3 chi nhánh `CN Quận 1`, `CN Thủ Đức`, `Kho Tổng`.
- **WHEN** Store Owner chọn `Vinamilk` và tích chọn cả 3 chi nhánh rồi nhấn "Lưu phân bổ".
- **THEN** Hệ thống lưu 3 bản ghi vào `SupplierBranchAssignments` và trả về thông báo thành công.

#### Scenario: Ngăn chặn gán trùng lặp
- **GIVEN** `Vinamilk` đã được gán cho `CN Quận 1`.
- **WHEN** Người dùng thực hiện gán lại `Vinamilk` cho `CN Quận 1`.
- **THEN** Hệ thống bỏ qua bản ghi trùng hoặc báo lỗi hợp lý không gây duplicate trong CSDL.

---

### Requirement: REQ-SBA02 Multi-Criteria Querying for Supplier-Store Assignments
Hệ thống MUST cung cấp API và giao diện tìm kiếm, phân trang và lọc danh sách phân bổ:
- Tìm kiếm theo Nhà cung cấp (Mã NCC, Tên NCC).
- Tìm kiếm theo Cửa hàng (Mã Cửa hàng, Tên Cửa hàng).
- Lọc theo Cửa hàng cụ thể từ dropdown.
- Lọc theo Trạng thái (Tất cả, Đang liên kết, Tạm ngưng).

#### Scenario: Lọc tất cả nhà cung cấp được gán cho một chi nhánh
- **GIVEN** Chi nhánh `CN Quận 1` có 15 nhà cung cấp được gán.
- **WHEN** Chọn `CN Quận 1` trong dropdown "Chi nhánh" và nhấn "Tìm kiếm".
- **THEN** Bảng dữ liệu chỉ hiển thị đúng 15 bản ghi của `CN Quận 1`.

---

### Requirement: REQ-SBA03 Unlink Supplier from Store (De-assignment)
Hệ thống MUST cho phép Store Owner hủy liên kết giữa Nhà cung cấp và Cửa hàng. Khi hủy liên kết, hệ thống áp dụng Soft Delete (`IsDeleted = true`) để bảo tồn tính toàn vẹn dữ liệu cho các đơn đặt hàng (PO) trong quá khứ của chi nhánh đó.

#### Scenario: Hủy liên kết NCC khỏi chi nhánh
- **GIVEN** Liên kết giữa NCC `A` và Chi nhánh `B` đang hoạt động.
- **WHEN** Người dùng bấm nút "Hủy gán" và xác nhận.
- **THEN** Bản ghi liên kết được cập nhật `IsDeleted = true`, không còn xuất hiện trong danh sách hoạt động.
