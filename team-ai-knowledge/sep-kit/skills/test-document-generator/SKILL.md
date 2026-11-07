---
name: test-document-generator
description: >-
  Skill dùng để tự động tạo và xuất bộ tài liệu kiểm thử chuẩn FPT University SEP490
  (Report 5.1 -> 5.5) dưới dạng file Excel (.xlsx) cho từng màn hình UI hoặc toàn bộ hệ thống.
  Hỗ trợ đầy đủ 5 tầng Unit/Integration/System FRs/NFRs/Acceptance.
  Trigger khi người dùng yêu cầu gen tài liệu test màn hình hoặc xuất báo cáo kiểm thử 5.1 đến 5.5.
---

# Test Document Generator Skill (FPT SEP490 Standard)

Skill này tự động hóa việc khởi tạo, tổng hợp và xuất toàn bộ tài liệu **Kiểm thử Phần mềm (Software Testing Documentation - Report 5.1 đến 5.5)** dưới dạng tệp Excel `.xlsx` tuân thủ **100% định dạng biểu mẫu chuẩn Đồ án tốt nghiệp FPT University (SEP490)**.

> **QUY TẮC QUẢN LÝ TÀI LIỆU (IMPORTANT):**
> Tất cả các tệp tài liệu kiểm thử cho từng màn hình phải được lưu trữ tập trung tại:
> `ai-team-kit/test_documents/screens/` và `ai-team-kit/team-ai-knowledge/test_documents/screens/`
> Các tập báo cáo tổng thể Master Reports nằm tại:
> `ai-team-kit/test_documents/` và `ai-team-kit/team-ai-knowledge/test_documents/`

---

## 📁 Cấu trúc Thư mục Tài liệu Kiểm thử

```text
ai-team-kit/test_documents/
├── screens/                                       # 40 File Excel tài liệu kiểm thử riêng cho từng màn hình
│   ├── UI-09-01_Master_Supplier/                  # ⭐ Trọn bộ 5 Báo cáo kiểm thử chuyên sâu cho Màn hình Master Supplier
│   │   ├── Report-5.1_Unit_Test_Master_Supplier.xlsx
│   │   ├── Report-5.2_Integration_Test_Master_Supplier.xlsx
│   │   ├── Report-5.3_System_Test_FRs_Master_Supplier.xlsx
│   │   ├── Report-5.4_System_Test_NFRs_Master_Supplier.xlsx
│   │   └── Report-5.5_Acceptance_Test_Scripts_Master_Supplier.xlsx
│   ├── 01_UI-02-01_Danh_sach_Lo_hang_va_Han_dung.xlsx
│   ├── 20_UI-09-01_Danh_muc_Nha_cung_cap.xlsx
│   ├── ...
│   └── 40_UI-21-01_Quan_tri_He_thong_SaaS_Multi_tenant.xlsx
├── Report-5.1_Unit_Test_Master.xlsx               # Báo cáo Unit Test toàn hệ thống (40 Tabs màn hình)
├── Report-5.2_Integration_Test_Master.xlsx        # Báo cáo Integration Test toàn hệ thống (40 Tabs màn hình)
├── Report-5.3_System_Test_FRs_Master.xlsx         # Báo cáo System Test Chức năng (40 Tabs màn hình)
├── Report-5.4_System_Test_NFRs_Master.xlsx        # Báo cáo Phi chức năng (Security & Performance)
├── Report-5.5_Acceptance_Test_Scripts_Master.xlsx # Kịch bản Nghiệm thu UAT & Exploratory Testing
├── INDEX.md                                       # Bảng tra cứu danh mục 40 màn hình & RACI
└── README.md                                      # Hướng dẫn chi tiết sử dụng & tích hợp quy trình
```

---

## ⚡ Hướng dẫn Sử dụng & Lệnh Thực thi

### 1. Sinh trọn bộ 5 Báo cáo độc lập cho Màn hình Master Supplier:
```powershell
python "ai-team-kit/team-ai-knowledge/scripts/generate_master_supplier_reports.py"
```

### 2. Sinh lại toàn bộ 40 màn hình và 5 Master Reports:
```powershell
python "ai-team-kit/team-ai-knowledge/scripts/generate_screen_test_docs.py"
```

### 3. Tích hợp trong Bước 5 quy trình SEP (`/sep-test`):
Khi đang thực hiện bước kiểm thử cho một OpenSpec change:
1. Agent tạo bảng kịch bản Markdown Unified Test Table trong `test-report.md`.
2. Đồng thời gọi script tương ứng để cập nhật bảng test tương ứng của màn hình đó vào thư mục `ai-team-kit/test_documents/screens/`.
3. Tự động đồng bộ số liệu vào 5 Master Reports.
