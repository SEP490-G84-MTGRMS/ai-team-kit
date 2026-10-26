# Improvements: be08-customer-debt-management

## Spec · 2026-10-26 14:02

Proposal đã bao quát toàn bộ bài toán sổ nợ FIFO, cấn trừ hàng trả và chặn nợ tự động

## Brainstorm · 2026-10-26 14:10

Đặc tả rõ mô hình 3 bảng (Profile, Invoice, Entry + Allocation) và thuật toán cấn trừ trả hàng đơn nợ không hoàn tiền mặt khi còn nợ

## Verify Spec · 2026-10-26 14:16

Đã phân rã 20 tasks chi tiết từ Domain, FIFO Engine, Trả hàng cấn trừ, Khóa bi quan đến Unit/Integration tests
