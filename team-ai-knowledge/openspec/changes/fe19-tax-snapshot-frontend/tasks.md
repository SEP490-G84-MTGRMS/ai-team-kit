# Tasks: Phân hệ Frontend Kê khai & Chốt số liệu thuế Hộ kinh doanh (FE-19 Tax Snapshot)

## Frontend Implementation Checklist

- [ ] T1 — Định nghĩa TypeScript Types & Data Contracts (`src/features/tax-snapshot/types/taxSnapshot.ts`) (REQ-FE19-01)
- [ ] T2 — Xây dựng Mock API client & Data Service cho Tax Snapshots (`src/features/tax-snapshot/api/taxSnapshotApi.ts`) (REQ-FE19-01, REQ-FE19-02)
- [ ] T3 — Xây dựng Custom Hooks (`useTaxSnapshots`, `useTaxSnapshotPreview`) với TanStack Query (REQ-FE19-01, REQ-FE19-02)
- [ ] T4 — Xây dựng Component `TaxKPICards` hiển thị 4 chỉ số thuế cốt lõi (REQ-FE19-01)
- [ ] T5 — Xây dựng Component `TaxSnapshotStatusBadge` & `TaxSnapshotFilterBar` (REQ-FE19-01)
- [ ] T6 — Xây dựng Component `TaxSnapshotTable` danh sách kỳ tính thuế (REQ-FE19-01, REQ-FE19-03)
- [ ] T7 — Xây dựng Component `CreateTaxSnapshotModal` tạo kỳ thuế & xem trước Preview (REQ-FE19-02)
- [ ] T8 — Xây dựng Component `TaxSnapshotDetailDrawer` xem bảng kê hóa đơn & quản lý vòng đời tờ khai (REQ-FE19-03, REQ-FE19-04)
- [ ] T9 — Xây dựng Component `TaxExportModal` xuất mẫu tờ khai Form 01/CNKD (REQ-FE19-04)
- [ ] T10 — Hoàn thiện `TaxSnapshotPage`, cấu hình Router và TopNav Navigation (REQ-FE19-01)
- [ ] T11 — Kiểm tra kiểm thử: chạy lint (`oxlint`) và build bundle (`npm run build`) đảm bảo 0 lỗi (REQ-FE19-01..04)
