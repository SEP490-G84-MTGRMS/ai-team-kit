# Đánh Giá Phản Biện Chuyên Sâu (Skeptic Review)
## Change: be08-customer-debt-management — Phân Hệ Công Nợ Khách Hàng (FE-08)

### 1. Phân Tích 5 Tiêu Chí Độc Lập

#### Tiêu chí 1: Tính Khả Thi Kỹ Thuật (Technical Feasibility) — Đạt 5/5 ⭐
- Mô hình EF Core Code-First với 3 thực thể (`CustomerDebtProfile`, `CustomerDebtInvoice`, `CustomerDebtEntry`) cùng bảng phân bổ `CustomerDebtAllocation` hoàn toàn tương thích với kiến trúc Clean Architecture và cơ sở dữ liệu SQL Server hiện có của MT-GRMS.
- Thuật toán phân bổ FIFO được thực hiện thuần túy bằng LINQ và C# trong cùng một DbTransaction có khóa bi quan `UPDLOCK, ROWLOCK`, không cần đến Stored Procedure phức tạp, dễ bảo trì và kiểm thử tự động.

#### Tiêu chí 2: Tính Đơn Giản & Tối Giản Mã Nguồn (Simplicity & Minimalism) — Đạt 5/5 ⭐
- Tránh việc over-engineering hệ thống tài khoản kế toán kép phức tạp (nợ Có/nợ Nợ của doanh nghiệp lớn). Thiết kế tập trung đúng bản chất bán lẻ: "Hóa đơn nợ $\rightarrow$ Trả tiền cấn trừ hóa đơn cũ nhất $\rightarrow$ Trả hàng cấn trừ nợ trước khi chi tiền".
- Tận dụng lại `CashbookService` đã xây dựng ở Phase 1 để đồng bộ dòng tiền mà không cần viết lại logic sổ quỹ.

#### Tiêu chí 3: Nhận Diện Rủi Ro & Góc Khuất Thực Tế (Edge Cases & Risk Mitigation) — Đạt 5/5 ⭐
- **Góc khuất 1: Khách trả nhiều hơn tổng số nợ hiện có.**
  - Giải pháp: Khoản tiền dư không bị mất hay gây âm nợ, mà tự động ghi nhận vào `PrepaymentBalance` (khách gửi tiền trước) và hiển thị rõ ràng trên sổ cái.
- **Góc khuất 2: Trả hàng của đơn mua chịu nhưng giá trị trả hàng lớn hơn nợ đơn đó.**
  - Giải pháp: Thuật toán cấn trừ nợ hai tầng: trừ dứt điểm nợ của đơn đó, phần dư tiếp tục cấn trừ các đơn nợ khác theo FIFO. Tuyệt đối không cho phép chi tiền mặt ngoài két nếu khách còn bất kỳ hóa đơn nợ nào.
- **Góc khuất 3: Gian lận xóa nợ hoặc điều chỉnh nợ sai lệch.**
  - Giải pháp: `DebtAdjustment` và `BadDebtWriteOff` là các loại bút toán đặc biệt, chỉ có Cửa hàng trưởng hoặc Chủ cửa hàng mới có quyền thực thi kèm lý do bắt buộc và lưu vết `CreatedByUserId`.

#### Tiêu chí 4: Kiến Trúc Sạch & Cô Lập Dữ Liệu Đa Chi Nhánh (Clean Architecture & Multi-Tenancy) — Đạt 5/5 ⭐
- Toàn bộ các Entities đều kế thừa `BaseTenantEntity`, tự động hưởng lợi từ Global Query Filter ngăn chặn triệt để rò rỉ dữ liệu giữa các cửa hàng/tenant khác nhau.
- Các quy tắc nghiệp vụ nằm trọn vẹn trong tầng `MT_GRMS.Application`, tách rời hoàn toàn khỏi hạ tầng lưu trữ.

#### Tiêu chí 5: Tính Kiểm Chứng Được (Testability) — Đạt 5/5 ⭐
- Các kịch bản nghiệp vụ (bán chịu, trả nợ từng phần, trả nợ dứt điểm, trả hàng cấn trừ nợ, chặn bán chịu khi quá hạn/vượt mức) đều có thể được kiểm chứng bằng Unit Tests (dùng Fake In-Memory Repositories) và Integration Tests với EF Core InMemory DbContext.

---

### 2. Kết Luận & Khuyến Nghị
- **Đánh giá chung:** Đạt điểm tuyệt đối **5/5**.
- **Khuyến nghị triển khai:** Chia nhỏ `tasks.md` thành 4 Phase rõ ràng:
  - Phase 1: Domain Entities & Database Schema (T1–T6).
  - Phase 2: Application Services & FIFO Engine (T7–T12).
  - Phase 3: API Endpoints & Credit Interceptor (T13–T16).
  - Phase 4: Unit Testing & Integration Verification (T17–T20).
