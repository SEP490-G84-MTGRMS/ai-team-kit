# Tasks: pos-promotions-gift-db-and-cash-approval-sync

## Backend

- [x] T1 — Cập nhật `ShiftsController.cs`, `IShiftService.cs`, `ShiftService.cs` và `ShiftRepository.cs` hỗ trợ `Guid? branchId` tùy chọn trong `GetPendingMovements` để xem toàn bộ chi nhánh thuộc Tenant (REQ-POS-CASH-APPROVAL-MULTI-BRANCH-03)

## Frontend UI Components & Pages

- [x] T2 — Nâng cấp `StorePosCashControlPage.tsx` nạp danh sách chi nhánh thật từ CSDL qua `branchManagementApi.getBranches()`, xử lý chọn "Toàn bộ chi nhánh" (`ALL`) gọi API không truyền `branchId` (REQ-POS-CASH-APPROVAL-MULTI-BRANCH-03)
- [x] T3 — Cập nhật `PromotionModal.tsx` tích hợp tìm kiếm chọn sản phẩm tặng kèm từ danh mục kho hàng và chọn Đơn vị tính (`unit`) chuẩn (REQ-PROMO-PRODUCT-GIFT-PICKER-02)
- [x] T4 — Cập nhật `PromotionListPage.tsx` chuyển đổi đầy đủ mảng `tiers` thành `conditions` gửi lên Backend khi Tạo và Cập nhật; loại bỏ fallback mock data (REQ-PROMO-TIERS-CONDITIONS-01)
- [x] T5 — Nâng cấp `VoucherBatchTable.tsx` tự động gọi API `promotionApi.getVoucherCodes(batch.id)` nạp mã voucher thật từ CSDL khi mở rộng xem chi tiết đợt (REQ-VOUCHER-REAL-CODES-FETCH-04)
- [x] T6 — Bổ sung nút điều hướng "Về Dashboard Nhân Viên" trong Menu Hamburger và Topbar của `PosHeader.tsx` (REQ-EMPLOYEE-DASHBOARD-NAV-05)

## Verification & Testing

- [x] T7 — Chạy kiểm tra TypeScript và biên dịch Frontend (`npm run build`) đảm bảo 0 lỗi biên dịch (REQ-ALL)
- [x] T8 — Chạy toàn bộ Backend test suites (`dotnet test MT_GRMS_BACKEND.sln`) xác nhận 100% test cases thành công (REQ-ALL)
