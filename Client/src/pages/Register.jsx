import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/users";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    role: "user",        
    adminSecret: "",     
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isAdmin = useMemo(() => form.role === "admin", [form.role]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";

    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Password must be at least 6 characters";

    if (form.password !== form.confirm) e.confirm = "Passwords do not match";

    // only required when registering as admin
    if (isAdmin && !form.adminSecret.trim()) e.adminSecret = "Admin secret is required";

    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role, // send role
        ...(isAdmin ? { adminSecret: form.adminSecret } : {}), // send adminSecret only if admin
      };

      const res = await registerUser(payload);

      // your API response structure: res.data.data = { user, token }
      const { user, token } = res.data.data;
      login(user, token);

      toast.success(isAdmin ? "Admin account created!" : "Account created!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    setErrors({ ...errors, [field]: "" });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-brand-muted mt-1">Join Radhey Mart today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Role selector */}
          <div>
            <label className="label">Register as</label>
            <select
              value={form.role}
              onChange={set("role")}
              className="input"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && <p className="text-red-400 text-xs mt-1">{errors.role}</p>}
          </div>

          {/* Admin secret (only if admin) */}
          {isAdmin && (
            <div>
              <label className="label">Admin Secret</label>
              <input
                type="password"
                value={form.adminSecret}
                onChange={set("adminSecret")}
                className="input"
                placeholder="Enter admin secret"
              />
              {errors.adminSecret && (
                <p className="text-red-400 text-xs mt-1">{errors.adminSecret}</p>
              )}
              <p className="text-brand-muted text-xs mt-1">
                Only authorized admins should have this secret.
              </p>
            </div>
          )}

          {[
            { field: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
            { field: "email", label: "Email", type: "email", placeholder: "you@example.com" },
            { field: "password", label: "Password", type: "password", placeholder: "••••••••" },
            { field: "confirm", label: "Confirm Password", type: "password", placeholder: "••••••••" },
          ].map(({ field, label, type, placeholder }) => (
            <div key={field}>
              <label className="label">{label}</label>
              <input
                type={type}
                value={form[field]}
                onChange={set(field)}
                className="input"
                placeholder={placeholder}
              />
              {errors[field] && <p className="text-red-400 text-xs mt-1">{errors[field]}</p>}
            </div>
          ))}

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
            {loading ? "Creating account..." : isAdmin ? "Create Admin Account" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-brand-muted text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-white hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}