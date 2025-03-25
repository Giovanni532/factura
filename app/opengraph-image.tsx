import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Your Site Name'
export const size = { width: 1200, height: 630 }

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(to bottom, #000000, #111111)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                    color: 'white',
                    textAlign: 'center',
                    padding: '40px',
                }}
            >
                <div
                    style={{
                        fontSize: 60,
                        fontWeight: 'bold',
                        marginBottom: 20,
                    }}
                >
                    Your Site Name
                </div>
                <div
                    style={{
                        fontSize: 30,
                        maxWidth: '70%',
                    }}
                >
                    Your site tagline or brief description goes here
                </div>
            </div>
        )
    )
} 