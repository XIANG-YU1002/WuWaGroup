import Button from "./Button.jsx";

export default function ErrorState({
  title = "無法載入資料",
  description = "請稍後再試。",
  onRetry,
  children,
}) {
  return (
    <div className="error-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          重新載入
        </Button>
      )}
      {children}
    </div>
  );
}
