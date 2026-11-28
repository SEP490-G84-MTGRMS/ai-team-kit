# Tasks: pos-sales-checkout-ui

## Types & Mock Data
- [x] T1 — Định nghĩa Types và Mock Data chuẩn ERD trong `src/features/pos/types/pos.types.ts` và `src/features/pos/mock/posMockData.ts` (REQ-POS-01, REQ-POS-04)

## Modals
- [x] T2 — Xây dựng bộ Modals nghiệp vụ: Thêm khách hàng, Dynamic VietQR Napas 247, Thêm nhanh hàng hóa, Cảnh báo bán dưới giá vốn kèm PIN Quản lý, Chiết khấu đơn hàng trong `src/features/pos/components/modals/` (REQ-POS-03, REQ-POS-04, REQ-POS-05)

## Components Quầy POS
- [x] T3 — Xây dựng `PosHeader.tsx` (thông tin quầy, multi-tab hóa đơn F1, chuyển chế độ bán nhanh/thường, giữ đơn, phím tắt) (REQ-POS-01, REQ-POS-02)
- [x] T4 — Xây dựng `PosCartTable.tsx` (bảng giỏ hàng chi tiết, tăng giảm số lượng, popover chiết khấu món, xóa món) (REQ-POS-03)
- [x] T5 — Xây dựng `PosCatalogGrid.tsx` (lưới danh mục cảm ứng Touch Screen, lọc theo nhóm hàng, tái sử dụng phân trang có sẵn) (REQ-POS-02)
- [x] T6 — Xây dựng `PosPaymentPanel.tsx` (tìm kiếm khách hàng F4, điểm tích lũy, bảng tính tiền, Tiền mặt F8 tính tiền thừa, chọn VietQR, nút Thanh toán) (REQ-POS-04, REQ-POS-05)
- [x] T7 — Xây dựng Mẫu in Hóa đơn nhiệt K80 `PosReceiptModal.tsx` chuẩn 80mm ESC/POS kèm nút `window.print()` và mã VietQR chân bill (REQ-POS-06)

## Page & Routing
- [x] T8 — Tích hợp `PosCheckoutPage.tsx`, stylesheet `pos.css`, cập nhật route `/pos` trong `src/app/router.tsx` và export public API tại `src/features/pos/index.ts` (REQ-POS-01 đến REQ-POS-06)

## Build & Kiểm chứng
- [x] T9 — Kiểm thử toàn diện giao diện, chạy `npm run build` trên `MT_GRMS_FRONTEND` xác nhận 0 lỗi (Acceptance checklist)

## Tasks Sáp Nhập Từ Các Change Con

<!-- Tasks sáp nhập từ: refactor-pos-sales-layout -->
# Tasks: Tối ưu Bố cục Màn hình Bán hàng POS

- [x] T1: Tạo component `PosCatalogModal.tsx` bọc `PosCatalogGrid` dạng dialog modal chuẩn MT-GRMS với nút đóng ✕, phím ESC và hỗ trợ phím tắt F3. (REQ-POS-LAYOUT-01)
- [x] T2: Cập nhật `PosCheckoutPage.tsx`: kết nối state mở `PosCatalogModal`, tích hợp toggle F3 và đóng ESC, gỡ bỏ grid inline chèn ép cột trái. (REQ-POS-LAYOUT-01)
- [x] T3: Cập nhật `pos.css` cho bảng giỏ hàng: bỏ giới hạn cứng 380px, tối ưu padding hàng giỏ hàng để hiển thị thoải mái $\ge 7$ mặt hàng cùng lúc. (REQ-POS-LAYOUT-02)
- [x] T4: Cập nhật `pos.css` và `PosPaymentPanel.tsx`: mở rộng chiều rộng cột phải lên 450px, tối ưu khoảng cách nội bộ và fieldset chống tràn đáy màn hình. (REQ-POS-LAYOUT-03)
- [x] T5: Kiểm tra toàn diện giao diện và chạy `npm run build` để xác minh không có lỗi TypeScript hay layout breaking. (REQ-POS-LAYOUT-01, REQ-POS-LAYOUT-02, REQ-POS-LAYOUT-03)


<!-- Tasks sáp nhập từ: pos-customer-persistence-and-receipt-redesign -->
# Danh sách công việc: pos-customer-persistence-and-receipt-redesign

## Backend
- [x] T1 — Cập nhật `ThermalPrintService.cs`: Loại bỏ tính toán và in dòng VAT (`Thue VAT:`), loại bỏ dòng Wifi mặc định, in động tên cửa hàng/chi nhánh/địa chỉ/hotline từ dữ liệu Branch/Tenant của đơn hàng, và bổ sung khối THÔNG TIN KHÁCH HÀNG ở chân bill (REQ-POS-VAT-01, REQ-POS-DYNAMIC-STORE-01, REQ-POS-RECEIPT-LAYOUT-01).

