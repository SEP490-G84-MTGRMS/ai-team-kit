# Đánh giá phản biện (Skeptic Review) — pos-owner-order-cashier-and-branch-fixes

## 1. Đánh giá 5 khía cạnh chất lượng (D1 – D5)

### D1: Completeness (Tính đầy đủ) — ĐẠT (5/5)
- Đặc tả đã bao phủ trọn vẹn 4 yêu cầu của user:
  1. Ẩn nút lịch sử ca trong POS header khi đăng nhập Owner.
  2. Hiển thị đúng tên chi nhánh cụ thể thay vì chuỗi cứng.
  3. Chủ cửa hàng xem được đơn hàng toàn chuỗi và lọc theo chi nhánh.
  4. Lưu vết và bảo toàn `CashierName` thực tế khi đổi tài khoản xem đơn.

### D2: Correctness (Đúng root cause hay chỉ triệu chứng) — ĐẠT (5/5)
- **Kiểm tra Root Cause**:
  - Lỗi tên thu ngân bị đổi thành tên chủ cửa hàng KHÔNG PHẢI chỉ là lỗi giao diện đơn thuần mà xuất phát từ việc database và API response không hề lưu / trả về `CashierName`. Nếu chỉ sửa UI gán cứng hoặc lấy sessionStorage thì khi reload hoặc vào từ máy khác vẫn bị sai. Việc thêm cột `CashierName` vào `Orders`, lưu snapshot khi tạo đơn và map vào `OrderResponse` giải quyết triệt để tận gốc rễ.
  - Lỗi "Chi nhánh được phân công" xuất phát từ việc so sánh chuỗi GUID với mock string `"BR-AN-01"`. Việc load động từ API `/branches` đảm bảo tính chính xác lâu dài.

### D3: Coherence (Tính nhất quán) — ĐẠT (5/5)
- Nhất quán với kiến trúc Clean Architecture:
  - Domain: `Order.cs` có `CashierName`.
  - Application DTO: `OrderResponse` và `OrderCreateRequest` đồng bộ `CashierName`.
  - Infrastructure: `DbInitializer` thêm cột SQL an toàn (`character varying(150)`).
  - Presentation: `InvoiceManagementPage.tsx` dùng `employeeApi.getBranches()` như các trang khác trong hệ thống (`PosShiftPage`, `ShiftConfigPage`).

### D4: Constraints (Ràng buộc kỹ thuật & quy tắc dự án) — ĐẠT (5/5)
- Không phá vỡ migration cũ: Sử dụng DDL an toàn `ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "CashierName" character varying(150);`.
- Không làm gián đoạn API: `OrderResponse` thêm optional property `CashierName = null`, tương thích ngược 100% với các client hiện có.

### D5: Blast Radius (Phạm vi ảnh hưởng) — THẤP / KIỂM SOÁT TỐT (4.8/5)
- Chỉ tác động đến:
  - `PosHeader.tsx`: Ẩn 1 nút dropdown khi là `isStoreOwner`.
  - `InvoiceManagementPage.tsx`: Nhãn chi nhánh và hiển thị cột người tạo.
  - `OrderService.cs`: Map thêm trường `CashierName`.
- Các tính năng thanh toán, chiết khấu, FEFO, phân bổ lô hàng hoàn toàn không bị ảnh hưởng.

---

## 2. Kiểm tra tương thích ngược & Dữ liệu lịch sử (Backward Compatibility)
- **Đơn hàng cũ chưa có `CashierName`**: Khi map sang `OrderResponse`, nếu `order.CashierName` rỗng, gán mặc định `"Thu ngân POS"`, tuyệt đối không lấy `user?.fullName`.
- **Đơn hàng mới**: Lưu chính xác snapshot họ tên thu ngân truyền từ POS Checkout.

---

## 3. Kết luận
- **Đánh giá chung**: CHẤP NHẬN (PASS).
- Sẵn sàng tiến hành lập `tasks.md` và thực thi bước Apply.
