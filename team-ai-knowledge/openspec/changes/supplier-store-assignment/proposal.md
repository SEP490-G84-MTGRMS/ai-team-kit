# Proposal: supplier-store-assignment

## 1. Vấn đề
Trong chuỗi cửa hàng tạp hóa & siêu thị mini MT-GRMS:
1. **Thiếu sự kiểm soát phân phối NCC theo từng chi nhánh/cửa hàng**: Mỗi cửa hàng trong chuỗi (ví dụ: Chi nhánh Quận 1, Chi nhánh Thủ Đức, Kho Tổng) có vị trí địa lý, quy mô và đặc thù nguồn cung khác nhau. Không phải nhà cung cấp nào cũng có khả năng giao hàng đến tất cả cửa hàng trong chuỗi.
2. **Nguy cơ đặt nhầm nhà cung cấp khi lập PO chi nhánh**: Khi quản lý chi nhánh hoặc nhân viên đặt hàng tạo Đơn mua hàng (PO), nếu không có cơ chế giới hạn nhà cung cấp được phép cung ứng cho cửa hàng đó, hệ thống sẽ cho phép chọn bất kỳ NCC nào, dẫn đến tình trạng NCC từ chối giao vì ngoài khu vực phân phối hoặc không có hợp đồng chi nhánh.
3. **Chưa có màn hình quản trị trực quan độc lập**: Trước đây, thông tin gán chi nhánh chỉ được hiển thị thu gọn trong modal hoặc chi tiết NCC, gây khó khăn cho Store Owner khi cần nhìn tổng thể toàn bộ mạng lưới phân phối giữa các NCC và các Cửa hàng trong chuỗi.
4. **Cần chuẩn hóa trải nghiệm theo màn hình chuẩn**: Người dùng yêu cầu xây dựng màn hình Gán Nhà Cung Cấp Với Cửa Hàng dựa trên phong cách, bố cục thanh lọc và cấu trúc chuẩn của màn hình `http://localhost:5173/store-owner/suppliers/products`.

---

## 2. Mục tiêu
1. **Xây dựng Màn hình Quản lý Gán Nhà Cung Cấp Với Cửa Hàng (Supplier - Store/Branch Assignment)**:
   - URL: `/store-owner/suppliers/branches` (hoặc `/store-owner/suppliers/stores`).
   - Thiết kế giao diện kế thừa 100% chuẩn UI của màn hình `http://localhost:5173/store-owner/suppliers/products`:
     - Header trang chuẩn với nút quay lại danh sách NCC, nút xuất Excel và nút `[ + Gán NCC cho cửa hàng ]`.
     - Thanh bộ lọc 2 dòng: Tìm kiếm theo NCC, Tìm kiếm theo Cửa hàng/Chi nhánh, dropdown lọc theo Chi nhánh, dropdown lọc theo Trạng thái, cụm nút Tìm kiếm & Đặt lại căn phải.
     - Bảng dữ liệu (Data Table) chuẩn với STT, Mã NCC, Tên NCC, Loại NCC, Mã Cửa hàng, Tên Cửa hàng, Địa chỉ, Ngày gán, Trạng thái phân bổ và Cột thao tác.
     - Phân trang chuẩn với 12 bản ghi/trang.
2. **Cung cấp Modal Gán Linh Hoạt & Trực Quan**:
   - Cho phép chọn Nhà cung cấp và tích chọn 1 hoặc nhiều Cửa hàng/Chi nhánh cùng lúc.
   - Hỗ trợ gán nhanh toàn bộ chi nhánh ("Gán tất cả cửa hàng") chỉ bằng một click.
3. **Thao tác Vòng đời Liên kết (Lifecycle Management)**:
   - Cho phép Bật / Tạm ngưng liên kết giữa NCC và cửa hàng cụ thể.
   - Cho phép Hủy / Xóa gán khi chấm dứt thỏa thuận phân phối.
4. **Backend API & Data Persistence**:
   - Tận dụng và hoàn thiện entity `SupplierBranchAssignment` với multi-tenant isolation.
   - Cung cấp API truy vấn danh sách phân bổ có phân trang, tìm kiếm và lọc đa tiêu chí.

---

## 3. Phạm vi (Scope)

### In Scope:
- **Frontend**:
  - Trang `SupplierBranchManagementPage.tsx` đặt tại `src/features/supplier/pages/SupplierBranchManagementPage.tsx`.
  - Bộ lọc `SupplierBranchFilterBar.tsx` bám sát `SupplierProductFilterBar.tsx`.
  - Bảng dữ liệu `SupplierBranchTable.tsx` và `SupplierBranchTableRow.tsx`.
  - Modal gán mới `AssignBranchModal.tsx`.
  - Tích hợp điều hướng từ menu và header của trang danh sách NCC (`SupplierListPage.tsx`).
- **Backend**:
  - API `GET /api/v1/suppliers/branch-assignments`: Lấy danh sách liên kết NCC - Chi nhánh có phân trang, lọc theo NCC, Chi nhánh, Trạng thái.
  - API `POST /api/v1/suppliers/{id}/branches`: Gán thêm chi nhánh cho NCC.
  - API `DELETE /api/v1/suppliers/{id}/branches/{branchId}`: Hủy gán chi nhánh khỏi NCC.
  - API `PUT /api/v1/suppliers/{id}/branches`: Đồng bộ danh sách chi nhánh gán.

### Out of Scope:
- Thiết lập tuyến đường giao hàng tự động (Logistics routing).
- Phân chia hạn mức ngân sách mua hàng riêng cho từng chi nhánh (thuộc capability finance/budget).

---

## 4. Người dùng liên quan (User Roles)
- **Store Owner / Chuỗi Trưởng**: Toàn quyền gán, hủy gán và theo dõi phân bổ NCC cho tất cả các cửa hàng trong chuỗi.
- **Quản lý Cửa hàng (Branch Manager)**: Tra cứu danh sách các NCC được phép đặt hàng cho cửa hàng mình phụ trách.
- **Nhân viên Đặt hàng (Purchasing Staff)**: Xem danh sách NCC hợp lệ khi tạo đơn PO cho chi nhánh.

---

## 5. Tiêu chí thành công (Success Criteria)
- [ ] Giao diện kế thừa hoàn hảo chuẩn thiết kế của `/store-owner/suppliers/products`.
- [ ] Bộ lọc tìm kiếm tách bạch rõ ràng theo Nhà cung cấp và Cửa hàng, text nhãn nằm ngang thẳng hàng.
- [ ] Thao tác gán mới hỗ trợ chọn nhiều cửa hàng thuận tiện.
- [ ] Tích hợp đầy đủ cả Backend API và Frontend React, build và unit test đều 100% PASS.
