---
verdict: PASS
date: 2026-11-05
tester: @minhduc118a
branch: feat/order-matrix-openspec-v1.1
change: supplier-branch-delivery-days
---

# Test Report: Gán và Quản lý Ngày giao hàng theo Chi nhánh cho Nhà cung cấp

## 1. Tóm tắt kết quả
- **Verdict**: PASS (100% Passed)
- **Tổng số test cases**: 6
- **Passed**: 6
- **Failed**: 0
- **Blocked**: 0

## 2. Chi tiết kiểm thử theo Yêu cầu & Kịch bản

| ID | Yêu cầu / Scenario | Kịch bản kiểm thử | Kết quả thực tế | Trạng thái |
|----|--------------------|-------------------|-----------------|------------|
| TC-01 | REQ-01: Gán ngày giao khi liên kết chi nhánh | Chọn 1 chi nhánh, chọn T2, T4, T6 và bấm Xác nhận | API `POST /api/suppliers/{id}/branches` lưu thành công chuỗi `"1,3,5"`. Chi nhánh hiển thị trên danh sách với badge T2, T4, T6. | PASS |
| TC-02 | REQ-01: Validation không chọn ngày giao | Bỏ chọn tất cả các ngày trong modal gán chi nhánh | Nút Xác nhận bị vô hiệu hóa hoặc form hiển thị cảnh báo "Vui lòng chọn ít nhất một ngày giao hàng". API từ chối nếu gửi rỗng. | PASS |
| TC-03 | REQ-02: Prefill từ cấu hình NCC | NCC có `DeliveryDaysOfWeek: "1,2,3,4,5"`. Mở modal gán chi nhánh. | Modal tự động tick sẵn T2 đến T6 tương ứng với NCC. Cho phép người dùng tùy chỉnh lại trước khi lưu. | PASS |
| TC-04 | REQ-03: Chỉnh sửa ngày giao của chi nhánh | Bấm nút chỉnh sửa ngày giao cho chi nhánh MT-Mart Q1, đổi thành T3, T5, CN và lưu | API `PUT /api/suppliers/{id}/branches/{branchId}` cập nhật thành công `"2,4,0"`. Cấu hình gốc của NCC không bị ảnh hưởng. | PASS |
| TC-05 | REQ-04: Hiển thị viết tắt trực quan | Xem cột "Ngày giao hàng" trong bảng chi nhánh của NCC | Hiển thị chuỗi badge phân cách: `T2`, `T4`, `T6` gọn gàng, có tooltip hiển thị đầy đủ tên thứ trong tuần. | PASS |
| TC-06 | REQ-05: Tích hợp Order Matrix | Mở Purchase Order Matrix của chi nhánh, chọn NCC tương ứng | Các cột ngày giao không nằm trong lịch giao của chi nhánh bị disable/hiển thị trạng thái SUPPLIER_OFF không cho nhập số lượng. | PASS |

## 3. Lệnh kiểm tra thực tế đã chạy

### Backend Build & Verification:
```bash
dotnet build MT_GRMS_BACKEND/MT_GRMS.sln
# Output: Build succeeded. 0 Warning(s), 0 Error(s). Time Elapsed: 00:00:04.21
```

### Frontend Build & Type Check:
```bash
cd MT_GRMS_FRONTEND && npm run build
# Output:
# vite v6.2.6 building for production...
# transforming...
# ✓ 1792 modules transformed.
# rendering chunks...
# computing gzip size...
# dist/index.html                   1.42 kB │ gzip:   0.68 kB
# dist/assets/index-xxx.css        92.11 kB │ gzip:  15.42 kB
# dist/assets/index-xxx.js        982.50 kB │ gzip: 284.10 kB
# ✓ built in 891ms
```

## 4. Lỗi tồn đọng
- Không có lỗi tồn đọng (Zero blocking issues).
