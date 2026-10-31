# EXP-2026-10-31-001: Khảo sát Phân hệ Bán hàng POS Backend & Tích hợp Phần cứng (Máy in nhiệt + Máy quét)

## 1. Problem Statement
Hệ thống MT-GRMS hiện đã có giao diện bán hàng POS tại quầy (`PosCheckoutPage.tsx`), tuy nhiên:
1. Giao diện vẫn đang chạy trên Mock Data (`posMockData.ts`), chưa có luồng tạo đơn hàng, thanh toán và trừ kho thực tế.
2. Phía Backend .NET, `OrdersController` và `OrderService` mới chỉ là khung rỗng chưa có logic xử lý nghiệp vụ bán lẻ.
3. Cửa hàng chưa thể in hóa đơn bán hàng trực tiếp ra máy in nhiệt USB (POS-58) bằng cơ chế 1-Click (không popup browser preview).
4. Chưa có cơ chế nhận diện máy quét mã vạch USB HID tự động để tra cứu sản phẩm vào đơn hàng.
5. Thiếu bộ Unit Tests theo Clean Architecture để đảm bảo độ tin cậy tuyệt đối cho luồng tính toán tài chính và tồn kho.

## 2. Context & Background
- Dự án: MT-GRMS (Multi-Tenant Grocery Retail Management System).
- Backend: .NET 8 Web API, EF Core 8, SQL Server, Clean Architecture 4 tầng.
- Frontend: React 19, TypeScript, Tailwind CSS, Vite.
- Thiết bị phần cứng mục tiêu:
  - Máy in nhiệt khổ 58mm cổng USB (Driver Windows: `POS-58`).
  - Máy quét mã vạch USB HID (hoạt động như bàn phím ảo gõ nhanh <50ms kèm phím Enter).
- Tài liệu kiểm thử thực tế đã xác nhận tính khả thi: `Test_may_in_may_quet/HUONG_DAN_TICH_HOP_IN_HOA_DON_MT_GRMS.md`.

## 3. Constraints
- **Multi-tenancy**: Mọi truy vấn và ghi dữ liệu Order, Customer, Product phải luôn kèm `TenantId` từ token người dùng đăng nhập.
- **Clean Architecture**: Controller không được truy cập trực tiếp Domain Entity; chỉ giao tiếp qua DTOs và Application Service.
- **In ấn Windows Spooler**: Không dùng popup trình duyệt `window.print()`; backend gọi thẳng P/Invoke `winspool.drv` với kiểu dữ liệu `RAW` và lệnh nhị phân ESC/POS.
- **Tiền tệ & Ký tự**: Tiền VND kiểu `decimal(18,2)`. Khi in bill 58mm dùng bảng mã ASCII không dấu để máy in nhiệt in sắc nét, không bị lỗi font tiếng Việt.

## 4. Assumptions
- **[ASSUMPTION-01]**: Máy in nhiệt POS-58 được cắm vào cổng USB máy tính thu ngân chạy hệ điều hành Windows và đã cài driver máy in chuẩn.
- **[ASSUMPTION-02]**: Máy quét mã vạch hoạt động theo chuẩn USB HID Keyboard, tự động gửi chuỗi mã vạch và kết thúc bằng phím Enter.
- **[ASSUMPTION-03]**: Trong ca bán hàng, mỗi giao dịch bán lẻ hoàn tất lập tức cập nhật trạng thái thanh toán và số dư nợ của khách hàng (nếu là bán nợ).

## 5. Scope & Non-Goals
### In Scope:
- Hiện thực hóa `IOrderService`, `OrderService`, `IOrderRepository`, `OrderRepository`, DTOs và `OrdersController`.
- Triển khai logic tính toán chiết khấu (dòng, đơn), thuế VAT, tiền thối, tích/tiêu điểm và bán nợ có kiểm tra hạn mức `DebtLimit`.
- Hiện thực hóa `RawPrinterHelper` (Win32 Spooler P/Invoke) và `ThermalPrintService` (ESC/POS 58mm 32 ký tự/dòng).
- Thêm endpoint tra cứu sản phẩm theo mã vạch `GET /api/products/barcode/{barcode}`.
- Xây dựng React Hook `useBarcodeScanner` trên Frontend POS.
- Kết nối `PosCheckoutPage` gọi API thanh toán và nút in hóa đơn 1-Click.
- Viết Unit Tests đầy đủ cho `OrderService` và `ThermalPrintService`.

### Out of Scope (Non-Goals):
- Tích hợp máy in mạng qua giao thức TCP/IP raw socket (chỉ hỗ trợ USB Win32 Spooler).
- Tích hợp cổng thanh toán trực tuyến trừ tiền thẻ tự động (chỉ hỗ trợ tạo mã VietQR tĩnh/động cho thu ngân đối soát).

## 6. So Sánh Các Phương Án Kỹ Thuật (Options Comparison)

| Tiêu chí | Phương án A: In qua Trình duyệt (`window.print`) | Phương án B (Chọn): In trực tiếp RAW ESC/POS qua Backend (`winspool.drv`) |
|---|---|---|
| **Trải nghiệm thu ngân** | Hiện popup Print Preview của Chrome/Edge, phải bấm Enter/Click xác nhận, mất 3 - 5 giây. | **1-Click tức thì**, máy in chạy giấy trong 0.3 giây, hoàn toàn không có popup. |
| **Độ sắc nét hóa đơn** | Chữ mờ, răng cưa do trình duyệt render bitmap đồ họa GDI 203 DPI. | **Cực kỳ sắc nét** nhờ dùng Hardware Font vi điều khiển của máy in nhiệt. |
| **Lệnh phần cứng** | Không thể gửi lệnh cắt giấy tự động, mở ngăn kéo tiền. | **Gửi được đầy đủ lệnh**: Cắt giấy (`0x1D 0x56`), in đậm, căn lề. |
| **Tính bảo mật** | Dữ liệu in dễ bị sửa đổi trên client. | Backend kiểm soát và sinh byte nhị phân chính xác theo đơn hàng trong DB. |

👉 **Quyết định**: Chọn **Phương án B** theo đúng tài liệu bàn giao kỹ thuật của dự án.
