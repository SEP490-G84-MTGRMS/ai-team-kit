# Proposal: fe08-customer-crm-frontend

## 1. Vấn đề cần giải quyết (Problem Statement)
- **Ghi chép công nợ thủ công (GAP-03):** Tại các tiệm tạp hóa và siêu thị mini vừa và nhỏ, việc cho khách quen mua chịu/nợ tiền thường ghi sổ tay hoặc trí nhớ, dẫn đến thất thoát dòng tiền, quên đòi nợ, khó đối soát lịch sử mua hàng và trả nợ.
- **Thiếu kiểm soát hạn mức nợ:** Không có cơ chế chặn hoặc cảnh báo khi khách hàng mua vượt hạn mức cho phép (`DebtLimit`), gây rủi ro nợ khó đòi.
- **Trải nghiệm thu nợ chậm chạp:** Thu nợ bằng chuyển khoản phải kiểm tra tài khoản thủ công, chưa có mã VietQR động theo số tiền nợ để khách thanh toán nhanh tại chỗ.
- **Chăm sóc khách hàng & Giữ chân (Retention) sơ sài:** Thiếu phân loại khách hàng theo hạng thẻ thành viên (`MembershipTier`: Standard, Silver, Gold, VIP) và hệ thống tích lũy điểm thưởng (`LoyaltyPoints`).

## 2. Mục tiêu (Goals & Value Proposition)
- Xây dựng giao diện Frontend hoàn chỉnh, hiện đại, chuẩn Responsive Web cho phân hệ **Quản lý Khách hàng & Công nợ (FE-08: Customer CRM & Accounts Receivable - AR)**.
- Cho phép tra cứu nhanh khách hàng qua số điện thoại (< 0.5s), xem chi tiết lịch sử mua nợ và lịch sử thanh toán.
- Thiết lập và giám sát chặt chẽ hạn mức công nợ (`DebtLimit`) kèm cảnh báo trực quan.
- Tích hợp tính năng tạo mã thanh toán VietQR động để thu nợ tức thì tại quầy hoặc gửi qua Zalo/tin nhắn.
- Quản lý điểm thưởng tích lũy và tự động phân hạng thành viên.

## 3. Phạm vi (Scope)

### In-Scope
1. **Quản lý danh sách khách hàng:**
   - Bảng dữ liệu phân trang, lọc theo Hạng thành viên (Standard/Silver/Gold/VIP), lọc theo trạng thái công nợ (Còn nợ, Quá hạn mức, Hết nợ).
   - Thanh tìm kiếm tức thì theo Số điện thoại / Tên khách hàng.
   - Thống kê tổng quan nhanh: Tổng số khách hàng, Tổng công nợ phải thu (Total AR), Số khách vượt hạn mức nợ, Tổng điểm tích lũy.
2. **Thêm mới & Chỉnh sửa hồ sơ khách hàng:**
   - Form nhập liệu chuẩn: Số điện thoại, Họ tên, Email, Địa chỉ, Hạn mức nợ tối đa (`DebtLimit`), Hạng thành viên ban đầu.
   - Validation dữ liệu: Kiểm tra định dạng SĐT Việt Nam, bắt buộc Họ tên, kiểm tra tính hợp lệ của hạn mức nợ.
3. **Xem chi tiết khách hàng (Customer Detail View):**
   - Thông tin cá nhân & Thẻ hạng VIP.
   - Thẻ hiển thị công nợ hiện tại (`CurrentDebtAR`), hạn mức nợ (`DebtLimit`), thanh tiến độ % nợ đã dùng.
   - Tab lịch sử đơn hàng (Orders) và tab lịch sử thu nợ / trả nợ (Debt Payment History).
4. **Quy trình Thu nợ & Thanh toán công nợ tích hợp VietQR:**
   - Modal lập phiếu thu nợ: Chọn số tiền thu (toàn bộ hoặc một phần).
   - Chọn phương thức: Tiền mặt (Cash) hoặc Chuyển khoản VietQR.
   - Sinh mã VietQR động chứa số tài khoản thụ hưởng, số tiền nợ cần trả và cú pháp chuyển khoản định danh (`THUNO_<PhoneNumber>`).
   - Tự động đồng bộ với Sổ quỹ (`Cashbook`) khi thu nợ thành công.
5. **Điều chỉnh hạn mức nợ (`DebtLimit` Adjustment):**
   - Phân quyền chỉ `StoreOwner` hoặc `StoreManager` được cấp/thay đổi hạn mức nợ.

### Out-of-Scope (Bên ngoài phạm vi)
- Xử lý nghiệp vụ Backend .NET Core API và lưu DB thực tế (được thực hiện ở phần Backend).
- Bán lẻ tại quầy POS trực tiếp (thuộc phân hệ quầy POS FE-12).
- Gửi tin nhắn SMS Brandname tự động đòi nợ (dự kiến v2).
- Tính năng liên quan đến Đơn hàng Web Store & Vận đơn (FE-26.3 - đã chính thức loại bỏ).

## 4. Người dùng & Phân quyền (User Roles)
- **Store Owner (Chủ cửa hàng):** Toàn quyền xem, thêm, sửa, xóa mềm khách hàng, điều chỉnh hạn mức nợ, xóa nợ đặc biệt, xem báo cáo tổng hợp AR.
- **Store Manager (Quản lý cửa hàng):** Xem, thêm, cập nhật thông tin, điều chỉnh hạn mức nợ theo trần cho phép, lập phiếu thu nợ.
- **Cashier (Thu ngân):** Tra cứu khách hàng theo SĐT, tạo khách hàng mới khi mua hàng, lập phiếu thu nợ / tạo VietQR thu nợ tại quầy. Không được tùy tiện sửa hạn mức nợ.

## 5. Tiêu chí thành công đo lường được (Acceptance Criteria)
1. **Tìm kiếm:** Gõ SĐT hoặc tên khách hàng trả kết quả sau < 300ms với Mock/API data.
2. **Trực quan hóa công nợ:** Hiển thị rõ ràng trạng thái: Xanh (Không nợ), Vàng (Trong hạn mức), Đỏ (Đạt/Vượt hạn mức nợ).
3. **Thanh toán VietQR:** Tạo mã VietQR thanh toán nợ chuẩn định dạng Napas 247 kèm cú pháp tra soát.
4. **UX/UI chuẩn mực:** Giao diện đồng bộ với design system của dự án (TailwindCSS, responsive mượt mà trên cả Desktop POS và máy tính bảng).
5. **Đồng bộ dữ liệu:** Dữ liệu Mock JSON và State Management hoạt động trơn tru không lỗi runtime.