## Frontend
- [x] T2 — Cập nhật `AddCustomerModal.tsx`: Tích hợp gọi `customerApi.createCustomer(...)`, thêm state `isSubmitting` với spinner, bắt lỗi trùng số điện thoại (`PHONE_EXISTS`) và trả về `Customer` thật với GUID ID từ CSDL PostgreSQL (REQ-POS-CUST-01).
- [x] T3 — Cập nhật `PosCheckoutPage.tsx`: Mở rộng state `activeBranch` lưu trữ cả địa chỉ và điện thoại chi nhánh; cập nhật `buildReceiptData` lấy thông tin Tenant/Chi nhánh động và gỡ bỏ hoàn toàn VAT (`vatAmount: 0`, `finalAmount = finalAmount`); cập nhật state `customers` khi lưu khách mới (REQ-POS-CUST-01, REQ-POS-VAT-01, REQ-POS-DYNAMIC-STORE-01).
- [x] T4 — Thiết kế lại `PosReceiptModal.tsx`: Bố cục hóa đơn theo mẫu thực tế siêu thị Đức Thành gồm Header thông tin đơn vị/địa chỉ/hotline, Bảng hàng hóa chuẩn (STT, Hàng hóa, SL, Đơn giá, Thành tiền), xóa sạch các dòng VAT ("Tổng tiền chưa VAT", "Thuế GTGT"), và bổ sung khối THÔNG TIN KHÁCH HÀNG ở chân bill (REQ-POS-RECEIPT-LAYOUT-01, REQ-POS-VAT-01).

## Test
- [x] T5 — Kiểm thử tự động Frontend và Backend: Chạy `npm test` trong `MT_GRMS_FRONTEND` và `dotnet test` trong `MT_GRMS.UnitTests` đảm bảo toàn bộ tests PASS và không có lỗi biên dịch (REQ-POS-CUST-01, REQ-POS-RECEIPT-LAYOUT-01).


<!-- Tasks sáp nhập từ: pos-inventory-invoice-ui -->
# Danh sách Công việc Thực thi (Tasks) — pos-inventory-invoice-ui

- [x] Định nghĩa các class DTO cho tồn kho FEFO và hóa đơn bán lẻ trong `src/features/pos/types/inventory.types.ts`
- [x] Xây dựng Mock Data phong phú cho tồn kho chi nhánh, lô FEFO, hóa đơn bán lẻ và đơn đặt trước trong `src/features/pos/mock/inventoryMockData.ts`
- [x] Xây dựng CSS styling đồng bộ (`inventory.css`, `invoices.css`) chuẩn Deep Teal `#0F766E`, font Be Vietnam Pro, rounded pill
- [x] Xây dựng Màn hình Tra cứu tồn kho & Lô FEFO `src/features/pos/pages/InventoryLookupPage.tsx`
- [x] Xây dựng Màn hình Quản lý hóa đơn & Đơn đặt trước `src/features/pos/pages/InvoiceManagementPage.tsx` tái sử dụng `TablePagination`
- [x] Cập nhật Menu Hamburger `[ ≡ Thao tác ]` trong `src/features/pos/components/PosHeader.tsx`
- [x] Cập nhật định tuyến Routing trong `src/app/router.tsx` cho các path `/employee/inventory-lookup`, `/employee/orders` và alias `/pos/...`
- [x] Xác minh toàn bộ bằng lệnh `npm run build` đảm bảo không phát sinh lỗi TypeScript


<!-- Tasks sáp nhập từ: pos-invoice-layout-and-debt-payment-method -->
# Tasks: POS Invoice Layout & Credit Debt Payment Method

- [x] T1 (Frontend - Mapping) — Cập nhật toàn bộ logic ánh xạ đơn hàng trong `InvoiceManagementPage.tsx` nhận diện `CREDIT` và `DEBT`, gán đúng `Ghi nợ`, `debtAmount`, `finalPaidAmount` và `status`. (Tham chiếu: `REQ-POS-INVOICE-01`)
- [x] T2 (Frontend - Filtering) — Cập nhật bộ lọc `paymentMethodFilter === 'DEBT'` bao gồm cả các đơn `CREDIT` và `DEBT`. (Tham chiếu: `REQ-POS-INVOICE-01`)
- [x] T3 (Frontend - Layout) — Cân đối lại độ rộng các cột bảng hóa đơn (`pos-shift-table`), nâng `Mã hóa đơn` lên 180px, `Thao tác` lên 210px, căn chỉnh các cột số tiền thẳng hàng. (Tham chiếu: `REQ-POS-INVOICE-02`)
- [x] T4 (Frontend - Cashier UX) — Xử lý loại bỏ cặp dấu ngoặc đơn rỗng `()` khi `cashierId` rỗng trong dòng chi tiết thu ngân. (Tham chiếu: `REQ-POS-INVOICE-02`)
- [x] T5 (Test) — Chạy kiểm thử tự động `npm test -- pos` và `npm run build`, đảm bảo pass 100%. (Tham chiếu: `REQ-POS-INVOICE-01`, `REQ-POS-INVOICE-02`)


