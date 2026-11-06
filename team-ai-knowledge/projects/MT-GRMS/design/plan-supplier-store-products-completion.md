# Plan hoàn thiện 100% — 4 màn NCC / Chi nhánh / SP theo NCC / SP theo cửa hàng

> **Phạm vi**: BE + FE  
> **Ngoài phạm vi**: Master Product (`/store-owner/products`) — teammate phụ trách  
> **Chuẩn nghiệp vụ**: `pricing-layers-business-model.md`  
> **Quy trình SEP**: `/sep-spec` → `/sep-brainstorm` → `/sep-verify-spec` → `/sep-apply` → `/sep-test` → `/sep-archive`

---

## 0. Mục tiêu nghiệm thu (Definition of Done)

Khi xong, 4 màn dưới đây khớp tài liệu giá + rule bổ sung:

| # | Màn | URL |
|---|---|---|
| A | Nhà cung cấp | `/store-owner/suppliers` |
| B | Gán NCC ↔ Chi nhánh | `/store-owner/suppliers/branches` |
| C | Sản phẩm theo NCC | `/store-owner/suppliers/products` |
| D | Sản phẩm theo cửa hàng | `/store-owner/stores/products` |

**Rule cứng bổ sung**
1. **Chỉ Store Owner** được tạo/sửa/ngưng thông tin NCC và các quan hệ gán (A/B/C; D phần cấu hình CN).
2. Khi **gán SP vào cửa hàng**: chỉ hiện SP mà **NCC của SP đó đã Active-link với chi nhánh đó**.  
   (Không hiện SP của NCC chưa gán chi nhánh — đúng case Thanh Xuân: CHOCOPIE/OMO của SUP-0001 không được gán nếu SUP-0001 chưa link.)
3. Giá: `AgreedPrice` (nullable) = giá mua hiện tại đã gồm giao hàng thông thường; Master `CostPrice` chỉ tham khảo; giá bán CN = override nullable; không copy cứng Master; không ghi `LandedCost` giả khi chỉ gán danh mục.

---

## 1. Bản đồ phụ thuộc (thứ tự làm)

```text
A. Suppliers (hồ sơ NCC)
   ↓
C. SupplierProducts (AgreedPrice + MOQ)     ← song song được với B sau khi A ổn
B. SupplierBranch (NCC ↔ Chi nhánh)
   ↓
D. Store/Branch Products (chỉ SP từ NCC đã link)
   ↓
(Verify) PO Matrix cùng chi nhánh chỉ thấy SP orderable = giao của B∩C∩D
```

Không làm D trước khi B+C đúng — nếu không popup gán cửa hàng sẽ thiếu/sai data.

---

## 2. Gap hiện tại → việc cần làm

### 2.1. Cross-cutting (áp dụng cả 4 màn)

| Gap | Việc làm |
|---|---|
| Phân quyền Store Owner | BE: `[Authorize(Roles = "StoreOwner")]` (hoặc policy) cho API **ghi** của Suppliers / SupplierBranch / SupplierProducts / BranchProducts. Role khác: read-only hoặc 403. FE: ẩn/disable nút Thêm/Sửa/Ngưng nếu không phải Store Owner. |
| Label loại giá | Thống nhất copy UI theo doc §12.3 (“Giá thỏa thuận hiện tại (đã gồm giao hàng…)”, “Giá bán hiệu lực”, badge Master/Đã điều chỉnh). |
| Test gate | Unit + FE test + checklist tay theo DoD từng màn. |

### 2.2. Màn A — `/store-owner/suppliers`

| Hạng mục | BE | FE |
|---|---|---|
| CRUD / Active-Inactive NCC | Audit API tạo/sửa/ngưng; chỉ Store Owner | Form, list, filter, toast lỗi quyền |
| Không lộ/sửa field ngoài phạm vi | Không cho role khác mutate | Ẩn action theo role |
| Liên kết sang B/C | — | Deep-link “Gán chi nhánh” / “Sản phẩm NCC” |

**Nghiệm thu A**: Store Owner CRUD OK; Manager/Staff gọi API ghi → 403; UI không hiện nút ghi.

### 2.3. Màn B — `/store-owner/suppliers/branches`

| Hạng mục | BE | FE |
|---|---|---|
| Gán / ngưng NCC ↔ Branch | Unique `(Tenant, Supplier, Branch)`; Inactive cần lý do | Modal gán, bảng, toggle Active |
| Chỉ Active assignment được dùng ở D & PO | Query filter `Status = Active` (đã có hướng) | Badge trạng thái rõ |
| Ngưng assignment → ẩn SP của NCC đó khỏi assignable của CN | Confirm trong `GetAssignableProductsForBranch` | Empty-state giải thích “Chưa có NCC liên kết” |

