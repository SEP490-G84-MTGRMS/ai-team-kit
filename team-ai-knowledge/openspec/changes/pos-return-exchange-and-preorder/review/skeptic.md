# Skeptic Review: pos-return-exchange-and-preorder

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đầy đủ kịch bản chính và ngoại lệ: đổi hàng giá cao hơn, trả hàng trừ nợ, thiếu kho hàng mới, hủy đơn sai quyền, cọc dưới 10%. |
| D2 Correctness | 5/5 | Công thức bù trừ chênh lệch chính xác ($T_{new} - T_{return}$); logic hoàn kho và trừ kho FEFO nhất quán với thiết kế kiến trúc. |
| D3 Coherence | 5/5 | Proposal, Exploration, Design Brief và Delta Specs đồng nhất 100% về thuật ngữ và phân vai tác tử. |
| D4 Constraints | 5/5 | Phân quyền 2 lớp (Frontend & Backend chặn role CASHIER với mã 403), bảo toàn TenantId và ràng buộc tài chính decimal. |
| D5 Blast Radius | 5/5 | Phạm vi kiểm soát an toàn; không thay đổi cấu trúc bảng Orders; thêm endpoint mới và mở rộng validation cho PreOrder và Cancel. |

## Vấn đề
- [LOW] Cần chú ý khi khách trả hàng của đơn mua nợ: Ưu tiên lựa chọn "Trừ vào sổ nợ" thay vì "Hoàn tiền mặt" để tránh rủi ro quầy bị mất tiền mặt mà khách vẫn chưa trả nợ đơn cũ. $\rightarrow$ Đã được bao hàm trong thiết kế modal với lựa chọn linh hoạt.
- [LOW] Đối với đơn Pre-Order: Đảm bảo nhãn chi nhánh nhận hàng hiển thị rõ ràng trên hóa đơn/phiếu xác nhận để khách không đi nhầm chi nhánh. $\rightarrow$ Đã đặc tả trong `REQ_POS_PRE_03`.

## Kết luận: Chấp nhận
Spec đã hoàn thiện, rõ ràng, sẵn sàng để lập kế hoạch tasks và triển khai code.
