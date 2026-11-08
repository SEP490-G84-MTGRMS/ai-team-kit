# MT-GRMS — HỆ THỐNG TÀI LIỆU KIỂM THỬ TỪNG MÀN HÌNH (SEP490)

> **Dự án:** Smart Grocery Management System (SGMS) — MT-GRMS  
> **Tiêu chuẩn biểu mẫu:** Định dạng chuẩn FPT University SEP490 (Report 5.1 -> 5.5)  
> **Ngày cập nhật:** 2026-11-06  
> **Tình trạng nghiệm thu:** 100% PASS (Sẵn sàng bảo vệ Hội đồng đồ án)  

---

## 📁 Cấu trúc Thư mục

```text
ai-team-kit/test_documents/
├── screens/                                    # 40 File Excel tài liệu test riêng từng màn hình
│   ├── 01_UI-02-01_Danh_sach_Lo_hang_va_Han_dung.xlsx
│   ├── 02_UI-02-02_Chi_tiet_Lo_hang_va_Truy_xuat.xlsx
│   ├── ...
│   └── 40_UI-21-01_Quan_tri_He_thong_SaaS_Multi_tenant.xlsx
├── Report-5.1_Unit_Test_Master.xlsx            # Báo cáo Kiểm thử Đơn vị Tổng thể (40 Tabs màn hình)
├── Report-5.2_Integration_Test_Master.xlsx     # Báo cáo Kiểm thử Tích hợp Tổng thể (40 Tabs màn hình)
├── Report-5.3_System_Test_FRs_Master.xlsx      # Báo cáo Kiểm thử Chức năng Hệ thống (40 Tabs màn hình)
├── Report-5.4_System_Test_NFRs_Master.xlsx     # Báo cáo Kiểm thử Phi chức năng (Security & Performance)
├── Report-5.5_Acceptance_Test_Scripts_Master.xlsx # Kịch bản Nghiệm thu Người dùng (UAT & Exploratory)
├── INDEX.md                                    # Mục lục tra cứu nhanh 40 màn hình
└── README.md                                   # Hướng dẫn chi tiết sử dụng và quy trình /sep-test
```

---

## 📑 Mục lục 40 Màn hình & Phân công RACI

