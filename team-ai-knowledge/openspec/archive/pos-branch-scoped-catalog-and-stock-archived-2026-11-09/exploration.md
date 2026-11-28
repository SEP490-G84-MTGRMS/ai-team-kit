---
change: pos-branch-scoped-catalog-and-stock
schema: bug-fix
status: draft
---

# EXP-2026-11-09-001: POS chỉ bán sản phẩm thuộc danh mục chi nhánh (BranchProducts) và trừ tồn BranchStocks đúng chi nhánh

## 1. Problem Statement
POS hiển thị và cho phép chốt đơn với sản phẩm **không thuộc danh mục chi nhánh** đang chọn. Danh mục bán hàng phải là `BranchProducts` Active của chi nhánh, giá theo quy tắc chi nhánh → giá chung, tồn kho lấy/trừ từ `BranchStocks` của đúng chi nhánh.

## 2. Context & Background
### 2.1. Tái hiện (môi trường / dữ liệu)
- Chi nhánh A có lô trong `BranchStocks` cho sản phẩm X nhưng X không có dòng `BranchProducts` Active của A.
- Mở POS / Tạo đơn đặt trước tại A → (a) nếu API chi nhánh rỗng/lỗi thì thấy danh mục chung; (b) `POST /orders` với X cho A vẫn thành công.
- Đã xác nhận bằng đọc code (chưa chạy dữ liệu thật); bằng chứng ghi ở mục 2.2.

### 2.2. Root cause (file / dòng)
| # | Vị trí | Vì sao sai |
|---|---|---|
| 1 | `MT_GRMS_FRONTEND/src/features/pos/api/posOrderApi.ts` `getAllProducts` (dòng 92-152) | Nếu `/branches/{id}/products` trả rỗng hoặc ném lỗi thì rơi xuống `GET /products?pageSize=100` (danh mục chung Tenant, không có giá/tồn chi nhánh). |
| 2 | `MT_GRMS_FRONTEND/src/features/pos/pages/PosCheckoutPage.tsx` (dòng ~296-347) | `getAllProducts(...).catch(() => null)`; nếu rỗng thì `setProducts(getInitialProducts())` (dữ liệu mock cục bộ). Chi nhánh được chọn bằng `summaries.find(...) \|\| summaries[0]` nên không khớp `user.branchId` vẫn rơi vào chi nhánh đầu tiên. |
| 3 | `MT_GRMS_FRONTEND/src/features/pos/pages/InvoiceManagementPage.tsx` (dòng 148-165, 233, 481, 616) | Khi `branchFilter = 'ALL'` dùng `dbBranches[0]?.id` làm chi nhánh tải sản phẩm, tạo đơn đặt trước, đổi/trả; `.catch(() => null)` nuốt lỗi. |
| 4 | `OrderService.CreateOrderAsync` (dòng 141-152, 236-262) | `branchProducts.TryGetValue(..., out var bp)` chấp nhận `bp == null`; chỉ dùng để lấy giá override, không chặn. |
| 5 | `OrderService.CreatePreOrderAsync` (dòng 803-813, 909-910) | Tương tự: chỉ kiểm tra `products`, không kiểm tra `branchProducts`. |
| 6 | `OrderService.ProcessReturnExchangeAsync` chiều `NewItems` (dòng 1369-1378) | Không nạp `BranchProducts` của chi nhánh đơn gốc; sản phẩm đổi mới chỉ cần tồn tại trong `Products`. |
| 7 | `OrderRepository.GetBranchProductsByProductIdsAsync` (dòng 41-48) | Lọc `!IsDeleted` nhưng **không lọc `Status == "Active"`**. `BranchProducts` Inactive vẫn được coi là thuộc chi nhánh. |

### 2.3. Đúng sẵn (không sửa)
- Trừ/kiểm tra tồn đã theo chi nhánh: `GetBranchStocksForProductFefoAsync(branchId, productId)` lọc `BranchId`, `QuantityOnHand > 0`, FEFO, `FOR UPDATE` (Npgsql).
- Danh mục chi nhánh `GET /branches/{id}/products?Status=Active` lọc `BranchProducts.Status` và cộng `BranchStocks.QuantityOnHand` thành `currentStock` (`BranchProductRepository`).
- Thứ tự giá trong `CreateOrderAsync`: `UnitPriceOverrides` → `ProductUnit.Price` → `SellingPriceOverride × ConversionRate` → `Product.SellingPrice`. Giữ nguyên.
- `BranchProduct.Status` chỉ có `"Active"` / `"Inactive"` (validator `BranchProductValidators.cs:39`).

