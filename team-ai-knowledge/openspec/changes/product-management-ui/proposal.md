# Proposal: product-management-ui
## Phân hệ FE-01: Quản lý Danh mục Hàng hóa (Product Catalog Management)

## 1. Vấn đề
Trong hệ thống bán lẻ và siêu thị mini đa tenant (**MT-GRMS**), các cửa hàng tạp hóa và siêu thị mini thường xuyên quản lý danh mục lớn từ 800 đến 1.000+ SKUs với nhiều đặc thù nghiệp vụ phức tạp:
- **Đa quy cách đóng gói (Multi-UOM):** Một sản phẩm có thể bán lẻ theo ĐVT cơ sở (Lon, Chai, Gói) hoặc bán sỉ theo đơn vị quy đổi (Lốc, Thùng, Hộp) với mã vạch và mức giá bán riêng.
- **Hàng Combo - Đóng gói:** Nhu cầu kinh doanh giỏ quà lễ tết, combo khuyến mãi được ghép nối từ nhiều mặt hàng đơn lẻ có sẵn, đòi hỏi tự động tính giá vốn và trừ kho thành phần.
- **Bảo mật dữ liệu kinh doanh ([BR-SEC-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4759)):** Giá vốn nhập hàng (COGS) là thông tin nhạy cảm của Chủ cửa hàng (Store Owner), nhân viên bán hàng/thu ngân (Employee) không được phép nhìn thấy trên danh sách và chi tiết hàng hóa.
- **Toàn vẹn dữ liệu kế toán & kho ([BR-PROD-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4760), [BR-DATA-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4763)):** Khi hàng hóa đã phát sinh giao dịch xuất/nhập/bán, việc tùy tiện sửa ĐVT cơ sở hoặc xóa cứng (Hard Delete) sản phẩm sẽ làm sai lệch nghiêm trọng lịch sử thẻ kho và báo cáo tài chính.

Hiện tại trên nền tảng Frontend MT-GRMS, Dashboard quản trị tại `/dashboard/products` chưa có giao diện quản lý danh mục hoàn chỉnh đáp ứng các đặc tả của **FE-01** ([Report-3 SRS Mục 1 & Mục 4.1](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L1208)).

---

## 2. Mục tiêu
- Xây dựng giao diện Quản lý Danh mục Hàng hóa (**Product Catalog Management UI**) hoàn chỉnh, hiện đại (Ant Design + Tailwind CSS v4 + React 19 + TypeScript) tích hợp vào `MasterLayout` tại route `/dashboard/products`.
- Hiện thực hóa đầy đủ 6 Use Cases chuẩn theo đặc tả SRS MT-GRMS:
  - **[UC-01.1: View Product List](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L1210)** – Danh sách phân trang, tìm kiếm tức thì, bộ lọc đa tiêu chí, bảo mật che giá vốn.
  - **[UC-01.2: Add Standard Product](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L1226)** – Khởi tạo hàng chuẩn, tự sinh SKU, cấu hình bảng quy đổi ĐVT đa cấp, định mức tồn an toàn Min/Max.
  - **[UC-01.3: View Product Detail](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L1242)** – Panel chi tiết 360 độ gồm Thông tin, Ghi chú nội bộ, Thẻ kho (Stock Ledger) và Tồn kho chi nhánh / Lô hạn sử dụng FEFO.
  - **[UC-01.4: Edit Product](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L1258)** – Cập nhật thuộc tính, cơ chế khóa bất biến ĐVT cơ sở sau giao dịch.
  - **[UC-01.5: Delete / Discontinue Product](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L1274)** – Cơ chế xóa an toàn (Soft Delete sang `Discontinued` nếu có chứng từ lịch sử, Hard Delete khi chưa giao dịch).
  - **[UC-01.6: Create Category](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L1290)** – Quản lý cây nhóm hàng đa tầng, tự sinh mã `CAT-xxx`, kiểm tra trùng lặp mã và tên.
- Hỗ trợ nghiệp vụ **Hàng Combo - Đóng gói**: Khai báo danh sách thành phần, tự tính giá vốn và tồn kho khả dụng từ các mặt hàng thành phần.
- Tích hợp các tiện ích thực tế cho ngành tạp hóa: In tem mã vạch theo tồn kho thực tế, Import/Export Excel danh mục, đánh dấu hàng Yêu thích (Favorite).

---

## 3. Phạm vi

