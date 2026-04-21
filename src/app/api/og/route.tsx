import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    // Parse params
    const name = searchParams.get('name') || 'Premium Space'
    const subscribers = searchParams.get('subscribers') || '0'
    const imageUrl = searchParams.get('image') || ''

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a', // slate-950
            padding: '40px 80px',
          }}
        >
          {/* Main Card Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'white',
              borderRadius: '48px',
              padding: '60px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Space Image / Avatar */}
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                style={{
                  width: '280px',
                  height: '280px',
                  borderRadius: '40px',
                  objectFit: 'cover',
                  marginRight: '60px',
                }}
              />
            ) : (
              <div
                style={{
                  width: '280px',
                  height: '280px',
                  borderRadius: '40px',
                  backgroundColor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '60px',
                }}
              >
                <div style={{ fontSize: '100px' }}>🚀</div>
              </div>
            )}

            {/* Content Section */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
              }}
            >
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3em',
                  color: '#5b76fe', // primary
                  marginBottom: '16px',
                }}
              >
                Verified Space
              </div>
              <div
                style={{
                  fontSize: '72px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  lineHeight: '1.1',
                  marginBottom: '24px',
                  overflow: 'hidden',
                  maxHeight: '160px', // Roughly 2 lines
                }}
              >
                {name}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#059669', // emerald-600
                  }}
                >
                  {Number(subscribers).toLocaleString()} members
                </div>
                <div
                  style={{
                    fontSize: '28px',
                    color: '#64748b',
                    marginLeft: '8px',
                  }}
                >
                  already inside
                </div>
              </div>
            </div>
          </div>

          {/* Footer Branding */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '40px',
              fontSize: '24px',
              color: 'rgba(255, 255, 255, 0.4)',
              fontWeight: 'bold',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            Subora Spaces • The Signal Layer for Telegram
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.error(`Status 500: Failed to generate OG image - ${e.message}`)
    return new Response(`Failed to generate image`, { status: 500 })
  }
}
