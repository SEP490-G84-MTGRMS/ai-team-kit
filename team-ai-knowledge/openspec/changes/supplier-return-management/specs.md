# Specs: supplier-return-management (Nghiệp vụ Trả hàng Nhà cung cấp - RTV)

## API / Contract (RESTful Endpoints)

| Method | Path | Request Body | Response | Mô tả nghiệp vụ |
|---|---|---|---|---|
| `GET` | `/api/v1/supplier-returns` | Query: `keyword`, `branchId`, `supplierId`, `status`, `pageIndex`, `pageSize` | `ApiResponse<PagedResult<SupplierReturnListItemDto>>` | Lấy danh sách phiếu trả hàng có bộ lọc và phân trang |
| `GET` | `/api/v1/supplier-returns/{id}` | - | `ApiResponse<SupplierReturnDetailDto>` | Lấy chi tiết phiếu trả hàng kèm danh sách dòng hàng và lịch sử |
| `GET` | `/api/v1/supplier-returns/eligible-grns` | Query: `branchId`, `supplierId` | `ApiResponse<List<EligibleGrnLookupDto>>` | Lấy danh sách các phiếu nhập GRN đã hoàn thành (`COMPLETED`) để chọn nguồn trả |
| `GET` | `/api/v1/supplier-returns/grn-lines/{grnId}` | - | `ApiResponse<List<GrnReturnableLineDto>>` | Lấy chi tiết các dòng SKU/Lô của phiếu nhập kèm số lượng còn được phép trả `availableReturnQty` |
| `POST` | `/api/v1/supplier-returns` | `CreateSupplierReturnCommand` | `ApiResponse<SupplierReturnDetailDto>` | Lập phiếu trả hàng mới (trạng thái `DRAFT`) |
| `POST` | `/api/v1/supplier-returns/{id}/submit` | `{ notes?: string }` | `ApiResponse<SupplierReturnDetailDto>` | Gửi yêu cầu sang `PENDING_SUPPLIER`, chuyển hàng sang `PENDING_RETURN` (cô lập tồn kho khả dụng) |
| `POST` | `/api/v1/supplier-returns/{id}/supplier-response` | `RecordSupplierResponseCommand` | `ApiResponse<SupplierReturnDetailDto>` | Ghi nhận phản hồi NCC: chấp nhận toàn bộ/một phần (`APPROVED`) hoặc từ chối (`REJECTED`) |
| `POST` | `/api/v1/supplier-returns/{id}/complete-handover` | `CompleteHandoverCommand` | `ApiResponse<SupplierReturnDetailDto>` | Bàn giao hàng thực tế: cập nhật `COMPLETED`, trừ tồn kho `BranchStocks`, ghi nhận `SUPPLIER_RETURN` |
| `POST` | `/api/v1/supplier-returns/{id}/cancel` | `{ reason: string }` | `ApiResponse<SupplierReturnDetailDto>` | Hủy phiếu khi chưa bàn giao hoàn tất, giải phóng hàng chờ trả |

---

## ADDED Requirements

### Requirement: REQ-01 Màn hình Danh sách Phiếu Trả Hàng NCC (UI-RTV-01)
Hệ thống MUST hiển thị giao diện danh sách phiếu trả hàng tại đường dẫn `/store-owner/supplier-returns` bao gồm:
1. **Thanh chỉ số KPI**:
   - Tổng số phiếu trả hàng.
   - Phiếu chờ phản hồi (`PENDING_SUPPLIER`).
   - Phiếu đã duyệt chờ bàn giao (`APPROVED`).
   - Phiếu đã hoàn tất (`COMPLETED`).
   - Tổng giá trị hàng yêu cầu trả (VNĐ).
2. **Bộ lọc đa tiêu chí (Unified Filter Bar)**:
   - Ô tìm kiếm từ khóa (Mã phiếu trả, Mã GRN gốc, Tên NCC, Tên người tạo).
   - Dropdown Chi nhánh (chỉ mở cho Store Owner, khóa cho Employee).
   - Dropdown Nhà cung cấp.
   - Dropdown Trạng thái (`ALL`, `DRAFT`, `PENDING_SUPPLIER`, `APPROVED`, `REJECTED`, `COMPLETED`, `CANCELLED`).
   - Nút "Tìm kiếm", "Đặt lại" và nút "+ Tạo phiếu trả hàng".
