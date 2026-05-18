import { useState } from "react";

const AgeVerificationModal = ({ onApprove, onReject, rejected }) => {
  const [pressedButton, setPressedButton] = useState("");

  function handleButtonPress(buttonName, action) {
    setPressedButton(buttonName);

    setTimeout(() => {
      setPressedButton("");
      action();
    }, 160);
  }

  return (
    <div className="age-overlay" role="dialog" aria-modal="true">
      <section className="age-modal-card">
        <div className="auth-brand age-brand">Liquid Alchemy</div>

        <div className="age-brand-line" />

        <div className="age-modal-content">
          <p className="auth-kicker">Age Verification</p>

          <h1>Are you of legal drinking age?</h1>

          <p className="age-description">
            You must be 21 or older to enter. Liquid Alchemy advocates for
            responsible and discerning consumption.
          </p>

          <div className="age-modal-actions">
            <button
              type="button"
              className={`auth-button auth-primary-button ${
                pressedButton === "yes" ? "is-pressed" : ""
              }`}
              onClick={() => handleButtonPress("yes", onApprove)}
              disabled={rejected}
            >
              I AM 21+
            </button>

            <button
              type="button"
              className="age-exit-link"
              onClick={() => handleButtonPress("no", onReject)}
            >
              I am under 21 — Exit
            </button>
          </div>

          {rejected && (
            <div className="auth-denied" role="alert">
              You have not reached the legal age. Access to this website is
              prohibited.
            </div>
          )}

          <p className="age-modal-note">
            Please drink responsibly.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AgeVerificationModal;
