# Design Brief: Tối Ưu Header POS, Phân Quyền Chi Nhánh Tra Cứu Tồn Kho & Tiêu Điểm Thưởng FE-16

## 1. Luồng Người Dùng (User Flow)

### 1.1. POS Header (`PosHeader.tsx`)
- Xóa bỏ nút `<button className="pos-header-lookup-btn">` ("Tra cứu Lô FEFO").
- Tách biệt sự kiện `onClick` của dropdown chi nhánh dành cho `STORE_OWNER` với container branding để click chuyển chi nhánh không bị kích hoạt điều hướng nhầm.

### 1.2. Màn Hình Tra Cứu Tồn Kho & Lô FEFO (`InventoryLookupPage.tsx`)
- Lấy thông tin user đăng nhập từ `useAuthStore()`:
  - Nếu `user?.role === 'STORE_OWNER'`:
    - Hiển thị dropdown lựa chọn chi nhánh (Ba Đình, Cầu Giấy, Đống Đa).
    - Khi chủ tiệm đổi chi nhánh, cập nhật `activeBranch` và lọc/hiển thị tồn kho của chi nhánh đó.
  - Nếu `user?.role === 'EMPLOYEE'`:
    - Tự động gán chi nhánh theo tài khoản (`user?.branchId` hoặc mapping số điện thoại: `0917778888` -> Ba Đình, `0916667777` -> Cầu Giấy).
    - Hiển thị nhãn tĩnh (Badge) chi nhánh kèm icon địa điểm, không hiển thị dropdown.
  - Thông tin thu ngân ở góc phải: Hiển thị `NV: {user?.fullName || 'Thu ngân'}` thay vì text cố định cũ.

### 1.3. Tiêu Điểm Thưởng & Tích Điểm Tại Quầy (`OrderService.cs` & `OrderDtos.cs`)
- `OrderCreateRequest`: Thêm trường `int? PointsRedeemed = null`.
- Trong `OrderService.CreateOrderAsync`:
  - Nếu khách hàng có dùng điểm (`PointsRedeemed > 0`):
    - Trừ điểm: `customer.RewardPoints -= Math.Min(customer.RewardPoints, request.PointsRedeemed.Value)`.
  - Tích điểm hóa đơn mới: `earnedPoints = (int)(finalAmount / 10000m)`.
  - Cộng điểm mới: `customer.RewardPoints += earnedPoints`.

## 2. Thay Đổi Mã Nguồn (Code Changes)

### 2.1. Frontend
- `MT_GRMS_FRONTEND/src/features/pos/components/PosHeader.tsx`: Xóa nút Tra cứu Lô FEFO.
- `MT_GRMS_FRONTEND/src/features/pos/pages/InventoryLookupPage.tsx`:
  - Import `useAuthStore` và `AN_NHIEN_BRANCHES`.
  - State `selectedBranchId`, logic phân quyền dropdown chi nhánh cho `STORE_OWNER` và badge tĩnh cho `EMPLOYEE`.

### 2.2. Backend
- `MT_GRMS_BACKEND/src/MT_GRMS.Application/PosOrders/Dtos/OrderDtos.cs`:
  - Bổ sung `int? PointsRedeemed = null` vào `OrderCreateRequest`.
- `MT_GRMS_BACKEND/src/MT_GRMS.Application/PosOrders/OrderService.cs`:
  - Bổ sung xử lý trừ điểm thưởng khi khách hàng tiêu điểm.

### 2.3. Unit Tests
- `MT_GRMS_BACKEND/tests/MT_GRMS.UnitTests/PosOrderServiceTests.cs`:
  - Thêm test case `REQ_FE16_RedeemRewardPoints_DeductsPointsAndEarnsNewPoints()`.
