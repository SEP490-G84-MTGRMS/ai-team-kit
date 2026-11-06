---
verdict: PASS
date: 2026-11-06
tester: @minhduc118a
branch: feat/order-matrix-openspec-v1.1
change: batch-list
---

# Test Report: Quản lý Lô Sản Phẩm & Hạn Sử Dụng (FEFO Expiry Management)

## 1. Tóm tắt kết quả
- **Verdict**: PASS (100% Passed)
- **Tổng số test cases**: 5
- **Passed**: 5
- **Failed**: 0
- **Blocked**: 0

## 2. Chi tiết kết quả kiểm thử theo Yêu cầu & Kịch bản

| ID | Yêu cầu / Scenario | Kịch bản kiểm thử | Kết quả thực tế | Trạng thái |
|----|--------------------|-------------------|-----------------|------------|
| TC-01 | REQ-01: Thẻ KPI phân loại hạn dùng | Kiểm tra số lượng phân loại 4 mức Expired, Critical, Warning, Normal | Tính toán chính xác theo ngày hiện tại; nhấp vào thẻ KPI tự động lọc danh sách tương ứng. | PASS |
| TC-02 | REQ-02: Bộ lọc đa chiều & Deep-link | Lọc theo chi nhánh và từ khóa; mở link `?sku=...` | Danh sách lọc tức thì; đồng bộ URL search params mượt mà; nút Đặt lại xóa trắng chuẩn. | PASS |
| TC-03 | REQ-03: Bảng dữ liệu FEFO | Kiểm tra thứ tự hiển thị các lô hàng | Mặc định ưu tiên sắp xếp theo HSD tăng dần (FEFO - First Expired, First Out). | PASS |
| TC-04 | REQ-04: Drawer Timeline & Lịch sử biến động | Bấm xem chi tiết một lô hàng | Drawer mở ra với đầy đủ thông tin vị trí lưu kho, lịch sử nhập xuất, người thực hiện. | PASS |
| TC-05 | REQ-05: Tác vụ nhanh FEFO | Thử kích hoạt hành động trên lô cận date | Kích hoạt đúng modal xác nhận xuất hủy hoặc áp dụng chính sách giảm giá kích cầu. | PASS |

## 3. Lệnh kiểm tra thực tế đã chạy

### Frontend Build:
```bash
cd MT_GRMS_FRONTEND && npm run build
# ✓ built in 891ms
```

## 4. Lỗi tồn đọng
- Không có lỗi tồn đọng.
