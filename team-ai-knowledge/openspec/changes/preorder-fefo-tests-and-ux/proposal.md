# Proposal: Pre-Order FEFO Backend Unit Tests & Smart Product Selector UX

## 1. Vấn đề (Problem)
1. **Thiếu Unit Test chuyên sâu về phân bổ lô FEFO:** Mặc dù Backend `OrderService.CreatePreOrderAsync` đã có logic trừ tồn kho theo nguyên tắc FEFO (First Expired, First Out - lô hạn sử dụng gần nhất được ưu tiên khóa trước), hệ thống cần bổ sung Unit Test kiểm chứng trường hợp một sản phẩm có nhiều lô hạn dùng khác nhau để đảm bảo thứ tự trừ lô chính xác 100%.
2. **Giao diện chọn sản phẩm đặt trước khó sử dụng:** `CreatePreOrderModal.tsx` hiện tại đang sử dụng thẻ HTML `<select>` truyền thống để chọn mặt hàng. Khi cửa hàng có hàng chục đến hàng trăm sản phẩm, dropdown bị dài, không hỗ trợ gõ tìm kiếm theo tên hoặc barcode, nhân viên phải chọn trong select rồi bấm thêm nút "Thêm" riêng biệt, gây thao tác chậm và trải nghiệm người dùng kém tại quầy thu ngân.

## 2. Mục tiêu (Objectives)
- **Backend:** Giải thích rõ ràng kiến trúc Backend xử lý Đơn đặt trước & Giữ kho FEFO; bổ sung Unit Test kiểm thử đa lô FEFO trong `PosOrderServiceTests.cs`.
- **Frontend UI/UX:** Nâng cấp khu vực chọn sản phẩm trong `CreatePreOrderModal` thành bộ tìm kiếm sản phẩm thông minh (Autocomplete Instant Search):
  - Ô tìm kiếm hỗ trợ gõ tên sản phẩm, mã SKU hoặc Barcode.
  - Hiển thị danh sách gợi ý nổi (Dropdown) trực quan với tên, giá bán, số lượng tồn kho.
  - Bấm chọn hoặc nhấn Enter là thêm ngay vào đơn hàng (1-click add), không cần bấm nút "Thêm" rườm rà.
  - Bảng danh sách hàng đã chọn có nút tăng giảm số lượng `+` / `-` và xóa nhanh.

## 3. Phạm vi (Scope)
- **In-Scope:**
  - Viết Unit Test `CreatePreOrderAsync_MultiBatchFEFO_AllocatesFromEarliestExpiryDateFirst` trong `PosOrderServiceTests.cs`.
  - Nâng cấp Component `CreatePreOrderModal.tsx` với Autocomplete Product Search Box và điều khiển số lượng tiện lợi.
  - Kiểm thử `dotnet test` và `npm run build`.
- **Out-of-Scope:**
  - Thay đổi cấu trúc bảng cơ sở dữ liệu `Orders`, `OrderDetails`, `BranchStocks`.

## 4. Người dùng & Role liên quan
- `STORE_OWNER` (Chủ cửa hàng) & `CASHIER` / `EMPLOYEE` (Thu ngân tại quầy POS tạo đơn đặt trước giữ kho cho khách).

## 5. Tiêu chí thành công (Success Criteria)
- [x] Unit test Backend phân bổ FEFO chạy xanh 100% (`dotnet test`).
- [x] Giao diện Modal tạo đơn đặt trước có ô tìm kiếm sản phẩm nhạy, hiển thị gợi ý mượt mà và thao tác nhanh chóng tại quầy.
- [x] Build frontend không có bất kỳ lỗi TypeScript hay cảnh báo nào (`npm run build`).
