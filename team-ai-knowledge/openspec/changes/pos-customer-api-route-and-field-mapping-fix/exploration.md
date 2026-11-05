# EXP-2026-11-05-002: Khám phá nguyên nhân POS không tải được khách hàng thật từ CSDL PostgreSQL

## 1. Problem Statement (Tuyên bố vấn đề)
Khi người dùng thêm thành công khách hàng `KH26110509554270` (Sơn, SĐT: `0961934104`) vào CSDL PostgreSQL cho Tenant 2 (`tenant_an_nhien_02`), màn hình bán hàng POS vẫn không hiển thị khách hàng này, mà lại hiển thị 2 khách hàng mẫu từ mock data (`Bác Minh` và `Chị Thu Hà`).

## 2. Root Cause Analysis (Phân tích nguyên nhân gốc rễ)
1. **Lỗi định tuyến Backend (Route Mismatch)**:
   - File `MT_GRMS.Api/Controllers/CustomersController.cs` chỉ khai báo `[Route("api/[controller]")]` (đường dẫn `/api/customers`).
   - File `MT_GRMS_FRONTEND/src/api/httpClient.ts` cấu hình `baseURL: '/api/v1'`.
   - Khi `posOrderApi.getAllCustomers()` gọi `httpClient.get('/customers')`, trình duyệt gửi request tới `/api/v1/customers`. Do controller không có route này, Backend trả về **HTTP 404 Not Found**.
2. **Kích hoạt Mock Data Fallback**:
   - Tại `PosCheckoutPage.tsx` (dòng 197-233), khi `posOrderApi.getAllCustomers().catch(() => null)` trả về `null`, code rơi vào nhánh fallback:
     ```typescript
     setCustomers(getInitialCustomers()); // Nạp mockCustomersAnNhien
     ```
   - Biến `mockCustomersAnNhien` chỉ có Bác Minh và Chị Thu Hà (chứa điểm tích lũy cứng 150 và 80 điểm đúng như ảnh chụp màn hình).
3. **Lệch tên trường DTO (Field Mapping Mismatch)**:
   - DTO `CustomerResponse` ở backend trả về các thuộc tính: `FullName`, `PhoneNumber`, `CustomerCode`.
   - File `posOrderApi.ts` lại đọc `c.name` và `c.phone`. Nếu API có thành công thì 2 trường này vẫn bị gán chuỗi rỗng `""`.

## 3. Constraints & Assumptions
- **[CONSTRAINT]**: Không sửa đổi cấu trúc bảng `Customers` trong CSDL PostgreSQL.
- **[CONSTRAINT]**: Đảm bảo tương thích ngược với các module khác đang gọi `/api/customers` hoặc `/api/v1/customers`.
- **[ASSUMPTION]**: Mỗi request từ POS đều mang theo header `X-Tenant-Id` tương ứng của tenant đang đăng nhập (`tenant_an_nhien_02`).

## 4. Scope & Non-Goals
### In Scope
- Thêm route kép `[Route("api/[controller]")]` và `[Route("api/v1/[controller]")]` cho `CustomersController.cs` và `CustomerDebtController.cs`.
- Chuẩn hóa hàm map trong `posOrderApi.ts`:
  - `name: c.fullName || c.name || ''`
  - `phone: c.phoneNumber || c.phone || ''`
  - `code: c.customerCode || c.code || ''`
- Cập nhật `PosCheckoutPage.tsx` đảm bảo ưu tiên nạp dữ liệu từ PostgreSQL.

### Out of Scope (Non-Goals)
- Không can thiệp vào các API sản phẩm hay đơn hàng khác đã hoạt động bình thường.

## 5. Đánh giá phương án (Trade-off Analysis)
- **Phương án 1: Chỉ sửa baseURL ở frontend**:
  - *Nhược điểm*: Rủi ro phá vỡ các controller khác đã quen dùng chuẩn `/api/v1`.
- **Phương án 2 (Được chọn)**:
  - Khai báo route kép `[Route("api/[controller]")]` và `[Route("api/v1/[controller]")]` ở backend.
  - Frontend `posOrderApi.ts` map linh hoạt cả 2 định dạng trường (`fullName`/`name`, `phoneNumber`/`phone`).
  - *Ưu điểm*: Tương thích 100%, an toàn, giải quyết triệt để lỗi 404 và field mismatch.

## 6. Success Criteria
- Lệnh gọi `GET /api/v1/customers` trả về HTTP 200 OK với đầy đủ khách hàng trong PostgreSQL của `tenant_an_nhien_02`.
- Khách hàng `KH26110509554270` (Sơn) xuất hiện ngay trong danh sách tìm kiếm của màn hình POS.
