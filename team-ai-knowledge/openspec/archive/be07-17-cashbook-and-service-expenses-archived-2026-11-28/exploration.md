# Báo Cáo Khảo Sát Kỹ Thuật (Exploration Report)
## Backend Sổ Quỹ (FE-17) & Chi Phí Vận Hành (FE-07)

### 1. Hiện Trạng Mã Nguồn (Codebase State)
- **Domain:** Đã có `CashbookTransaction.cs` nhưng chỉ là bản phác thảo sơ bộ (chưa có phân loại tài khoản quỹ, chưa có số dư sau giao dịch `BalanceAfter`, chưa có mã băm toàn vẹn `AuditHash`, chưa có liên kết bút toán đảo `ReversedEntryId`). Chưa có các entity: `BranchCashTill`, `BranchSafe`, `CashInTransit`, `ShiftZReport`, `ExpenseVoucher`.
- **Infrastructure:** `AppDbContext.cs` đã tích hợp sẵn cơ chế Multi-Tenancy qua `ITenantContext` và Global Query Filter trên `BaseTenantEntity`. Có `CashbookRepository.cs` mẫu nhưng chưa triển khai logic khóa bi quan.
- **Application:** `CashbookService.cs` đang là class rỗng. Chưa có thư mục và service cho `Expenses`.
- **API:** Chưa có `CashbookController.cs` và `ExpensesController.cs`.

### 2. Giả Định (Assumptions) & Không Thuộc Phạm Vi (Non-Goals)
- **Giả định:**
  - Mỗi chi nhánh vật lý có ít nhất 01 Két quầy (`BranchCashTill`) gắn với máy POS và 01 Két sắt chi nhánh (`BranchSafe`).
  - Đơn vị tiền tệ chuẩn là VND, làm tròn số nguyên đồng theo quy tắc nửa lên `MidpointRounding.AwayFromZero`.
  - Mọi thao tác đều nằm trong ngữ cảnh Tenant (`TenantId`).
- **Non-Goals:**
  - Chưa xử lý bán chịu/thu nợ khách hàng (dành cho Phase 2 - `FE-08`).
  - Chưa tính toán tổng hợp P&L dồn tích (dành cho Phase 3 - `FE-10`).
  - Chưa kết xuất trọn bộ sổ sách kế toán thuế TT 152/2025 (dành cho Phase 4 - `FE-19`).

### 3. Đánh Giá Các Phương Án Kỹ Thuật (Architectural Options)

#### Phương Án A (Truyền Thống / Sơ Sài): Cập nhật Số Dư Trực Tiếp & Khóa Lạc Quan
- **Mô tả:** Chỉ dùng 1 bảng `CashbookTransactions` ghi nhận thu chi. Cập nhật trực tiếp số dư trên Két quầy dùng `RowVersion` (Optimistic Concurrency). Duyệt chi phí xong là trừ tiền ngay lập tức.
- **Ưu điểm:** Cấu trúc đơn giản, ít bảng.
- **Nhược điểm nghiêm trọng:**
  - Tại quầy bán lẻ POS tần suất cao, khóa lạc quan sẽ ném ra lỗi `DbUpdateConcurrencyException` liên tục khi 2 thu ngân cùng thao tác, buộc client phải retry hoặc báo lỗi khó chịu cho thu ngân.
  - Không có tài khoản trung gian khi nhân viên mang tiền mặt đi nộp cây ATM $\rightarrow$ số dư ngân hàng tăng ảo hoặc mất tiền không rõ người chịu trách nhiệm.
  - Phê duyệt chi phí nhưng két lúc đó đã hết tiền mặt sẽ gây crash hoặc âm két.

#### Phương Án B (Đề Xuất - Gold Standard): Kiến Trúc Kế Toán 4 Tài Khoản & Khóa Bi Quan
- **Mô tả:**
  - Phân tách rõ 4 loại tài khoản quỹ: `BranchCashTill`, `BranchSafe`, `CashInTransit`, `TenantBankAccount`.
  - Khóa bi quan (`UPDLOCK, ROWLOCK`) trong Transaction khi đọc số dư két để xuất quỹ $\rightarrow$ Loại bỏ 100% rủi ro race condition làm âm két.
  - Vòng đời chi phí 5 bước tách khâu duyệt khỏi khâu xuất tiền (`DRAFT -> PENDING -> APPROVED -> PAID/FAILED -> REVERSED`).
  - Nối liền chuỗi luân chuyển tiền sau chốt ca qua Cash drop 2 chữ ký và CashInTransit 2 bước.
  - Thuật toán Anti-Splitting đa tầng chống chia nhỏ hóa đơn.
- **Ưu điểm:** Bịt kín 100% các lỗ hổng gian lận và thất thoát ngoài quầy thực tế; tuân thủ nghiêm ngặt Bản đặc tả v3.0.
- **Nhược điểm:** Đòi hỏi thiết kế nhiều entity và logic transaction chặt chẽ.

👉 **Lựa chọn:** **Phương Án B**.

### 4. Rủi Ro & Biện Pháp Giảm Thiểu (Risks & Mitigation)
1. **Rủi ro Deadlock khi chuyển tiền giữa 2 tài khoản:**
   - *Biện pháp:* Khi thực hiện chuyển quỹ nội bộ giữa 2 tài khoản, hệ thống luôn sắp xếp thứ tự khóa theo `AccountId` (Guid tăng dần) trước khi thực thi lệnh khóa `UPDLOCK`.
2. **Rủi ro mất mạng khi gửi Idempotency Key:**
   - *Biện pháp:* Bảng `IdempotencyRecords` lưu kết quả trong 24 giờ; nếu client retry với cùng key + payload thì trả về kết quả cũ ngay lập tức; nếu khác payload trả lỗi 409 Conflict.
