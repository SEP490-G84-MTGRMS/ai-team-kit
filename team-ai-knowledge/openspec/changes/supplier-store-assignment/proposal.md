# Proposal: supplier-store-assignment (Refactor Popup Phân Bổ Chi Nhánh - NCC)

## 1. Vấn đề & Lý do Refactor
Hiện tại, popup phân bổ ở màn hình `/store-owner/suppliers/branches` đang theo hướng: "Chọn 1 nhà cung cấp → phân bổ cho nhiều chi nhánh".
Tuy nhiên, trong thực tế vận hành chuỗi siêu thị tạp hóa MT-GRMS:
1. **Quy trình ngược với tư duy quản lý cửa hàng**: Mỗi khi mở một cửa hàng mới hoặc cần bổ sung nguồn hàng cho một chi nhánh, Quản lý cửa hàng / Store Owner có nhu cầu "Chọn cửa hàng này → tìm và gán hàng loạt nhà cung cấp phù hợp".
2. **Khó kiểm soát trùng lặp**: Khi chọn 1 NCC rồi gán nhiều chi nhánh, người dùng rất khó biết chi nhánh nào đã có NCC này hay chưa, dẫn đến việc chọn nhầm và lỗi ràng buộc dữ liệu.
3. **Giải pháp tối ưu**: Refactor popup sang luồng **"Chọn 1 chi nhánh → thêm nhiều nhà cung cấp cho chi nhánh đó"**. Khi chọn chi nhánh trước:
   - Hệ thống tự động lọc và loại bỏ hoàn toàn những NCC đã được gán hoặc đang Inactive tại chi nhánh đó.
   - Tránh trùng lặp quan hệ Branch-Supplier, mang lại trải nghiệm mượt mà và trực quan hơn.

---

## 2. Mục tiêu Nghiệp Vụ
1. **Quan hệ Nhiều - Nhiều (Many-to-Many) Chuẩn Xác**:
   - Một chi nhánh có thể được gán nhiều NCC.
   - Một NCC có thể phục vụ nhiều chi nhánh.
   - Mỗi cặp `(BranchId, SupplierId)` chỉ tồn tại duy nhất 1 bản ghi trong cùng một Tenant.
   - NCC đã gán cho Chi nhánh A thì không xuất hiện trong danh sách khả dụng của Chi nhánh A, nhưng vẫn có thể gán cho Chi nhánh B nếu chưa có liên kết.
2. **Tái Cấu Trúc Bố Cục Popup Mới**:
   - **Bước 1**: Chọn cửa hàng / chi nhánh từ dropdown (hiển thị mã + tên chi nhánh).
   - **Bước 2**: Chọn danh sách nhà cung cấp khả dụng:
     * Ô tìm kiếm tức thời theo Mã hoặc Tên NCC (không phân biệt hoa/thường).
     * Checkbox chọn từng NCC hoặc "Chọn tất cả" các NCC đang hiển thị khả dụng.
     * Hiển thị đếm số lượng: *"Đã chọn: X nhà cung cấp"*.
     * Empty state rõ ràng khi không có NCC khả dụng hoặc không tìm thấy kết quả.
   - **Nút hành động**: "Hủy" (không lưu gì) và "Lưu phân bổ" (all-or-nothing transaction).
3. **Xử lý Toàn Diện 4 Nhóm Validation**:
   - **Nhóm A (Chi nhánh)**: BR-01 (bắt buộc chọn), BR-02 (chặn chi nhánh inactive), BR-03 (tenant validation), BR-04 (đổi chi nhánh -> reset lựa chọn NCC).
   - **Nhóm B (Nhà cung cấp)**: SUP-01 (chọn ít nhất 1 NCC), SUP-02 (ẩn NCC đã gán), SUP-03 (ẩn NCC inactive), SUP-04 (kiểm tra tồn tại), SUP-05 (hỗ trợ multi-select), SUP-06 (empty state), SUP-07 (search empty).
   - **Nhóm C (Lưu phân bổ)**: MAP-01 (loại bỏ trùng ID), MAP-02 (chống race-condition đồng thời qua Unique Index), MAP-03 & MAP-04 (kiểm tra trạng thái trước khi commit), MAP-05 (nguyên tắc all-or-nothing), MAP-06 (chống double click), MAP-07 (xử lý lỗi mạng an toàn).
   - **Nhóm D (Thao tác UI)**: Check all chỉ áp dụng cho danh sách lọc, realtime count badge, disable nút khi đang lưu.
4. **Backend API & Data Persistence**:
   - Endpoint lấy danh sách NCC khả dụng cho chi nhánh: `GET /api/v1/branches/{branchId}/available-suppliers` hoặc qua query filter.
   - Endpoint lưu phân bổ nhiều NCC cho chi nhánh: `POST /api/v1/suppliers/branches/{branchId}/suppliers` hoặc `POST /api/v1/suppliers/branch-assignments/batch-to-branch` nhận `{ branchId, supplierIds: [] }`.
   - Cơ chế tái kích hoạt (Re-activation): Nếu cặp `(BranchId, SupplierId)` đã từng tồn tại trong DB nhưng ở trạng thái `Inactive`, tự động chuyển lại thành `Active` thay vì cố insert bản ghi mới gây trùng Unique Key.

---

## 3. Phạm vi (Scope)
- **Frontend**:
  - Refactor component [AssignBranchModal.tsx](file:///d:/FPT%20UNIVERSITY/FALL_2026_SEASON9/SEP490/sep490-repo/MT_GRMS_FRONTEND/src/features/supplier/components/branches/AssignBranchModal.tsx) thành popup "Thêm nhà cung cấp cho cửa hàng".
  - Cập nhật [supplierBranchApi.ts](file:///d:/FPT%20UNIVERSITY/FALL_2026_SEASON9/SEP490/sep490-repo/MT_GRMS_FRONTEND/src/features/supplier/api/supplierBranchApi.ts) bổ sung API lấy NCC khả dụng và gán nhiều NCC theo chi nhánh.
  - Cập nhật [SupplierBranchManagementPage.tsx](file:///d:/FPT%20UNIVERSITY/FALL_2026_SEASON9/SEP490/sep490-repo/MT_GRMS_FRONTEND/src/features/supplier/pages/SupplierBranchManagementPage.tsx).
- **Backend**:
  - API Controller, Service, Repository hỗ trợ gán danh sách NCC cho 1 Chi nhánh và lấy danh sách NCC khả dụng cho 1 chi nhánh.
  - Xử lý tái kích hoạt bản ghi cũ (`Status = Active`) và bảo đảm tính toàn vẹn giao dịch (Atomic Transaction).
  - Viết Unit Tests kiểm thử đầy đủ các kịch bản BR-01..04, SUP-01..07, MAP-01..07.
