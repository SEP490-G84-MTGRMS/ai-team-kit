# Design Brief: grn-form

## 1. Luồng người dùng (User Flows)
- **Luồng 1: Nhập kho từ lịch nhận hôm nay (Quick Receive from Today Delivery)**
  - Người dùng bấm nút "Nhập kho ngay" tại một phiếu có trạng thái `TODAY` trên màn hình GRN List.
  - Hệ thống điều hướng sang `/store-owner/goods-receipts/create?poCode=PO-20261009-001`.
  - Màn hình tự động tải đầy đủ: Chi nhánh nhận, Nhà cung cấp, danh sách mặt hàng đã đặt từ PO gốc.
- **Luồng 2: Tạo phiếu nhập kho chủ động từ Đơn PO đã chốt**
  - Người dùng bấm "+ Nhập kho từ PO" trên Header của GRN List.
  - Màn hình mở form tạo mới, dropdown PO liệt kê các đơn PO ở trạng thái `CONFIRMED` chưa nhập kho xong.
  - Khi chọn một đơn PO, bảng hàng hóa lập tức điền thông tin các mặt hàng.
- **Luồng 3: Kiểm đếm thực tế & Quản lý Lô FEFO**
  - Nhân viên dùng máy quét mã vạch hoặc gõ barcode/tên SKU vào ô tìm kiếm nhanh.
  - Nhập **Số lượng thực nhận**. Hệ thống tự động tính chênh lệch so với số lượng đặt.
  - Nhập **Mã Lô hàng (Batch No)** và chọn **Hạn sử dụng (EXP Date)**.
  - Nếu HSD < 30 ngày tính từ ngày nhận, hệ thống lập tức hiển thị badge cảnh báo màu cam/đỏ `⚠️ Sát HSD (<30 ngày)`.
- **Luồng 4: Phân bổ chi phí kèm theo (Landed Cost) & Thuế**
  - Nhập số tiền chi phí vận chuyển / bốc xếp (Landed Cost).
  - Nhập chiết khấu bổ sung từ NCC (nếu có) và phần trăm thuế VAT (0%, 5%, 8%, 10%).
  - Tổng giá trị phiếu nhập (Grand Total) tự động cập nhật thời gian thực.
- **Luồng 5: Hoàn tất & Đóng gói chứng từ**
  - Bấm **Lưu nháp (Draft)**: Lưu phiếu ở trạng thái tạm thời, cho phép quay lại kiểm đếm tiếp.
  - Bấm **Hoàn tất nhập kho (Confirmed)**:
    - Nếu đủ hàng và khớp 100%: Chuyển sang trạng thái `CONFIRMED`.
    - Nếu có chênh lệch thừa/thiếu: Hiển thị dialog xác nhận ghi nhận lệch, chuyển trạng thái sang `MISMATCH`.
  - Bấm **Nhập kho & In tem**: Hoàn tất nhập kho và hiển thị dialog xem trước in tem mã vạch/lô date.

## 2. Cấu trúc Component & Giao diện
```
src/features/goods-receipt/
├── pages/
│   ├── GoodsReceiptListPage.tsx       # Màn hình danh sách (đã hoàn thiện)
│   └── GoodsReceiptFormPage.tsx       # Màn hình Form lập phiếu nhập kho (MỚI)
├── components/
│   ├── GrnTable.tsx                   # Bảng danh sách phiếu (đã hoàn thiện)
│   ├── GrnFilterBar.tsx               # Bộ lọc danh sách (đã hoàn thiện)
│   ├── GrnDetailDrawer.tsx            # Drawer xem chi tiết phiếu (đã hoàn thiện)
│   ├── form/                          # CÁC COMPONENT FORM NHẬP KHO MỚI
│   │   ├── GrnFormHeaderCard.tsx      # Khối thông tin chung phiếu & NCC
│   │   ├── GrnProductEntryTable.tsx   # Bảng kiểm đếm hàng, quét barcode, lô FEFO
│   │   ├── GrnCostSummaryCard.tsx     # Khối ghi chú, Landed cost, chiết khấu, VAT, Grand total
│   │   ├── GrnFormActionBar.tsx       # Thanh nút hành động cố định chân trang
│   │   ├── GrnMismatchConfirmModal.tsx# Modal xác nhận lập biên bản chênh lệch
│   │   └── GrnPrintPreviewModal.tsx   # Modal xem trước in tem nhãn barcode & lô date
│   └── index.ts
├── lib/
│   └── mockGrnData.ts                 # Cập nhật danh sách PO hỗ trợ nhập kho
└── types/
    └── grn.types.ts                   # Mở rộng types cho Form state & Landed Cost
```

## 3. Trạng thái giao diện (UI States)
- **Normal / Editing State**: Các ô input số lượng, mã lô, date picker cho phép chỉnh sửa dễ dàng, hiển thị rõ ràng.
- **Mismatch State**: Cột Chênh lệch đổi màu cảnh báo nổi bật:
  - Nhận thiếu: Số âm màu đỏ (`-5`).
  - Nhận thừa: Số dương màu tím/cam (`+2`).
- **FEFO Alert State**: Badge `⚠️ Sát HSD (<30 ngày)` với nền cam viền vàng, thu hút sự chú ý của thủ kho.
- **Validation Error State**: Khi bấm Hoàn tất nhưng có dòng thiếu Mã lô hoặc HSD, dòng đó được viền đỏ và cuộn tới vị trí lỗi.
- **View-Only Mode (Xem phiếu đã chốt)**: Khi xem phiếu `CONFIRMED`, toàn bộ ô input chuyển sang dạng text/readonly, ẩn thanh hành động lưu/sửa.

## 4. Công thức tính toán tài chính (Formulas)
1. `differenceQty = receivedQty - orderedQty`
2. `lineTotal = receivedQty * unitPrice`
3. `goodsTotal = Sum(lineTotal)`
4. `subtotalAfterDiscount = goodsTotal - discountAmount + landedCost`
5. `vatAmount = subtotalAfterDiscount * (vatPercent / 100)`
6. `grandTotal = subtotalAfterDiscount + vatAmount`

## 5. Phân quyền (RBAC)
- **Nhân viên chi nhánh (Employee)**:
  - Chi nhánh nhận bị khóa cố định theo chi nhánh được phân công (ví dụ `BR-01`).
  - Người lập phiếu mặc định là tên nhân viên đang đăng nhập.
  - Có quyền Lưu nháp và Hoàn tất nhập kho.
- **Chủ cửa hàng (Store Owner)**:
  - Có toàn quyền chọn bất kỳ chi nhánh nào trong hệ thống (`BR-01`, `BR-02`, `DC-01`).
  - Có quyền xem lại toàn bộ phiếu nhập kho của mọi chi nhánh và chỉnh sửa chi phí vận chuyển Landed Cost.
