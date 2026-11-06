# Mô hình phân lớp giá — MT-GRMS

> **Phạm vi**: Catalog · Nhà cung cấp · Chi nhánh · Đặt hàng · Nhập kho · POS  
> **Nguyên tắc cốt lõi**: Khi nhập đúng điều kiện thông thường, **giá vốn của lô** = giá thỏa thuận NCC **tại thời điểm đặt/nhận** (đã gồm chi phí phía NCC / giao hàng thông thường).  
> **Giá hiện tại ≠ giá lịch sử**: Đổi `AgreedPrice` / giá tham khảo Master chỉ ảnh hưởng đơn **mới**; không sửa PO cũ, phiếu nhập cũ, hay `UnitCost` các lô còn tồn.  
> **Master vs NCC**: `Products.CostPrice` (giá mua tham khảo / `DefaultPurchasePrice`) và `SupplierProducts.AgreedPrice` là hai giá khác nhau; **không bắt buộc bằng nhau**. Lập PO **ưu tiên** `AgreedPrice`.  
> **Đơn giản hóa**: Không phí ship mặc định / phân bổ phức tạp. Chỉ ghi chi phí riêng khi phát sinh **ngoài** thỏa thuận.

---

## 1. Tóm tắt một trang

| Lớp | Thực thể | Quản lý gì | Không quản lý gì |
|---|---|---|---|
| Master | `Products` / `ProductUnits` | Giá mua tham khảo hiện tại (`CostPrice` / `DefaultPurchasePrice`), giá bán cơ bản, ĐVT | Tồn kho, giá riêng CN, giá lịch sử lô/PO |
| Mua hàng NCC | `SupplierProducts` | `AgreedPrice` **hiện tại** (đã gồm giao hàng thông thường), MOQ | Giá bán; không lưu lịch sử từng lần nhập |
| Kinh doanh CN | `BranchProducts` | Giá bán override (nullable), cấu hình CN | Giá thỏa thuận NCC, giá vốn lô |
| Đặt hàng | `PurchaseOrderDetails` | Snapshot giá mua lúc tạo PO | Phí ship mặc định, landed cost |
| Nhập kho | `GoodsReceiptDetails` + `GoodsReceiptCosts` | Xác nhận nhận hàng **đúng giá PO** (không lệch giá); chi phí phát sinh *chỉ nếu có ngoài thỏa thuận* | Đổi giá tại lúc nhận; phân bổ phí vào từng dòng SP |
| Tồn theo lô | `InventoryLots` | `UnitCost` = **giá lịch sử của lô** (snapshot lúc nhập); dùng tính COGS (FEFO) | Không bị ghi đè khi cập nhật `AgreedPrice` hiện tại |
| Bán hàng | `OrderDetails` (POS) | Snapshot ĐVT, SL, giá bán, giá vốn lúc bán | Không đọc lại Master để tính COGS |

### Luồng giá hoàn chỉnh

```text
1. Master Product
   → CostPrice (tham chiếu) + SellingPrice (mặc định) + giá theo ĐVT

2. SupplierProducts
   → AgreedPrice (đã gồm giao hàng thông thường) + MOQ

3. PurchaseOrderDetails
   → Snapshot UnitPrice khi đặt hàng (không gắn phí ship mặc định)

4. GoodsReceiptDetails / InventoryLots
   → ActualUnitPrice & UnitCost = đúng giá PO (không có case lệch giá lúc nhận)
   → NCC đổi giá → phải báo chủ cửa hàng → cập nhật AgreedPrice / tạo PO mới
   → Không đổi khi catalog cập nhật giá mới
   → GoodsReceiptCosts: chỉ khi có khoản phát sinh ngoài thỏa thuận

5. BranchProducts
   → SellingPriceOverride ?? Product.SellingPrice
   → Giá bán không tự đổi theo giá nhập

6. POS / OrderDetails
   → Giá bán hiệu lực CN + COGS từ đúng lô FEFO (giá lịch sử lô)
```

---

## 2. Màn hình Master Product — Giá chuẩn toàn chuỗi

Nơi khai báo giá mặc định khi tạo sản phẩm.

### Ví dụ: Gạo ST25

| Thuộc tính | Giá trị |
|---|---|
| SKU | `SP-GAO-ST25` |
| ĐVT cơ sở | Túi |
| Giá vốn tham chiếu | 160.000đ |
| Giá bán cơ bản | 195.000đ |

