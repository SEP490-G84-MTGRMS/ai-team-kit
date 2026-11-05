# Proposal: Sửa lỗi Route 404 `/api/v1/customers` và Field Mapping Khách hàng tại POS

## 1. Mô tả lỗi & Hiện trạng
- **Hiện tượng**:
  - Người dùng đã thêm thành công khách hàng có mã `KH26110509554270` (Tên: "Sơn", SĐT: `0961934104`) vào CSDL PostgreSQL của Tenant 2 (`tenant_an_nhien_02`).
  - Tuy nhiên, tại màn hình bán hàng POS, hệ thống không tải được khách hàng thật từ CSDL của Tenant 2, mà lại hiển thị danh sách mock data mặc định ban đầu (`Bác Minh (Khách quen Ba Đình)` và `Chị Thu Hà (Khách đặt trước)`).
- **Nguyên nhân kỹ thuật**:
  1. **Lỗi định tuyến (Route 404 Not Found)**: `CustomersController.cs` trong backend chỉ khai báo `[Route("api/[controller]")]` (đường dẫn `/api/customers`). Trong khi đó, frontend `httpClient` của POS sử dụng `baseURL: '/api/v1'`, gửi request tới `/api/v1/customers` và nhận về mã lỗi HTTP 404 Not Found.
  2. **Fallback về Mock Data**: Khi gọi API lấy khách hàng thất bại với lỗi 404, `PosCheckoutPage.tsx` rơi vào nhánh fallback `setCustomers(getInitialCustomers())` và nạp dữ liệu mock `mockCustomersAnNhien`.
  3. **Sai lệch tên trường (Field Mapping Mismatch)**: Backend `CustomerResponse` trả về `FullName`, `PhoneNumber`, `CustomerCode`. Nhưng `posOrderApi.ts` lại map `c.name` và `c.phone`, làm rỗng dữ liệu tên và SĐT của khách hàng trả về từ API.

## 2. Mục tiêu & Phạm vi
- **In-Scope**:
  - Thêm `[Route("api/v1/[controller]")]` vào `CustomersController.cs` và `CustomerDebtController.cs` để hỗ trợ cả 2 chuẩn route `/api/customers` và `/api/v1/customers`.
  - Cập nhật `posOrderApi.ts` mapping đầy đủ: `name: c.fullName || c.name`, `phone: c.phoneNumber || c.phone`, `code: c.customerCode || c.code`.
  - Đảm bảo `PosCheckoutPage.tsx` nạp và hiển thị đúng 100% khách hàng thật từ PostgreSQL theo Tenant hiện tại (bao gồm khách hàng `KH26110509554270` - Sơn).
- **Out-of-Scope**: Không thay đổi schema CSDL PostgreSQL.

## 3. Tiêu chí thành công
- Request `GET /api/v1/customers` trả về HTTP 200 OK với danh sách khách hàng của `tenant_an_nhien_02` từ PostgreSQL.
- Màn hình POS hiển thị khách hàng thật từ CSDL: bao gồm khách hàng `KH26110509554270` (Sơn, 0961934104).
- Gõ "Sơn", "0961934104" hoặc "KH26110509554270" ra đúng khách hàng trong dropdown POS.
- Toàn bộ unit tests backend và frontend build đều pass.
