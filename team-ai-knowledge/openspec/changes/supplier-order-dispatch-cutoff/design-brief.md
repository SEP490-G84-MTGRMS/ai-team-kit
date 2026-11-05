# Design Brief: supplier-order-dispatch-cutoff

## 1. Luồng Người Dùng Mới (User Flow)

```
[Bảng lưới Order Matrix / Chi nhánh]
        │
        ▼ (Sau khi hoàn thiện số lượng hoặc mở từ menu Mua hàng)
[MÀN HÌNH: DISPATCH HUB - TRUNG TÂM CHỐT ĐƠN & PHÁT HÀNH PO]
(/store-owner/purchase-orders/dispatch-hub)
        │
        ├──► [Khu vực 1: Top Urgency Bar]
        │       - Thống kê toàn hệ thống: Tổng NCC có đơn nháp | Tổng tiền | Cảnh báo deadline (< 2h 🔴)
        │       - Hành động nhanh: [ ⚡ Chốt nhanh các đơn hết hạn hôm nay ]
        │
        ├──► [Khu vực 2: Filter Toolbar]
        │       - Lọc theo Tab: [Tất cả] [🔴 Cần chốt gấp] [Hôm nay] [Đợt tới] [Đã chốt]
        │       - Tìm kiếm nhanh NCC theo tên/mã
        │
        └──► [Khu vực 3: Danh sách Thẻ NCC]
                │
                └─► [Thẻ NCC]: Hiển thị hạn Cutoff, MOV, tổng tiền, nút [Chốt đơn] và link sang Order Matrix
                        │
                        ▼ (Bấm "Chốt đơn" hoặc "Chốt nhanh")
                [GỌI API PREVIEW KHÔNG LƯU DB: POST /matrix/split/preview]
                        │
                        ▼
                [MODAL XÁC NHẬN CHỐT ĐƠN NCC (CĂN GIỮA, FIXED, Z-INDEX 99999)]
                - Segmented Scope Selector: [ Ngày giao gần nhất (NEAREST) ] | [ Cả tuần T2–CN (WEEK) ]
                - 4 Summary Cards: Tổng số PO dự kiến | Số chi nhánh | Tổng SKU | Tổng giá trị dự kiến
                - Bảng Preview 6 cột tinh gọn: Chi nhánh | Ngày giao | Số SKU | SL đặt | Giá trị | Trạng thái
                  (KHÔNG CÓ dropdown mũi tên mở rộng sản phẩm chi tiết)
                - Bảng cảnh báo bỏ qua (Skipped Groups): Quá cutoff / Đã chốt trước / Thiếu thông tin
                - Textarea: Ghi chú gửi nhà cung cấp
                - Sticky Footer: Nút [ Hủy ] và Nút [ Chốt ngày giao gần nhất / Chốt đơn cả tuần ]
                        │
                        ▼ (Store Owner bấm xác nhận)
                [GỌI API CHỐT THẬT: POST /matrix/split (Batch Split)]
                        │
                        ├── Backend truy vấn trực tiếp DB Draft Matrix (FinalQty = StoreQty ?? EmployeeQty)
                        ├── Kiểm tra độc lập từng group (BranchId + DeliveryDate)
                        └── Phân rã 1 PO = 1 Branch + 1 Supplier + 1 DeliveryDate (Partial Success)
                        │
                        ▼
                [KẾT QUẢ & TOAST THÔNG BÁO]
                - Hiển thị số PO tạo thành công và danh sách group bị bỏ qua/lỗi (nếu có).
                - Refresh lại danh sách Dispatch Hub và Matrix.
```

## 2. Thiết Kế Màn Hình & Kiến Trúc Component

### 2.1. Cấu trúc Component Frontend
- **`SupplierOrderDispatchHubPage.tsx`**: Trang chính quản lý state danh sách đơn draft theo NCC, filter, gọi preview và execute split batch.
- **`DispatchUrgencyBar.tsx`**: Thanh cảnh báo khẩn cấp đầu trang:
  - Khối thống kê: Tổng NCC draft, tổng tiền, tổng SKU.
  - Khối deadline badges: 🔴 Sắp hết hạn (< 2h) | 🟡 Trong hôm nay | ⚪ Đợt tới trong tuần.
  - Nút hành động nhanh: `[ ⚡ Chốt nhanh các đơn hết hạn hôm nay ]`.
- **`DispatchFilterBar.tsx`**: Thanh lọc tab pills và tìm kiếm:
  - Tab pills: Tất cả, Cần chốt gấp, Hôm nay, Đợt tới, Đã chốt.
  - Ô search input: Tìm theo tên NCC, mã NCC hoặc nhóm sản phẩm.
