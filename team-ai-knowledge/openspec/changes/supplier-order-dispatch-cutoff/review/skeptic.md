# Skeptic Review: supplier-order-dispatch-cutoff

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | 5 REQ bao quát toàn bộ bài toán phân rã đơn theo NCC, phân loại mức độ khẩn cấp Urgency, Accordion 2 tầng và xử lý Edge Cases. |
| D2 Correctness | 5/5 | Logic đếm ngược cutoff time, kiểm tra hạn mức MOV, cơ chế dời lịch giao khi overdue hoàn toàn phù hợp thực tế vận hành chuỗi bán lẻ. |
| D3 Coherence | 5/5 | Khớp 100% giữa Proposal, Exploration, Design-Brief và Specs; bám sát wireframe trực quan của người dùng. |
| D4 Constraints | 5/5 | Đảm bảo quy chuẩn `RULE_UI_DESIGN_SYSTEM.md` (compact density, màu sắc chỉ thị chuẩn, định dạng số căn phải). |
| D5 Blast Radius | 5/5 | Rất an toàn: Thêm màn hình và luồng mới, không làm ảnh hưởng đến các màn hình PO đang có. |

## Vấn đề
- [MEDIUM] Mock Data: Cần xây dựng tập mock data mẫu gồm 8 NCC chuẩn hóa phản ánh đầy đủ các tình huống: 2 NCC khẩn cấp (< 2h hôm nay), 3 NCC cutoff tối nay, 3 NCC ngày sau, 1 NCC chưa đạt MOV và 1 NCC có cả hàng ngày và hàng tuần để kiểm thử trực quan.  
  → **Đề xuất**: Xây dựng file dữ liệu `mockDispatchData.ts` hoặc tích hợp trong `mockData.ts`.
- [LOW] Điều hướng liên thông: Cần có nút liên kết qua lại giữa "Bảng ma trận đặt hàng (Grid/Matrix)" và "Trung tâm Chốt Đơn (Dispatch Hub)".  
  → **Đề xuất**: Thêm nút điều hướng nhanh ở Header của trang.

## Kết luận: Chấp nhận
Không có vấn đề mức HIGH. Đặc tả đã sẵn sàng để lập danh sách công việc (`tasks.md`).
