# Specs: pos-cash-control-nav-and-shift-history

## API / Contract

| Method | Endpoint | Request Body / Query | Response DTO | Lỗi / Validation |
|---|---|---|---|---|
| `GET` | `/api/pos/shifts/history` | Query: `branchId` (Guid, req), `fromDate` (DateTime?, opt), `toDate` (DateTime?, opt) | `ApiResponse<IReadOnlyList<ShiftDetailResponse>>` | `400 REQUIRED_BRANCH_ID` nếu thiếu branchId |
| `POST` | `/api/pos/shifts/{id}/confirm-handover` | Body: `ConfirmHandoverRequest(isConfirmed, disputeReason, actualCashCounted)` | `ApiResponse<ShiftDetailResponse>` | `404 SHIFT_NOT_FOUND`, `400 INVALID_HANDOVER_STATUS` |
| `GET` | `/api/pos/cash-movements/settings` | (none) | `ApiResponse<CashMovementSettingsDto>` | `401 Unauthorized` |
| `PUT` | `/api/pos/cash-movements/settings` | Body: `UpdateCashMovementSettingsRequest(cashOutApprovalThreshold, cashOutShiftTotalLimit)` | `ApiResponse<CashMovementSettingsDto>` | `400 INVALID_THRESHOLD` |

---

## ADDED Requirements

### Requirement: REQ-NAV-01 Lối tắt Lịch sử giao ca trên trang Lịch làm việc
Giao diện "Lịch làm việc chi nhánh" (`WorkSchedulePage.tsx`) MUST cung cấp một button chuyên dụng "Lịch sử giao ca" tại khu vực thanh điều khiển tiêu đề (Header Actions).

#### Scenario: Chủ cửa hàng hoặc Quản lý chi nhánh nhấn button Lịch sử giao ca
- **GIVEN** Người dùng đang ở màn hình `/store-owner/employees/schedule` và đã chọn chi nhánh `Chi nhánh Ba Đình`.
- **WHEN** Người dùng nhấn vào button "Lịch sử giao ca".
- **THEN** Hệ thống MUST điều hướng sang trang `/pos/shift?branchId={branchId}` với chi nhánh Ba Đình được thiết lập sẵn trên bộ lọc.

#### Scenario: Không chọn chi nhánh cụ thể (Tất cả chi nhánh)
- **GIVEN** Người dùng chưa lọc chi nhánh hoặc chọn tất cả chi nhánh.
- **WHEN** Người dùng nhấn "Lịch sử giao ca".
- **THEN** Hệ thống MUST điều hướng sang `/pos/shift` và hiển thị chi nhánh mặc định đầu tiên của chuỗi.

---

### Requirement: REQ-NAV-02 Tập trung cấu hình Hạn mức & Phê duyệt chi két tại Portal Cài đặt & Thiết lập
Toàn bộ tính năng thiết lập hạn mức tiền mặt rút két và phê duyệt chi quỹ vượt ngưỡng MUST được quản lý độc quyền tại dropdown "Cài đặt & Thiết lập" (`/store-owner/pos-cash-control`), không xuất hiện trên giao diện POS bán hàng.

#### Scenario: Chủ cửa hàng cấu hình hạn mức từ TopNav Portal
- **GIVEN** Chủ cửa hàng đang ở bất kỳ trang quản trị nào của Portal.
- **WHEN** Người dùng click vào icon bánh răng "CÀI ĐẶT & THIẾT LẬP" trên TopNav và chọn "Hạn Mức & Duyệt Chi Két POS".
- **THEN** Hệ thống MUST mở trang `StorePosCashControlPage.tsx`, cho phép cập nhật hạn mức chi và phê duyệt/từ chối các phiếu chi đang chờ.

---

### Requirement: REQ-SHIFT-HIST-01 Truy vấn danh sách lịch sử đóng ca tích hợp Backend API
Màn hình `PosShiftPage.tsx` MUST gọi API `GET /api/pos/shifts/history` để tải danh sách các phiên ca thực tế đã diễn ra tại chi nhánh.

#### Scenario: Tải danh sách lịch sử ca thành công
- **GIVEN** Chi nhánh có các ca làm việc đã đóng (`Closed`) và đang đóng (`Closing`).
- **WHEN** Trang `PosShiftPage.tsx` được mở với `branchId`.
- **THEN** Hệ thống MUST hiển thị danh sách các ca với đầy đủ thông tin: Mã ca, Quầy, Giờ mở - Giờ đóng, Thu ngân mở ca, Tiền đầu ca, Doanh thu tiền mặt, Tiền thực đếm, Chênh lệch két thừa/thiếu, Trạng thái ca, Trạng thái bàn giao.
- **AND** Hệ thống MUST tính toán và hiển thị đúng 4 thẻ KPI tổng hợp (Tổng số ca, Tổng doanh thu tiền mặt, Tổng tiền thực đếm, Tổng chênh lệch).

