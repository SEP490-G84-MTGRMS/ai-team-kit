---
verdict: PASS
date: 2026-11-08
change: pos-owner-order-cashier-and-branch-fixes
---

# Báo cáo kiểm thử (Test Report): Tối ưu POS Header Owner, hiển thị chi nhánh thực tế & bảo toàn người tạo đơn

## 1. Kết quả kiểm tra theo Requirement & Scenarios

| Mã Yêu Cầu | Kịch bản kiểm thử (Scenario) | Kết quả trước sửa | Kết quả sau sửa | Đánh giá |
|---|---|---|---|---|
| **REQ-POS-OWNER-HEADER-01** | Chủ cửa hàng mở menu dropdown trong POS Header | Hiển thị nút "Lịch sử ca cửa hàng" | Đã ẩn hoàn toàn nút "Lịch sử ca cửa hàng", chỉ giữ các mục phù hợp | **PASS** |
| **REQ-POS-OWNER-HEADER-01** | Thu ngân mở menu dropdown trong POS Header | Hiển thị "Sổ ca & Chốt ca quầy" | Vẫn hiển thị đầy đủ "Sổ ca & Chốt ca quầy" để thao tác ca | **PASS** |
| **REQ-POS-BRANCH-NAME-02** | Xem chi nhánh được phân công ở trang Hóa đơn | Hiển thị chuỗi tĩnh `"Chi nhánh: Chi nhánh được phân công"` | Hiển thị đúng tên thực tế: `Chi nhánh: An Nhiên Mart - Chi nhánh Ba Đình` (tải từ API `/branches`) | **PASS** |
| **REQ-POS-OWNER-MULTI-BRANCH-03** | Chủ cửa hàng vào trang Quản lý hóa đơn / Đơn hàng | Bị kẹt ở chi nhánh của thu ngân vừa đăng xuất | Mặc định chọn `"Tất cả chi nhánh (Toàn chuỗi)"` (`ALL`), hiển thị hóa đơn toàn chuỗi | **PASS** |
| **REQ-POS-OWNER-MULTI-BRANCH-03** | Chủ cửa hàng chọn chi nhánh cụ thể từ dropdown | Danh sách chỉ có 1 chi nhánh gán | Dropdown có đầy đủ các chi nhánh từ backend API để lọc chi tiết | **PASS** |
| **REQ-POS-ORDER-CASHIER-SNAPSHOT-04** | Đơn hàng tạo bởi thu ngân giữ nguyên tên khi Chủ cửa hàng xem | Tên cột Người tạo bị đổi thành tên Chủ cửa hàng do fallback `user?.fullName` | `CashierName` lưu trong DB và trả về từ API, cột Người tạo giữ nguyên tên thu ngân thực tế (ví dụ: `Nguyễn Văn Minh (Nhân viên bán hàng An Nhiên)`) | **PASS** |
| **REQ-POS-ORDER-CASHIER-SNAPSHOT-04** | Chủ cửa hàng trực tiếp đứng quầy bán hàng | Tên người tạo là Chủ cửa hàng | `CashierName` lưu snapshot tên Chủ cửa hàng chính xác | **PASS** |

---

## 2. Kết quả kiểm thử tự động (Automated Test Suite)

### Backend .NET Tests (xUnit)
```text
Passed!  - Failed: 0, Passed: 527, Skipped: 0, Total: 527, Duration: 2 s - MT_GRMS.UnitTests.dll (net8.0)
Passed!  - Failed: 0, Passed:  44, Skipped: 0, Total:  44, Duration: 2 s - MT_GRMS.IntegrationTests.dll (net8.0)
Tổng cộng: 571/571 test cases PASSED (100%)
```

- Bổ sung 2 test cases mới chuyên biệt trong `PosOrderServiceTests.cs`:
  1. `CreateOrderAsync_WithCashierName_PersistsSnapshotAndReturnsInResponse`: Xác minh `CashierName` được lưu chính xác vào DB Entity và trả về trong `OrderResponse`.
  2. `GetOrdersAsync_ReturnsPersistedCashierName_WithoutOverwriting`: Xác minh khi truy vấn danh sách hóa đơn, `CashierName` được giữ nguyên vẹn.

### Frontend Build (Vite + TypeScript)
```text
✓ built in 991ms
dist/index.html                     1.16 kB
dist/assets/index-DzkNyULc.css    315.36 kB
dist/assets/index-BGtT1ukF.js   4,494.31 kB
0 errors.
```

---

## 3. Lỗi tồn đọng (Known Issues)
- Không có lỗi tồn đọng. Toàn bộ 4 vấn đề user phản ánh đã được giải quyết triệt để và kiểm chứng.

## 4. Kết luận
- **Verdict**: **PASS**
- Đủ điều kiện phê duyệt bước Test để tiến hành bước Lưu trữ (Archive) change.
