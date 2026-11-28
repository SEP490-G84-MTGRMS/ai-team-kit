# Skeptic Review: pos-cash-control-nav-and-shift-history

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đầy đủ kịch bản Gherkin cho các luồng điều hướng, lọc chi nhánh, tải dữ liệu thật và xác nhận bàn giao ca (gồm cả case rỗng, khiếu nại). |
| D2 Correctness | 5/5 | Phân định rạch ròi giữa thao tác quản trị hạn mức tiền két (cấp Chủ cửa hàng) và thao tác quầy bán hàng (POS). |
| D3 Coherence | 5/5 | Nhất quán giữa Proposal, Exploration, Design Brief và Specs. Khớp 100% với ảnh mockup menu Cài đặt & Thiết lập của người dùng. |
| D4 Constraints | 5/5 | Tuân thủ RBAC (Store Owner vs Cashier), multi-tenant isolation và kiến trúc Clean Architecture. |
| D5 Blast Radius | 5/5 | Vùng ảnh hưởng hẹp, không gây breaking change lên database hay các luồng bán hàng / trừ kho FEFO đang hoạt động ổn định. |

## Vấn đề
- [LOW] REQ-NAV-01: Khi điều hướng từ trang Lịch làm việc sang trang Lịch sử ca, nếu người dùng đang lọc chi nhánh cụ thể thì cần chuyển tiếp query `branchId` để tránh việc người dùng phải thao tác chọn lại chi nhánh. -> Đề xuất: Đã đặc tả truyền `?branchId=...` qua URL.
- [LOW] REQ-SHIFT-HIST-01: `PosShiftPage.tsx` hiện chứa mock data kiểm đếm mệnh giá (đã được chuyển vào `CloseShiftModal.tsx`). Cần dọn sạch các mock không dùng để tránh phình to bundle. -> Đề xuất: Loại bỏ code mock cũ, chỉ giữ lại view danh sách lịch sử ca và modal xem Z-Report.

## Kết luận: Chấp nhận
Đặc tả rõ ràng, giải quyết triệt để vấn đề UX và đáp ứng đúng yêu cầu của người dùng. Sẵn sàng lập tasks và tiến hành triển khai.