### 2.4. Các chỗ khác có cùng lỗi
- `FulfillPreOrderAsync` và `CancelOrderAsync` không tạo dòng mới; không cần kiểm tra danh mục (đơn đã hình thành trước đó).
- Các dòng quà tặng (`IsGift`) cũng đi qua cùng luồng trừ tồn nên cần quy định xử lý khi quà không thuộc chi nhánh.

## 3. Constraints
- Giữ nguyên quy tắc giá, thuật toán FEFO, khuyến mãi, đơn vị quy đổi đã làm ở change `fix-pos-autopromo-400-and-preorder-units`.
- Không đổi schema DB, không cần migration.
- Test hiện có (`PosOrderServiceTests`, 60 lời gọi tạo đơn) hiện không seed `BranchProducts` → phải bổ sung dữ liệu test.
- Mọi truy vấn phải lọc theo TenantId (entity `BranchProduct` kế thừa `BaseTenantEntity`).

## 4. Assumptions
- **[ASSUMPTION]**: `BaseTenantEntity` có global query filter theo `TenantId`, nên `_context.BranchProducts` tự lọc Tenant. Cần xác minh khi apply.
- **[ASSUMPTION]**: `BranchProducts.Status = "Active"` là điều kiện đủ để “được bán tại chi nhánh” (không có trạng thái thứ ba).
- **[ASSUMPTION]**: Dữ liệu hiện có có thể có chi nhánh chưa gán `BranchProducts`; sau khi sửa POS chi nhánh đó sẽ rỗng cho đến khi gán (chấp nhận theo phương án A).
- **[ASSUMPTION]**: Quà tặng thuộc chi nhánh khác không nên làm hỏng cả đơn; xử lý giống quà hết tồn (bỏ quà + cảnh báo).

## 5. Scope & Non-Goals
### In Scope
- Frontend bỏ fallback `/products` và mock khi đã xác định chi nhánh; báo lỗi thật; bắt buộc chọn chi nhánh khi "Tất cả chi nhánh".
- Backend chặn sản phẩm không thuộc `BranchProducts` Active ở `CreateOrderAsync`, `CreatePreOrderAsync`, `NewItems` của `ProcessReturnExchangeAsync`.
- Test hồi quy.

### Out of Scope (Non-Goals)
- Màn hình gán sản phẩm vào chi nhánh, nhập kho.
- Đổi quy tắc giá, FEFO, khuyến mãi.
- Tự động gán `BranchProducts` cho tồn kho cũ.
- Kiểm tra giá `UnitPrice` do client gửi ở đổi/trả (hiện dùng giá client); ghi nhận là rủi ro riêng, không xử lý ở change này.

## 6. Các phương án sửa (≥ 2)
| | Phương án 1: Chặn ở backend + bỏ fallback ở frontend | Phương án 2: Chỉ sửa frontend |
|---|---|---|
| Mô tả | Backend validate `BranchProduct` Active trước khi trừ tồn; frontend bỏ `/products` + mock | Chỉ bỏ fallback `/products`, không đổi backend |
| Ưu | An toàn thật: gọi API trực tiếp cũng bị chặn; đúng dữ liệu dù client sai | Ít sửa, không ảnh hưởng test backend |
| Nhược | Phải sửa test seed `BranchProducts`; đơn cũ gọi API nếu thiếu dữ liệu sẽ bị từ chối | Backend vẫn bán được sản phẩm ngoài chi nhánh (Swagger, client khác, mobile) |

**Chọn: Phương án 1.** Lý do: yêu cầu của user là “chặn bán sản phẩm không thuộc chi nhánh”; chỉ sửa UI không đảm bảo quy tắc nghiệp vụ.

## 7. Rủi ro
- **Dữ liệu thiếu gán chi nhánh**: POS rỗng và bán được 0 sản phẩm → cần thông báo rõ “Chi nhánh chưa được gán sản phẩm” thay vì màn hình trống không giải thích.
- **Test hiện có sẽ vỡ** nếu không seed `BranchProducts` trong `PosOrderServiceTests` (và các test tự tạo sản phẩm riêng).
- **Đơn đặt trước cũ** đã tạo với sản phẩm sau này bị gỡ khỏi chi nhánh: `FulfillPreOrderAsync` không tạo dòng mới nên không bị chặn (chấp nhận).
- **Race**: sản phẩm bị chuyển Inactive giữa lúc mở POS và lúc chốt đơn → backend từ chối, UI hiển lỗi rõ ràng.

## 8. Success Criteria
- Sản phẩm không có `BranchProducts` Active của chi nhánh không hiện trên POS/đơn đặt trước, và bị backend từ chối khi gửi trực tiếp mà **không trừ tồn**.
- Không còn đường nào hiển thị danh mục chung/mock trên POS khi đã có chi nhánh.
- Giá và tồn chi nhánh A không lẫn sang B; quy tắc giá không đổi.
- Backend test (toàn solution) và frontend build pass.
