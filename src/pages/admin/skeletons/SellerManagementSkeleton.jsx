export default function SellerManagementSkeleton() {
  return (
    <div className="admin-seller-management admin-seller-management--loading">
      <div
        className="admin-seller-management__panel skeleton"
        style={{ height: 140 }}
      />
      <div
        className="admin-seller-management__panel skeleton"
        style={{ height: 360 }}
      />
    </div>
  );
}
