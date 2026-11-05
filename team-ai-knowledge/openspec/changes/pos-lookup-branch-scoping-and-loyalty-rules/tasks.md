# Tasks: Tối Ưu Header POS, Phân Quyền Chi Nhánh Tra Cứu Tồn Kho & Tiêu Điểm FE-16

## 1. Backend Application & DTO
- [ ] T1: Cập nhật `OrderDtos.cs` bổ sung `int? PointsRedeemed = null` vào `OrderCreateRequest` và cập nhật `OrderService.cs` khấu trừ `Customer.RewardPoints` khi có tiêu điểm thưởng (REQ-05).
- [ ] T2: Viết Unit Tests Backend trong `PosOrderServiceTests.cs` kiểm chứng quy tắc tiêu điểm (Redemption) kết hợp tích điểm mới (REQ-05).

## 2. Frontend UI & State Management
- [ ] T3: Cập nhật `PosHeader.tsx`: Xóa bỏ hoàn toàn nút "Tra cứu Lô FEFO" và tách biệt sự kiện click dropdown chi nhánh để không bị xung đột với navigation branding (REQ-02).
- [ ] T4: Nâng cấp `InventoryLookupPage.tsx`: Tích hợp `useAuthStore`, phân quyền chọn chi nhánh cho `STORE_OWNER` (dropdown) và khóa cố định chi nhánh cho `EMPLOYEE` (badge tĩnh), hiển thị tên thu ngân thật (REQ-02).

## 3. Kiểm Thử & Nghiệm Thu
- [ ] T5: Chạy `dotnet test` Backend (đạt 353/353 tests PASS) và `npm run build` Frontend đạt 100% không lỗi (REQ-02, REQ-05).
