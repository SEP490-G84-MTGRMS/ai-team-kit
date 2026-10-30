# Design Brief: supplier-store-assignment

## 1. Visual Hierarchy & Design System
Bám sát 100% phong cách thiết kế của màn hình `http://localhost:5173/store-owner/suppliers/products`:
- **Chủ đề màu sắc**: Teal / Cyan chuẩn KiotViet Brand (`#0f766e`, `#0d9488`, background badge `#f0fdfa`, border `#ccfbf1`).
- **Typography**: Inter / Be Vietnam Pro, font mono cho mã (`font-family: var(--font-mono)`).
- **Control Heights**: 32px đồng bộ cho toàn bộ input, select và buttons.
- **Borders & Shadows**: Bo góc 6px cho control, 8px cho card container; `border: 1px solid #cbd5e1`, shadow nhẹ `0 1px 2px rgba(0, 0, 0, 0.03)`.

---

## 2. Layout Chi tiết

### 2.1. Page Header
```
[ Icon Store ] Gán Nhà Cung Cấp Với Cửa Hàng [Spinner nếu loading]
(Right Actions): [ Danh sách NCC ]  [ Xuất Excel ]  [ + Gán NCC cho cửa hàng ]
```

### 2.2. Filter Bar (2 hàng chuẩn)
```
Dòng 1:
- Nhà cung cấp: [ input text 260px: "Nhập mã NCC, tên NCC..." ]
- Cửa hàng / Chi nhánh: [ input text 260px: "Nhập mã CH, tên cửa hàng..." ]
- Chi nhánh: [ dropdown 220px: "-- Tất cả chi nhánh --" ]
- Trạng thái: [ dropdown 160px: "-- Tất cả trạng thái --" ]

Dòng 2:
- Chọn NCC nhanh: [ dropdown: "-- Tất cả nhà cung cấp --" ]
- [ Badge: Đang áp dụng bộ lọc (nếu có) ]
(Right Actions): [ 🔍 Tìm kiếm ]  [ ↺ Đặt lại ]
```

### 2.3. Bảng Dữ Liệu (Columns)
1. `#` (STT): 40px, căn giữa
2. `MÃ NCC`: 110px, monospace, font weight 600
3. `TÊN NHÀ CUNG CẤP`: 220px, font weight 600, link hoặc text rõ ràng
4. `LOẠI NCC`: 130px, badge phân loại (Hàng hóa / Dịch vụ / Cả hai)
5. `MÃ CỬA HÀNG`: 120px, monospace, teal badge
6. `TÊN CỬA HÀNG / CHI NHÁNH`: 200px, font weight 600
7. `ĐỊA CHỈ CHI NHÁNH`: 240px, text phụ màu xám
8. `NGÀY GÁN`: 110px, ngày định dạng DD/MM/YYYY
9. `TRẠNG THÁI`: 120px, Full pill badge (🟢 Đang liên kết / ⚪ Tạm ngưng)
10. `THAO TÁC`: 130px, căn phải ([ ⏻ Ngưng/Bật ], [ 🗑️ Hủy gán ])

### 2.4. Modal Gán Mới
- Tiêu đề: **Gán Nhà Cung Cấp Cho Cửa Hàng**
- Body:
  1. Chọn Nhà cung cấp (Dropdown có tìm kiếm hoặc select danh sách).
  2. Chọn Cửa hàng áp dụng: Danh sách checkbox các chi nhánh trong chuỗi kèm nút "Chọn tất cả cửa hàng".
  3. Ghi chú phân bổ / thỏa thuận giao hàng riêng.
- Footer: Nút `Hủy` và Nút `Lưu phân bổ`.
