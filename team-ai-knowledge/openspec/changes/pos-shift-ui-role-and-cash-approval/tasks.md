# Tasks: pos-shift-ui-role-and-cash-approval

## 1. Backend Extensions & API Endpoints
- [ ] T1 — Hoàn thiện API duyệt chi, từ chối, hủy yêu cầu, xác nhận rút két và đọc/ghi cấu hình hạn mức trong `ShiftService.cs` & `ShiftsController.cs` (REQ-POS-CASH-03, REQ-POS-OWNER-04, REQ-POS-CONFIG-06)
- [ ] T2 — Cập nhật `CloseShiftAsync` trong Backend để chặn chốt ca nếu còn phiếu `PendingApproval` (REQ-POS-CLOSE-05)

## 2. Frontend Types & API Client
- [ ] T3 — Cập nhật TypeScript types trong `posShift.types.ts` và API client trong `posShiftApi.ts` (REQ-POS-ROLE-01, REQ-POS-CASH-03)

## 3. Frontend UI Components & Role Integration
- [ ] T4 — Cập nhật `PosHeader.tsx` phân quyền: Chủ (chuông duyệt chi + badge pending); Thu ngân (trạng thái ca + nút Thu/Chi két) (REQ-POS-ROLE-01, REQ-POS-OWNER-04)
- [ ] T5 — Hoàn thiện modal mở ca `OpenShiftModal.tsx` kế thừa $A_{expected}$ từ ca trước và tính chênh lệch đầu ca (REQ-POS-SHIFT-02)
- [ ] T6 — Hoàn thiện modal thu chi `CashMovementModal.tsx` kiểm tra ngưỡng 200k, cảnh báo vượt mức và tạo phiếu `PendingApproval`, hỗ trợ hủy phiếu (REQ-POS-CASH-03)
- [ ] T7 — Xây dựng Drawer phê duyệt của Chủ `OwnerCashApprovalDrawer.tsx` (Duyệt, Từ chối kèm ghi chú, Xác nhận `CashDrop`, Cài đặt nhanh) (REQ-POS-OWNER-04)
- [ ] T8 — Hoàn thiện modal chốt ca `CloseShiftModal.tsx` kiểm đếm 9 mệnh giá, đối soát $G$ vs $H$, Invariant $Retained + Dropped = H$, chặn chốt ca khi còn pending (REQ-POS-CLOSE-05)
- [ ] T9 — Cập nhật trang `StorePaymentConfigPage.tsx` bổ sung Card cấu hình hạn mức duyệt chi két (REQ-POS-CONFIG-06)
- [ ] T10 — Tích hợp kiểm tra ca theo vai trò trong `PosCheckoutPage.tsx` (Chủ không bị popup chặn, Thu ngân bị popup nếu chưa mở ca) (REQ-POS-ROLE-01)

## 4. Testing & Verification
- [ ] T11 — Bổ sung Unit test Backend cho các nghiệp vụ phê duyệt, hủy phiếu và kiểm tra hạn mức trong `ShiftManagementServiceTests.cs` (REQ-POS-CASH-03, REQ-POS-CLOSE-05)
- [ ] T12 — Kiểm thử toàn diện: `dotnet test` Backend và `npm run build` Frontend đạt 100% PASS (Acceptance Checklist)
