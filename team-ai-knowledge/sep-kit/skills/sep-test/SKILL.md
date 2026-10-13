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
   Để đồng bộ chính xác và lấp đầy 100% thông tin lên 5 file Google Sheets kiểm thử (Report 5.1 -> 5.5) mà **không bị cột nào là N/A**, bảng kịch bản phải tuân theo cấu trúc **Unified Test Table** chuẩn BDD 10 cột sau:

```markdown
---
verdict: PASS
tested_at: 2026-10-13
tester: '@username'
---
# Test Report: <tên change>

| Test Case ID | Tên kịch bản | Pre-conditions (GIVEN) | Procedure / Steps (WHEN) | Expected Results (THEN) | Role | Priority | Report Type | Kết quả | Ghi chú |
|---|---|---|---|---|:---:|:---:|:---:|:---:|---|
| TC-UT-FE01-01 | REQ-01: Kiểm tra tính hợp lệ của SĐT | Môi trường test sẵn sàng | Nhập số điện thoại 10 số hợp lệ và gọi validatePhone() | Hàm trả về true và không sinh lỗi | User | High | 5.1 | PASS | Unit test Vitest |
| TC-IT-FE01-01 | REQ-02: Đồng bộ giao dịch với Sổ quỹ | Đã đăng nhập Cashier, sổ quỹ mở | Lập phiếu thu tiền mặt và submit | Giao dịch lưu vào DB và cập nhật số dư tức thì | Cashier | High | 5.2 | PASS | API integration |
| TC-SYS-FE01-01 | REQ-03: Tìm kiếm và lọc danh sách | Dữ liệu khởi tạo có 50 bản ghi | Nhập từ khóa tìm kiếm và chọn bộ lọc VIP | Bảng dữ liệu lọc chính xác trong < 300ms | StoreManager | Medium | 5.3 | PASS | E2E browser |
| TC-SEC-FE01-01 | REQ-04: Chặn sửa hạn mức nợ trái phép | Đang đăng nhập với vai trò Cashier | Cố tình gọi API cập nhật hạn mức nợ DebtLimit | Hệ thống trả về HTTP 403 Forbidden | Cashier | Critical | 5.4 | PASS | RBAC security |
| SC-UAT-FE01-01 | REQ-05: Nghiệm thu quy trình thu nợ VietQR | Khách hàng có khoản nợ 500k | Tạo phiếu thu nợ và quét mã VietQR Napas 247 | Giao dịch ghi nhận thành công, giảm trừ nợ | StoreOwner | High | 5.5 | PASS | UAT acceptance |

## Lệnh đã chạy
- `npm test`: PASS (x/x tests passed)
- `npm run build`: PASS
- `npm run lint`: PASS

## Đối chiếu specs ↔ code
## Lỗi còn tồn đọng
```

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
