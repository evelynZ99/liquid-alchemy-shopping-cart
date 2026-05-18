import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  fetchWishlist, removeFromWishlist,
  fetchCart, addToCart, updateCartItem, deleteCartItem, clearCart,
} from '../services/api'
import { getCurrentUser } from '../utils/auth'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const Wishlist = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState([])
  const [loadingCart, setLoadingCart] = useState(true)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const navigate = useNavigate()
  const currentUser = getCurrentUser()
  const userId = currentUser?.id

  async function loadCart() {
    if (!userId) { setCart([]); setLoadingCart(false); return }
    try {
      setLoadingCart(true)
      setCart(await fetchCart(userId))
    } catch {
      // silently fail — cart drawer will just show empty
    } finally {
      setLoadingCart(false)
    }
  }

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    fetchWishlist(userId)
      .then(data => { setItems(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [userId])

  useEffect(() => { loadCart() }, [userId])

  const totalPrice = useMemo(() => cart.reduce((s, i) => s + i.subtotal, 0), [cart])
  const totalItems = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart])

  const handleRemoveFromWishlist = (id) => {
    removeFromWishlist(id).then(() => {
      setItems(items.filter(item => item.id !== id))
    })
  }

  async function handleAddToCart(item) {
    if (!userId) return
    await addToCart(userId, item.product_id, 1)
    await loadCart()
    setIsCartOpen(true)
  }

  async function handleIncrease(item) {
    if (!userId) return
    await updateCartItem(userId, item.cart_item_id, item.quantity + 1)
    await loadCart()
  }

  async function handleDecrease(item) {
    if (!userId) return
    if (item.quantity <= 1) await deleteCartItem(userId, item.cart_item_id)
    else await updateCartItem(userId, item.cart_item_id, item.quantity - 1)
    await loadCart()
  }

  async function handleRemoveFromCart(cartItemId) {
    if (!userId) return
    await deleteCartItem(userId, cartItemId)
    await loadCart()
  }

  async function handleClearWishlist() {
    await Promise.all(items.map(item => removeFromWishlist(item.id)))
    setItems([])
  }

  async function handleClearCart() {
    if (!userId) return
    await clearCart(userId)
    await loadCart()
  }

  if (loading) return (
    <div className="alchemy-page">
      <Navbar />
      <div style={{ padding: '56px', fontFamily: 'Inter' }}>Loading...</div>
    </div>
  )

  return (
    <div className="alchemy-page" style={{ backgroundColor: '#f6f5f1', minHeight: '100vh' }}>
      <Navbar onCartOpen={() => setIsCartOpen(true)} />

      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '56px' }}>

        <header style={{ marginBottom: '40px' }}>
          <span style={{
            fontFamily: 'Inter', fontSize: '12px', letterSpacing: '2px',
            textTransform: 'uppercase', color: '#6e6a63',
            display: 'block', marginBottom: '8px'
          }}>
            Curated Collection
          </span>
          <h1 style={{
            fontFamily: 'Newsreader, serif', fontSize: '60px',
            fontStyle: 'italic', fontWeight: 500, color: '#2f2c29', margin: '0 0 16px'
          }}>
            Your Wishlist
          </h1>
          {items.length > 0 && (
            <button
              onClick={handleClearWishlist}
              style={{
                background: 'none', border: 'none', color: '#9c3d2b', cursor: 'pointer',
                fontFamily: 'Inter', fontSize: '11px', textTransform: 'uppercase',
                letterSpacing: '2px', borderBottom: '1px solid #9c3d2b', paddingBottom: '2px',
                padding: 0
              }}
            >
              Clear Wishlist
            </button>
          )}
        </header>

        {items.length === 0 ? (
          <div style={{ borderTop: '1px solid #d8d2c6', paddingTop: '48px' }}>
            <p style={{
              fontFamily: 'Newsreader, serif', fontSize: '24px',
              fontStyle: 'italic', color: '#6e6a63', marginBottom: '32px'
            }}>
              Your wishlist is empty.
            </p>
            <button
              onClick={() => navigate('/products')}
              style={{
                padding: '18px 48px', backgroundColor: '#191919', color: '#fff',
                border: 'none', cursor: 'pointer', fontFamily: 'Inter',
                fontSize: '12px', textTransform: 'uppercase', letterSpacing: '3px'
              }}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px',
            borderTop: '1px solid #d8d2c6',
            paddingTop: '32px'
          }}>
            {items.map(item => (
              <div key={item.id}>
                <div style={{ backgroundColor: '#efe8dc', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ height: '280px', overflow: 'hidden' }}>
                    {item.image_url ? (
                      <img
                        src={item.image_url} alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#6e6a63', fontFamily: 'Inter', fontSize: '14px'
                      }}>
                        No Image
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                  <h3 style={{ fontFamily: 'Newsreader, serif', fontSize: '20px', fontWeight: 500, color: '#2f2c29', margin: 0 }}>
                    {item.name}
                  </h3>
                  <span style={{ fontFamily: 'Inter', fontSize: '15px', color: '#2f2c29', flexShrink: 0, marginLeft: '8px' }}>
                    ${item.price?.toFixed(2)}
                  </span>
                </div>

                {item.category && (
                  <span style={{
                    fontFamily: 'Inter', fontSize: '11px', textTransform: 'uppercase',
                    letterSpacing: '2px', color: '#6e6a63', display: 'block', marginBottom: '16px'
                  }}>
                    {item.category}
                  </span>
                )}

                <button
                  onClick={() => handleAddToCart(item)}
                  style={{
                    width: '100%', padding: '14px',
                    backgroundColor: '#191919', color: '#ffffff',
                    border: 'none', cursor: 'pointer',
                    fontFamily: 'Inter', fontSize: '12px',
                    textTransform: 'uppercase', letterSpacing: '2px',
                    marginBottom: '10px'
                  }}
                >
                  Add to Cart
                </button>

                <button
                  onClick={() => handleRemoveFromWishlist(item.id)}
                  style={{
                    background: 'none', border: 'none', color: '#9c3d2b', cursor: 'pointer',
                    fontFamily: 'Inter', fontSize: '11px', textTransform: 'uppercase',
                    letterSpacing: '2px', borderBottom: '1px solid #9c3d2b', paddingBottom: '2px'
                  }}
                >
                  Remove Item
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* ── Cart Drawer ── */}
      <div
        className={`drawer-overlay ${isCartOpen ? 'show' : ''}`}
        onClick={() => setIsCartOpen(false)}
      />

      <aside className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>Added to Cart</h2>
          <button className="close-button" onClick={() => setIsCartOpen(false)}>×</button>
        </div>

        <div className="cart-body">
          {loadingCart ? (
            <p className="status-text drawer-status">Loading cart…</p>
          ) : cart.length === 0 ? (
            <div className="empty-cart">
              <p>{userId ? 'Your cart is empty' : 'Sign in to save products to your cart.'}</p>
            </div>
          ) : (
            <>
              <div className="cart-list">
                {cart.map((item) => (
                  <div className="cart-item" key={item.cart_item_id}>
                    <div className="cart-item-image-wrap">
                      <img src={item.image_url} alt={item.name} className="cart-item-image" />
                    </div>
                    <div className="cart-item-info">
                      <h3>{item.name}</h3>
                      <p className="cart-item-price">${item.price.toFixed(2)}</p>
                      <p className="cart-item-subtotal">Subtotal: ${item.subtotal.toFixed(2)}</p>
                      <div className="quantity-row">
                        <span>Quantity</span>
                        <button onClick={() => handleDecrease(item)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => handleIncrease(item)}>+</button>
                      </div>
                      <button className="text-button" onClick={() => handleRemoveFromCart(item.cart_item_id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-footer">
                <div className="cart-summary-row">
                  <span>Subtotal ({totalItems} items)</span>
                  <strong>${totalPrice.toFixed(2)}</strong>
                </div>
                <button className="checkout-button" onClick={() => { setIsCartOpen(false); navigate('/cart') }}>
                  Go to cart
                </button>
                <button className="secondary-button clear-cart-button" onClick={handleClearCart}>
                  Clear cart
                </button>
                <button className="secondary-button" onClick={() => setIsCartOpen(false)}>
                  Continue shopping
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  )
}

export default Wishlist
