export default function PageLoader({ label = "載入中..." }) {
  return (
    <div className="page-loader" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}
