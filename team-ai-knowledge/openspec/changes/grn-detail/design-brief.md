# Design Brief: grn-detail

## 1. Luồng trải nghiệm người dùng (User Flows)
1. **Luồng A: Rà soát & Duyệt phiếu nhập kho (Confirmation Flow từ DRAFT)**:
   - Người dùng từ `grn-form` sau khi kiểm đếm xong bấm "Xác nhận tổng quan", hoặc từ `grn-list` bấm vào phiếu trạng thái `DRAFT`.
   - Hệ thống mở màn hình `GoodsReceiptDetailPage` ở chế độ **Confirmation Mode**.
   - Người dùng rà soát:
     - Tổng tiền hàng và chi phí vận chuyển phân bổ (Landed Cost).
     - Danh sách lô FEFO và biên lợi nhuận (Margin %) của từng mặt hàng.
     - Nếu có hàng thiếu: chọn hướng xử lý cho từng dòng (`backorder` để NCC giao bù hoặc `cancel` để hủy phần thiếu). Xem trước trạng thái đơn PO (`PARTIALLY_RECEIVED` hay `COMPLETED`).
     - Chọn tạo công nợ AP và in tem mã vạch.
   - Người dùng bấm **HOÀN TẤT & DUYỆT NHẬP KHO**:
     - Hệ thống cập nhật trạng thái phiếu thành `CONFIRMED`.
     - Hiển thị banner / modal thông báo thành công với tóm tắt các tác vụ đã thực thi (Cộng kho, Lưu lô FEFO, Ghi nhận nợ AP, In tem) kèm các link điều hướng nhanh.

2. **Luồng B: Xem chi tiết phiếu đã hoàn tất (Detail View Flow từ CONFIRMED)**:
   - Người dùng từ `grn-list` click vào mã phiếu `GRN-YYYYMMDD-XXX` đã hoàn tất.
   - Hệ thống mở `GoodsReceiptDetailPage` ở chế độ **Detail Mode**.
   - Mọi thông tin được hiển thị dạng Read-Only với đầy đủ thông tin: Mã Lô, HSD, người duyệt, chứng từ đính kèm.
   - Thanh công cụ cung cấp các hành động: "In phiếu nhập kho", "In tem mã vạch", "Quay lại danh sách".

## 2. Kiến trúc Component & Giao diện
```
GoodsReceiptDetailPage (Container)
 ├── Page Header (Tiêu đề, breadcrumb, role switch pill, badge trạng thái phiếu)
 ├── GrnDetailHeaderCard (Thông tin chung, chi nhánh, NCC, PO, Tổng tiền, Landed Cost, Nợ AP)
 ├── GrnStockFefoTable (Bảng Tồn kho sẽ cộng & Quản lý lô FEFO, Landed Cost/ĐVT, Giá vốn mới, Margin %)
 ├── GrnPoRemainingTable (Bảng Cập nhật trạng thái PO, radio backorder/cancel, preview trạng thái PO)
 ├── GrnPostSettingsCard (Checkbox tạo nợ AP, checkbox in tem dán kệ, xem file đính kèm)
 ├── Actions Footer (Quay lại sửa, Hoàn tất & duyệt nhập kho, In ấn)
 └── Modals (GrnPrintPreviewModal, Modal thông báo duyệt thành công)
```

## 3. Quy tắc tính toán & Nghiệp vụ
1. **Phân bổ chi phí vận chuyển (Landed Cost Allocation)**:
   - `LandedCostPerUnit = TotalLandedCost / TotalReceivedUnits` (nếu tổng số lượng nhận > 0).
   - `NewUnitCost = BaseUnitPrice + LandedCostPerUnit`.
   - `MarginPercent = RetailPrice > 0 ? ((RetailPrice - NewUnitCost) / RetailPrice) * 100 : 0`.
2. **Xử lý lượng thiếu đơn PO (Remaining Handling)**:
   - Với mỗi dòng có `receivedQty < orderedQty`:
     - Nếu chọn `backorder`: Đơn PO tiếp tục duy trì để nhận hàng đợt sau.
     - Nếu chọn `cancel`: Đóng phần thiếu của dòng này.
   - Trạng thái tổng thể PO:
     - `COMPLETED`: Khi 100% dòng sản phẩm đã nhận đủ HOẶC các dòng thiếu đều chọn `cancel`.
     - `PARTIALLY_RECEIVED`: Khi có ít nhất 1 dòng thiếu chọn `backorder`.
3. **Tự động sinh tem mã vạch dán kệ**:
   - `TotalLabels = Sum(receivedQty)` (làm tròn số nguyên đối với hàng đóng gói/hộp/lon; với hàng cân ký làm tròn ceil hoặc 1 tem/mẻ).

## 4. Trạng thái hiển thị (Loading / Empty / Error)
- **Loading**: Skeleton placeholder khi tải dữ liệu phiếu từ ID.
- **Empty / Not Found**: Card thông báo "Không tìm thấy phiếu nhập kho với mã này" kèm nút quay về danh sách.
- **Role Scoping**:
  - Store Owner: Xem và duyệt phiếu của mọi chi nhánh (`ALL`).
  - Employee: Chỉ được xem và duyệt phiếu của chi nhánh mình trực thuộc (nếu mở phiếu chi nhánh khác, hiển thị thông báo quyền hạn).