### 3.1. In scope
1. **Màn hình Danh sách hàng hóa (`ProductListPage` – SRS 4.1.1):**
   - Bảng dữ liệu phân trang hiển thị: Ảnh thumbnail, Mã hàng (SKU), Mã vạch (Barcode), Tên hàng hóa, Nhóm hàng, Đơn vị tính (kèm chỉ báo có ĐVT quy đổi), Giá bán lẻ, Tồn kho khả dụng, Trạng thái kinh doanh (Đang bán / Ngừng kinh doanh).
   - Bộ công cụ tìm kiếm và lọc đa tiêu chí: Tìm nhanh theo từ khóa/mã vạch/SKU, Cây danh mục nhóm hàng (Category Tree sidebar), Lọc trạng thái tồn (Tất cả, Còn hàng >0, Dưới định mức tồn, Hết hàng =0, Tồn âm), Lọc nhà cung cấp, Lọc ngày tạo.
   - Nút tác vụ nhanh: Thêm hàng hóa (`+ Add Product`), Thêm Combo (`+ Add Combo`), Import file Excel, Export file Excel, Đánh dấu sao Yêu thích (`Favorite Toggle`).
2. **Modal / Màn hình Thêm & Sửa Hàng hóa chuẩn (`ProductFormModal` / `ProductFormPage` – SRS 4.1.2):**
   - Thông tin cơ bản: Tên hàng hóa (bắt buộc), Mã SKU (tự sinh `SPxxxxxx` nếu để trống), Mã vạch Barcode (EAN-13, Code 128), Danh mục (Dropdown có link tạo nhanh danh mục mới), Upload ảnh (tối đa 2MB/ảnh).
   - Thiết lập Đơn vị tính: ĐVT cơ sở (bắt buộc), Bảng quy đổi ĐVT động (Tên ĐVT quy đổi, Tỷ lệ quy đổi, Mã vạch quy đổi riêng, Giá bán quy đổi).
   - Thông tin tài chính & Kho: Giá vốn nhập (COGS), Giá bán lẻ niêm yết, Thuế suất VAT ([BR-TAX-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4762)), Tồn kho ban đầu (Initial Stock), Định mức an toàn Min/Max Stock.
   - Mô tả chi tiết & Ghi chú nội bộ cho nhân viên.
   - Thao tác lưu linh hoạt: Nút `Save` và `Save & Add New` (tiếp tục tạo sản phẩm kế tiếp).
3. **Quản lý Hàng Combo - Đóng gói (`ComboFormModal`):**
   - Khai báo danh sách hàng thành phần và định lượng số lượng mỗi loại.
   - Tự động tính giá vốn Combo từ tổng giá vốn các hàng thành phần.
   - Thiết lập giá bán trọn gói của Combo; hiển thị số lượng tồn kho khả dụng tự động tính = $\min(\lfloor \text{Tồn thành phần } i / \text{Số lượng } i \rfloor)$.
4. **Slide-over Panel / Modal Xem chi tiết sản phẩm 360 độ (`ProductDetailModal` – SRS 4.1.3):**
   - Tab 1 - Thông tin chung: Quy cách đóng gói, bảng giá ĐVT, thuế suất VAT, thông số chi tiết.
   - Tab 2 - Mô tả & Ghi chú nội bộ.
   - Tab 3 - Thẻ kho (Stock Ledger): Lịch sử biến động số lượng qua các chứng từ bán hàng, nhập hàng, trả hàng, kiểm kho, chuyển kho.
   - Tab 4 - Tồn kho chi nhánh & Lô hạn dùng: Tồn kho OnHand/Available theo chi nhánh và danh sách lô hạn dùng (FEFO) liên kết FE-02.
   - Nút tác vụ: Chỉnh sửa (`Edit`), Sao chép (`Duplicate`), Ngừng kinh doanh (`Discontinue`), In tem mã vạch (`Print Barcode`), Xóa sản phẩm (`Delete`).
5. **Modal Quản lý Danh mục Hàng hóa (`CategoryModal` – SRS 1.6 & 4.1.1):**
   - Tạo danh mục dạng cây cha - con; tự sinh mã `CAT-xxx`; kiểm tra tính duy nhất ([BR-CAT-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4764)).
   - Ràng buộc chặn xóa danh mục khi đang chứa sản phẩm hoặc nhóm con.
6. **Thực thi các Quy tắc nghiệp vụ bắt buộc:**
   - **[BR-SEC-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4759):** Che toàn bộ Giá vốn nhập (COGS) đối với vai trò Employee/Cashier.
   - **[BR-PROD-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4760):** Khóa bất biến Base UOM trên form cập nhật nếu sản phẩm đã phát sinh giao dịch.
   - **[BR-DATA-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4763):** Xóa an toàn chuyển Soft Delete sang `Discontinued`; chặn xóa khi vướng giao dịch dang dở hoặc là thành phần của Combo đang hoạt động.
7. **Tiện ích mở rộng:**
   - Import/Export danh mục hàng loạt qua file Excel mẫu `.xlsx`.
   - In tem mã vạch sản phẩm tùy chọn theo số lượng tồn thực tế hoặc số lượng nhập tay.

