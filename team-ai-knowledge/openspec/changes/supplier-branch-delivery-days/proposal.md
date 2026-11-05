# Proposal: supplier-branch-delivery-days

## Vấn đề
Hiện tại lịch giao hàng (DeliveryDays) chỉ cấu hình ở cấp Nhà cung cấp (tab Delivery Date). Khi gán NCC với từng cửa hàng, hệ thống chưa cho phép tùy biến ngày giao theo cặp Supplier×Branch — trong khi thực tế mỗi cửa hàng có thể nhận hàng khác thứ so với base của NCC. Màn `/store-owner/suppliers/branches` cũng chưa hiển thị lịch giao đang áp dụng cho từng dòng gán.

## Mục tiêu
1. Khi mở popup gán NCC ↔ cửa hàng: mặc định tick các ngày giao theo **base DeliveryDays của Supplier**.
2. Cho phép user **sửa / thêm / bỏ tick** ngày giao theo thứ (CN–T7) cho lần gán đó, lưu **override theo từng cửa hàng**.
3. Bảng danh sách gán bổ sung cột **Delivery date**: nhiều ngày → chuỗi viết tắt (vd. `T2, T4, T6`).
4. Luồng Order Matrix / Dispatch dùng lịch giao của assignment nếu có; không có thì fallback cấu hình Supplier.

## Phạm vi

### In scope
- UI popup gán: nhóm tick DeliveryDays theo thứ; prefill từ SupplierDeliveryConfig.
- Persist override trên `SupplierBranchAssignment` (hoặc field tương đương).
- API get/create/update assignment trả về / nhận DeliveryDays.
- Cột Delivery date trên bảng gán (chuỗi viết tắt).
- Wire `GetMatrixSupplierConfigs` ưu tiên days của assignment.
- Edit assignment đã có: cho phép đổi ngày giao (nếu UX hiện tại chỉ create — bổ sung tối thiểu qua assign lại / edit trên dòng).

### Out of scope
- Đổi LeadTime / Cutoff theo từng branch (giữ theo Supplier).
- Blackout dates per branch.
- Đổi tab Delivery Date cấp Supplier (base vẫn độc lập).
- Multi-tenant policy mới ngoài rule hiện có.

## Người dùng & role
- **Store Owner / Store Manager**: gán NCC–cửa hàng, tùy chỉnh ngày giao, xem cột trên list.
- Nhân viên chi nhánh: không chỉnh assignment (không đổi so với hiện tại).

## Tiêu chí thành công
1. Prefill popup khớp base DeliveryDays của NCC đã chọn.
2. User đổi tick → lưu thành công; reload list thấy chuỗi viết tắt đúng.
3. Matrix ngày của branch đó OPEN/OFF theo override, không chỉ theo base Supplier.
4. Assignment không có override vẫn dùng base Supplier như cũ (tương thích dữ liệu cũ).
5. Không phá flow gán / inactive assignment hiện có.
