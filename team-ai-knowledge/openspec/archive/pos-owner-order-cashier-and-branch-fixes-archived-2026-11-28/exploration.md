# EXP-2026-11-08-001: Khám phá nguyên nhân gốc rễ và giải pháp sửa 4 vấn đề giao diện & dữ liệu bán hàng POS

## 1. Tóm tắt vấn đề & Khả năng tái hiện (Reproduction)
Đã tái hiện thành công 4 vấn đề trên môi trường dev (Frontend Vite + Backend ASP.NET Core):
1. **Nút "Lịch sử ca cửa hàng" xuất hiện trong POS Header của Chủ cửa hàng**:
   - Khi `isStoreOwner` là `true`, dropdown trong `PosHeader.tsx` render nút mở `/pos/shift`, trong khi trang này đã có sẵn ở thanh điều hướng Dashboard chính (`/store-owner/shifts`).
2. **Nhãn "Chi nhánh: Chi nhánh được phân công" hiển thị mơ hồ**:
   - Trong `InvoiceManagementPage.tsx`, `assignedBranch` so sánh `AN_NHIEN_BRANCHES.find(b => b.id === user.branchId)`.
   - Do `user.branchId` là UUID thực tế (ví dụ `b1000000-0000-0000-0000-000000000001` hoặc seed guid), trong khi `AN_NHIEN_BRANCHES` mock ID có dạng `"BR-AN-01"`, hàm `find()` trả về `undefined` và fallback sang chuỗi mặc định `{ id: user.branchId, name: 'Chi nhánh được phân công' }`.
3. **Chủ cửa hàng không tự động thấy toàn bộ đơn hàng của tất cả chi nhánh**:
   - Khi chuyển đổi tài khoản giữa Thu ngân và Chủ cửa hàng, `branchFilter` không được reset về `'ALL'` (do hook `useEffect` chỉ cập nhật khi `!isStoreOwner`), khiến tài khoản chủ cửa hàng bị kẹt lại chi nhánh của thu ngân vừa đăng xuất.
   - Danh sách chi nhánh trong bộ lọc `availableBranches` chưa kết nạp đầy đủ danh sách chi nhánh thực tế từ backend API `/branches`.
4. **Tên người tạo đơn hàng bị đổi thành Chủ cửa hàng**:
   - Trong `InvoiceManagementPage.tsx` dòng 142: `cashierName: o.cashierName || user?.fullName || (isStoreOwner ? 'Chủ cửa hàng' : 'Thu ngân')`.
   - Backend `Order` entity trong cơ sở dữ liệu và DTO `OrderResponse` hoàn toàn chưa có trường `CashierName`.
   - Kết quả: `o.cashierName` trả về từ API luôn là `undefined`, buộc Frontend phải dùng `user?.fullName`. Do đó, khi tài khoản Chủ cửa hàng đăng nhập để xem danh sách, toàn bộ đơn hàng trước đó (kể cả của thu ngân `Nguyễn Văn Minh`) đều hiển thị người tạo là tên của Chủ cửa hàng!

---

## 2. Phân tích nguyên nhân gốc rễ (Root Cause Analysis)

### Vấn đề 1: `PosHeader.tsx`
- **File / Dòng**: `MT_GRMS_FRONTEND/src/features/pos/components/PosHeader.tsx` (dòng 625–639).
- **Nguyên nhân**: Đang cố ý render nút "Lịch sử ca cửa hàng" cho `isStoreOwner`. Chủ cửa hàng không cần nút này trong POS vì dashboard quản lý tổng đã có trang `/store-owner/shifts`.

### Vấn đề 2 & 3: `InvoiceManagementPage.tsx`
- **File / Dòng**: `MT_GRMS_FRONTEND/src/features/pos/pages/InvoiceManagementPage.tsx` (dòng 73–98, 241–269).
- **Nguyên nhân**:
  1. Chưa gọi API `employeeApi.getBranches()` để lấy danh sách chi nhánh thật dạng `{ id, name }`.
  2. Logic fallback khi không tìm thấy chi nhánh đang trả về chuỗi text cứng `'Chi nhánh được phân công'`.
  3. `useEffect` đồng bộ `branchFilter` chỉ chạy cho `!isStoreOwner`, thiếu nhánh `if (isStoreOwner) setBranchFilter('ALL')`.

