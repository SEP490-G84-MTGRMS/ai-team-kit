# Improvements: database-storage-selection

## Spec · 2026-10-12 16:25

Chuẩn hóa kiến trúc lưu trữ PostgreSQL 16 trên nền EF Core 8 Code-First, tối ưu hóa concurrency POS và quản lý lô FEFO.

## Brainstorm · 2026-10-12 16:32

Đặc tả rõ ràng các ràng buộc bất biến (invariants) về multi-tenant và decimal currency giúp khâu review persona dễ đánh giá rủi ro.
