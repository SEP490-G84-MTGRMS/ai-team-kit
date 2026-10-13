# Design Brief: supplier-order-dispatch-cutoff

## 1. Luồng Người Dùng (User Flow)

```
[Bảng lưới Order Matrix / Chi nhánh]
        │
        ▼ (Sau khi lên số lượng hoặc truy cập từ menu Mua hàng)
[MÀN HÌNH: TRUNG TÂM CHỐT ĐƠN & TÁCH PO THEO NCC]
(/store-owner/purchase-orders/dispatch-hub)
        │
        ├──► [Khu vực 1: Top Urgency Bar]
        │       - Nhìn nhanh: 8 NCC draft | 45.2M đ | 🔴 2 NCC sắp cutoff (< 2h)
        │       - Action: Bấm [ ⚡ Chốt nhanh các đơn hết hạn hôm nay (2) ]
        │
        ├──► [Khu vực 2: Filter & Grouping Toolbar]
        │       - Chuyển tab: [Tất cả (8)] [🔴 Cần chốt gấp (2)] [Hôm nay (3)] [Đợt tới (3)] [Đã gửi PO]
        │       - Tìm kiếm theo tên NCC / ngành hàng
        │
        └──► [Khu vực 3: Danh sách Thẻ NCC (Accordion 2 tầng)]
                │
                ├─► [Tầng 1: Summary Card]
                │     - Tên NCC, Tag hàng, Giờ Cutoff & Countdown timer (còn 45p 🔴)
                │     - Ngày giao dự kiến, Số SKU, Tổng SL, Tổng tiền
                │     - Cảnh báo MOV (Đạt / Chưa đạt tối thiểu)
                │     - Action: [ Xem chi tiết SKU ] hoặc [ Chốt & Tạo PO ]
                │
                └─► [Tầng 2: Chi tiết SKU khi mở rộng]
                      - Bảng SKU: Tên, ĐVT, Đơn giá, Input sửa SL inline, Thành tiền, Trạng thái cutoff
                      - Nhập ô Ghi chú riêng cho NCC (VD: "Giao trước 7h sáng giúp quán")
                      - Nút [ Chốt & Gửi PO Ngay ]
                                │
                                ▼
                        [Modal Xác nhận Phát hành PO]
                        - Tóm tắt NCC, Ngày giao, Kênh gửi, Tổng tiền
                        - Bấm [ Xác nhận & Phát hành PO ]
                                │
                                ▼
                        Chuyển thẻ sang trạng thái "Đã chốt / Đã gửi PO" (Tag xanh)
```

## 2. Thiết Kế Màn Hình & Kiến Trúc Component

### 2.1. Cấu trúc Component
- **`SupplierOrderDispatchHubPage.tsx`**: Trang chính quản lý state danh sách đơn draft theo NCC, filter, logic chốt đơn đơn lẻ & hàng loạt.
- **`DispatchUrgencyBar.tsx`**: Thanh cảnh báo khẩn cấp đầu trang:
  - Khối thống kê: Tổng NCC draft, tổng tiền, tổng SKU.
  - Khối deadline badges: 🔴 Sắp hết hạn (< 2h) | 🟡 Trong hôm nay | ⚪ Đợt tới trong tuần.
  - Nút hành động nhanh: `[ ⚡ Chốt nhanh các đơn hết hạn hôm nay ]`.
- **`DispatchFilterBar.tsx`**: Thanh lọc tab pills và tìm kiếm:
  - Tab pills: Tất cả, Cần chốt gấp, Hôm nay, Đợt tới, Đã chốt.
  - Ô search input: Tìm theo tên NCC, mã NCC hoặc nhóm sản phẩm.
  - Dropdown chọn chi nhánh (nếu Store Owner muốn lọc theo chi nhánh).
