# Improvements: consolidate-database-seeders

## Spec · 2026-11-05 17:20

Đã xác định rõ phạm vi gộp code và tiêu chí kiểm thử không làm mất dữ liệu demo

## Brainstorm · 2026-11-05 17:28

Đã thống nhất giữ AppDbContext sạch sẽ và hợp nhất toàn bộ dữ liệu mẫu vào DbInitializer chia theo các hàm phân hệ riêng biệt

## Verify Spec · 2026-11-05 17:30

Đã hoàn tất kế hoạch 5 task chi tiết và review phản biện 5/5 điểm

## Apply · 2026-11-05 18:05

Đã gộp thành công toàn bộ dữ liệu mẫu vào DbInitializer, xóa DatabaseSeeder và pass 451/451 test
