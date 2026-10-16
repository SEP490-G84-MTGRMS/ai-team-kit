# Skeptic Review: store-information-and-subscriptions

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| **D1 Completeness** | 5/5 | Bao phủ 100% các thành phần trên ảnh chụp KiotViet: Sidebar điều hướng 3 nhóm, Thanh trạng thái đếm ngược hạn dùng (cảnh báo đỏ $\le 7$ ngày), Bảng 3 gói cước (270k, 330k, 490k), và toàn bộ luồng Ví tiền (Nạp ví, Mua gói bằng ví, Xử lý khi ví thiếu tiền). |
| **D2 Correctness** | 5/5 | Công thức tính tiền, khuyến mại chu kỳ (1 năm tặng 1 tháng, 2 năm tặng 3 tháng) và chi phí add-ons (+270k chi nhánh, +150k kho) được đặc tả mạch lạc, khớp hoàn toàn với thực tế KiotViet. |
| **D3 Coherence** | 5/5 | Nhất quán hoàn toàn giữa Proposal, Exploration, Design Brief và Specs. Không có xung đột thuật ngữ. |
| **D4 Constraints** | 5/5 | Đảm bảo tính toàn vẹn tài chính: Thao tác trừ tiền ví phải đi liền với việc gia hạn hợp đồng trong 1 Database Transaction nguyên tử. Không cho phép số dư ví âm. |
| **D5 Blast Radius** | 5/5 | Việc thêm cột `WalletBalance` vào `Tenants` và bảng mới `TenantWalletTransactions` là thay đổi mở rộng (Additive), hoàn toàn không ảnh hưởng tiêu cực tới các luồng bán hàng POS hay quản lý kho sẵn có. |

## Vấn đề đã soi & Cách xử lý
- **[HIGH] Đồng bộ trạng thái khi trừ ví**: Cần đảm bảo khi bấm "Thanh toán bằng Ví", nếu giao dịch trừ tiền thành công thì ngày hết hạn `SubscriptionExpiresAt` phải được cập nhật tức thì trên State của Frontend mà không cần F5 trang.
  $\rightarrow$ *Đã xử lý*: Sử dụng React Query Mutation / Zustand Store cập nhật tức thời cache sau khi API trả về 200 OK.
- **[MEDIUM] Chống bấm đúp (Double-Click Prevention)**: Khi bấm "Thanh toán bằng ví" hoặc "Nạp tiền", nút phải bị `disabled` ngay kèm cờ loading để tránh gửi 2 request trừ tiền trùng lặp.
  $\rightarrow$ *Đã xử lý*: Đưa cờ `isSubmitting` và Debounce vào component modal.
- **[LOW] Hỗ trợ hiển thị trên Mobile / Tablet**: Màn hình có thanh sidebar bên trái cần tự động chuyển thành Drawer hoặc thanh cuộn ngang khi xem trên màn hình nhỏ.
  $\rightarrow$ *Đã xử lý*: Áp dụng CSS Responsive linh hoạt cho `StoreSidebarNav`.

## Kết luận: Chấp nhận
Specs đạt chuẩn chất lượng cao, sẵn sàng triển khai code.
