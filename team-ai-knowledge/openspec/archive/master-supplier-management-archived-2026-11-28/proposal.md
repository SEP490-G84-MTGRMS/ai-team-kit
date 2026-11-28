# Proposal: master-supplier-management

## Vấn đề
Trong hệ thống bán lẻ tạp hóa / siêu thị mini đa chi nhánh MT-GRMS (Multi-Tenant Grocery Retail Management System), hiện tại chưa có phân hệ quản lý tập trung danh mục Nhà cung cấp (Master Supplier - FE-09). Dữ liệu đối tác cung ứng hàng tươi sống (rau củ, thịt cá), hàng tiêu dùng FMCG/đồ khô, đông lạnh cũng như các đơn vị cung cấp dịch vụ (điện nước, mặt bằng, vận chuyển) chưa được chuẩn hóa theo từng Tenant (`TenantId`). Điều này gây ra nhiều bất cập nghiêm trọng trong vận hành:
1. **Trùng lặp đối tác và sai lệch hồ sơ**: Việc nhập tên nhà cung cấp tự do trên Đơn mua hàng (PO) gây trùng lặp nhiều bản ghi cho cùng một đơn vị, thiếu thông tin Mã số thuế (MST) để xuất hóa đơn VAT và thiếu tài khoản ngân hàng chuẩn xác.
2. **Không phân định vai trò cung ứng**: Hệ thống thiếu sự phân tách rõ ràng giữa NCC Hàng hóa (`Goods`), NCC Dịch vụ (`Service`), hoặc Cả hai (`Both`), dẫn đến rủi ro chọn nhầm NCC dịch vụ tiện ích vào đơn nhập hàng hóa hoặc ngược lại.
3. **Mất dấu vết và rủi ro toàn vẹn dữ liệu**: Việc cho phép xóa cứng NCC đã phát sinh chứng từ (PO, GRN, Hàng trả lại, Dịch vụ) làm vỡ ràng buộc khóa ngoại (FK), mất lịch sử giao dịch và đứt gãy khả năng truy xuất nguồn gốc lô hàng theo FEFO (FE-02/FE-05).
4. **Thiếu nền tảng quản lý công nợ (AP) & Đối tác kép (Dual-role)**: Chưa có sổ công nợ tập trung (`SupplierAPLedger`) theo dõi kỳ hạn nợ (`PaymentTermDays`), hạn mức nợ (`CreditLimit`) và cảnh báo khi một đối tác vừa là Khách hàng mua sỉ vừa là Nhà cung cấp (Dual-role), dẫn đến nguy cơ cấn trừ nợ sai quy định giữa sổ nợ AR và sổ nợ AP.
5. **Trải nghiệm tìm kiếm và kết xuất dữ liệu hạn chế**: Bộ lọc tìm kiếm thông thường chỉ nhập text đơn lẻ, không hỗ trợ tìm kiếm đa chiều (nhiều NCC, nhiều sản phẩm liên kết, nhiều người liên hệ, nhiều số điện thoại) với gợi ý trực quan (highlight text khớp); tính năng xuất file Excel thiếu định dạng chuyên nghiệp, kích thước cột chưa tối ưu gây khó khăn cho kế toán kho khi đối soát.

