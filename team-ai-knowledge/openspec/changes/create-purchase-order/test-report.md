---
verdict: PASS
date: 2026-11-06
tester: @minhduc118a
branch: feat/order-matrix-openspec-v1.1
change: create-purchase-order
---

# Test Report: Tạo Purchase Order Đa ngày (Order Matrix Table Creation)

## 1. Tóm tắt kết quả
- **Verdict**: PASS (100% Passed)
- **Tổng số test cases**: 8
- **Passed**: 8
- **Failed**: 0
- **Blocked**: 0

## 2. Chi tiết kết quả kiểm thử theo Yêu cầu & Kịch bản

| ID | Yêu cầu / Scenario | Kịch bản kiểm thử | Kết quả thực tế | Trạng thái |
|----|--------------------|-------------------|-----------------|------------|
| TC-01 | REQ-PO-01: Bộ lọc Single Compact Row | Kiểm tra thanh filter 13 controls trong 1 hàng | Bố cục gọn gàng 48-54px, đầy đủ các trường lọc theo đúng nghiệp vụ. | PASS |
| TC-02 | REQ-PO-02: Lịch giao NCC và khóa ô | Kiểm tra các ô ngày theo lịch giao NCC | Các ngày không giao hiển thị `—`, ngày quá cutoff hiển thị màu xám khóa ô. | PASS |
| TC-03 | REQ-PO-03: Kiểm tra hạn mức tín dụng Credit Limit | Tạo PO vượt quá hạn mức công nợ | Đơn hàng được phân loại trạng thái chờ duyệt tín dụng chính xác. | PASS |
| TC-04 | REQ-PO-04: Cảnh báo MOQ | Nhập số lượng không đạt MOQ | Viền đỏ cảnh báo `qty-bad` hiển thị tức thì; chặn gửi đơn ngày đó. | PASS |
| TC-05 | REQ-PO-05: Tiện ích Copy Prev Week & Excel | Bấm sao chép tuần trước | Dữ liệu được điền chính xác vào các ngày hợp lệ của tuần hiện tại. | PASS |
| TC-06 | REQ-PO-06: Cơ chế Auto PO Splitting | Bấm submit chốt đơn từ ma trận | Hệ thống tự động bóc tách thành các PO độc lập 1 Chi nhánh + 1 NCC + 1 Ngày giao. | PASS |
| TC-07 | REQ-PO-07: Snapshot đơn giá và ĐVT | Kiểm tra dòng chi tiết PO được tạo | `UnitPrice` và `OrderUnit` được lưu snapshot bất biến. | PASS |
| TC-08 | REQ-PO-08: Phím tắt điều hướng ma trận | Sử dụng các phím mũi tên và Enter trong bảng | Con trỏ chuyển ô mượt mà, hỗ trợ thao tác nhanh cho người dùng. | PASS |

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
