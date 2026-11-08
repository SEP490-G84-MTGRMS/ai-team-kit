# Skeptic Review: pos-cash-refund-and-preorder-rules

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đã bao phủ đầy đủ các khía cạnh: loại bỏ chuyển khoản/cấn nợ, chặn hoàn tiền khi két thiếu, phân loại Restock/Damaged, bắt buộc chọn lý do, phân luồng Đổi/Trả Đơn đặt trước theo 2 Tab. |
| D2 Correctness | 5/5 | Logic tài chính chuẩn xác: tiền hoàn khách trích từ két làm tăng chỉ số CashRefund (E), khớp 100% với công thức cân bằng két G = A + B + C - D - E. |
| D3 Coherence | 5/5 | Khớp hoàn toàn với proposal.md, exploration.md, design-brief.md và capability gốc pos-shift-management. |
| D4 Constraints | 5/5 | Tuân thủ nghiêm ngặt bảo mật Tenant, kiểm soát rủi ro thất thoát tiền mặt, không cho phép âm két. |
| D5 Blast Radius | 5/5 | Tác động khu biệt vào ReturnExchangeModal.tsx, InvoiceManagementPage.tsx và các DTO liên quan, không ảnh hưởng xấu đến luồng bán lẻ POS thông thường. |

## Vấn đề
- [MEDIUM] `REQ-POS-RETURN-UNIT-CONVERSION-04`: Làm rõ trường hợp Khách đổi sang sản phẩm đắt tiền hơn (Cửa hàng thu thêm tiền từ khách).
  → Đề xuất: Quy định rõ ràng trong UI/logic: Chỉ khi Cửa hàng HOÀN TIỀN cho khách thì mới bắt buộc 100% tiền mặt từ két. Ngược lại, nếu Khách phải TRẢ THÊM tiền chênh lệch khi đổi hàng có giá trị cao hơn, khách vẫn được tự do chọn thanh toán bằng Tiền mặt hoặc Chuyển khoản VietQR.
- [LOW] Tiện ích nạp két: Khi két không đủ tiền để hoàn trả, ngoài việc hiển thị cảnh báo đỏ và khóa nút xác nhận, nên cung cấp một nút bấm mở nhanh modal "Nạp tiền vào két" để thu ngân không phải tắt modal đổi trả đi làm thủ công.

## Kết luận: Chấp nhận
Spec đáp ứng đầy đủ tiêu chí chất lượng và sẵn sàng để lập task triển khai.
