'use client'

import { useState } from 'react'

export function SpaceCoverImage({ src, alt, className }: { src: string, alt: string, className: string }) {
  const [imgSrc, setImgSrc] = useState(src || 'https://images.unsplash.com/photo-1522071823991-b5ae72643156?w=1000&q=80')

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => {
        setImgSrc('https://images.unsplash.com/photo-1522071823991-b5ae72643156?w=1000&q=80')
      }}
    />
  )
}
