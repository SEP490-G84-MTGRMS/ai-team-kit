# Improvements: pos-customer-api-route-and-field-mapping-fix

## Spec · 2026-11-05 10:48

Bổ sung route song song api/v1/[controller] và chuẩn hóa mapping DTO giữa backend và frontend POS.

## Brainstorm · 2026-11-05 10:49

Đảm bảo hỗ trợ cả hai chuẩn endpoint /api/customers và /api/v1/customers để không ảnh hưởng đến bất kỳ màn hình nào khác.

## Verify Spec · 2026-11-05 10:49

Thực thi code tối thiểu, chuẩn xác và khởi động lại API server để kiểm chứng trực tiếp.

## Apply · 2026-11-05 10:53

Kiểm chứng trực tiếp dữ liệu PostgreSQL trả về qua API và build frontend thành công.
