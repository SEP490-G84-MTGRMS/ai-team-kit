# Exploration: inter-branch-transfer-ui (FE-15 Inter-Branch Inventory Transfer)

- Change ID: `inter-branch-transfer-ui`
- Capability: `transfer`
- Project: MT-GRMS
- Date: 2026-10-13

---

## 1. Hiện trạng & Bối cảnh
Hệ thống bán lẻ đa chi nhánh MT-GRMS hiện đã có `StoreOwnerLayout`, `AppTopNav` (thanh điều hướng hai tầng), các module `product`, `supplier`, `purchase-order`, `service-expenses`.
Tại phân hệ kho, quy trình điều chuyển hàng hóa liên chi nhánh (**FE-15**) chưa có giao diện trên web quản trị tại `/dashboard/transfers` và `/store-owner/transfers`.
Nghiệp vụ chuyển hàng đòi hỏi sự phối hợp chặt chẽ giữa 3 chủ thể: Kho xuất (Gửi), Hệ thống (Trừ tồn kho ngay & quản lý In-Transit), và Kho nhập (Nhận, kiểm đếm, ghi nhận chênh lệch vào sổ hao hụt).

---

## 2. Giả định
1. Mỗi người dùng làm việc đều có ngữ cảnh chi nhánh làm việc (`CurrentBranchId` & `CurrentBranchName`).
2. Mã phiếu chuyển được tự động sinh theo định dạng chuẩn `TRFxxxxxx` (ví dụ: `TRF000001`).
3. Sản phẩm có quản lý theo Lô và Hạn sử dụng (`FEFO`) bắt buộc phải chọn đúng số lô còn tồn kho tại chi nhánh gửi.
4. Chi nhánh nhận khi nhận hàng có thể nhận đủ 100% hoặc phát sinh chênh lệch; nếu chênh lệch thiếu/hư hỏng thì bắt buộc phải nhập lý do giải trình (`Discrepancy Note`).
5. Chỉ kho gửi hoặc Store Owner mới có quyền hủy phiếu chuyển đang ở trạng thái `Draft` hoặc `In-Transit`; chi nhánh nhận không được phép hủy phiếu của kho khác ([BR-TRF-06](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4771)). Khi hủy thành công, tồn kho và số lô tự động rollback 100% về kho gửi ([BR-TRF-05](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4770)).

---

## 3. Các Phương án Kỹ thuật

### Phương án A: Module hóa theo Feature `src/features/transfer` tích hợp vào Router hiện có (Được chọn)
- Cấu trúc thư mục:
  - `src/features/transfer/types/index.ts`: Data types cho TransferOrder, TransferItem, BatchItem, Branch.
  - `src/features/transfer/services/mockData.ts`: Dữ liệu mẫu chuẩn sát thực tế khớp các màn hình thiết kế HTML (`TRF000001`, `TRF000002`, `TRF000003`...).
  - `src/features/transfer/components/`:
    - `TransferTable.tsx`: Bảng dữ liệu phiếu chuyển với trạng thái màu sắc chuẩn.
    - `TransferFilterSidebar.tsx`: Bộ lọc chi nhánh gửi/nhận, trạng thái, thời gian, tình trạng nhận.
    - `SelectBatchModal.tsx`: Hộp thoại chọn số lô và hạn sử dụng FEFO.
    - `CancelTransferModal.tsx`: Hộp thoại xác nhận hủy phiếu kèm nhập lý do và cảnh báo rollback.
    - `ImportTransferExcelModal.tsx`: Hộp thoại tải file mẫu và import hàng loạt.
  - `src/features/transfer/pages/`:
    - `TransferListPage.tsx`: Màn hình danh sách phiếu.
    - `CreateTransferPage.tsx`: Màn hình lập phiếu xuất chuyển hàng.
    - `ReceiveTransferPage.tsx`: Màn hình kiểm đếm và xác nhận nhận hàng.
    - `TransferDetailPage.tsx`: Màn hình chi tiết 360 độ và biên bản bàn giao.
  - `src/features/transfer/transfer.css`: Phong cách chuẩn KiotViet Deep Teal `#0F766E`, bo tròn 24–28px, phông chữ `Be Vietnam Pro`.
- **Ưu điểm:** Tái sử dụng tối đa hạ tầng layout sẵn có, kiến trúc rõ ràng, tương thích 100% Vite build & TypeScript.

### Phương án B: Ghép chung vào phân hệ Inventory (FE-02)
- **Nhược điểm:** Làm phình to module kho, khó bảo trì và vi phạm tính đơn trách nhiệm của phân hệ FE-15.

---

## 4. Phân tích Rủi ro & Giải pháp
1. **Rủi ro chọn trùng chi nhánh gửi và chi nhánh nhận:**
   - *Giải pháp:* Tự động lọc danh sách dropdown chi nhánh nhận, loại bỏ chi nhánh gửi hiện tại; nếu cố tình chọn cùng chi nhánh thì hiển thị thông báo lỗi in-line và khóa nút xuất hàng.
2. **Rủi ro xuất vượt số lượng tồn kho khả dụng:**
   - *Giải pháp:* Đối soát tức thì `AvailableQty = OnHandQty - CommittedQty`; bôi đỏ dòng thiếu tồn và vô hiệu hóa nút xuất chuyển `In-Transit`.
3. **Rủi ro hàng hư hại trên đường không được đối soát:**
   - *Giải pháp:* Tại màn hình `ReceiveTransferPage`, tính toán số lượng thất thoát `DamagedQty = SentQty - ReceivedQty`; bắt buộc nhập ghi chú giải trình trước khi cho phép bấm hoàn tất.
