# Specs: inter-branch-transfer-ui
## Capability: Inter-Branch Inventory Transfer (FE-15)
- Dependencies: `exploration.md`, `design-brief.md`, `proposal.md`
- Căn cứ hệ thống: [Report-3 SRS Section 15](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L2353), [chuyen_hang.md](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/doc/Require/Chuyen%20hang/chuyen_hang.md), [Screen Design/Transfer](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/doc/Require/Screen%20Design/Transfer).

---

## 1. ADDED Requirements

### Requirement: REQ-01 Xem Danh sách Phiếu chuyển & Phân quyền Chi nhánh (Transfer List & Scope)
Hệ thống MUST hiển thị danh sách phiếu chuyển hàng dạng bảng phân trang, hỗ trợ lọc theo Chi nhánh gửi, Chi nhánh nhận, Trạng thái phiếu (`Phiếu tạm`, `Đang chuyển`, `Đã nhận`, `Đã hủy`), Thời gian (Ngày chuyển, Ngày nhận, Tháng này, Tùy chỉnh) và Tình trạng nhận hàng (Tất cả, Khớp, Lệch).
Hệ thống MUST tuân thủ quy tắc bảo mật [BR-SEC-02](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4765): Nhân viên chỉ nhìn thấy phiếu liên quan đến chi nhánh mình đang làm việc; Store Owner được xem toàn chuỗi cửa hàng.

#### Scenario: Nhân viên chi nhánh xem danh sách phiếu thuộc phạm vi chi nhánh
- **GIVEN** Người dùng đăng nhập với vai trò `Employee` tại "Chi nhánh HCM"
- **WHEN** Truy cập trang `/dashboard/transfers`
- **THEN** Hệ thống CHỈ hiển thị các phiếu chuyển có Chi nhánh gửi hoặc Chi nhánh nhận là "Chi nhánh HCM"
- **AND** Không nhìn thấy các phiếu luân chuyển nội bộ giữa Chi nhánh Đà Nẵng và Kho tổng Hà Nội.

#### Scenario: Tìm kiếm theo mã phiếu chuyển
- **GIVEN** Danh sách phiếu chuyển đang hiển thị
- **WHEN** Người dùng nhập từ khóa "TRF000001" vào ô tìm kiếm
- **THEN** Bảng dữ liệu hiển thị đúng phiếu chuyển có mã `TRF000001`.

---

### Requirement: REQ-02 Khởi tạo Phiếu chuyển & Trừ kho Gửi ngay lập tức (Create Transfer & Dispatch)
Hệ thống MUST cho phép người dùng khởi tạo phiếu chuyển hàng.
Hệ thống MUST tự động kiểm tra và CHẶN nếu người dùng chọn Chi nhánh nhận trùng với Chi nhánh gửi.
Hệ thống MUST kiểm tra tồn kho khả dụng (`AvailableQty = OnHandQty - CommittedQty`): Nếu số lượng cần chuyển lớn hơn tồn khả dụng, hệ thống MUST cảnh báo đỏ và CHẶN hành động xuất chuyển.
Khi người dùng bấm "Xuất chuyển hàng", hệ thống MUST tự sinh mã `TRFxxxxxx`, cập nhật trạng thái `In-Transit`, và NGAY LẬP TỨC trừ tồn kho khả dụng tại chi nhánh gửi theo quy tắc [BR-TRF-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4766).

#### Scenario: Xuất chuyển thành công phiếu hàng thông thường
- **GIVEN** Chi nhánh gửi có sản phẩm "Bình hoa decor" tồn khả dụng = 23 cái
- **WHEN** Người dùng chọn chi nhánh nhận "Chi nhánh HCM", nhập số lượng chuyển = 5 cái và bấm "Xuất chuyển hàng"
- **THEN** Hệ thống sinh mã phiếu `TRF000001`, đổi trạng thái sang `In-Transit`
- **AND** Tồn kho "Bình hoa decor" tại chi nhánh gửi giảm ngay lập tức còn 18 cái
- **AND** Tồn kho chi nhánh nhận chưa thay đổi (hàng đang trên đường).

#### Scenario: Chặn chọn trùng chi nhánh nhận và chi nhánh gửi (Edge Case)
- **GIVEN** Chi nhánh gửi đang là "Chi nhánh trung tâm"
- **WHEN** Người dùng chọn chi nhánh nhận là "Chi nhánh trung tâm"
- **THEN** Hệ thống hiển thị cảnh báo lỗi in-line: "Chi nhánh nhận không được trùng với chi nhánh gửi."
- **AND** Nút xuất chuyển hàng bị vô hiệu hóa.

---

### Requirement: REQ-03 Quản lý Lô & Hạn sử dụng FEFO khi Chuyển hàng (Batch FEFO Preservation)
Hệ thống MUST hỗ trợ chọn chính xác số Lô (`BatchNumber`) và Hạn sử dụng đối với các sản phẩm quản lý theo lô theo quy tắc [BR-TRF-02](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4767).
Hệ thống SHALL hiển thị cảnh báo đối với các lô đã hết hạn và ưu tiên gợi ý các lô có hạn dùng gần nhất (FEFO).

