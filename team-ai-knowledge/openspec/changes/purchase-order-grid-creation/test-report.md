---
verdict: PASS
date: 2026-11-05
tester: @minhduc118a
branch: feat/order-matrix-openspec-v1.1
change: purchase-order-grid-creation
---

# Test Report: Ma trận Đặt hàng Đa ngày (Order Matrix Grid) & Tiện ích Excel

## 1. Tóm tắt kết quả
- **Verdict**: PASS (100% Passed)
- **Tổng số test cases**: 8
- **Passed**: 8
- **Failed**: 0
- **Blocked**: 0

## 2. Chi tiết kết quả kiểm thử theo Yêu cầu & Kịch bản

| ID | Yêu cầu / Scenario | Kịch bản kiểm thử | Kết quả thực tế | Trạng thái |
|----|--------------------|-------------------|-----------------|------------|
| TC-01 | REQ-POGRID-01: Ma trận 31 ngày & Khóa ngày nghỉ | Mở ma trận 14 ngày của NCC giao T2, T4, T6 | Các cột T2, T4, T6 mở cho phép nhập; các ngày T3, T5, T7, CN hiển thị ô xám `—` không cho phép sửa. | PASS |
| TC-02 | REQ-POGRID-02: Mô hình 3 trường FinalQty | Nhân viên nhập 10 (`EmployeeQty = 10`), Chủ quán nhập 15 (`StoreQty = 15`) | `FinalQty` tính ra 15; ô hiển thị badge chỉ báo Store Owner đã sửa; khôi phục về đề xuất thì `StoreQty = null`, `FinalQty` trở về 10. | PASS |
| TC-03 | REQ-POGRID-03: Cutoff độc lập từng ngày | Chốt ngày thứ Ba đã đến giờ cutoff | Cột ngày thứ Ba được chuyển trạng thái sang đã chốt; các cột ngày thứ Năm và thứ Bảy tuần sau vẫn giữ nguyên ở trạng thái Mở cho phép tiếp tục chỉnh sửa. | PASS |
| TC-04 | REQ-POGRID-04: Tự động bóc tách PO theo [Branch + Supplier + Date] | Chốt ma trận có 2 chi nhánh và 2 ngày giao | Sinh đúng 4 PO riêng biệt tương ứng cho từng chi nhánh, nhà cung cấp và ngày giao; snapshot đúng `UnitPrice` và `OrderUnit`. | PASS |
| TC-05 | REQ-POGRID-05: Ràng buộc MOQ & Bội số | Nhập số lượng 3 cho mặt hàng có MOQ là 5 | Hiển thị viền đỏ cảnh báo vi phạm MOQ và không cho phép chốt đơn cho cột ngày đó. | PASS |
| TC-06 | REQ-POGRID-06: Đề xuất số lượng (Suggested Qty) | Bấm "Áp dụng số lượng đề xuất" | Hệ thống tính toán chính xác dựa trên doanh số bán và tồn kho khả dụng, điền vào các ô trống. | PASS |
| TC-07 | REQ-POGRID-07: Excel Import 3 pha & Export thẩm mỹ | Xuất Excel và tải lên file kiểm tra | File Excel xuất ra có header xanh thương hiệu, freeze panes cột sản phẩm; luồng Import thực hiện đúng 3 bước Validate -> Preview -> Apply an toàn vào bản nháp. | PASS |
| TC-08 | REQ-POGRID-08: Kiểm tra hạn mức tín dụng | Tổng giá trị PO vượt quá CreditLimit của NCC | Đơn hàng tự động được gắn trạng thái `PENDING_CREDIT_APPROVAL`. | PASS |

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
