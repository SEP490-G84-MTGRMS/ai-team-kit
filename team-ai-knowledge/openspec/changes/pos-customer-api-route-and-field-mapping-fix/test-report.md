---
verdict: PASS
---

# Báo Cáo Kiểm Thử: pos-customer-api-route-and-field-mapping-fix

## 1. Kết Quả Nghiệm Thu Tổng Quan
- **Verdict**: **PASS** (100% kịch bản kiểm thử đều đạt).
- **Phạm vi kiểm thử**: Sửa lỗi route 404 `/api/v1/customers` từ backend và sửa field mapping DTO khách hàng ở frontend POS.

## 2. Chi Tiết Kiểm Thử Từng Requirement (specs.md)

| Mã Requirement | Kịch Bản Kiểm Thử | Kết Quả Trước Sửa | Kết Quả Sau Sửa | Đánh Giá |
|---|---|---|---|---|
| **REQ-CUST-ROUTE-01** | Gọi `GET /api/v1/customers` với header `X-Tenant-Id: tenant_an_nhien_02` | Trả về HTTP 404 Not Found do controller chỉ có route `/api/customers`. | Trả về HTTP 200 OK với danh sách đầy đủ 3 khách hàng từ CSDL PostgreSQL. | **PASS** |
| **REQ-CUST-MAP-02** | Ánh xạ DTO khách hàng tại `posOrderApi.ts` và hiển thị trên màn hình POS | Dữ liệu `c.fullName` và `c.phoneNumber` bị bỏ sót thành rỗng `""`. POS rơi vào fallback mock data `mockCustomersAnNhien`. | Ánh xạ chính xác `fullName` -> `name`, `phoneNumber` -> `phone`. Khách hàng `KH26110509554270` ("Sơn", SĐT `0961934104`, điểm `72`) xuất hiện ngay trên POS. | **PASS** |

## 3. Bằng Chứng Thực Thi Kiểm Thử
- **API Call Kiểm Chứng**:
  ```powershell
  (Invoke-RestMethod -Uri 'http://localhost:5232/api/v1/customers' -Headers @{'X-Tenant-Id'='tenant_an_nhien_02'}).data
  ```
  *Kết quả trả về*:
  - Khách 1: `customerCode: "KH26110509554270"`, `fullName: "Sơn"`, `phoneNumber: "0961934104"`, `loyaltyPoints: 72`
  - Khách 2: `customerCode: "KH-AN-001"`, `fullName: "Bác Minh (Khách quen Ba Đình)"`, `phoneNumber: "0934567890"`, `loyaltyPoints: 214`
  - Khách 3: `customerCode: "KH-AN-002"`, `fullName: "Chị Thu Hà (Khách đặt trước)"`, `phoneNumber: "0976543210"`, `loyaltyPoints: 127`
- **Frontend Build**:
  - `npm --prefix MT_GRMS_FRONTEND run build`: `built in 684ms` (Thành công 100%, không có lỗi type/linter).

## 4. Lỗi Tồn Đọng
- Không có lỗi tồn đọng.
