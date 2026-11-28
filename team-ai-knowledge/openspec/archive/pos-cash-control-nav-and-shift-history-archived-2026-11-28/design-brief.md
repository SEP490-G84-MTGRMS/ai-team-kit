# Design Brief: pos-cash-control-nav-and-shift-history

## 1. Luồng người dùng (User Flows)

### Luồng 1: Quản trị hạn mức & Phê duyệt chi két tại Portal Chủ Cửa Hàng
1. Chủ cửa hàng truy cập hệ thống quản trị, click vào menu góc trên **"Cài đặt & Thiết lập"** (icon bánh răng trên `AppTopNav.tsx`).
2. Dropdown xuất hiện hiển thị 3 mục cấu hình:
   - Cấu hình VietQR & SePay (Mới)
   - **Hạn Mức & Duyệt Chi Két POS (POS)** (kèm badge số lượng phiếu chi cần duyệt nếu có)
   - Gói dịch vụ MT-GRMS
3. Nhấp vào "Hạn Mức & Duyệt Chi Két POS" -> Hệ thống điều hướng đến trang `/store-owner/pos-cash-control` (`StorePosCashControlPage.tsx`).
4. Tại đây, Chủ cửa hàng có thể thiết lập:
   - Hạn mức tự động duyệt chi két (VND).
   - Giới hạn tổng chi trong ca (VND).
   - Danh sách phiếu chi két chờ phê duyệt / từ chối kèm lý do.
   - Danh sách tiền rút két cần xác nhận.

### Luồng 2: Bán hàng tại quầy POS tối giản và tập trung
1. Nhân viên thu ngân hoặc Chủ cửa hàng mở giao diện bán hàng POS (`/pos` hoặc `/employee/pos`).
2. Menu thao tác Hamburger trên `PosHeader.tsx` chỉ giữ các tính năng phục vụ thu ngân tại quầy: Giữ đơn (Recall), In bill gần nhất, Tra cứu tồn kho & Lô FEFO, Quản lý đơn hàng & Đổi trả, Thu/Chi tiền mặt két (thu ngân), Sổ ca & Chốt ca quầy.
3. Mục "Hạn mức & Duyệt chi két" bị loại bỏ hoàn toàn khỏi menu POS để không gây nhầm lẫn và tránh xao nhãng nhân viên quầy.

### Luồng 3: Xem lịch sử giao ca từ trang Lịch làm việc
1. Chủ cửa hàng hoặc Quản lý chi nhánh vào trang **"Lịch làm việc chi nhánh"** (`/store-owner/employees/schedule`).
2. Trên thanh công cụ điều khiển (cạnh ô tìm kiếm và bộ lọc chi nhánh), xuất hiện button mới:
   - Label: **"Lịch sử giao ca"** (icon `Clock` hoặc `History`).
3. Nhấp vào button -> Hệ thống điều hướng đến trang **Lịch sử ca bán hàng** (`/pos/shift?branchId={selectedBranchId}`) hoặc mở giao diện nhật ký bàn giao ca tương ứng của chi nhánh đang chọn.

### Luồng 4: Tra cứu lịch sử chốt ca & Xác nhận bàn giao quầy
1. Màn hình `PosShiftPage.tsx` đóng vai trò là trung tâm tra cứu lịch sử đóng ca và bàn giao quầy:
   - Bộ lọc: Chọn chi nhánh, dải thời gian (Hôm nay, 7 ngày qua, Tùy chọn ngày).
   - Thẻ tóm tắt KPI: Tổng số ca đã đóng, Tổng doanh thu tiền mặt, Tổng tiền thực đếm, Tổng chênh lệch két (thừa/thiếu).
   - Bảng danh sách ca: Mã ca (`shiftCode`), Quầy, Thời gian mở - đóng ca, Thu ngân phụ trách, Số tiền đầu ca, Doanh thu tiền mặt, Tiền thực đếm, Chênh lệch két, Trạng thái ca (`Closed`, `Closing`, `Active`), Trạng thái bàn giao (`Confirmed`, `Pending`, `Disputed`).
   - Hành động:
     - Xem chi tiết báo cáo kết toán Z-Report (Modal).
     - Nút "Xác nhận bàn giao" (với ca đang `Pending` xác nhận bàn giao).

