export default function FormInput({ label, type = "text", value, onChange, placeholder, required, error, name }) {
  return (
    <div className="form-field">
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`form-input ${error ? "input-error" : ""}`}
        autoComplete={name}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
