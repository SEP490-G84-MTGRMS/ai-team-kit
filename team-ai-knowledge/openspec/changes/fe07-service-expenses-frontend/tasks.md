# Tasks: Frontend Quản Lý Chi Phí Dịch Vụ & Vận Hành (fe07-service-expenses-frontend)

## 1. Types & Data Contracts
- [x] T1 — Định nghĩa Types, Interfaces, Enums & Zod Schemas trong `src/features/service-expenses/types/expense.types.ts` (REQ-07.1, REQ-07.2)

## 2. API Services & Query Hooks
- [x] T2 — Xây dựng API Client Service `src/features/service-expenses/api/expenseApi.ts` qua `httpClient` (REQ-07.1, REQ-07.2, REQ-07.3, REQ-07.4)
- [x] T3 — Xây dựng TanStack Query Custom Hooks trong `src/features/service-expenses/hooks/useServiceExpenses.ts` (REQ-07.1, REQ-07.2, REQ-07.3)

## 3. UI Components (KiotViet Design System)
- [x] T4 — Xây dựng component Thẻ thống kê KPI `src/features/service-expenses/components/ExpenseKpiCards.tsx` (REQ-07.1, REQ-07.5)
- [x] T5 — Xây dựng component Bộ lọc đa tiêu chí `src/features/service-expenses/components/ExpenseFilterBar.tsx` kèm debounce search (REQ-07.1, REQ-07.5)
- [x] T6 — Xây dựng component Badge trạng thái `src/features/service-expenses/components/ExpenseStatusBadge.tsx` bo tròn Full Pill (REQ-07.1, REQ-07.5)
- [x] T7 — Xây dựng component Bảng dữ liệu `src/features/service-expenses/components/ExpenseTable.tsx` kèm Skeleton Shimmer Loading & Empty State (REQ-07.1, REQ-07.5)
- [x] T8 — Xây dựng component Modal ghi nhận chi phí `src/features/service-expenses/components/CreateExpenseModal.tsx` với Zod validation & chống double-click (REQ-07.2, REQ-07.5)
- [x] T9 — Xây dựng component Modal xác nhận thanh toán `src/features/service-expenses/components/PayExpenseModal.tsx` tích hợp Sổ quỹ (REQ-07.3, REQ-07.5)
- [x] T10 — Xây dựng component Modal xem chứng từ `src/features/service-expenses/components/BillPreviewModal.tsx` có fallback xử lý ảnh lỗi (REQ-07.1, REQ-07.5)

## 4. Page, Routing & Navigation
- [x] T11 — Xây dựng trang `src/features/service-expenses/pages/ServiceExpensesPage.tsx`, đăng ký route `/dashboard/expenses` trong `src/app/router.tsx` và menu sidebar trong `MasterLayout.tsx` (REQ-07.1, REQ-07.5)

## 5. Verification & Quality Gate
- [x] T12 — Kiểm thử chất lượng mã nguồn: Biên dịch TypeScript (`npm run build`), kiểm tra lint (`oxlint`), và xác minh toàn bộ các trạng thái giao diện (REQ-07.5)