3. **Bảng dữ liệu phiếu trả hàng**:
   - Cột: Mã phiếu trả, Phiếu nhập gốc (GRN), Nhà cung cấp, Chi nhánh, Ngày tạo, Số SKU, Tổng SL yêu cầu, Trạng thái (Semantic Badge), Thao tác.
   - Phân trang chuẩn MT-GRMS.

#### Scenario: Lọc các phiếu đã được NCC duyệt đang chờ bàn giao
- GIVEN người dùng đang ở màn hình danh sách phiếu trả hàng
- WHEN người dùng chọn Trạng thái là "APPROVED"
- THEN bảng chỉ hiển thị các phiếu đã được NCC chấp nhận và sẵn sàng bàn giao thực tế.

---

### Requirement: REQ-02 Màn hình Lập Phiếu Trả Hàng NCC (UI-RTV-02)
Hệ thống MUST hiển thị form lập phiếu trả hàng tại đường dẫn `/store-owner/supplier-returns/create`:
1. **Thông tin chung**:
   - Chi nhánh lập phiếu.
   - Dropdown chọn Phiếu nhập kho gốc (`Goods Receipt` đã `COMPLETED`).
   - Tự động điền Nhà cung cấp tương ứng với GRN đã chọn.
   - Lý do trả hàng (Hàng sắp hết hạn, Hàng hư hỏng/lỗi chất lượng, Sai quy cách, Hàng tồn đọng thỏa thuận thu hồi, Khác).
   - Ghi chú và khu vực tải tệp/ảnh đính kèm biên bản kiểm định.
2. **Bảng danh sách mặt hàng trả**:
   - Tự động hiển thị các dòng sản phẩm của phiếu nhập gốc.
   - Với mỗi sản phẩm: Mã SKU, Tên sản phẩm, ĐVT, Mã Lô (Batch Code), HSD, Số lượng đã nhận (`ReceivedQty`), Đã trả trước đó (`ReturnedQty`), Đang chờ trả (`PendingReturnQty`), **Số lượng còn có thể trả (`AvailableReturnQty`)**.
   - Input số lượng yêu cầu trả (`RequestedQty`): Hệ thống MUST xác thực $0 < RequestedQty \le AvailableReturnQty$. Nếu người dùng nhập vượt quá, hệ thống hiển thị cảnh báo đỏ và ngăn chặn lưu phiếu.
3. **Thanh hành động (Action Bar)**:
   - Nút "Hủy bỏ".
   - Nút "Lưu nháp (Draft)": Lưu phiếu để tiếp tục chỉnh sửa sau.
   - Nút "Gửi yêu cầu trả hàng": Chuyển trạng thái sang `PENDING_SUPPLIER`, khóa số lượng hàng vào `PENDING_RETURN`.

#### Scenario: Nhân viên nhập số lượng trả vượt quá số lượng cho phép
- GIVEN một lô sữa có `AvailableReturnQty = 15`
- WHEN nhân viên nhập `RequestedQty = 20`
- THEN hệ thống báo lỗi: "Số lượng yêu cầu trả (20) vượt quá số lượng còn được phép trả của lô (15)."
- AND nút Gửi yêu cầu bị vô hiệu hóa.

---

### Requirement: REQ-03 Màn hình Chi tiết Phiếu Trả Hàng & Ghi nhận Phản hồi NCC (UI-RTV-03)
Hệ thống MUST hiển thị trang chi tiết tại `/store-owner/supplier-returns/:id`:
1. **Tiến trình trạng thái (Status Stepper)**:
   - `Khởi tạo (DRAFT)` ➔ `Chờ phản hồi (PENDING_SUPPLIER)` ➔ `Đã duyệt (APPROVED)` ➔ `Hoàn tất (COMPLETED)`.
