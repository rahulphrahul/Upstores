export default function ShopManagementSkeleton() {
  return (
    <div className="admin-shop-management admin-shop-management--loading">
      <div
        className="admin-shop-management__panel skeleton"
        style={{ height: 140 }}
      />
      <div
        className="admin-shop-management__panel skeleton"
        style={{ height: 360 }}
      />
    </div>
  );
}
