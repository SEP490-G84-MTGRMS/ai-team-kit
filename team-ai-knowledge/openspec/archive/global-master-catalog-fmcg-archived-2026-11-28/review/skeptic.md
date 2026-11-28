# Skeptic Review: global-master-catalog-fmcg

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đã bao phủ 4 requirements với đầy đủ kịch bản Gherkin cho cả happy path và edge case (trùng barcode, file rỗng, sai quyền 403, lỗi dòng khi import). |
| D2 Correctness | 5/5 | Logic tách biệt `MasterProduct` (Platform Scope, không `TenantId`) và `Product` của Tenant giải quyết đúng bản chất kỹ thuật, không gây nhầm lẫn multi-tenancy. |
| D3 Coherence | 5/5 | Thống nhất 100% giữa proposal, exploration, design-brief và specs delta về các trường dữ liệu và luồng tra cứu barcode. |
| D4 Constraints | 5/5 | Tôn trọng tuyệt đối Clean Architecture, bảo vệ API admin bằng `RoleConstants.AdminOnly`, tuân thủ `RULE_UI_DESIGN_SYSTEM.md` (không animation nhún nhảy, màu KiotViet, monochrome icons). |
| D5 Blast Radius | 5/5 | Rất an toàn: Thêm 2 bảng mới `MasterProducts` và `MasterProductUnits`, không làm thay đổi các bảng bán lẻ cốt lõi (`Products`, `Orders`, `Batches`), không gây breaking change. |

## Vấn đề đã xem xét & Biện pháp xử lý
- **[MEDIUM] REQ-MC-02**: Hiệu năng xử lý khi file Excel lớn (> 5.000 dòng).  
  → *Đề xuất*: Sử dụng `ClosedXML` duyệt từng dòng và thực hiện lưu batch mỗi 500 bản ghi để tránh tràn RAM và timeout HTTP connection. Đã được ghi rõ trong task backend.
- **[LOW] REQ-MC-04**: Trường hợp máy quét mã vạch USB HID gửi kèm ký tự Enter (`\r\n`).  
  → *Đề xuất*: Phía Frontend hàm xử lý `lookup-master` cần thực hiện `trim()` và loại bỏ ký tự điều khiển trước khi gọi API.

## Kết luận: Chấp nhận (Specs đã hoàn toàn sẵn sàng để bóc tách tasks và chuyển sang bước Apply)
