# EXP-2026-10-31-002: Khảo sát Triển khai Chức năng Switch Đơn vị tính trong Chi tiết Hàng hóa (Product Detail Switch Unit)

## 1. Problem Statement
Hiện tại, [`ProductDetailModal.tsx`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/product/components/ProductDetailModal.tsx) chỉ hiển thị thông tin sản phẩm (Mã hàng, Mã vạch, Giá bán, Giá vốn, Tồn kho) cố định theo Đơn vị cơ bản (`baseUnit`). 
Khi hàng hóa có nhiều đơn vị tính quy đổi (ví dụ: chai / lốc / thùng):
- Người dùng chỉ thấy được danh sách tỷ lệ quy đổi trong bảng tĩnh ở cuối tab Thông tin.
- Người dùng không thể xem được Giá bán, Giá vốn (StoreOwner), Số lượng tồn kho quy đổi, Mã hàng (SKU riêng) và Mã vạch riêng của từng đơn vị quy đổi ngay trong giao diện chi tiết.
- Cần bổ sung khả năng chuyển đổi đơn vị tính (Switch Unit) linh hoạt ngay trong `ProductDetailModal`, giúp tự động cập nhật toàn bộ các chỉ số chi tiết tương ứng với đơn vị được chọn.

---

## 2. Context & Tech Stack
- **Frontend Codebase:**
  - `src/features/product/components/ProductDetailModal.tsx`: Component hiển thị chi tiết sản phẩm.
  - `src/features/product/types/index.ts`: Các type `ProductItem`, `UomConversion`, `ProductUnitResponse`.
  - `src/features/product/api/productApi.ts`: API `getProductUnits(productId: string)`.
- **Backend API:**
  - `GET /api/v1/products/{id}/units`: Đã có sẵn trong [`ProductUnitsController.cs`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_BACKEND/src/MT_GRMS.Api/Controllers/ProductUnitsController.cs) trả về danh sách đơn vị tính quy đổi.

---

## 3. Assumptions & Non-Goals

### Assumptions
1. Sản phẩm luôn có ít nhất một đơn vị cơ bản (`product.baseUnit`).
2. Tồn kho trong hệ thống (`product.onHand`) được lưu trữ chuẩn hóa theo đơn vị cơ bản.
3. Khi chuyển sang đơn vị quy đổi với tỷ lệ $K$ (`conversionRate`):
   - Tồn kho quy đổi = $\lfloor \text{onHand} / K \rfloor$.
   - Số lượng lẻ còn lại = $\text{onHand} \pmod K$ (được hiển thị chú thích chi tiết nếu có).
   - Giá vốn quy đổi (nếu là StoreOwner) = $\text{costPrice} \times K$.
   - Giá bán quy đổi = Giá bán riêng của đơn vị quy đổi (`uom.price`).
4. Quyền xem giá vốn tuân thủ nghiêm ngặt **BR-SEC-01**: Chỉ `StoreOwner` mới được xem giá vốn cơ bản và giá vốn quy đổi.

### Non-Goals
1. Không sửa đổi dữ liệu sản phẩm trong modal xem chi tiết (việc sửa thông tin do `ProductFormModal` đảm nhiệm).
2. Không thay đổi schema cơ sở dữ liệu backend.

---

## 4. Các Phương án Thiết kế

### Phương án 1: Local Derived State + Unit Selector Pills & Bảng ĐVT tương tác (Đề xuất)
- `ProductDetailModal` duy trì state `selectedUnitName` (khởi tạo mặc định = `product.baseUnit`).
- Bổ sung thanh chọn đơn vị (Pill Switcher) nổi bật trên thanh Header hoặc ngay trên đầu tab Thông tin:
  `[ chai (Cơ sở) ]  [ thung (x24) ]`
- Đồng thời cho phép click vào bất kỳ hàng nào trong bảng "Đơn vị tính & Quy đổi giá" để chuyển sang đơn vị đó (highlight dòng đang chọn).
- Tính toán derived state tức thời:
  - `displayCode`: mã hàng của đơn vị hoặc mã hàng chính.
  - `displayBarcode`: mã vạch riêng của đơn vị hoặc mã vạch chính.
  - `displayPrice`: giá bán của đơn vị.
  - `displayCost`: giá vốn tính theo tỷ lệ (chỉ hiện khi vai trò là StoreOwner).
  - `displayStock`: tồn kho quy đổi + chú thích số lượng lẻ theo đơn vị cơ bản.
- **Ưu điểm:** Phản hồi tức thời (0ms delay), trải nghiệm người dùng cực tốt, an toàn, dễ bảo trì và viết Unit test.
- **Nhược điểm:** Cần đảm bảo nạp đủ `uomConversions` nếu sản phẩm mở từ danh sách chưa có sẵn đơn vị tính.

### Phương án 2: Gọi API fetch riêng mỗi lần chuyển đơn vị tính
- Mỗi khi người dùng bấm chọn một đơn vị, gửi request lên Backend để truy vấn thông tin riêng của đơn vị đó.
- **Ưu điểm:** Độc lập với dữ liệu truyền từ ngoài vào.
- **Nhược điểm:** Tốn tài nguyên mạng và tạo độ trễ (delay) không cần thiết khi người dùng lướt xem các đơn vị, vì thông tin quy đổi đã có sẵn trong cấu trúc sản phẩm.

---

## 5. Phương án Lựa chọn & Rủi ro
- **Phương án lựa chọn:** Chọn **Phương án 1** (kết hợp tự động gọi `productApi.getProductUnits(product.id)` trong `useEffect` nếu sản phẩm chưa có `uomConversions`).
- **Đánh giá rủi ro & Giải pháp:**
  | Rủi ro | Giải pháp |
  |---|---|
  | `product.uomConversions` bị `undefined` hoặc rỗng khi mở modal | Kiểm tra nếu `uomConversions` chưa có, tự động gọi `getProductUnits(product.id)` để lấy danh sách đầy đủ. |
  | Phép chia cho 0 khi tính tỷ lệ quy đổi | Bắt buộc `conversionRate` tối thiểu là 1 (`Math.max(1, uom.conversionRate)`). |
  | Lộ giá vốn quy đổi cho thu ngân (BR-SEC-01) | Áp dụng triệt để điều kiện `userRole === 'StoreOwner'` cho cả giá vốn cơ bản và giá vốn quy đổi. |
