---
verdict: PASS
date: 2026-11-02
change: pos-annhien-data-and-staff-logout
---

# Báo Cáo Kiểm Thử (Test Report): pos-annhien-data-and-staff-logout

## 1. Kết Quả Kiểm Thử Yêu Cầu (Requirements Verification)

| Mã Yêu Cầu | Kịch Bản Kiểm Thử | Trạng Thái | Ghi Chú |
|---|---|---|---|
| **REQ-ANNHIEN-01** | Đăng nhập tài khoản An Nhiên Mart (`0918889999` hoặc `0917778888`) hiển thị 5 sản phẩm sạch kèm tồn kho theo lô FEFO | **PASS** | Hoạt động tốt cả khi gọi API Backend lẫn khi Offline Mock Data |
| **REQ-ANNHIEN-01** | Tìm kiếm sản phẩm An Nhiên bằng tên, barcode hoặc SKU trên quầy POS | **PASS** | Tự động đưa vào giỏ hàng hoặc gợi ý dropdown chính xác |
| **REQ-ANNHIEN-01** | Hiển thị 2 đơn hàng mẫu trong trang Quản lý hóa đơn & Đặt trước | **PASS** | Gồm 1 đơn bán lẻ completed và 1 đơn đặt trước VietQR cọc 100k |
| **REQ-BANNER-01** | Loại bỏ hoàn toàn khối banner màu xanh "Kho hàng của tiệm này chưa có sản phẩm nào" | **PASS** | Giao diện quầy bán hàng sạch sẽ, thoáng đãng |
| **REQ-LOGOUT-01** | Nút "Đăng xuất tài khoản" trong menu "Thao tác" cho tài khoản Nhân viên (`EMPLOYEE`) | **PASS** | Nhấn đăng xuất dọn sạch session và quay về `/auth/login` |

## 2. Kiểm Tra Biên Dịch & Build
- **Lệnh thực hiện**: `npm --prefix MT_GRMS_FRONTEND run build`
- **Kết quả**:
  ```
  > frontend@0.0.0 build
  > tsc -b && vite build

  ✓ 2509 modules transformed.
  rendering chunks...
  dist/index.html                     1.16 kB
  dist/assets/index-Dbr7WHcO.css    276.13 kB
  dist/assets/index-Dtc7s1kS.js   3,099.91 kB
  ✓ built in 683ms
  ```
- **Lỗi tồn đọng**: 0 lỗi.

## 3. Kết Luận
Tất cả các tiêu chí nghiệm thu đề ra trong Spec đều đạt kết quả PASS 100%. Sẵn sàng lưu trữ và đóng change.