## Mục tiêu
1. Xây dựng phân hệ Quản lý Master Supplier hoàn chỉnh theo chuẩn KiotViet Brand Blue cho MT-GRMS, đảm bảo dữ liệu cô lập an toàn cho từng Tenant (`TenantId`).
2. Chuẩn hóa hồ sơ nhà cung cấp: Quản lý Mã NCC (`Code` unique/tenant), Tên đơn vị, Mã số thuế (`TaxCode`), Phân loại (`SupplierType`: Goods, Service, Both), Nhóm ngành (`SupplierCategory`), Điều khoản nợ (`PaymentTermDays`, `CreditLimit`), Thông tin liên hệ và Gợi ý tài khoản ngân hàng (VietQR).
3. Đảm bảo toàn vẹn dữ liệu: Áp dụng cơ chế Ngừng hoạt động (`Status = Inactive`) thay thế hoàn toàn cho Xóa cứng khi NCC đã có chứng từ liên kết; tự động loại trừ NCC Inactive khỏi danh sách chọn trên các chứng từ mới.
4. Thiết lập kiến trúc sẵn sàng kết nối cụm Kho - Mua hàng: Cung cấp API master cho FE-05 (PO/GRN/Return), FE-07 (Service Purchase), và cấu trúc sổ công nợ tập trung (`SupplierAPLedger`) cho kế toán theo dõi Aging.
5. Cảnh báo đối tác kép (Dual-role): Tự động phát hiện trùng MST/SĐT với Khách hàng (FE-08) và cho phép liên kết hồ sơ với nguyên tắc bất biến: cấm tự động bù trừ giữa sổ nợ Phải thu (AR) và sổ nợ Phải trả (AP).
6. Nâng cấp trải nghiệm tìm kiếm & xuất báo cáo (Delta):
   - Cung cấp thanh tìm kiếm thông minh dạng Auto-complete Multi-select: Khi người dùng gõ từ khóa, hệ thống hiển thị danh sách gợi ý phân nhóm (NCC, Sản phẩm, Người liên hệ, SĐT) với các đoạn text khớp được highlight nổi bật. Người dùng có thể click chọn nhiều thẻ thực thể (multi-tag) để kết hợp tìm kiếm linh hoạt.
   - Nâng cấp tính năng xuất Excel danh sách NCC: File Excel có Header thương hiệu trang trọng (Tên siêu thị/cửa hàng, ngày xuất, người xuất), tiêu đề bảng màu xanh KiotViet `#0066FF`, chữ trắng đậm, viền ô sắc nét, căn lề chuẩn theo kiểu dữ liệu và độ rộng các cột được tự động tối ưu hóa để hiển thị trọn vẹn thông tin.

## Phạm vi
### In scope:
- **Backend (.NET 8 Clean Architecture)**:
  - Domain Entity: `Supplier` (kế thừa `BaseAuditableEntity`, implement `IMustHaveTenant`), `SupplierCategory`, Enums `SupplierType` (Goods, Service, Both), `SupplierStatus` (Active, Inactive).
  - Validation (FluentValidation): `Code` duy nhất theo `TenantId`, `TaxCode` hợp lệ (10 hoặc 13 chữ số, duy nhất theo Tenant nếu có), Số điện thoại chuẩn định dạng VN, Email hợp lệ, `PaymentTermDays` >= 0, ràng buộc không cho thu hẹp Type (ví dụ: cấm đổi từ `Both` -> `Goods` nếu đã có phát sinh dịch vụ).
  - Nghiệp vụ Soft Deactivate & Chặn xóa: Chặn xóa cứng khi NCC đã có liên kết chứng từ (PO, GRN, Return, Service, AP Entry); chuyển sang `Status = Inactive` và loại khỏi danh sách chọn trên chứng từ mới.
  - CRUD & Query APIs:
    - `GET /api/v1/suppliers`: Phân trang, tìm kiếm đa điều kiện (Code, Name, TaxCode, Phone, ContactPerson, ProductIds/ProductNames, SupplierIds), lọc theo `SupplierType`, `Status`, `CategoryId`.
    - `GET /api/v1/suppliers/search-suggestions`: API gợi ý tìm kiếm tức thì trả về các nhóm kết quả: NCC, Sản phẩm do NCC cung cấp, Người liên hệ, Số điện thoại tương ứng với từ khóa tìm kiếm.
    - `GET /api/v1/suppliers/{id}`: Chi tiết hồ sơ, tóm tắt công nợ và liên kết khách hàng.
    - `GET /api/v1/suppliers/stats`: Thống kê KPI (Tổng NCC, NCC Active, NCC Goods, NCC Service, NCC có nợ AP).
    - `POST /api/v1/suppliers`: Tạo mới hồ sơ NCC kèm kiểm tra gợi ý trùng MST/SĐT với Customer (Dual-role).
    - `PUT /api/v1/suppliers/{id}`: Cập nhật thông tin, điều khoản thanh toán, nhóm ngành.
    - `POST /api/v1/suppliers/{id}/deactivate`: Ngưng hoạt động an toàn (kèm cảnh báo nếu còn dư nợ).
    - `POST /api/v1/suppliers/{id}/activate`: Kích hoạt lại NCC.
    - `POST /api/v1/suppliers/{id}/link-customer`: Liên kết hồ sơ với Customer (FE-08) cùng Tenant.
    - `DELETE /api/v1/suppliers/{id}/link-customer`: Hủy liên kết đối tác kép.
    - `GET /api/v1/suppliers/{id}/branches`: Lấy danh sách chi nhánh được gán.
    - `PUT /api/v1/suppliers/{id}/branches`: Cập nhật phân bổ chi nhánh.
