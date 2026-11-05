# EXP-2026-11-05-001: Đa Chi Nhánh, Phân Quyền Vai Trò POS & Tối Ưu Tra Cứu FEFO

## 1. Problem Statement (Vấn đề)
Hệ thống POS bán hàng và Quản lý hóa đơn MT-GRMS cho chuỗi An Nhiên Mart (`tenant_an_nhien_02`) hiện tại:
1. Trong CSDL (`DbInitializer.cs`), chuỗi An Nhiên Mart mới có duy nhất 1 chi nhánh Ba Đình (`BR-AN-01`), chưa phản ánh cấu trúc chuỗi bán lẻ đa điểm bán.
2. Giao diện POS Header (`PosHeader.tsx`) và Quản lý đơn (`InvoiceManagementPage.tsx`) chưa phân cấp hành vi theo vai trò:
   - `STORE_OWNER` (Chủ cửa hàng Trần Quốc An) cần có dropdown chuyển đổi linh hoạt qua lại giữa các chi nhánh để giám sát và bán hàng.
   - `EMPLOYEE` (Nhân viên như Phạm Thị Yến) chỉ được gắn cố định với chi nhánh làm việc theo hợp đồng, không được phép tự ý đổi chi nhánh khác.
3. Phân quyền nghiệp vụ đơn hàng: Nhân viên được phép tạo phiếu Đổi trả hàng cho khách, nhưng hành động Hủy đơn hàng đã thanh toán (Void invoice) bắt buộc chỉ Chủ cửa hàng mới được quyền thực hiện.
4. Chức năng "Tra Cứu Tồn Kho & Lô Hạn Dùng FEFO": Mặc định luồng bán hàng POS đã tự động trừ tồn kho theo FEFO (lô cận date nhất trừ trước). Việc trang tra cứu chiếm một giao diện riêng biệt cồng kềnh là không cần thiết, nhưng nghiệp vụ tra cứu nhanh thông tin hạn dùng của các lô và kiểm tra tồn kho chéo đa chi nhánh vẫn có giá trị thực tiễn cao, cần được chuyển thành tùy chọn (Quick Drawer/Modal) tinh gọn.

## 2. Hiện trạng Code Liên quan (Context & Current Codebase)
- **Backend**:
  - `DbInitializer.cs`: Đã có hàm `SeedNewStoreOwnerAnNhienAsync` tạo `tenant_an_nhien_02`, tài khoản chủ tiệm `usr_owner_annhien_02` (`0918889999`) và nhân viên `usr_employee_annhien_02` (`0917778888`), nhưng mới chỉ tạo 1 chi nhánh `BR-AN-01`.
  - `Employee.cs`: Đã có sẵn trường `public Guid BranchId { get; set; }` và `public string? UserId { get; set; }`.
  - `OrderService.cs` & `PosOrdersController.cs`: Đã hỗ trợ lọc theo `branchId` và trừ kho FEFO theo lô.
- **Frontend**:
  - `PosHeader.tsx`: Đã nhận prop `branchName`, đã có `const isStoreOwner = user?.role === 'STORE_OWNER'`. Nhưng chi nhánh đang hiển thị tĩnh dạng text.
  - `PosCheckoutPage.tsx`: Quản lý giỏ hàng, nạp sản phẩm và tạo đơn hàng. Cần hỗ trợ chuyển chi nhánh khi user là `STORE_OWNER`.
  - `InvoiceManagementPage.tsx`: Đã có `branchFilter`, nhưng nhân viên vẫn có thể bấm đổi lọc chi nhánh và thấy nút hủy đơn. Cần ràng buộc theo `user.role`.
  - `InventoryLookupPage.tsx`: Trang tra cứu lớn riêng biệt, kết nối qua menu POS Header.