### ProductUnits (nếu có nhiều ĐVT bán)

| Đơn vị | Quy đổi | Giá bán cơ bản |
|---|---|---|
| Túi | 1 túi | 195.000đ |
| Thùng | 10 túi | 1.900.000đ |

### Quy tắc

- `Product.CostPrice` (nghiệp vụ còn gọi `DefaultPurchasePrice`): giá mua **tham khảo mặc định** toàn chuỗi — fallback khi chưa có `AgreedPrice` với NCC.
- `Product.SellingPrice`: giá bán cơ bản của sản phẩm.
- `ProductUnits.SellingPrice`: giá bán mặc định theo từng ĐVT quy đổi.
- Cho phép chỉnh giá mua tham khảo tại màn Master Product.
- Không lưu tồn kho thực tế hay giá bán riêng từng chi nhánh tại đây.
- Đổi giá Master chỉ ảnh hưởng **giá mặc định tương lai**; không sửa PO / phiếu nhập / `UnitCost` lô cũ; không tự ghi đè `AgreedPrice` của NCC; không tự đổi giá bán chi nhánh.

### Lưu ý

`CostPrice` / `DefaultPurchasePrice` trên Master **không bắt buộc** bằng `SupplierProducts.AgreedPrice`. Hai giá độc lập: Master = tham khảo chung; NCC = thỏa thuận cụ thể (được ưu tiên khi lập PO).

---

## 3. Màn hình Sản phẩm theo Nhà cung cấp — Giá mua & MOQ

Xác định: NCC cung cấp sản phẩm nào, điều kiện mua ra sao.

### Ý nghĩa giá thỏa thuận (đã chốt)

`SupplierProducts.AgreedPrice` = **giá mua giao đến chi nhánh** trong điều kiện giao hàng thông thường.

- Đã bao gồm chi phí vận chuyển thông thường.
- Khi NCC đưa ra MOQ, họ thường đã tính chi phí giao hàng trong mức giá / điều kiện đặt hàng đó.
- **Không** cộng thêm phí vận chuyển giả định khi nhập hàng theo đúng điều kiện thỏa thuận.

### Ví dụ

| Sản phẩm | NCC | Giá vốn Master | Giá thỏa thuận | MOQ |
|---|---|---|---|---|
| Gạo ST25 | Minh Đức | 160.000đ | 155.000đ *(đã gồm giao hàng)* | 10 túi |
| Gạo ST25 | Long Nhật | 160.000đ | *(chưa thỏa thuận)* | 5 túi |

### Quy tắc giá nhập hiệu lực khi lập PO

```text
EffectivePurchasePrice =
    SupplierProduct.AgreedPrice
    ?? Product.CostPrice
```

- Có giá thỏa thuận → dùng giá NCC.
- Chưa thỏa thuận → dùng `Product.CostPrice`.
- Master chỉ là tham chiếu; giá NCC đã thỏa thuận mới là giá mua có hiệu lực.

**Ví dụ**: Master 160.000đ, Minh Đức chốt 155.000đ → PO lấy **155.000đ**.

### Quy tắc MOQ

- MOQ thuộc quan hệ **NCC – sản phẩm**.
- MOQ theo **ĐVT cơ sở** của Master Product.
- Mọi chi nhánh mua qua NCC đó phải tuân thủ MOQ đó (trừ khi sau này có chính sách ngoại lệ theo chi nhánh).
- MOQ là một phần điều kiện giao hàng thông thường đã phản ánh trong `AgreedPrice`.

### Trường đề xuất trên `SupplierProducts`

| Trường | Kiểu | Ý nghĩa |
|---|---|---|
| `SupplierId` | Guid | NCC |
| `ProductId` | Guid | Sản phẩm |
| `AgreedPrice` | decimal? | Giá mua thỏa thuận (đã gồm giao hàng thông thường); **NULL = chưa thiết lập** |
| `MOQ` | decimal/int | Số lượng đặt tối thiểu (> 0) |
| `IsActive` | bool | Quan hệ còn hiệu lực |
| `IsPrimary` | bool | NCC chính (tuỳ chọn) |

### Quyết định về NULL

- Dùng `NULL` khi chưa thỏa thuận giá.
- **Không** dùng `0` để vừa nghĩa “chưa thỏa thuận” vừa nghĩa “giá bằng 0”.
- Unique theo `(Tenant, SupplierId, ProductId)`.

