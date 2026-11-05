# Đề xuất chức năng: pos-customer-persistence-and-receipt-redesign

## 1. Vấn đề cần giải quyết
1. **Mất thông tin khách hàng mới tạo tại POS**:
   - Khi thu ngân bấm "Thêm khách hàng" trong modal `AddCustomerModal.tsx` tại màn hình POS, hệ thống chỉ tạo object giả lập với ID tạm `kh-${Date.now()}` và lưu vào React state mà không gọi API backend `POST /api/customers`.
   - Khi thu ngân bỏ chọn khách hàng hoặc chuyển tab/refresh, khách hàng biến mất hoàn toàn, không được lưu vào cơ sở dữ liệu PostgreSQL và không thể tìm lại được.
2. **Form hóa đơn in và xem trước chưa chuẩn hóa, hardcode và còn hiển thị VAT**:
   - Mẫu hóa đơn xem trước (`PosReceiptModal.tsx`) và mẫu in nhiệt ESC/POS (`ThermalPrintService.cs`) bị hardcode tên thương hiệu "MT-GROCERY" và địa chỉ "123 Xuân Thủy, Cầu Giấy". Khi đăng nhập bằng tài khoản chuỗi cửa hàng khác (như An Nhiên Mart), thông tin in ra bị sai lệch.
   - Form in hiện tại vẫn chứa các dòng "Tổng tiền chưa VAT" và "Thuế GTGT (VAT)", không phù hợp với mô hình siêu thị thực phẩm bán lẻ tại quầy POS nơi giá niêm yết là giá thanh toán cuối cùng và khách lẻ không cần bóc tách VAT.
   - Form in chưa chuyên nghiệp và thiếu bố cục cân đối như mẫu hóa đơn bán lẻ thực tế của siêu thị (mẫu siêu thị Đức Thành): thiếu hotline chi nhánh, thông tin khách hàng ở chân bill, bảng mặt hàng có STT, tên hàng, số lượng, đơn giá, thành tiền rõ ràng.

## 2. Mục tiêu
1. **Lưu khách hàng mới vào CSDL ngay khi tạo tại POS**:
   - Tích hợp `customerApi.createCustomer(...)` ngay trong `AddCustomerModal.tsx`.
   - Khách hàng mới được persist vào PostgreSQL, nhận ID GUID thật, mã khách hàng chuẩn, tự động cập nhật danh sách và chọn ngay vào đơn hàng. Khi bỏ chọn, khách hàng vẫn tồn tại vĩnh viễn và tìm kiếm lại được ngay.
2. **Thiết kế lại form hóa đơn in nhiệt và xem trước chuyên nghiệp**:
   - Lấy động tên cửa hàng/chi nhánh, địa chỉ và số hotline từ Tenant & Branch hiện tại của tài khoản thu ngân.
   - Xóa bỏ hoàn toàn các dòng "chưa VAT" và "tiền VAT" ở cả giao diện modal xem trước và bản in nhiệt ESC/POS K80/K58.
   - Cập nhật layout theo chuẩn hóa đơn bán lẻ: Header thương hiệu/địa chỉ/hotline, mã HĐ, ngày giờ, thu ngân; Bảng hàng hóa chi tiết; Khối tổng thanh toán (tiền hàng, chiết khấu, khách trả theo tiền mặt/chuyển khoản/nợ, tiền thừa/còn nợ); Khối thông tin khách hàng (Tên, SĐT, Địa chỉ, Điểm tích lũy) và lời cảm ơn chân trang.

## 3. Phạm vi (Scope)
- **Trong phạm vi (In Scope)**:
  - Frontend:
    - `AddCustomerModal.tsx`: Gọi `customerApi.createCustomer`, xử lý trạng thái loading/thông báo lỗi/thành công, trả về Customer entity thật.
    - `PosCheckoutPage.tsx`: Cập nhật state danh sách khách hàng khi có khách mới, cấu trúc dữ liệu `buildReceiptData` động theo Tenant/Branch hiện tại, gỡ bỏ tính toán VAT.
    - `PosReceiptModal.tsx`: Thiết kế lại giao diện hóa đơn HTML xem trước và in trình duyệt (A4/K80/K58) theo mẫu thực tế siêu thị Đức Thành, loại bỏ các dòng VAT.
  - Backend:
    - `ThermalPrintService.cs`: Cập nhật logic in ESC/POS loại bỏ tính toán/in VAT, in tên đơn vị/địa chỉ/hotline từ dữ liệu đơn hàng truyền xuống, bổ sung khối thông tin khách hàng ở cuối bill.
- **Ngoài phạm vi (Out of Scope)**:
  - Thay đổi cấu trúc bảng `Customers` hay `Orders` trong database (các trường hiện có đã đầy đủ).
  - Tích hợp thêm các giao thức máy in không phải ESC/POS qua cổng USB/Virtual Serial Port.

## 4. Người dùng & Vai trò liên quan
- **Thu ngân (Cashier)**: Tạo nhanh khách hàng mới khi khách đứng tại quầy mà không sợ mất dữ liệu; in hóa đơn đẹp, đúng thông tin cửa hàng cho khách.
- **Khách mua hàng**: Nhận hóa đơn rõ ràng, chính xác thông tin chi nhánh đã mua, số hotline hỗ trợ, điểm tích lũy và số tiền thanh toán không bị rối bởi dòng VAT.
- **Chủ cửa hàng / Quản lý chuỗi (Store Manager / Tenant Admin)**: Đảm bảo dữ liệu khách hàng được tích lũy vào hệ thống CRM đầy đủ; hóa đơn mang đúng nhận diện thương hiệu và hotline chi nhánh của mình.

## 5. Tiêu chí thành công đo được
1. Tạo khách hàng mới trong modal POS -> Toast báo thành công -> Khách hàng tự động được gán vào đơn. Bỏ chọn khách hàng -> Tìm lại bằng SĐT/Tên -> Khách hàng xuất hiện ngay trong danh sách gợi ý.
2. Dữ liệu khách hàng mới xuất hiện ngay trong bảng `Customers` của CSDL PostgreSQL với `TenantId` tương ứng.
3. Form xem trước hóa đơn (`PosReceiptModal`) và lệnh in nhiệt (`ThermalPrintService`):
   - Hiển thị đúng tên Tenant/Chi nhánh đang đăng nhập (ví dụ: An Nhiên Mart - Chi nhánh Ba Đình), địa chỉ và hotline.
   - Không xuất hiện bất kỳ dòng chữ nào về "VAT" hoặc "chưa VAT".
   - Bố cục hóa đơn hiển thị đầy đủ bảng hàng hóa (STT, tên, SL, đơn giá, thành tiền) và phần thông tin khách hàng ở cuối bill.
