# EXP-2026-11-02-001: Hiển thị Dữ liệu Cửa hàng An Nhiên, Xóa Banner Thừa & Bổ sung Đăng xuất Nhân viên POS

## 1. Problem Statement
1. Khi đăng nhập vào hệ thống bằng tài khoản của Cửa hàng mới An Nhiên Mart (`tenant_an_nhien_02`) với vai trò Chủ tiệm (`0918889999`) hoặc Nhân viên bán hàng (`0917778888`), màn hình POS và Quản lý hóa đơn không hiển thị danh sách sản phẩm, khách hàng, đơn hàng. Nguyên nhân do `posOrderApi.getAllProducts()` chưa trích xuất linh hoạt mảng con `items` trong `res.data.data` (Backend trả về `PagedResult<ProductResponse>`), và hệ thống chưa có fallback mock theo Tenant An Nhiên khi hoạt động offline.
2. Dòng banner thông báo màu xanh *"🏪 Cửa hàng của bạn: Dữ liệu phân lập an toàn (Multi-tenant). Kho hàng của tiệm này chưa có sản phẩm nào. 🔒 Độc lập 100%..."* xuất hiện trên đầu quầy POS gây chiếm dụng không gian và tạo cảm giác quầy trống rỗng.
3. Nhân viên thu ngân trong màn hình bán hàng POS toàn màn hình không có nút Đăng xuất (chỉ chủ cửa hàng mới có nút đăng xuất trên topbar quản trị).

## 2. Context & Background
- Hệ thống MT-GRMS quản lý đa tenant. Dữ liệu cửa hàng An Nhiên Mart đã được chèn vào PostgreSQL Backend (`tenant_an_nhien_02`, 5 sản phẩm nông sản sạch, tồn kho FEFO, 2 khách hàng, 2 đơn hàng).
- Frontend cần đồng bộ hiển thị cả 2 môi trường: Kết nối Backend API thật và Fallback Mock Data khi chưa bật backend hoặc offline.
- Cần hoàn thiện trải nghiệm thu ngân cho nhân viên bằng việc cung cấp lối thoát/đăng xuất ca làm việc an toàn ngay tại nút "Thao tác" trên `PosHeader`.

## 3. Constraints
- Không làm thay đổi hay phá vỡ dữ liệu của chuỗi mẫu MT-Mart (`tenant_mt_mart_01`).
- Đảm bảo tuân thủ cấu trúc Multi-Tenant: Cửa hàng An Nhiên chỉ thấy sản phẩm, tồn kho và đơn hàng của An Nhiên.
- Không sửa schema CSDL PostgreSQL.
- Nút đăng xuất của nhân viên phải dọn sạch `token`, `user profile` trong store và điều hướng về `/auth/login`.

## 4. Assumptions
- **[ASSUMPTION]**: Khi Backend chạy, API `/api/products` trả về cấu trúc `{ success: true, data: { items: [...], totalCount: ... } }`.
- **[ASSUMPTION]**: Khi Backend chưa bật hoặc offline, hệ thống Frontend sử dụng danh sách mock data chuyên biệt cho `tenant_an_nhien_02` thay vì trả về mảng rỗng.
- **[ASSUMPTION]**: Người dùng đăng nhập bằng tài khoản nhân viên `0917778888` sẽ vào trực tiếp trang `/employee/pos` hoặc `/pos`.

## 5. Scope & Non-Goals
### In Scope
- Sửa hàm bóc tách `posOrderApi.getAllProducts()` và `getAllCustomers()` để nhận cả `res.data?.data?.items` và `res.data?.data`.
- Bổ sung `mockProductsAnNhien`, `mockCustomersAnNhien`, `mockInvoicesAnNhien`, `mockPreOrdersAnNhien`.
- Điều chỉnh `PosCheckoutPage.tsx` và `InvoiceManagementPage.tsx` nạp dữ liệu An Nhiên Mart khi đăng nhập `tenant_an_nhien_02`.
- Xóa bỏ khối banner cảnh báo phân lập dòng 610-630 trong `PosCheckoutPage.tsx`.
- Thêm nút "Đăng xuất tài khoản" màu đỏ trong dropdown menu "Thao tác" của `PosHeader.tsx` dành riêng cho nhân viên.

### Out of Scope (Non-Goals)
- Không can thiệp sửa đổi các trang quản trị của Super Admin.
- Không thay đổi logic tính toán khuyến mãi hay VAT.

## 6. Success Criteria
1. Đăng nhập tài khoản `0918889999` hoặc `0917778888` hiển thị tức thì 5 sản phẩm của An Nhiên Mart và 2 khách hàng trên quầy POS.
2. Không còn hiển thị dòng chữ cảnh báo xanh về kho hàng trống.
3. Mở menu Thao tác tại quầy POS với tài khoản nhân viên thấy nút "Đăng xuất tài khoản", bấm vào chuyển về màn hình đăng nhập.
