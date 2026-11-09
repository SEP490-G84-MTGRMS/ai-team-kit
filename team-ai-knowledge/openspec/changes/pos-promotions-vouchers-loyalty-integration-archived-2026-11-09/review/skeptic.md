# Skeptic Review: pos-promotions-vouchers-loyalty-integration

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đã bao phủ đầy đủ các requirement REQ-01 đến REQ-05 kèm đầy đủ kịch bản Gherkin chuẩn cho các case chuẩn và edge cases (điểm không đủ, voucher hết hạn, khách lẻ không tích điểm). |
| D2 Correctness | 5/5 | Công thức tính tích điểm thưởng và quy tắc trừ điểm thưởng hoàn toàn khớp với implementation trong Backend `OrderService.cs` và `PromotionService.cs`. |
| D3 Coherence | 5/5 | Nhất quán hoàn toàn giữa `proposal.md`, `exploration.md`, `design-brief.md` và `specs.md`. Thuật ngữ tiếng Việt / tiếng Anh chuẩn xác. |
| D4 Constraints | 5/5 | Đảm bảo tính đa tenant (TenantId), kiểm tra quyền quản lý cấu hình, số tiền định dạng VND decimal, xử lý trừ voucher nguyên tử (atomic concurrency). |
| D5 Blast Radius | 5/5 | Phạm vi ảnh hưởng hẹp và an toàn. Việc loại bỏ UI khối Hạng thẻ không tác động tiêu cực đến CSDL do backend vốn không lưu thực thể hạng thẻ. |

## Vấn đề

- [LOW] `LoyaltyConfigForm.tsx`: Khi gỡ bỏ Card 3 (`#membership-tiers-section`), cần dọn sạch các state giả lập `tierMultipliers`, `tierMinSpending` và các hàm update liên quan để tránh lỗi unused variables khi biên dịch TypeScript (`tsc -b`).
- [LOW] `PosPaymentPanel.tsx`: Cần kiểm tra kỹ loại bỏ hoàn toàn biểu thức `({customer.membershipTier})` và định dạng số tiền quy đổi điểm dễ nhìn theo locale `vi-VN`.

## Kết luận: Chấp nhận
Specs đã hoàn toàn rõ ràng, không còn rủi ro logic hay mâu thuẫn kỹ thuật, sẵn sàng phân chia tasks và chuyển sang bước Apply.