### 3.2. Out of scope
- Quản lý chi tiết quy trình Nhập hàng, lập PO nhà cung cấp và phân bổ chi phí Landed Cost (thuộc phân hệ FE-04 Goods Receipt & FE-05 Purchase Order).
- Giao diện bán hàng thu ngân tại quầy POS và tích hợp máy in nhiệt K80 (thuộc phân hệ FE-12 POS Checkout & Cashier).
- Nghiệp vụ điều chuyển kho giữa các chi nhánh (thuộc phân hệ FE-15 Inter-Branch Inventory Transfer).
- Báo cáo tài chính chuyên sâu P&L và kết chuyển doanh thu tự động (thuộc FE-10 & FE-19).

---

## 4. Người dùng liên quan (Actors & Roles)
- **Chủ cửa hàng (Store Owner) / Quản trị viên chi nhánh (Store Manager):**
  - Quyền hạn: Toàn quyền truy cập và thao tác (Create, Read, Update, Delete/Discontinue).
  - Được xem và chỉnh sửa Giá vốn (COGS), xem lợi nhuận gộp, cấu hình giá bán đa chi nhánh ([BR-PROD-02](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4761)), quản lý danh mục và Import/Export Excel.
- **Nhân viên thu ngân / Bán hàng (Cashier / Employee):**
  - Quyền hạn: Xem danh sách, tra cứu mã vạch, xem giá bán lẻ niêm yết theo từng ĐVT, xem số lượng tồn kho khả dụng tại chi nhánh đang đăng nhập.
  - Hạn chế bảo mật ([BR-SEC-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4759)): **Bị ẩn hoàn toàn trường Giá vốn (Cost Price / COGS)** trên tất cả màn hình danh sách và chi tiết.
- **SaaS Master Admin:**
  - Giám sát định mức tài nguyên và quota danh mục theo gói đăng ký Subscription của từng tenant.

---

## 5. Tiêu chí thành công (Acceptance Criteria)
- [ ] Người dùng truy cập phân hệ qua menu Sidebar `Quản lý Hàng hóa` hoặc URL `/dashboard/products` trong `MasterLayout`.
- [ ] Bảng danh sách hàng hóa hiển thị đầy đủ thông tin, hỗ trợ phân trang mượt mà (10/25/50/100 dòng), sắp xếp và hiển thị trạng thái tồn kho trực quan.
- [ ] Tìm kiếm tức thời (debounce) theo tên, SKU, barcode và bộ lọc cây nhóm hàng phản hồi chính xác dưới 300ms.
- [ ] Bộ lọc trạng thái tồn kho (Còn hàng, Dưới định mức tồn, Hết hàng, Tồn âm) hoạt động chính xác theo số liệu kho chi nhánh hiện tại.
- [ ] Form tạo mới/chỉnh sửa hàng hóa kiểm soát validation chặt chẽ: Tên hàng, ĐVT cơ sở, Giá bán là bắt buộc; tự sinh mã `SPxxxxxx` nếu để trống; cảnh báo nếu trùng barcode.
- [ ] Bảng quy đổi ĐVT cho phép thêm nhiều cấp quy đổi, tự động tính giá và kiểm tra tỷ lệ quy đổi hợp lệ (> 1).
- [ ] Áp dụng đúng quy tắc [BR-SEC-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4759): Nhân viên thu ngân đăng nhập không nhìn thấy cột Giá vốn trên bảng và không thấy trường Giá vốn trong modal chi tiết.
- [ ] Áp dụng đúng quy tắc [BR-PROD-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4760): Khi mở modal sửa sản phẩm đã có giao dịch, ô chọn ĐVT cơ sở bị vô hiệu hóa (disabled) kèm chú thích giải thích.
- [ ] Thao tác xóa sản phẩm tuân thủ [BR-DATA-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4763): Chuyển Soft Delete sang `Discontinued` nếu sản phẩm đã phát sinh giao dịch; chặn xóa nếu vướng giao dịch dang dở hoặc là thành phần của Combo đang hoạt động.
- [ ] Tính năng Hàng Combo cho phép chọn hàng thành phần, tự động tính giá vốn tổng và trừ kho thành phần khi mô phỏng bán hàng.
- [ ] Chức năng Import Excel hỗ trợ tải file mẫu `.xlsx`, preview dữ liệu trước khi nạp và báo cáo lỗi dòng dữ liệu không hợp lệ.
- [ ] Giao diện responsive, tuân thủ chặt chẽ design tokens của MT-GRMS Frontend (Ant Design + Tailwind CSS v4, hỗ trợ Dark/Light mode).