#### Scenario: Không có ca nào trong dải ngày
- **GIVEN** Chi nhánh không phát sinh ca bán hàng nào trong dải ngày đã chọn.
- **WHEN** Dữ liệu trả về rỗng.
- **THEN** Hệ thống MUST hiển thị trạng thái Empty State rõ ràng: "Không có dữ liệu ca làm việc trong khoảng thời gian này."

---

### Requirement: REQ-SHIFT-HIST-02 Xác nhận bàn giao ca và đối soát chênh lệch
Thu ngân nhận ca tiếp theo hoặc Chủ cửa hàng/Quản lý MUST có khả năng xác nhận bàn giao ca (`ConfirmHandover`) hoặc khiếu nại chênh lệch (`Disputed`) cho các ca có trạng thái bàn giao chưa hoàn tất.

#### Scenario: Thu ngân xác nhận nhận bàn giao ca khớp tiền
- **GIVEN** Một ca đã đóng với `HandoverStatus = Pending`.
- **WHEN** Người dùng nhấn "Xác nhận bàn giao", nhập số tiền thực nhận khớp và bấm Đồng ý.
- **THEN** Hệ thống MUST gửi `POST /api/pos/shifts/{id}/confirm-handover` với `isConfirmed = true`.
- **AND** Trạng thái bàn giao của ca MUST chuyển sang `Confirmed` (màu xanh lá) ngay lập tức.

#### Scenario: Thu ngân ghi nhận khiếu nại thiếu hụt tiền bàn giao
- **GIVEN** Một ca đã đóng phát hiện thiếu hụt tiền mặt không rõ lý do.
- **WHEN** Người dùng chọn "Khiếu nại / Lệch tiền", nhập lý do và bấm Gửi.
- **THEN** Hệ thống MUST gửi `POST /api/pos/shifts/{id}/confirm-handover` với `isConfirmed = false` kèm `disputeReason`.
- **AND** Trạng thái bàn giao MUST chuyển sang `Disputed` (màu đỏ cam) cùng ghi chú khiếu nại.

---

## MODIFIED Requirements

### Requirement: REQ-SHIFT-05 Tinh giản Menu thao tác POS Header
Giao diện `PosHeader.tsx` MUST loại bỏ nút điều hướng "Hạn mức & Duyệt chi két" và loại bỏ prop `pendingApprovalCount` trong `PosHeaderProps`. Menu thao tác chỉ giữ các chức năng phục vụ trực tiếp cho hoạt động quầy thu ngân.

#### Scenario: Thu ngân hoặc Chủ cửa hàng mở Menu thao tác trên POS Header
- **GIVEN** Người dùng (kể cả role `STORE_OWNER`) đang ở giao diện bán hàng POS.
- **WHEN** Nhấn vào nút Hamburger "Thao tác".
- **THEN** Menu dropdown hiển thị:
  1. Về Dashboard (chỉ Store Owner)
  2. Giữ đơn hàng (Recall)
  3. In bill gần nhất
  4. Tra cứu tồn kho & Lô FEFO
  5. Quản lý đơn hàng & Đổi trả
  6. Thu / Chi tiền mặt két (Nhân viên)
  7. Lịch sử ca cửa hàng / Sổ ca & Chốt ca quầy
- **AND** Hoàn toàn KHÔNG hiển thị mục "Hạn mức & Duyệt chi két".

---

## Acceptance checklist
- [ ] REQ-NAV-01: Nút "Lịch sử giao ca" hiển thị trên thanh công cụ trang Lịch làm việc (`WorkSchedulePage.tsx`) và điều hướng đúng chi nhánh.
- [ ] REQ-NAV-02: Dropdown "Cài đặt & Thiết lập" (`AppTopNav.tsx`) dẫn tới trang `/store-owner/pos-cash-control` chuẩn xác.
- [ ] REQ-SHIFT-05: Menu POS Header (`PosHeader.tsx`) không còn mục "Hạn mức & Duyệt chi két".
- [ ] REQ-SHIFT-HIST-01: `PosShiftPage.tsx` hiển thị dữ liệu lịch sử ca thực tế từ `GET /api/pos/shifts/history` theo chi nhánh & ngày.
- [ ] REQ-SHIFT-HIST-02: Có thể xem chi tiết Z-Report và xác nhận bàn giao ca thông qua API `POST /api/pos/shifts/{id}/confirm-handover`.
- [ ] Backend Unit Tests cho `GetShiftHistoryAsync` và `ConfirmHandoverAsync` đạt 100% pass.
