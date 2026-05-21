const Footer = () => (
  <footer className="site-footer" style={{
    borderTop: '1px solid #d8d2c6',
    padding: '28px 56px',
    backgroundColor: '#f1eee6',
  }}>
    <div className="footer-inner" style={{
      maxWidth: '800px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '14px',
    }}>
      <div className="footer-links" style={{
        display: 'flex',
        gap: '40px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {['Privacy Policy', 'Terms of Service', 'Shipping & Returns', 'Contact'].map(link => (
          <span key={link} className="footer-link" style={{
            fontFamily: 'Inter',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#6e6a63',
            cursor: 'pointer',
          }}>
            {link}
          </span>
        ))}
      </div>

      <p className="footer-copy" style={{
        fontFamily: 'Inter',
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        color: '#b0a99e',
        margin: 0,
      }}>
        © 2026 Liquid Alchemy. Crafted for the discerning palate.
      </p>
    </div>
  </footer>
)

export default Footer
