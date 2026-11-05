# Improvements: pos-branch-pricing-and-fefo

## Apply · 2026-11-04 16:34

Cơ chế phân giải giá 3 cấp (BranchProductUnitPrice -> ProductUnits.Price -> BasePrice * ConversionRate) kết hợp quy đổi số lượng cơ sở trước khi trừ kho BranchStocks theo FEFO vận hành rất mượt mà và chính xác.

## Test · 2026-11-04 16:35

Toàn bộ 6/6 kịch bản kiểm thử FEFO, giá override chi nhánh, giá override ĐVT và khôi phục tồn kho khi hủy đơn đều đạt 100% PASS trên xUnit và Vite build.
