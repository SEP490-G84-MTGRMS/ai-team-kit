# EXP-2026-10-12-FE07: Khám Phá & Thiết Kế Kiến Trúc Frontend Quản Lý Chi Phí Dịch Vụ & Vận Hành (FE-07)

## 1. Problem Statement
Trong mô hình quản lý chuỗi cửa hàng tạp hóa bán lẻ đa chi nhánh (MT-GRMS), bên cạnh các chi phí mua hàng từ nhà cung cấp (FE-06), cửa hàng phát sinh liên tục các khoản chi phí vận hành thường nhật và dịch vụ phụ trợ như:
- Tiền điện, nước, internet, thuê mặt bằng, bảo dưỡng trang thiết bị (tủ mát, cân điện tử, camera), vệ sinh, văn phòng phẩm.
- Hiện tại, hệ thống Frontend chưa có giao diện nghiệp vụ cho Quản lý cửa hàng (Store Manager) và Chủ chuỗi (Store Owner) để:
  1. Theo dõi tổng quan các khoản chi phí theo từng chi nhánh và danh mục.
  2. Ghi nhận tức thời chi phí phát sinh kèm hóa đơn, hạn thanh toán (Due Date).
  3. Quản lý trạng thái thanh toán và tự động đồng bộ sinh phiếu chi vào Sổ quỹ tiền mặt (FE-17) để bảo toàn tính toàn vẹn tài chính.

## 2. Context & Background
- **Repo Frontend**: `MT_GRMS_FRONTEND` (Vite, React 19, TypeScript, Tailwind CSS v4, Lucide-react, TanStack Query v5, Zustand v5, Zod).
- **Backend Model**: Bảng `ServiceExpenses` liên kết với `BranchID`, `CashBooks` (`CashBookID`), lưu trữ số tiền (`amount`), danh mục (`category`), trạng thái (`status`: `Pending`, `Paid`, `Cancelled`), hạn thanh toán (`DueDate`), và hóa đơn chứng từ (`AttachedBillUrl`).
- **Quy chuẩn thiết kế (Design System)**:
  - Phong cách chuẩn KiotViet: Rõ ràng, thực dụng, bo tròn toàn diện (Full Pill 9999px cho Button/Badge, 24px cho Card/Modal container).
  - Bảng màu chủ đạo: Electric Blue (`--blue-primary: #0066ff`), Blue Hover (`#0052cc`), Background Soft Blue (`#f7faff`).
  - Màu trạng thái: Green Money (`#00c853` - Đã thanh toán), Orange Accent (`#ff9500` - Chờ thanh toán), Red Accent (`#ff3b30` - Quá hạn / Hủy).
  - Phông chữ chuẩn: `Be Vietnam Pro`, cấm animation rung lắc nhún nhảy vô tận.

## 3. Constraints (Ràng buộc kỹ thuật & nghiệp vụ)
1. **Không cài đặt thư viện UI thừa**: Tận dụng triệt để Tailwind CSS v4 + Lucide-react theo đúng cấu trúc hiện có của repo `MT_GRMS_FRONTEND`.
2. **Multi-tenant & Branch Isolation**: Mọi thao tác truy vấn và tạo chi phí phải gắn chặt với ngữ cảnh Tenant và Branch hiện tại của tài khoản đăng nhập.
3. **Phân quyền truy cập (RBAC)**: Chỉ Store Owner và Store Manager mới có quyền tạo và thanh toán chi phí. Nhân viên thu ngân (Cashier) chỉ được xem (hoặc ẩn hoàn toàn menu này).
4. **Định dạng tiền tệ & thời gian**:
   - Tiền tệ hiển thị theo chuẩn Việt Nam (VND, phân cách hàng nghìn chấm/phẩy, không hiển thị số thập phân thừa).
   - Ngày tháng hiển thị dạng `DD/MM/YYYY` (sử dụng thư viện `dayjs`).

## 4. Assumptions (Giả định)
- **[ASSUMPTION-01]**: Quản lý phiên đăng nhập đã lưu trữ `access_token` và thông tin chi nhánh mặc định (`currentBranchId`) trong LocalStorage/Store.
- **[ASSUMPTION-02]**: Backend cung cấp bộ REST API chuẩn dưới `/api/v1/service-expenses` hỗ trợ phân trang, lọc theo chi nhánh/trạng thái/ngày, và action thanh toán (`/pay`).
- **[ASSUMPTION-03]**: Ảnh hóa đơn có thể được tải lên dưới dạng File qua API Upload hoặc nhập URL trực tiếp từ dịch vụ lưu trữ đám mây.

