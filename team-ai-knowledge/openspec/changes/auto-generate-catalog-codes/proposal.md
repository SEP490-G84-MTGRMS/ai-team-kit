# Đề xuất chức năng: Tự động sinh mã tuần tự cho Nhóm hàng (Category) và Sản phẩm (Product)

## 1. Vấn đề hiện tại
- Trong phân hệ Quản lý Danh mục hàng hóa (Catalog), khi người dùng thêm mới Nhóm hàng (`Category`) hoặc Sản phẩm (`Product`) mà bỏ trống trường Mã:
  - Hệ thống hiện tại đang tự sinh mã ngẫu nhiên dạng GUID: `CAT-XXXXXX` (ví dụ: `CAT-A1B2C3`) tại `CategoryService` và `SP-XXXXXX` (ví dụ: `SP-D4E5F6`) tại `CatalogService`.
- Hạn chế thực tế:
  - Chuỗi mã ngẫu nhiên dạng GUID rất dài, khó đọc, khó nhớ, không phản ánh quy mô và thứ tự danh mục trong cửa hàng.
  - Quy chuẩn nghiệp vụ ngành bán lẻ (retail POS) luôn sử dụng chuỗi mã tuần tự tăng dần có định dạng cố định (như `CAT000001`, `CAT000002`... và `SP000001`, `SP000002`...) giúp thu ngân, nhân viên kho và chủ cửa hàng dễ dàng tra cứu, kiểm kê và in tem mã vạch.

## 2. Mục tiêu
- Khi người dùng tạo mới Nhóm hàng mà bỏ trống Mã: tự động sinh mã dạng `CAT000001`, `CAT000002`, `CAT000003`... tăng dần tuần tự.
- Khi người dùng tạo mới Sản phẩm mà bỏ trống Mã: tự động sinh mã dạng `SP000001`, `SP000002`, `SP000003`... tăng dần tuần tự.
- Nếu người dùng chủ động nhập mã thủ công (ví dụ: `NUOC-NGOT-01`, `893850`...): hệ thống tôn trọng mã người dùng nhập và kiểm tra tính duy nhất (Unique) như hiện tại.
- Đảm bảo tính toàn vẹn dữ liệu, an toàn trước xung đột trùng lặp (Concurrency & Exists check) và cô lập dữ liệu theo từng Khách thuê (Tenant).

## 3. Phạm vi (Scope)
### In Scope
- **Domain & Repository Layer**:
  - Bổ sung phương thức truy vấn mã lớn nhất theo tiền tố tại `ICategoryRepository` / `CategoryRepository` (tìm mã dạng `CAT{number}` lớn nhất của Tenant).
  - Bổ sung phương thức truy vấn mã lớn nhất theo tiền tố tại `IProductRepository` / `ProductRepository` (tìm mã dạng `SP{number}` lớn nhất của Tenant).
- **Application Service Layer**:
  - Cập nhật `CategoryService.CreateAsync`: Nếu `request.Code` null/rỗng $\rightarrow$ sinh mã `CAT{nextNumber:D6}`.
  - Cập nhật `CatalogService.CreateProductAsync`: Nếu `request.ProductCode` null/rỗng $\rightarrow$ sinh mã `SP{nextNumber:D6}`. Đồng thời nếu `request.Barcode` rỗng thì mặc định đồng bộ theo mã tự sinh này.
- **Verification & Testing**:
  - Bổ sung Unit Tests kiểm chứng tự động sinh mã đầu tiên (`CAT000001`, `SP000001`), sinh mã tiếp theo tuần tự (`CAT000002`, `SP000002`), và trường hợp nhập mã tùy chỉnh.
  - Đảm bảo toàn bộ test suites hiện có chạy thành công 100%.

### Out of Scope
- Không can thiệp đổi mã của các sản phẩm và nhóm hàng cũ đã tồn tại trong CSDL.
- Không thay đổi cấu trúc bảng CSDL (schema table giữ nguyên trường `ProductCode`, `CategoryCode` dạng string).
- Không sửa đổi màn hình Frontend (form tạo mới đã cho phép để trống trường mã).

## 4. Người dùng & Vai trò liên quan
- **Chủ cửa hàng (Store Owner)**: Thêm mới nhóm hàng, sản phẩm nhanh chóng mà không cần bận tâm tự nghĩ định dạng mã.
- **Quản lý chi nhánh (Branch Manager) & Nhân viên kho**: Tra cứu, quản lý danh mục hàng hóa rõ ràng, dễ phân loại.

## 5. Tiêu chí thành công đo được
1. Thêm nhóm hàng bỏ trống mã:
   - Nhóm hàng đầu tiên $\rightarrow$ Mã `CAT000001`.
   - Nhóm hàng tiếp theo $\rightarrow$ Mã `CAT000002`.
2. Thêm sản phẩm bỏ trống mã:
   - Sản phẩm đầu tiên $\rightarrow$ Mã `SP000001`.
   - Sản phẩm tiếp theo $\rightarrow$ Mã `SP000002`.
3. Thêm có nhập mã thủ công: Lưu đúng mã người dùng nhập, các lần tạo tự động sau vẫn tăng tiếp từ số lớn nhất của chuỗi tự sinh.
4. Chạy `dotnet test` đạt 100% passed (bao gồm cả unit tests mới cho Category và Product).
