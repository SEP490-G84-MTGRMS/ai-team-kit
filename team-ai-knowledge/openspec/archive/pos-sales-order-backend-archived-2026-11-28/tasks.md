# Tasks: Phân Hệ Bán Hàng POS Backend & Tích Hợp Thiết Bị Phần Cứng (Tạp Hóa / Siêu Thị Mini)

## 1. Backend Infrastructure & Printer Service
- [x] T1: Hiện thực hóa `RawPrinterHelper` (P/Invoke Win32 Spooler `winspool.drv` gửi byte nhị phân RAW) tại `MT_GRMS.Infrastructure/Services/Printer/RawPrinterHelper.cs` (REQ-POS-04).
- [x] T2: Hiện thực hóa `ThermalPrintService` (ESC/POS chuẩn khổ in 43mm siêu thị mini / tạp hóa trên giấy 58mm, Font B nhỏ gọn ~7.5pt, 32 ký tự/dòng, in đậm, căn lề, format giá, ngắt dòng, thông tin đổi trả trong 24h, cắt giấy tự động) tại `MT_GRMS.Infrastructure/Services/Printer/ThermalPrintService.cs` (REQ-POS-04).

## 2. Backend Application Layer (Logic Nghiệp Vụ)
- [x] T3: Bổ sung DTOs đầy đủ cho đơn hàng POS (`OrderCreateRequest`, `OrderItemCreateDto`, `OrderResponse`, `OrderItemResponse`, `OrderFilterRequest`) và Validator FluentValidation tại `MT_GRMS.Application/PosOrders/` (REQ-POS-01).
- [x] T4: Định nghĩa và hiện thực hóa `IOrderService` và `OrderService` (Xử lý tạo đơn hàng, tính chiết khấu, VAT, tính tiền thối, cộng dồn điểm thưởng, cập nhật nợ khách hàng khi bán nợ có kiểm tra `DebtLimit`) tại `MT_GRMS.Application/PosOrders/OrderService.cs` (REQ-POS-01, REQ-POS-05, REQ-POS-06).
- [x] T5: Hiện thực hóa logic Trừ tồn kho tự động trong `OrderService` (Truy vấn `BranchStocks` theo `BranchId` + `ProductId` theo FEFO, trừ `QuantityOnHand`, gắn `BatchCode` & `CostPrice` vào `OrderDetail`, ném lỗi nếu không đủ tồn kho) (REQ-POS-02).
- [x] T6: Hiện thực hóa `IOrderRepository` và `OrderRepository` (EF Core query có include Details, Branch, Customer) tại `MT_GRMS.Infrastructure/Repositories/OrderRepository.cs` (REQ-POS-01).

## 3. Backend API Controllers & Đăng Ký DI
- [x] T7: Hoàn thiện `OrdersController` (`POST /api/orders`, `GET /api/orders/{id}`, `GET /api/orders`, `POST /api/orders/{id}/print`) tại `MT_GRMS.Api/Controllers/OrdersController.cs` (REQ-POS-01, REQ-POS-04).
- [x] T8: Thêm endpoint tra cứu sản phẩm theo mã vạch `GET /api/products/barcode/{barcode}` vào `ProductsController` (REQ-POS-03).
- [x] T9: Đăng ký DI cho `IThermalPrintService`, `IOrderService`, `IOrderRepository` vào `Program.cs` và kiểm tra `dotnet build` 0 lỗi.

## 4. Backend Unit Tests (Đầy Đủ Test Cases)
- [x] T10: Viết Unit Tests `PosOrderServiceTests.cs` bao phủ đầy đủ các ca:
  - Tạo đơn thành công với tiền mặt và tính đúng tiền thối `ChangeAmount`.
  - Tạo đơn thành công với chuyển khoản VietQR.
  - Tạo đơn bán nợ thành công cho khách hàng có hạn mức hợp lệ.
  - Báo lỗi từ chối khi giỏ hàng rỗng (`ValidationException`).
  - Báo lỗi khi tiền khách đưa nhỏ hơn tổng tiền phải trả.
  - Báo lỗi khi khách bán nợ vượt quá hạn mức nợ `DebtLimit`.
  - Báo lỗi khi sản phẩm không đủ tồn kho tại chi nhánh `BranchStocks`.
  - Trừ tồn kho thành công theo đúng thứ tự lô hạn sử dụng FEFO.
  - Tích điểm thành công cho khách hàng sau khi thanh toán.
  - Kiểm thử `ThermalPrintService` sinh đúng mã lệnh nhị phân ESC/POS và cắt giấy khổ 43mm siêu thị mini.
