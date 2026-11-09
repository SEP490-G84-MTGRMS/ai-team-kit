# Skeptic Review: pos-bank-cashbook-promo-conflict-and-ui-polish

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Bao phủ đầy đủ cả 4 nhóm yêu cầu (`REQ-POS-BANK-01`, `REQ-POS-PROMO-02`, `REQ-PROD-UI-03`, `REQ-UI-NAV-04`) kèm Scenario tái hiện lỗi, Regression và Edge case (`finalAmount == 0`, khóa điểm khi `allowPointsWithPromotions == false`, giỏ hàng rỗng/chuyển tab). |
| D2 Correctness | 5/5 | Xử lý đúng tận gốc root cause (không vá triệu chứng): loại bỏ fallback `DefaultBankId` chéo tenant, tách biệt `autoPromoDiscount` khỏi `voucherDiscount` để không trừ trùng, kẹp trần `BudgetLimit - TotalDiscountGiven` và chọn Best-Offer không cộng dồn. |
| D3 Coherence | 5/5 | Khớp 100% giữa `proposal.md`, `exploration.md`, `specs.md` và bộ kiểm thử hiện hành `PromotionEvaluationTests.cs` (giữ nguyên hành vi kết hợp 1 Auto Promo tốt nhất + 1 mã Voucher hợp lệ). |
| D4 Constraints | 5/5 | Tuân thủ chặt chẽ cô lập đa tenant (`TenantId`), kiểu tiền tệ `decimal(18,2)`, thời gian UTC, không phát sinh EF Core Migration không cần thiết và không phá vỡ constructor của các test cũ. |
| D5 Blast Radius | 5/5 | Phạm vi ảnh hưởng khoanh vùng gọn trong `CashbookService`, `OrderService`, `PromotionService` và 7 component Frontend liên quan; các đơn lỗi trước đó đã rollback tự động nên không cần backfill dữ liệu lịch sử. |

## Vấn đề
- [MEDIUM] `REQ-POS-PROMO-02`: Ban đầu chưa nêu rõ việc kẹp trần ngân sách còn lại (`BudgetLimit - TotalDiscountGiven`) trước khi so sánh Best-Offer và việc reset `autoPromoDiscount` khi giỏ hàng về rỗng hoặc chuyển tab POS. → **Đã xử lý**: Đã cập nhật trực tiếp vào `specs.md` ở vòng review 1.
- [MEDIUM] `REQ-POS-BANK-01`: Khi khởi tạo mới `FinanceAccount` kiểu `Bank`, cần gán tường minh `TenantId` hiện hành và `Id = Guid.NewGuid()` ngay trên entity để tương thích cả EF Core lẫn `FakeRepository` trong unit test. → **Đã xử lý**: Đã bổ sung ràng buộc MUST trong `specs.md`.
- [LOW] `REQ-UI-NAV-04`: Khi xóa nút `← Về Dashboard` trong `PosHeader.tsx`, cần dọn luôn import icon không còn sử dụng (nếu có) để tránh lỗi `TS6133` khi chạy `tsc -b`. → Ghi chú lưu ý khi thực thi task T6.

## Kết luận: Chấp nhận