---

## 4. Màn hình Sản phẩm theo Cửa hàng — Giá bán riêng chi nhánh

Xác định: sản phẩm được phép kinh doanh tại chi nhánh nào và bán giá bao nhiêu.

### Ví dụ giá bán (ĐVT cơ sở)

Master: 195.000đ/túi

| Chi nhánh | Giá Master | Giá điều chỉnh |
|---|---|---|
| Quận 1 | 195.000đ | *(chưa điều chỉnh)* |
| Thanh Hóa | 195.000đ | 190.000đ |
| Cầu Giấy | 195.000đ | 200.000đ |

### Ví dụ ĐVT quy đổi tại Thanh Hóa

| Đơn vị | Giá Master | Giá chi nhánh |
|---|---|---|
| Túi | 195.000đ | 190.000đ |
| Thùng (10 túi) | 1.900.000đ | 1.850.000đ |

### Quy tắc giá bán hiệu lực

```text
EffectiveSellingPrice =
    BranchProduct.SellingPriceOverride
    ?? Product.SellingPrice

EffectiveUnitSellingPrice =
    BranchProduct.UnitPriceOverride
    ?? ProductUnit.SellingPrice
```

### Thiết kế dữ liệu đề xuất (`BranchProducts`)

| Trường | Kiểu | Ý nghĩa |
|---|---|---|
| `BranchId` | Guid | Chi nhánh |
| `ProductId` | Guid | Sản phẩm |
| `SellingPriceOverride` | decimal? | NULL = dùng Master |
| Unit price overrides | (tuỳ chọn) | Override theo ĐVT |
| `IsActive` | bool | Còn kinh doanh tại CN |

### Không copy giá Master khi gán

- **Không** sao chép giá Master thành giá cố định trong `BranchProducts` lúc gán SP vào chi nhánh.
- Màn hình chi nhánh **hiển thị** giá hiệu lực bằng resolve (`override ?? Master`).

### Điều kiện được gán vào chi nhánh

1. Có quan hệ Active trên `SupplierProducts`, **và**
2. NCC đó đã được gán Active với chi nhánh (`SupplierBranchAssignments`).

---

## 5. Purchase Order — Chốt giá mua tại thời điểm đặt hàng

Khi tạo PO, hệ thống lấy:

1. `AgreedPrice` từ `SupplierProducts` (nếu có)
2. Nếu chưa có → `Product.CostPrice`
3. MOQ từ `SupplierProducts`
4. Số lượng từ nghiệp vụ lập kế hoạch / đề xuất

**Không** gắn phí vận chuyển mặc định lên PO. Giá dòng PO chính là giá mua giao đến CN trong điều kiện thông thường.

### Ví dụ

| Sản phẩm | Giá Master | Giá NCC | Giá trên PO |
|---|---|---|---|
| Gạo ST25 | 160.000đ | 155.000đ | **155.000đ** |

### Snapshot trên `PurchaseOrderDetails`

- `OrderedQty`
- `UnitPrice` (giá đã chốt)
- `LineAmount`
- `SupplierProductId` (nên có)
- `ProductId`
- `DeliveryDate` / ĐVT giao hàng

> Nếu hôm sau NCC đổi giá thỏa thuận, **PO đã tạo vẫn giữ giá cũ**.

### Không có lệch giá PO khi nhập

Trong MT-GRMS **không** xử lý case nhận hàng với đơn giá khác PO.

- Giá trên phiếu nhập = giá đã chốt trên PO.
- Nếu NCC muốn đổi giá nhập, NCC **phải báo chủ cửa hàng trước**.
- Chủ cửa hàng cập nhật `AgreedPrice` (và/hoặc giá tham khảo Master nếu cần), rồi tạo / điều chỉnh theo quy trình PO mới.
- Không cho nhân viên nhập kho tự sửa đơn giá lệch so với PO tại lúc nhận.

---

## 6. Giá hiện tại vs giá lịch sử (khi NCC đổi giá)

Cần phân biệt rõ:

| Khái niệm | Nơi lưu | Ý nghĩa |
|---|---|---|
| **Giá hiện tại** | `Products.CostPrice` / `DefaultPurchasePrice`, `SupplierProducts.AgreedPrice` | Giá đang áp dụng cho nghiệp vụ **tương lai** (PO mới) |
| **Giá lịch sử** | `PurchaseOrderDetails`, `GoodsReceiptDetails`, `InventoryLots` | Giá đã chốt của từng giao dịch / từng lô — **không bị ghi đè** |