<!-- Tasks sáp nhập từ: pos-receipt-layout-cashier-and-preorder-units -->
# Tasks: pos-receipt-layout-cashier-and-preorder-units

- [x] T1: Viết Unit Test kiểm thử bố cục in 2 dòng trên khổ 40 ký tự và tính tỷ lệ quy đổi trong `CreatePreOrderAsync` (tham chiếu REQ-POS-PRINT-01, REQ-POS-PREORDER-BACKEND-01)
- [x] T2: Nâng cấp `ThermalPrintService.cs` và `IThermalPrintService.cs`: layout 2 dòng cho mặt hàng (`stt. name` + `qty x price` và `lineTotal` căn phải tại cột 40), nhận `cashierName` động (tham chiếu REQ-POS-PRINT-01, REQ-POS-CASHIER-01)
- [x] T3: Cập nhật `OrderDtos.cs` và `OrdersController.cs`: bổ sung `CashierName` vào `PrintOrderRequest` và `OrderCreateRequest`, truyền vào `PrintOrderInvoiceAsync` (tham chiếu REQ-POS-CASHIER-01)
- [x] T4: Cập nhật `OrderService.cs` method `CreatePreOrderAsync`: tính `baseQty = item.Quantity * conversionRate` khi giữ tồn kho FEFO (tham chiếu REQ-POS-PREORDER-BACKEND-01)
- [x] T5: Cập nhật Frontend `PosCheckoutPage.tsx` và `PosReceiptModal.tsx`: gửi `cashierName` khi tạo đơn/in hóa đơn và hiển thị nhãn theo vai trò (Chủ cửa hàng / Nhân viên) (tham chiếu REQ-POS-CASHIER-01)
- [x] T6: Cập nhật Frontend `InvoiceManagementPage.tsx`: hiển thị động Người tạo / Thu ngân theo vai trò người dùng thay vì chuỗi gán cứng (tham chiếu REQ-POS-CASHIER-01)
- [x] T7: Cập nhật Frontend `CreatePreOrderModal.tsx`: thêm dropdown chọn đơn vị tính (`unitPrices`), tự động tính đơn giá, thành tiền và chặn tồn kho theo `floor(tồn / rate)` (tham chiếu REQ-POS-PREORDER-UNIT-01)
- [x] T8: Chạy kiểm thử tự động `dotnet test` và `npm run build` để xác minh toàn bộ tiêu chí nghiệm thu (Acceptance Criteria)


<!-- Tasks sáp nhập từ: pos-sepay-ui-and-nav-refinement -->
# Tasks: Tinh chỉnh Giao diện Cấu hình SePay thành Trang Độc Lập & Khôi phục Giao diện Gói dịch vụ

## 1. Khôi phục nguyên bản Giao diện Gói dịch vụ
- [x] Khôi phục `StoreSettingsHubPage.tsx` về nguyên trạng (chỉ còn tab `subscriptions`, xóa import tab payment config).
- [x] Khôi phục `StoreSidebarNav.tsx` về danh sách tab ban đầu.
- [x] Khôi phục `AppTopNav.tsx` (nút bánh răng trỏ về `/store-owner/subscriptions`).
- [x] Xóa bỏ file `StorePaymentConfigTab.tsx` thừa.

## 2. Xây dựng Trang Độc Lập Cấu hình SePay
- [x] Tạo component `StorePaymentConfigPage.tsx` tại `src/features/pos/pages/`.
- [x] Thiết kế Form bên trái: Chọn ngân hàng (VietinBank, Vietcombank, BIDV, MB...), số tài khoản, tên chủ thẻ, SePay API Key (ẩn/hiện mắt xem, sao chép nhanh, bảo mật).
- [x] Tích hợp Cẩm nang SePay 5 bước bên phải có Mockup UI SePay chân thực (màn hình API Key và Webhook trên my.sepay.vn).
- [x] Đăng ký route độc lập `/store-owner/payment-config` và `/pos/payment-config` trong `router.tsx`.

