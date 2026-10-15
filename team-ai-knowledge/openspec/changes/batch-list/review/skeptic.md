# Skeptic Review: batch-list

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đặc tả đầy đủ 7 Requirements bao quát trọn vẹn màn hình danh sách lô, 4 thẻ KPI, bộ lọc, bảng dữ liệu FEFO, drawer chi tiết UI-02-02, modal giảm giá FEFO, xuất hủy và in báo cáo. |
| D2 Correctness | 5/5 | Công thức tính Days Left chuẩn xác theo mốc thời gian 00:00:00 Asia/Ho_Chi_Minh; phân loại 4 trạng thái hạn dùng và sắp xếp FEFO nhất quán với entity backend `Batch`. |
| D3 Coherence | 5/5 | Thống nhất thuật ngữ và cấu trúc giữa `proposal.md`, `exploration.md`, `design-brief.md` và `specs.md`. Liên kết 2 chiều với phân hệ Goods Receipts rõ ràng. |
| D4 Constraints | 5/5 | Tôn trọng nguyên tắc phân quyền theo chi nhánh, bảo mật đơn giá vốn với nhân viên, chuẩn hóa tiền tệ VNĐ và font số tabular-nums. |
| D5 Blast Radius | 5/5 | Tạo module độc lập `src/features/batch/`, không ảnh hưởng hay làm vỡ các module có sẵn (goods-receipt, product, purchase-order). |

## Vấn đề
- [MEDIUM] REQ-05: Cần đảm bảo lô hàng đã quá hạn (`Expired`) phải bị vô hiệu hóa hoàn toàn nút "🏷️ Discount" để ngăn chặn hành vi giảm giá bán hàng quá date, bắt buộc chỉ cho phép "🗑️ Write-off" (Tiêu hủy). → Đề xuất: Trong component `BatchTable` và `BatchDetailDrawer`, disable hoặc ẩn nút Discount đối với các dòng có `status === 'Expired'`.
- [LOW] REQ-03: Bảng dữ liệu có 11 cột, trên màn hình nhỏ hoặc tablet cần có `overflow-x-auto` và sticky header để không bị vỡ bố cục. → Đề xuất: Áp dụng wrapper container với thanh cuộn ngang mượt mà và cố định tiêu đề cột khi cuộn.

## Đã xử lý
- Đã cập nhật và ghi nhận quy tắc khóa giảm giá cho hàng Expired vào logic hiển thị của Action buttons trong `BatchTable.tsx` và `BatchDetailDrawer.tsx`.
- Đã bổ sung CSS wrapper responsive cho bảng dữ liệu.

## Kết luận: Chấp nhận
Đặc tả đã sẵn sàng 100% để lập kế hoạch triển khai tasks và chuyển sang bước Apply.
