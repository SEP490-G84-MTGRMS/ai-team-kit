# Tasks: pos-shift-management-ui

## Frontend Implementation

- [x] T1 — Định nghĩa types cho ca bán hàng, kiểm đếm tiền, thu chi, lịch sử ca trong `src/features/pos/types/pos.types.ts` (REQ-SHIFT-02, REQ-SHIFT-03, REQ-SHIFT-04, REQ-SHIFT-06)
- [x] T2 — Thêm mock data ca bán hàng, giao dịch thu/chi, lịch sử ca vào `src/features/pos/mock/posMockData.ts` (REQ-SHIFT-02, REQ-SHIFT-03, REQ-SHIFT-06)
- [x] T3 — Cải tiến `PosHeader.tsx`: Thêm hamburger menu (Giữ đơn, In bill gần nhất, Chốt ca / Quản lý ca) và tách tab hóa đơn xuống hàng dưới, giữ nút + [F1] luôn hiển thị ngoài (REQ-SHIFT-01)
- [x] T4 — Tạo component `ShiftKpiCard.tsx` hiển thị 4 KPI đầu ca/doanh thu/thực tế/chuyển khoản (REQ-SHIFT-02)
- [x] T5 — Tạo component `ShiftRevenueTable.tsx` hiển thị doanh thu theo phương thức thanh toán (REQ-SHIFT-03)
- [x] T6 — Tạo component `ShiftCashInOutTable.tsx` hiển thị bảng thu/chi tiền mặt tại quầy kèm phân trang `admin-pagination-footer` (REQ-SHIFT-03)
- [x] T7 — Tạo component `CashCountingTable.tsx` kiểm đếm 9 mệnh giá tiền mặt và `CashReconciliation.tsx` đối chiếu chênh lệch két (REQ-SHIFT-04)
- [x] T8 — Tạo component `ShiftHandoverForm.tsx` form bàn giao ca, tiền để lại, tiền nộp lại và nút đóng ca có xác nhận (REQ-SHIFT-05)
- [x] T9 — Tạo modal `CashInOutModal.tsx` lập phiếu thu/chi nội bộ tại két và `ZReportModal.tsx` in bill K80 khổ 320px (REQ-SHIFT-07)
- [x] T10 — Tạo component `ShiftHistoryFilter.tsx` và `ShiftHistoryTable.tsx` cho tab Lịch sử đóng ca kèm phân trang `admin-pagination-footer` (REQ-SHIFT-06)
- [x] T11 — Tạo page `PosShiftPage.tsx` tích hợp 2 tab "Phiên Ca Bán Hàng" và "Báo Cáo Sổ Quỹ & Lịch Sử Đóng Ca" (REQ-SHIFT-02..06)
- [x] T12 — Thêm CSS styling chuẩn tokens hệ thống vào `src/features/pos/pos.css` (REQ-SHIFT-01..07)
- [x] T13 — Khai báo route `/pos/shift` trong router ứng dụng và export các component mới trong `src/features/pos/index.ts` (REQ-SHIFT-01)

## Verification & Test

- [x] T14 — Chạy `npm run build` xác minh không có lỗi TypeScript hoặc lint (REQ-SHIFT-01..07)
- [x] T15 — Kiểm thử giao diện trên trình duyệt (hamburger menu, dời tab, kiểm đếm tiền, đổi tab lịch sử ca, modal Z-report)

## Tasks Sáp Nhập Từ Các Change Con

<!-- Tasks sáp nhập từ: pos-shift-ui-role-and-cash-approval -->
# Tasks: pos-shift-ui-role-and-cash-approval

## 1. Backend Extensions & API Endpoints
- [x] T1 — Hoàn thiện API duyệt chi, từ chối, hủy yêu cầu, xác nhận rút két và đọc/ghi cấu hình hạn mức trong `ShiftService.cs` & `ShiftsController.cs` (REQ-POS-CASH-03, REQ-POS-OWNER-04, REQ-POS-CONFIG-06)
- [x] T2 — Cập nhật `CloseShiftAsync` trong Backend để chặn chốt ca nếu còn phiếu `PendingApproval` (REQ-POS-CLOSE-05)

## 2. Frontend Types & API Client
- [x] T3 — Cập nhật TypeScript types trong `posShift.types.ts` và API client trong `posShiftApi.ts` (REQ-POS-ROLE-01, REQ-POS-CASH-03)

## 3. Frontend UI Components & Role Integration
- [x] T4 — Cập nhật `PosHeader.tsx` phân quyền: Chủ (chuông duyệt chi + badge pending); Thu ngân (trạng thái ca + nút Thu/Chi két) (REQ-POS-ROLE-01, REQ-POS-OWNER-04)
- [x] T5 — Hoàn thiện modal mở ca `OpenShiftModal.tsx` kế thừa $A_{expected}$ từ ca trước và tính chênh lệch đầu ca (REQ-POS-SHIFT-02)
- [x] T6 — Hoàn thiện modal thu chi `CashMovementModal.tsx` kiểm tra ngưỡng 200k, cảnh báo vượt mức và tạo phiếu `PendingApproval`, hỗ trợ hủy phiếu (REQ-POS-CASH-03)
- [x] T7 — Xây dựng Drawer phê duyệt của Chủ `OwnerCashApprovalDrawer.tsx` (Duyệt, Từ chối kèm ghi chú, Xác nhận `CashDrop`, Cài đặt nhanh) (REQ-POS-OWNER-04)
- [x] T8 — Hoàn thiện modal chốt ca `CloseShiftModal.tsx` kiểm đếm 9 mệnh giá, đối soát $G$ vs $H$, Invariant $Retained + Dropped = H$, chặn chốt ca khi còn pending (REQ-POS-CLOSE-05)
- [x] T9 — Cập nhật trang `StorePaymentConfigPage.tsx` bổ sung Card cấu hình hạn mức duyệt chi két (REQ-POS-CONFIG-06)
- [x] T10 — Tích hợp kiểm tra ca theo vai trò trong `PosCheckoutPage.tsx` (Chủ không bị popup chặn, Thu ngân bị popup nếu chưa mở ca) (REQ-POS-ROLE-01)

## 4. Testing & Verification
- [x] T11 — Bổ sung Unit test Backend cho các nghiệp vụ phê duyệt, hủy phiếu và kiểm tra hạn mức trong `ShiftManagementServiceTests.cs` (REQ-POS-CASH-03, REQ-POS-CLOSE-05)
- [x] T12 — Kiểm thử toàn diện: `dotnet test` Backend và `npm run build` Frontend đạt 100% PASS (Acceptance Checklist)
