# Design Brief: fe-03-price-controls-and-promotions-sync

## 1. Thiết kế CSDL (Database Schema Changes)

### Bảng mới: `ProductPriceHistories`
Lưu vết toàn bộ các lần biến động giá bán (Master & Chi nhánh):

```sql
CREATE TABLE "ProductPriceHistories" (
    "Id" uuid NOT NULL PRIMARY KEY,
    "TenantId" character varying(50) NOT NULL,
    "ProductId" uuid NOT NULL REFERENCES "Products"("Id") ON DELETE CASCADE,
    "BranchId" uuid NULL REFERENCES "Branches"("Id") ON DELETE SET NULL,
    "ProductUnitId" uuid NULL,
    "PriceScope" character varying(20) NOT NULL, -- 'MASTER' | 'BRANCH'
    "PriceType" character varying(20) NOT NULL DEFAULT 'SELLING_PRICE',
    "OldPrice" decimal(18,2) NOT NULL,
    "NewPrice" decimal(18,2) NOT NULL,
    "CostPriceSnapshot" decimal(18,2) NULL,
    "IsBelowCost" boolean NOT NULL DEFAULT false,
    "ManagerApprovedBy" character varying(100) NULL,
    "ManagerApprovalReason" character varying(255) NULL,
    "ChangedByUserId" character varying(50) NOT NULL,
    "ChangedByUserName" character varying(100) NOT NULL,
    "Reason" character varying(255) NOT NULL DEFAULT 'Điều chỉnh giá bán',
    "CreatedAt" timestamp without time zone NOT NULL DEFAULT (now() at time zone 'utc')
);

CREATE INDEX "IX_ProductPriceHistories_Tenant_Product" ON "ProductPriceHistories" ("TenantId", "ProductId", "CreatedAt" DESC);
CREATE INDEX "IX_ProductPriceHistories_Tenant_Branch" ON "ProductPriceHistories" ("TenantId", "BranchId");
```

---

## 2. API Contract & Endpoints

| Method | Endpoint | Request Payload | Response Body | Mô tả |
|---|---|---|---|---|
| `GET` | `/api/products/{id}/price-history` | Query: `branchId?: Guid` | `ApiResponse<List<ProductPriceHistoryDto>>` | Lấy lịch sử biến động giá của sản phẩm (Master và/hoặc Chi nhánh) |
| `PUT` | `/api/products/{id}` | `ProductUpdatePayload` + `confirmBelowCost?: boolean` | `ApiResponse<ProductResponse>` | Cập nhật sản phẩm Master. Nếu giá thay đổi, tự động ghi log `ProductPriceHistory`. Cảnh báo nếu bán dưới vốn. |
| `PUT` | `/api/branches/{branchId}/products/{productId}` | `EditStoreProductInput` | `ApiResponse<BranchProductItem>` | Cập nhật giá chi nhánh (`SellingPriceOverride`). Ghi log `ProductPriceHistory (BRANCH)`. |
| `POST` | `/api/vouchers/validate` | `{ code, cartTotal }` | `ApiResponse<ValidateVoucherResponse>` | Sửa so sánh ngày bắt đầu theo `Date` (cho phép dùng ngay trong ngày) |
| `POST / PUT` | `/api/promotions` | `PromotionCreateRequest / PromotionUpdateRequest` | `ApiResponse<PromotionResponse>` | Lưu trữ `tiers` JSON vào `Description` (`[TIERS_JSON]...[/TIERS_JSON]`) để giữ trọn vẹn bậc thang |

---

## 3. Luồng Nghiệp vụ (Business Rules)

### 3.1. FE-03.1: Below-Cost Warning & Approval
- Khi người dùng nhập `SellingPrice` (ở Master) hoặc `SellingPriceOverride` (ở Chi nhánh) nhỏ hơn `CostPrice` (hoặc giá nhập lô gần nhất):
  - Giao diện hiển thị cảnh báo đỏ / vàng: *"Giá bán thấp hơn giá vốn (xxx đ)"*.
  - Yêu cầu xác nhận từ Chủ cửa hàng / Quản lý chi nhánh. Khi xác nhận, hệ thống gán cờ `IsBelowCost = true` và lưu tài khoản người duyệt vào nhật ký.

### 3.2. FE-03.2: Price Change History Tracking (Tự động, Zero-Friction)
- Người dùng chỉ cần nhập giá mới và bấm [Lưu].
- Hệ thống tự động so sánh giá cũ vs giá mới:
  - Nếu có thay đổi: Tự động ghi 1 dòng vào `ProductPriceHistories` với `Reason = "Điều chỉnh giá bán"` (hoặc lý do bán dưới vốn nếu có).
  - Nếu không đổi giá: Không ghi log thừa.

### 3.3. Khắc phục Bậc thang khuyến mãi & Ngày voucher
- **Khuyến mãi đơn hàng (`ORDER_DISCOUNT`)**: Mảng `tiers` được serialize an toàn và lưu kèm trong `Description` (`[TIERS_JSON]...[/TIERS_JSON]`). Khi đọc danh sách khuyến mãi, Backend/Frontend tự động parse lại nguyên vẹn các bậc (Bậc 1, 2, 3...) mà không bị lỗi khóa ngoại `ProductId`.
- **Mua X tặng Y (`BUY_X_GET_Y`)**: Khi chọn hình thức này, hiển thị dropdown danh sách sản phẩm kho để người dùng chọn quà tặng, tự động gán `giftProductId`, `giftProductName` và `giftUnit`.
- **Ngày Voucher**: Kiểm tra theo `DateTime.UtcNow.AddHours(7).Date < promo.StartDate.Date`. Nếu hôm nay bằng ngày bắt đầu, voucher hợp lệ ngay lập tức.

---

## 4. Thiết kế Giao diện (UI Components)
1. **Modal Lịch sử giá bán (`PriceHistoryModal.tsx`)**:
   - Hiển thị bảng timeline: Ngày giờ, Phạm vi (Toàn chuỗi / Chi nhánh), Giá cũ &rarr; Giá mới (màu xanh nếu giảm, đỏ nếu tăng), Chênh lệch (VNĐ & %), Người sửa, Ghi chú cảnh báo dưới giá vốn.
2. **Cảnh báo giá dưới vốn trong `ProductFormModal.tsx` & `EditStoreProductModal.tsx`**:
   - Xuất hiện cảnh báo trực tiếp dưới ô nhập giá bán khi giá bán < giá vốn.
3. **Modal Khuyến mãi `PromotionModal.tsx`**:
   - Nạp danh mục sản phẩm kho để chọn sản phẩm quà tặng cho Mua X tặng Y.
   - Hiển thị đầy đủ số lượng bậc cấu hình trong `PromotionTable.tsx`.
