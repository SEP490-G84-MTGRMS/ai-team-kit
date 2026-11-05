# EXP-2026-11-05-001: Đa Chi Nhánh, Phân Quyền Vai Trò POS & Tối Ưu Tra Cứu FEFO

## 1. Problem Statement (Vấn đề)
Hệ thống POS bán hàng và Quản lý hóa đơn MT-GRMS cho chuỗi An Nhiên Mart (`tenant_an_nhien_02`) hiện tại:
1. Trong CSDL (`DbInitializer.cs`), chuỗi An Nhiên Mart mới có duy nhất 1 chi nhánh Ba Đình (`BR-AN-01`), chưa phản ánh cấu trúc chuỗi bán lẻ đa điểm bán.
2. Giao diện POS Header (`PosHeader.tsx`) và Quản lý đơn (`InvoiceManagementPage.tsx`) chưa phân cấp hành vi theo vai trò:
   - `STORE_OWNER` (Chủ cửa hàng Trần Quốc An) cần có dropdown chuyển đổi linh hoạt qua lại giữa các chi nhánh để giám sát và bán hàng.
   - `EMPLOYEE` (Nhân viên như Phạm Thị Yến) chỉ được gắn cố định với chi nhánh làm việc theo hợp đồng, không được phép tự ý đổi chi nhánh khác.
3. Phân quyền nghiệp vụ đơn hàng: Nhân viên được phép tạo phiếu Đổi trả hàng cho khách, nhưng hành động Hủy đơn hàng đã thanh toán (Void invoice) bắt buộc chỉ Chủ cửa hàng mới được quyền thực hiện.
4. Chức năng "Tra Cứu Tồn Kho & Lô Hạn Dùng FEFO":
   - Mặc định khi quét mã hoặc chọn món, hệ thống tự động trừ kho theo FEFO (lô cận date nhất trừ trước, hết lô này tự động trừ sang lô tiếp theo).
   - Tuy nhiên, khi cần tra cứu hoặc khi khách hàng muốn chọn đích danh một lô cụ thể (ví dụ: mua lô cận date để hưởng chiết khấu xả hàng, hoặc chọn lô date mới nhất theo yêu cầu riêng), thu ngân cần một **tùy chọn (Option)**:
     + Mở Modal tra cứu nhanh tại chỗ.
     + Xem tồn kho đa chi nhánh và danh sách các lô kèm hạn dùng.
     + **Có nút "✓ Chọn bán lô này"** để đưa trực tiếp sản phẩm thuộc lô đã chọn vào giỏ hàng POS với mã lô cụ thể.

## 2. Hiện trạng Code Liên quan (Context & Current Codebase)
- **Backend**:
  - `DbInitializer.cs`: Đã có hàm `SeedNewStoreOwnerAnNhienAsync` tạo `tenant_an_nhien_02`, tài khoản chủ tiệm `usr_owner_annhien_02` (`0918889999`) và nhân viên `usr_employee_annhien_02` (`0917778888`), nhưng mới chỉ tạo 1 chi nhánh `BR-AN-01`.
  - `Employee.cs`: Đã có sẵn trường `public Guid BranchId { get; set; }` và `public string? UserId { get; set; }`.
  - `OrderService.cs` & `PosOrdersController.cs`: Đã hỗ trợ lọc theo `branchId` và trừ kho FEFO theo lô.
- **Frontend**:
  - `PosHeader.tsx`: Đã nhận prop `branchName`, đã có `const isStoreOwner = user?.role === 'STORE_OWNER'`. Nhưng chi nhánh đang hiển thị tĩnh dạng text.
  - `PosCheckoutPage.tsx`: Quản lý giỏ hàng, nạp sản phẩm và tạo đơn hàng. Cần hỗ trợ chuyển chi nhánh khi user là `STORE_OWNER` và hỗ trợ nhận sản phẩm với lô cụ thể từ modal tra cứu.
  - `InvoiceManagementPage.tsx`: Đã có `branchFilter`, nhưng nhân viên vẫn có thể bấm đổi lọc chi nhánh và thấy nút hủy đơn. Cần ràng buộc theo `user.role`.
  - `InventoryLookupPage.tsx`: Trang tra cứu lớn riêng biệt, kết nối qua menu POS Header.

