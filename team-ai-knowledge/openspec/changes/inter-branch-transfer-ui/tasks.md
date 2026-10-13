# Tasks: inter-branch-transfer-ui (FE-15 Inter-Branch Inventory Transfer)

## 1. Domain Types & Mock Data Contract
- [ ] T1 — Khởi tạo Data Types, DTOs & Mock Service (`src/features/transfer/types/index.ts`, `src/features/transfer/services/mockData.ts`) (REQ-01 -> REQ-06)

## 2. Shared Modals & Utilities
- [ ] T2 — Xây dựng các Modal hỗ trợ: `SelectBatchModal.tsx` (chọn lô date FEFO), `CancelTransferModal.tsx` (xác nhận hủy kèm rollback), `ImportTransferExcelModal.tsx` (nhập file mẫu Excel) (REQ-02, REQ-03, REQ-05)

## 3. Sidebar & Filter Components
- [ ] T3 — Xây dựng `TransferFilterSidebar.tsx` lọc theo chi nhánh gửi/nhận, trạng thái, thời gian và tình trạng khớp/lệch (REQ-01)

## 4. Transfer List Screen
- [ ] T4 — Xây dựng Màn hình Danh sách Phiếu chuyển hàng (`TransferListPage.tsx`) theo prototype `transfer_management.html` với toolbar tìm kiếm, bộ lọc đa chiều và phân quyền chi nhánh (REQ-01)

## 5. Create Transfer Screen
- [ ] T5 — Xây dựng Màn hình Lập phiếu Chuyển hàng (`CreateTransferPage.tsx`) theo prototype `create_transfer.html`: chọn kho nhận (chặn trùng), quét barcode, chọn lô FEFO, kiểm tra tồn kho khả dụng, trừ kho gửi ngay khi xuất chuyển (REQ-02, REQ-03)

## 6. Receive & Check Screen
- [ ] T6 — Xây dựng Màn hình Xác nhận Nhập kho (`ReceiveTransferPage.tsx`) theo prototype `receive_transfer.html`: tab phân loại Khớp/Lệch, nút "Nhận đủ tất cả", bắt buộc giải trình chênh lệch, cập nhật tồn kho nhận và sổ hao hụt (REQ-04)

## 7. 360 Detail View & Actions
- [ ] T7 — Xây dựng Màn hình Chi tiết 360 độ (`TransferDetailPage.tsx`) theo prototype `transfer_detail.html`: Timeline vận chuyển, danh mục hàng chuyển vs nhận, tác vụ ngữ cảnh và in chứng từ (REQ-01, REQ-04, REQ-05)

## 8. Routing, Layout Integration & Verification
- [ ] T8 — Tích hợp module vào `StoreOwnerLayout`, gắn link trong `AppTopNav.tsx` (Menu "Chuyển hàng" / "Điều chuyển kho") và cấu hình route trong `router.tsx`, chạy `npm run build` xác minh không lỗi (REQ-01 -> REQ-06)
