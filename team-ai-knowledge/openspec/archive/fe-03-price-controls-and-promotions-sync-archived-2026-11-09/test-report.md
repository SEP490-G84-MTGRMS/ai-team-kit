---
verdict: PASS
date: 2026-11-09
tester: "@sonnguyenn10"
change: fe-03-price-controls-and-promotions-sync
---

# Báo cáo kiểm thử: fe-03-price-controls-and-promotions-sync

## 1. Ma trận kiểm thử theo Requirements (RTM)

| Requirement | Mã Test Case | Kịch bản kiểm thử | Kết quả | Ghi chú |
|-------------|--------------|-------------------|---------|---------|
| **REQ-PRICE-CONTROL-01** (FE-03.1) | TC-PC-01 | Nhập giá bán thấp hơn giá vốn tại ProductFormModal & EditStoreProductModal | **PASS** | Banner cảnh báo viền vàng/cam hiển thị kèm thông báo yêu cầu quản lý xác nhận |
| **REQ-PRICE-CONTROL-01** (FE-03.1) | TC-PC-02 | Backend ghi nhận cờ `IsBelowCost = true` và `ManagerApprovedBy` | **PASS** | Lưu vết chính xác vào bảng ProductPriceHistories |
| **REQ-PRICE-HISTORY-02** (FE-03.2) | TC-PH-01 | Thay đổi giá bán Master (toàn chuỗi) | **PASS** | Tự động tạo bản ghi PriceScope=MASTER, Reason="Điều chỉnh giá bán", không ép user nhập lý do |
| **REQ-PRICE-HISTORY-02** (FE-03.2) | TC-PH-02 | Thay đổi giá bán riêng theo Chi nhánh | **PASS** | Tự động tạo bản ghi PriceScope=BRANCH, BranchId gán theo chi nhánh đang sửa |
| **REQ-PRICE-HISTORY-02** (FE-03.2) | TC-PH-03 | Gọi API `GET /api/products/{id}/price-history` | **PASS** | Trả về danh sách sắp xếp giảm dần theo CreatedAt, hỗ trợ filter theo branchId |
| **REQ-PRICE-HISTORY-02** (FE-03.2) | TC-PH-04 | Mở `PriceHistoryModal` từ nút "Lịch sử giá" trên modal | **PASS** | Hiển thị timeline biến động giá, % tăng/giảm, nhãn Toàn chuỗi/Chi nhánh và giá vốn |
| **REQ-PROMO-TIERS-PERSISTENCE-03** | TC-PT-01 | Lưu chương trình khuyến mãi nhiều bậc thang (Bậc 1, 2, 3...) | **PASS** | Tuần tự hóa metadata `[TIERS_JSON]` vào Description, bảo toàn toàn bộ bậc khi F5 |
| **REQ-PROMO-TIERS-PERSISTENCE-03** | TC-PT-02 | Hiển thị bậc thang tại `PromotionTable` | **PASS** | Hiển thị đúng số mức cấu hình, mô tả sạch không chứa chuỗi metadata kỹ thuật |
| **REQ-PROMO-GIFT-INVENTORY-PICKER-04** | TC-PG-01 | Chọn sản phẩm quà tặng từ dropdown kho hàng trong Mua X tặng Y | **PASS** | Cập nhật nguyên tử không bị mất `giftProductId`, tự động điền ĐVT |
| **REQ-VOUCHER-DATE-VALIDATION-05** | TC-VD-01 | Áp dụng voucher có StartDate là ngày hiện tại (09/11/2026) tại POS | **PASS** | Hợp lệ ngay từ 00:00:00 của ngày bắt đầu (+07:00), không báo lỗi hiệu lực |
| **REQ-VOUCHER-DATE-VALIDATION-05** | TC-VD-02 | Kiểm tra thời điểm kết thúc hiệu lực voucher | **PASS** | Có hiệu lực trọn vẹn đến 23:59:59 của EndDate |

---

## 2. Kết quả chạy bộ kiểm thử tự động

### 2.1 Backend Tests (`dotnet test MT_GRMS_BACKEND.sln`)
```
Test run for MT_GRMS.UnitTests.dll (.NETCoreApp,Version=v8.0)
Passed! - Failed: 0, Passed: 533, Skipped: 0, Total: 533, Duration: 2 s

Test run for MT_GRMS.IntegrationTests.dll (.NETCoreApp,Version=v8.0)
Passed! - Failed: 0, Passed: 44, Skipped: 0, Total: 44, Duration: 3 s

Tổng cộng: 577/577 test cases PASS (100%)
```

### 2.2 Frontend Build & Lint (`npm run build`)
```
> frontend@0.0.0 build
> tsc -b && vite build

vite v8.3.1 building client environment for production...
✓ 2580 modules transformed.
dist/index.html                     1.16 kB │ gzip:     0.68 kB
dist/assets/index-DzkNyULc.css    315.36 kB │ gzip:    49.21 kB
dist/assets/index-CQAAJlNq.js   4,510.84 kB │ gzip: 1,201.83 kB
✓ built in 915ms
0 compilation errors.
```

---

## 3. Lỗi tồn đọng (Known Issues)
- **Không có** (0 defects). Mọi yêu cầu nghiệp vụ và kỹ thuật đều đạt tiêu chí nghiệm thu.
