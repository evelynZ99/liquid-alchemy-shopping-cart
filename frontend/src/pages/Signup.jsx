import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register as registerUser } from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "", email: "", password: "", confirmPassword: "", dateOfBirth: "",
  });

  function calculateAge(dob) {
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    if (
      today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
    ) age--;
    return age;
  }
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.fullName.trim() || !form.email.trim() || !form.password || !form.confirmPassword || !form.dateOfBirth) {
      setError("Please complete all fields.");
      return;
    }

    if (calculateAge(form.dateOfBirth) < 21) {
      setError("You must be 21 or older to create an account.");
      return;
    }

    if (!form.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    try {
      setIsSubmitting(true);
      const user = await registerUser(form.fullName.trim(), form.email.trim(), form.password, { dateOfBirth: form.dateOfBirth });
      localStorage.setItem("liquidAlchemyCurrentUser", JSON.stringify({
        ...user,
        role: user.is_admin ? "admin" : "customer",
        loginMethod: "database-customer",
      }));
      navigate("/");
    } catch {
      setIsSubmitting(false);
      setError("Account creation failed. This email may already be registered.");
    }
  }

  return (
    <main className="auth-page">
      <Navbar />

      <div className="auth-form-side">
          <div className="auth-card">
            <p className="auth-kicker">JOIN THE LABORATORY</p>
            <h1 className="auth-welcome">Create Account</h1>

            <form className="auth-form" onSubmit={handleSubmit} noValidate style={{ marginTop: '28px' }}>
              <div className="auth-field">
                <label>FULL NAME</label>
                <input
                  name="fullName" type="text"
                  placeholder="Alexander Sterling"
                  value={form.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>

              <div className="auth-field">
                <label>DATE OF BIRTH</label>
                <input
                  name="dateOfBirth" type="date"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                />
                <span className="auth-field-hint">You must be 21 or older to register.</span>
              </div>

              <div className="auth-field">
                <label>EMAIL ADDRESS</label>
                <input
                  name="email" type="email"
                  placeholder="name@alchemy.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>

              <div className="auth-field">
                <label>PASSWORD</label>
                <input
                  name="password" type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <span className="auth-field-hint">Minimum 6 characters.</span>
              </div>

              <div className="auth-field">
                <label>CONFIRM PASSWORD</label>
                <input
                  name="confirmPassword" type="password"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <span className="auth-field-hint">Must match your password.</span>
              </div>

              <label className="signup-checkbox-row">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={e => setAgreedToTerms(e.target.checked)}
                />
                <span>
                  I agree to the{" "}
                  <span style={{ textDecoration: "underline", cursor: "pointer" }}>Terms of Service</span>
                  {" "}and{" "}
                  <span style={{ textDecoration: "underline", cursor: "pointer" }}>Privacy Policy</span>.
                </span>
              </label>

              {error && <div className="auth-error">{error}</div>}

              <button
                type="submit"
                className="auth-button auth-primary-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "CREATING..." : "CREATE ACCOUNT"}
              </button>
            </form>

            <div className="auth-divider" />
            <div className="auth-switch-area">
              <p>Already a member of the laboratory?</p>
              <Link to="/login" className="auth-secondary-link">LOGIN TO ACCOUNT</Link>
            </div>
          </div>
        </div>

      <Footer />
    </main>
  );
};

export default Signup;
