import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginUser, addToCart, addToWishlist } from "../services/api";
import { getGuestCart, clearGuestCart, getGuestWishlist, clearGuestWishlist } from "../utils/guestCart";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [forgotMsg, setForgotMsg] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setError("");
    setForgotMsg(false);
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setForgotMsg(false);

    if (!form.email.trim() || !form.password.trim()) {
      setError("Please enter both email address and password.");
      return;
    }

    if (!EMAIL_PATTERN.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setIsSubmitting(true);
      const user = await loginUser(form.email.trim(), form.password);
      const currentUser = {
        ...user,
        role: user.is_admin ? "admin" : "customer",
        loginMethod: user.is_admin ? "database-admin" : "database-customer",
      };
      localStorage.setItem("liquidAlchemyCurrentUser", JSON.stringify(currentUser));

      if (!user.is_admin) {
        const guestCart = getGuestCart();
        const guestWishlist = getGuestWishlist();
        await Promise.allSettled([
          ...guestCart.map(item => addToCart(user.id, item.product_id, item.quantity)),
          ...guestWishlist.map(pid => addToWishlist(user.id, pid)),
        ]);
        clearGuestCart();
        clearGuestWishlist();
      }

      setIsSubmitting(false);
      navigate(user.is_admin ? "/admin" : "/");
    } catch {
      setIsSubmitting(false);
      setError("Invalid email or password.");
    }
  }

  return (
    <main className="auth-page">
      <Navbar />

      <div className="auth-main">
        <div className="auth-form-side">
          <div className="auth-card">
            <h1 className="auth-welcome">Welcome Back</h1>
            <p className="auth-subtitle">
              Enter your credentials to access your personal laboratory and cocktail archives.
            </p>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label htmlFor="email">EMAIL ADDRESS</label>
                <input
                  id="email" name="email" type="email"
                  placeholder="name@alchemy.com"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={() => {
                    if (form.email.trim() && !EMAIL_PATTERN.test(form.email.trim()))
                      setError("Please enter a valid email address.");
                  }}
                  autoComplete="email"
                />
              </div>

              <div className="auth-field">
                <div className="auth-label-row">
                  <label htmlFor="password">PASSWORD</label>
                  <button
                    type="button"
                    className="auth-text-button"
                    onClick={() => setForgotMsg(true)}
                  >
                    FORGOT?
                  </button>
                </div>
                <input
                  id="password" name="password" type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                {forgotMsg && (
                  <p className="auth-info-note">
                    Password recovery isn't available in this version — please contact support.
                  </p>
                )}
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button
                type="submit"
                className="auth-button auth-primary-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "SIGNING IN..." : "SIGN IN"}
              </button>
            </form>

            <div className="auth-divider" />
            <div className="auth-switch-area">
              <p>New to the Laboratory?</p>
              <button
                type="button"
                className="auth-secondary-link auth-secondary-button"
                onClick={() => navigate("/signup")}
              >
                CREATE AN ACCOUNT
              </button>
            </div>
          </div>
        </div>

        <div className="auth-photo-side">
          <img src="/images/ingredient2.png" alt="" />
          <span className="auth-photo-text auth-photo-text-left">SPIRITS / MOLECULAR MIXOLOGY</span>
          <span className="auth-photo-text auth-photo-text-right">EST. MMXXIV</span>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default Login;
