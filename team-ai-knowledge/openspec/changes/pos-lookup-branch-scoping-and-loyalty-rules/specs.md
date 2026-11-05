# Specifications (Delta): Tối Ưu Header POS, Phân Quyền Chi Nhánh Tra Cứu Tồn Kho & Tiêu Điểm FE-16

## MODIFIED Requirements

### Requirement: REQ-02 Phân Quyền Điều Chỉnh Chi Nhánh Tại POS & Màn Hình Tra Cứu Tồn Kho
1. Thanh điều hướng bán hàng POS (`PosHeader.tsx`) MUST loại bỏ nút "Tra cứu Lô FEFO".
2. Màn hình Tra Cứu Tồn Kho & Lô FEFO (`InventoryLookupPage.tsx`) MUST phân quyền hiển thị chi nhánh làm việc theo vai trò:
   - Vai trò `STORE_OWNER`: SHALL có thể chọn và chuyển đổi linh hoạt giữa các chi nhánh qua dropdown menu để xem tồn kho từng điểm bán.
   - Vai trò `EMPLOYEE`: MUST bị khóa cố định ở chi nhánh đã được phân công, hiển thị dưới dạng badge chỉ đọc (read-only) và không thể chuyển sang chi nhánh khác.

#### Scenario: STORE_OWNER chuyển đổi chi nhánh trên trang Tra Cứu Tồn Kho
- **GIVEN** Người dùng đăng nhập với vai trò `STORE_OWNER`
- **WHEN** Người dùng truy cập trang Tra Cứu Tồn Kho (`/pos/inventory` hoặc `/employee/pos/inventory`)
- **THEN** Header màn hình hiển thị Dropdown lựa chọn chi nhánh (Ba Đình, Cầu Giấy, Đống Đa)
- **AND WHEN** Chủ tiệm chọn chuyển sang "An Nhiên Mart - Chi nhánh Cầu Giấy"
- **THEN** Thông tin chi nhánh hiện tại được cập nhật sang Cầu Giấy và hiển thị đúng tồn kho của chi nhánh đó.

#### Scenario: EMPLOYEE truy cập Tra Cứu Tồn Kho bị khóa cố định chi nhánh
- **GIVEN** Người dùng đăng nhập với vai trò `EMPLOYEE` (gắn với Ba Đình)
- **WHEN** Người dùng truy cập trang Tra Cứu Tồn Kho
- **THEN** Header màn hình hiển thị Badge tĩnh "An Nhiên Mart - Chi nhánh Ba Đình" kèm icon địa điểm
- **AND** Không xuất hiện dropdown chuyển chi nhánh.

---

## ADDED Requirements

### Requirement: REQ-05 Khấu Trừ Điểm Thưởng Khách Hàng Khi Tiêu Điểm (FE-16.3 Loyalty Redemption)
Khi tạo đơn hàng bán lẻ tại quầy POS (`OrderService.cs`):
1. Yêu cầu tạo đơn `OrderCreateRequest` SHALL hỗ trợ tham số tùy chọn `int? PointsRedeemed`.
2. Nếu `PointsRedeemed > 0` và đơn hàng có gắn `CustomerId`, hệ thống MUST khấu trừ số điểm tương ứng từ `Customer.RewardPoints` (không được trừ quá số điểm hiện có của khách).
3. Hệ thống MUST tiếp tục tích lũy điểm thưởng mới cho đơn hàng dựa trên số tiền thực trả `FinalAmount` (10.000đ = 1 điểm).

#### Scenario: Khách hàng sử dụng điểm tích lũy để thanh toán đơn hàng
- **GIVEN** Khách hàng có 100 điểm thưởng (`RewardPoints = 100`)
- **WHEN** Thu ngân tạo đơn hàng trị giá 200.000đ và khách sử dụng 50 điểm (`PointsRedeemed = 50`, giảm 5.000đ, FinalAmount = 195.000đ)
- **THEN** Điểm thưởng của khách hàng được khấu trừ 50 điểm (còn 50 điểm)
- **AND** Đơn hàng 195.000đ tích lũy thêm 19 điểm mới
- **THEN** Tổng điểm cuối cùng của khách hàng sau đơn là: `50 + 19 = 69 điểm`.

---

## Acceptance Checklist
- [ ] Gỡ bỏ hoàn toàn nút "Tra cứu Lô FEFO" khỏi `PosHeader.tsx`.
- [ ] `InventoryLookupPage.tsx` cho phép `STORE_OWNER` chọn chi nhánh qua dropdown.
- [ ] `InventoryLookupPage.tsx` khóa cứng chi nhánh của `EMPLOYEE` (badge tĩnh).
- [ ] `OrderCreateRequest` nhận `PointsRedeemed` và `OrderService.cs` trừ điểm thưởng chính xác.
- [ ] Bổ sung Unit Test kiểm chứng tích/tiêu điểm và chạy toàn bộ tests pass 100%.