- **`SupplierDispatchCard.tsx`**: Thẻ NCC Accordion 2 tầng:
  - Header: Huy hiệu mức độ khẩn cấp (URGENT / TODAY / LATER / COMPLETED), tên NCC, tag phân loại.
  - Metas: ⏰ Cutoff time với countdown đếm ngược sống động; 🚚 Ngày giao dự kiến; 📦 Số SKU & Tổng SL; 💰 Tổng tiền.
  - Cảnh báo MOV: Nếu chưa đạt thì hiển thị thanh tiến độ / cảnh báo cam `Chưa đạt đơn tối thiểu 1.000.000 đ (Hiện tại: 850.000 đ)`.
  - Body (Accordion): Bảng mini SKU với input số lượng cho phép chỉnh sửa inline, tự động re-calculate tổng tiền và MOV. Input ghi chú NCC.
- **`DispatchConfirmModal.tsx`**: Modal xác nhận trước khi phát hành PO độc lập:
  - Thông tin NCC, Mã PO dự kiến (VD: `PO-20261014-SUP001`), Ngày giao hàng, Kênh gửi (Email / Zalo / B2B), Bảng tóm tắt danh sách mặt hàng, Tổng giá trị PO.
  - Nút Hủy và Nút "Xác nhận & Phát hành Purchase Order".

### 2.2. Dữ liệu Mô phỏng (Mock Data Model)
- `SupplierDispatchGroup`:
  - `id`: string (ID NCC)
  - `code`: string (Mã NCC, VD: SUP-01)
  - `name`: string (Tên NCC)
  - `categoryTags`: string[] (Thực phẩm tươi sống / Gia vị khô / Bao bì)
  - `cutoffTimeStr`: string (VD: "15:00 Hôm nay" / "11:00 Thứ Tư")
  - `cutoffDate`: Date
  - `urgency`: `'critical'` (< 2 giờ) | `'today'` (trong hôm nay) | `'later'` (các ngày sau) | `'completed'` (đã chốt)
  - `expectedDelivery`: string (VD: "06:00 Sáng mai (15/10)")
  - `minOrderValue`: number (MOV, VD: 1.000.000)
  - `items`: `DispatchItemSku[]`
  - `note`: string
  - `status`: `'draft'` | `'dispatched'`
  - `poCode`?: string (khi đã dispatch)

## 3. Xử Lý Các Nghiệp Vụ Nâng Cao (Edge Cases)
1. **Một NCC có cả hàng ngày và hàng tuần**:
   - Thẻ NCC tự động phân làm 2 nhóm con bên trong accordion:
     - Nhóm A: "Giao sáng mai — Cutoff 15:00 hôm nay" (Hàng tươi sống).
     - Nhóm B: "Giao cuối tuần — Cutoff Thứ 6" (Hàng đông lạnh/kho).
   - Cho phép chọn chốt riêng từng nhóm hoặc chốt chung.
2. **Quá giờ Cutoff (Overdue)**:
   - Nếu thời gian hiện tại > Cutoff Time: Thẻ hiển thị cảnh báo đỏ `⚠️ Đã qua giờ cutoff đợt hôm nay (15:00). Lịch giao sẽ tự động chuyển sang ngày mốt (16/10)`. Khi chốt sẽ có xác nhận lùi ngày giao.
3. **Chưa đủ giá trị đơn tối thiểu (MOV)**:
   - Vô hiệu hóa nút Chốt đơn thông thường hoặc hiển thị nút cảnh báo `Chưa đạt MOV (Thiếu ... đ)`. Bấm vào sẽ gợi ý tăng số lượng mặt hàng.

## 4. Tuân Thủ UI Design System (`RULE_UI_DESIGN_SYSTEM.md`)
- Tone màu: Teal (`#0d9488`), nền thẻ trắng, viền rõ nét `#e2e8f0`, bóng đổ nhẹ `#0000000a`.
- Huy hiệu Urgency:
  - Critical: Nền đỏ `#fee2e2`, chữ đỏ `#b91c1c`, viền đỏ `#fca5a5` với icon đồng hồ nhấp nháy hoặc chấm tròn đỏ.
  - Today: Nền vàng `#fef3c7`, chữ vàng `#b45309`, viền `#fcd34d`.
  - Later: Nền xanh/xám `#f1f5f9`, chữ `#475569`.
  - Completed: Nền xanh lá `#dcfce7`, chữ xanh `#15803d`, icon tick hoàn thành.
- Các ô số tiền và số lượng luôn căn phải (`text-align: right`), định dạng `toLocaleString()`.
- Responsive và không bị tràn ngang container.
