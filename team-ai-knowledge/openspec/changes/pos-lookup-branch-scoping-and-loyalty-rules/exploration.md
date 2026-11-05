# EXP-2026-11-06-POS-LOOKUP-LOYALTY: Tối Ưu Header POS, Phân Quyền Chi Nhánh Tra Cứu Tồn Kho & Hoàn Thiện FE-16

## 1. Problem Statement
1. **Nút thừa trên Header POS:** Nút "Tra cứu Lô FEFO" trên thanh công cụ `PosHeader.tsx` không cần thiết, làm chật chội thanh điều hướng bán hàng.
2. **Thiếu phân quyền chi nhánh tại Tra cứu tồn kho:** Màn hình `InventoryLookupPage.tsx` hiện đang hardcode "Chi nhánh trung tâm" và tên thu ngân mẫu, không cho phép Chủ cửa hàng (`STORE_OWNER`) chuyển đổi xem tồn kho các chi nhánh khác, đồng thời chưa khóa cứng chi nhánh của Nhân viên (`EMPLOYEE`).
3. **Phân hệ FE-16:** FE-16.1 (Giảm giá) và FE-16.2 (Voucher) đã hoàn chỉnh và có test; tuy nhiên FE-16.3 (Tích điểm & Tiêu điểm) mới chỉ có phần tích điểm (`RewardPoints += earnedPoints`), còn thiếu cơ chế tiêu điểm (trừ điểm khi thanh toán `RewardPoints -= pointsRedeemed`).

## 2. Context & Background
- Hệ thống đã có sẵn seed data 3 chi nhánh An Nhiên Mart (`BR-AN-01` Ba Đình, `BR-AN-02` Cầu Giấy, `BR-AN-03` Đống Đa) và 2 nhân viên (`0917778888` Ba Đình, `0916667777` Cầu Giấy).
- Màn hình `InventoryLookupPage.tsx` cần kết nối với `useAuthStore` để xác định role:
  - Nếu là `STORE_OWNER`: Cho phép chọn chi nhánh qua dropdown để xem kho tương ứng.
  - Nếu là `EMPLOYEE`: Khóa cứng theo chi nhánh nhân viên làm việc.
- Backend `OrderService.cs` cần tiếp nhận `PointsRedeemed` từ `OrderCreateRequest` để khấu trừ điểm tương ứng của khách hàng.

## 3. Constraints
- Giữ nguyên toàn bộ 352 unit tests backend đang PASS.
- Đảm bảo tính cô lập Multi-tenant (`TenantId`).
- Frontend build sạch 100% với Vite & TypeScript.

## 4. Assumptions
- **[ASSUMPTION]**: `PointsRedeemed` trong `OrderCreateRequest` là trường tùy chọn (`int? PointsRedeemed = null`), tương thích ngược hoàn toàn với các đơn không tiêu điểm.
- **[ASSUMPTION]**: Số điểm trừ không được vượt quá số điểm hiện có của khách hàng (`pointsToDeduct = Math.Min(customer.RewardPoints, request.PointsRedeemed.Value)`).

## 5. Scope & Non-Goals
### In Scope
- Gỡ bỏ nút "Tra cứu Lô FEFO" khỏi `PosHeader.tsx`.
- Cập nhật `InventoryLookupPage.tsx`: Dropdown chi nhánh cho `STORE_OWNER`, Badge cố định cho `EMPLOYEE`, hiển thị tên thu ngân thật từ auth store.
- Cập nhật `OrderDtos.cs` và `OrderService.cs`: Hỗ trợ `PointsRedeemed` và khấu trừ `customer.RewardPoints`.
- Bổ sung Unit Test kiểm chứng tiêu điểm thành công trong `PosOrderServiceTests.cs`.

### Out of Scope (Non-Goals)
- Không thay đổi chính sách hạng thành viên (MembershipTier).
- Không thêm các bảng tích điểm mới, tận dụng trường `Customer.RewardPoints` sẵn có.

## 6. Success Criteria
- Header POS không còn nút "Tra cứu Lô FEFO".
- Đăng nhập `STORE_OWNER` vào Tra cứu tồn kho có thể đổi giữa Ba Đình, Cầu Giấy, Đống Đa.
- Đăng nhập `EMPLOYEE` vào Tra cứu tồn kho chỉ thấy đúng chi nhánh phân công.
- Đơn hàng có `PointsRedeemed` trừ đúng điểm của khách hàng, unit tests pass 100%.