- **Frontend (React 19 + TypeScript + Vite)**:
  - Trang danh sách NCC (`SupplierListPage.tsx`) chuẩn KiotViet Brand Blue (`#0066FF`, `#F7FAFF`):
    - 4 Thẻ KPI Stat Cards: Tổng số NCC, Đang hoạt động, NCC Hàng hóa, NCC Dịch vụ.
    - Thanh tìm kiếm tức thì và bộ lọc đa điều kiện (Loại NCC, Trạng thái, Nhóm hàng, Chi nhánh).
    - **Bộ lọc Auto-complete Multi-Select với Text Highlighting**:
      - Ô tìm kiếm hiển thị dropdown gợi ý khi nhập ký tự.
      - Highlight trực quan ký tự/từ khóa trùng khớp.
      - Phân nhóm kết quả gợi ý: Nhà cung cấp, Sản phẩm cung ứng, Người liên hệ, Số điện thoại.
      - Hỗ trợ chọn nhiều item (multi-tag chips), hiển thị chip rõ ràng kèm nút xóa từng chip hoặc xóa tất cả.
    - Bảng dữ liệu phân trang server-side (10, 20, 50 dòng), badge trạng thái màu sắc, badge nhận diện "Đồng thời là KH" (Dual-role).
    - **Chức năng Xuất Excel chuyên nghiệp**:
      - Nút "Xuất Excel" định dạng chuẩn cho Store Owner / Admin.
      - Header báo cáo chuyên nghiệp gồm Tên cửa hàng, tiêu đề báo cáo, thời gian xuất, người xuất.
      - Bảng dữ liệu styling màu KiotViet Blue `#0066FF`, viền kẻ ô, căn lề tự động theo kiểu dữ liệu.
      - Độ rộng cột (column widths) được tính toán tự động dựa trên độ dài dữ liệu để không bị tràn hay cắt chữ.
  - Modal thêm mới & cập nhật hồ sơ (`SupplierFormModal.tsx`).
  - Drawer / Trang chi tiết hồ sơ (`SupplierDetailPage.tsx`):
    - Đấu nối API thật, hỗ trợ tab Chi nhánh (Store Owner) và ẩn tab Công nợ đối với Nhân viên chi nhánh.
  - Tuân thủ thiết kế: Font `Be Vietnam Pro` (chữ) & `JetBrains Mono` (mã/tiền), bo góc Full Pill (`rounded-full`) cho nút/badge, Card bo góc `24px - 28px`, tuyệt đối 0 animation rung lắc.

