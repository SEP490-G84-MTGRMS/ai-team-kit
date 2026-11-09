# Improvements: fix-pos-autopromo-400-and-preorder-units

## Brainstorm · 2026-11-09 14:06

Kiểm chứng trực tiếp qua live API evaluate-cart (HTTP 400 trên branchId chuỗi) và dữ liệu DB thật giúp bắt trúng cả 4 nguyên nhân gốc rễ ngay ở bước exploration.

## Verify Spec · 2026-11-09 14:42

Chạy song song 2 persona độc lập (Skeptic và Guardian) kết hợp đối chiếu trực tiếp code thực tế đã giúp phát hiện và bọc an toàn các bẫy FEFO, bẫy tắt nhầm CTKM UPCOMING, lỗi 400 và khóa file Windows ngay trước khi code.

## Apply · 2026-11-09 16:02

Đã bảo toàn tính đúng đắn khi quy đổi đơn vị nhiều lô FEFO và đối khớp chi nhánh dạng chuỗi chống lỗi 400.

## Test · 2026-11-09 16:05

Bộ test hồi quy tự động kiểm soát chặt chẽ đối khớp token chi nhánh và tính toán số lượng quy đổi theo lô FEFO.