- [x] T11: Chạy `dotnet test` và xác nhận đạt 100% Pass.

## 5. Frontend Hardware Hook & Tích Hợp Giao Diện
- [x] T12: Tạo React Hook `useBarcodeScanner.ts` tại `MT_GRMS_FRONTEND/src/hooks/useBarcodeScanner.ts` bắt sự kiện máy quét USB HID gõ nhanh (<50ms) + Enter (REQ-POS-03).
- [x] T13: Tích hợp hook quét mã vạch và API `POST /api/orders` vào `PosCheckoutPage.tsx` thay thế dữ liệu mock, tích hợp nút in 1-Click gọi `POST /api/orders/{id}/print` (REQ-POS-01, REQ-POS-04).
- [x] T14: Chạy `npm run build` trên Frontend xác nhận 0 lỗi TypeScript / CSS.

## Tasks Sáp Nhập Từ Các Change Con

<!-- Tasks sáp nhập từ: pos-annhien-data-and-staff-logout -->
# Kế Hoạch Thực Hiện (Tasks): pos-annhien-data-and-staff-logout

## Frontend
- [x] T1 — Cập nhật `posOrderApi.ts`: Xử lý phân giải dữ liệu linh hoạt `res.data?.data?.items || res.data?.data` cho cả `getAllProducts()` và `getAllCustomers()` (REQ-ANNHIEN-01).
- [x] T2 — Bổ sung mock data chuyên biệt cho `tenant_an_nhien_02` trong `posMockData.ts` (5 sản phẩm, 2 khách hàng) và `inventoryMockData.ts` (2 đơn hàng) để hỗ trợ Offline-First hoàn hảo (REQ-ANNHIEN-01).
- [x] T3 — Điều chỉnh `PosCheckoutPage.tsx` và `InvoiceManagementPage.tsx` để khởi tạo dữ liệu cho An Nhiên Mart khi đăng nhập `tenant_an_nhien_02` (REQ-ANNHIEN-01).
- [x] T4 — Xóa bỏ hoàn toàn khối banner thông báo phân lập kho rỗng màu xanh trong `PosCheckoutPage.tsx` (REQ-BANNER-01).
- [x] T5 — Thêm mục "Đăng xuất tài khoản" màu đỏ trong dropdown menu "Thao tác" của `PosHeader.tsx` dành riêng cho vai trò Nhân viên (REQ-LOGOUT-01).

## Test
- [x] T6 — Chạy kiểm thử TypeScript và build kiểm chứng Frontend (`npm run build`).
- [x] T7 — Soạn thảo `test-report.md` và nghiệm thu hoàn tất.


<!-- Tasks sáp nhập từ: pos-branch-pricing-and-fefo -->
# Tasks: pos-branch-pricing-and-fefo

## Phase 1: Database Seeding (Cửa hàng An Nhiên)
- [x] T1 — Viết script SQL chèn dữ liệu 4 sản phẩm mẫu thực tế (G7 3in1, Choco-Pie, Muối Hảo Hảo, Bia Hà Nội Sleek) kèm `ProductUnits`, `BranchProducts`, `BranchProductUnitPrices` và các lô `BranchStocks` FEFO cho `tenant_an_nhien_02` (REQ-POS-13).

## Phase 2: Backend Order Service & DTO
- [x] T2 — Bổ sung `UnitId` và `UnitName` vào `OrderItemCreateDto` trong `OrderDtos.cs` (REQ-POS-10).
- [x] T3 — Cập nhật `IOrderRepository` và `OrderRepository.cs`: Thêm hàm lấy thông tin `BranchProduct`, `BranchProductUnitPrice` và `ProductUnit` theo `BranchId` và `ProductId` (REQ-POS-09, REQ-POS-10).
- [x] T4 — Nâng cấp `OrderService.CreateOrderAsync`: Tra cứu giá bán chi nhánh, quy đổi số lượng cơ sở `BaseQty = Quantity * ConversionRate`, trừ tồn kho `BranchStocks` theo FEFO, và lưu `Order`, `OrderDetail` (REQ-POS-09, REQ-POS-10, REQ-POS-11).

