# Improvements: pos-debt-checkout-and-multi-lot-fefo

## Spec · 2026-11-05 07:32

Luôn đồng bộ migration EF Core với DB thực tế để tránh lỗi missing column.

## Brainstorm · 2026-11-05 07:33

Khảo sát kỹ thuật toán trừ kho và luồng in ấn trước khi sửa code giúp tránh lỗi hồi quy.

## Verify Spec · 2026-11-05 07:34

Kế hoạch 5 task chia rõ từng lớp DB, Frontend, Backend, Test giúp kiểm soát chặt chẽ tiến độ.