## 3. Cập nhật Điều hướng POS
- [x] Cập nhật `PosHeader.tsx`: Nút bánh răng và menu Cấu hình VietQR & SePay điều hướng trực tiếp bằng `navigate('/store-owner/payment-config')`.

## 4. Kiểm thử & Đảm bảo chất lượng (Quality Gate)
- [x] Dọn sạch các import không dùng (`Radio`, `Info`).
- [x] Chạy `tsc -b && vite build` kiểm tra toàn diện, build thành công 100%.


<!-- Tasks sáp nhập từ: pos-vietqr-sepay-payment-and-settings -->
# Kế Hoạch Triển Khai (Tasks): pos-vietqr-sepay-payment-and-settings

- [x] T1: [Backend] Định nghĩa Entity StorePaymentConfig, PaymentTransaction và các DTOs cấu hình thanh toán ngân hàng (REQ-PAY-CONFIG-01, REQ-IDEMPOTENCY-01)
- [x] T2: [Backend] Triển khai SePayWebhookController với 6 lớp bảo mật (kiểm tra Secret Token, IP Whitelist, Double-Check SePay API, Idempotency) và PaymentConfigController (REQ-WEBHOOK-SECURITY-01, REQ-IDEMPOTENCY-01)
- [x] T3: [Frontend] Xây dựng component PaymentConfigModal gồm 2 Tab: Cấu hình tài khoản ngân hàng (che mặt nạ API Key an toàn) & Cẩm nang hướng dẫn đăng ký SePay 5 bước trực quan (REQ-PAY-CONFIG-01, REQ-SEPAY-GUIDE-01)
- [x] T4: [Frontend] Tích hợp nút Bánh răng cài đặt trên PosHeader.tsx (chỉ hiển thị cho STORE_OWNER) và AppTopNav.tsx để mở nhanh PaymentConfigModal (REQ-PAY-CONFIG-01)
- [x] T5: [Frontend] Xây dựng component VietQrPaymentModal hiển thị mã VietQR động chuẩn Napas 247 và tích hợp vào quy trình thanh toán quầy PosCheckoutPage.tsx (REQ-VIETQR-CHECKOUT-01)
- [x] T6: [Frontend] Cung cấp cấu hình thanh toán mẫu cho tenant_an_nhien_02 và tenant_mt_mart_01 trong posMockData.ts để hỗ trợ trải nghiệm Offline-First hoàn hảo (REQ-PAY-CONFIG-01, REQ-VIETQR-CHECKOUT-01)
- [x] T7: [Verification] Kiểm tra build toàn diện Frontend (npm run build) và Backend (dotnet build), đảm bảo 0 lỗi biên dịch và không có warning nghiêm trọng (REQ-PAY-CONFIG-01, REQ-WEBHOOK-SECURITY-01)


<!-- Tasks sáp nhập từ: store-settings-dropdown-nav -->
# Tasks: store-settings-dropdown-nav

## 1. Frontend Development & Refinement
- [x] T1: Bổ sung state `settingsMenuOpen`, `settingsMenuRef`, `settingsTimerRef` và logic hover debounce 220ms cho icon Bánh Răng trong `AppTopNav.tsx` (REQ-TOPNAV-01).
- [x] T2: Dựng Dropdown Menu UI tinh gọn chỉ gồm đúng 2 mục: Cấu hình VietQR & SePay (`/store-owner/payment-config`) và Gói dịch vụ MT-GRMS (`/store-owner/subscriptions`), không phát sinh các nút phụ (REQ-TOPNAV-02).
- [x] T3: Bổ sung xử lý sự kiện đóng dropdown khi click outside, nhấn Escape, và khi đổi route (REQ-TOPNAV-01).
- [x] T4: Xóa nút Cài đặt và menu Cấu hình trong màn hình Quầy POS (`PosHeader.tsx`) vì bên ngoài TopNav đã có sẵn (REQ-TOPNAV-01).
- [x] T5: Xóa nút "Quay lại" trong trang độc lập Cấu hình thanh toán (`StorePaymentConfigPage.tsx`) (REQ-TOPNAV-01).

## 2. Verification & Quality Gate
- [x] T6: Kiểm tra biên dịch TypeScript và đóng gói Vite (`tsc -b && vite build`) đạt 100% không lỗi (REQ-TOPNAV-03).
- [x] T7: Đảm bảo giao diện và mã nguồn trang Gói dịch vụ (`StoreSettingsHubPage.tsx`) giữ nguyên bản 100% (REQ-TOPNAV-03).
