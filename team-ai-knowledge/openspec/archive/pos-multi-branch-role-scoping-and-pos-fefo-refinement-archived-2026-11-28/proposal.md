# Proposal: Quản lý Đa Chi Nhánh, Phân Quyền Vai Trò POS & Tối Ưu Giao Diện Tra Cứu FEFO

## 1. Vấn đề cần giải quyết (Problem Statement)
- Hiện tại chuỗi cửa hàng của **Trần Quốc An (Chủ tiệm An Nhiên Mart)** trong CSDL mới chỉ có 1 chi nhánh mẫu (`BR-AN-01` - Ba Đình), chưa thể hiện được mô hình chuỗi cửa hàng bán lẻ nhiều chi nhánh (Multi-branch).
- Trên màn hình POS và trang Quản lý đơn hàng (`InvoiceManagementPage`):
  - Chưa phân tách rõ ràng quyền hạn giữa **Chủ cửa hàng (STORE_OWNER)** và **Nhân viên thu ngân (EMPLOYEE)** đối với việc chọn chi nhánh. Nhân viên có thể vô tình hoặc cố ý chọn bán hàng tại chi nhánh khác, gây sai lệch số liệu tồn kho và tiền mặt trong ca.
  - Phân quyền thao tác đơn hàng chưa chặt chẽ: Nhân viên cần được phép xử lý đổi trả hàng cho khách tại quầy, nhưng hành động **Hủy đơn hàng đã thanh toán (Void/Cancel Invoice)** tiềm ẩn rủi ro thất thoát doanh thu cao nên bắt buộc chỉ duy nhất Chủ cửa hàng mới có thẩm quyền thực hiện.
- Màn hình **"Tra Cứu Tồn Kho & Lô Hạn Dùng FEFO"**:
  - Nghiệp vụ bán hàng POS đã tự động trừ kho theo thuật toán FEFO (lô hết hạn trước trừ trước). Việc trang tra cứu chiếm nguyên một màn hình riêng biệt lớn đôi khi rườm rà và ít được mở thường xuyên trong giờ cao điểm bán lẻ. Cần đánh giá xem có nên giữ lại hay biến nó thành tùy chọn (quick-lookup option / modal gọn nhẹ) để giao diện trực quan, tinh tế và dễ thao tác hơn.

## 2. Mục tiêu (Objectives)
1. **Dữ liệu mẫu chuẩn chuỗi An Nhiên Mart**: Mở rộng CSDL với ít nhất 2–3 chi nhánh thuộc sở hữu của Chủ tiệm An Nhiên (`tenant_an_nhien_02`), có đầy đủ cấu hình chi nhánh, tài khoản nhân viên gắn với chi nhánh cụ thể và tồn kho phân bổ theo từng chi nhánh.
2. **Phân quyền chi nhánh tại POS & Quản lý đơn**:
   - `STORE_OWNER`: Có quyền linh hoạt chọn và chuyển đổi chi nhánh đang quản lý/bán hàng; xem doanh thu và đơn hàng toàn chuỗi hoặc theo từng chi nhánh.
   - `EMPLOYEE`: Cố định ở đúng chi nhánh được đăng ký và phân công làm việc. Không thể chuyển chi nhánh; chỉ xem và tạo hóa đơn thuộc chi nhánh mình.
3. **Phân quyền Hủy đơn vs Đổi trả**:
   - `EMPLOYEE`: Được quyền thực hiện Đổi trả hàng (Returns).
   - `STORE_OWNER`: Chỉ chủ tiệm mới có nút và quyền bấm Hủy hóa đơn (Cancel order).
4. **Tối ưu tính năng Tra cứu tồn kho & Lô FEFO**: Giữ lại giá trị nghiệp vụ (tra cứu tồn đa chi nhánh, xem hạn dùng các lô khi khách hỏi, kiểm tra hàng cận date), nhưng tái cấu trúc giao diện thành dạng tùy chọn tra cứu nhanh (Quick Drawer / Modal / Collapsible Panel) tinh gọn, đẹp mắt, không cản trở luồng bán hàng POS.

