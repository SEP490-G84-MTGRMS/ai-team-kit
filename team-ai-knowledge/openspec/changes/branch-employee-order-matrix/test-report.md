---
verdict: PASS
date: 2026-11-05
tester: @minhduc118a
branch: feat/order-matrix-openspec-v1.1
change: branch-employee-order-matrix
---

# Test Report: Ma trận Đặt hàng Nhân viên Chi nhánh (Employee Order Matrix)

## 1. Tóm tắt kết quả
- **Verdict**: PASS (100% Passed)
- **Tổng số test cases**: 5
- **Passed**: 5
- **Failed**: 0
- **Blocked**: 0

## 2. Chi tiết kết quả kiểm thử theo Yêu cầu & Kịch bản

| ID | Yêu cầu / Scenario | Kịch bản kiểm thử | Kết quả thực tế | Trạng thái |
|----|--------------------|-------------------|-----------------|------------|
| TC-01 | REQ-01: Cố định phạm vi chi nhánh | Nhân viên truy cập `/employee/purchase-orders/create-matrix` | Giao diện mở đúng chi nhánh được phân công; không có tùy chọn đổi chi nhánh. | PASS |
| TC-02 | REQ-02: Bộ lọc ẩn dropdown chi nhánh | Render OrderMatrixFilterBar với `hideBranchSelect={true}` | Dropdown chi nhánh ẩn hoàn toàn; bộ lọc NCC, danh mục và từ khóa hoạt động chuẩn. | PASS |
| TC-03 | REQ-03: Nhập số lượng và cảnh báo MOQ | Nhập số lượng nhỏ hơn MOQ vào ngày hợp lệ | Ô nhập hiển thị viền/badge cảnh báo cam "Chưa đạt MOQ"; ngày vi phạm lead time bị khóa xám. | PASS |
| TC-04 | REQ-04: Lưu nháp và Gửi đơn | Nhân viên nhập đơn và bấm "Gửi đơn hàng" | Hiển thị modal/toast thành công; nếu chưa nhập số lượng nào thì hiển thị cảnh báo yêu cầu nhập hàng. | PASS |
| TC-05 | REQ-05: Tiện ích sao chép tuần & Excel | Bấm Sao chép tuần trước | Sao chép chính xác số lượng từ tuần trước vào các ngày hợp lệ của tuần này. | PASS |

## 3. Lệnh kiểm tra thực tế đã chạy

### Frontend Build:
```bash
cd MT_GRMS_FRONTEND && npm run build
# ✓ built in 891ms
```

## 4. Lỗi tồn đọng
- Không có lỗi tồn đọng.
