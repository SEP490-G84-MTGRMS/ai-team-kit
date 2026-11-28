# Skeptic Review: pos-multi-branch-role-scoping-and-pos-fefo-refinement

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đầy đủ 4 REQ từ CSDL đa chi nhánh, phân quyền POS Header, phân quyền Hủy đơn vs Đổi trả, đến Modal tra cứu & chọn bán lô FEFO. |
| D2 Correctness | 5/5 | Logic trừ kho tự động FEFO ở Backend được giữ nguyên an toàn; Option tra cứu hỗ trợ nút "Chọn bán lô này" đưa đúng mã lô vào giỏ hàng. |
| D3 Coherence | 5/5 | Khớp 100% giữa proposal.md, exploration.md, design-brief.md và specs.md. |
| D4 Constraints | 5/5 | Tuân thủ nghiêm ngặt multi-tenancy (TenantId = tenant_an_nhien_02), phân định rõ ràng quyền hạn STORE_OWNER vs EMPLOYEE. |
| D5 Blast Radius | 5/5 | Tác động khu biệt vào Seed Data An Nhiên Mart, POS Header, InvoiceManagementPage và component PosInventoryLookupModal mới; không gây breaking change. |

## Vấn đề
- [LOW] REQ-02: Khi STORE_OWNER chuyển chi nhánh trên POS, nếu giỏ hàng đang có sản phẩm thì có thể gây sai lệch tồn kho nếu chi nhánh mới không có mặt hàng đó. → Đề xuất: Reset giỏ hàng hoặc hiển thị thông báo làm mới giỏ hàng theo chi nhánh vừa chọn.
- [LOW] REQ-04: Modal Tra Cứu Lô FEFO nên tự động focus vào ô tìm kiếm hoặc lắng nghe scanner để thu ngân có thể quét barcode ngay lập tức. → Đề xuất: Thêm autoFocus và xử lý phím tắt ESC đóng modal nhanh.

## Kết luận: Chấp nhận
