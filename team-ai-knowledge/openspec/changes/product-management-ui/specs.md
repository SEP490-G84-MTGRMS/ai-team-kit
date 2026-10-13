# Specs: product-management-ui
## Capability: Product Catalog Management (FE-01)
- Dependencies: `exploration.md` (EXP-2026-10-13-001), `design-brief.md`, `proposal.md`
- Căn cứ hệ thống: [Report-3 SRS FE-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L1208), [quan ly hang hoa.md](file:///d:/FPT_uni/Sesmester_9_Fall_26/tham%20khao/Quan%20ly%20hang%20hoa/quan%20ly%20hang%20hoa.md), [Screen Design/Product Management](file:///d:/FPT_uni/Sesmester_9_Fall_26/tham%20khao/Screen%20Design/Product%20Management).

---

## 1. API / Contract
| Method | Path | Request Body | Response (Success) | Mã lỗi thường gặp |
|---|---|---|---|---|
| `GET` | `/api/products` | Query: `page`, `pageSize`, `search`, `categoryId`, `stockStatus`, `supplier` | `200 OK` `{ items: ProductListItemDto[], total: number, summary: { totalStock: number, totalCommitted: number } }` | `400 Bad Request`, `401 Unauthorized` |
| `GET` | `/api/products/{id}` | - | `200 OK` `ProductDetailDto` | `404 Not Found` |
| `POST` | `/api/products` | `CreateProductDto` | `201 Created` `ProductDetailDto` | `400 Validation Error`, `409 Barcode/SKU Conflict` |
| `PUT` | `/api/products/{id}` | `UpdateProductDto` | `200 OK` `ProductDetailDto` | `400 Validation Error`, `403 Base UOM Immutable` |
| `POST` | `/api/products/combo` | `CreateComboDto` | `201 Created` `ProductDetailDto` | `400 Component Invalid` |
| `PATCH` | `/api/products/{id}/status` | `{ status: "Active" \| "Discontinued" }` | `200 OK` `{ id: string, status: string }` | `400 Active Dependency Constraint` |
| `DELETE` | `/api/products/{id}` | - | `200 OK` `{ id: string, deletedType: "Soft" \| "Hard" }` | `400 Pending Transaction Constraint` |
| `GET` | `/api/categories` | Query: `search` | `200 OK` `CategoryTreeDto[]` | `401 Unauthorized` |
| `POST` | `/api/categories` | `CreateCategoryDto` | `201 Created` `CategoryDto` | `409 Duplicate Code/Name (BR-CAT-01)` |

---

## 2. ADDED Requirements

### Requirement: REQ-01 Hiển thị Danh sách Hàng hóa & Phân quyền Bảo mật (Product List & Security)
Hệ thống MUST hiển thị danh sách hàng hóa phân trang, hỗ trợ tìm kiếm tức thì theo SKU, barcode, tên sản phẩm và bộ lọc cây danh mục. Mọi dữ liệu MUST được cô lập theo `TenantId`.
Hệ thống MUST che giấu hoàn toàn trường Giá vốn (`CostPrice`) trên giao diện và API khi người dùng đăng nhập có vai trò `Employee / Cashier` theo quy tắc [BR-SEC-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4759).

#### Scenario: Chủ cửa hàng xem danh sách đầy đủ giá vốn và tồn kho
- **GIVEN** Người dùng đăng nhập với vai trò `Store Owner` thuộc Tenant hợp lệ
- **WHEN** Truy cập trang `/dashboard/products`
- **THEN** Hệ thống hiển thị bảng dữ liệu gồm các cột: Ảnh, Mã hàng, Tên hàng, Giá bán, Giá vốn, Tồn kho, Khách đặt, Thời gian tạo
- **AND** Hàng tổng cộng hiển thị đúng Tổng tồn kho và Tổng khách đặt của trang hiện tại.

#### Scenario: Nhân viên thu ngân xem danh sách bị che giá vốn (BR-SEC-01)
- **GIVEN** Người dùng đăng nhập với vai trò `Cashier`
- **WHEN** Truy cập trang `/dashboard/products`
- **THEN** Hệ thống KHÔNG hiển thị cột "Giá vốn" trên bảng dữ liệu
- **AND** Response từ API `/api/products` trả về `costPrice: null` đối với tất cả sản phẩm.

#### Scenario: Tìm kiếm từ khóa không có kết quả (Edge Case)
- **GIVEN** Danh mục hàng hóa có sẵn dữ liệu
- **WHEN** Người dùng nhập từ khóa tìm kiếm không khớp với bất kỳ SKU, barcode hoặc tên hàng nào
- **THEN** Hệ thống hiển thị bảng rỗng với thông báo `MSG29: "No search results."`.

---

### Requirement: REQ-02 Khởi tạo Hàng hóa chuẩn & Quy đổi Đơn vị tính (Create Product & Multi-UOM)
Hệ thống MUST cho phép Store Owner tạo mới mặt hàng chuẩn. Nếu mã hàng để trống, hệ thống MUST tự động sinh mã theo định dạng `SPxxxxxx`.
Hệ thống SHALL hỗ trợ cấu hình Đơn vị tính cơ sở và Bảng quy đổi ĐVT đa cấp (ví dụ: 1 Lốc = 6 Lon, 1 Thùng = 24 Lon) với mã vạch và giá bán quy đổi độc lập.
Hệ thống MUST kiểm tra tính hợp lệ: Tên hàng, ĐVT cơ sở, Giá bán lẻ là bắt buộc; tỷ lệ quy đổi phải lớn hơn 1.

#### Scenario: Tạo thành công sản phẩm có ĐVT cơ sở và ĐVT quy đổi
- **GIVEN** Người dùng mở modal `ProductFormModal`
- **WHEN** Nhập Tên hàng "Bia Heineken", ĐVT cơ sở "Lon", Giá bán "20,000", Giá vốn "16,000"
- **AND** Thêm ĐVT quy đổi "Thùng", Tỷ lệ quy đổi "24", Giá bán quy đổi "460,000", Mã vạch quy đổi riêng
- **AND** Nhấn nút "Lưu"
- **THEN** Hệ thống lưu sản phẩm vào CSDL, tự sinh mã SKU (ví dụ: `SP000125`)
- **AND** Đóng modal và phát thông báo Toast `MSG28: "Data saved successfully."`.

#### Scenario: Nhập mã vạch bị trùng lặp trên cùng Tenant (Edge Case - BR-PROD-01)
- **GIVEN** Sản phẩm "SP000010" đã có mã vạch `8938528993998` trong hệ thống
- **WHEN** Người dùng tạo sản phẩm mới và nhập mã vạch `8938528993998`
- **THEN** Hệ thống từ chối lưu và hiển thị thông báo lỗi in-line: "Mã vạch đã được sử dụng bởi sản phẩm khác."

#### Scenario: Nhập giá bán lẻ thấp hơn giá vốn (Edge Case - BR-SEC-01 / MSG12)
- **GIVEN** Người dùng nhập Giá vốn = 50,000 đ
- **WHEN** Người dùng nhập Giá bán = 45,000 đ và nhấn Lưu
- **THEN** Hệ thống hiển thị Modal cảnh báo `MSG12`: "Warning: Selling price is below cost. Do you want to proceed?"
- **AND** Chỉ khi người dùng bấm xác nhận tiếp tục thì hệ thống mới lưu dữ liệu.

---

### Requirement: REQ-03 Khởi tạo Hàng Combo - Đóng gói (Create Combo Package)
Hệ thống MUST hỗ trợ tạo mặt hàng Combo bằng cách gộp nhiều mặt hàng đơn lẻ có sẵn.
Hệ thống MUST tự động tính Giá vốn Combo = $\sum (\text{Giá vốn thành phần}_i \times \text{Số lượng định mức}_i)$.
Hệ thống MUST tính toán tồn kho khả dụng của Combo động dựa trên tồn thực tế của các mặt hàng thành phần.
Hệ thống MUST chặn không cho phép lập Đơn đặt hàng nhập (PO) hoặc Phiếu nhập kho (GRN) cho mặt hàng Combo.

#### Scenario: Tạo thành công gói Combo Giỏ quà Tết
- **GIVEN** Đã có sản phẩm thành phần: "Rượu vang" (Giá vốn 150,000), "Hộp bánh" (Giá vốn 50,000)
- **WHEN** Người dùng mở modal `ComboFormModal`, nhập Tên "Giỏ quà Tết An Khang"
- **AND** Chọn thành phần: 1 Rượu vang + 2 Hộp bánh; nhập Giá bán Combo = 300,000 đ
- **THEN** Hệ thống tự động tính hiển thị Tổng giá vốn Combo = 250,000 đ
- **AND** Lưu gói Combo thành công với cờ `IsCombo = true`.

#### Scenario: Hàng thành phần bị hết kho khiến Tồn Combo bằng 0 (Edge Case)
- **GIVEN** Gói Combo yêu cầu 1 Rượu vang + 2 Hộp bánh
- **WHEN** Sản phẩm "Rượu vang" trong kho chi nhánh có số lượng tồn = 0
- **THEN** Tồn kho khả dụng của Combo tự động hiển thị = 0
- **AND** Khi bán tại POS, hệ thống kích hoạt thông báo hết hàng `MSG08`.

---

### Requirement: REQ-04 Cập nhật Hàng hóa & Khóa bất biến Base UOM (Edit Product & BR-PROD-01)
Hệ thống MUST cho phép cập nhật tên hàng, danh mục, giá bán, ảnh, mô tả và định mức an toàn.
Hệ thống MUST kiểm tra cờ lịch sử giao dịch: Nếu sản phẩm đã phát sinh bất kỳ giao dịch kho hoặc bán lẻ nào, hệ thống MUST khóa không cho sửa trường Đơn vị tính cơ sở (`BaseUnit`) theo quy tắc [BR-PROD-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4760).

#### Scenario: Chỉnh sửa sản phẩm đã phát sinh giao dịch bán hàng (BR-PROD-01)
- **GIVEN** Sản phẩm "SP652390" đã có hóa đơn bán hàng trong quá khứ (`hasTransactions = true`)
- **WHEN** Store Owner mở modal Chỉnh sửa sản phẩm
- **THEN** Ô nhập liệu "Đơn vị tính cơ bản" bị vô hiệu hóa (disabled) kèm tooltip giải thích: "Đơn vị tính cơ bản không thể chỉnh sửa khi đã phát sinh giao dịch."
- **AND** Các trường Tên hàng, Giá bán, Mô tả vẫn cho phép chỉnh sửa bình thường.

#### Scenario: Chỉnh sửa sản phẩm mới tạo chưa có giao dịch
- **GIVEN** Sản phẩm vừa tạo nhầm và chưa phát sinh bất kỳ giao dịch nào (`hasTransactions = false`)
- **WHEN** Store Owner mở modal Chỉnh sửa sản phẩm
- **THEN** Trường "Đơn vị tính cơ bản" vẫn được phép chỉnh sửa tự do.

---

### Requirement: REQ-05 Xóa Hàng hóa An toàn & Ngừng kinh doanh (Safe Deletion & BR-DATA-01)
Hệ thống MUST áp dụng cơ chế Soft Delete: Khi Store Owner thực hiện xóa hàng hóa đã từng phát sinh chứng từ, hệ thống MUST tự động chuyển trạng thái sản phẩm sang "Discontinued" (Ngừng kinh doanh) và ẩn khỏi POS.
Hệ thống chỉ cho phép Hard Delete (xóa cứng khỏi CSDL) khi sản phẩm hoàn toàn chưa có giao dịch.
Hệ thống MUST chặn xóa nếu sản phẩm đang là thành phần của một Combo đang hoạt động hoặc đang nằm trong giao dịch chuyển kho chưa hoàn tất.

#### Scenario: Xóa sản phẩm đã phát sinh giao dịch (Chuyển Soft Delete)
- **GIVEN** Sản phẩm "Kem nền" đã từng có phiếu nhập kho và hóa đơn
- **WHEN** Người dùng nhấn "Xóa" trên modal chi tiết sản phẩm và xác nhận
- **THEN** Hệ thống KHÔNG xóa dòng dữ liệu khỏi bảng `Products`
- **AND** Trạng thái sản phẩm cập nhật thành `Discontinued`, ẩn khỏi danh sách tìm kiếm bán hàng tại quầy POS.

#### Scenario: Chặn xóa sản phẩm đang là thành phần của gói Combo (Edge Case)
- **GIVEN** Sản phẩm "Sữa tắm Enchanteur" đang là thành phần cấu thành của Combo "Giỏ quà sắc đẹp"
- **WHEN** Người dùng cố gắng thực hiện hành động xóa sản phẩm "Sữa tắm Enchanteur"
- **THEN** Hệ thống từ chối hành động và hiển thị thông báo lỗi: "Không thể xóa mặt hàng đang là thành phần của gói Combo đang hoạt động. Vui lòng gỡ khỏi Combo trước."

---

### Requirement: REQ-06 Quản lý Cây Nhóm hàng đa tầng (Category Tree Hierarchy)
Hệ thống MUST cho phép tạo, sửa, xóa danh mục dạng cây cha - con. Mã danh mục tự sinh dạng `CAT-xxx` nếu để trống.
Hệ thống MUST kiểm tra tính duy nhất của Mã và Tên nhóm trong cùng nhánh cây theo quy tắc [BR-CAT-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4764).
Hệ thống MUST chặn xóa danh mục nếu danh mục đó đang chứa sản phẩm hoặc có danh mục con bên trong.

#### Scenario: Tạo thành công danh mục con
- **GIVEN** Danh mục cha "Bánh kẹo" đã tồn tại
- **WHEN** Người dùng nhấn "+ Tạo mới" nhóm hàng, nhập Tên "Kẹo dẻo", chọn Nhóm cha "Bánh kẹo"
- **THEN** Hệ thống lưu danh mục mới với mã tự sinh `CAT-005` và cập nhật cây nhóm hàng ngay lập tức.

#### Scenario: Chặn xóa danh mục đang chứa sản phẩm (Edge Case)
- **GIVEN** Danh mục "Dược mỹ phẩm" đang chứa 8 sản phẩm
- **WHEN** Người dùng nhấn nút xóa danh mục "Dược mỹ phẩm"
- **THEN** Hệ thống từ chối và cảnh báo: "Không thể xóa nhóm hàng đang chứa sản phẩm."

---

## 3. Acceptance Checklist
- [ ] **AC-01:** Truy cập được module tại route `/dashboard/products` trên `MasterLayout`.
- [ ] **AC-02:** Lưới danh sách hỗ trợ tìm kiếm debounce, lọc cây nhóm hàng và phân trang chính xác.
- [ ] **AC-03:** Nhân viên thu ngân đăng nhập không xem được trường `CostPrice` trên bảng danh sách và modal chi tiết ([BR-SEC-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4759)).
- [ ] **AC-04:** Tạo mới hàng chuẩn tự sinh mã `SPxxxxxx`; cấu hình được bảng quy đổi ĐVT đa tầng.
- [ ] **AC-05:** Tạo được gói Combo từ danh sách hàng thành phần; tự tính giá vốn tổng và tính tồn khả dụng.
- [ ] **AC-06:** Khóa bất biến Base UOM trên form chỉnh sửa khi sản phẩm đã phát sinh giao dịch ([BR-PROD-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4760)).
- [ ] **AC-07:** Thao tác xóa sản phẩm tự động chuyển Soft Delete sang `Discontinued` nếu đã có chứng từ lịch sử ([BR-DATA-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4763)).
- [ ] **AC-08:** Chặn xóa sản phẩm khi đang là thành phần của một Combo đang hoạt động.
- [ ] **AC-09:** Quản lý nhóm hàng cây phân cấp, chặn trùng mã/tên trong nhánh ([BR-CAT-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4764)) và bảo vệ xóa nhóm có hàng.
- [ ] **AC-10:** Giao diện chuẩn Ant Design + Tailwind CSS v4, responsive và hỗ trợ dark/light mode.