## Phase 3: Backend Unit Tests
- [x] T5 — Viết 6 Unit Tests bao phủ toàn bộ các kịch bản trong `PosOrderServiceTests.cs`: Giá override chi nhánh, giá override ĐVT, trừ kho FEFO 1 lô, trừ kho FEFO nhiều lô, từ chối khi không đủ tồn, hoàn trả kho khi hủy đơn (REQ-POS-09, REQ-POS-10, REQ-POS-11).

## Phase 4: Frontend POS Cart & Multi-Unit Dropdown
- [x] T6 — Cập nhật `PosCartTable.tsx`: Thay thế cột ĐVT tĩnh bằng dropdown `<select className="pos-unit-select">` khi sản phẩm có nhiều đơn vị tính, tự động cập nhật đơn giá hiển thị (REQ-POS-12).
- [x] T7 — Cập nhật `PosCheckoutPage.tsx`: Bổ sung callback `onUpdateItemUnit`, tính toán lại thành tiền và gửi `unitId`, `unitName` khi submit đơn hàng (REQ-POS-10, REQ-POS-12).

## Phase 5: Verification & Build
- [x] T8 — Chạy `dotnet test` xác minh toàn bộ 341+ unit tests backend đều PASS và kiểm tra `npm run build` frontend (REQ-POS-13).


<!-- Tasks sáp nhập từ: pos-customer-api-route-and-field-mapping-fix -->
# Tasks: pos-customer-api-route-and-field-mapping-fix

- [x] T1 — Backend API Routing (`CustomersController.cs` & `CustomerDebtController.cs`): Thêm route kép `[Route("api/v1/[controller]")]` và `[Route("api/v1/customers/debt")]` (tham chiếu REQ-CUST-ROUTE-01).
- [x] T2 — Frontend POS API DTO Mapping (`posOrderApi.ts`): Cập nhật ánh xạ trường `fullName` -> `name`, `phoneNumber` -> `phone`, `customerCode` -> `code` (tham chiếu REQ-CUST-MAP-02).
- [x] T3 — Kiểm thử Tự động & Tích hợp: Kiểm tra gọi endpoint `/api/v1/customers` trả về HTTP 200 và khách hàng `KH26110509554270` (Sơn), chạy toàn bộ unit tests backend và frontend build.


<!-- Tasks sáp nhập từ: pos-debt-checkout-and-multi-lot-fefo -->
# Tasks: POS Debt Checkout, Print Decoupling & Multi-Lot FEFO

- [x] T1 (DB) — Bổ sung các cột công nợ `LastRepaymentAtUtc`, `Notes`, `RowVersion` cho bảng `Customers` trong CSDL PostgreSQL và cập nhật `init-db.sql`. (Tham chiếu: `REQ-POS-DEBT-01`)
- [x] T2 (Frontend - UX) — Cập nhật `PosCartTable.tsx` và `posOrderApi.ts` bỏ hiển thị vị trí kệ sách dưới tên mặt hàng, làm sạch hiển thị và đồng bộ UTF-8 giỏ hàng POS. (Tham chiếu: `REQ-POS-PRINT-02`)
- [x] T3 (Frontend - Decoupling) — Đảm bảo `PosCheckoutPage.tsx` thực hiện lưu đơn hàng thành công trước khi gửi lệnh in nền `printDirect`, lỗi in không làm gián đoạn đơn. (Tham chiếu: `REQ-POS-PRINT-02`)
- [x] T4 (Backend - Logic) — Xác minh thuật toán FEFO đa lô trong `OrderService.cs` cấn trừ liên hoàn tuần tự qua nhiều lô theo hạn dùng gần nhất. (Tham chiếu: `REQ-POS-FEFO-03`)
- [x] T5 (Test) — Chạy toàn bộ kiểm thử tự động `MT_GRMS.UnitTests` (347 tests) và frontend vitest (`npm test -- pos`), đảm bảo 100% PASS. (Tham chiếu: `REQ-POS-DEBT-01`, `REQ-POS-FEFO-03`)


<!-- Tasks sáp nhập từ: pos-debt-validation-and-receipt-hotline-fix -->
# Tasks: pos-debt-validation-and-receipt-hotline-fix

