import { useLocation, useNavigate } from 'react-router-dom'

const PaymentSuccess = () => {
  const { state } = useLocation()
  const navigate = useNavigate()

  const order = state?.order
  const cartItems = state?.cartItems || []

  if (!order) {
    return (
      <div style={{ padding: '56px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Inter', color: '#6e6a63', marginBottom: '24px' }}>
          No order found.
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '16px 32px', backgroundColor: '#191919', color: '#fff',
            border: 'none', cursor: 'pointer', fontFamily: 'Inter',
            fontSize: '12px', textTransform: 'uppercase', letterSpacing: '3px'
          }}
        >
          Go Home
        </button>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#fbfaf6', minHeight: '100vh' }}>
      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '56px' }}>

        {/* 顶部标题 */}
        <header style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span style={{
            fontFamily: 'Inter', fontSize: '12px', letterSpacing: '3px',
            textTransform: 'uppercase', color: '#b07a47',
            display: 'block', marginBottom: '16px'
          }}>
            Transaction Complete
          </span>
          <h1 style={{
            fontFamily: 'Newsreader, serif', fontSize: '60px',
            fontStyle: 'italic', fontWeight: 500,
            color: '#2f2c29', marginBottom: '24px', marginTop: 0
          }}>
            Thank You for Your Patronage
          </h1>
          <p style={{
            fontFamily: 'Inter', fontSize: '18px', color: '#6e6a63',
            maxWidth: '560px', margin: '0 auto', lineHeight: '1.6'
          }}>
            Your selection has been curated and is now being prepared in our laboratory.
            A detailed confirmation has been sent to your digital register.
          </p>
        </header>

        {/* 主内容：左边图片 + 右边详情 */}
        <div style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', gap: '48px', alignItems: 'start' }}>

          {/* 左边：装饰图 + 订单号 */}
          <div style={{ position: 'relative' }}>
            <div style={{
              aspectRatio: '4/5',
              border: '1px solid #d8d2c6',
              overflow: 'hidden'
            }}>
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDL-ARsiQnFkzf67Nih2utAhXWBQtWn7iHNVvx4HpUj2mgUzl8b5K97EYzHMUJOlI9Fdftpc8a9fqU0Q0cvJakLJNF9b6vjNR-8H17acF7kokDYq2-Xg-lzBkbBV203p-JDqh8twg1psQfi6hW-zgjyoW0perx6JYoK756bU81-NEpwrorNlL80Obqypa2-NYqA7v9rPmMyGKJZcwV6p1Fo6-pr1dMH6ah2ROjZ1aO9Q8imDHiaSc8XJr-PMPC9-1LzsltlQrnttvIL"
                alt="Liquid Alchemy"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* 订单号浮层 */}
            <div style={{
              position: 'absolute', bottom: '-24px', right: '-24px',
              backgroundColor: '#191919', color: '#ffffff',
              padding: '24px 32px'
            }}>
              <p style={{
                fontFamily: 'Inter', fontSize: '10px',
                textTransform: 'uppercase', letterSpacing: '2px',
                opacity: 0.6, marginBottom: '4px', marginTop: 0
              }}>
                Batch ID
              </p>
              <p style={{
                fontFamily: 'Inter', fontSize: '20px',
                letterSpacing: '4px', fontWeight: 'bold', margin: 0
              }}>
                #{`LA-${String(order.id).padStart(6, '0')}-X`}
              </p>
            </div>
          </div>

          {/* 右边：订单详情 */}
          <div style={{ paddingLeft: '24px' }}>

            {/* 配送信息 */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px',
              marginBottom: '48px', paddingBottom: '48px',
              borderBottom: '1px solid #d8d2c6'
            }}>
              <div>
                <h4 style={{
                  fontFamily: 'Inter', fontSize: '12px',
                  textTransform: 'uppercase', letterSpacing: '2px',
                  color: '#6e6a63', marginBottom: '16px', marginTop: 0
                }}>
                  Estimated Delivery
                </h4>
                <p style={{
                  fontFamily: 'Newsreader, serif', fontSize: '24px',
                  fontStyle: 'italic', color: '#2f2c29',
                  marginBottom: '8px', marginTop: 0
                }}>
                  {order.shipping_method === 'express' ? 'Tomorrow' : 'Within 3–5 Days'}
                </p>
                <p style={{ fontFamily: 'Inter', fontSize: '15px', color: '#6e6a63', margin: 0 }}>
                  {order.shipping_method === 'express'
                    ? 'Via Express Alchemy Courier'
                    : 'Via Standard Laboratory Logistics'}
                </p>
              </div>
              <div>
                <h4 style={{
                  fontFamily: 'Inter', fontSize: '12px',
                  textTransform: 'uppercase', letterSpacing: '2px',
                  color: '#6e6a63', marginBottom: '16px', marginTop: 0
                }}>
                  Shipping To
                </h4>
                <p style={{ fontFamily: 'Inter', fontSize: '18px', color: '#2f2c29', marginBottom: '4px', marginTop: 0 }}>
                  {order.shipping_name}
                </p>
                <p style={{ fontFamily: 'Inter', fontSize: '15px', color: '#6e6a63', margin: 0 }}>
                  {order.shipping_address}
                </p>
              </div>
            </div>

            {/* 商品列表 */}
            <h4 style={{
              fontFamily: 'Inter', fontSize: '12px',
              textTransform: 'uppercase', letterSpacing: '2px',
              color: '#6e6a63', marginBottom: '24px', marginTop: 0
            }}>
              Purchase Summary
            </h4>

            {cartItems.map(item => (
              <div key={item.cart_item_id} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', paddingBottom: '16px',
                marginBottom: '16px', borderBottom: '1px solid rgba(216,210,198,0.3)'
              }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: '#d8d2c6', flexShrink: 0 }}>
                    {item.image_url && (
                      <img src={item.image_url} alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Newsreader, serif', fontSize: '18px', color: '#2f2c29', margin: '0 0 4px' }}>
                      {item.name}
                    </p>
                    <p style={{ fontFamily: 'Inter', fontSize: '13px', color: '#6e6a63', margin: 0 }}>
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <p style={{ fontFamily: 'Inter', fontSize: '18px', color: '#2f2c29', margin: 0 }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}

            {/* 金额汇总 */}
            <div style={{ paddingTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontFamily: 'Inter', fontSize: '15px', color: '#6e6a63' }}>Subtotal</span>
                <span style={{ fontFamily: 'Inter', fontSize: '15px', color: '#2f2c29' }}>${order.subtotal?.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontFamily: 'Inter', fontSize: '15px', color: '#6e6a63' }}>Laboratory Processing</span>
                <span style={{ fontFamily: 'Inter', fontSize: '15px', color: '#2f2c29' }}>${order.shipping_cost?.toFixed(2)}</span>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingTop: '16px', borderTop: '1px solid #d8d2c6',
                marginBottom: '48px'
              }}>
                <span style={{ fontFamily: 'Newsreader, serif', fontSize: '28px', color: '#2f2c29' }}>Total</span>
                <span style={{ fontFamily: 'Newsreader, serif', fontSize: '28px', fontWeight: 'bold', color: '#2f2c29' }}>
                  ${order.total_price?.toFixed(2)}
                </span>
              </div>
            </div>

            {/* 按钮 */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={() => navigate('/account')}
                style={{
                  flex: 1, padding: '20px',
                  backgroundColor: '#191919', color: '#ffffff',
                  border: 'none', cursor: 'pointer',
                  fontFamily: 'Inter', fontSize: '12px',
                  textTransform: 'uppercase', letterSpacing: '3px'
                }}
              >
                Track Shipment
              </button>
              <button
                onClick={() => navigate('/products')}
                style={{
                  flex: 1, padding: '20px',
                  backgroundColor: 'transparent', color: '#191919',
                  border: '1px solid #191919', cursor: 'pointer',
                  fontFamily: 'Inter', fontSize: '12px',
                  textTransform: 'uppercase', letterSpacing: '3px'
                }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default PaymentSuccess