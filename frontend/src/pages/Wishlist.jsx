import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchWishlist, removeFromWishlist, addToCart } from '../services/api'

const USER_ID = 1

const Wishlist = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchWishlist(USER_ID)
      .then(data => {
        setItems(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('获取愿望单失败:', err)
        setLoading(false)
      })
  }, [])

  const handleRemove = (id) => {
    removeFromWishlist(id).then(() => {
      setItems(items.filter(item => item.id !== id))
    })
  }

  const handleAddToCart = (item) => {
    addToCart(item.product_id, 1).then(() => {
      alert(`${item.name} added to cart!`)
    })
  }

  if (loading) return (
    <div style={{ padding: '56px', fontFamily: 'Inter' }}>Loading...</div>
  )

  return (
    <div style={{ backgroundColor: '#f6f5f1', minHeight: '100vh' }}>
      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '56px' }}>

        {/* 页面标题 */}
        <header style={{ marginBottom: '48px', paddingBottom: '32px', borderBottom: '1px solid #d8d2c6' }}>
          <span style={{
            fontFamily: 'Inter', fontSize: '12px', letterSpacing: '2px',
            textTransform: 'uppercase', color: '#6e6a63',
            display: 'block', marginBottom: '8px'
          }}>
            Curated Collection
          </span>
          <h1 style={{
            fontFamily: 'Newsreader, serif', fontSize: '48px',
            fontStyle: 'italic', fontWeight: 400,
            color: '#2f2c29', marginBottom: '12px', marginTop: 0
          }}>
            Your Wishlist
          </h1>
          <p style={{
            fontFamily: 'Inter', fontSize: '15px',
            color: '#6e6a63', maxWidth: '480px', margin: 0, lineHeight: '1.6'
          }}>
            A private selection of alchemy and essence, saved for your next
            experimental gathering or solitary indulgence.
          </p>
        </header>

        {/* 空状态 */}
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{
              fontFamily: 'Newsreader, serif', fontSize: '24px',
              fontStyle: 'italic', color: '#6e6a63', marginBottom: '32px'
            }}>
              Your wishlist is empty.
            </p>
            <button
              onClick={() => navigate('/products')}
              style={{
                padding: '16px 32px', backgroundColor: '#191919', color: '#fff',
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
            gap: '24px'
          }}>
            {items.map(item => (
              <div key={item.id}>

                {/* 商品图片：带内边距相框效果 */}
                <div style={{
                  backgroundColor: '#efe8dc',
                  padding: '16px',
                  marginBottom: '16px',
                }}>
                  <div style={{ height: '360px', overflow: 'hidden' }}>
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

                {/* 商品名 + 价格同一行 */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'baseline', marginBottom: '4px'
                }}>
                  <h3 style={{
                    fontFamily: 'Newsreader, serif', fontSize: '20px',
                    fontWeight: 400, color: '#2f2c29', margin: 0
                  }}>
                    {item.name}
                  </h3>
                  <span style={{
                    fontFamily: 'Inter', fontSize: '15px',
                    color: '#2f2c29', flexShrink: 0, marginLeft: '8px'
                  }}>
                    ${item.price?.toFixed(2)}
                  </span>
                </div>

                {/* 分类标签 */}
                {item.category && (
                  <span style={{
                    fontFamily: 'Inter', fontSize: '11px',
                    textTransform: 'uppercase', letterSpacing: '2px',
                    color: '#6e6a63', display: 'block', marginBottom: '16px'
                  }}>
                    {item.category}
                  </span>
                )}

                {/* Add to Cart 黑色实心按钮 */}
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

                {/* Remove 红色文字 */}
                <button
                  onClick={() => handleRemove(item.id)}
                  style={{
                    width: '100%', background: 'none', border: 'none',
                    color: '#9c3d2b', cursor: 'pointer',
                    fontFamily: 'Inter', fontSize: '11px',
                    textTransform: 'uppercase', letterSpacing: '2px',
                    padding: '4px 0'
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Wishlist