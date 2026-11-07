# openspec/specs — Spec gốc theo capability

Mỗi capability có một file `openspec/specs/<capability>/spec.md`, là "sự thật hiện tại" của hệ thống.

- **Không sửa tay.** Spec gốc chỉ đổi qua:
  1. `/sep-archive` — merge delta từ `openspec/changes/<change>/specs.md`
  2. `/sep-refactor` — tìm đúng capability + REQ rồi merge delta trực tiếp (`sep_cap_nhat_capability`)
- Capability của change **bắt buộc** lúc `/sep-spec` (`capability` phải có sẵn trong thư mục này, trừ khi `taoCapabilityMoi: true`).
  Nhiều change cùng capability cộng dồn vào cùng một `spec.md`.

## Định dạng delta trong specs.md của change

```markdown
## ADDED Requirements
### Requirement: REQ-01 Tạo nhà cung cấp
Hệ thống MUST cho phép Store Manager tạo nhà cung cấp trong tenant của mình.

#### Scenario: Tạo thành công
- GIVEN ...
- WHEN ...
- THEN ...

## MODIFIED Requirements
### Requirement: REQ-03 Tìm kiếm nhà cung cấp
(nội dung đầy đủ mới — thay thế block cùng tên trong spec gốc)

## REMOVED Requirements
### Requirement: REQ-07 Xuất CSV
```

Khi merge: ADDED → thêm, MODIFIED → thay block cùng tên, REMOVED → xoá theo tên. Lịch sử merge ghi ở cuối spec gốc.
