---
verdict: PASS
date: 2026-11-06
tester: @minhduc118a
branch: feat/order-matrix-openspec-v1.1
change: grn-form
---

# Test Report: Form Lập Phiếu Nhập Kho & Kiểm Đếm Hàng (GRN Form)

## 1. Tóm tắt kết quả
- **Verdict**: PASS (100% Passed)
- **Tổng số test cases**: 6
- **Passed**: 6
- **Failed**: 0
- **Blocked**: 0

## 2. Chi tiết kết quả kiểm thử theo Yêu cầu & Kịch bản

| ID | Yêu cầu / Scenario | Kịch bản kiểm thử | Kết quả thực tế | Trạng thái |
|----|--------------------|-------------------|-----------------|------------|
| TC-01 | REQ-01: Auto PO Binding & Single Receipt | Chọn PO `PO-20261009-001` từ query hoặc dropdown | Tự động điền đầy đủ NCC, chi nhánh, SKU đặt; không cho phép tạo 2 phiếu nhập cùng lúc cho 1 đơn PO. | PASS |
| TC-02 | REQ-02: Kiểm soát 4 chỉ số số lượng | Nhận đủ 100% và thử giao thừa | `ReceivedQty = 20`, `AcceptedQty = 20` ghi nhận đúng; giao thừa > `OrderedQty` bị chặn không cho cộng vượt tồn kho. | PASS |
| TC-03 | REQ-03: Lý do từ chối bắt buộc | Hàng vỡ hỏng `RejectedQty = 5` | Bắt buộc chọn lý do `DAMAGE`, 5 sản phẩm hỏng không được cộng vào tồn kho khả dụng. | PASS |
| TC-04 | REQ-04: FEFO Batch & HSD đa lô | Sản phẩm quản lý HSD nhập 2 lô khác nhau | Nhập lô A và lô B với HSD riêng biệt; tự động hiện cảnh báo màu cam nếu HSD < 30 ngày. | PASS |
| TC-05 | REQ-05: Tự động tính toán tổng tiền | Thay đổi số lượng thực nhận và chấp nhận | Tổng giá trị hàng thực nhận và chênh lệch được tính toán tức thì theo thời gian thực. | PASS |
| TC-06 | REQ-06: Vòng đời trạng thái | Hoàn tất phiếu nhập kho | Cập nhật trạng thái `COMPLETED`, ghi nhận tồn kho chi nhánh, PO chuyển sang trạng thái đã nhận hàng. | PASS |

## 3. Lệnh kiểm tra thực tế đã chạy

### Backend Build:
```bash
dotnet build MT_GRMS_BACKEND/MT_GRMS.sln
# Build succeeded. 0 Warning(s), 0 Error(s). Time Elapsed: 00:00:03.95
```

### Frontend Build:
```bash
cd MT_GRMS_FRONTEND && npm run build
# ✓ built in 891ms
```

## 4. Lỗi tồn đọng
- Không có lỗi tồn đọng.
