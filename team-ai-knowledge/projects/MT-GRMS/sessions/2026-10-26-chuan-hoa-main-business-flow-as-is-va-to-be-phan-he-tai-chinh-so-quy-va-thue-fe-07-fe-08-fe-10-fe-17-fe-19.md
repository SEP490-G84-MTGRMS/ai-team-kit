---
id: SES-2026-10-26-581
date: '2026-10-26'
author: Des7240
project: MT-GRMS
goals:
  - >-
    Chuẩn hóa 3 Quy trình Kinh doanh chính AS-IS và TO-BE theo đúng biểu mẫu đồ
    án (UML 2.5 Activity Diagram đa làn, đa nhánh rẽ thực tế, nốt khối vuông gọn
    gàng).
  - >-
    Khắc phục triệt để lỗi đè nốt, vỡ layout, rớt case khi render trên PlantUML
    và Draw.io (mxGraphModel).
  - >-
    Neo chốt kiến trúc nghiệp vụ phân hệ Tài chính - Sổ quỹ - Thuế đa chi nhánh
    (FE-07, FE-08, FE-10, FE-17, FE-19) và ranh giới hệ thống với eTax.
status: completed
files_changed:
  - nguyen_truong_an_financial_tax_multibranch_design.puml
  - nguyen_truong_an_financial_tax_multibranch_report.md
tags:
  - session
  - summary
---

# Session Summary: Chuẩn hóa Main Business Flow AS-IS và TO-BE phân hệ Tài chính, Sổ quỹ và Thuế (FE-07, FE-08, FE-10, FE-17, FE-19)

1. ĐÃ CHUẨN HÓA TOÀN DIỆN 3 QUY TRÌNH KINH DOANH CHÍNH (AS-IS & TO-BE):
- Luồng 1 (FE-07, FE-17): Quản lý Chi phí vận hành & Chi quỹ tiền mặt/ngân hàng. Phân quyền tự duyệt dưới hạn mức vs gửi phê duyệt Chủ chuỗi; lựa chọn nguồn chi (Két tiền mặt chi nhánh vs Tài khoản ngân hàng số); tự động sinh Phiếu Chi FE-17 và hạch toán Sổ S2c-HKD cùng P&L FE-10.
- Luồng 2 & Flow 2B (FE-08, FE-17):
  + Flow 2 (TO-BE POS): Khách mua hàng tại quầy xin nợ -> POS kiểm tra hạn mức nợ & nợ quá hạn tự động trên FE-08 -> Duyệt bán nợ hoặc Bắt buộc thanh toán ngay -> Sinh bản ghi nợ AR và gửi tin nhắn Zalo/SMS.
  + Flow 2B (Thu hồi nợ đa kênh): Khách trả nợ bằng Tiền mặt (tăng két quầy FE-17) hoặc Dynamic VietQR (tăng tài khoản số FE-17) -> Tự động gạch nợ AR và phục hồi hạn mức tín dụng.
- Luồng 3 (FE-10, FE-19): Giám sát ngưỡng doanh thu lũy kế YTD theo 4 nhóm hộ kinh doanh: Nhóm 1 (<= 1 Tỷ: Miễn thuế, Sổ S1a-HKD); Nhóm 2 (> 1-3 Tỷ: Bắt buộc HĐĐT, chọn Sổ S2a % Doanh thu hoặc 6 Sổ chi phí lợi nhuận 15%); Nhóm 3 (> 3-50 Tỷ: Chuỗi đa chi nhánh bắt buộc khóa phương pháp Lợi nhuận 17% và trọn bộ 6 Sổ S2a-S2e, S3a).
- Ranh giới hệ thống: MT-GRMS đóng vai trò tổng hợp, tính toán đối soát và kết xuất trọn bộ hồ sơ sổ sách kế toán chuẩn Thông tư 88/2021/TT-BTC kèm Digital Audit Hash để chủ chuỗi tải về máy tính lưu trữ / phục vụ thanh tra thuế. Hệ thống KHÔNG can thiệp nộp tự động qua API cơ quan thuế.

2. BÀI HỌC KỸ THUẬT DRAW.IO & PLANTUML:
- Draw.io PlantUML parser (mxGraphModel) không hỗ trợ switch/case (làm rớt toàn bộ khối case và dồn tọa độ về y=4620); cascading else-if gây sinh 2 hình thoi đè nát chữ.
- Giải pháp chuẩn: Sử dụng cây quyết định nhị phân lồng nhau (Nested Binary Decision Tree) chuẩn UML 2.5; giữ toàn bộ các nhánh rẽ điều kiện nằm trọn trong 1 làn, không nhảy làn bên trong nhánh rẽ con.

3. ARTIFACTS HOÀN THIỆN:
- nguyen_truong_an_financial_tax_multibranch_design.puml (Mã nguồn 6 biểu đồ AS-IS và TO-BE chuẩn).
- nguyen_truong_an_financial_tax_multibranch_report.md (Báo cáo thuyết minh kiến trúc và chu trình nghiệp vụ).
