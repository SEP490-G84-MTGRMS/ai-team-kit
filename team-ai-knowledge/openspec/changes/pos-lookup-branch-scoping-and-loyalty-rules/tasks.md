# Kế hoạch thực hiện (Tasks): Phân quyền Tra cứu Chi nhánh & Hoàn thiện Tích - Tiêu Điểm FE-16

- [x] **T1 (Backend DTO & Service)**: Bổ sung `PointsRedeemed` vào `OrderCreateRequest` (`OrderDtos.cs`) và xử lý trừ điểm tích lũy của khách hàng (`customer.RewardPoints -= pointsToDeduct`) trước khi tích điểm mới trong `OrderService.cs`.
- [x] **T2 (Backend Unit Test)**: Viết unit test `REQ_FE16_RedeemRewardPoints_DeductsPointsAndEarnsNewPoints` trong `PosOrderServiceTests.cs` kiểm chứng tiêu điểm tích lũy và cập nhật tổng chi tiêu / điểm mới chính xác.
- [x] **T3 (Frontend POS Header)**: Xóa nút "Tra cứu Lô FEFO" khỏi thanh header bán hàng POS (`PosHeader.tsx`), thêm `onClick={(e) => e.stopPropagation()}` cho dropdown chi nhánh chống nhảy route ngoài ý muốn.
- [x] **T4 (Frontend Tra Cứu Tồn Kho)**: Nâng cấp `InventoryLookupPage.tsx` phân quyền chi nhánh theo vai trò: `STORE_OWNER` tự do chọn Ba Đình, Cầu Giấy, Đống Đa; `EMPLOYEE` bị khóa cứng theo chi nhánh công tác; hiển thị tên thu ngân thật từ auth store.
- [x] **T5 (Verification & Build)**: Kiểm thử toàn bộ hệ thống (`dotnet test` 353/353 PASS, `npm run build` PASS 0 lỗi).
