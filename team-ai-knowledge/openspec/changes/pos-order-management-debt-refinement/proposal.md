# Đề Xuất: Tinh Gọn Quầy POS, Nghiệp Vụ Bán Nợ Tạp Hóa & Kết Nối Quản Lý Đơn Hàng Backend (0901234567)

## 1. Vấn Đề (Problem Statement)
1. **Dư thừa thành phần UI kiểm thử:** Giao diện quầy POS, thanh Header và trang Đăng nhập trước đây tồn tại nhiều thành phần test giả lập (nút Về Dashboard cạnh tên quầy, box chuyển đổi nhanh tài khoản, icon vương miện 👑) gây rối mắt người dùng thực tế.
2. **Form khách hàng chưa tối ưu:** Modal thêm khách hàng hiển thị trường "Mã KH:" (vốn tự động sinh ngầm) và trường "Nhóm:" không cần thiết tại quầy bán lẻ.
3. **Nghiệp vụ bán nợ chưa sát thực tế:** Cơ chế áp dụng hạn mức nợ cứng (Debt Limit) và tự động chặn đơn khi vượt hạn mức không phù hợp với đặc thù tiệm tạp hóa gia đình Việt Nam (chủ tiệm quyết định cho nợ dựa vào sự tin tưởng, số lần đã nợ và tổng tiền nợ hiện tại).
4. **Quản lý đơn hàng & Đơn đặt trước chưa có backend thực tế:** Trang Quản lý hóa đơn & Đơn đặt trước giữ kho (`/pos/orders`) còn phụ thuộc vào mock data, chưa nạp dữ liệu từ CSDL PostgreSQL của chủ tiệm MT-Mart (`0901234567`).

## 2. Mục Tiêu (Goals)
- Tinh giản giao diện thương mại chuẩn: loại bỏ toàn bộ các nút mock test, icon emoji không phù hợp, rút gọn form thêm khách hàng.
- Chuyển đổi mô hình Bán Nợ: bỏ hạn mức nợ, theo dõi lịch sử số lần nợ và tổng tiền nợ.
- Chèn dữ liệu CSDL đầy đủ (Hóa đơn tiền mặt, VietQR, Bán nợ, Đơn đặt trước giữ kho) cho chủ cửa hàng `0901234567` (`tenant_mt_mart_01`).
- Kết nối đồng bộ Frontend `InvoiceManagementPage` với Backend API (lấy danh sách, hủy hóa đơn, hoàn tất đơn đặt trước).

## 3. Phạm Vi (Scope)
- **Trong phạm vi (In-scope):**
  - Frontend: `PosHeader.tsx`, `AddCustomerModal.tsx`, `PosPaymentPanel.tsx`, `PosCheckoutPage.tsx`, `LoginPage.tsx`, `InvoiceManagementPage.tsx`.
  - Backend: `OrderDtos.cs`, `OrderService.cs`, `DbInitializer.cs` (Seed 4 đơn bán lẻ + 3 đơn đặt trước giữ kho).
  - Kiểm thử: 162 Unit tests backend và Vite build TypeScript frontend.
- **Ngoài phạm vi (Out-of-scope):**
  - Tích hợp cổng thanh toán thẻ quốc tế Visa/Mastercard trực tuyến.

## 4. Người Dùng & Vai Trò (Users & Roles)
- **Chủ cửa hàng (STORE_OWNER - 0901234567):** Quản lý tiệm, toàn quyền duyệt bán nợ ghi sổ, quản lý đơn hàng & đơn đặt trước giữ kho.
- **Thu ngân (CASHIER):** Bán lẻ tại quầy, xuất đơn đặt trước, tự động ẩn chức năng bán nợ.

## 5. Tiêu Chí Thành Công (Success Criteria)
- [x] Header POS và trang đăng nhập sạch sẽ, không còn nút test giả lập.
- [x] Modal thêm khách hàng tự động sinh mã ngầm, chỉ tập trung vào thông tin thiết yếu.
- [x] Ghi nợ đơn hàng thành công không bị chặn bởi hạn mức nợ; hiển thị rõ số lần nợ và tổng tiền nợ.
- [x] Trang Quản lý đơn hàng nạp chính xác 4 hóa đơn bán lẻ và 3 đơn đặt trước từ CSDL PostgreSQL.
- [x] 100% kiểm thử đạt kết quả PASS (162/162 Unit Tests, 0 lỗi TypeScript Vite build).
