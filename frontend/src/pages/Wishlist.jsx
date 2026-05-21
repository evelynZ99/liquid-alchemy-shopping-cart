import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  fetchWishlist, removeFromWishlist, fetchProducts,
  fetchCart, addToCart, updateCartItem, deleteCartItem, clearCart,
} from '../services/api'
import { getCurrentUser } from '../utils/auth'
import {
  getGuestCart, addToGuestCart, updateGuestCartItem,
  removeFromGuestCart, clearGuestCart,
  getGuestWishlist, toggleGuestWishlist, clearGuestWishlist,
} from '../utils/guestCart'
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

  async function loadCart(allProducts) {
    if (!userId) {
      const guestItems = getGuestCart()
      if (guestItems.length === 0) { setCart([]); setLoadingCart(false); return }
      const prods = allProducts || await fetchProducts()
      setCart(guestItems.map(gi => {
        const p = prods.find(p => p.id === gi.product_id)
        if (!p) return null
        return { cart_item_id: `guest-${p.id}`, product_id: p.id, name: p.name, price: p.price, image_url: p.image_url, quantity: gi.quantity, subtotal: p.price * gi.quantity }
      }).filter(Boolean))
      setLoadingCart(false)
      return
    }
    try {
      setLoadingCart(true)
      setCart(await fetchCart(userId))
    } catch {
      // silently fail
    } finally {
      setLoadingCart(false)
    }
  }

  useEffect(() => {
    async function init() {
      if (!userId) {
        const guestWishlistIds = getGuestWishlist()
        if (guestWishlistIds.length === 0) { setLoading(false); loadCart(); return }
        const allProducts = await fetchProducts()
        setItems(guestWishlistIds.map(pid => {
          const p = allProducts.find(p => p.id === pid)
          if (!p) return null
          return { product_id: p.id, name: p.name, price: p.price, image_url: p.image_url, category: p.category }
        }).filter(Boolean))
        setLoading(false)
        loadCart(allProducts)
        return
      }
      fetchWishlist(userId)
        .then(data => { setItems(data); setLoading(false) })
        .catch(() => setLoading(false))
      loadCart()
    }
    init()
  }, [userId])

  const totalPrice = useMemo(() => cart.reduce((s, i) => s + i.subtotal, 0), [cart])
  const totalItems = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart])
  const upsellProducts = useMemo(() => items.filter(item => !cart.some(c => c.product_id === item.product_id)), [items, cart])

  const handleRemoveFromWishlist = (item) => {
    if (!userId) {
      toggleGuestWishlist(item.product_id)
      setItems(prev => prev.filter(i => i.product_id !== item.product_id))
      return
    }
    removeFromWishlist(item.id).then(() => {
      setItems(prev => prev.filter(i => i.id !== item.id))
    })
  }

  async function handleAddToCart(item) {
    if (!userId) {
      addToGuestCart(item.product_id, 1)
      await loadCart()
      setIsCartOpen(true)
      return
    }
    await addToCart(userId, item.product_id, 1)
    await loadCart()
    setIsCartOpen(true)
  }

  async function handleIncrease(item) {
    if (!userId) {
      updateGuestCartItem(item.product_id, item.quantity + 1)
      await loadCart()
      return
    }
    await updateCartItem(userId, item.cart_item_id, item.quantity + 1)
    await loadCart()
  }

  async function handleDecrease(item) {
    if (!userId) {
      updateGuestCartItem(item.product_id, item.quantity - 1)
      await loadCart()
      return
    }
    if (item.quantity <= 1) await deleteCartItem(userId, item.cart_item_id)
    else await updateCartItem(userId, item.cart_item_id, item.quantity - 1)
    await loadCart()
  }

  async function handleRemoveFromCart(cartItemId, productId) {
    if (!userId) {
      removeFromGuestCart(productId)
      await loadCart()
      return
    }
    await deleteCartItem(userId, cartItemId)
    await loadCart()
  }

  async function handleClearWishlist() {
    if (!userId) {
      clearGuestWishlist()
      setItems([])
      return
    }
    await Promise.all(items.map(item => removeFromWishlist(item.id)))
    setItems([])
  }

  async function handleClearCart() {
    if (!userId) {
      clearGuestCart()
      setCart([])
      return
    }
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
    <div className="alchemy-page" style={{ backgroundColor: '#f6f5f1', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar onCartOpen={() => setIsCartOpen(true)} />

      <main className="page-main" style={{ maxWidth: '1440px', width: '100%', margin: '0 auto', flex: 1 }}>

        <header style={{ marginBottom: '40px' }}>
          <span style={{
            fontFamily: 'Inter', fontSize: '12px', letterSpacing: '2px',
            textTransform: 'uppercase', color: '#6e6a63',
            display: 'block', marginBottom: '8px'
          }}>
            Curated Collection
          </span>
          <h1 className="page-heading" style={{
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
          <div className="wishlist-grid">
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
                  onClick={() => handleRemoveFromWishlist(item)}
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
              <p>Your cart is empty</p>
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
                      <button className="text-button" onClick={() => handleRemoveFromCart(item.cart_item_id, item.product_id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {upsellProducts.length > 0 && (
                <div className="upsell-section">
                  <h3>Others also considered</h3>
                  <div className="upsell-grid">
                    {upsellProducts.slice(0, 2).map((p) => (
                      <div className="upsell-card" key={p.product_id}>
                        <img src={p.image_url} alt={p.name} />
                        <p>{p.name}</p>
                        <span>${p.price?.toFixed(2)}</span>
                        <button className="ghost-button small" onClick={() => handleAddToCart(p)}>
                          Add to cart
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