## 2. Thiết kế Component Front-end

### 2.1. `src/features/pos/components/PosHeader.tsx`
- Xóa prop `pendingApprovalCount` trong `PosHeaderProps`.
- Xóa nút điều hướng `navigate('/store-owner/pos-cash-control')` trong dropdown Hamburger menu.

### 2.2. `src/features/pos/pages/PosCheckoutPage.tsx`
- Xóa state `pendingApprovalCount` và hook định kỳ gọi kiểm tra số phiếu chi chờ duyệt trong POS.

### 2.3. `src/features/employee/pages/WorkSchedulePage.tsx`
- Bổ sung nút button `Lịch sử giao ca`:
  ```tsx
  <button
    type="button"
    className="emp-btn emp-btn-secondary"
    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
    onClick={() => {
      const branchParam = selectedBranchIds.length === 1 ? selectedBranchIds[0] : '';
      navigate(branchParam ? `/pos/shift?branchId=${branchParam}` : '/pos/shift');
    }}
    title="Xem nhật ký lịch sử ca bán hàng và bàn giao quầy"
  >
    <Clock size={15} />
    <span>Lịch sử giao ca</span>
  </button>
  ```

### 2.4. `src/features/pos/pages/PosShiftPage.tsx`
- Loại bỏ Tab 1 kiểm đếm mock data và modal mệnh giá thừa thãi.
- Chuyển thành giao diện toàn trang chuyên nghiệp: **"Lịch Sử Chốt Ca & Bàn Giao Quầy"**.
- Gọi hook / hàm `posShiftApi.getShiftHistory(targetBranchId, fromDate, toDate)` lấy dữ liệu trực tiếp từ Backend.
- Bổ sung modal xác nhận bàn giao ca (`ConfirmHandoverModal`) cho phép thu ngân/quản lý xác nhận nhận ca hoặc khiếu nại chênh lệch tiền két.

## 3. Thiết kế Backend API & Repository

### 3.1. `ShiftRepository.GetHistoryAsync`
- Bổ sung Eager Loading cho các quan hệ thực thể:
  ```csharp
  var query = _context.ShiftZReports
      .Include(s => s.CashMovements)
      .Include(s => s.Branch)
      .Include(s => s.Participants)
      .Include(s => s.CloseConfirmations)
      .Where(s => s.BranchId == branchId);
  ```

### 3.2. Endpoints liên quan trong `ShiftsController.cs`
- `GET /api/pos/shifts/history`:
  - Query params: `branchId` (Guid, required), `fromDate` (DateTime?, optional), `toDate` (DateTime?, optional).
  - Trả về: `ApiResponse<IReadOnlyList<ShiftDetailResponse>>`.
- `POST /api/pos/shifts/{id}/confirm-handover`:
  - Body: `ConfirmHandoverRequest` (`IsConfirmed: bool`, `DisputeReason: string?`, `ActualCashCounted: decimal`).
  - Cập nhật trạng thái `HandoverStatus` thành `Confirmed` hoặc `Disputed`.

## 4. Kiểm thử tự động (Unit Tests)
- Viết unit tests trong `ShiftManagementServiceTests.cs`:
  - `GetShiftHistoryAsync_ShouldReturnFilteredShifts_WithParticipantsAndConfirmations`: Kiểm tra trả về đúng danh sách ca, đã sắp xếp theo thời gian mới nhất, bao gồm đầy đủ dữ liệu người tham gia và xác nhận đóng ca.
  - `ConfirmHandoverAsync_ShouldUpdateHandoverStatus_Successfully`: Kiểm tra ca được xác nhận bàn giao thành công và chuyển trạng thái chính xác.
