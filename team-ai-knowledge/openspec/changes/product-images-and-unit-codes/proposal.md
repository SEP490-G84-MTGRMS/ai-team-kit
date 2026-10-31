# Proposal: product-images-and-unit-codes

## Vấn đề
1. **Thiếu mã hàng cho đơn vị quy đổi (`ProductUnit`)**:
   - Hiện tại bảng `ProductUnit` chỉ có `UnitName`, `ConversionRate`, `Price`, `Barcode` mà chưa có trường mã hàng riêng biệt (`UnitCode` / `ProductCode`).
   - Khi người dùng thêm đơn vị tính quy đổi, hệ thống chưa có cơ chế tự động sinh mã hàng tương ứng với sản phẩm cha, gây khó khăn cho việc tra cứu độc lập và quản lý.
2. **Modal xem chi tiết hàng hóa (`ProductDetailModal`) chưa tối ưu**:
   - Trường "Mô tả" và "Ghi chú nội bộ" vẫn đang hiển thị dữ liệu tĩnh/mẫu thay vì nạp từ dữ liệu thực tế của sản phẩm trả về từ API.
   - Kích thước modal chưa được cố định (width - height): khi người dùng bấm chuyển tab (như Thẻ kho, Đơn vị tính), chiều cao modal bị co giãn, giật layout.
   - Header (thông tin tên SP, thanh chuyển đổi đơn vị tính) và Footer (nút đóng, in mã vạch, sửa) chưa được cố định (sticky/flex-fixed) khi người dùng cuộn nội dung dài.

---

## Mục tiêu
1. **Backend Database & API**:
   - Bổ sung trường mã hàng (`UnitCode` / mã hàng phụ) vào Entity `ProductUnit`.
   - Cơ chế tự động sinh mã hàng cho đơn vị quy đổi (format: `{ProductCode}-{Tên ĐVT chuẩn hóa}`) nếu người dùng để trống.
   - EF Core Migration cập nhật cơ sở dữ liệu (`AddUnitCodeToProductUnits`).
   - Giữ nguyên cấu hình 1 ảnh duy nhất (`ImageUrl`) trên `Product` (đơn giản, tối ưu, không cần tạo thêm bảng phụ).
2. **Frontend UI/UX**:
   - Cập nhật [`ProductFormModal.tsx`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/product/components/ProductFormModal.tsx):
     - Quản lý 1 ảnh sản phẩm tối ưu kèm Lightbox xem phóng to.
     - Tự động sinh/hiển thị mã hàng đơn vị trong bảng "Hàng cùng loại".
   - Cập nhật [`ProductDetailModal.tsx`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/product/components/ProductDetailModal.tsx):
     - Nạp trực tiếp dữ liệu thật của `description` và `internalNote` từ API.
     - Cố định kích thước chuẩn (`maxWidth: 1160px, width: '96vw', height: '90vh'`).
     - Cấu trúc 3 tầng chuẩn: Header cố định, Body cuộn độc lập (chuyển tab giữ nguyên w-h), Footer cố định.
     - Hiển thị ảnh sản phẩm kèm Lightbox xem ảnh to.

---

## Phạm vi
- **In scope**:
  - Backend: Bổ sung trường `UnitCode` vào Entity `ProductUnit`, EF Core Migration, cập nhật DTOs (`ProductUnitDtos`), logic tự sinh mã hàng trong `ProductUnitService`, Controllers.
  - Frontend: Hiển thị và chỉnh sửa mã hàng cho đơn vị quy đổi trong `ProductFormModal`.
  - Cố định layout 3 tầng (Header - Body - Footer) và kích thước modal xem chi tiết sản phẩm.
  - Dữ liệu mô tả, ghi chú nội bộ hiển thị theo sản phẩm thực tế.
  - Unit tests kiểm thử cho Backend và Frontend.
- **Out of scope**:
  - Không tạo bảng mới cho nhiều ảnh (chỉ dùng 1 ảnh đại diện `ImageUrl` theo yêu cầu điều chỉnh).
  - Nghiệp vụ phiếu xuất nhập kho chi tiết của Thẻ kho (vẫn dùng API thẻ kho hiện có).

---

## Người dùng liên quan
- **Chủ cửa hàng (StoreOwner) / Quản lý (Admin, Manager)**: Thêm/sửa sản phẩm, quản lý mã đơn vị tính quy đổi, xem chi tiết và in ấn.
- **Nhân viên thu ngân (Cashier) / Bán hàng (Staff)**: Tra cứu sản phẩm theo ảnh và mã hàng của từng đơn vị quy đổi.

---

## Tiêu chí thành công
- [ ] Migration EF Core bổ sung trường `UnitCode` trong `ProductUnits` được áp dụng thành công.
- [ ] Khi tạo đơn vị quy đổi mới, mã hàng được tự động sinh nếu không nhập thủ công.
- [ ] Giao diện `ProductDetailModal` có kích thước cố định (`1160px` x `90vh`), Header và Footer cố định, cuộn mượt mà ở tab body và không đổi kích thước khi chuyển tab.
- [ ] Dữ liệu mô tả và ghi chú nội bộ trong modal chi tiết phản ánh chính xác thông tin từ API.
- [ ] Tất cả unit test backend và frontend vượt qua 100%, build thành công không lỗi.
