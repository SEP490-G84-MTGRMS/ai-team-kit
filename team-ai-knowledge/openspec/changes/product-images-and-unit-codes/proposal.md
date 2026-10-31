# Proposal: product-images-and-unit-codes

## Vấn đề
1. **Thiếu mã hàng cho đơn vị quy đổi (`ProductUnit`)**:
   - Hiện tại bảng `ProductUnit` chỉ có `UnitName`, `ConversionRate`, `Price`, `Barcode` mà chưa có trường mã hàng riêng biệt (`UnitCode` / `ProductCode`).
   - Khi người dùng thêm đơn vị tính quy đổi, hệ thống chưa có cơ chế tự động sinh mã hàng tương ứng với sản phẩm cha, gây khó khăn cho việc tra cứu độc lập và xuất hóa đơn.
2. **Chưa hỗ trợ nhiều ảnh cho sản phẩm**:
   - Backend hiện chỉ có một trường đơn `ImageUrl` trên bảng `Products`, chưa có Entity quản lý nhiều ảnh (`ProductImage`), chưa có khái niệm ảnh đại diện và thứ tự hiển thị.
   - Frontend chưa hỗ trợ giao diện upload/xem gallery nhiều ảnh.
3. **Modal xem chi tiết hàng hóa (`ProductDetailModal`) chưa tối ưu**:
   - Trường "Mô tả" và "Ghi chú nội bộ" vẫn đang hiển thị dữ liệu tĩnh/mẫu thay vì nạp từ dữ liệu thực tế của sản phẩm trả về từ API.
   - Kích thước modal chưa được cố định (width - height): khi người dùng bấm chuyển tab (như Thẻ kho, Đơn vị tính), chiều cao modal bị co giãn, giật layout.
   - Header (thông tin tên SP, thanh chuyển đổi đơn vị tính) và Footer (nút đóng, in mã vạch, sửa) chưa được cố định (sticky/fixed) khi người dùng cuộn nội dung dài.

---

## Mục tiêu
1. **Backend Database & API**:
   - Tạo Entity `ProductImage` (quan hệ 1-N với `Product`) với các trường: `Id`, `ProductId`, `ImageUrl`, `IsMain`, `DisplayOrder`.
   - Đồng bộ ảnh đại diện (`IsMain = true`) vào thuộc tính `ImageUrl` của `Product` để duy trì backward compatibility.
   - Bổ sung trường mã hàng (`UnitCode` / mã hàng phụ) vào Entity `ProductUnit`.
   - Cơ chế tự động sinh mã hàng cho đơn vị quy đổi (format: `{ProductCode}-{Tên ĐVT}` hoặc số thứ tự) nếu người dùng để trống.
   - Cung cấp migration EF Core đồng bộ cơ sở dữ liệu.
2. **Frontend UI/UX**:
   - Cập nhật [`ProductFormModal.tsx`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/product/components/ProductFormModal.tsx): Upload nhiều ảnh, hiển thị danh sách thumbnail, chọn ảnh làm ảnh đại diện, xóa ảnh; tự động điền/hiển thị mã hàng đơn vị trong bảng "Hàng cùng loại".
   - Cập nhật [`ProductDetailModal.tsx`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/product/components/ProductDetailModal.tsx):
     - Hiển thị Gallery nhiều ảnh (xem ảnh lớn kèm danh sách thumbnails chọn nhanh, hỗ trợ Lightbox phóng to).
     - Nạp trực tiếp dữ liệu thật của `description` và `internalNote` từ API.
     - Cố định kích thước chuẩn (`maxWidth: 1160px, width: '96vw', height: '90vh'`).
     - Cấu trúc 3 tầng chuẩn: Header cố định, Body cuộn độc lập (chuyển tab giữ nguyên w-h), Footer cố định.

---

## Phạm vi
- **In scope**:
  - Backend: Entity `ProductImage`, trường mã hàng trong `ProductUnit`, EF Core Migration, cập nhật DTOs (`ProductDtos`, `ProductUnitDtos`), Service & Repository, Controller endpoints.
  - Logic tự sinh mã hàng cho đơn vị tính quy đổi.
  - Frontend: Quản lý nhiều ảnh trong form thêm/sửa sản phẩm, hiển thị gallery ảnh trong modal xem chi tiết.
  - Cố định layout 3 tầng (Header - Body - Footer) và kích thước modal xem chi tiết sản phẩm.
  - Dữ liệu mô tả, ghi chú nội bộ hiển thị theo sản phẩm thực tế.
  - Unit tests kiểm thử cho Backend và Frontend.
- **Out of scope**:
  - Chỉnh sửa ảnh chuyên sâu (cắt xén, xoay ảnh, bộ lọc màu) trên trình duyệt.
  - Nghiệp vụ phiếu xuất nhập kho chi tiết của Thẻ kho (vẫn dùng API thẻ kho hiện có).

---

## Người dùng liên quan
- **Chủ cửa hàng (StoreOwner) / Quản lý (Admin, Manager)**: Thêm/sửa sản phẩm với nhiều ảnh, quản lý mã đơn vị tính quy đổi, xem chi tiết và in ấn.
- **Nhân viên thu ngân (Cashier) / Bán hàng (Staff)**: Tra cứu sản phẩm theo ảnh chi tiết và mã hàng của từng đơn vị quy đổi.

---

## Tiêu chí thành công
- [ ] Migration EF Core tạo bảng `ProductImages` và bổ sung trường mã hàng trong `ProductUnits` được áp dụng thành công.
- [ ] API hỗ trợ nhận và trả về danh sách ảnh (`images: ProductImageDto[]`), trong đó ảnh đầu tiên hoặc ảnh có `isMain: true` tự động là ảnh đại diện `imageUrl`.
- [ ] Khi tạo đơn vị quy đổi mới, mã hàng được tự động sinh nếu không nhập thủ công.
- [ ] Giao diện `ProductFormModal` cho phép tải lên nhiều ảnh, gắn cờ ảnh đại diện, xóa ảnh linh hoạt.
- [ ] Giao diện `ProductDetailModal` có kích thước cố định (`1160px` x `90vh`), Header và Footer cố định, cuộn mượt mà ở tab body và không đổi kích thước khi chuyển tab.
- [ ] Dữ liệu mô tả và ghi chú nội bộ trong modal chi tiết phản ánh chính xác thông tin từ API.
- [ ] Tất cả unit test backend và frontend vượt qua 100%, build thành công không lỗi.
