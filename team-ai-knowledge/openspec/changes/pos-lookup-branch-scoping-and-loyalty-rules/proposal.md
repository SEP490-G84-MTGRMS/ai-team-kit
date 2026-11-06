# Proposal: Tối Ưu POS Header, Phân Quyền Chi Nhánh Tra Cứu Tồn Kho & Kiểm Chứng FE-16 (Khuyến Mãi, Voucher, Tích Điểm)

## 1. Vấn Đề
1. **Nút công cụ thừa tại POS Header:** Nút "Tra cứu Lô FEFO" trên thanh công cụ POS header chiếm diện tích không cần thiết và người dùng yêu cầu loại bỏ khỏi header bán hàng.
2. **Thiếu phân quyền chi nhánh tại Màn hình Tra Cứu Tồn Kho (`InventoryLookupPage.tsx`):**
   - Hiện tại màn hình tra cứu tồn kho đang hardcode "Chi nhánh trung tâm" và tên nhân viên giả lập.
   - Khi đăng nhập bằng vai trò Chủ cửa hàng (`STORE_OWNER`), người dùng không thể chọn/chuyển đổi chi nhánh để tra cứu tồn kho chéo giữa Ba Đình, Cầu Giấy và Đống Đa.
   - Khi đăng nhập bằng vai trò Nhân viên (`EMPLOYEE`), hệ thống chưa tự động gán và khóa cứng về đúng chi nhánh mà nhân viên được phân công.
3. **Yêu cầu kiểm chứng & hoàn thiện phân hệ FE-16:**
   - Cần rà soát và xác minh bộ chức năng FE-16 (Khuyến mãi, Voucher, Tích điểm) ở Backend:
     - **FE-16.1:** Cấu hình quy tắc giảm giá (% discount, Mua A tặng B - Buy A Get B, giảm giá tổng đơn).
     - **FE-16.2:** Quản lý phát hành và sử dụng/đổi voucher (Issuance & Redemption).
     - **FE-16.3:** Hệ thống tích điểm và tiêu điểm thành viên (Earning & Redemption rules).

## 2. Mục Tiêu
1. Loại bỏ nút "Tra cứu Lô FEFO" khỏi thanh header bán hàng `PosHeader.tsx`.
2. Bổ sung cơ chế phân quyền chọn chi nhánh tại trang `InventoryLookupPage.tsx`:
   - `STORE_OWNER`: Dropdown tự do chuyển đổi giữa các chi nhánh của chuỗi.
   - `EMPLOYEE`: Tự động nhận diện và khóa cứng chi nhánh được phân công (Read-only badge).
3. Rà soát, hoàn thiện và bổ sung Unit Tests cho FE-16:
   - Xác nhận FE-16.1 và FE-16.2 đã có sẵn và có Unit Tests.
   - Bổ sung tham số `PointsRedeemed` và logic trừ điểm thưởng khi tiêu điểm tại `OrderService.cs` (FE-16.3) kèm Unit Tests kiểm thử tự động 100%.

## 3. Phạm Vi (Scope)
- **Trong phạm vi (In Scope):**
  - Frontend: `PosHeader.tsx` (xóa nút FEFO, fix click dropdown chi nhánh).
  - Frontend: `InventoryLookupPage.tsx` (tích hợp `useAuthStore`, phân quyền hiển thị chi nhánh & thông tin thu ngân theo role).
  - Backend: `OrderDtos.cs`, `OrderService.cs` (hỗ trợ tiêu điểm tích lũy `PointsRedeemed` trừ `customer.RewardPoints`).
  - Unit Tests: Bổ sung test case cho FE-16.3 trong `PosOrderServiceTests.cs`.
  - Kiểm tra `dotnet test` và `npm run build`.
- **Ngoài phạm vi (Out of Scope):**
  - Thay đổi kiến trúc phân quyền chung của hệ thống.

## 4. Người Dùng & Vai Trò
- **STORE_OWNER (Trần Quốc An):** Được phép chọn xem tồn kho và lô hàng của bất kỳ chi nhánh nào trong chuỗi.
- **EMPLOYEE (Phạm Thị Yến / Lê Hoàng Nam):** Chỉ xem được tồn kho tại chi nhánh làm việc của mình, không được đổi chi nhánh khác.
- **Khách hàng thân thiết:** Tích điểm khi mua hàng và tiêu điểm để giảm trừ tiền thanh toán.

## 5. Tiêu Chí Thành Công
- Header bán hàng POS không còn nút "Tra cứu Lô FEFO".
- Màn hình Tra cứu tồn kho hiển thị dropdown chọn chi nhánh cho `STORE_OWNER`, hiển thị badge tĩnh cho `EMPLOYEE`.
- Backend hỗ trợ đầy đủ tích điểm (10.000đ = 1 điểm) và tiêu điểm (trừ điểm khi khách dùng điểm thanh toán).
- Toàn bộ Unit Tests backend và frontend build đạt 100% PASS.