### Out of scope:
- Nghiệp vụ chi tiết tạo Đơn mua hàng (PO), Phiếu nhập kho (GRN) và Phiếu trả hàng (thuộc phân hệ **FE-05 Purchase Order & Goods Receipt**).
- Nghiệp vụ chi tiết tạo Phiếu mua dịch vụ (thuộc phân hệ **FE-07 Service Purchase**).
- Nghiệp vụ lập Phiếu chi thanh toán quỹ tiền mặt / chuyển khoản chi tiết (thuộc phân hệ **FE-17 Payment & Fund**).
- Quản lý điểm thưởng, phân hạng khách hàng bán lẻ CRM (thuộc phân hệ **FE-08 Customer**).
- Tự động cấn trừ bù trừ công nợ hai chiều giữa sổ nợ AR và sổ nợ AP (bị cấm theo Business Rule **BR-S11**).
- Tích hợp cổng thanh toán ngân hàng tự động chuyển tiền trực tiếp (chỉ lưu trữ thông tin tài khoản và hiển thị mã VietQR tĩnh).

## Người dùng liên quan
- **Nhân viên mua hàng (Purchasing Staff)**: Tra cứu nhanh danh bạ NCC và sản phẩm cung ứng bằng bộ tìm kiếm đa thực thể highlight, kiểm tra bảng giá và điều khoản thanh toán khi lập PO.
- **Kế toán kho / Kế toán công nợ (Accountant)**: Xuất báo cáo danh sách NCC ra file Excel chuẩn định dạng đẹp mắt để đối soát công nợ và lưu trữ sổ sách kế toán.
- **Quản lý cửa hàng / Quản trị viên (Store Manager / Admin)**: Quản lý danh mục nhóm NCC, phê duyệt ngưng hoạt động NCC, xử lý liên kết đối tác kép (Dual-role) và toàn quyền cấu hình dữ liệu.

## Tiêu chí thành công
- [ ] Giao diện danh sách tải dữ liệu < 500ms, tìm kiếm và lọc đa điều kiện mượt mà, phân trang server-side chính xác.
- [ ] Tính năng tìm kiếm đa thực thể với Auto-complete & Text Highlighting:
  - Khi gõ từ khóa, hiển thị dropdown gợi ý phân nhóm: NCC, Sản phẩm, Người liên hệ, Số điện thoại.
  - Các đoạn ký tự trùng khớp trong kết quả gợi ý được highlight nổi bật.
  - Người dùng có thể click chọn nhiều thực thể thành các thẻ tags/chips (Multi-select) để kết hợp tìm kiếm linh hoạt; cho phép xóa từng tag hoặc xóa tất cả.
- [ ] Xuất file Excel chuyên nghiệp:
  - Có header trang trọng (Tên siêu thị/chi nhánh, tiêu đề "BÁO CÁO DANH SÁCH NHÀ CUNG CẤP", ngày giờ xuất, người xuất).
  - Header bảng màu xanh KiotViet `#0066FF`, chữ trắng in đậm, viền ô đầy đủ.
  - Căn lề chuẩn (trái cho Tên/Địa chỉ, giữa cho Mã/MST/SĐT/Trạng thái, phải cho số liệu).
  - Độ rộng các cột được tính toán tự động dựa trên độ dài nội dung, không bị che khuất dữ liệu.
- [ ] Thêm mới và cập nhật NCC thành công với đầy đủ validation; chặn trùng `Code` và `TaxCode` trong cùng `TenantId` (trả về ProblemDetails HTTP 409).
- [ ] Ràng buộc toàn vẹn: Chặn xóa cứng khi NCC đã có chứng từ liên kết; đổi trạng thái thành `Inactive` thành công và loại bỏ NCC Inactive khỏi danh sách chọn trên PO/Service mới.
- [ ] UI tuân thủ 100% Design System: Màu KiotViet Blue `#0066FF`, bo góc Full Pill/Card 24-28px, font `Be Vietnam Pro` + `JetBrains Mono` (`tabular-nums`), 0 animation nhún nhảy vô tận.
- [ ] Cấu trúc code tuân thủ Clean Architecture (.NET 8) và Feature-based architecture (React 19), bóc tách thành các component riêng biệt, 0 monolithic code.
- [ ] Toàn bộ kiểm thử Backend (`dotnet test`) và Frontend (`npm run build`, `npm run lint`) đạt 100% PASS không có lỗi.
