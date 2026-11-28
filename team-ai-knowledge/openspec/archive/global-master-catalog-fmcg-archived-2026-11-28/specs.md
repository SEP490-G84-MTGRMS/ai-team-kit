# Specs Delta: Kho Danh mục Hàng hóa Mẫu Toàn Cầu (Global FMCG Master Catalog)

> **Capability**: `saas-master-admin-portal`  
> **Dependencies**: `exploration.md`, `design-brief.md`, `proposal.md`

---

## ADDED Requirements

### Requirement: REQ-MC-01: Quản trị Danh mục Sản phẩm Mẫu Toàn Cầu
Hệ thống **MUST** cung cấp giao diện và bộ API cho phép Super Admin (`ADMIN`) xem danh sách, lọc, tìm kiếm, xem chi tiết, thêm mới, cập nhật và xóa sản phẩm mẫu FMCG toàn cầu kèm quy cách đóng gói đa đơn vị (`MasterProductUnits`).

#### Scenario: Lấy danh sách sản phẩm mẫu có phân trang và lọc
- **GIVEN** Super Admin đã đăng nhập với vai trò `ADMIN`
- **WHEN** Gọi `GET /api/admin/master-catalog?pageIndex=1&pageSize=15&brand=Acecook&categoryName=Mì ăn liền`
- **THEN** Hệ thống **MUST** trả về danh sách sản phẩm mẫu tương ứng, kèm tổng số lượng bản ghi và danh sách các đơn vị quy đổi (`Units`) của từng mặt hàng.

#### Scenario: Thêm mới sản phẩm mẫu thành công
- **GIVEN** Dữ liệu `CreateMasterProductRequest` có mã vạch `Barcode = "8934563138165"` hợp lệ chưa từng tồn tại trong hệ thống, kèm quy cách `Thùng = 30 gói`
- **WHEN** Gọi `POST /api/admin/master-catalog`
- **THEN** Hệ thống **MUST** lưu sản phẩm vào bảng `MasterProducts`, lưu quy cách vào `MasterProductUnits` và trả về mã HTTP `201 Created`.

#### Scenario: Từ chối thêm mới khi trùng mã vạch Barcode (Edge Case)
- **GIVEN** Mã vạch `"8934563138165"` đã có trong CSDL `MasterProducts`
- **WHEN** Gọi `POST /api/admin/master-catalog` với cùng mã vạch trên
- **THEN** Hệ thống **MUST** chặn hành động và trả về HTTP `409 Conflict` kèm thông báo *"Mã vạch (Barcode) này đã tồn tại trong Thư viện hàng mẫu"*.

#### Scenario: Từ chối truy cập từ người dùng không phải Super Admin (Security)
- **GIVEN** Người dùng đăng nhập với quyền `CASHIER` hoặc `STORE_OWNER`
- **WHEN** Gọi `POST /api/admin/master-catalog`
- **THEN** Hệ thống **MUST** từ chối với mã HTTP `403 Forbidden`.

---

### Requirement: REQ-MC-02: Import Danh mục Hàng loạt từ File Excel
Hệ thống **MUST** hỗ trợ Super Admin upload file Excel (`.xlsx`) để phân tích cú pháp bằng `ClosedXML`, kiểm tra tính hợp lệ của từng dòng và nạp hàng loạt (Batch Upsert) vào CSDL.

#### Scenario: Import file Excel hợp lệ thành công
- **GIVEN** File `.xlsx` chứa 150 dòng hàng FMCG đúng định dạng các cột (Mã vạch, Tên, Hãng, Ngành, ĐVT, Giá gợi ý, Quy cách)
- **WHEN** Super Admin upload file qua `POST /api/admin/master-catalog/import-excel?upsert=true`
- **THEN** Hệ thống **MUST** xử lý import toàn bộ 150 dòng, cập nhật thông tin nếu trùng mã vạch và trả về kết quả `SuccessCount = 150, FailedCount = 0`.

#### Scenario: Xử lý file Excel có dòng lỗi (Edge Case)
- **GIVEN** File `.xlsx` có 10 dòng đúng và 2 dòng sai (1 dòng thiếu mã vạch, 1 dòng sai định dạng số quy đổi)
- **WHEN** Super Admin upload file qua `POST /api/admin/master-catalog/import-excel`
- **THEN** Hệ thống **MUST** bỏ qua 2 dòng lỗi, import thành công 10 dòng hợp lệ và trả về mảng `ErrorMessages` chỉ rõ số thứ tự dòng bị lỗi và nguyên nhân chi tiết.

