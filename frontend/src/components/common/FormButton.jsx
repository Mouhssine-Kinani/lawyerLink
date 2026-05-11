export default function FormButton({ children, loading, disabled, type = "submit", className = "", ...rest }) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`form-button ${loading ? "button-loading" : ""} ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="button-spinner" />
      ) : (
        children
      )}
    </button>
  );
}
