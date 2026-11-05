# Skeptic Review: shift-config-crud

| Chiều | Điểm (1–5) | Nhận xét |
|---|:---:|---|
| **D1 Completeness** | 4.5/5 | 4 Requirements đầy đủ kịch bản Gherkin cho cả Happy path và Edge case (ca qua đêm, trùng mã, thiếu param). |
| **D2 Correctness** | 5/5 | Logic tính thời lượng `DurationHours` cho ca thường và ca qua đêm chuẩn xác. Khung giờ check-in mặc định (-30m / +60m) thực tế. |
| **D3 Coherence** | 5/5 | Hoàn toàn đồng nhất giữa `proposal.md`, `exploration.md`, `design-brief.md`, `specs.md` và entity `ShiftConfig.cs`. |
| **D4 Constraints** | 5/5 | Đảm bảo cô lập đa tenant (`TenantId`), phân quyền chặt chẽ (`Store Owner`, `Store Manager`), chuẩn hóa REST API. |
| **D5 Blast Radius** | 5/5 | Phạm vi biệt lập trong Master Data ca làm việc, không phá vỡ cấu trúc của các bảng hiện có, không có breaking change. |

## Vấn đề
- [MEDIUM] **REQ-SHF-04 (Ràng buộc khi xóa ca):** Khi gửi yêu cầu `DELETE /api/v1/hr/shift-configs/{id}`, nếu ca này đang có lịch làm việc chưa diễn ra trong tương lai (`EmployeeSchedules` với `WorkDate >= Today`), việc xóa ca có thể gây thắc mắc cho nhân viên khi xem lịch.  
  $\rightarrow$ **Đề xuất xử lý:** Trong `ShiftConfigService.DeleteShiftConfigAsync`, kiểm tra nếu ca đang có lịch trong tương lai thì trả về cảnh báo đề xuất người dùng chuyển sang tắt kích hoạt (`IsActive = false`) thay vì xóa, hoặc chỉ cho phép xóa khi không còn lịch tương lai. Đã bổ sung vào quy tắc xử lý của Service.
- [LOW] **Định dạng ShiftCode:** Cần thêm validation chuẩn hóa mã ca: tự động chuyển sang chữ hoa (Trim + ToUpper), chỉ chấp nhận ký tự chữ, số và gạch dưới `^[A-Za-z0-9_]{2,20}$` để tránh lỗi URL encoding khi tra cứu.

## Kết luận: Chấp nhận
Không có vấn đề mức **HIGH**. Các vấn đề Medium và Low đã có giải pháp cụ thể đưa vào danh sách task thực thi.
