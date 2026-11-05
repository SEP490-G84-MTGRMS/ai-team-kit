---
name: sep-test
description: Bước 5/6 quy trình SEP — verify change - viết và chạy test theo các Scenario trong specs.md của một OpenSpec change, lập test-report.md (verdict PASS/FAIL) qua MCP server "sep". Dùng khi user gõ /sep-test (kèm tên change hoặc dùng change đang làm).
disable-model-invocation: true
---

# /sep-test — Bước 5/6: Verify change bằng test

Quy trình SEP: spec → brainstorm → verify-spec → apply → **test** → archive.
Tên change = phần chữ user gõ sau `/sep-test`; bỏ trống = change đang làm (📌).

## Luật chung SEP
- Chỉ ghi file trong `openspec/changes/` bằng tool MCP `sep_*` — không tạo/sửa tay.
- Không bỏ qua bước. Tool trả lỗi ⛔ → dừng, báo user lệnh cần chạy trước (hoặc bước chưa được duyệt).
- **Gate duyệt**: cuối bước, tóm tắt và hỏi user **Approve / Reject**. Chỉ gọi `sep_duyet_buoc` sau khi user trả lời.
- Không thấy tool `sep_*` → bảo user chạy `npm run sep -- install` rồi khởi động lại IDE.
- Trả lời tiếng Việt; thuật ngữ kỹ thuật giữ tiếng Anh.

## Chọn change
- Gọi `sep_xem_change`. Apply chưa xong (còn task chưa tick) hoặc chưa duyệt → dừng, bảo user hoàn tất `/sep-apply`.

## Các bước
1. Đọc `specs.md` — liệt kê mọi REQ và Scenario (GIVEN/WHEN/THEN).
2. Với mỗi Scenario: tìm test đã có hoặc viết test mới theo framework sẵn có của repo
   (backend: xUnit `SGMS.UnitTests` / `SGMS.IntegrationTests`; frontend: framework đang dùng). Không có framework → hỏi user trước khi thêm.
3. Chạy test + build/lint (VD `dotnet test`, `npm run lint`, `npm run build`). Ghi lại lệnh và kết quả thật — **không bịa kết quả**.
   Scenario không tự động hoá được → hướng dẫn user test tay và hỏi kết quả.
4. Kiểm tra đối chiếu (verify change): code có làm đủ mọi REQ? có thay đổi ngoài phạm vi specs? review HIGH đã xử lý hết?
5. Lưu **test-report.md** bằng `sep_luu_artifact`. Frontmatter `verdict` là bắt buộc.
   Để đồng bộ chính xác và lấp đầy 100% thông tin lên 5 file Google Sheets kiểm thử (Report 5.1 -> 5.5) và Master Test Matrix trực tuyến, bảng kịch bản phải tuân theo cấu trúc **Unified Test Table** chuẩn mở rộng đầy đủ các trường nghiệp vụ sau:

```markdown
---
verdict: PASS
tested_at: 2026-11-05
tester: '@username'
---
# Test Report: <tên change>

| Mã Test Case | Tên kịch bản | Tiêu chí (Cô) | Loại Test | Mức ưu tiên | Pre-conditions (GIVEN) | Procedure / Steps (WHEN) | Dữ liệu test (Test Data) | Expected Results (THEN) | Người viết | Người chạy | Report Type | Kết quả | Ghi chú |
|---|---|---|---|:---:|---|---|---|---|---|---|:---:|:---:|---|
| TC-UT-FE01-01 | REQ-01: Kiểm tra tính hợp lệ của SĐT | Số liệu / Công thức | Happy | P1 | Môi trường test sẵn sàng | Gọi validatePhone(phone) | SĐT "0912345678" | Hàm trả về true và không sinh lỗi | Nguyễn Bá Sơn | Đặng Đỗ Minh Đức | 5.1 | PASS | Unit test Vitest |
| TC-IT-FE01-01 | REQ-02: Đồng bộ giao dịch với Sổ quỹ | Luồng nghiệp vụ | Happy | P1 | Đã đăng nhập Cashier, sổ quỹ mở | Lập phiếu thu nợ và submit | Số tiền 500.000đ, nguồn Till | Giao dịch lưu vào DB và cập nhật số dư | Nguyễn Bá Sơn | Nguyễn Trường An | 5.2 | PASS | API integration |
| TC-SYS-FE01-01 | REQ-03: Tìm kiếm và lọc danh sách | Giao diện (UI) | Happy | P2 | Dữ liệu khởi tạo có 50 bản ghi | Nhập từ khóa tìm kiếm và chọn bộ lọc VIP | Từ khóa "Vip", tab "Tất cả" | Bảng dữ liệu lọc chính xác trong < 300ms | Nguyễn Bá Sơn | Nguyễn Minh Tâm | 5.3 | PASS | UI/UX E2E |
| TC-SEC-FE01-01 | REQ-04: Chặn sửa hạn mức nợ trái phép | Security | Security | P0 | Đang đăng nhập với vai trò Cashier | Cố tình gọi API cập nhật hạn mức nợ DebtLimit | DebtLimit = 50.000.000đ | Hệ thống trả về HTTP 403 Forbidden | Nguyễn Bá Sơn | Nguyễn Long Nhật | 5.4 | PASS | RBAC security |
| TC-E2E-FE01-01 | REQ-05: Nghiệm thu quy trình thu nợ VietQR | Luồng nghiệp vụ | Edge | P1 | Khách hàng có khoản nợ 500k | Tạo phiếu thu nợ và quét mã VietQR Napas 247 | VietQR 500.000đ, STK Vietcombank | Giao dịch ghi nhận thành công, giảm trừ nợ | Nguyễn Bá Sơn | Toàn bộ nhóm | 5.5 | PASS | UAT acceptance |

## Lệnh đã chạy
- `npm test`: PASS (x/x tests passed)
- `npm run build`: PASS
- `npm run lint`: PASS

## Đối chiếu specs ↔ code
## Lỗi còn tồn đọng
```

