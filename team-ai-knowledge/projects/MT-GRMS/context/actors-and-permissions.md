---
id: CTX-MT-GRMS-003
title: "MT-GRMS — Tác Tử, Phạm Vi Dữ Liệu & Ma Trận Phân Quyền (Actors & RBAC Permission Matrix)"
date: "2026-10-12"
author: "SEP490-G84"
project: "MT-GRMS"
tags: [context, rbac, permissions, actors, security]
---

# 👥 MT-GRMS — Tác Tử, Phạm Vi Dữ Liệu & Ma Trận Phân Quyền

Tài liệu này xác định 5 tác tử người dùng (Actors), 3 cấp độ phạm vi dữ liệu (Data Scopes) và **Ma trận phân quyền RBAC chi tiết** áp dụng cho toàn bộ 23 tính năng của hệ thống MT-GRMS (theo chuẩn SRS Report-3).

---

## 1. Danh Sách 5 Tác Tử Hệ Thống (Actors Definition)

| Tác tử (Actor) | Phạm vi vai trò | Mô tả trách nhiệm & Thẩm quyền chính |
|---|---|---|
| **SaaS Master Admin** | Platform Scope | Nhà cung cấp dịch vụ phần mềm SaaS. Quản lý toàn bộ các Tenant, cấu hình các gói cước thuê bao (`SubscriptionPlans`), theo dõi chỉ số doanh thu MRR, khóa/mở tài khoản Tenant quá hạn thanh toán. Không can thiệp vào dữ liệu bán hàng nội bộ của các Tenant. |
| **Store Owner** | Tenant Scope | Chủ cửa hàng / Chủ chuỗi bán lẻ. Toàn quyền cao nhất trong phạm vi Tenant của mình: Tạo chi nhánh, phân quyền nhân viên, duyệt điều chỉnh kho, duyệt hủy hàng hết hạn, xem báo cáo P&L toàn chuỗi, cấu hình thuế và thanh toán tiền gói SaaS. |
| **Store Manager** | Branch Scope | Quản lý cửa hàng tại chi nhánh. Phụ trách vận hành hàng ngày của 1 chi nhánh cụ thể: Lập lịch phân ca, duyệt đơn đặt hàng PO, lập phiếu chuyển kho, quản lý thu ngân và nhân viên kho, theo dõi doanh thu chi nhánh. |
| **Cashier** | Branch Scope | Nhân viên thu ngân tại quầy POS. Thực hiện các thao tác: Quét mã vạch bán hàng, mở/đóng két tiền, đối soát chênh lệch tiền mặt cuối ca, sinh mã VietQR và in hóa đơn khách hàng. Bị giới hạn không xem giá vốn nhập và không sửa đơn giá sản phẩm. |
| **Inventory Staff** | Branch Scope | Nhân viên quản lý kho tại chi nhánh. Phụ trách: Kiểm đếm hàng nhập từ PO, ghi nhận thông tin Lô & Hạn sử dụng (FEFO), thực hiện kiểm kê kho (Stocktake), đề xuất xuất hủy hàng hỏng/hết hạn, đóng gói hàng chuyển kho. |

---

## 2. Các Cấp Độ Phạm Vi Dữ Liệu (Data Scopes)

1. **Platform Scope (Cấp Nền tảng)**:
   - Dành riêng cho `SaaS Master Admin`.
   - Được phép truy cập bảng: `Tenants`, `SubscriptionPlans`, `Subscriptions`, `MasterAuditLogs`.
2. **Tenant-Wide Scope (Cấp Chuỗi - Toàn Tenant)**:
   - Dành cho `Store Owner`.
   - Xem và tổng hợp số liệu của TẤT CẢ các Chi nhánh (`Branches`) thuộc Tenant của mình.
   - Quản lý danh mục sản phẩm dùng chung, chính sách giá bán toàn chuỗi và báo cáo tài chính P&L hợp nhất.
3. **Branch-Specific Scope (Cấp Chi nhánh Cụ thể)**:
   - Dành cho `Store Manager`, `Cashier`, `Inventory Staff`.
   - Nhân viên đăng nhập vào chi nhánh nào thì **chỉ nhìn thấy và thao tác trên tồn kho, ca làm việc, đơn hàng của chi nhánh đó**.
   - Cấm đọc chéo dữ liệu của các chi nhánh khác trừ khi có chức năng điều chuyển kho liên chi nhánh (FE-15).

---

## 3. Ma Trận Phân Quyền RBAC Chi Tiết (RBAC Permission Matrix)

*Ký hiệu quyền*:
- **Full**: Toàn quyền (Xem, Thêm, Sửa, Xóa, Duyệt, Xuất file).
- **CRUD**: Xem, Thêm, Sửa, Xóa (không có quyền phê duyệt cấp cao).
- **CRU**: Xem, Thêm, Sửa (không được xóa).
- **R/W**: Xem và Thao tác tác vụ chuyên biệt.
- **RO**: Chỉ xem (Read-only).
- **--**: Không có quyền truy cập (Access Denied).

