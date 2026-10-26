---
id: SES-2026-10-26-253
date: '2026-10-26'
author: Des7240
project: MT-GRMS
goals:
  - >-
    Rà soát toàn diện và chuẩn hóa 100% Business Rules phân hệ Tài chính (FE-07,
    FE-08, FE-10, FE-17, FE-19)
  - >-
    Cập nhật căn cứ pháp lý Thông tư 152/2025/TT-BTC, Nghị định 141/2026/NĐ-CP
    (ngưỡng 1 tỷ từ 01/01/2026), Luật QLT 108/2025, Luật Thuế TNCN 109/2025, bãi
    bỏ thuế khoán
  - >-
    Khắc phục triệt để các góc khuất thực tế: chuỗi luân chuyển tiền mặt két-két
    sắt-đang chuyển-ngân hàng, chênh lệch két thừa/thiếu, vòng đời chi phí 5
    bước, đổi trả hàng mua nợ không chi tiền mặt kèm giảm giá vốn COGS, nợ FIFO
    và khoản trả trước
  - Đồng bộ hóa bản đặc tả v3.0 vào ai-team-kit và team-ai-knowledge
status: completed
files_changed:
  - projects/MT-GRMS/context/nguyen_truong_an_financial_business_rules_v3.md
  - KNOWLEDGE_MAP.md
tags:
  - session
  - summary
---

# Session Summary: Chốt Đặc tả Quy tắc Nghiệp vụ Tài chính v3.0 (TT 152/2025 & NĐ 141/2026)

Đã hoàn thành rà soát và cập nhật toàn bộ Bản đặc tả quy tắc nghiệp vụ tài chính v3.0 cho Nguyễn Trường An (FE-07, FE-08, FE-10, FE-17, FE-19):
1. PHÁP LÝ THUẾ 2026: Cập nhật chuẩn xác Thông tư 152/2025/TT-BTC (thay TT 88/2021), Nghị định 141/2026/NĐ-CP (sửa NĐ 68/2026 nâng ngưỡng miễn thuế lên 1 tỷ đồng từ 01/01/2026), Luật Quản lý thuế 108/2025/QH15, Luật Thuế TNCN 109/2025/QH15. Phân loại 4 nhóm doanh thu (Nhóm 1 <= 1 tỷ, Nhóm 2 > 1-3 tỷ, Nhóm 3 > 3-50 tỷ, Nhóm 4 > 50 tỷ). Cơ chế 4 sổ kế toán S2b, S2c, S2d, S2e cho phương pháp kê khai thu nhập tính thuế.
2. DÒNG TIỀN & SỔ QUỸ (FE-17): Thiết lập chuỗi luân chuyển tiền sau chốt ca (Két quầy -> Két sắt qua Cash drop 2 chữ ký -> CashInTransit có CarrierUserId -> Ngân hàng). Xử lý chênh lệch két đối xứng qua tài khoản treo chờ xử lý CASH_OVER_SUSPENSE và CASH_SHORTAGE_PENDING. Khấu trừ lương bồi hoàn tuân thủ Điều 102 BLLĐ 2019.
3. CHI PHÍ (FE-07): Vòng đời 5 bước tách khâu duyệt khỏi khâu chi (DRAFT -> PENDING -> APPROVED -> PAID/FAILED -> REVERSED). Chống tách bill theo gộp đối tượng/ngày và mẫu hình thời gian.
4. CÔNG NỢ & ĐỔI TRẢ (FE-08): Thẩm định tín dụng 2 khóa (Hạn mức + Nợ quá hạn). Xử lý đổi trả theo 3 trạng thái thanh toán gốc (cấm chi tiền mặt khi chưa thanh toán, giảm COGS khi nhập lại kho). Gạch nợ FIFO và lưu khoản trả trước CustomerAdvanceCredit.
5. P&L DASHBOARD (FE-10): Bảng định tuyến giao dịch 14 dòng chuẩn dồn tích; loại trừ vốn chủ và nợ gốc vay; phân bổ chi phí chung theo Largest Remainder.
6. TESTING SUITE: Bộ 45 Test Cases bao quát toàn bộ Invariants, Business Rules, Edge Cases và kiểm thử giá trị biên.
