# Tasks: multi-branch-management

## 1. Backend APIs & Quota Enforcement
- [x] T1 — Bổ sung DTOs (`BranchQuotaDto`, `CreateBranchRequest`, `UpdateBranchRequest`, `UpdateBranchStatusRequest`) trong `BranchDtos.cs` (REQ-BR-01, REQ-BR-02, REQ-BR-03, REQ-BR-04).
- [x] T2 — Mở rộng `IBranchService.cs` và `BranchService.cs`: tính toán quota theo gói cước (`GetBranchQuotaAsync`), tạo mới chi nhánh kèm kiểm tra trần quota và trùng mã (`CreateBranchAsync`), cập nhật thông tin (`UpdateBranchAsync`), và bật/tắt hoạt động (`ToggleBranchStatusAsync`) (REQ-BR-01, REQ-BR-02, REQ-BR-03, REQ-BR-04).
- [x] T3 — Mở rộng `BranchesController.cs`: Thêm các endpoint `GET /api/v1/branches/quota`, `POST /api/v1/branches`, `PUT /api/v1/branches/{id}`, `PATCH /api/v1/branches/{id}/status` kèm kiểm tra quyền đa tenant (REQ-BR-01, REQ-BR-02, REQ-BR-03, REQ-BR-04).
- [x] T4 — Viết Unit Tests kiểm thử các use case quota, tạo mới chi nhánh, chặn trùng mã, chặn vượt quota trong `BranchManagementTests.cs` (REQ-BR-01, REQ-BR-02).

## 2. Frontend API Client & Navigation
- [x] T5 — Xây dựng client API `branchManagementApi.ts`: `getQuota()`, `getBranches()`, `createBranch()`, `updateBranch()`, `toggleStatus()` (REQ-BR-01, REQ-BR-02, REQ-BR-03, REQ-BR-04).
- [x] T6 — Bổ sung tab `Chi nhánh & Kho hàng` (`tab=branches`) vào `StoreSidebarNav.tsx` và đồng bộ điều hướng từ menu `AppTopNav.tsx` (REQ-BR-05).
- [x] T7 — Kết nối widget `Số chi nhánh` trên thanh trạng thái `StoreTopStatusBar.tsx` cho phép click chuyển nhanh sang tab quản lý chi nhánh (REQ-BR-05).

## 3. Frontend Components & Modals
- [x] T8 — Xây dựng thanh hạn mức chi nhánh trực quan `BranchQuotaBar.tsx` hiển thị số chi nhánh đã dùng / tối đa, thanh tiến độ phần trăm, và nút `+ Thêm chi nhánh` (REQ-BR-01, REQ-BR-05).
- [x] T9 — Xây dựng tab quản lý chi nhánh `BranchManagementTab.tsx` cho phép tìm kiếm theo từ khóa, lọc trạng thái, bảng danh sách chi nhánh kèm các nút hành động Sửa / Đổi trạng thái (REQ-BR-03, REQ-BR-04, REQ-BR-05).
- [x] T10 — Xây dựng hộp thoại `BranchFormModal.tsx` (Thêm/Sửa thông tin chi nhánh) và `BranchUpgradeModal.tsx` gợi ý nâng cấp gói cước khi người dùng đã đạt giới hạn chi nhánh (REQ-BR-02, REQ-BR-05).

## 4. Verification & Testing
- [x] T11 — Chạy kiểm thử tự động Backend (`dotnet test`) và Frontend (`npm test` vitest) đảm bảo không có lỗi regression.
- [x] T12 — Kiểm thử tương tác trực tiếp trên trình duyệt: thêm chi nhánh mới, sửa địa chỉ/SĐT chi nhánh, kiểm tra cảnh báo trần quota khi đạt giới hạn.
