# Exploration: Pre-Order FEFO Allocation & Smart Product Selector UX

## 1. Hiện trạng Codebase (Current State)
- **Backend:** 
  - `OrderService.cs`: Đã cài đặt `CreatePreOrderAsync` thực hiện trừ tồn kho theo FEFO thông qua repository `GetBranchStocksForProductFefoAsync(branchId, productId)`.
  - `PosOrderServiceTests.cs`: Đã có test cơ bản cho tạo, hoàn tất và hủy đơn đặt trước, nhưng chưa có test kiểm chứng trường hợp cụ thể: **một sản phẩm có nhiều lô với hạn sử dụng khác nhau**, để đảm bảo lô cận date nhất bị trừ trước.
- **Frontend:**
  - `CreatePreOrderModal.tsx`: Đang sử dụng thẻ HTML `<select>` thô sơ. Danh sách sản phẩm không thể lọc hay tìm kiếm bằng bàn phím. Khi chọn xong phải bấm thêm nút "Thêm" tách biệt. Trải nghiệm chậm và bất tiện.

## 2. Giả định (Assumptions)
- `BranchStock` luôn lưu trữ `ExpireDate` và `QuantityOnHand` cho từng lô hàng của từng chi nhánh.
- Danh sách sản phẩm khả dụng (`availableProducts`) được nạp sẵn từ danh mục chi nhánh hoặc POS cache.

## 3. Những gì không làm (Non-Goals)
- Không thay đổi schema bảng `Orders`, `OrderDetails`, hay `BranchStocks`.
- Không thay đổi luồng thanh toán và hoàn tất đơn đặt trước đã hoàn thiện trước đó.

## 4. Các phương án kỹ thuật & Đánh giá (Options)
### A. Phương án UI chọn sản phẩm trong Modal
- **Phương án 1 (Hiện tại):** Thẻ HTML `<select>` tĩnh.
  - *Ưu:* Đơn giản, ít code.
  - *Nhược:* Rất khó dùng khi danh sách mặt hàng lớn (> 20 món), không hỗ trợ barcode scanner, không có gợi ý gõ chữ.
- **Phương án 2 (Đề xuất):** Smart Autocomplete Search Box + Floating Dropdown + 1-Click Add.
  - *Ưu:* Tìm kiếm siêu tốc theo tên hoặc barcode (hỗ trợ tiếng Việt không dấu/có dấu), hiển thị trực quan giá và tồn kho khả dụng, nhấp chuột hoặc Enter là thêm ngay vào giỏ hàng.
  - *Nhược:* Cần xử lý click-outside và debounce tìm kiếm nhẹ.
  - **Lựa chọn:** Phương án 2.

### B. Phương án Unit Test FEFO
- Tạo test case độc lập `CreatePreOrderAsync_MultiBatchFEFO_AllocatesFromEarliestExpiryDateFirst` với 2 lô hàng có `ExpireDate` cách biệt, kiểm tra chính xác `QuantityOnHand` của từng lô sau khi gọi `CreatePreOrderAsync`.

## 5. Rủi ro & Cách giảm thiểu (Risks & Mitigations)
- **Rủi ro:** Khi danh sách tìm kiếm xổ xuống, nếu người dùng click ra ngoài mà dropdown không đóng sẽ che các nút khác.
  - **Giảm thiểu:** Sử dụng `useRef` và listener `mousedown` để tự động đóng dropdown khi click ra ngoài.
