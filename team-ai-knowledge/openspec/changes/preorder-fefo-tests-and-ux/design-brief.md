# Design Brief: Pre-Order FEFO Unit Tests & Smart Product Selector UX

## 1. Luồng người dùng (User Flow)
```
[Thu ngân bấm "+ Tạo đơn đặt trước"]
             │
             ▼
[Modal mở ra - Con trỏ tự focus vào ô tìm kiếm]
             │
             ▼
[Thu ngân gõ tên SP hoặc Barcode: "sữa", "mì", "coca"]
             │
             ▼
[Hiển thị Dropdown gợi ý ngay lập tức]
├─ Tên sản phẩm, Mã SKU
├─ Đơn giá (VND)
└─ Số lượng tồn kho (Tồn kho: 50)
             │
             ▼ (Nhấp chọn sản phẩm)
[Sản phẩm tự động thêm vào Bảng mặt hàng đặt trước (1-Click Add)]
├─ Tự động tăng Qty nếu sản phẩm đã có trong bảng
└─ Xóa ô tìm kiếm để sẵn sàng gõ món tiếp theo
             │
             ▼
[Chỉnh số lượng dễ dàng bằng nút [-] và [+] hoặc gõ số]
             │
             ▼
[Hệ thống tự động tính tiền cọc 10%] ──► Bấm [✓ Xác Nhận Tạo Đơn & Khóa Kho]
             │
             ▼
[Backend nhận request, quét kho FEFO và trừ lô cận date nhất trước]
```

## 2. Thiết kế Component Frontend
- **File sửa đổi:** `MT_GRMS_FRONTEND/src/features/pos/components/modals/CreatePreOrderModal.tsx`
- **State mới:**
  - `productSearchText: string`: Từ khóa tìm kiếm.
  - `isSearchDropdownOpen: boolean`: Điều khiển hiển thị dropdown gợi ý.
  - `filteredProducts: Product[]`: Danh sách lọc theo tên, SKU, barcode (hỗ trợ tiếng Việt không dấu).
- **UX Controls:**
  - Nút `+` và `-` trực tiếp bên cạnh ô nhập số lượng của từng dòng sản phẩm.
  - Nút Xóa `Trash2` để bỏ món khỏi đơn.
  - Phím tắt Enter khi gõ tìm kiếm để chọn sản phẩm đầu tiên nếu khớp.

## 3. Thiết kế Unit Test Backend
- **File:** `MT_GRMS_BACKEND/tests/MT_GRMS.UnitTests/PosOrderServiceTests.cs`
- **Test Case:** `CreatePreOrderAsync_MultiBatchFEFO_AllocatesFromEarliestExpiryDateFirst`
  - Tạo `BatchA` (HSD: T+5 ngày, Tồn: 3)
  - Tạo `BatchB` (HSD: T+20 ngày, Tồn: 5)
  - Đặt trước số lượng: 4 cái
  - Kiểm tra kết quả:
    - `BatchA.QuantityOnHand == 0` (Bị trừ trọn vẹn 3 cái)
    - `BatchB.QuantityOnHand == 4` (Bị trừ 1 cái)
    - OrderDetails có 2 dòng (dòng 1: qty 3, dòng 2: qty 1)
    - Tổng tiền và tiền cọc $\ge 10\%$ hợp lệ.
