# EXP-2026-11-05-POS: Khám phá giải pháp lưu khách hàng tại POS & chuẩn hóa form hóa đơn in bán lẻ

## 1. Problem Statement
Hiện tại tại phân hệ POS bán hàng (MT-GRMS):
1. Khi thu ngân bấm "Thêm khách hàng" tại quầy thu ngân thông qua `AddCustomerModal.tsx`, dữ liệu khách hàng chỉ được khởi tạo dưới dạng mock object với ID tạm (`kh-${Date.now()}`) và gán vào state tạm thời của component mà không hề gọi API `POST /api/customers` để persist vào cơ sở dữ liệu PostgreSQL. Hậu quả là khi thu ngân bấm bỏ chọn khách hàng hoặc tải lại trang, thông tin khách hàng bị mất hoàn toàn, không thể tìm lại được qua SĐT/Tên và không thể tích điểm hay ghi nợ.
2. Mẫu in hóa đơn (cả xem trước trên `PosReceiptModal.tsx` và in nhiệt qua máy in ESC/POS `ThermalPrintService.cs`) bị hardcode thông tin thương hiệu cố định ("SIÊU THỊ MINI MT-GROCERY", "123 Xuân Thủy"), không tự động ánh xạ theo Tenant và Chi nhánh đang đăng nhập của thu ngân (ví dụ An Nhiên Mart). Đồng thời, hóa đơn còn hiển thị dòng "Tổng tiền chưa VAT" và "Thuế GTGT (VAT)", không phù hợp với thực tế bán lẻ tại siêu thị mini/tạp hóa và gây rối mắt cho khách hàng. Bố cục hóa đơn chưa chuẩn hóa theo form siêu thị thực tế (STT, cột hàng hóa, đơn giá, thành tiền, và khối thông tin khách hàng chi tiết ở chân bill).

## 2. Context & Background
- Hệ thống backend đã có sẵn:
  - Endpoint `POST /api/customers` trong `CustomersController.cs` nhận `CreateCustomerRequest`, kiểm tra trùng số điện thoại theo Tenant, sinh `CustomerCode` chuẩn và lưu vào bảng `Customers`.
  - Frontend đã có method `customerApi.createCustomer(...)` trong `src/features/customer-crm/api/customerApi.ts` kết nối tới endpoint này.
  - Endpoint `/branches/summaries` trả về thông tin chi nhánh gồm `name`, `address`, `phone`.
  - Thông tin tenant và chi nhánh hiện tại của người dùng đã có trong `useAuthStore` (`user.tenantName`, `user.branchId`).
  - Hóa đơn nhiệt ESC/POS được xử lý bởi `ThermalPrintService.cs` (khổ giấy 58mm / 32 ký tự).

## 3. Constraints
- Tuân thủ Clean Architecture của backend và mô hình feature slice của frontend.
- Khổ in nhiệt chuẩn 58mm/43mm (tối đa 32 ký tự mỗi dòng đối với Font B) của máy in POS-58.
- Tuyệt đối không làm thay đổi các bảng CSDL đã có (`Customers`, `Orders`, `Branches`), chỉ tận dụng các cột dữ liệu sẵn có.
- Đảm bảo tính đa tenant (Multi-tenancy): Mọi truy vấn và tạo khách hàng phải gắn đúng `TenantId` của phiên làm việc.

## 4. Assumptions
- **[ASSUMPTION-01]**: Mỗi chi nhánh hoặc tenant có thông tin tên, địa chỉ, số hotline xác định. Nếu chi nhánh thiếu hotline riêng, sẽ dùng hotline của tenant hoặc số điện thoại chi nhánh.
- **[ASSUMPTION-02]**: Tại quầy thu ngân siêu thị mini, giá bán của sản phẩm là giá cuối cùng đã bao gồm các loại thuế phí liên quan; không thực hiện bóc tách riêng dòng VAT trên hóa đơn bán lẻ tính tiền tại quầy.
- **[ASSUMPTION-03]**: Khách hàng tạo mới từ quầy POS chủ yếu cần: Họ tên, Số điện thoại (bắt buộc), Địa chỉ và Hạn mức nợ (mặc định 0).

