import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchCart, createOrder } from '../services/api'
import { getCurrentUser } from '../utils/auth'

const Checkout = () => {
  const [cartItems, setCartItems] = useState([])
  const [shipping, setShipping] = useState('standard')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    firstName: '', lastName: '', address: '',
    city: '', postalCode: '', cardNumber: '', expiry: '', cvv: ''
  })

  const navigate = useNavigate()
  const currentUser = getCurrentUser()
  const userId = currentUser?.id

  useEffect(() => {
    if (userId) fetchCart(userId).then(data => setCartItems(data))
  }, [userId])

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = shipping === 'express' ? 24 : 0
  const tax = subtotal * 0.08
  const total = subtotal + shippingCost + tax

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.firstName || !form.address || !form.cardNumber) {
      alert('Please fill in all required fields')
      return
    }

    const cardDigits = form.cardNumber.replace(/\s/g, '')
    if (!/^\d{16}$/.test(cardDigits)) {
      alert('Card number must be 16 digits')
      return
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiry)) {
      alert('Expiry date must be in MM/YY format')
      return
    }

    if (!/^\d{3}$/.test(form.cvv)) {
      alert('CVV must be 3 digits')
      return
    }
    
    setSubmitting(true)
    try {
      const order = await createOrder(userId, cartItems, {
        name: `${form.firstName} ${form.lastName}`,
        address: `${form.address}, ${form.city} ${form.postalCode}`,
        method: shipping, subtotal, shippingCost, tax, total
      })
      navigate('/payment-success', { state: { order, cartItems } })
    } catch (err) {
      console.error('Failed to create order:', err)
      alert('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    backgroundColor: 'transparent',
    border: '1px solid #d8d2c6',
    fontFamily: 'Inter', fontSize: '15px', color: '#2f2c29',
    outline: 'none', boxSizing: 'border-box'
  }

  const labelStyle = {
    fontFamily: 'Inter', fontSize: '11px',
    textTransform: 'uppercase', letterSpacing: '2px',
    color: '#6e6a63', display: 'block', marginBottom: '6px'
  }

  const sectionHeadingStyle = {
    fontFamily: 'Newsreader, serif', fontSize: '36px',
    fontWeight: 400, color: '#2f2c29', margin: 0,
  }

  return (
    <div style={{ backgroundColor: '#f6f5f1', minHeight: '100vh' }}>
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 56px' }}>
        <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>

          {/* 左边：表单 */}
          <div style={{ flex: 1 }}>

            {/* 01 Shipping Address */}
            <section style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '24px' }}>
                <span style={{ fontFamily: 'Inter', fontSize: '13px', color: '#6e6a63' }}>01</span>
                <h2 style={sectionHeadingStyle}>Shipping Address</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>First Name</label>
                  <input name="firstName" value={form.firstName} onChange={handleInput} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input name="lastName" value={form.lastName} onChange={handleInput} style={inputStyle} />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Address</label>
                <input name="address" value={form.address} onChange={handleInput} style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>City</label>
                  <input name="city" value={form.city} onChange={handleInput} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Postal Code</label>
                  <input name="postalCode" value={form.postalCode} onChange={handleInput} style={inputStyle} />
                </div>
              </div>
            </section>

            {/* 02 Shipping Method */}
            <section style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '24px' }}>
                <span style={{ fontFamily: 'Inter', fontSize: '13px', color: '#6e6a63' }}>02</span>
                <h2 style={sectionHeadingStyle}>Shipping Method</h2>
              </div>

              <div
                onClick={() => setShipping('standard')}
                style={{
                  padding: '16px 20px', marginBottom: '8px',
                  border: `1px solid ${shipping === 'standard' ? '#2f2c29' : '#d8d2c6'}`,
                  cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{
                    width: '14px', height: '14px', borderRadius: '50%',
                    border: '1px solid #2f2c29',
                    backgroundColor: shipping === 'standard' ? '#2f2c29' : 'transparent',
                    flexShrink: 0
                  }} />
                  <div>
                    <p style={{ fontFamily: 'Inter', fontSize: '15px', margin: 0 }}>Standard Laboratory Logistics</p>
                    <p style={{ fontFamily: 'Inter', fontSize: '13px', color: '#6e6a63', margin: 0, fontStyle: 'italic' }}>3–5 Business Days</p>
                  </div>
                </div>
                <span style={{ fontFamily: 'Inter', fontSize: '15px' }}>$0.00</span>
              </div>

              <div
                onClick={() => setShipping('express')}
                style={{
                  padding: '16px 20px',
                  border: `1px solid ${shipping === 'express' ? '#2f2c29' : '#d8d2c6'}`,
                  cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{
                    width: '14px', height: '14px', borderRadius: '50%',
                    border: '1px solid #2f2c29',
                    backgroundColor: shipping === 'express' ? '#2f2c29' : 'transparent',
                    flexShrink: 0
                  }} />
                  <div>
                    <p style={{ fontFamily: 'Inter', fontSize: '15px', margin: 0 }}>Express Alchemy Courier</p>
                    <p style={{ fontFamily: 'Inter', fontSize: '13px', color: '#6e6a63', margin: 0, fontStyle: 'italic' }}>Next Day Delivery</p>
                  </div>
                </div>
                <span style={{ fontFamily: 'Inter', fontSize: '15px' }}>$24.00</span>
              </div>
            </section>

            {/* 03 Payment Details */}
            <section style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '24px' }}>
                <span style={{ fontFamily: 'Inter', fontSize: '13px', color: '#6e6a63' }}>03</span>
                <h2 style={sectionHeadingStyle}>Payment Details</h2>
              </div>

              <div style={{
                backgroundColor: '#2e2e2e', color: '#efe8dc',
                padding: '24px 28px', marginBottom: '24px'
              }}>
                <p style={{
                  fontFamily: 'Inter', fontSize: '10px',
                  textTransform: 'uppercase', letterSpacing: '3px',
                  opacity: 0.6, marginBottom: '20px', marginTop: 0
                }}>
                  Liquid Alchemy Reserve
                </p>
                <p style={{ fontFamily: 'Inter', fontSize: '18px', letterSpacing: '4px', marginBottom: '20px', marginTop: 0 }}>
                  •••• •••• •••• {form.cardNumber.slice(-4) || '0000'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Inter', fontSize: '13px' }}>
                    {form.firstName ? `${form.firstName.toUpperCase()} ${form.lastName.toUpperCase()}` : 'YOUR NAME'}
                  </span>
                  <span style={{ fontFamily: 'Inter', fontSize: '13px' }}>
                    {form.expiry || 'MM/YY'}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Card Number</label>
                <input
                  name="cardNumber" value={form.cardNumber} onChange={handleInput}
                  placeholder="0000 0000 0000 0000" style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Expiry Date</label>
                  <input
                    name="expiry" value={form.expiry} onChange={handleInput}
                    placeholder="MM/YY" style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>CVV</label>
                  <input
                    name="cvv" value={form.cvv} onChange={handleInput}
                    placeholder="•••" type="password" style={inputStyle}
                  />
                </div>
              </div>
            </section>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                width: '100%', padding: '18px',
                backgroundColor: submitting ? '#6e6a63' : '#191919',
                color: '#ffffff', border: 'none',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter', fontSize: '11px',
                textTransform: 'uppercase', letterSpacing: '3px',
                marginBottom: '16px'
              }}
            >
              {submitting ? 'Processing...' : 'Complete Order & Dispatch'}
            </button>

            <p style={{
              fontFamily: 'Inter', fontSize: '12px',
              color: '#6e6a63', textAlign: 'center', margin: 0
            }}>
              By confirming your order, you agree to our{' '}
              <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Terms of Service</span>
              {' '}and{' '}
              <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>.
            </p>
          </div>

          {/* 右边：订单摘要 */}
          <aside style={{ width: '360px', flexShrink: 0 }}>
            <div style={{
              backgroundColor: '#f1eee6', border: '1px solid #d8d2c6',
              padding: '36px', position: 'sticky', top: '32px'
            }}>
              <h3 style={{
                fontFamily: 'Newsreader, serif', fontSize: '28px',
                fontWeight: 400, marginBottom: '28px', marginTop: 0, color: '#2f2c29'
              }}>
                Order Summary
              </h3>

              {cartItems.map(item => (
                <div key={item.cart_item_id} style={{
                  display: 'flex', gap: '20px', marginBottom: '24px',
                }}>
                  <div style={{
                    width: '100px', height: '100px',
                    border: '1px solid #d8d2c6',
                    flexShrink: 0, overflow: 'hidden'
                  }}>
                    {item.image_url && (
                      <img src={item.image_url} alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Newsreader, serif', fontSize: '20px', color: '#2f2c29', margin: '0 0 4px' }}>{item.name}</p>
                    <p style={{ fontFamily: 'Inter', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#6e6a63', margin: '0 0 8px' }}>QTY: {item.quantity}</p>
                    <p style={{ fontFamily: 'Newsreader, serif', fontSize: '20px', color: '#2f2c29', margin: 0 }}>
                      <span style={{ fontFamily: 'Inter, sans-serif' }}>$</span>{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}

              <div style={{ borderTop: '1px solid #d8d2c6', marginBottom: '20px' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontFamily: 'Inter', fontSize: '15px', color: '#6e6a63' }}>Subtotal</span>
                <span style={{ fontFamily: 'Inter', fontSize: '15px', color: '#2f2c29' }}>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontFamily: 'Inter', fontSize: '15px', color: '#6e6a63' }}>Shipping</span>
                <span style={{ fontFamily: 'Inter', fontSize: '15px', color: '#6e6a63' }}>
                  {shippingCost === 0 ? 'Calculated at next step' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ fontFamily: 'Inter', fontSize: '15px', color: '#6e6a63' }}>Tax (8%)</span>
                <span style={{ fontFamily: 'Inter', fontSize: '15px', color: '#2f2c29' }}>${tax.toFixed(2)}</span>
              </div>

              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingTop: '20px', borderTop: '1px solid #d8d2c6', marginBottom: '28px'
              }}>
                <span style={{ fontFamily: 'Newsreader, serif', fontSize: '32px', color: '#2f2c29' }}>Total</span>
                <span style={{ fontFamily: 'Newsreader, serif', fontSize: '32px', color: '#2f2c29' }}>
                  <span style={{ fontStyle: 'normal', fontFamily: 'Inter, sans-serif' }}>$</span>{total.toFixed(2)}
                </span>
              </div>

              <div style={{ borderTop: '1px solid #d8d2c6', paddingTop: '24px' }}>
                <label style={{
                  fontFamily: 'Inter', fontSize: '11px',
                  textTransform: 'uppercase', letterSpacing: '2px',
                  color: '#6e6a63', display: 'block', marginBottom: '10px'
                }}>
                  Access Code / Promo
                </label>
                <div style={{ display: 'flex' }}>
                  <input
                    placeholder="Enter code"
                    style={{
                      flex: 1, padding: '12px 16px',
                      border: '1px solid #d8d2c6', borderRight: 'none',
                      backgroundColor: '#f6f5f1', fontFamily: 'Inter',
                      fontSize: '13px', textTransform: 'uppercase',
                      letterSpacing: '1px', outline: 'none', color: '#6e6a63'
                    }}
                  />
                  <button style={{
                    padding: '12px 20px', backgroundColor: '#191919',
                    color: '#fff', border: 'none', cursor: 'pointer',
                    fontFamily: 'Inter', fontSize: '11px',
                    textTransform: 'uppercase', letterSpacing: '2px'
                  }}>
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  )
}

export default Checkout