**Nghiệm thu B**: Gán SUP-0001 → Thanh Xuân xong thì CHOCOPIE/OMO (nếu đã có SupplierProduct) mới xuất hiện ở D assignable.

### 2.4. Màn C — `/store-owner/suppliers/products` ⭐ lệch doc nhiều nhất

| Gap so với doc | BE | FE |
|---|---|---|
| `AgreedPrice` phải **nullable** (`NULL` = chưa thỏa thuận); không dùng `0` thay NULL | Migration: `AgreedWholesalePrice` → `decimal?` (hoặc rename `AgreedPrice`); update entity, DTO, validator, `SupplierProductPricing` dùng `HasValue` thay `> 0` | Assign/Edit: cho trống = chưa thỏa thuận; hiển thị “Chưa thỏa thuận” khi null; giá hiệu lực = Agreed ?? Master Cost |
| MOQ > 0 theo ĐVT cơ sở | Giữ validate | Label ĐVT cơ sở cạnh MOQ |
| Không ghi `LandedCostPerUnit = Agreed` khi chỉ gán SP→NCC (auto tạo BranchStock) | Khi sync BranchStock lúc gán: `LandedCostPerUnit = 0` (hoặc không tạo stock cho đến khi gán CN / nhập hàng — **chốt 1 hướng trong brainstorm**) | — |
| Copy UI | — | “Giá thỏa thuận (đã gồm giao hàng thông thường)” |
| Đổi Agreed chỉ ảnh hưởng PO **mới** | Không cascade update PO/lô (đã đúng nếu không viết ngược) | Toast: “Chỉ áp dụng đơn đặt hàng mới” |
| IsPrimary / Active-Inactive | Giữ | Toggle + primary |

**Nghiệm thu C**:  
- Gán SP với giá NULL → DB NULL, PO lấy Master Cost.  
- Gán SP với 155k → DB 155k.  
- Đổi 155→160 không đụng lô/PO cũ.

### 2.5. Màn D — `/store-owner/stores/products`

| Gap so với doc + rule user | BE | FE |
|---|---|---|
| Assignable **chỉ** SP ∈ SupplierProducts Active **và** NCC ∈ SupplierBranch Active của CN | Siết `GetAssignableProductsForBranch` + `AssignProducts` validate lại (reject nếu không đủ điều kiện) | Popup chỉ load API assignable; empty-state rõ lý do |
| `SellingPriceOverride` nullable; **không** copy `RetailPrice = product.SellingPrice` lúc gán | Đổi assign: `RetailPrice = null`; DTO trả `EffectiveSellingPrice = override ?? master` | Cột “Giá bán hiệu lực” + badge *Master* / *Đã điều chỉnh*; edit chỉ ghi override khi user chủ động sửa |
| Không sửa MOQ / Agreed tại màn CN | API update CN không nhận MOQ/Agreed | MOQ read-only (đã có hướng) |
| Gỡ SP chặn nếu tồn > 0 | Validate | Message lỗi |
| Data bẩn hiện có (SP trên CN nhưng NCC chưa link) | Optional cleanup script / flag “Không còn nguồn NCC” trên list | Warning badge trên row |

**Nghiệm thu D (case Thanh Xuân)**:  
- Trước khi gán SUP-0001: assignable không có CHOCOPIE/OMO.  
- List có thể vẫn thấy 5 nếu đã gán trước (legacy) → hiện warning; hoặc ẩn khỏi “còn đặt được”.  
- Sau gán SUP-0001 + có SupplierProduct: assignable + PO matrix tăng tương ứng.

---

## 3. Quyết định kỹ thuật cần chốt ở `/sep-brainstorm` (trước khi code)

1. **Nullable AgreedPrice**: rename cột hay giữ `AgreedWholesalePrice` + cho null?  
   → Khuyến nghị: giữ tên cột DB, đổi thành nullable; API expose `agreedPrice: number | null`.
2. **Auto tạo BranchStock khi gán SP→NCC / NCC→Branch**:  
   - Option A: vẫn auto-create catalog row, `RetailPrice=null`, `LandedCost=0`.  
   - Option B: chỉ tạo BranchStock khi user gán ở màn D.  
   → Khuyến nghị đồ án: **Option A đơn giản** nhưng **không** ghi landed/retail cứng.
3. **Legacy data** (SP đã nằm CN dù NCC chưa link): giữ + warning, hay chặn đặt hàng thôi?  
   → Khuyến nghị: giữ list, chặn PO/assignable; badge cảnh báo.
4. **Role**: chỉ `StoreOwner` ghi; `StoreManager` có được gán SP cửa hàng không?  
   → Theo user: “Chỉ Store Owner được thay đổi thông tin nhà cung cấp” → A/B/C chắc chắn Owner. D: mặc định cũng Owner trừ khi brainstorm mở cho Manager phần giá bán CN.

