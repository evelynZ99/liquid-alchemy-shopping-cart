import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AgeVerificationModal from "../components/AgeVerificationModal";
import { login as loginUser, register as registerUser } from "../services/api";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const Login = () => {
  const navigate = useNavigate();

  const [ageStatus, setAgeStatus] = useState(() => {
    return localStorage.getItem("liquidAlchemyAgeVerified") === "true"
      ? "verified"
      : "pending";
  });

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const isAgeLocked = ageStatus !== "verified";

  function handleApproveAge() {
    localStorage.setItem("liquidAlchemyAgeVerified", "true");
    setAgeStatus("verified");
  }

  function handleRejectAge() {
    localStorage.removeItem("liquidAlchemyAgeVerified");
    setAgeStatus("rejected");
  }

  function handleLoginChange(event) {
    const { name, value } = event.target;

    setError("");

    setLoginForm((prev) => ({
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

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setError("");

    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      setError("Please enter both email address and password.");
      return;
    }

    if (!EMAIL_PATTERN.test(loginForm.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setIsSubmitting(true);

      const user = await loginUser(loginForm.email.trim(), loginForm.password);

      const currentUser = {
        ...user,
        role: user.is_admin ? "admin" : "customer",
        loginMethod: user.is_admin ? "database-admin" : "database-customer",
      };

      localStorage.setItem(
        "liquidAlchemyCurrentUser",
        JSON.stringify(currentUser)
      );

      setIsSubmitting(false);

      if (user.is_admin) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setIsSubmitting(false);
      setError("Invalid email or password.");
    }
  }

  async function handleCreateAccount(event) {
    event.preventDefault();
    setRegisterError("");

    if (
      !registerForm.username.trim() ||
      !registerForm.email.trim() ||
      !registerForm.password ||
      !registerForm.confirmPassword
    ) {
      setRegisterError("Please complete all fields.");
      return;
    }

    if (!registerForm.email.includes("@")) {
      setRegisterError("Please enter a valid email address.");
      return;
    }

    if (registerForm.password.length < 6) {
      setRegisterError("Password must be at least 6 characters.");
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterError("Passwords do not match.");
      return;
    }

    try {
      setIsCreatingAccount(true);

      await registerUser(
        registerForm.username.trim(),
        registerForm.email.trim(),
        registerForm.password
      );

      setIsCreatingAccount(false);
      setAccountCreated(true);
      setShowRegisterModal(false);

      setLoginForm({
        email: registerForm.email.trim(),
        password: "",
      });

      setRegisterForm({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      setIsCreatingAccount(false);
      setRegisterError(
        "Account creation failed. This email may already be registered."
      );
    }
  }

  return (
    <main className="auth-page">
      <section
        className={`auth-card login-card ${
          isAgeLocked || showRegisterModal ? "auth-blurred" : ""
        }`}
      >
        <Link to="/" className="auth-brand auth-brand-link">
          Liquid Alchemy
        </Link>

        <div className="auth-header">
          <p className="auth-kicker">CUSTOMER ACCESS</p>

          <h1>Welcome Back</h1>

          <p>
            Enter your credentials to access your personal laboratory and
            cocktail archives.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleLoginSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="email">EMAIL ADDRESS</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="name@alchemy.com"
              value={loginForm.email}
              onChange={handleLoginChange}
              onBlur={() => {
                if (
                  loginForm.email.trim() &&
                  !EMAIL_PATTERN.test(loginForm.email.trim())
                ) {
                  setError("Please enter a valid email address.");
                }
              }}
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
                  setError(
                    "Password recovery is not available in this prototype yet."
                  )
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
              value={loginForm.password}
              onChange={handleLoginChange}
              autoComplete="current-password"
              disabled={isAgeLocked}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          {accountCreated && (
            <div className="auth-success">
              Account created successfully. Please sign in with your new
              account.
            </div>
          )}

          <button
            type="submit"
            className="auth-button auth-primary-button"
            disabled={isSubmitting || isAgeLocked}
          >
            {isSubmitting ? "SIGNING IN..." : "SIGN IN"}
          </button>
        </form>

        {!accountCreated && (
          <>
            <div className="auth-divider" />

            <div className="auth-switch">
              <p>New to the Laboratory?</p>
              <button
                type="button"
                className="auth-secondary-link auth-secondary-button"
                onClick={() => {
                  setRegisterError("");
                  setShowRegisterModal(true);
                }}
                disabled={isAgeLocked}
              >
                CREATE AN ACCOUNT
              </button>
            </div>
          </>
        )}

        {accountCreated && (
          <div className="auth-created-note">
            Your account is ready. Use the email above to sign in.
          </div>
        )}

        <div className="auth-footer">
          <span>© 2026 LIQUID ALCHEMY</span>
          <div>
            <button
              type="button"
              className="auth-footer-button"
              disabled={isAgeLocked}
            >
              SUPPORT
            </button>
            <button
              type="button"
              className="auth-footer-button"
              disabled={isAgeLocked}
            >
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
        <div className="register-overlay" role="dialog" aria-modal="true">
          <section className="register-modal-card">
            <div className="auth-brand register-brand">Liquid Alchemy</div>

            <div className="register-brand-line" />

            <div className="register-modal-content">
              <p className="auth-kicker">NEW ACCOUNT</p>
              <h1>Create an Account</h1>
              <p className="register-description">
                Create your profile to save account details, order history, and
                future cocktail selections.
              </p>

              <form className="register-form" onSubmit={handleCreateAccount} noValidate>
                <div className="auth-field">
                  <label htmlFor="register-username">ACCOUNT NAME</label>
                  <input
                    id="register-username"
                    name="username"
                    type="text"
                    placeholder="Alchemy Guest"
                    value={registerForm.username}
                    onChange={handleRegisterChange}
                    autoComplete="username"
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="register-email">EMAIL ADDRESS</label>
                  <input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder="name@alchemy.com"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                    autoComplete="email"
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="register-password">PASSWORD</label>
                  <input
                    id="register-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                    autoComplete="new-password"
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="register-confirm-password">
                    CONFIRM PASSWORD
                  </label>
                  <input
                    id="register-confirm-password"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={registerForm.confirmPassword}
                    onChange={handleRegisterChange}
                    autoComplete="new-password"
                  />
                </div>

                {registerError && (
                  <div className="auth-error">{registerError}</div>
                )}

                <div className="register-actions">
                  <button
                    type="button"
                    className="auth-button auth-outline-button"
                    onClick={() => setShowRegisterModal(false)}
                    disabled={isCreatingAccount}
                  >
                    CANCEL
                  </button>

                  <button
                    type="submit"
                    className="auth-button auth-primary-button"
                    disabled={isCreatingAccount}
                  >
                    {isCreatingAccount ? "CREATING..." : "CREATE ACCOUNT"}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default Login;