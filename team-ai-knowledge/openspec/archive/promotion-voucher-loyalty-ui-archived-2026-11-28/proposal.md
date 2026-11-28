# Proposal: Khuyến mãi, Voucher & Tích điểm — Frontend UI

## Vấn đề

Hệ thống MT-GRMS hiện chưa có giao diện quản lý khuyến mãi, voucher/coupon và cấu hình tích điểm cho chủ cửa hàng (store-owner). Đây là phần thiết yếu của module CRM & bán lẻ (FE-16), cho phép chủ chuỗi tạp hóa vận hành chương trình khuyến mại, phát hành voucher và quản lý loyalty.

## Mục tiêu

1. Xây dựng 3 trang UI trong module `store-owner`:
   - **Quản lý Khuyến mại & Chiết khấu** (`/store-owner/promotions`) — Danh sách, tạo mới, chi tiết accordion, bộ lọc sidebar.
   - **Quản lý Voucher/Coupon** (`/store-owner/vouchers`) — Danh sách đợt phát hành, accordion mã voucher, tạo/sửa đợt, sinh mã batch.
   - **Thiết lập Tích điểm** (`/store-owner/loyalty-config`) — Cấu hình quy tắc tích/tiêu điểm, sổ cái điểm thưởng hội viên.
2. Gộp 3 trang vào nhóm menu **"Khuyến mãi"** trên AppTopNav (navigation bar chính), nằm tiếp sau nhóm "Tài chính".
3. Dữ liệu mock (hardcode) — chưa tích hợp API backend.
4. Đồng bộ design system: Deep Teal (#0F766E), Be Vietnam Pro, bo tròn KiotViet Pills, lucide-react icons.

## Phạm vi

### In scope
- 3 trang React TSX với mock data.
- CSS module riêng cho feature (promotion.css).
- Route registration trong router.tsx.
- Navigation item "Khuyến mãi" trên AppTopNav với dropdown 3 sub-link.
- Các modal: Tạo/Sửa khuyến mại, Tạo đợt voucher, Sửa đợt voucher, Sinh mã voucher, Điều chỉnh điểm.
- Filter sidebar cho trang Khuyến mại và Voucher.
- Accordion row chi tiết (expand inline).

### Out of scope
- Tích hợp API backend (sẽ làm ở change riêng).
- In barcode/QR voucher thực tế.
- Logic phân quyền (role-based access).
- Business validation phức tạp.

## Người dùng & role liên quan
- **Store Owner** (Chủ chuỗi tạp hóa): Tạo/quản lý khuyến mại, phát hành voucher, cấu hình loyalty.
- **Branch Manager**: Xem khuyến mại đang áp dụng tại chi nhánh (read-only, ngoài scope).

## Tiêu chí thành công
1. ✅ 3 trang render đúng tại routes `/store-owner/promotions`, `/store-owner/vouchers`, `/store-owner/loyalty-config`.
2. ✅ Navigation "Khuyến mãi" xuất hiện trên AppTopNav với dropdown 3 sub-item.
3. ✅ Mỗi trang có bộ lọc/search, bảng dữ liệu mock, accordion chi tiết, modal tạo/sửa.
4. ✅ UI đồng bộ 100% design system MT-GRMS (màu, font, bo tròn, shadow, icon lucide-react).
5. ✅ `npm run build` không lỗi.
