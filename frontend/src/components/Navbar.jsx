import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, clearCurrentUser } from "../utils/auth";
import { getGuestCartCount } from "../utils/guestCart";

const Navbar = ({ cartCount }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const currentUser = getCurrentUser();
  const displayCartCount = cartCount ?? (!currentUser ? getGuestCartCount() : 0);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function handleAccountEntry() {
    closeMenu();
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (currentUser.is_admin || currentUser.role === "admin") {
      navigate("/admin");
      return;
    }
    navigate("/account");
  }

  function handleSignOut() {
    clearCurrentUser();
    navigate("/login", { replace: true });
  }

  return (
    <>
      <div className="top-bar">
        Receive a personalized ice mold with orders over $150 at checkout.
      </div>

      <header className="site-header">
        <Link to="/" className="brand listing-brand" onClick={closeMenu}>
          <span>LIQUID</span>
          <span>ALCHEMY</span>
        </Link>

        <nav className={`main-nav${isMenuOpen ? " nav-open" : ""}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>
          <Link to="/products?category=Cocktails" className="nav-link" onClick={closeMenu}>Cocktails</Link>
          <Link to="/products?category=Kits" className="nav-link" onClick={closeMenu}>Kits</Link>
          <Link to="/products?category=Glassware" className="nav-link" onClick={closeMenu}>Glassware</Link>
          <Link to="/products?category=Bar Tools" className="nav-link" onClick={closeMenu}>Bar Tools</Link>
          <Link to="/laboratory" className="nav-link" onClick={closeMenu}>Laboratory</Link>
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="account-icon-link"
            aria-label="Open account page"
            onClick={handleAccountEntry}
          >
            <span className="account-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path
                  d="M12 12c2.35 0 4.25-1.9 4.25-4.25S14.35 3.5 12 3.5 7.75 5.4 7.75 7.75 9.65 12 12 12Z"
                  fill="currentColor"
                />
                <path
                  d="M4.75 20.25c.65-3.45 3.52-5.75 7.25-5.75s6.6 2.3 7.25 5.75"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </button>

          {currentUser ? (
            <div className="home-user-area">
              <span className="home-user-label">
                {currentUser.username || currentUser.email}
              </span>
              <button type="button" className="home-logout-button" onClick={handleSignOut}>
                Log out
              </button>
            </div>
          ) : (
            <button type="button" className="home-logout-button" onClick={() => navigate("/login")}>
              Sign in
            </button>
          )}

          <button
            className="cart-icon-button"
            aria-label="Open wishlist"
            onClick={() => { closeMenu(); navigate("/wishlist"); }}
          >
            <span className="cart-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path
                  d="M12 21C12 21 3.5 15.5 3.5 9.5C3.5 7.01 5.51 5 8 5C9.49 5 10.81 5.74 11.62 6.87L12 7.4L12.38 6.87C13.19 5.74 14.51 5 16 5C18.49 5 20.5 7.01 20.5 9.5C20.5 15.5 12 21 12 21Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>

          <button
            className="cart-icon-button"
            aria-label="Open cart"
            onClick={() => { closeMenu(); navigate("/cart"); }}
            style={{ position: "relative" }}
          >
            <span className="cart-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path
                  d="M6 2L3 6v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6L18 2H6Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="3" y1="6" x2="21" y2="6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M16 10a4 4 0 01-8 0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {displayCartCount > 0 && (
              <span style={{
                position: "absolute", top: "-6px", right: "-6px",
                backgroundColor: "#b07a47", color: "#fff",
                borderRadius: "50%", width: "16px", height: "16px",
                fontSize: "10px", display: "flex", alignItems: "center",
                justifyContent: "center", fontFamily: "Inter", lineHeight: 1,
              }}>
                {displayCartCount > 99 ? "99+" : displayCartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className="hamburger-button"
            aria-label="Toggle navigation"
            onClick={() => setIsMenuOpen(prev => !prev)}
          >
            <span className="material-symbols-outlined">
              {isMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="nav-overlay" onClick={closeMenu} />
      )}
    </>
  );
};

export default Navbar;