- **`SupplierDispatchCard.tsx`**: Thẻ tóm tắt thông tin NCC:
  - Header: Huy hiệu mức độ khẩn cấp (URGENT / TODAY / LATER / COMPLETED), tên NCC, tag phân loại.
  - Metas: ⏰ Cutoff time với countdown đếm ngược; 🚚 Ngày giao dự kiến; 📦 Số SKU & Tổng SL; 💰 Tổng tiền.
  - Cảnh báo MOV: Nếu chưa đạt thì hiển thị cảnh báo cam `Chưa đạt đơn tối thiểu 1.000.000 đ`.
  - Action buttons: [Xem chi tiết ma trận đặt hàng] (deep-link sang OrderMatrixPage) và [Chốt đơn NCC] (mở DispatchConfirmModal).
- **`DispatchConfirmModal.tsx`**: Modal xác nhận chốt đơn NCC tập trung:
  - Định vị `fixed inset-0 z-[99999]` căn giữa màn hình với backdrop mờ tối, bo góc và bóng đổ nổi bật.
  - Scope Selector: Segmented Control chọn giữa `NEAREST` và `WEEK`.
  - 4 Cards Metrics: Tổng số PO dự kiến, Số chi nhánh có đơn, Tổng SKU, Tổng giá trị dự kiến (cảnh báo nếu thiếu giá).
  - Preview Table: Bảng 6 cột rõ ràng (`Chi nhánh`, `Ngày giao`, `Số SKU`, `SL đặt`, `Giá trị dự kiến`, `Trạng thái`). Đã loại bỏ hoàn toàn icon mũi tên mở rộng và danh sách sản phẩm con bên dưới từng dòng.
  - Skipped Groups Panel: Hiển thị các group bị bỏ qua và lý do rõ ràng.
  - Textarea: Ghi chú gửi NCC đính kèm các PO tạo thành công.
  - Sticky Footer: Nút Hủy và Nút Submit hành động với loading spinner và chống double-click.

### 2.2. Kiến Trúc Backend (ASP.NET Core)
- **`PreviewSplitMatrixPoAsync`**:
  - Nhận `SupplierId`, `Scope`, `ReferenceDate`, `BranchIds`.
  - Đọc toàn bộ draft details của NCC trong phạm vi ngày yêu cầu.
  - Nhóm theo `(BranchId, DeliveryDate)`.
  - Kiểm tra Cutoff (`OrderMatrixRules.CalculateCutoff`), lịch làm việc của NCC, trạng thái đã chốt.
  - Trả về DTO preview đầy đủ mà không thay đổi bất kỳ record nào trong DB.
- **`SplitMatrixPoBatchAsync`**:
  - Tái sử dụng cùng logic lọc và gom nhóm như Preview.
  - Với mỗi group hợp lệ:
    - Sinh mã PO duy nhất theo convention `PO-yyyyMMdd-XXXXX`.
    - Tạo `PurchaseOrder` với `Status = COMMITTED`, `ParentDraftId`, `BranchId`, `SupplierId`, `DeliveryDate`, `Note`.
    - Tạo các `PurchaseOrderDetail` với `FinalQty = detail.StoreQty ?? detail.EmployeeQty ?? 0`.
    - Trừ hoặc đánh dấu các cell draft tương ứng.
    - Ghi nhận `SUCCESS`.
  - Với các group không hợp lệ: Ghi nhận `SKIPPED` hoặc `FAILED` mà không làm gián đoạn các group khác.
  - Trả về `SplitMatrixBatchResultDto`.

## 3. Quy Tắc Nghiệp Vụ Bất Biến (Invariant Business Rules)
1. **1 PO = 1 Branch + 1 Supplier + 1 DeliveryDate**: Không tạo PO gộp nhiều ngày, không tạo PO gộp nhiều chi nhánh.
2. **Nguồn dữ liệu DB Draft**: Không nhận số lượng từ client gửi lên để ngăn chặn dữ liệu cũ hoặc gian lận.
3. **Partial Success**: Không dùng 1 transaction lớn bao phủ toàn bộ batch khiến 1 lỗi nhỏ làm hủy đơn của tất cả các chi nhánh khác. Mỗi group xử lý riêng biệt an toàn.
4. **Múi giờ chuẩn**: Sử dụng múi giờ `Asia/Ho_Chi_Minh` cho toàn bộ các phép tính ngày bắt đầu tuần (Thứ Hai 00:00:00) và kết thúc tuần (Chủ nhật 23:59:59).
