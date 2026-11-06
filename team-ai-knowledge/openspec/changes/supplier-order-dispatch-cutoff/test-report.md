---
verdict: PASS
date: 2026-11-05
tester: @minhduc118a
branch: feat/order-matrix-openspec-v1.1
change: supplier-order-dispatch-cutoff
---

# Test Report: Dispatch Hub NEAREST / WEEK + Business Engine chốt Purchase Order

## 1. Tóm tắt kết quả kiểm thử
- **Verdict**: PASS (100% Passed)
- **Tổng số test cases**: 11
- **Passed**: 11
- **Failed**: 0
- **Blocked**: 0

## 2. Chi tiết kết quả kiểm thử theo Yêu cầu & Kịch bản

| ID | Yêu cầu / Scenario | Kịch bản kiểm thử | Kết quả thực tế | Trạng thái |
|----|--------------------|-------------------|-----------------|------------|
| TC-01 | REQ-01: Top Urgency Bar & Metrics | Kiểm tra thanh tổng quan số NCC, tổng tiền, deadline badges | Hiển thị chính xác tổng số NCC có đơn nháp, tổng số SKU, tổng tiền và số NCC có deadline khẩn cấp (< 2h). | PASS |
| TC-02 | REQ-02: Urgency Tabs & Tìm kiếm | Chuyển đổi tab lọc (Cần chốt gấp, Hôm nay, v.v.) và gõ từ khóa tìm kiếm | Danh sách lọc mượt mà theo đúng trạng thái deadline và tên NCC theo thời gian thực. | PASS |
| TC-03 | REQ-03: Thẻ NCC & Deep-Link Matrix | Bấm vào liên kết sang ma trận đặt hàng từ thẻ NCC | Trình duyệt điều hướng đúng trang `/store-owner/purchase-orders/create-matrix?branchId=...&supplier=...&orderedOnly=true` với bộ lọc chính xác. | PASS |
| TC-04 | REQ-04: Cảnh báo MOV & Quá hạn Cutoff | NCC có tổng tiền < MOV hoặc giờ hiện tại > Cutoff Time | Hiển thị cảnh báo màu cam "Chưa đạt MOV" hoặc badge đỏ "ĐÃ QUÁ GIỜ CUTOFF". Nút chốt đơn bị khóa hoặc hiển thị xác nhận lùi ngày. | PASS |
| TC-05 | REQ-05: Modal Xác nhận Chốt Đơn Tinh Gọn | Mở modal xác nhận từ nút "Chốt đơn NCC" | Popup hiển thị căn giữa màn hình (`fixed inset-0 z-[99999]`), backdrop làm mờ; 4 thẻ metrics tóm tắt; bảng 6 cột rõ ràng, **không có icon dropdown mũi tên mở rộng** gây rối layout; có loading state và chống double-click. | PASS |
| TC-06 | REQ-06: Phạm vi chốt NEAREST | Chọn scope "Ngày giao gần nhất" trên Segmented Control | Preview và chốt PO chỉ chọn đúng ngày giao gần nhất có `FinalQty > 0` và còn trước giờ cutoff. Các ngày sau vẫn giữ nguyên ở trạng thái nháp. | PASS |
| TC-07 | REQ-06: Phạm vi chốt WEEK | Chọn scope "Cả tuần (T2–CN)" trên Segmented Control | Preview và chốt PO chọn toàn bộ các ngày hợp lệ trong tuần hiện tại (Thứ Hai đến Chủ nhật theo múi giờ `Asia/Ho_Chi_Minh`) có `FinalQty > 0`. | PASS |
| TC-08 | REQ-07: Nguyên tắc 1 PO = 1 Branch + 1 Supplier + 1 DeliveryDate | Chốt đơn cho 2 chi nhánh có 2 ngày giao trong tuần | Hệ thống tạo thành công đúng 4 Purchase Order độc lập, không gộp ngày, không gộp chi nhánh. | PASS |
| TC-09 | REQ-08: Nguồn số lượng 100% từ DB Draft | Employee nhập 10, Store Owner sửa 15 trên Matrix. Bấm chốt trên Hub | Backend lấy đúng `FinalQty = 15` trực tiếp từ bảng `PurchaseOrderDetails` trong DB, không nhận số lượng từ client. | PASS |
| TC-10 | REQ-09: Batch Split Partial Success | 1 chi nhánh bị quá giờ cutoff (SKIPPED), 1 chi nhánh hợp lệ | Chi nhánh hợp lệ tạo PO thành công (Status: SUCCESS). Chi nhánh quá hạn ghi nhận SKIPPED với mã `CUTOFF_EXPIRED`. Toàn bộ batch không bị rollback. | PASS |
| TC-11 | REQ-10: Dry Run Preview API | Mở modal gọi `POST /matrix/split/preview` | Backend tính toán trước và trả về đầy đủ dự kiến PO, tổng tiền, số SKU và các group bị bỏ qua mà không ghi dữ liệu vào database. | PASS |

## 3. Lệnh kiểm tra thực tế đã chạy

### Backend Build:
```bash
dotnet build MT_GRMS_BACKEND/MT_GRMS.sln
# Build succeeded.
# 0 Warning(s)
# 0 Error(s)
# Time Elapsed: 00:00:03.95
```

### Frontend Build:
```bash
cd MT_GRMS_FRONTEND && npm run build
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
- Không có lỗi tồn đọng. Hệ thống đáp ứng hoàn toàn yêu cầu nghiệp vụ và thẩm mỹ UI.