## 5. Scope & Non-Goals
### In Scope (Phạm vi thực hiện)
- **Màn hình chính (`ServiceExpensesPage`)**:
  - 4 Thẻ KPI thống kê: Tổng chi phí tháng này, Tổng tiền chờ thanh toán, Tổng tiền đã thanh toán, Số khoản quá hạn.
  - Thanh công cụ lọc đa chiều (Search từ khóa, Lọc chi nhánh, Danh mục chi phí, Trạng thái, Khoảng ngày).
  - Bảng dữ liệu hiển thị phân trang (`ExpenseTable`), có badge trạng thái bo tròn Pill, cột thao tác nhanh (Thanh toán, Xem hóa đơn, Hủy).
- **Modal Ghi nhận chi phí (`CreateExpenseModal`)**:
  - Form nhập liệu có validation chặt chẽ bằng `Zod` (Danh mục, Chi nhánh, Số tiền > 0, Ngày chi, Hạn thanh toán, Nhà cung cấp, Hóa đơn đính kèm, Ghi chú).
- **Modal Xác nhận thanh toán (`PayExpenseModal`)**:
  - Hiển thị thông tin khoản chi, chọn hình thức thanh toán (Tiền mặt / Chuyển khoản ngân hàng), checkbox "Tự động sinh phiếu chi trong Sổ quỹ (FE-17)".
- **Modal Xem trước hóa đơn (`BillPreviewModal`)**:
  - Phóng to ảnh chứng từ đính kèm hoặc thông báo nếu chưa có hóa đơn.

### Out of Scope (Non-Goals)
- Không xây dựng phân hệ kế toán hạch toán nợ có phức tạp (Double-entry ledger).
- Không tự động nhận diện chữ hóa đơn bằng AI/OCR trong phiên bản này.
- Không sửa đổi mã nguồn nghiệp vụ nội tại của FE-17 Cashbook (chỉ gọi API tích hợp).

## 6. Đánh Giá Các Phương Án Kiến Trúc Component & State
### Phương án A: Pure React Query + Local Page State + URL Query Params (ĐƯỢC CHỌN)
- **Mô tả**: Sử dụng TanStack Query cho Server State (caching, invalidation, mutation). Lưu bộ lọc (branch, status, date) trên URL SearchParams để giữ nguyên bộ lọc khi reload/chia sẻ link. Sử dụng local modal state trong React.
- **Ưu điểm**:
  - Nhẹ nhàng, phản ánh đúng URL-driven architecture chuẩn KiotViet.
  - F5 reload vẫn giữ bộ lọc đang chọn.
  - Code gọn, không sinh Zustand boilerplate không cần thiết.
- **Nhược điểm**: Cần utility parse/serialize query params chuẩn.

### Phương án B: Zustand Global Store cho toàn bộ Filters & Modals
- **Mô tả**: Tạo `useServiceExpenseStore.ts` để lưu `activeFilters`, `selectedExpense`, `isCreateOpen`, `isPayOpen`.
- **Ưu điểm**: Dễ gọi action mở modal từ mọi component lồng nhau.
- **Nhược điểm**: Khi reload trang sẽ mất toàn bộ filter nếu không cấu hình persist; làm tăng complexity khi state không cần thiết phải ở mức global.

## 7. Rủi Ro & Biện Pháp Giảm Thiểu
1. **Rủi ro Double-Submit khi thanh toán**: Người dùng click nhiều lần nút "Xác nhận thanh toán" do mạng chậm gây sinh 2 phiếu chi.
   - *Giảm thiểu*: Vô hiệu hóa nút (disabled) và hiển thị loading spinner ngay khi `isPending = true`.
2. **Rủi ro sai lệch định dạng số tiền**: Nhập chuỗi có ký tự đặc biệt hoặc số âm.
   - *Giảm thiểu*: Custom Input Number định dạng tiền tệ thời gian thực và Zod schema kiểm tra `amount > 0`.