### 6.1. Ví dụ: NCC tăng giá 10.000đ → 12.000đ

#### Cập nhật giá hiện tại

| Bảng | Trường | Giá trị mới |
|---|---|---|
| `Products` | `CostPrice` / `DefaultPurchasePrice` | 12.000đ *(nếu chủ động cập nhật giá tham khảo)* |
| `SupplierProducts` | `AgreedPrice` | 12.000đ |

- Hai giá **không bắt buộc giống nhau**.
- Có thể chỉ sửa `AgreedPrice` mà không sửa giá tham khảo Master (hoặc ngược lại).
- Cho phép sửa giá mua ở **màn Sản phẩm** và **màn Sản phẩm theo NCC**.
- Khi tạo PO: **ưu tiên** `AgreedPrice`; giá ở màn Sản phẩm chỉ là tham khảo / fallback mặc định.

#### Giá cũ được giữ ở đâu?

| Bảng | Giá trị giữ lại |
|---|---|
| `PurchaseOrderDetails` | Giá tại thời điểm đặt hàng: **10.000đ** |
| `GoodsReceiptDetails` | Giá thực tế khi nhận hàng: **10.000đ** |
| `InventoryLots` | Giá vốn của lô hàng còn tồn: **10.000đ** |

Khi nhập **lô mới** sau khi đổi giá → bản ghi mới lưu **12.000đ**. Các lô cũ vẫn **10.000đ**.

### 6.2. Nguyên tắc bắt buộc

1. Cập nhật giá hiện tại **không** làm thay đổi phiếu nhập / PO cũ.
2. **Không** cập nhật giá vốn (`UnitCost`) của những lô hàng còn tồn.
3. Đơn đặt hàng **mới** lấy giá thỏa thuận **hiện tại** (`AgreedPrice`).
4. **Giá bán không tự động** thay đổi theo giá nhập.
5. Báo cáo lợi nhuận / COGS dùng **giá vốn thực tế của hàng đã xuất từ từng lô** (FEFO), không dùng `AgreedPrice` hiện tại để tính ngược hàng cũ.

### 6.3. Hệ quả

Việc đổi giá không làm sai lệch lịch sử nhập hàng, tồn kho theo lô, hay báo cáo lợi nhuận.

---

## 7. Nhập hàng — Giá vốn lô theo giá thỏa thuận tại thời điểm nhận

### Nguyên tắc đã chốt

Khi nhập đúng điều kiện thông thường, **giá vốn của lô** = giá đã chốt trên PO.  
**Không có lệch giá lúc nhận** — nếu NCC đổi giá phải báo chủ cửa hàng để cập nhật thỏa thuận / lập PO mới trước.

```text
// Bắt buộc khi nhận hàng:
InventoryLots.UnitCost
  = GoodsReceiptDetails.ActualUnitPrice
  = PurchaseOrderDetails.UnitPrice
  = AgreedPrice_lúc_đặt_hàng

// Không cho: ActualUnitPrice ≠ PO.UnitPrice
// Sau này catalog đổi AgreedPrice → PO/lô cũ KHÔNG đổi
```

- `AgreedPrice` hiện tại = giá hàng giao đến CN trong điều kiện thông thường (kèm MOQ), dùng cho **PO mới**.
- **Không** cộng thêm phí vận chuyển / bốc dỡ / đóng gói giả định khi nhập đúng thỏa thuận.
- `Product.CostPrice` / `DefaultPurchasePrice` = tham chiếu / fallback; không bắt buộc = `AgreedPrice`.
- Chỉ khi có khoản **phát sinh ngoài thỏa thuận** mới ghi `GoodsReceiptCosts`; **không bắt buộc** phân bổ vào từng SP.

| Khoản mục | Xử lý trong đồ án |
|---|---|
| Vận chuyển thông thường (đã nằm trong giá NCC / MOQ) | **Không** cộng thêm → giá vốn lô = giá đã chốt trên PO |
| Phí ngoài thỏa thuận | Ghi riêng nếu có; vốn hóa **chỉ nếu** nghiệp vụ xác nhận |
| Phân bổ phí vào từng dòng SP | **Không bắt buộc** |

### 7.1. Chốt cách xử lý chi phí nhập hàng

