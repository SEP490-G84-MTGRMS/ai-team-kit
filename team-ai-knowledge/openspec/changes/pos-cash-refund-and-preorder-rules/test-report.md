---
verdict: PASS
---

# Test Report: pos-cash-refund-and-preorder-rules

## 1. Kết Quả Kiểm Thử Theo Yêu Cầu (Requirements & Scenarios)

| Mã Requirement | Kịch bản kiểm thử (Scenario) | Loại kiểm thử | Kết quả | Ghi chú |
|---|---|---|---|---|
| `REQ-POS-RETURN-UNIT-CONVERSION-04` | Két quầy đủ tiền mặt để hoàn trả khách | Unit / UI Test | ✅ PASS | Hoàn tiền mặt 100% trích từ két, ghi nhận phiếu chi `ShiftCashMovement` loại `RETURN_REFUND` |
| `REQ-POS-RETURN-UNIT-CONVERSION-04` | Két quầy thiếu tiền mặt khi hoàn trả | Unit / UI Test | ✅ PASS | Hiển thị cảnh báo đỏ, khóa nút xác nhận hoàn và ném lỗi backend nếu két thiếu tiền |
| `REQ-POS-RETURN-LINE-CONDITION-01` | Hàng trả nguyên vẹn (`Restock`) | Unit / Backend | ✅ PASS | Tồn kho khả dụng `BranchStock.QuantityOnHand` tăng lại đúng số lượng trả |
| `REQ-POS-RETURN-LINE-CONDITION-01` | Hàng trả lỗi / hỏng (`Damaged`) | Unit / Backend | ✅ PASS | Kiểm thử `REQ_POS_RET_02_Damaged_Condition_Does_Not_Restock`: Tồn kho bán lẻ giữ nguyên, không cộng lại |
| `REQ-POS-RETURN-REASON-MANDATORY-02` | Bắt buộc chọn Lý do đổi trả chuẩn hóa | Frontend UI | ✅ PASS | Danh mục gồm DEFECTIVE, WRONG_ITEM, CHANGE_MIND, EXPIRED_NEAR_DATE, OTHER |
| `REQ-POS-RETURN-REASON-MANDATORY-02` | Chọn lý do Khác (`OTHER`) bắt buộc ghi chú | Frontend UI | ✅ PASS | Hệ thống chặn submit nếu không nhập ghi chú giải trình |
| `REQ-POS-PREORDER-RETURN-EXCHANGE-RULES-03` | Đơn đặt trước không có lỗi NSX đòi lấy tiền mặt | Frontend UI | ✅ PASS | Hệ thống chặn hoàn tiền mặt, hiển thị cảnh báo đỏ và yêu cầu chọn sản phẩm đổi mới |
| `REQ-POS-PREORDER-RETURN-EXCHANGE-RULES-03` | Đơn đặt trước bị lỗi NSX (`DEFECTIVE`) | Frontend UI | ✅ PASS | Hệ thống mở khóa cho phép hoàn tiền mặt từ két quầy |

---

## 2. Nhật Ký Lệnh Kiểm Thử Tự Động

### Backend Build & Unit Test
```powershell
$ dotnet build MT_GRMS_BACKEND/MT_GRMS_BACKEND.sln
...
    25 Warning(s)
    0 Error(s)
Time Elapsed 00:00:15.31

$ dotnet test MT_GRMS_BACKEND/tests/MT_GRMS.UnitTests/MT_GRMS.UnitTests.csproj --filter "FullyQualifiedName~PosOrderServiceTests"
...
Passed!  - Failed: 0, Passed: 38, Skipped: 0, Total: 38, Duration: 219 ms - MT_GRMS.UnitTests.dll (net8.0)
```

### Frontend Build
```powershell
$ cd MT_GRMS_FRONTEND; npm run build
> frontend@0.0.0 build
> tsc -b && vite build
✓ 2579 modules transformed.
✓ built in 1.03s
```

---

## 3. Lỗi Còn Tồn Đọng
- Không có lỗi tồn đọng (`0 errors`).
