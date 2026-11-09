# Proposal: pos-branch-scoped-catalog-and-stock

## 1. Mô tả lỗi
POS đang hiển thị và cho phép bán sản phẩm **không bám theo chi nhánh** đang chọn:
- Khi API danh mục chi nhánh (`/branches/{branchId}/products`) trả rỗng hoặc lỗi, frontend `posOrderApi.getAllProducts` tự rơi vào fallback `/products` (danh mục chung của Tenant). Thu ngân thấy cả sản phẩm chưa được gán cho chi nhánh, kèm tồn kho/giá không phản ánh chi nhánh.
- Backend `CreateOrderAsync`, `CreatePreOrderAsync`, chiều hàng mới của Đổi/Trả chỉ dùng `BranchProduct` để lấy giá override (nếu có) và **không chặn** khi sản phẩm chưa thuộc danh mục chi nhánh.
- Khi màn Quản lý đơn đang lọc "Tất cả chi nhánh", việc tạo đơn đặt trước có thể lấy chi nhánh mặc định thay vì chi nhánh người dùng chọn.

## 2. Bước tái hiện
1. Chi nhánh A có lô tồn trong `BranchStocks` cho sản phẩm X nhưng X chưa được gán `BranchProducts` Active của A (hoặc chi nhánh A chưa gán sản phẩm nào).
2. Mở POS / Tạo đơn đặt trước tại chi nhánh A.
3. Quan sát danh sách sản phẩm; hoặc gửi trực tiếp `POST /orders` với sản phẩm X cho chi nhánh A.

## 3. Kết quả thực tế vs mong đợi
| | Thực tế | Mong đợi |
|---|---|---|
| Danh sách POS khi API chi nhánh rỗng/lỗi | Hiện danh mục chung của Tenant | Không hiện danh mục chung; báo lỗi / danh sách rỗng theo chi nhánh |
| Sản phẩm không thuộc `BranchProducts` Active của chi nhánh | Vẫn có thể đi qua backend và bán/đặt trước được (giá lấy `Product.SellingPrice`) | Backend từ chối, thông báo rõ sản phẩm chưa được gán vào danh mục chi nhánh |
| Chọn "Tất cả chi nhánh" rồi bán/đặt trước | Có thể rơi vào chi nhánh đầu tiên | Bắt buộc chọn đúng 1 chi nhánh trước khi bán/đặt trước |
| Trừ tồn kho | Theo `BranchStocks` của chi nhánh (FEFO) — đúng | Giữ nguyên |

## 4. Mức độ ảnh hưởng
- **Ai**: thu ngân, quản lý, chủ cửa hàng có nhiều chi nhánh.
- **Rủi ro nghiệp vụ**: bán sản phẩm ngoài danh mục chi nhánh, hiển thị tồn/giá sai ngữ cảnh chi nhánh.
- **Dữ liệu**: không hỏng dữ liệu hiện có (backend vẫn tự kiểm tra `BranchStocks` nên không bán lố tồn); nhưng đơn hàng phát sinh có thể dùng giá master thay vì giá chi nhánh.

## 5. Mục tiêu
- POS chỉ hiển thị và chỉ bán được sản phẩm nằm trong `BranchProducts` Active của chi nhánh đang chọn; tồn kho hiển thị và bị trừ là `BranchStocks` của đúng chi nhánh.
- **Quyết định đã thống nhất với user (phương án A)**: sản phẩm có tồn trong `BranchStocks` nhưng chưa được gán `BranchProducts` Active thì **không bán được**, phải gán vào danh mục chi nhánh trước.

## 6. Phạm vi
**In scope**
- Frontend: `posOrderApi.getAllProducts` bỏ fallback `/products` khi đã có chi nhánh; lỗi API thì báo lỗi.
- Frontend: POS Checkout, Tạo đơn đặt trước, Đổi/Trả hàng dùng `branchId` thật; "Tất cả chi nhánh" phải chọn 1 chi nhánh trước khi bán/đặt trước.
- Backend: `CreateOrderAsync`, `CreatePreOrderAsync`, chiều `NewItems` của `ProcessReturnExchangeAsync` từ chối sản phẩm chưa có `BranchProduct` Active ở chi nhánh; giữ trừ tồn `BranchStocks` FEFO theo chi nhánh.
- Test hồi quy cho các kịch bản trên.

**Out of scope**
- Thay đổi màn hình gán sản phẩm vào chi nhánh (`BranchProducts`) và nhập kho.
- Thay đổi thuật toán FEFO, khuyến mãi, đơn vị quy đổi đã làm ở change `fix-pos-autopromo-400-and-preorder-units`.
- Migration dữ liệu tự động gán `BranchProducts` cho tồn kho cũ.

## 7. Người dùng liên quan
Thu ngân POS, Quản lý chi nhánh, Chủ cửa hàng (STORE_OWNER).

## 8. Tiêu chí coi là đã sửa
- Sản phẩm không thuộc `BranchProducts` Active của chi nhánh A không xuất hiện trên POS/Tạo đơn đặt trước tại A, và không còn fallback sang danh mục chung.
- Gửi trực tiếp sản phẩm đó qua `POST /orders` / pre-order / đổi trả bị backend từ chối với thông báo rõ ràng và không trừ tồn.
- Tồn và giá của chi nhánh A không lẫn sang chi nhánh B.
- Đơn tạo đúng chi nhánh đã chọn, trừ tồn đúng `BranchStocks` của chi nhánh đó (FEFO).
- Backend test + frontend build pass.
