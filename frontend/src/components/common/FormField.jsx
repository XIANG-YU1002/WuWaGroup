export default function FormField({ label, htmlFor, required = false, error, helperText, children }) {
  return (
    <div className={`form-field ${error ? "has-error" : ""}`}>
      {label && (
        <label htmlFor={htmlFor}>
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <span className="error-text">{error}</span>
      ) : (
        helperText && <span className="helper-text">{helperText}</span>
      )}
    </div>
  );
}
