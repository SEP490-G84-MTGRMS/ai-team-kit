# Danh sách công việc (Tasks) — pos-owner-order-cashier-and-branch-fixes

- [ ] T1: Bổ sung cột `CashierName` trong DDL `DbInitializer.cs` và thuộc tính `CashierName` trong Domain Entity `Order.cs` [REQ-POS-ORDER-CASHIER-SNAPSHOT-04]
- [ ] T2: Bổ sung trường `CashierName` vào DTO `OrderResponse` (`OrderDtos.cs`), cập nhật logic lưu snapshot và map trong `OrderService.cs` [REQ-POS-ORDER-CASHIER-SNAPSHOT-04]
- [ ] T3: Cập nhật `PosHeader.tsx` ẩn nút "Lịch sử ca cửa hàng" trong dropdown khi đăng nhập với vai trò Chủ cửa hàng (`STORE_OWNER`) [REQ-POS-OWNER-HEADER-01]
- [ ] T4: Cập nhật `InvoiceManagementPage.tsx` nạp danh sách chi nhánh thực tế qua `employeeApi.getBranches()`, hiển thị đúng tên chi nhánh thực tế và mặc định `branchFilter = 'ALL'` cho Chủ cửa hàng [REQ-POS-BRANCH-NAME-02, REQ-POS-OWNER-MULTI-BRANCH-03]
- [ ] T5: Sửa mapping hiển thị cột Người tạo trong `InvoiceManagementPage.tsx` dùng `o.cashierName || 'Thu ngân POS'`, loại bỏ hoàn toàn fallback `user?.fullName` [REQ-POS-ORDER-CASHIER-SNAPSHOT-04]
- [ ] T6: Chạy kiểm thử tự động Backend (`dotnet test`), build kiểm tra Frontend (`npm run build`) và đối soát toàn diện [REQ-POS-OWNER-HEADER-01, REQ-POS-BRANCH-NAME-02, REQ-POS-OWNER-MULTI-BRANCH-03, REQ-POS-ORDER-CASHIER-SNAPSHOT-04]
