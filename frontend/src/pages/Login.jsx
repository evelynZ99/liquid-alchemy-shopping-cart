import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AgeVerificationModal from "../components/AgeVerificationModal";
import { login as loginUser, register as registerUser } from "../services/api";

const emptyRegisterForm = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 年龄验证状态
  const [ageStatus, setAgeStatus] = useState(() => {
    return localStorage.getItem("liquidAlchemyAgeVerified") === "true"
      ? "verified"
      : "pending";
  });

  // false = 普通用户登录；true = 管理员登录
  const [isAdminMode, setIsAdminMode] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState(emptyRegisterForm);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

  const [error, setError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const isAgeLocked = ageStatus !== "verified";

  function handleApproveAge() {
    localStorage.setItem("liquidAlchemyAgeVerified", "true");
    setAgeStatus("verified");

    // 如果用户原本只是想进入普通浏览页，年龄验证后直接回去
    const from = location.state?.from;
    if (from && from !== "/login" && from !== "/account" && !from.startsWith("/admin")) {
      navigate(from, { replace: true });
    }
  }

  function handleRejectAge() {
    localStorage.removeItem("liquidAlchemyAgeVerified");
    setAgeStatus("rejected");
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleRegisterChange(event) {
    const { name, value } = event.target;

    setRegisterForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleModeSwitch() {
    setError("");
    setSuccessMessage("");
    setIsAdminMode((prev) => !prev);
  }

  function openRegisterModal() {
    setRegisterError("");
    setShowRegisterModal(true);
  }

  function closeRegisterModal() {
    if (isCreatingAccount) return;
    setShowRegisterModal(false);
    setRegisterError("");
  }

  async function handleCreateAccount(event) {
    event.preventDefault();
    setRegisterError("");
    setSuccessMessage("");

    if (
      !registerForm.username.trim() ||
      !registerForm.email.trim() ||
      !registerForm.password.trim() ||
      !registerForm.confirmPassword.trim()
    ) {
      setRegisterError("Please complete all fields.");
      return;
    }

    if (!registerForm.email.includes("@")) {
      setRegisterError("Please enter a valid email address.");
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterError("Password and confirmation do not match.");
      return;
    }

    try {
      setIsCreatingAccount(true);

      await registerUser(
        registerForm.username.trim(),
        registerForm.email.trim(),
        registerForm.password
      );

      setFormData({
        email: registerForm.email.trim(),
        password: "",
      });

      setRegisterForm(emptyRegisterForm);
      setAccountCreated(true);
      setShowRegisterModal(false);
      setSuccessMessage("Account created successfully. Please sign in with your new account.");
    } catch (err) {
      setRegisterError("Failed to create account. The email may already be registered.");
    } finally {
      setIsCreatingAccount(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Please enter both email address and password.");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setIsSubmitting(true);

      const user = await loginUser(formData.email.trim(), formData.password);

      if (isAdminMode && !user.is_admin) {
        setError("This account does not have staff access.");
        setIsSubmitting(false);
        return;
      }

      const currentUser = {
        ...user,
        role: user.is_admin ? "admin" : "customer",
        ageVerified: true,
        loginMethod: isAdminMode ? "database-admin" : "database-customer",
      };

      // 保存当前登录身份
      localStorage.setItem("liquidAlchemyCurrentUser", JSON.stringify(currentUser));

      // 登录成功后进入主页
      navigate("/", { replace: true });
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className={`auth-card login-card ${isAgeLocked || showRegisterModal ? "auth-blurred" : ""}`}>
        <Link to="/" className="auth-brand auth-brand-link">
          Liquid Alchemy
        </Link>

        <div className="auth-header">
          <p className="auth-kicker">
            {isAdminMode ? "STAFF ACCESS" : "CUSTOMER ACCESS"}
          </p>

          <h1>{isAdminMode ? "Staff Portal" : "Welcome Back"}</h1>

          <p>
            {isAdminMode
              ? "Enter your staff credentials to access future management tools."
              : "Enter your credentials to access your personal laboratory and cocktail archives."}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">EMAIL ADDRESS</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder={isAdminMode ? "staff@alchemy.com" : "name@alchemy.com"}
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              disabled={isAgeLocked}
            />
          </div>

          <div className="auth-field">
            <div className="auth-label-row">
              <label htmlFor="password">PASSWORD</label>

              <button
                type="button"
                className="auth-text-button"
                onClick={() =>
                  setError("Password recovery is not available in this prototype yet.")
                }
                disabled={isAgeLocked}
              >
                FORGOT?
              </button>
            </div>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              disabled={isAgeLocked}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}
          {successMessage && <div className="auth-success">{successMessage}</div>}

          <button
            type="submit"
            className="auth-button auth-primary-button"
            disabled={isSubmitting || isAgeLocked}
          >
            {isSubmitting
              ? isAdminMode
                ? "SIGNING IN AS STAFF..."
                : "SIGNING IN..."
              : isAdminMode
                ? "SIGN IN AS STAFF"
                : "SIGN IN"}
          </button>

          <button
            type="button"
            className="auth-mode-switch"
            onClick={handleModeSwitch}
            disabled={isAgeLocked}
          >
            {isAdminMode ? "Customer sign in" : "Staff access"}
          </button>
        </form>

        {!isAdminMode && !accountCreated && (
          <>
            <div className="auth-divider" />

            <div className="auth-switch-area">
              <p>New to the Laboratory?</p>
              <button
                type="button"
                className="auth-secondary-link auth-secondary-button"
                onClick={openRegisterModal}
                disabled={isAgeLocked}
              >
                CREATE AN ACCOUNT
              </button>
            </div>
          </>
        )}

        <div className="auth-footer">
          <span>© 2026 LIQUID ALCHEMY</span>
          <div>
            <button type="button" className="auth-footer-button" disabled={isAgeLocked}>
              SUPPORT
            </button>
            <button type="button" className="auth-footer-button" disabled={isAgeLocked}>
              PRIVACY
            </button>
          </div>
        </div>
      </section>

      {isAgeLocked && (
        <AgeVerificationModal
          onApprove={handleApproveAge}
          onReject={handleRejectAge}
          rejected={ageStatus === "rejected"}
        />
      )}

      {showRegisterModal && (
        <div className="auth-register-overlay" role="dialog" aria-modal="true">
          <section className="auth-register-card">
            <button
              type="button"
              className="auth-register-close"
              onClick={closeRegisterModal}
              aria-label="Close create account modal"
            >
              ×
            </button>

            <p className="auth-kicker">CREATE ACCOUNT</p>
            <h2>Join the Laboratory</h2>
            <p className="auth-register-copy">
              Create a customer account to save your cart, view order history, and manage profile details.
            </p>

            <form className="auth-form" onSubmit={handleCreateAccount}>
              <div className="auth-field">
                <label htmlFor="register-username">ACCOUNT NAME</label>
                <input
                  id="register-username"
                  name="username"
                  type="text"
                  value={registerForm.username}
                  onChange={handleRegisterChange}
                  placeholder="Alchemy Guest"
                />
              </div>

              <div className="auth-field">
                <label htmlFor="register-email">EMAIL ADDRESS</label>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  value={registerForm.email}
                  onChange={handleRegisterChange}
                  placeholder="name@alchemy.com"
                />
              </div>

              <div className="auth-field">
                <label htmlFor="register-password">PASSWORD</label>
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  placeholder="••••••••"
                />
              </div>

              <div className="auth-field">
                <label htmlFor="register-confirm-password">CONFIRM PASSWORD</label>
                <input
                  id="register-confirm-password"
                  name="confirmPassword"
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={handleRegisterChange}
                  placeholder="••••••••"
                />
              </div>

              {registerError && <div className="auth-error">{registerError}</div>}

              <button
                type="submit"
                className="auth-button auth-primary-button"
                disabled={isCreatingAccount}
              >
                {isCreatingAccount ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
              </button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
};

export default Login;