| Trường hợp | Cách xử lý |
|---|---|
| Nhập đúng điều kiện thỏa thuận | **Giá vốn lô = giá trên PO** (= `AgreedPrice` lúc đặt); không lệch giá |
| NCC muốn đổi đơn giá hàng | **Không sửa trên phiếu nhập** — phải báo chủ cửa hàng → cập nhật `AgreedPrice` / PO mới |
| NCC thu thêm phí riêng ngoài thỏa thuận (không phải đổi đơn giá hàng) | Ghi `GoodsReceiptCosts`; không đổi đơn giá dòng hàng / `AgreedPrice` catalog |
| Chi phí bất thường (bốc dỡ, thuê xe ngoài…) | Ghi riêng; chỉ vốn hóa vào `UnitCost` nếu được xác nhận |

### 7.2. Ví dụ chuẩn — không phí phát sinh

NCC Minh Đức cung cấp 10 túi gạo ST25:

- Giá thỏa thuận lúc đặt: **155.000đ/túi**
- MOQ: 10 túi
- Giá đã bao gồm giao hàng đến chi nhánh

Khi nhập 10 túi:

\[
10 \times 155.000 = 1.550.000đ
\]

→ **Giá vốn lô = 155.000đ/túi**.  
**Không** cộng thêm phí vận chuyển giả định nào.

### 7.3. Ví dụ — có phí giao hàng ngoài điều kiện

Nếu NCC yêu cầu thêm **30.000đ** phí giao vì đơn nằm ngoài điều kiện giao hàng thông thường:

- Tiền hàng vẫn theo giá đã chốt trên PO
- Khoản **30.000đ** ghi riêng trên phiếu nhập (`GoodsReceiptCosts`)
- Chỉ vốn hóa vào giá vốn lô **nếu** nghiệp vụ xác định đây là chi phí thu mua hợp lệ

### 7.4. Không bắt buộc màn hình phân bổ chi phí nhập hàng

| Có | Không bắt buộc |
|---|---|
| Phiếu nhập có thông tin **tiền hàng** | Cơ chế phí ship mặc định cho mọi PO |
| Phần ghi nhận **chi phí phát sinh nếu có** | Bắt buộc phân bổ phí vào **từng sản phẩm** |
| Vốn hóa vào tồn **chỉ khi** cần | Engine phân bổ phức tạp như ERP |
| Phí vận hành thông thường ghi nhận riêng | Tự động cập nhật ngược catalog / lô cũ |

### 7.5. Phân biệt các loại giá

| Loại giá | Thời điểm | Ý nghĩa |
|---|---|---|
| Master `CostPrice` / `DefaultPurchasePrice` | Hiện tại | Tham khảo / fallback |
| `AgreedPrice` | Hiện tại | Thỏa thuận NCC cho PO **mới** |
| PO `UnitPrice` | Lịch sử | Snapshot lúc đặt |
| GR `ActualUnitPrice` | Lịch sử | Xác nhận lúc nhận |
| Lot `UnitCost` | Lịch sử | Giá vốn lô — dùng COGS; **không** đổi khi catalog đổi giá |
| `GoodsReceiptCosts` | Lịch sử (nếu có) | Phí ngoài thỏa thuận của lần nhập |

### 7.6. Ví dụ hoàn chỉnh (Master → NCC → PO → Nhập)

Master: tham chiếu **160.000đ**, bán **195.000đ**.  
NCC Minh Đức: thỏa thuận **155.000đ**, MOQ 10 túi (đã gồm giao hàng).

Đặt 10 túi → PO **155.000đ** → nhập → lô **155.000đ/túi**.

Nếu sau đó `AgreedPrice` lên 160.000đ: lô cũ vẫn 155.000đ; PO mới lấy 160.000đ.

### 7.7. Lưu trữ đề xuất

| Thực thể | Trường chính | Ý nghĩa |
|---|---|---|
| `GoodsReceiptDetails` | `ActualUnitPrice` | **Bắt buộc = giá PO**; không cho lệch đơn giá lúc nhận |
| `GoodsReceiptCosts` | `Amount`, … | Chỉ khi có phí ngoài thỏa thuận |
| `InventoryLots` | `UnitCost` | Giá vốn lịch sử của lô; dùng tính COGS |

---

## 8. Nhập theo kg, bán theo gram (ĐVT quy đổi)

### Master Product — Hoa quả A