## 3. Phạm vi (Scope)
### In-Scope:
- Cập nhật `DbInitializer.cs` (Seed Data) cho An Nhiên Mart:
  - Thêm Chi nhánh 2: `An Nhiên Mart - Chi nhánh Cầu Giấy` (`BR-AN-02`).
  - Thêm Chi nhánh 3: `An Nhiên Mart - Chi nhánh Đống Đa` (`BR-AN-03`).
  - Tạo hồ sơ nhân viên (`Employee`) tương ứng gán cố định vào từng chi nhánh.
  - Khởi tạo tồn kho sản phẩm (`BranchStock`, `StockOnHand`, `Batches`) cho các chi nhánh mới.
- Cập nhật giao diện & logic frontend POS (`PosHeader.tsx`, `PosCheckoutPage.tsx`, `InvoiceManagementPage.tsx`):
  - Phân nhánh UI hiển thị chi nhánh dựa trên `user.role` (`STORE_OWNER` vs `EMPLOYEE`).
  - Điều kiện hiển thị nút "Hủy hóa đơn": ẩn hoặc vô hiệu hóa đối với `EMPLOYEE`, chỉ hiển thị cho `STORE_OWNER`.
  - Giữ quyền "Đổi trả hàng" cho cả `EMPLOYEE` và `STORE_OWNER`.
  - Tối ưu giao diện Tra cứu tồn kho & Lô FEFO: tinh gọn thành công cụ tra cứu tiện lợi, gọn gàng, hiện đại.

### Out-of-Scope:
- Hệ thống điều chuyển hàng giữa các chi nhánh nâng cao (Inter-branch Transfer workflow có phiếu duyệt xuất - nhập 2 bước) nằm ở phân hệ Quản lý kho tổng (sẽ làm ở change riêng).
- Chấm công GPS di động nâng cao của nhân viên.

## 4. Người dùng & Vai trò liên quan (User Roles)
- **STORE_OWNER (Chủ cửa hàng - Trần Quốc An)**:
  - Quản trị toàn chuỗi An Nhiên Mart.
  - Chuyển đổi giữa các chi nhánh bất kỳ lúc nào để bán hàng hoặc giám sát.
  - Có thẩm quyền hủy hóa đơn sai sót / hoàn tiền đặc biệt.
- **EMPLOYEE (Nhân viên bán hàng / Thu ngân - Phạm Thị Yến, v.v.)**:
  - Gắn chặt với 1 chi nhánh đã đăng ký trong hợp đồng làm việc.
  - Bán hàng, tạo hóa đơn, đổi trả hàng cho khách trong phạm vi chi nhánh.
  - Không thể hủy hóa đơn hay đổi sang chi nhánh khác.

## 5. Tiêu chí thành công đo được (Success Criteria)
1. CSDL seed đầy đủ ≥ 2 chi nhánh An Nhiên Mart với dữ liệu sản phẩm, nhân viên và tồn kho sẵn sàng.
2. Khi đăng nhập tài khoản `0918889999` (Chủ tiệm): POS Header và Invoice Management hiển thị dropdown chọn chi nhánh linh hoạt, có nút Hủy đơn hàng.
3. Khi đăng nhập tài khoản `0917778888` (Nhân viên): POS hiển thị tên chi nhánh cố định (không có dropdown đổi), chỉ thấy đơn hàng chi nhánh mình, có nút Đổi trả hàng nhưng KHÔNG có quyền Hủy đơn.
4. Giao diện Tra Cứu Tồn Kho & Lô FEFO được tối ưu gọn gàng, hoạt động mượt mà, cung cấp thông tin tra cứu lô date và tồn kho đa chi nhánh mà không gây chật chội màn hình bán hàng.
5. Kiểm thử đơn vị (Unit Tests) Backend và Build Frontend Vite vượt qua 100% không có lỗi.