| Phân hệ & Tính năng (Feature) | SaaS Admin | Store Owner | Store Manager | Cashier | Inventory Staff |
|---|:---:|:---:|:---:|:---:|:---:|
| **FE-01: Quản lý Sản phẩm & Danh mục** | -- | Full | CRU | RO | RO |
| **FE-02: Lô hàng & Hạn sử dụng (FEFO)** | -- | Full | CRU | RO (Gợi ý FEFO) | R/W (Gán Lô/EXP) |
| **FE-03: Kiểm soát Giá & Lịch sử đổi giá** | -- | Full | RO | RO (Xem giá bán) | -- |
| **FE-04: Kiểm kê Kho & Cân đối sai lệch** | -- | Full (Duyệt cân đối) | CRU | -- | R/W (Quét kiểm đếm) |
| **FE-05: Đơn mua hàng (PO) & Nhập kho** | -- | Full (Duyệt PO) | CRU (Tạo PO) | -- | R/W (Nhận hàng PO) |
| **FE-06: Xuất nội bộ & Hủy hàng hỏng/hạn** | -- | Full (Duyệt hủy) | CRU (Đề xuất) | -- | R/W (Kiểm đếm hủy) |
| **FE-07: Mua sắm dịch vụ (Chi phí mặt bằng)** | -- | Full | CRU (Chi nhánh) | -- | -- |
| **FE-08: Khách hàng & Công nợ (CRM/AR)** | -- | Full | CRU | R/W (Tìm & Tạo nhanh) | -- |
| **FE-09: Nhà cung cấp & Công nợ (AP)** | -- | Full | CRU | -- | RO (Xem thông tin) |
| **FE-10: Dashboard KPIs & Báo cáo P&L** | -- | Full (Toàn chuỗi) | RO (Chi nhánh) | RO (Doanh số ca) | -- |
| **FE-11: Cấu hình hệ thống & Phân quyền RBAC** | -- | Full | RO (Xem quyền) | -- | -- |
| **FE-12: POS Bán hàng & Bàn giao ca** | -- | Full | R/W (Kiểm soát ca) | Full (Bán & Kết ca) | -- |
| **FE-13: Thanh toán VietQR & Tiền mặt** | -- | Full | RO | R/W (Tạo QR & Nhận tiền) | -- |
| **FE-14: Đặt trước (Pre-order) & Giữ hàng** | -- | Full | CRU | R/W (Tạo đơn) | R/W (Chuẩn bị hàng) |
| **FE-15: Chuyển kho liên chi nhánh** | -- | Full | Full (Duyệt chuyển) | -- | R/W (Đóng & Nhận gói) |
| **FE-16: Khuyến mãi, Voucher & Tích điểm** | -- | Full | CRU | RO (Áp dụng KM) | -- |
| **FE-17: Sổ quỹ (Cashbook) & Dòng tiền** | -- | Full | CRU (Quỹ chi nhánh) | R/W (Thu/Chi trong ca) | -- |
| **FE-18: Phân ca, Chấm công & Bảng lương** | -- | Full (Duyệt lương) | CRU (Lập lịch & Chấm) | RO (Xem ca & công) | RO (Xem ca & công) |
| **FE-19: Báo cáo thuế Hộ kinh doanh** | -- | Full (Xuất file) | RO | -- | -- |
| **FE-20: Tài khoản Tenant & Phân lập dữ liệu** | Full | RO (Xem hồ sơ) | -- | -- | -- |
| **FE-21: Quản lý Gói cước (Subscriptions)** | Full | R/W (Chọn & Mua gói) | -- | -- | -- |
| **FE-22: Khóa/Mở tài khoản & Quên mật khẩu** | Full | R/W (Đổi MK NV) | R/W (Đổi MK cá nhân) | R/W (Đổi MK cá nhân) | R/W (Đổi MK cá nhân) |
| **FE-23: Master Dashboard SaaS Provider** | Full | -- | -- | -- | -- |

---

## 4. Cơ Chế Xác Thực & Bảo Mật (Authentication & Security Controls)

1. **Xác thực JWT Kép (Dual-Token Authentication)**:
   - `AccessToken`: Thời hạn sống ngắn (15 - 30 phút), chứa Claim: `UserId`, `TenantId`, `BranchId`, `Role`.
   - `RefreshToken`: Thời hạn 7 ngày, lưu trữ an toàn trong HttpOnly Cookie để tự động làm mới phiên làm việc.
2. **Cơ chế Phê Duyệt Cấp Quản Trị (Manager Override PIN)**:
   - Một số thao tác nhạy cảm tại quầy thu ngân (Xóa dòng đơn hàng sau khi đã quét, Giảm giá thủ công vượt quá 10%, Trả lại hàng đã bán, Bán dưới giá vốn):
   - Bắt buộc hệ thống hiện popup yêu cầu **Mã PIN hoặc Đăng nhập phê duyệt trực tiếp của Store Manager hoặc Store Owner**.
3. **Audit Log Bất Biến (Immutable Audit Trail)**:
   - Mọi thao tác: Chốt ca chênh lệch tiền mặt, Duyệt điều chỉnh kiểm kê, Hủy hàng hết hạn, Sửa giá bán đều được ghi lại vào bảng `AuditLogs` kèm: `Timestamp`, `ActorId`, `IPAddress`, `OldValue`, `NewValue`.