#### Scenario: Từ chối file rỗng hoặc sai định dạng (Edge Case)
- **GIVEN** File tải lên không phải định dạng `.xlsx` (ví dụ file `.pdf` hoặc `.exe`) hoặc file rỗng 0 byte
- **WHEN** Gọi `POST /api/admin/master-catalog/import-excel`
- **THEN** Hệ thống **MUST** từ chối với HTTP `400 Bad Request` kèm thông báo *"Tệp tải lên không hợp lệ hoặc không đúng định dạng Excel (.xlsx)"*.

---

### Requirement: REQ-MC-03: Tải File Mẫu Excel Chuẩn (Export Template)
Hệ thống **MUST** cung cấp endpoint cho phép Super Admin tải về tệp Excel mẫu (`Master_Catalog_Template.xlsx`) đã được tạo sẵn cấu trúc header chuẩn, màu sắc nhận diện và 3 dòng dữ liệu ví dụ thực tế.

#### Scenario: Tải tệp template thành công
- **GIVEN** Super Admin nhấn nút "Tải mẫu Excel" trên giao diện Admin
- **WHEN** Gọi `GET /api/admin/master-catalog/export-template`
- **THEN** Hệ thống **MUST** trả về luồng tệp tin nhị phân với `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` và tên tệp `Master_Catalog_Template.xlsx`.

---

### Requirement: REQ-MC-04: Tra cứu và Tự động điền Barcode cho Tenant (Auto-fill Onboarding)
Hệ thống **MUST** cung cấp endpoint công khai (dành cho mọi tenant đã xác thực) để tra cứu mã vạch từ Master Catalog và tích hợp giao diện tự động điền form sản phẩm tại `ProductFormModal.tsx`.

#### Scenario: Tìm thấy mã vạch trong Master Catalog
- **GIVEN** Tenant chưa từng có sản phẩm với mã vạch `"8934563138165"` trong kho hàng của mình
- **WHEN** Tenant gõ hoặc dùng súng quét mã vạch bắn mã `"8934563138165"` tại form tạo sản phẩm
- **THEN** Hệ thống **MUST** trả về `MasterProductSuggestionDto` chứa Tên sản phẩm, Ảnh HD, Đơn vị tính cơ bản ("Gói"), Thuế suất và danh sách Đơn vị quy đổi ("1 Thùng = 30 gói").
- **AND** Giao diện `ProductFormModal.tsx` **SHALL** hiển thị nút gợi ý *"Tự động điền từ Thư viện mẫu"* để người dùng nạp thông tin chỉ với 1 cú click.

#### Scenario: Không tìm thấy mã vạch trong Master Catalog
- **GIVEN** Mã vạch `"8939999999999"` không tồn tại trong `MasterProducts`
- **WHEN** Gọi `GET /api/products/lookup-master?barcode=8939999999999`
- **THEN** Hệ thống **MUST** trả về HTTP `200 OK` với `data = null` và form phía FE giữ nguyên trạng thái nhập liệu thủ công của người dùng, không báo lỗi gây gián đoạn thao tác.

---

## Acceptance Checklist

- [ ] Entity `MasterProduct` và `MasterProductUnit` được tạo độc lập với `BaseEntity`, không có `TenantId`.
- [ ] Database Migration được sinh và áp dụng thành công trên PostgreSQL.
- [ ] Toàn bộ 4 API quản trị của Admin được bảo vệ bởi role `ADMIN`.
- [ ] ClosedXML import file Excel mượt mà, hỗ trợ cả thêm mới và cập nhật ghi đè.
- [ ] File template Excel chuẩn được tải xuống với header đẹp mắt và dòng mẫu hướng dẫn.
- [ ] Menu **Kho Hàng Mẫu Toàn Cầu** xuất hiện trên Sidebar Admin (`AdminSidebar.tsx`) với icon đơn sắc Lucide `Package`.
- [ ] Trang `/admin/master-catalog` hiển thị 4 KPI, thanh tìm kiếm/lọc, bảng danh sách sản phẩm mẫu và modal import Excel hoạt động tốt.
- [ ] Form tạo sản phẩm của Tenant (`ProductFormModal.tsx`) tự động bắt sự kiện quét mã vạch và gợi ý điền nhanh thông tin.
- [ ] Không có icon sặc sỡ hay emoji, không có animation nhún nhảy theo `RULE_UI_DESIGN_SYSTEM.md`.