- [x] T1 — Backend ESC/POS Receipt (`ThermalPrintService.cs`): Xóa dòng `Doi tra trong 24h kem hoa don.`, chuẩn hóa ngắt dòng hotline và thông tin chi nhánh (tham chiếu REQ-POS-PRINT-03, REQ-POS-HOTLINE-04).
- [x] T2 — Frontend Quản lý hóa đơn & Modal Thu Nợ (`InvoiceManagementPage.tsx` & `CollectDebtModal.tsx`): Ẩn nút "Thu nợ" khi hóa đơn đã hết nợ (`debtAmount <= 0`), sửa lỗi HTML5 min-max validation và hiện thông báo đã tất toán (tham chiếu REQ-POS-DEBT-01).
- [x] T3 — Frontend POS Tìm kiếm khách hàng đa tiêu chí (`PosPaymentPanel.tsx` & `PosCheckoutPage.tsx`): Cho phép gõ chữ, tìm kiếm theo Tên (không dấu & có dấu), SĐT và Mã KH; đồng bộ danh sách khách hàng từ CSDL (tham chiếu REQ-POS-CUST-02).
- [x] T4 — Frontend Hóa đơn bán lẻ & Preview (`PosReceiptModal.tsx` & `PosCheckoutPage.tsx`): Xóa 2 dòng thừa chân bill, xóa mã lô nội bộ `(LÔ-FEFO)`, căn chỉnh dòng Tổng cộng và Thành tiền thẳng cột, truyền đúng Hotline chi nhánh (tham chiếu REQ-POS-PRINT-03, REQ-POS-HOTLINE-04).
- [x] T5 — Kiểm thử Tự động & Hồi quy: Chạy test xUnit `MT_GRMS.UnitTests` và Frontend build/test để đảm bảo hệ thống hoạt động ổn định 100%.


<!-- Tasks sáp nhập từ: pos-lookup-branch-scoping-and-loyalty-rules -->
# Kế hoạch thực hiện (Tasks): Phân quyền Tra cứu Chi nhánh & Hoàn thiện Tích - Tiêu Điểm FE-16

- [x] **T1 (Backend DTO & Service)**: Bổ sung `PointsRedeemed` vào `OrderCreateRequest` (`OrderDtos.cs`) và xử lý trừ điểm tích lũy của khách hàng (`customer.RewardPoints -= pointsToDeduct`) trước khi tích điểm mới trong `OrderService.cs`.
- [x] **T2 (Backend Unit Test)**: Viết unit test `REQ_FE16_RedeemRewardPoints_DeductsPointsAndEarnsNewPoints` trong `PosOrderServiceTests.cs` kiểm chứng tiêu điểm tích lũy và cập nhật tổng chi tiêu / điểm mới chính xác.
- [x] **T3 (Frontend POS Header)**: Xóa nút "Tra cứu Lô FEFO" khỏi thanh header bán hàng POS (`PosHeader.tsx`), thêm `onClick={(e) => e.stopPropagation()}` cho dropdown chi nhánh chống nhảy route ngoài ý muốn.
- [x] **T4 (Frontend Tra Cứu Tồn Kho)**: Nâng cấp `InventoryLookupPage.tsx` phân quyền chi nhánh theo vai trò: `STORE_OWNER` tự do chọn Ba Đình, Cầu Giấy, Đống Đa; `EMPLOYEE` bị khóa cứng theo chi nhánh công tác; hiển thị tên thu ngân thật từ auth store.
- [x] **T5 (Verification & Build)**: Kiểm thử toàn bộ hệ thống (`dotnet test` 353/353 PASS, `npm run build` PASS 0 lỗi).


<!-- Tasks sáp nhập từ: pos-order-management-debt-refinement -->
# Danh Sách Công Việc (Tasks Checklist)

## Phân Nhóm 1: Tinh Gọn Giao Diện POS (UI Cleanup)
- [x] T1 — Gỡ bỏ nút "Về Dashboard" cạnh logo quầy và icon vương miện trên `PosHeader.tsx` (REQ-POS-UI-CLEANUP)
- [x] T2 — Xóa khối chọn nhanh tài khoản kiểm thử trên `LoginPage.tsx` (REQ-POS-UI-CLEANUP)
- [x] T3 — Tinh giản `AddCustomerModal.tsx`: bỏ ô `Mã KH:` và `Nhóm:`, tự động sinh mã ngầm (REQ-POS-UI-CLEANUP)

## Phân Nhóm 2: Đổi Mới Nghiệp Vụ Bán Nợ Tạp Hóa (Debt Refinement)
- [x] T4 — Bỏ hạn mức nợ cứng trên `PosPaymentPanel.tsx` và `PosCheckoutPage.tsx`, bổ sung theo dõi số lần nợ và tổng nợ (REQ-POS-DEBT)
- [x] T5 — Cập nhật Backend `OrderDtos.cs` và `OrderService.cs`: gỡ bỏ kiểm tra `DebtLimit`, bổ sung `CustomerPhone`, `DepositAmount`, `Note` (REQ-POS-DEBT)

