---
verdict: PASS
date: 2026-11-05
tester: @minhduc118a
branch: feat/order-matrix-openspec-v1.1
change: store-owner-po-list
---

# Test Report: Danh sách Đơn mua hàng PO & Lịch sử Điều chỉnh

## 1. Tóm tắt kết quả
- **Verdict**: PASS (100% Passed)
- **Tổng số test cases**: 6
- **Passed**: 6
- **Failed**: 0
- **Blocked**: 0

## 2. Chi tiết kết quả kiểm thử theo Yêu cầu & Kịch bản

| ID | Yêu cầu / Scenario | Kịch bản kiểm thử | Kết quả thực tế | Trạng thái |
|----|--------------------|-------------------|-----------------|------------|
| TC-01 | REQ-01: Bảng danh sách PO 10 cột | Mở trang `/store-owner/purchase-orders/list` | Hiển thị chuẩn bảng 10 cột, dữ liệu số tiền tiếng Việt tabular-nums căn phải, giao diện ERP sắc nét. | PASS |
| TC-02 | REQ-02: Bộ lọc đa tiêu chí hợp nhất | Lọc theo Chi nhánh Q1 + Trạng thái SENT | Danh sách lọc chính xác các đơn thỏa mãn, số lượng trên footer cập nhật đúng; nút Đặt lại xóa trắng filter về mặc định. | PASS |
| TC-03 | REQ-03: Phân trang linh hoạt | Chuyển trang và đổi page size thành 50 | Phân trang chuyển động nhanh, nút Trước/Sau tự động disable ở trang đầu/cuối. | PASS |
| TC-04 | REQ-04: Slide-over Drawer chi tiết PO | Bấm xem chi tiết hoặc bấm vào mã đơn PO | Drawer trượt mượt mà từ bên phải, hiển thị đầy đủ bảng mặt hàng, ĐVT, số lượng, đơn giá và tổng tiền; đóng drawer bằng nút X hoặc phím Esc. | PASS |
| TC-05 | REQ-05: Huy hiệu trạng thái | Kiểm tra hiển thị 5 trạng thái đơn hàng | Đầy đủ 5 badge màu chuẩn semantic: SENT, CONFIRMED, PARTIALLY_RECEIVED, RECEIVED, CANCELLED. | PASS |
| TC-06 | REQ-06: Lịch sử sửa đổi PO Revision | Xem đơn hàng đã từng được điều chỉnh | Hiển thị rõ danh sách Revision với người sửa, ngày giờ và mức thay đổi chênh lệch số lượng/giá trị. | PASS |

## 3. Lệnh kiểm tra thực tế đã chạy

### Backend Build:
```bash
dotnet build MT_GRMS_BACKEND/MT_GRMS.sln
# Build succeeded. 0 Warning(s), 0 Error(s). Time Elapsed: 00:00:03.95
```

### Frontend Build:
```bash
cd MT_GRMS_FRONTEND && npm run build
# dist/index.html 1.42 kB │ dist/assets/index.js 982.50 kB
# ✓ built in 891ms
```

## 4. Lỗi tồn đọng
- Không có lỗi tồn đọng.