#### Scenario: Chọn lô còn hạn xuất chuyển
- **GIVEN** Sản phẩm "Kem dưỡng da" có 2 lô: Lô SX010825 (HSD 31/01/2026, tồn 2) và Lô SX010925 (HSD 02/03/2026, tồn 10)
- **WHEN** Người dùng mở popup `SelectBatchModal` và chọn xuất 5 hộp từ Lô SX010925
- **THEN** Hệ thống ghi nhận số lượng chuyển đi kèm đúng thông tin Lô `SX010925` và HSD `02/03/2026`.

---

### Requirement: REQ-04 Kiểm đếm Thực tế & Xác nhận Nhập kho (Receive Transfer & Shrinkage)
Khi xe hàng tới chi nhánh nhận, hệ thống MUST cho phép nhân viên chi nhánh nhận mở phiếu `In-Transit` để kiểm đếm số lượng thực nhận (`ReceivedQty`).
Hệ thống MUST cung cấp nút tiện ích "Nhận đủ tất cả" để tự động điền `ReceivedQty = SentQty`.
Nếu phát sinh chênh lệch (`ReceivedQty < SentQty`), hệ thống BẮT BUỘC người dùng nhập lý do giải trình (`Discrepancy Note`); nút xác nhận nhập kho SHALL bị vô hiệu hóa nếu lý do để trống.
Khi bấm "Xác nhận nhập kho", hệ thống MUST:
1. Đổi trạng thái phiếu sang `Received`.
2. Chỉ ghi nhận tăng tồn kho chi nhánh nhận theo số lượng thực tế nhận được ([BR-TRF-03](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4768)).
3. Tự động ghi nhận số lượng thiếu hụt vào sổ hao hụt vận chuyển ([BR-TRF-04](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4769)).

#### Scenario: Nhận hàng đủ 100% nguyên vẹn
- **GIVEN** Phiếu `TRF000001` đang chuyển 5 "Bình hoa decor"
- **WHEN** Nhân viên chi nhánh nhận bấm nút "Nhận đủ tất cả" và bấm "Xác nhận nhập kho"
- **THEN** Trạng thái phiếu cập nhật thành `Received`
- **AND** Tồn kho "Bình hoa decor" tại chi nhánh nhận tăng thêm 5 cái
- **AND** Không phát sinh hao hụt.

#### Scenario: Nhận hàng thiếu/bể vỡ có giải trình (BR-TRF-04)
- **GIVEN** Phiếu `TRF000002` gửi 10 hộp "Bánh bắp tươi"
- **WHEN** Nhân viên kiểm đếm chỉ nhận được 8 hộp (bể vỡ 2 hộp), nhập `ReceivedQty = 8`
- **AND** Nhập ghi chú: "Bể vỡ 2 hộp khi bốc dỡ từ xe tải"
- **AND** Bấm "Xác nhận nhập kho"
- **THEN** Tồn kho chi nhánh nhận CHỈ tăng thêm 8 hộp
- **AND** 2 hộp bị vỡ được tự động ghi nhận vào sổ hao hụt vận chuyển.

---

### Requirement: REQ-05 Hủy Phiếu chuyển & Tự động Hoàn tác Tồn kho (Rollback Cancellation)
Hệ thống MUST cho phép kho gửi hoặc Store Owner hủy phiếu chuyển hàng đang ở trạng thái `Draft` hoặc `In-Transit` ([BR-TRF-06](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4771)).
Hệ thống MUST yêu cầu nhập lý do hủy chi tiết.
Hệ thống MUST CHẶN hủy nếu chi nhánh nhận đã bấm xác nhận nhập kho (`Received`).
Khi hủy thành công một phiếu `In-Transit`, hệ thống MUST tự động hoàn tác (Rollback) 100% số lượng hàng hóa và đúng số lô/hạn dùng về lại kho gửi theo quy tắc [BR-TRF-05](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4770).

#### Scenario: Hủy phiếu In-Transit tự động rollback tồn kho về kho gửi
- **GIVEN** Phiếu `TRF000003` đang ở trạng thái `In-Transit` (đã trừ 10 chai dầu ăn tại Kho gửi)
- **WHEN** Kho gửi mở modal `CancelTransferModal`, nhập lý do: "Xe tải hỏng, hủy điều chuyển" và bấm "Đồng ý"
- **THEN** Trạng thái phiếu đổi sang `Cancelled`
- **AND** Hệ thống tự động hoàn trả 10 chai dầu ăn về tồn kho của Kho gửi
- **AND** Khóa phiếu, không cho phép nhận hàng.

#### Scenario: Chặn chi nhánh nhận tự ý hủy phiếu của chi nhánh gửi (BR-TRF-06)
- **GIVEN** Phiếu do "Kho tổng Hà Nội" xuất đi cho "Chi nhánh HCM"
- **WHEN** Nhân viên đăng nhập tại "Chi nhánh HCM" mở chi tiết phiếu
- **THEN** Nút "Hủy phiếu" bị ẩn hoặc vô hiệu hóa kèm thông báo thẩm quyền.