| Thuộc tính | Giá trị |
|---|---|
| ĐVT cơ sở | kg |
| Đơn vị bán phụ | g |
| Quy đổi | 1 kg = 1.000 g |
| Giá vốn tham chiếu | 30.000đ/kg |
| Giá bán cơ bản | 40.000đ/kg |
| Giá bán theo gram | 40đ/g *(ví dụ)* |

### Khi nhập 50 kg, giá thỏa thuận 30.000đ/kg (đã gồm giao hàng thông thường)

- Tồn tăng **50 kg**
- Không phí phát sinh → `UnitCost` lô = **30.000đ/kg** (= 30đ/g)

### Khi POS bán 500 g

- Tồn giảm **0,5 kg**
- Doanh thu = \(500 \times 40 = 20.000đ\)
- COGS = \(500 \times 30 = 15.000đ\)
- Lãi gộp = **5.000đ**

### Nguyên tắc bất biến

1. **Tồn kho** luôn quy đổi và quản lý theo ĐVT cơ sở.
2. **Giá bán** cấu hình theo từng ĐVT bán (Master hoặc override CN).
3. **Giá vốn** lấy từ `UnitCost` của **đúng lô** xuất (FEFO).
4. Khi bán: lưu ĐVT bán, số lượng bán, hệ số quy đổi, giá bán và giá vốn tại thời điểm bán.
5. Không lấy một giá vốn chung trên Master để tính COGS khi đã có lô.

---

## 9. Trách nhiệm giá trên toàn hệ thống

| Nơi quản lý | Giá | Loại | Ý nghĩa |
|---|---|---|---|
| `Products` | `CostPrice` / `DefaultPurchasePrice` | Hiện tại | Giá mua tham khảo mặc định (có thể sửa trên màn Sản phẩm) |
| `Products` | `SellingPrice` | Hiện tại | Giá bán mặc định toàn chuỗi |
| `ProductUnits` | giá theo ĐVT | Hiện tại | Giá bán mặc định theo đơn vị quy đổi |
| `SupplierProducts` | `AgreedPrice` | Hiện tại | Thỏa thuận NCC (ưu tiên khi lập PO); đã gồm giao hàng thông thường |
| `BranchProducts` | `SellingPriceOverride` | Hiện tại | Giá bán riêng CN; **không** tự đổi theo giá nhập |
| `PurchaseOrderDetails` | `UnitPrice` | Lịch sử | Snapshot lúc đặt hàng |
| `GoodsReceiptDetails` | `ActualUnitPrice` | Lịch sử | Snapshot lúc nhận hàng |
| `GoodsReceiptCosts` | `Amount` | Lịch sử | Phí ngoài thỏa thuận (nếu có) |
| `InventoryLots` | `UnitCost` | Lịch sử | Giá vốn lô; không đổi khi catalog đổi giá; dùng COGS |
| `OrderDetails` | snapshot bán | Lịch sử | ĐVT, SL, giá bán, giá vốn lúc bán |

---

## 10. Công thức resolve nhanh (dùng chung BE/FE)

### Giá mua khi lập PO (lấy giá hiện tại)

```text
purchasePrice =
    agreedPrice           // ưu tiên — giá thỏa thuận NCC hiện tại
    ?? product.CostPrice  // fallback — DefaultPurchasePrice
```

### Giá vốn lô khi nhập (đóng băng lịch sử)

```text
lot.UnitCost = actualUnitPrice   // = po.UnitPrice lúc đó
// KHÔNG gán lại lot.UnitCost khi AgreedPrice catalog thay đổi sau này
```

### Giá bán tại POS / màn chi nhánh

```text
sellingPrice =
    branch.SellingPriceOverride
    ?? product.SellingPrice
// Không tự động theo giá nhập
```

### Giá vốn khi xuất bán / báo cáo lãi (FEFO)

```text
cogsPerBaseUnit = inventoryLot.UnitCost   // giá lịch sử của đúng lô xuất
cogsLine        = baseQtySold × cogsPerBaseUnit
```

---

## 11. Các quyết định đã chốt