---

## 4. Work packages (BE + FE) — checklist triển khai

### WP0 — SEP artifacts
- [ ] `/sep-spec` change: `align-supplier-store-pricing-layers`
- [ ] `/sep-brainstorm` → chốt 4 quyết định mục 3
- [ ] `/sep-verify-spec` (skeptic bắt buộc)
- [ ] User Approve từng bước

### WP1 — AuthZ Store Owner (A/B/C/D ghi)
- [ ] BE policies/attributes trên controllers commands
- [ ] FE `useAuth` / role gate trên action buttons
- [ ] Test 403

### WP2 — SupplierProducts nullable AgreedPrice (C)
- [ ] Migration + entity + DTO + validators + `SupplierProductPricing`
- [ ] FE Assign/Edit/Table labels + null UX
- [ ] Unit tests resolve: null→CostPrice; value→Agreed
- [ ] Data migrate: quyết định `0` hiện tại → `NULL` (khuyến nghị: 18 rows = 0 → NULL)

### WP3 — SupplierBranch siết Active (B)
- [ ] Audit API gán/ngưng
- [ ] FE copy + empty states
- [ ] Test: ngưng assignment → assignable D mất SP của NCC đó

### WP4 — Store Products assignable + override nullable (D)
- [ ] BE: không copy RetailPrice; LandedCost không lấy Agreed lúc gán danh mục
- [ ] BE: assign reject nếu NCC chưa link CN
- [ ] FE: EffectiveSellingPrice + badge; popup chỉ assignable
- [ ] Test Thanh Xuân: 3 orderable / 5 catalog (nếu giữ legacy)

### WP5 — Suppliers màn A polish + quyền
- [ ] Khóa mutate theo role
- [ ] Link điều hướng B/C

### WP6 — Regression PO Matrix (không thuộc 4 màn nhưng là nghiệm thu tích hợp)
- [ ] Matrix = SP có BranchStock ∧ SupplierProduct Active ∧ SupplierBranch Active
- [ ] Case Thanh Xuân trước/sau gán SUP-0001

### WP7 — `/sep-test` + `/sep-archive`
- [ ] `test-report.md` verdict PASS
- [ ] Archive specs

---

## 5. Tiêu chí “100%” theo từng màn (checklist tay)

### A. Suppliers
- [ ] Store Owner tạo/sửa/ngưng NCC
- [ ] Non-Owner không sửa được (UI + API)
- [ ] List/filter/status ổn

### B. Suppliers/Branches
- [ ] Gán NCC ↔ CN, unique, inactive + lý do
- [ ] Chỉ Active được dùng ở D/PO

### C. Suppliers/Products
- [ ] Gán SP + Agreed null/giá + MOQ
- [ ] Sửa giá hiện tại không đổi lịch sử
- [ ] Label “đã gồm giao hàng thông thường”
- [ ] Primary + Active

### D. Stores/Products
- [ ] Popup gán: **không** hiện SP của NCC chưa link CN
- [ ] Giá bán hiệu lực = override ?? Master; không copy cứng lúc gán
- [ ] MOQ/Agreed read-only từ NCC
- [ ] Gỡ SP: chặn nếu tồn > 0

### Tích hợp
- [ ] Thứ tự: Master (teammate) → A → C → B → D → PO
- [ ] Thanh Xuân: sau khi link đúng NCC, số SP matrix = số SP orderable

---

## 6. Ngoài phạm vi plan này

- Master Product UI/API (teammate)
- PO create-matrix UI overhaul (chỉ regression)
- GoodsReceipt / phân bổ phí / POS COGS sâu (đã chốt nguyên tắc; làm change riêng nếu cần)
- Engine giá phức tạp, phí ship mặc định

---

## 7. Lộ trình gợi ý

| Phase | Nội dung | Kết quả |
|---|---|---|
| P0 | SEP spec + brainstorm chốt 4 quyết định | proposal/exploration/specs |
| P1 | WP1 AuthZ + WP2 Agreed nullable | C đúng doc giá |
| P2 | WP3 Branch link + WP4 Store assignable/override | D đúng rule gán |
| P3 | WP5 polish A + WP6 regression PO + tests | 4 màn + tích hợp xanh |
| P4 | sep-test / archive | Đóng change |

---

## 8. Bước tiếp theo ngay

1. Chạy **`/sep-spec`** với mô tả:  
   *Hoàn thiện 4 màn Suppliers / SupplierBranch / SupplierProducts / StoreProducts theo pricing-layers-business-model; chỉ Store Owner ghi; gán SP cửa hàng chỉ từ NCC đã link chi nhánh; AgreedPrice nullable; SellingPriceOverride nullable.*
2. Không code trước khi qua brainstorm + verify-spec + Approve.
)
