# Kế Hoạch Thực Hiện (Tasks): pos-annhien-data-and-staff-logout

## Frontend
- [ ] T1 — Cập nhật `posOrderApi.ts`: Xử lý phân giải dữ liệu linh hoạt `res.data?.data?.items || res.data?.data` cho cả `getAllProducts()` và `getAllCustomers()` (REQ-ANNHIEN-01).
- [ ] T2 — Bổ sung mock data chuyên biệt cho `tenant_an_nhien_02` trong `posMockData.ts` (5 sản phẩm, 2 khách hàng) và `inventoryMockData.ts` (2 đơn hàng) để hỗ trợ Offline-First hoàn hảo (REQ-ANNHIEN-01).
- [ ] T3 — Điều chỉnh `PosCheckoutPage.tsx` và `InvoiceManagementPage.tsx` để khởi tạo dữ liệu cho An Nhiên Mart khi đăng nhập `tenant_an_nhien_02` (REQ-ANNHIEN-01).
- [ ] T4 — Xóa bỏ hoàn toàn khối banner thông báo phân lập kho rỗng màu xanh trong `PosCheckoutPage.tsx` (REQ-BANNER-01).
- [ ] T5 — Thêm mục "Đăng xuất tài khoản" màu đỏ trong dropdown menu "Thao tác" của `PosHeader.tsx` dành riêng cho vai trò Nhân viên (REQ-LOGOUT-01).

## Test
- [ ] T6 — Chạy kiểm thử TypeScript và build kiểm chứng Frontend (`npm run build`).
- [ ] T7 — Soạn thảo `test-report.md` và nghiệm thu hoàn tất.