1. Cho phép sửa giá mua ở **màn Sản phẩm** và **màn Sản phẩm theo NCC**.
2. Lập PO **ưu tiên** `AgreedPrice`; `CostPrice` / `DefaultPurchasePrice` chỉ là tham khảo / fallback — **không bắt buộc bằng nhau**.
3. Khi nhập: giá vốn lô = giá đã chốt trên PO (= `AgreedPrice` **lúc đặt**); **không có case lệch giá PO lúc nhận**.
4. NCC đổi giá nhập → phải **báo chủ cửa hàng** → cập nhật `AgreedPrice` / tạo PO mới; không sửa đơn giá trên phiếu nhập.
5. **Giá hiện tại ≠ giá lịch sử**: đổi catalog không sửa PO cũ, phiếu nhập cũ, `UnitCost` lô còn tồn.
6. PO mới lấy `AgreedPrice` hiện tại; lô mới lưu giá mới; lô cũ giữ giá cũ.
7. **Giá bán không tự động** đổi theo giá nhập.
8. Báo cáo lợi nhuận dùng COGS từ **từng lô đã xuất** (FEFO).
9. MOQ thuộc quan hệ NCC–SP; `AgreedPrice` đã gồm giao hàng thông thường.
10. Không phí ship mặc định; phí ngoài thỏa thuận ghi riêng nếu có (khác với đổi đơn giá hàng).
11. `BranchProducts` chỉ lưu override khi CN điều chỉnh; không copy cứng giá Master lúc gán.

---

## 12. Bổ sung vận hành (phạm vi đồ án)

### 12.1. Thứ tự khai báo nghiệp vụ

1. Tạo Master Product  
2. Tạo / kích hoạt NCC  
3. Gán SP → NCC (AgreedPrice + MOQ)  
4. Gán NCC → chi nhánh  
5. Gán SP → chi nhánh (nếu chưa auto-sync)  
6. Tạo PO → Nhập kho → Bán POS  

### 12.2. Khi nào được phép Inactive

| Đối tượng | Điều kiện gợi ý |
|---|---|
| Master Product | Có thể ngưng bán toàn chuỗi; chặn gán mới / PO mới |
| SupplierProduct | Ngưng mua từ NCC đó; không ảnh hưởng tồn đã nhập |
| BranchProduct | Ngưng bán tại CN; chặn gỡ nếu còn tồn > 0 (tuỳ policy) |
| SupplierBranch | Ngưng NCC phục vụ CN; ẩn khỏi nguồn gán SP mới |

### 12.3. Hiển thị UI (tránh nhầm loại giá)

- Master: “Giá mua tham khảo” / “Giá bán cơ bản”
- NCC: “Giá thỏa thuận hiện tại (đã gồm giao hàng thông thường)”
- Chi nhánh: “Giá bán hiệu lực” + badge *Đang dùng Master* / *Đã điều chỉnh*
- PO: “Giá đã chốt trên đơn” (lịch sử)
- Nhập kho / lô: “Giá vốn lô” (lịch sử) — có thể khác giá thỏa thuận hiện tại
- Báo cáo lãi: COGS theo lô xuất, không theo `AgreedPrice` hiện tại

### 12.4. Những gì **không làm** ở giai đoạn này

- Lệch giá PO lúc nhập / màn hình điều chỉnh đơn giá nhận hàng khác PO
- Cơ chế phí ship mặc định / phân bổ phí phức tạp
- Tự động cập nhật ngược Master từ giá nhập
- Tự động đổi giá bán theo giá nhập
- Ghi đè `UnitCost` lô cũ khi đổi `AgreedPrice`
- Engine giá theo khung giờ / kênh / hạng khách
- MOQ ngoại lệ theo chi nhánh (phase sau)

---

## 13. Kết luận

Mô hình phân lớp giá này **phù hợp MT-GRMS**: nhiều chi nhánh, nhiều NCC, FEFO, đổi giá mua mà không làm lệch lịch sử hay báo cáo lãi.

Điểm then chốt:

> **Giá hiện tại** (`CostPrice` tham khảo, `AgreedPrice` ưu tiên khi lập PO)  
> **≠ Giá lịch sử** (PO / phiếu nhập / `UnitCost` từng lô).  
> Đổi giá hiện tại chỉ ảnh hưởng đơn **mới**; lô cũ và COGS giữ nguyên.  
> Giá bán không tự theo giá nhập.

> Trong mọi lần nhập: **giá PO = giá nhận = giá vốn lô** (= `AgreedPrice` lúc đặt). Không lệch giá lúc nhận.  
> NCC đổi giá → báo chủ cửa hàng → cập nhật thỏa thuận / PO mới.  
> Không xây phí vận chuyển mặc định.
)
