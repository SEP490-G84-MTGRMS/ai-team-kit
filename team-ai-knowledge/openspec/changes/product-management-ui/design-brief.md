# Design Brief: product-management-ui
## Giao diện Danh sách Hàng hóa, Bộ lọc, Chi tiết & Cập nhật Hàng hóa (Update Product)

## 1. Luồng Tương tác Cập nhật Hàng hóa (Sequence Diagram)

```mermaid
sequenceDiagram
    autonumber
    actor User as Chủ tiệm / Quản lý
    participant List as ProductListPage
    participant Modal as ProductFormModal
    participant API as productApi
    participant BE as Backend Products & Units Controller

    User->>List: Bấm nút "Sửa" trên dòng sản phẩm (hoặc từ ProductDetailModal)
    List->>Modal: Mở ProductFormModal (isEditing = true, truyền productToEdit)
    
    alt Nếu productToEdit chưa có uomConversions
        Modal->>API: GET /api/v1/products/{id}/units
        API->>BE: Lấy danh sách đơn vị quy đổi
        BE-->>API: Trả về danh sách ProductUnitResponse
        API-->>Modal: Điền vào bảng Hàng cùng loại
    end

    Note over Modal: 1. Mã hàng (productCode) bị disabled<br/>2. Các trường: Tên, Nhóm hàng, Giá bán, ĐVT cơ bản, Tồn kho được nạp sẵn

    User->>Modal: Chỉnh sửa tên hàng, giá bán, thêm đơn vị mới "hop", sửa giá đơn vị "thung", xóa đơn vị "loc"
    Note over Modal: Ghi nhận đơn vị "loc" vào danh sách deletedUnitIds: ["uom-guid-loc"]
    User->>Modal: Bấm "Lưu"
    Modal->>List: onSave(payload, saveAndAddNew = false, deletedUnitIds)

    List->>API: 1. PUT /api/v1/products/{id} (Cập nhật thông tin chính)
    API->>BE: UpdateProductAsync
    BE-->>API: 200 OK (ProductResponse)

    loop Với mỗi ID trong deletedUnitIds
        List->>API: 2. DELETE /api/v1/product-units/{id}
        API->>BE: Delete unit
        BE-->>API: 200 OK
    end

    loop Với mỗi uom trong uomConversions
        alt uom.id bắt đầu bằng "uom-" (Đơn vị mới)
            List->>API: 3a. POST /api/v1/products/{id}/units
            API->>BE: Create unit
            BE-->>API: 201 Created
        else uom.id là GUID (Đơn vị cũ được sửa)
            List->>API: 3b. PUT /api/v1/product-units/{id}
            API->>BE: Update unit
            BE-->>API: 200 OK
        end
    end

    List->>List: Refresh danh mục & danh sách sản phẩm (fetchProducts, fetchCategories)
    List->>User: Đóng modal & hiển thị Toast thông báo thành công
```

---

## 2. Kiến trúc Giao diện Cập nhật trong `ProductFormModal.tsx`

### 2.1 Trạng thái các trường dữ liệu ở chế độ Chỉnh sửa (`isEditing = true`)
1. **Tiêu đề Modal**:
   - Chuyển thành `Chỉnh sửa hàng hóa: {productToEdit.productName}` kèm huy hiệu `Mã: {productToEdit.productCode}`.
2. **Mã hàng (`productCode`)**:
   - `disabled = true`, nền xám nhẹ `#F1F5F9`, chữ xám `#64748B`.
   - Tooltip/Ghi chú: "Mã hàng hóa không thể thay đổi sau khi tạo."
3. **Mã vạch (`barcode`)**:
   - Cho phép chỉnh sửa (kiểm tra unique từ backend).
4. **Tên hàng hóa & Nhóm hàng**:
   - Cho phép chỉnh sửa.
5. **Giá vốn (`costPrice`)**:
   - Nếu `userRole === 'StoreOwner'`: Cho phép chỉnh sửa.
   - Nếu `userRole === 'Cashier'`: Ẩn hoàn toàn (BR-SEC-01).
6. **Giá bán & Thuế VAT**:
   - Cho phép chỉnh sửa.
7. **Đơn vị cơ bản & Bảng Hàng cùng loại**:
   - Hiển thị đầy đủ đơn vị cơ bản và các đơn vị quy đổi đã lưu.
   - Cho phép sửa tỷ lệ quy đổi, mã vạch, giá bán của từng đơn vị quy đổi.
   - Nút Xóa `Trash2`: Khi xóa đơn vị quy đổi đã có trong DB, tự động ghi nhận ID vào `deletedUnitIds`.

---

## 3. Quy tắc Nghiệp vụ (Business Rules)
1. **REQ-09 (Cập nhật Hàng hóa & Đơn vị tính)**:
   - Hệ thống MUST hỗ trợ chỉnh sửa thông tin hàng hóa hiện có và đồng bộ toàn diện với các đơn vị tính quy đổi.
   - Đơn vị quy đổi mới được tạo mới (`POST`), đơn vị đã có được cập nhật (`PUT`), đơn vị bị xóa được gỡ bỏ khỏi backend (`DELETE`).
2. **Bất biến Mã hàng**: Mã hàng (`productCode`) là khóa định danh duy nhất của sản phẩm, không được phép thay đổi sau khi tạo.
3. **BR-SEC-01 (Bảo mật Giá vốn)**: Quyền chỉnh sửa giá vốn chỉ cấp cho `StoreOwner`.
