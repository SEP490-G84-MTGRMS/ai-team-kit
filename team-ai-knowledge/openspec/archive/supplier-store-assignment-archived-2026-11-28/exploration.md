# Exploration: supplier-store-assignment

## 1. Khảo sát hiện trạng hệ thống MT-GRMS

### 1.1. Thực thể cơ sở dữ liệu (Domain Entity)
Hệ thống Backend đã có sẵn entity `SupplierBranchAssignment` trong `src/MT_GRMS.Domain/Entities/Supplier/SupplierBranchAssignment.cs`:
```csharp
public class SupplierBranchAssignment : BaseTenantEntity
{
    public Guid SupplierId { get; set; }
    public Supplier? Supplier { get; set; }

    public Guid BranchId { get; set; }
    public Branch? Branch { get; set; }
}
```
Và bảng `supplier_branch_assignments` trong migration `20261027152502_AddSupplierBranchAssignmentsAndCutoff.cs` với Unique Index trên `(TenantId, SupplierId, BranchId)`.

### 1.2. Màn hình tham chiếu chuẩn: `/store-owner/suppliers/products`
Màn hình "Sản Phẩm Theo Nhà Cung Cấp" có các đặc điểm thiết kế xuất sắc mà người dùng rất hài lòng:
1. **Header**:
   - Icon phân hệ + Tiêu đề lớn (`h1`), hiệu ứng spin loader khi đang tải dữ liệu.
   - Các action button chuẩn KiotViet: `Danh sách NCC` (`admin-btn-secondary`), `Xuất Excel`, `+ Gán mới` (`admin-btn-primary`).
2. **Filter Bar**:
   - Thiết kế 2 dòng phân tầng khoa học:
     - Dòng 1: Tìm kiếm theo đối tượng chính và đối tượng phụ (input text rộng rãi, label inline nằm ngang), kèm các dropdown lọc nhanh.
     - Dòng 2: Dropdown chọn danh mục nhanh, badge "Đang áp dụng bộ lọc", và cụm nút `[ 🔍 Tìm kiếm ]` & `[ ↺ Đặt lại ]` nằm ở góc phải.
3. **Data Table**:
   - Phân bố cột rõ ràng với độ rộng tỷ lệ hợp lý, header cố định, thanh cuộn nội bộ mượt mà.
   - Thao tác nhanh tại từng dòng: Sửa, Đổi trạng thái, Hủy liên kết.
4. **Paging Footer**:
   - Đếm số lượng hiển thị (Hiển thị `start` - `end` trên `total` bản ghi).
   - Chọn số bản ghi/trang (mặc định 12).
   - Nút Trước / Sau phân trang.

---

## 2. Các phương án kiến trúc & Giao diện

### Phương án 1: Hiển thị dạng Mối quan hệ phẳng (Flat N-N Mapping Table) - KHUYẾN NGHỊ
- **Cách hiển thị**: Mỗi dòng trong bảng là một cặp `(Nhà cung cấp - Cửa hàng)`.
- **Ưu điểm**:
  - Dễ lọc, dễ sắp xếp theo từng chi nhánh hoặc theo từng nhà cung cấp.
  - Phù hợp hoàn hảo với kiến trúc của màn hình tham chiếu `/store-owner/suppliers/products`.
  - Dễ thực hiện các thao tác đơn lẻ như hủy gán 1 cửa hàng khỏi 1 nhà cung cấp.

### Phương án 2: Hiển thị dạng Nhóm theo Nhà Cung Cấp (Grouped by Supplier with Multi-tag Badges)
- **Cách hiển thị**: Mỗi dòng là một Nhà cung cấp, cột Cửa hàng hiển thị danh sách các badge chi nhánh được gán.
- **Nhược điểm**: Khó lọc độc lập theo từng chi nhánh cụ thể, bảng bị co giãn không đồng đều khi số lượng chi nhánh lớn.

=> **Quyết định**: Chọn **Phương án 1** vì bám sát 100% màn hình chuẩn `/store-owner/suppliers/products`.

---

## 3. Kiến trúc Component dự kiến
- `SupplierBranchManagementPage.tsx`: Trang chính điều phối state, pagination và gọi API.
- `SupplierBranchFilterBar.tsx`: Thanh lọc với 2 ô input riêng biệt (`Nhà cung cấp`, `Cửa hàng/Chi nhánh`) và dropdowns.
- `SupplierBranchTable.tsx`: Bảng dữ liệu hiển thị liên kết.
- `SupplierBranchTableRow.tsx`: Từng hàng dữ liệu có status badge và các action buttons.
- `AssignBranchModal.tsx`: Modal gán Nhà cung cấp cho một hoặc nhiều Cửa hàng.
