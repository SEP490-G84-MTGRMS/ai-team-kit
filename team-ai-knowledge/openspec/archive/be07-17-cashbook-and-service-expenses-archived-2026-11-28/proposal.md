# Đề Xuất Tính Năng (Feature Proposal)
## Backend Phân Hệ Sổ Quỹ (FE-17) & Chi Phí Vận Hành (FE-07)

### 1. Vấn Đề (Problem Statement)
Hệ thống quản lý bán lẻ tạp hóa đa chi nhánh MT-GRMS hiện tại chưa có tầng Backend hoàn chỉnh để quản lý dòng tiền thực tế và chi phí vận hành. Các rủi ro nghiêm trọng đang hiện hữu:
- Nguy cơ âm két tiền mặt tại quầy do thiếu cơ chế khóa đồng thời (Race Condition).
- Thất thoát tiền lẻ đầu ca và lệch két khi chốt ca thu ngân do thiếu quy trình kiểm kê Z-Report chuẩn mực.
- Gian lận nội bộ: Nhân viên cố tình chia nhỏ hóa đơn chi phí để né ngưỡng phê duyệt của chủ chuỗi.
- Rủi ro mất mát tiền mặt khi nhân viên mang tiền két ra cây ATM hoặc ngân hàng nộp vào tài khoản chuỗi mà không có cơ chế đối soát 2 bước.

### 2. Mục Tiêu (Objectives)
Hiện thực hóa toàn bộ nghiệp vụ Backend cho `FE-17` (Sổ quỹ & Dòng tiền) và `FE-07` (Chi phí vận hành) theo đúng **Bản Đặc Tả v3.0** (`nguyen_truong_an_financial_business_rules_v3.md`), bảo đảm:
- Số dư tiền mặt không bao giờ bị âm ngoài đời thực.
- Mọi biến động tiền đều được lưu trữ dạng Sổ cái bất biến (Append-Only Ledger), có lịch sử kiểm toán đầy đủ.
- Phân định rõ ràng trách nhiệm tiền mặt: Két quầy $\rightarrow$ Két sắt (Cash drop) $\rightarrow$ Tiền đang chuyển (CashInTransit) $\rightarrow$ Ngân hàng.
- Quy trình chi phí 5 bước tách khâu duyệt khỏi khâu chi, tích hợp động cơ phát hiện tách bill tự động.

### 3. Phạm Vi Triển Khai (Scope)
- **In Scope:**
  - **Quản lý Tài khoản Quỹ:** Két tiền mặt tại quầy (`BranchCashTill`), Két sắt chi nhánh (`BranchSafe`), Tiền đang chuyển (`CashInTransit`), Tài khoản ngân hàng (`TenantBankAccount`).
  - **Nghiệp vụ Ca Thu Ngân & Chốt Ca (Z-Report):** Mở ca kế thừa `RetainedFloat` từ ca trước; tính toán chênh lệch két; hạch toán tiền thừa/thiếu qua tài khoản treo chờ xử lý (`CashDiscrepancySuspense`); cash drop 2 chữ ký.
  - **Quy trình Nộp Tiền Ngân Hàng 2 Bước:** Lệnh nộp tiền có định danh người cầm tiền (`CarrierUserId`); chuyển trạng thái trung gian `CashInTransit`; xác nhận nộp tiền tự động/thủ công; cảnh báo trễ sau 120 phút.
  - **Quy trình Chi Phí Vận Hành (FE-07):** Vòng đời 5 bước (`DRAFT -> PENDING_APPROVAL -> APPROVED -> PAID / PAYMENT_FAILED -> REVERSED`); phân cấp duyệt chi T1 (500k), T2 (3tr); hạn mức ca ($C1 = 1.5tr$), hạn mức ngày ($C2 = 3tr$); động cơ Anti-Splitting.
  - **Hạch toán Kế toán Một Sổ Hai Góc Nhìn:** Cờ `IsTaxDeductible` cho chi phí được trừ khi tính thuế thu nhập.
  - **Hạ tầng Kỹ thuật:** Bảng sổ cái bất biến `CashbookEntries`, Idempotency Key 24h, Khóa bi quan `UPDLOCK, ROWLOCK`, chuỗi băm kiểm toán HMAC-SHA256, Bộ kiểm thử xUnit $\ge 85\%$ coverage.
- **Out of Scope (Dành cho các Phase tiếp theo):**
  - Quản lý Công nợ khách hàng AR `FE-08` (Phase 2).
  - Báo cáo Lợi nhuận P&L `FE-10` (Phase 3).
  - Thuế Hộ kinh doanh & Sổ kế toán TT 152/2025 `FE-19` (Phase 4).
  - Giao diện UI Frontend (ghép nối sau khi Backend hoàn tất).

### 4. Người Dùng & Vai Trò (Users & Roles)
- **Thu ngân (Cashier):** Mở/chốt ca két của mình, chi tự duyệt $\le T1$ (trong hạn mức ca), bàn giao cash drop sang két sắt.
- **Quản lý chi nhánh (Branch Manager):** Quản lý két sắt, duyệt chi $T1 < x \le T2$, xác nhận cash drop, tạo lệnh nộp tiền ngân hàng.
- **Chủ chuỗi (Store Owner):** Toàn quyền trong tenant, duyệt chi $> T2$, duyệt chi từ tài khoản ngân hàng, xác nhận tiền vào ngân hàng (Bước 2), xử lý chênh lệch két thừa/thiếu.

### 5. Tiêu Chí Thành Công (Success Criteria)
1. 100% các Invariants ([INV-01] đến [INV-05]) được thực thi nghiêm ngặt trong mã nguồn.
2. Bộ kiểm thử Unit Tests (xUnit + Moq) bao phủ tối thiểu 25 test cases cốt lõi của `FE-17` và `FE-07`, độ phủ Code Coverage đạt $\ge 85\%$.
3. API Controllers đáp ứng chuẩn `ApiResponse<T>`, có xử lý Idempotency-Key và cô lập dữ liệu Multi-Tenant tuyệt đối.