2. **Hành động theo ngữ cảnh trạng thái**:
   - Khi ở `PENDING_SUPPLIER`: Hiển thị nút "Ghi nhận phản hồi NCC" mở modal để nhân viên nhập:
     * Kết quả phản hồi: Chấp nhận toàn bộ, Chấp nhận một phần, Từ chối toàn bộ.
     * Số lượng chấp nhận (`ApprovedQty`) và Số lượng từ chối (`RejectedQty`) trên từng dòng.
     * Ghi chú phản hồi của NCC.
   - Khi ở `APPROVED`: Hiển thị nút "Xác nhận bàn giao thực tế" mở modal để nhân viên nhập:
     * Số lượng thực tế bàn giao cho xe hàng NCC (`HandedOverQty \le ApprovedQty`).
     * Tên nhân viên bàn giao và thời điểm.
     * Khi bấm xác nhận: Hệ thống cập nhật trạng thái phiếu thành `COMPLETED`, trừ tồn kho `BranchStocks` đúng bằng `HandedOverQty`.
   - Nút "Hủy phiếu trả hàng": Cho phép hủy khi phiếu chưa ở trạng thái `COMPLETED`, bắt buộc nhập lý do hủy, giải phóng toàn bộ số lượng đang chờ trả về tồn kho khả dụng.
   - Nút "In biên bản trả hàng": Hỗ trợ in chứng từ khổ A4 theo mẫu tiêu chuẩn.

#### Scenario: Nhà cung cấp chấp nhận một phần
- GIVEN phiếu trả hàng yêu cầu trả 20 hộp cá mòi
- WHEN nhân viên ghi nhận phản hồi NCC: Chấp nhận 15 hộp, Từ chối 5 hộp (lý do "vỏ hộp bị móp do vận chuyển nội bộ")
- THEN phiếu chuyển sang trạng thái `APPROVED`
- AND số lượng được duyệt bàn giao là 15 hộp
- AND 5 hộp bị từ chối được giải phóng khỏi trạng thái chờ trả nếu còn hạn.

#### Scenario: Bàn giao hàng hoàn tất
- GIVEN phiếu trả hàng ở trạng thái `APPROVED` với số lượng duyệt là 15 hộp
- WHEN nhân viên bấm "Xác nhận bàn giao thực tế" và nhập số lượng bàn giao là 15 hộp
- THEN hệ thống chuyển trạng thái phiếu sang `COMPLETED`
- AND tồn kho khả dụng chi nhánh giảm chính thức 15 hộp
- AND hệ thống ghi nhận giao dịch `SUPPLIER_RETURN` trong lịch sử kho.

---

### Requirement: REQ-04 Cách ly Tồn kho và Trừ Tồn kho Đúng Thời Điểm
Hệ thống MUST tuân thủ nghiêm ngặt phương án B trong tài liệu phạm vi nghiệp vụ:
1. Khi gửi yêu cầu (`PENDING_SUPPLIER`): Hàng chuyển sang `PENDING_RETURN`. Tồn khả dụng tại chi nhánh `AvailableQty` giảm đi đúng bằng số lượng yêu cầu trả, ngăn chặn việc bán nhầm tại quầy POS.
2. Tồn vật lý (`PhysicalQty`) tại chi nhánh **chưa giảm** trong giai đoạn chờ phản hồi và chờ bàn giao, vì hàng vẫn nằm tại kho về mặt vật lý.
3. Chỉ khi hoàn tất bàn giao thực tế (`COMPLETED`): Tồn vật lý chính thức giảm, ghi nhận xuất kho `SUPPLIER_RETURN`.

---

## Acceptance Checklist
- [ ] REQ-01: Màn hình danh sách phiếu trả hàng có bảng dữ liệu chuẩn MT-GRMS, bộ lọc đa tiêu chí và KPI tổng quan.
- [ ] REQ-02: Form lập phiếu trả hàng hỗ trợ chọn từ GRN gốc đã `COMPLETED`, kiểm soát số lượng theo `AvailableReturnQty` của từng lô.
- [ ] REQ-03: Trang chi tiết hỗ trợ quy trình đầy đủ: Ghi nhận phản hồi NCC (`APPROVED` / `REJECTED`), Bàn giao thực tế (`COMPLETED`), Hủy phiếu DRAFT/PENDING giải phóng tồn kho.
- [ ] REQ-04: Tồn kho khả dụng bị khóa khi chờ trả và chỉ giảm tồn kho vật lý chính thức khi bàn giao hoàn tất.