## 3. Assumptions (Giả định)
- **[ASSUMPTION-01]**: Mỗi nhân viên (`EMPLOYEE`) chỉ trực thuộc một chi nhánh chính tại một thời điểm (lưu tại `Employee.BranchId`).
- **[ASSUMPTION-02]**: Chủ cửa hàng (`STORE_OWNER`) có toàn quyền trên mọi chi nhánh thuộc `tenant_an_nhien_02`.
- **[ASSUMPTION-03]**: Mặc định giỏ hàng không chỉ định lô sẽ trừ theo FEFO tự động; khi thu ngân bấm "Chọn bán lô này" từ Option Modal, món đưa vào giỏ hàng sẽ gắn `batchCode` cụ thể của lô đó.

## 4. Scope & Non-Goals
### In Scope:
- Mở rộng seed dữ liệu trong `DbInitializer.cs` với 3 chi nhánh của An Nhiên Mart (`BR-AN-01` Ba Đình, `BR-AN-02` Cầu Giấy, `BR-AN-03` Đống Đa), gắn nhân viên và khởi tạo tồn kho phân bổ.
- Nâng cấp `PosHeader.tsx` & `PosCheckoutPage.tsx`:
  - `STORE_OWNER`: Hiển thị dropdown đổi chi nhánh; khi đổi, tự động cập nhật chi nhánh hoạt động và nạp lại giỏ hàng / tồn kho.
  - `EMPLOYEE`: Hiển thị badge tên chi nhánh cố định (read-only).
- Cập nhật `InvoiceManagementPage.tsx`:
  - `STORE_OWNER`: Bộ lọc chi nhánh mở đầy đủ ("Tất cả chi nhánh" + từng chi nhánh), có nút "Hủy đơn hàng".
  - `EMPLOYEE`: Khóa bộ lọc ở chi nhánh của nhân viên, ẩn hoàn toàn nút "Hủy đơn hàng", giữ nguyên nút "Đổi trả hàng".
- Tinh gọn chức năng "Tra Cứu Tồn Kho & Lô FEFO" thành Quick Modal / Option Drawer:
  - Xem thông tin tồn kho đa chi nhánh và danh sách các lô hạn dùng.
  - Có nút **"✓ Chọn bán lô này"** để đưa sản phẩm kèm lô được chọn vào giỏ hàng POS.

### Out-of-Scope (Non-Goals):
- Không can thiệp vào quy trình chấm công GPS hay tính lương nhân viên.

## 5. Các Phương Án Kỹ Thuật (Options Analysis)

### Phương án A: Tách riêng trang Tra Cứu FEFO thành màn hình độc lập như cũ nhưng sửa style
- **Ưu điểm**: Ít thay đổi luồng routing.
- **Nhược điểm**: Mỗi lần thu ngân muốn xem hạn dùng hoặc chọn lô phải rời khỏi màn hình POS Bán hàng (điều hướng sang trang khác), làm gián đoạn giỏ hàng đang quét, thao tác cồng kềnh.

### Phương án B (CHỌN): Chuyển Tra Cứu FEFO thành Quick Option Modal trực tiếp trong POS, hỗ trợ vừa Xem vừa "Chọn bán lô này"
- **Ưu điểm**:
  - Mặc định: Quét bán bình thường -> Máy tự động trừ FEFO tối ưu (cận date nhất trừ trước).
  - Khi cần: Bấm nút "Tra cứu Lô FEFO" ngay trên thanh POS Header -> Modal mở ra ngay tại chỗ. Thu ngân vừa xem được tồn chéo các chi nhánh, vừa có nút **"✓ Chọn bán lô này"** để đưa đích danh lô đó vào giỏ hàng mà KHÔNG rời khỏi màn hình bán hàng.
  - Phân quyền chi nhánh và hủy đơn rõ ràng giữa `STORE_OWNER` và `EMPLOYEE` cả ở UI lẫn State.
- **Nhược điểm**: Cần thiết kế component Quick Modal gọn gàng, tối ưu trải nghiệm người dùng.

## 6. Rủi ro & Cách Giảm Thiểu (Risks & Mitigations)
- **Rủi ro**: Khi `STORE_OWNER` đổi chi nhánh trên POS, giỏ hàng hiện tại có thể chứa sản phẩm mà chi nhánh mới không có tồn kho.
  - **Cách giảm thiểu**: Khi đổi chi nhánh, hệ thống hiển thị cảnh báo xác nhận nếu giỏ hàng đang có món, đồng thời làm mới tồn kho theo chi nhánh mới được chọn.