## Phân Nhóm 3: Backend Quản Lý Đơn Hàng & Đơn Đặt Trước Giữ Kho (Order Management)
- [x] T6 — Chèn dữ liệu CSDL PostgreSQL 4 hóa đơn bán lẻ + 3 đơn đặt trước giữ kho cho tài khoản `0901234567` trong `DbInitializer.cs` (REQ-POS-ORDER-MGMT)
- [x] T7 — Xóa quy định "100% tại quầy (Không có công nợ lẻ)" và kết nối API Backend trong `InvoiceManagementPage.tsx` (REQ-POS-ORDER-MGMT)

## Phân Nhóm 4: Kiểm Thử & Nghiệm Thu (Testing & Verification)
- [x] T8 — Chạy kiểm thử tự động `dotnet test`: 162/162 Unit tests Backend PASSED 100% (REQ-POS-ORDER-MGMT)
- [x] T9 — Chạy kiểm thử biên dịch `npm run build`: Vite build Frontend 0 lỗi TypeScript (REQ-POS-ORDER-MGMT)


<!-- Tasks sáp nhập từ: pos-return-exchange-and-preorder -->
# Tasks: pos-return-exchange-and-preorder

## Backend (.NET 8 Clean Architecture)
- [x] T1 — Cập nhật `OrderService.CreatePreOrderAsync` kiểm tra cọc tối thiểu $\ge 10\%$ và cập nhật `CancelOrderAsync` kiểm tra Role người dùng (chặn `CASHIER`) (REQ_POS_PRE_03, REQ_POS_SEC_02)
- [x] T2 — Thêm DTOs `ReturnExchangeRequest` và phương thức `ProcessReturnExchangeAsync` trong `OrderService` xử lý hoàn kho hàng cũ, trừ kho FEFO hàng mới, bù trừ tiền/nợ (REQ_POS_RET_01)
- [x] T3 — Thêm API endpoint `POST /api/orders/{id}/return-exchange` trong `OrdersController.cs` (REQ_POS_RET_01)

## Frontend (React + Vite + TypeScript)
- [x] T4 — Cập nhật `posOrderApi.ts` thêm phương thức `returnExchangeOrder` và tích hợp kiểm tra Role ẩn/khóa nút "Hủy đơn" với Thu ngân trong `InvoiceManagementPage.tsx` (REQ_POS_SEC_02)
- [x] T5 — Xây dựng component `ReturnExchangeModal.tsx` (3 khối: hàng trả, hàng đổi mới, bù trừ chênh lệch) và gắn nút "Đổi / Trả hàng" trong `InvoiceManagementPage.tsx` (REQ_POS_RET_01)
- [x] T6 — Thêm ràng buộc kiểm tra cọc $\ge 10\%$ và hiển thị chi nhánh nhận hàng cho đơn đặt trước (REQ_POS_PRE_03)

## Testing & Verification
- [x] T7 — Viết Unit Tests trong `PosReturnExchangeTests.cs` kiểm tra đổi trả, phân quyền hủy, cọc 10%; chạy xác minh toàn bộ test backend `dotnet test` và build frontend `npm run build` (REQ_POS_RET_01, REQ_POS_SEC_02, REQ_POS_PRE_03)


<!-- Tasks sáp nhập từ: preorder-fefo-tests-and-ux -->
# Tasks: Pre-Order FEFO Allocation & Smart Product Selector UX

- [x] T1 — Viết Unit Test đa lô FEFO `CreatePreOrderAsync_MultiBatchFEFO_AllocatesFromEarliestExpiryDateFirst` trong `PosOrderServiceTests.cs` (REQ-POS-PRE-04)
- [x] T2 — Nâng cấp giao diện chọn sản phẩm trong `CreatePreOrderModal.tsx` với Autocomplete Search Box và Floating Dropdown (REQ-POS-PRE-05)
- [x] T3 — Thêm các nút điều chỉnh số lượng `+` / `-` trực tiếp trong bảng sản phẩm đã chọn của modal (REQ-POS-PRE-05)
- [x] T4 — Chạy kiểm thử toàn diện `dotnet test` và `npm run build` xác nhận PASS 100%
