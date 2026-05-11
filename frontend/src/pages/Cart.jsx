import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchCart, updateCartItem, deleteCartItem } from '../services/api'

const Cart = () => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCart()
      .then(data => {
        setCartItems(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch cart:', err)
        setLoading(false)
      })
  }, [])

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  )

  const handleQuantityChange = (cartItemId, newQty) => {
    if (newQty < 1) return
    updateCartItem(cartItemId, newQty).then(() => {
      setCartItems(cartItems.map(item =>
        item.cart_item_id === cartItemId
          ? { ...item, quantity: newQty }
          : item
      ))
    })
  }

  const handleRemove = (cartItemId) => {
    deleteCartItem(cartItemId).then(() => {
      setCartItems(cartItems.filter(item => item.cart_item_id !== cartItemId))
    })
  }

  // 加载中
  if (loading) return (
    <div style={{ padding: '56px', fontFamily: 'Inter' }}>Loading...</div>
  )

  // 空购物车
  if (cartItems.length === 0) return (
    <div style={{ backgroundColor: '#f6f5f1', minHeight: '100vh' }}>
      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '56px' }}>
        <header style={{ marginBottom: '40px' }}>
          <span style={{
            fontFamily: 'Inter', fontSize: '12px', letterSpacing: '2px',
            textTransform: 'uppercase', color: '#6e6a63',
            display: 'block', marginBottom: '8px'
          }}>
            Review Your Order
          </span>
          <h1 style={{
            fontFamily: 'Newsreader, serif', fontSize: '60px',
            fontStyle: 'italic', fontWeight: 500, color: '#2f2c29', margin: 0
          }}>
            Your Selection
          </h1>
        </header>
        <div style={{ borderTop: '1px solid #d8d2c6', paddingTop: '48px' }}>
          <p style={{
            fontFamily: 'Newsreader, serif', fontSize: '24px',
            fontStyle: 'italic', color: '#6e6a63', marginBottom: '32px'
          }}>
            Your cart is empty.
          </p>
          <button
            onClick={() => navigate('/products')}
            style={{
              padding: '18px 48px', backgroundColor: '#191919', color: '#fff',
              border: 'none', cursor: 'pointer', fontFamily: 'Inter',
              fontSize: '12px', textTransform: 'uppercase', letterSpacing: '3px'
            }}
          >
            Continue Browsing
          </button>
        </div>
      </main>
    </div>
  )

  // 有商品的购物车
  return (
    <div style={{ backgroundColor: '#f6f5f1', minHeight: '100vh' }}>
      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '56px' }}>

        <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>

          {/* 左边：商品列表 */}
          <div style={{ flex: 1 }}>
            <header style={{ marginBottom: '40px' }}>
              <span style={{
                fontFamily: 'Inter', fontSize: '12px', letterSpacing: '2px',
                textTransform: 'uppercase', color: '#6e6a63',
                display: 'block', marginBottom: '8px'
              }}>
                Review Your Order
              </span>
              <h1 style={{
                fontFamily: 'Newsreader, serif', fontSize: '60px',
                fontStyle: 'italic', fontWeight: 500, color: '#2f2c29', margin: 0
              }}>
                Your Selection
              </h1>
            </header>

            {cartItems.map(item => (
              <div key={item.cart_item_id} style={{
                display: 'flex', gap: '32px',
                padding: '32px 0', borderTop: '1px solid #d8d2c6'
              }}>

                {/* 商品图片 */}
                <div style={{
                  width: '192px', height: '256px',
                  backgroundColor: '#efe8dc', flexShrink: 0
                }}>
                  {item.image_url && (
                    <img
                      src={item.image_url} alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </div>

                {/* 商品信息 */}
                <div style={{
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'space-between', flex: 1
                }}>
                  <div>
                    {/* 名字和价格 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <h3 style={{
                        fontFamily: 'Newsreader, serif', fontSize: '24px',
                        fontWeight: 500, color: '#2f2c29', margin: 0
                      }}>
                        {item.name}
                      </h3>
                      <span style={{ fontFamily: 'Inter', fontSize: '18px', color: '#2f2c29' }}>
                        ${item.price.toFixed(2)}
                      </span>
                    </div>

                    {/* 描述 */}
                    {item.description && (
                      <p style={{
                        fontFamily: 'Inter', fontSize: '15px',
                        fontStyle: 'italic', color: '#6e6a63', margin: 0
                      }}>
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* 数量控制 + 删除 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      border: '1px solid #d8d2c6', height: '40px'
                    }}>
                      <button
                        onClick={() => handleQuantityChange(item.cart_item_id, item.quantity - 1)}
                        style={{
                          width: '40px', height: '100%', background: 'none',
                          border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>remove</span>
                      </button>
                      <span style={{
                        width: '48px', textAlign: 'center',
                        fontFamily: 'Inter', fontSize: '15px'
                      }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.cart_item_id, item.quantity + 1)}
                        style={{
                          width: '40px', height: '100%', background: 'none',
                          border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item.cart_item_id)}
                      style={{
                        background: 'none', border: 'none',
                        color: '#9c3d2b', cursor: 'pointer',
                        fontFamily: 'Inter', fontSize: '11px',
                        textTransform: 'uppercase', letterSpacing: '2px',
                        borderBottom: '1px solid #9c3d2b', paddingBottom: '2px'
                      }}
                    >
                      Remove Item
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div style={{ borderTop: '1px solid #d8d2c6', paddingTop: '32px' }} />
          </div>

          {/* 右边：订单摘要 */}
          <aside style={{ width: '384px', flexShrink: 0 }}>
            <div style={{
              backgroundColor: '#f1eee6', border: '1px solid #d8d2c6',
              padding: '32px', position: 'sticky', top: '32px'
            }}>
              <h2 style={{
                fontFamily: 'Newsreader, serif', fontSize: '24px',
                fontStyle: 'italic', marginBottom: '32px', marginTop: 0, color: '#2f2c29'
              }}>
                Summary
              </h2>

              {/* 小计 */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                marginBottom: '16px', paddingBottom: '16px',
                borderBottom: '1px solid rgba(216,210,198,0.5)'
              }}>
                <span style={{ fontFamily: 'Inter', fontSize: '15px', color: '#6e6a63' }}>Subtotal</span>
                <span style={{ fontFamily: 'Inter', fontSize: '18px', color: '#2f2c29' }}>${total.toFixed(2)}</span>
              </div>

              {/* 运费 */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                marginBottom: '16px', paddingBottom: '16px',
                borderBottom: '1px solid rgba(216,210,198,0.5)'
              }}>
                <span style={{ fontFamily: 'Inter', fontSize: '15px', color: '#6e6a63' }}>Shipping</span>
                <span style={{ fontFamily: 'Inter', fontSize: '15px', color: '#b07a47' }}>
                  Calculated at checkout
                </span>
              </div>

              {/* Tax Estimate */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                marginBottom: '16px', paddingBottom: '16px',
                borderBottom: '1px solid rgba(216,210,198,0.5)'
              }}>
                <span style={{ fontFamily: 'Inter', fontSize: '15px', color: '#6e6a63' }}>Tax Estimate</span>
                <span style={{ fontFamily: 'Inter', fontSize: '18px', color: '#2f2c29' }}>
                  ${(total * 0.08).toFixed(2)}
                </span>
              </div>

              {/* 总计 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px' }}>
                <span style={{
                  fontFamily: 'Inter', fontSize: '12px',
                  textTransform: 'uppercase', letterSpacing: '2px', color: '#2f2c29', fontWeight: 'bold'
                }}>
                  Total
                </span>
                <span style={{
                  fontFamily: 'Newsreader, serif', fontSize: '28px',
                  fontStyle: 'italic', color: '#2f2c29'
                }}>
                  ${(total * 1.08).toFixed(2)}
                </span>
              </div>

              {/* 按钮 */}
              <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button
                  onClick={() => navigate('/checkout')}
                  style={{
                    width: '100%', padding: '20px',
                    backgroundColor: '#191919', color: '#ffffff',
                    border: 'none', cursor: 'pointer',
                    fontFamily: 'Inter', fontSize: '12px',
                    textTransform: 'uppercase', letterSpacing: '3px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}
                >
                  Proceed to Checkout
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                </button>

                <button
                  onClick={() => navigate('/products')}
                  style={{
                    width: '100%', padding: '20px',
                    backgroundColor: 'transparent', color: '#191919',
                    border: '1px solid #191919', cursor: 'pointer',
                    fontFamily: 'Inter', fontSize: '12px',
                    textTransform: 'uppercase', letterSpacing: '3px'
                  }}
                >
                  Continue Browsing
                </button>
              </div>

              {/* 安全提示 */}
              <div style={{ marginTop: '32px', display: 'flex', gap: '12px', color: '#6e6a63', alignItems: 'flex-start' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', flexShrink: 0 }}>lock</span>
                <p style={{ fontFamily: 'Inter', fontSize: '12px', lineHeight: '1.6', margin: 0 }}>
                  Secure transaction powered by Alchemy Vault™ encryption protocol.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default Cart