## 3. Assumptions (Giả định)
- **[ASSUMPTION-01]**: Mỗi nhân viên (`EMPLOYEE`) chỉ trực thuộc một chi nhánh chính tại một thời điểm (lưu tại `Employee.BranchId`).
- **[ASSUMPTION-02]**: Chủ cửa hàng (`STORE_OWNER`) có toàn quyền trên mọi chi nhánh thuộc `tenant_an_nhien_02`.
- **[ASSUMPTION-03]**: Thuật toán FEFO trừ kho tự động khi tạo hóa đơn vẫn được duy trì nguyên vẹn ở Backend; việc tối ưu giao diện Tra cứu FEFO chỉ phục vụ mục đích tra cứu thông tin hỗ trợ khách hàng và xem tồn chéo chi nhánh.

## 4. Scope & Non-Goals
### In Scope:
- Mở rộng seed dữ liệu trong `DbInitializer.cs` với 3 chi nhánh của An Nhiên Mart (`BR-AN-01` Ba Đình, `BR-AN-02` Cầu Giấy, `BR-AN-03` Đống Đa), gắn nhân viên và khởi tạo tồn kho phân bổ.
- Nâng cấp `PosHeader.tsx` & `PosCheckoutPage.tsx`:
  - `STORE_OWNER`: Hiển thị dropdown đổi chi nhánh; khi đổi, tự động cập nhật chi nhánh hoạt động và nạp lại giỏ hàng / tồn kho.
  - `EMPLOYEE`: Hiển thị badge tên chi nhánh cố định (read-only).
- Cập nhật `InvoiceManagementPage.tsx`:
  - `STORE_OWNER`: Bộ lọc chi nhánh mở đầy đủ ("Tất cả chi nhánh" + từng chi nhánh), có nút "Hủy đơn hàng".
  - `EMPLOYEE`: Khóa bộ lọc ở chi nhánh của nhân viên, ẩn hoàn toàn nút "Hủy đơn hàng", giữ nguyên nút "Đổi trả hàng".
- Tinh gọn chức năng "Tra Cứu Tồn Kho & Lô FEFO" thành Quick Modal / Option Drawer tiện dụng ngay trên POS Header.

### Out-of-Scope (Non-Goals):
- Không thay đổi thuật toán trừ FEFO ở tầng Backend.
- Không can thiệp vào quy trình chấm công GPS hay tính lương nhân viên.

## 5. Các Phương Án Kỹ Thuật (Options Analysis)

### Phương án A: Tách riêng trang Tra Cứu FEFO thành màn hình độc lập như cũ nhưng sửa style
- **Ưu điểm**: Ít thay đổi luồng routing.
- **Nhược điểm**: Mỗi lần thu ngân muốn xem hạn dùng của một lô hàng theo câu hỏi của khách phải rời khỏi màn hình POS Bán hàng (điều hướng sang trang khác), làm gián đoạn giỏ hàng đang quét, thao tác cồng kềnh.

### Phương án B (CHỌN): Chuyển Tra Cứu FEFO thành Quick Option Modal / Drawer trực tiếp trong POS & Đồng bộ Phân quyền Role Scoping
- **Ưu điểm**:
  - Thu ngân chỉ cần bấm nút "Tra cứu tồn kho & Lô FEFO" ngay trên thanh công cụ POS, modal mở ra ngay tại chỗ, quét barcode hoặc tìm kiếm nhanh, xem ngay tồn kho đa chi nhánh và các lô date của sản phẩm mà KHÔNG rời khỏi giỏ hàng.
  - Giao diện cực kỳ gọn gàng, hiện đại, đóng mở tức thì.
  - Phân quyền chi nhánh và hủy đơn rõ ràng giữa `STORE_OWNER` và `EMPLOYEE` cả ở UI lẫn State.
- **Nhược điểm**: Cần thiết kế component Quick Modal gọn gàng, tối ưu trải nghiệm người dùng.

## 6. Rủi ro & Cách Giảm Thiểu (Risks & Mitigations)
- **Rủi ro**: Khi `STORE_OWNER` đổi chi nhánh trên POS, giỏ hàng hiện tại có thể chứa sản phẩm mà chi nhánh mới không có tồn kho.
  - **Cách giảm thiểu**: Khi đổi chi nhánh, hệ thống hiển thị cảnh báo xác nhận nếu giỏ hàng đang có món, đồng thời làm mới tồn kho theo chi nhánh mới được chọn.
