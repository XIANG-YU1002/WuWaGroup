export default function Button({
  variant = "primary",
  loading = false,
  disabled = false,
  fullWidth = false,
  type = "button",
  children,
  className = "",
  ...rest
}) {
  const classes = ["btn", `btn-${variant}`, fullWidth ? "btn-full" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...rest}>
      {loading && <span className="spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}
