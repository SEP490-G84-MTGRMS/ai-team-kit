# EXP-2026-10-13-FE08: Khám Phá & Đề Xuất Giải Pháp Frontend Quản Lý Khách Hàng & Công Nợ (Customer CRM & AR)

## 1. Hiện Trạng Hệ Thống & Vấn Đề (Problem Statement)
- **Bối cảnh**: Hệ thống MT-GRMS quản lý cửa hàng tạp hóa và siêu thị mini theo mô hình SaaS Multi-Tenant.
- **Nghiệp vụ cốt lõi**:
  - Thực thể `Customers` trong CSDL đã có các trường: `Id`, `TenantId`, `PhoneNumber`, `FullName`, `Email`, `Address`, `LoyaltyPoints`, `MembershipTier`, `CurrentDebtAR`, `DebtLimit`.
  - Nghiệp vụ mua nợ/mua chịu diễn ra phổ biến với khách quen địa phương. Tuy nhiên, việc kiểm soát hiện tại còn thủ công, thiếu cảnh báo khi vượt trần nợ `DebtLimit`.
  - Khâu thu nợ chưa hỗ trợ tạo mã VietQR động theo đúng số tiền nợ kèm mã định danh, gây tốn thời gian đối soát.
  - Cần hoàn thiện giao diện Frontend cho phân hệ **FE-08 (Customer CRM & Accounts Receivable)** đạt chuẩn UX hiện đại, phản hồi tức thì, hỗ trợ tối đa cho nhân viên thu ngân và chủ cửa hàng.

## 2. Giả Định (Assumptions) & Ràng Buộc (Constraints)
- **Multi-Tenancy**: Mọi dữ liệu khách hàng và giao dịch thu nợ bắt buộc cách ly nghiêm ngặt theo `TenantId`.
- **Định dạng dữ liệu**:
  - Số điện thoại chuẩn Việt Nam (10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09).
  - Tiền tệ: VNĐ (`decimal(18,2)`), hiển thị định dạng chuẩn có dấu phân cách hàng nghìn.
- **Thanh toán VietQR**: Tích hợp chuẩn VietQR Napas 247, sinh mã QR động chứa sẵn: Số tài khoản ngân hàng thụ hưởng, Tên chủ tài khoản, Số tiền nợ cần thanh toán, và Cú pháp nội dung chuyển khoản (`THUNO <SĐT>`).
- **Tech Stack Frontend**:
  - Kiến trúc thành phần React 19 / TypeScript / Vite / TailwindCSS / Ant Design (hoặc bản SPA tương tác nhanh Tailwind + Vue 3 theo mockup chuẩn hiện hành của dự án).
  - State Management: Quản lý cache và trạng thái bằng TanStack Query / Pinia / Vue ref.

## 3. Non-Goals (Phạm vi KHÔNG thực hiện)
- Không can thiệp vào logic bán hàng xuất kho FEFO tại quầy POS trực tiếp (thuộc phạm vi FE-12).
- Không tự động gửi tin nhắn SMS Brandname đòi nợ qua nhà mạng viễn thông (để dành phiên bản v2).
- Không phụ trách tính năng Đơn hàng Web Store & Vận đơn giao hàng (FE-26.3 — đã chính thức loại bỏ).

## 4. Đề Xuất & So Sánh Các Phương Án Thiết Kế UI/UX

### Phương án A: Kiến trúc Dashboard + Bảng dữ liệu + Drawer Trượt Chi Tiết + Quick Action Modal (Đề xuất)
- **Mô tả**:
  - Phía trên: Thẻ KPI tổng quan (Tổng số khách hàng, Tổng công nợ phải thu, Số khách vượt hạn mức nợ, Tổng điểm tích lũy).
  - Khu vực chính: Bảng danh sách khách hàng hỗ trợ tìm kiếm tức thì theo SĐT/Tên, bộ lọc Tier và trạng thái nợ.
  - Khi bấm vào dòng khách hàng: Mở **Drawer trượt từ cạnh phải** hiển thị toàn bộ Profile, thanh % nợ đã dùng, lịch sử mua hàng và lịch sử thu nợ dạng Timeline.
  - Khi bấm "Thu nợ": Mở Modal nhập số tiền và hiển thị mã VietQR động tức thì.
- **Ưu điểm**:
  - Trải nghiệm liền mạch (Zero-page reload), không làm mất ngữ cảnh tìm kiếm của thu ngân.
  - Thao tác nhanh dưới 3 click cho nghiệp vụ thu nợ.
  - Phù hợp màn hình POS cảm ứng và máy tính bảng.
- **Nhược điểm**:
  - Đòi hỏi thiết kế Drawer responsive tốt để không bị tràn trên màn hình nhỏ.

### Phương án B: Kiến trúc Đa trang (Multi-page Navigation truyền thống)
- **Mô tả**: Tách thành 3 trang riêng biệt: `/customers` (Danh sách), `/customers/:id` (Trang hồ sơ chi tiết), `/customers/:id/collect-debt` (Trang tạo phiếu thu nợ).
- **Ưu điểm**: Dễ phân chia route độc lập.
- **Nhược điểm**:
  - Trải nghiệm chậm, nhân viên phải chuyển qua lại giữa các trang.
  - Mất bộ lọc tìm kiếm khi quay lại danh sách.
  - Không tối ưu cho môi trường bán lẻ cần tốc độ cao.

👉 **Quyết định**: Chọn **Phương án A (Drawer + Modal In-place)** để tối ưu tốc độ tác nghiệp bán lẻ.

## 5. Rủi ro & Giải pháp Giảm Thiểu (Risks & Mitigations)
- **Rủi ro 1: Khách hàng thanh toán chuyển khoản nhưng ngân hàng bị trễ Webhook.**
  - *Giải pháp*: Frontend cung cấp nút "Xác nhận đã nhận tiền mặt/chuyển khoản thủ công" có ghi nhận nhân viên xác nhận và lưu vào Audit Log.
- **Rủi ro 2: Nhập số tiền thu nợ lớn hơn số nợ thực tế.**
  - *Giải pháp*: Frontend chặn ngay trên form validation (`Amount <= CurrentDebtAR`), đồng thời có nút bấm nhanh "Thu đủ toàn bộ nợ".
- **Rủi ro 3: Vượt hạn mức nợ khi mua hàng.**
  - *Giải pháp*: Hiển thị badge cảnh báo màu đỏ trực quan khi `CurrentDebtAR >= DebtLimit`, hỗ trợ nhân viên nhận diện ngay lập tức.