### Quy tắc bắt buộc khi viết kịch bản test:
1. **3 Tiêu chí của Cô + Security:** Phải phân loại rõ trong cột `Tiêu chí (Cô)`:
   - `Số liệu / Công thức`: Kiểm tra tính toán tiền, nợ, thuế, tỷ lệ chiết khấu, số dư quỹ.
   - `Luồng nghiệp vụ`: Kiểm tra vòng đời chứng từ, chuyển trạng thái, khóa sổ, đối soát.
   - `Giao diện (UI)`: Kiểm tra tương tác form, modal, phím tắt, thông báo toast, phân trang.
   - `Security`: Kiểm tra phân quyền RBAC, Hash Chain `AuditHash`, chống gửi trùng `Idempotency`.
2. **Nguyên tắc Kiểm thử chéo (Cross-testing):**
   - Cột `Người viết (Author)`: Thành viên phụ trách phân hệ đó viết kịch bản.
   - Cột `Người chạy (Runner)`: BẮT BUỘC là thành viên khác trong nhóm (không tự test module mình code).
3. **Dữ liệu test (Test Data) cụ thể:** Phải có số liệu chính xác (ví dụ: `300.000đ`, `500.001đ`, `KH-001`, `VCB`), không ghi chung chung "nhập dữ liệu hợp lệ".
4. **Phân loại Report Type:**
   - `5.1`: Unit Test (tự động ở tầng code .NET / React).
   - `5.2`: Integration Test (kết nối API, CSDL, liên phân hệ).
   - `5.3`: System Test FRs (chức năng nghiệp vụ & giao diện người dùng).
   - `5.4`: System Test NFRs (bảo mật RBAC, hiệu năng tải trang).
   - `5.5`: Acceptance Test (kịch bản nghiệm thu quy trình kinh doanh trọn vẹn E2E).

   `verdict: PASS` chỉ khi **mọi** Scenario pass. Có cái fail → `verdict: FAIL`.
6. FAIL → báo lỗi, sửa code (quay lại `/sep-apply` nếu cần thêm task), chạy lại test và lưu lại test-report.md đến khi PASS.
7. **Đồng bộ Google Sheets (Tùy chọn)**:
   - Sau khi `test-report.md` đạt `verdict: PASS`, hỏi user:
     *"Bạn có muốn đồng bộ kết quả kiểm thử này lên Google Sheet không? Hãy chọn các report cần điền (VD: chỉ 5.1 & 5.3, hoặc cả 5 file, hoặc bỏ qua)."*
   - Nếu user chọn -> gọi tool `sep_dong_bo_test_sheet({ reportTypes: [...] })` để tự động cập nhật/upsert lên các file Google Sheets tương ứng.
8. **Gate** (chỉ khi PASS): tóm tắt số scenario pass, lệnh đã chạy, kết quả đồng bộ Sheet (nếu có); hỏi "Approve hay Reject?".
   Reject → xử lý, `sep_duyet_buoc` (`reject`, lý do), hỏi lại. Approve → `sep_duyet_buoc` (`buoc: "test"`, `approve`, `tomTat`, `caiTien`).

## Kết thúc
"Bước 5/6 xong. Chạy `/sep-archive` để đóng change."