### Vấn đề 4: Lưu vết và trả về CashierName
- **File / Dòng**:
  - `MT_GRMS_BACKEND/src/MT_GRMS.Domain/Entities/Sales/Order.cs` (thiếu property `CashierName`).
  - `MT_GRMS_BACKEND/src/MT_GRMS.Application/PosOrders/Dtos/OrderDtos.cs` (`OrderResponse` thiếu field `CashierName`).
  - `MT_GRMS_BACKEND/src/MT_GRMS.Application/PosOrders/OrderService.cs` (`MapToOrderResponse` và `CreateOrderAsync` chưa lưu và map `CashierName`).
  - `MT_GRMS_FRONTEND/src/features/pos/pages/InvoiceManagementPage.tsx` (dòng 142 fallback vào `user?.fullName`).
- **Nguyên nhân**: Payload lúc tạo đơn (`OrderCreateRequest`) đã truyền `CashierName` lên server, nhưng database entity không lưu và response không trả về.

---

## 3. Các phương án giải quyết (Options Considered)

### Phương án A: Chỉ sửa Frontend (Quick workaround - KHÔNG KHUYẾN NGHỊ)
- **Cách làm**:
  - Ẩn nút ca ở Header.
  - Sửa `InvoiceManagementPage` map mock ID và xóa fallback `user?.fullName`.
- **Nhược điểm**: Không giải quyết được gốc rễ vấn đề 4: Tên thu ngân thực tế không được lưu trong DB, sau khi reload trang thì đơn hàng vẫn mất tên thu ngân thật (phải hiển thị "Thu ngân POS").

### Phương án B: Toàn diện Fullstack - Chuẩn hóa Backend Entity + Frontend Dynamic Branches (CHỌN)
- **Backend**:
  - Bổ sung cột `CashierName` (varchar 150) vào bảng `Orders` trong `DbInitializer.cs`.
  - Thêm thuộc tính `public string? CashierName { get; set; }` vào `Order.cs`.
  - Bổ sung `CashierName` vào `OrderResponse` trong `OrderDtos.cs`.
  - Cập nhật `OrderService.cs`: Lưu `request.CashierName` vào `Order.CashierName` khi tạo đơn; map sang `OrderResponse.CashierName` khi lấy danh sách.
- **Frontend**:
  - `PosHeader.tsx`: Ẩn nút "Lịch sử ca cửa hàng" khi `isStoreOwner` là `true`.
  - `InvoiceManagementPage.tsx`:
    - Gọi `employeeApi.getBranches()` nạp danh sách chi nhánh thực tế từ backend.
    - Sửa `assignedBranch`: mapping theo `dbBranches` -> `AN_NHIEN_BRANCHES` -> fallback tên chi nhánh cụ thể (ví dụ `'An Nhiên Mart - Chi nhánh Ba Đình'`), triệt tiêu chuỗi `'Chi nhánh được phân công'`.
    - Đặt `branchFilter = 'ALL'` khi đăng nhập là `isStoreOwner`, hiển thị danh sách tất cả chi nhánh.
    - Sửa mapping `cashierName: o.cashierName || 'Thu ngân POS'` (không bao giờ fallback về `user?.fullName`).

---

## 4. Xử lý dữ liệu đã tồn tại (Existing Data Migration)
- Với các đơn hàng cũ đã lưu trong DB trước đây (chưa có `CashierName`):
  - Khi map trong `OrderService.cs`, nếu `order.CashierName` là null/empty, hệ thống sẽ gán giá trị hiển thị là `"Thu ngân POS"` (thay vì để trống hoặc lấy tên tài khoản xem đơn).
- Không làm xáo trộn dữ liệu doanh thu hay tồn kho.

---

## 5. Giả định (Assumptions) & Non-Goals
- **Assumptions**: API `/branches` luôn hoạt động và trả về danh sách chi nhánh của tenant hiện tại.
- **Non-Goals**: Không can thiệp vào nghiệp vụ đóng/mở ca hay tính tiền két của thu ngân; không thay đổi quy tắc kiểm tra lịch trực ca đã hoàn thành ở change trước.