| STT | Mã màn hình | Tên màn hình UI | Phân hệ Feature | Vai trò chính | Người viết | Người test | File chi tiết |
|:---:|:---:|---|---|:---:|:---:|:---:|---|
| 01 | `UI-02-01` | **Danh sách Lô hàng & Hạn dùng (FEFO)** | FE-02 Quản lý Lô & Hạn sử dụng (FEFO) | Kho / Quản lý | Đặng Đỗ Minh Đức | Nguyễn Bá Sơn | [`01_UI-02-01_Danh_sach_Lo_hang_va_Han_dung.xlsx`](file:///./screens/01_UI-02-01_Danh_sach_Lo_hang_va_Han_dung.xlsx) |
| 02 | `UI-02-02` | **Chi tiết Lô hàng & Truy xuất nguồn gốc** | FE-02 Quản lý Lô & Hạn sử dụng (FEFO) | Nhân viên Kho | Đặng Đỗ Minh Đức | Nguyễn Trường An | [`02_UI-02-02_Chi_tiet_Lo_hang_va_Truy_xuat.xlsx`](file:///./screens/02_UI-02-02_Chi_tiet_Lo_hang_va_Truy_xuat.xlsx) |
| 03 | `UI-02-03` | **Cảnh báo Cận hạn & Hết hạn** | FE-02 Quản lý Lô & Hạn sử dụng (FEFO) | NV Kho / Quản lý | Đặng Đỗ Minh Đức | Nguyễn Minh Tâm | [`03_UI-02-03_Canh_bao_Can_han_va_Het_han.xlsx`](file:///./screens/03_UI-02-03_Canh_bao_Can_han_va_Het_han.xlsx) |
| 04 | `UI-02-04` | **Cấu hình Ngưỡng Hạn sử dụng** | FE-02 Quản lý Lô & Hạn sử dụng (FEFO) | Admin / Chủ CH | Đặng Đỗ Minh Đức | Nguyễn Long Nhật | [`04_UI-02-04_Cau_hinh_Nguong_Han_su_dung.xlsx`](file:///./screens/04_UI-02-04_Cau_hinh_Nguong_Han_su_dung.xlsx) |
| 05 | `UI-02-05` | **POS Badge HSD & Chặn bán hàng hết hạn** | FE-02 Quản lý Lô & Hạn sử dụng (FEFO) | Thu ngân / Quản lý | Đặng Đỗ Minh Đức | Nguyễn Bá Sơn | [`05_UI-02-05_POS_Badge_HSD_va_Chan_ban_het_han.xlsx`](file:///./screens/05_UI-02-05_POS_Badge_HSD_va_Chan_ban_het_han.xlsx) |
| 06 | `UI-02-06` | **Nhận hàng hôm nay & Gán lô FEFO** | FE-02 Quản lý Lô & Hạn sử dụng (FEFO) | Nhân viên Kho | Đặng Đỗ Minh Đức | Nguyễn Trường An | [`06_UI-02-06_Nhan_hang_hom_nay_va_Gan_lo_FEFO.xlsx`](file:///./screens/06_UI-02-06_Nhan_hang_hom_nay_va_Gan_lo_FEFO.xlsx) |
| 07 | `UI-04-01` | **Tổng quan Tồn kho & Cảnh báo định mức** | FE-04 Kiểm kê & Quản lý Tồn kho | Kho / Quản lý | Đặng Đỗ Minh Đức | Nguyễn Bá Sơn | [`07_UI-04-01_Tong_quan_Ton_kho_va_Canh_bao.xlsx`](file:///./screens/07_UI-04-01_Tong_quan_Ton_kho_va_Canh_bao.xlsx) |
| 08 | `UI-04-02` | **Master Vị trí Kệ hàng (Shelf Location)** | FE-04 Kiểm kê & Quản lý Tồn kho | Admin / Kho | Đặng Đỗ Minh Đức | Nguyễn Minh Tâm | [`08_UI-04-02_Master_Vi_tri_Ke_hang.xlsx`](file:///./screens/08_UI-04-02_Master_Vi_tri_Ke_hang.xlsx) |
| 09 | `UI-04-03` | **Danh sách Phiên kiểm kê kho** | FE-04 Kiểm kê & Quản lý Tồn kho | Quản lý cửa hàng | Đặng Đỗ Minh Đức | Nguyễn Long Nhật | [`09_UI-04-03_Danh_sach_Phien_kiem_ke_kho.xlsx`](file:///./screens/09_UI-04-03_Danh_sach_Phien_kiem_ke_kho.xlsx) |
| 10 | `UI-04-04` | **Tạo Phiên kiểm kê kho mới** | FE-04 Kiểm kê & Quản lý Tồn kho | Quản lý cửa hàng | Đặng Đỗ Minh Đức | Nguyễn Bá Sơn | [`10_UI-04-04_Tao_Phien_kiem_ke_kho_moi.xlsx`](file:///./screens/10_UI-04-04_Tao_Phien_kiem_ke_kho_moi.xlsx) |
| 11 | `UI-04-05` | **Phiếu đếm thực tế Handheld (Mobile UI)** | FE-04 Kiểm kê & Quản lý Tồn kho | Nhân viên Kho | Đặng Đỗ Minh Đức | Nguyễn Trường An | [`11_UI-04-05_Phieu_dem_thuc_te_Handheld.xlsx`](file:///./screens/11_UI-04-05_Phieu_dem_thuc_te_Handheld.xlsx) |
| 12 | `UI-04-06` | **Bảng chênh lệch & Phê duyệt cân bằng kho** | FE-04 Kiểm kê & Quản lý Tồn kho | Quản lý / Chủ CH | Đặng Đỗ Minh Đức | Nguyễn Bá Sơn | [`12_UI-04-06_Bang_chenh_lech_va_Phe_duyet.xlsx`](file:///./screens/12_UI-04-06_Bang_chenh_lech_va_Phe_duyet.xlsx) |
| 13 | `UI-05-01` | **Danh sách Đơn mua PO** | FE-05 Mua hàng & Nhập kho (PO/GRN) | Mua hàng / Quản lý | Đặng Đỗ Minh Đức | Nguyễn Trường An | [`13_UI-05-01_Danh_sach_Don_mua_PO.xlsx`](file:///./screens/13_UI-05-01_Danh_sach_Don_mua_PO.xlsx) |
| 14 | `UI-05-02` | **Lưới tạo PO Nhiều ngày & Cut-off** | FE-05 Mua hàng & Nhập kho (PO/GRN) | Nhân viên Mua hàng | Đặng Đỗ Minh Đức | Nguyễn Minh Tâm | [`14_UI-05-02_Luoi_tao_PO_Nhieu_ngay_va_Cut_off.xlsx`](file:///./screens/14_UI-05-02_Luoi_tao_PO_Nhieu_ngay_va_Cut_off.xlsx) |
| 15 | `UI-05-03` | **Chi tiết Đơn mua PO & Lịch sử duyệt** | FE-05 Mua hàng & Nhập kho (PO/GRN) | Quản lý cửa hàng | Đặng Đỗ Minh Đức | Nguyễn Bá Sơn | [`15_UI-05-03_Chi_tiet_Don_mua_PO_va_Lich_su.xlsx`](file:///./screens/15_UI-05-03_Chi_tiet_Don_mua_PO_va_Lich_su.xlsx) |
| 16 | `UI-05-04` | **Dialog Đóng PO sớm & Hủy đơn** | FE-05 Mua hàng & Nhập kho (PO/GRN) | Quản lý cửa hàng | Đặng Đỗ Minh Đức | Nguyễn Long Nhật | [`16_UI-05-04_Dialog_Dong_PO_som_va_Huy_don.xlsx`](file:///./screens/16_UI-05-04_Dialog_Dong_PO_som_va_Huy_don.xlsx) |
| 17 | `UI-05-05` | **Danh sách Phiếu nhập kho GRN** | FE-05 Mua hàng & Nhập kho (PO/GRN) | Nhân viên Kho | Đặng Đỗ Minh Đức | Nguyễn Bá Sơn | [`17_UI-05-05_Danh_sach_Phieu_nhap_kho_GRN.xlsx`](file:///./screens/17_UI-05-05_Danh_sach_Phieu_nhap_kho_GRN.xlsx) |
| 18 | `UI-05-06` | **Form Nhập kho & Cảnh báo Giá nhập** | FE-05 Mua hàng & Nhập kho (PO/GRN) | Nhân viên Kho | Đặng Đỗ Minh Đức | Nguyễn Trường An | [`18_UI-05-06_Form_Nhap_kho_va_Canh_bao_Gia.xlsx`](file:///./screens/18_UI-05-06_Form_Nhap_kho_va_Canh_bao_Gia.xlsx) |
| 19 | `UI-05-07` | **Xác nhận GRN & Phân bổ Chi phí (Landed Cost)** | FE-05 Mua hàng & Nhập kho (PO/GRN) | Quản lý / Kế toán | Đặng Đỗ Minh Đức | Nguyễn Trường An | [`19_UI-05-07_Xac_nhan_GRN_va_Phan_bo_Chi_phi.xlsx`](file:///./screens/19_UI-05-07_Xac_nhan_GRN_va_Phan_bo_Chi_phi.xlsx) |
| 20 | `UI-09-01` | **Danh mục Nhà cung cấp** | FE-09 Quản lý Nhà cung cấp & Công nợ | Mua hàng / Kế toán | Đặng Đỗ Minh Đức | Nguyễn Bá Sơn | [`20_UI-09-01_Danh_muc_Nha_cung_cap.xlsx`](file:///./screens/20_UI-09-01_Danh_muc_Nha_cung_cap.xlsx) |
| 21 | `UI-09-02` | **Tạo / Sửa Hồ sơ NCC** | FE-09 Quản lý Nhà cung cấp & Công nợ | Nhân viên Mua hàng | Đặng Đỗ Minh Đức | Nguyễn Trường An | [`21_UI-09-02_Tao_Sua_Ho_so_NCC.xlsx`](file:///./screens/21_UI-09-02_Tao_Sua_Ho_so_NCC.xlsx) |
| 22 | `UI-09-03` | **Tổng quan Hồ sơ NCC & Hạn mức nợ** | FE-09 Quản lý Nhà cung cấp & Công nợ | Chủ cửa hàng | Đặng Đỗ Minh Đức | Nguyễn Minh Tâm | [`22_UI-09-03_Tong_quan_Ho_so_NCC_va_Han_muc_no.xlsx`](file:///./screens/22_UI-09-03_Tong_quan_Ho_so_NCC_va_Han_muc_no.xlsx) |
| 23 | `UI-09-04` | **Danh mục Sản phẩm cung ứng & Bảng giá** | FE-09 Quản lý Nhà cung cấp & Công nợ | Mua hàng / NCC | Đặng Đỗ Minh Đức | Nguyễn Long Nhật | [`23_UI-09-04_Danh_muc_San_pham_cung_ung_va_Bang_gia.xlsx`](file:///./screens/23_UI-09-04_Danh_muc_San_pham_cung_ung_va_Bang_gia.xlsx) |
| 24 | `UI-09-05` | **Lịch giao hàng & Lead time NCC** | FE-09 Quản lý Nhà cung cấp & Công nợ | Kho / Mua hàng | Đặng Đỗ Minh Đức | Nguyễn Bá Sơn | [`24_UI-09-05_Lich_giao_hang_va_Lead_time_NCC.xlsx`](file:///./screens/24_UI-09-05_Lich_giao_hang_va_Lead_time_NCC.xlsx) |
| 25 | `UI-09-06` | **Lịch sử & Chi tiết Đơn mua NCC** | FE-09 Quản lý Nhà cung cấp & Công nợ | Kế toán / NCC | Đặng Đỗ Minh Đức | Nguyễn Trường An | [`25_UI-09-06_Lich_su_va_Chi_tiet_Don_mua_NCC.xlsx`](file:///./screens/25_UI-09-06_Lich_su_va_Chi_tiet_Don_mua_NCC.xlsx) |
| 26 | `UI-09-07` | **Báo cáo Tuổi nợ Công nợ AP NCC (Aging Report)** | FE-09 Quản lý Nhà cung cấp & Công nợ | Chủ cửa hàng / Kế toán | Đặng Đỗ Minh Đức | Nguyễn Trường An | [`26_UI-09-07_Bao_cao_Tuoi_no_Cong_no_AP_NCC.xlsx`](file:///./screens/26_UI-09-07_Bao_cao_Tuoi_no_Cong_no_AP_NCC.xlsx) |
| 27 | `UI-03-01` | **Bán hàng POS Checkout & Quét mã vạch** | FE-03 Bán hàng POS & Hóa đơn | Thu ngân | Nguyễn Bá Sơn | Nguyễn Minh Tâm | [`27_UI-03-01_Ban_hang_POS_Checkout_va_Quet_ma.xlsx`](file:///./screens/27_UI-03-01_Ban_hang_POS_Checkout_va_Quet_ma.xlsx) |
| 28 | `UI-03-02` | **Quản lý Ca làm & Chốt két Z-Report** | FE-03 Bán hàng POS & Hóa đơn | Thu ngân / Quản lý | Nguyễn Bá Sơn | Nguyễn Trường An | [`28_UI-03-02_Quan_ly_Ca_lam_va_Chot_ket_Z_Report.xlsx`](file:///./screens/28_UI-03-02_Quan_ly_Ca_lam_va_Chot_ket_Z_Report.xlsx) |
| 29 | `UI-03-03` | **Tra cứu tồn kho & Giá tại quầy POS** | FE-03 Bán hàng POS & Hóa đơn | Thu ngân | Nguyễn Bá Sơn | Đặng Đỗ Minh Đức | [`29_UI-03-03_Tra_cuu_ton_kho_va_Gia_tai_quay_POS.xlsx`](file:///./screens/29_UI-03-03_Tra_cuu_ton_kho_va_Gia_tai_quay_POS.xlsx) |
| 30 | `UI-03-04` | **Quản lý Hóa đơn & Đổi trả hàng** | FE-03 Bán hàng POS & Hóa đơn | Thu ngân / Quản lý | Nguyễn Bá Sơn | Nguyễn Long Nhật | [`30_UI-03-04_Quan_ly_Hoa_don_va_Doi_tra_hang.xlsx`](file:///./screens/30_UI-03-04_Quan_ly_Hoa_don_va_Doi_tra_hang.xlsx) |
| 31 | `UI-16-01` | **Khuyến mãi, Voucher & Tích điểm thành viên** | FE-16 Khuyến mãi & Loyalty | Marketing / Thu ngân | Nguyễn Bá Sơn | Nguyễn Minh Tâm | [`31_UI-16-01_Khuyen_mai_Voucher_va_Tich_diem.xlsx`](file:///./screens/31_UI-16-01_Khuyen_mai_Voucher_va_Tich_diem.xlsx) |
| 32 | `UI-08-01` | **Quản lý Khách hàng CRM & Hạn mức nợ (AR)** | FE-08 Quản lý Khách hàng & Sổ nợ AR | Thu ngân / Quản lý | Nguyễn Trường An | Nguyễn Bá Sơn | [`32_UI-08-01_Quan_ly_Khach_hang_CRM_va_Han_muc_no.xlsx`](file:///./screens/32_UI-08-01_Quan_ly_Khach_hang_CRM_va_Han_muc_no.xlsx) |
| 33 | `UI-07-01` | **Chi phí Vận hành & Dịch vụ ngoài** | FE-07 Chi phí & Chi mua ngoài | Kế toán / Quản lý | Nguyễn Trường An | Đặng Đỗ Minh Đức | [`33_UI-07-01_Chi_phi_Van_hanh_va_Dich_vu_ngoai.xlsx`](file:///./screens/33_UI-07-01_Chi_phi_Van_hanh_va_Dich_vu_ngoai.xlsx) |
| 34 | `UI-17-01` | **Sổ quỹ Tiền mặt & Ngân hàng VietQR** | FE-17 Quản lý Sổ quỹ & Dòng tiền | Kế toán / Chủ CH | Nguyễn Trường An | Nguyễn Bá Sơn | [`34_UI-17-01_So_quy_Tien_mat_va_Ngan_hang_VietQR.xlsx`](file:///./screens/34_UI-17-01_So_quy_Tien_mat_va_Ngan_hang_VietQR.xlsx) |
| 35 | `UI-19-01` | **Kê khai Thuế TT 152 & 7 Sổ kế toán** | FE-19 Thuế Hộ kinh doanh TT 152 | Kế toán / Chủ CH | Nguyễn Trường An | Nguyễn Long Nhật | [`35_UI-19-01_Ke_khai_Thue_TT152_va_7_So_ke_toan.xlsx`](file:///./screens/35_UI-19-01_Ke_khai_Thue_TT152_va_7_So_ke_toan.xlsx) |
| 36 | `UI-10-01` | **Báo cáo Lợi nhuận P&L & Doanh thu** | FE-10 Báo cáo Tài chính & P&L | Chủ cửa hàng | Nguyễn Trường An | Nguyễn Minh Tâm | [`36_UI-10-01_Bao_cao_Loi_nhuan_PL_va_Doanh_thu.xlsx`](file:///./screens/36_UI-10-01_Bao_cao_Loi_nhuan_PL_va_Doanh_thu.xlsx) |
| 37 | `UI-01-01` | **Danh mục Hàng hóa & Bảng giá bán lẻ** | FE-01 Quản lý Hàng hóa & Danh mục | Quản lý / Nhân viên | Nguyễn Minh Tâm | Đặng Đỗ Minh Đức | [`37_UI-01-01_Danh_muc_Hang_hoa_va_Bang_gia_ban_le.xlsx`](file:///./screens/37_UI-01-01_Danh_muc_Hang_hoa_va_Bang_gia_ban_le.xlsx) |
| 38 | `UI-15-01` | **Điều chuyển hàng liên chi nhánh (Transfer)** | FE-15 Điều chuyển hàng nội bộ | NV Kho / Quản lý | Nguyễn Minh Tâm | Nguyễn Bá Sơn | [`38_UI-15-01_Dieu_chuyen_hang_lien_chi_nhanh.xlsx`](file:///./screens/38_UI-15-01_Dieu_chuyen_hang_lien_chi_nhanh.xlsx) |
| 39 | `UI-18-01` | **Quản lý Nhân sự, Ca làm & Bảng lương** | FE-18 Quản lý Nhân sự & Tiền lương | Quản lý / Chủ CH | Nguyễn Minh Tâm | Nguyễn Trường An | [`39_UI-18-01_Quan_ly_Nhan_su_Ca_lam_va_Bang_luong.xlsx`](file:///./screens/39_UI-18-01_Quan_ly_Nhan_su_Ca_lam_va_Bang_luong.xlsx) |
| 40 | `UI-21-01` | **Quản trị Hệ thống SaaS Multi-tenant** | FE-21 Nền tảng SaaS Đa chi nhánh | Master Admin | Nguyễn Long Nhật | Nguyễn Minh Tâm | [`40_UI-21-01_Quan_tri_He_thong_SaaS_Multi_tenant.xlsx`](file:///./screens/40_UI-21-01_Quan_tri_He_thong_SaaS_Multi_tenant.xlsx) |

---

## 🎯 Quy chuẩn 5 Tầng Test trong mỗi File Màn hình

Mỗi file trong thư mục `screens/` được thiết kế theo đúng quy chuẩn đề cương FPT SEP490 với 7 Sheet hoàn chỉnh:
1. **Cover Sheet**: Bìa tài liệu chuẩn mã hiệu `UI-XX-YY_TEST_v1.0`, Project Code, Người lập, Người duyệt, Bảng lịch sử thay đổi.
2. **Test Statistics**: Bảng thống kê công thức tự động tính Pass/Fail/Untested, Tỷ lệ phủ (Coverage %) và Tỷ lệ đạt (Pass Rate %).
3. **5.1 - Unit Test**: Kiểm thử đơn vị các hàm tính toán, validator, state UI (Normal, Abnormal, Boundary) kèm bảng đếm loại test.
4. **5.2 - Integration Test**: Kiểm thử tích hợp kết nối API Backend, CSDL PostgreSQL, đồng bộ Redis và liên thông phân hệ.
5. **5.3 - System Test FRs**: Kiểm thử kịch bản chức năng end-to-end trên giao diện (Navigation, Form submit, Bộ lọc debounce).
6. **5.4 - Security & NFRs**: Kiểm thử phân quyền RBAC chống xem trộm dữ liệu, chống SQLi/XSS và đo đạc thời gian tải trang < 2s.
7. **5.5 - Acceptance Test**: Kịch bản nghiệm thu UAT ngôn ngữ nghiệp vụ cửa hàng và nhật ký kiểm thử khám phá (Exploratory).