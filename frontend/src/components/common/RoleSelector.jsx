export default function RoleSelector({ value, onChange }) {
  const roles = [
    { key: "client", label: "Client" },
    { key: "lawyer", label: "Lawyer" },
  ];

  return (
    <div className="form-field">
      <label className="form-label">
        I am a <span className="required">*</span>
      </label>
      <div className="role-selector">
        {roles.map((role) => (
          <button
            key={role.key}
            type="button"
            className={`role-option ${value === role.key ? "role-active" : ""}`}
            onClick={() => onChange(role.key)}
          >
            {role.label}
          </button>
        ))}
      </div>
    </div>
  );
}
