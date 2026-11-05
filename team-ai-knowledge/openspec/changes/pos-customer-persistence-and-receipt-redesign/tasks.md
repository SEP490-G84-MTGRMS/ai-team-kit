# Danh sách công việc: pos-customer-persistence-and-receipt-redesign

## Backend
- [ ] T1 — Cập nhật `ThermalPrintService.cs`: Loại bỏ tính toán và in dòng VAT (`Thue VAT:`), loại bỏ dòng Wifi mặc định, in động tên cửa hàng/chi nhánh/địa chỉ/hotline từ dữ liệu Branch/Tenant của đơn hàng, và bổ sung khối THÔNG TIN KHÁCH HÀNG ở chân bill (REQ-POS-VAT-01, REQ-POS-DYNAMIC-STORE-01, REQ-POS-RECEIPT-LAYOUT-01).

## Frontend
- [ ] T2 — Cập nhật `AddCustomerModal.tsx`: Tích hợp gọi `customerApi.createCustomer(...)`, thêm state `isSubmitting` với spinner, bắt lỗi trùng số điện thoại (`PHONE_EXISTS`) và trả về `Customer` thật với GUID ID từ CSDL PostgreSQL (REQ-POS-CUST-01).
- [ ] T3 — Cập nhật `PosCheckoutPage.tsx`: Mở rộng state `activeBranch` lưu trữ cả địa chỉ và điện thoại chi nhánh; cập nhật `buildReceiptData` lấy thông tin Tenant/Chi nhánh động và gỡ bỏ hoàn toàn VAT (`vatAmount: 0`, `finalAmount = finalAmount`); cập nhật state `customers` khi lưu khách mới (REQ-POS-CUST-01, REQ-POS-VAT-01, REQ-POS-DYNAMIC-STORE-01).
- [ ] T4 — Thiết kế lại `PosReceiptModal.tsx`: Bố cục hóa đơn theo mẫu thực tế siêu thị Đức Thành gồm Header thông tin đơn vị/địa chỉ/hotline, Bảng hàng hóa chuẩn (STT, Hàng hóa, SL, Đơn giá, Thành tiền), xóa sạch các dòng VAT ("Tổng tiền chưa VAT", "Thuế GTGT"), và bổ sung khối THÔNG TIN KHÁCH HÀNG ở chân bill (REQ-POS-RECEIPT-LAYOUT-01, REQ-POS-VAT-01).

## Test
- [ ] T5 — Kiểm thử tự động Frontend và Backend: Chạy `npm test` trong `MT_GRMS_FRONTEND` và `dotnet test` trong `MT_GRMS.UnitTests` đảm bảo toàn bộ tests PASS và không có lỗi biên dịch (REQ-POS-CUST-01, REQ-POS-RECEIPT-LAYOUT-01).