## 5. Scope & Non-Goals
### In Scope
1. Cập nhật `AddCustomerModal.tsx`: Gọi `customerApi.createCustomer` để lưu khách hàng vào CSDL PostgreSQL, hiển thị loading state, bắt lỗi trùng SĐT, trả về Customer thật (với GUID ID từ DB).
2. Cập nhật `PosCheckoutPage.tsx`: Cập nhật danh sách `customers` state khi thêm khách mới, lấy thông tin Tenant/Chi nhánh động (tên, địa chỉ, hotline) để truyền vào `buildReceiptData`, loại bỏ tính toán VAT.
3. Thiết kế lại `PosReceiptModal.tsx`: Bố cục lại giao diện hóa đơn HTML xem trước và in trình duyệt theo đúng mẫu thực tế (Header cửa hàng/địa chỉ/hotline, mã HĐ, bảng mặt hàng có STT, tổng thanh toán không VAT, khối thông tin khách hàng ở cuối bill).
4. Cập nhật `ThermalPrintService.cs`: Bỏ khối in `Thue VAT:`, bỏ dòng wifi cố định, in động tên cửa hàng/địa chỉ/hotline, bổ sung khối thông tin khách hàng chi tiết ở cuối hóa đơn trước lời cảm ơn.

### Out of Scope (Non-Goals)
- Không chỉnh sửa bảng `Customers` hay sinh migration DB mới.
- Không thay đổi nghiệp vụ tính thuế kế toán của phân hệ Báo cáo Thuế (FE-09).
- Không can thiệp vào driver phần cứng máy in ngoài giao thức ESC/POS và Windows Spooler sẵn có.

## 6. Các phương án xem xét
- **Phương án 1 (Tối ưu - Đề xuất)**:
  - Tận dụng `customerApi.createCustomer` sẵn có để persist ngay khi nhấn "Lưu khách hàng". Sau khi tạo thành công, tự động chọn khách hàng vào đơn hàng hiện tại và cập nhật danh sách tìm kiếm khách hàng của POS.
  - Dùng state `activeBranch` mở rộng (`id`, `name`, `address`, `phone`) kết hợp `user.tenantName` để sinh header hóa đơn chuẩn xác 100% theo tenant đang đăng nhập.
  - Loại bỏ hoàn toàn trường VAT khỏi dữ liệu bill và template in (cả modal lẫn ESC/POS).
  - *Ưu điểm*: Trải nghiệm mượt mà, đúng kiến trúc, không cần sửa schema DB, dữ liệu đồng bộ tức thì.
  - *Nhược điểm*: Cần kiểm tra kỹ xử lý lỗi khi số điện thoại trùng.
- **Phương án 2 (Lưu local tạm thời trước, sync ngầm)**:
  - Lưu vào localStorage, khi thanh toán đơn hàng mới tạo customer kèm order.
  - *Nhược điểm*: Phức tạp, dễ xung đột ID, khi đổi máy/tab khác thì khách hàng không tồn tại trên hệ thống, không phù hợp với kiến trúc CSDL tập trung.

## 7. Rủi ro & Cách giảm thiểu
- *Rủi ro*: Khách hàng nhập trùng số điện thoại đã tồn tại trong CSDL.
  - *Cách giảm thiểu*: Bắt mã lỗi `PHONE_EXISTS` từ `CustomersController` và hiển thị thông báo tiếng Việt rõ ràng: "Số điện thoại này đã được đăng ký cho khách hàng khác!".
- *Rủi ro*: Độ dài tên cửa hàng hoặc địa chỉ quá dài làm vỡ layout in nhiệt 32 ký tự.
  - *Cách giảm thiểu*: Dùng hàm ngắt dòng (word-wrap) tự động và hàm bỏ dấu tiếng Việt chuẩn ESC/POS `RemoveAccents` trong `ThermalPrintService.cs`.
