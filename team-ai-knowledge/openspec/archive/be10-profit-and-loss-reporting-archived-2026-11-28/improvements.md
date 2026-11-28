# Improvements: be10-profit-and-loss-reporting

## Spec · 2026-10-26 14:40

Proposal đã làm rõ bài toán phân định dòng tiền và lợi nhuận, tách vốn chủ và tích hợp 4 phân hệ (POS, Inventory, OPEX FE-07, Debt FE-08)

## Brainstorm · 2026-10-26 14:45

Chốt chuẩn công thức P&L: NetRevenue, COGS từ lô hàng, OPEX FE-07, BadDebt FE-08, và phân rã chi phí chi tiết

## Verify Spec · 2026-10-26 14:56

Review Skeptic đạt 5/5, hoàn chỉnh 16 tasks chuẩn bị cho Bước 4 Apply

## Apply · 2026-10-26 15:03

Code hoàn tất 16/16 tasks, 91/91 unit và integration tests pass 100%, 0 warning 0 error

## Test · 2026-10-26 15:05

Đảm bảo test database luôn inject Mock ITenantContext tránh NullReferenceException trong EF Core Global Query Filter.
