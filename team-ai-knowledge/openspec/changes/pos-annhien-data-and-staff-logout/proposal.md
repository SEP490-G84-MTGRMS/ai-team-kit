# Đề Xuất Thay Đổi (Proposal): pos-annhien-data-and-staff-logout

## 1. Vấn Đề (Problem Statement)
- Khi người dùng đăng nhập bằng tài khoản Cửa hàng mới An Nhiên Mart (`tenant_an_nhien_02`): Chủ quán (`0918889999`) hoặc Nhân viên (`0917778888`), giao diện POS và Quản lý hóa đơn không hiển thị danh sách sản phẩm, tồn kho và đơn hàng vì Frontend chưa tích hợp mock data fallback cho tenant này và `posOrderApi.getAllProducts` chưa bóc tách đúng mảng `items` từ kết quả phân trang API (`res.data.data.items`).
- Dòng thông báo màu xanh *"🏪 Cửa hàng của bạn: Dữ liệu phân lập an toàn (Multi-tenant). Kho hàng của tiệm này chưa có sản phẩm nào. 🔒 Độc lập 100%..."* hiện tại chiếm diện tích và gây khó chịu khi sử dụng.
- Nhân viên thu ngân làm việc trên giao diện POS toàn màn hình không có nút Đăng xuất (chủ cửa hàng đã có menu riêng trên thanh điều hướng quản trị).

## 2. Mục Tiêu (Objectives)
1. **Hiển thị đầy đủ hệ sinh thái dữ liệu An Nhiên Mart**: Bao gồm 5 sản phẩm đặc thù, tồn kho theo lô FEFO, 2 khách hàng thân thiết và 2 đơn hàng mẫu (1 hóa đơn bán lẻ tiền mặt, 1 đơn đặt trước VietQR) cả ở chế độ gọi API thật và chế độ Offline Mock Data.
2. **Loại bỏ banner thông báo thừa**: Xóa hoàn toàn banner cảnh báo kho hàng chưa có sản phẩm khỏi trang POS Checkout.
3. **Bổ sung chức năng Đăng xuất cho Nhân viên POS**: Thêm lựa chọn "Đăng xuất tài khoản" trong menu popover "Thao tác" ở góc trên bên phải của `PosHeader`.

## 3. Phạm Vi Triển Khai (Scope)
- **In-Scope**:
  - `MT_GRMS_FRONTEND/src/features/pos/api/posOrderApi.ts`: Xử lý phân giải dữ liệu linh hoạt `res.data?.data?.items || res.data?.data`.
  - `MT_GRMS_FRONTEND/src/features/pos/mock/posMockData.ts`: Thêm danh mục sản phẩm, khách hàng của An Nhiên Mart.
  - `MT_GRMS_FRONTEND/src/features/pos/mock/inventoryMockData.ts`: Thêm hóa đơn và đơn đặt trước mẫu của An Nhiên Mart.
  - `MT_GRMS_FRONTEND/src/features/pos/pages/PosCheckoutPage.tsx`: Xóa khối banner thông báo phân lập; khởi tạo sản phẩm/khách hàng theo tenant.
  - `MT_GRMS_FRONTEND/src/features/pos/pages/InvoiceManagementPage.tsx`: Khởi tạo hóa đơn/đặt trước theo tenant.
  - `MT_GRMS_FRONTEND/src/features/pos/components/PosHeader.tsx`: Bổ sung nút Đăng xuất nhân viên trong dropdown menu "Thao tác".
- **Out-of-Scope**:
  - Không thay đổi cấu trúc bảng CSDL PostgreSQL Backend (CSDL đã có dữ liệu chuẩn).
  - Không đổi giao diện TopNav của Chủ cửa hàng.

## 4. Người Dùng & Vai Trò (Users & Roles)
- **Chủ cửa hàng (`STORE_OWNER`)**: Đăng nhập `0918889999` xem đầy đủ danh mục, tồn kho và đơn hàng của An Nhiên Mart.
- **Nhân viên thu ngân (`EMPLOYEE`)**: Đăng nhập `0917778888` bán hàng với danh mục An Nhiên Mart và có nút Đăng xuất ca làm việc ngay tại quầy.

## 5. Tiêu Chí Nghiệm Thu (Success Criteria)
1. Đăng nhập tài khoản An Nhiên Mart hiển thị ngay 5 sản phẩm nông sản sạch và 2 khách hàng quen trên quầy POS.
2. Trang Quản lý hóa đơn & Đặt trước hiển thị đúng 2 đơn hàng mẫu của An Nhiên Mart.
3. Không còn thấy dòng thông báo "Kho hàng của tiệm này chưa có sản phẩm nào".
4. Mở menu "Thao tác" trên `PosHeader` với tài khoản Nhân viên có nút "Đăng xuất tài khoản", bấm vào thì dọn sạch phiên làm việc và điều hướng về trang `/auth/login`.
