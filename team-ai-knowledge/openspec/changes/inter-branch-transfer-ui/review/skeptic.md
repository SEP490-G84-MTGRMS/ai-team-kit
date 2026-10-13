# Skeptic Review: inter-branch-transfer-ui (FE-15 Inter-Branch Inventory Transfer)

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5 | Đầy đủ 5 Use Cases (UC-15.1 đến UC-15.5) với các scenarios GIVEN/WHEN/THEN bao phủ cả edge case (chọn trùng chi nhánh gửi - nhận, thiếu tồn khả dụng, hủy phiếu rollback tồn kho). |
| D2 Correctness | 5 | Vòng đời trạng thái Draft -> In-Transit -> Received / Cancelled chuẩn xác; công thức OnHand sender/receiver và sổ hao hụt tuân thủ nghiêm ngặt SRS. |
| D3 Coherence | 5 | Đồng nhất hoàn toàn giữa proposal, design-brief, specs và các prototype HTML màn hình Transfer. |
| D4 Constraints | 5 | Đảm bảo triệt để BR-SEC-02 (cô lập chi nhánh), BR-TRF-01 (trừ kho gửi khi xuất), BR-TRF-02 (bảo toàn lô date FEFO), BR-TRF-03/04 (nhận hàng & hao hụt), BR-TRF-05/06 (hủy phiếu an toàn & rollback). |
| D5 Blast Radius | 4 | Module độc lập tại `src/features/transfer`, tích hợp mượt mà vào `StoreOwnerLayout` và `AppTopNav` mà không ảnh hưởng tới các phân hệ khác. |

## Vấn đề & Khuyến nghị
- [MEDIUM] REQ-02: Khi chọn mặt hàng chuyển, nếu hàng hóa có nhiều quy cách ĐVT (ví dụ: Lon vs Thùng), hệ thống cần tự động tính quy đổi số lượng cơ sở để trừ tồn kho chính xác.  
  → Đề xuất: Sử dụng tỷ lệ quy đổi `ConversionRate` đã có từ phân hệ `product` để quy đổi ra đơn vị cơ bản khi trừ thẻ kho.
- [LOW] REQ-04: Màn hình kiểm đếm nhận hàng cần hỗ trợ phím tắt và bộ lọc nhanh (Tất cả / Khớp / Lệch) để nhân viên kho thao tác nhanh chóng khi xe dỡ hàng nhiều mặt hàng.  
  → Đề xuất: Giữ nguyên 4 tab lọc trên bảng kiểm đếm như trong file mẫu `receive_transfer.html`.

## Kết luận: Chấp nhận
Spec chi tiết, logic nghiệp vụ chặt chẽ, sẵn sàng lập kế hoạch Tasks và thực thi áp dụng code.
