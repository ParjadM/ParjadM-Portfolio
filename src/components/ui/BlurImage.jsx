import React, { useState } from 'react';

/**
 * Image with optional tiny blur placeholder (LQIP) that fades out once loaded.
 */
export const BlurImage = ({
  src,
  srcSet,
  sizes,
  alt = '',
  placeholder,
  className = '',
  wrapperClassName = '',
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`}>
      {placeholder && (
        <img
          src={placeholder}
          alt=""
          aria-hidden
          className={`absolute inset-0 w-full h-full object-cover scale-110 blur-lg transition-opacity duration-500 ${loaded ? 'opacity-0' : 'opacity-100'}`}
        />
      )}
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`relative w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : placeholder ? 'opacity-0' : 'opacity-100'} ${className}`}
      />
    </div>
  );
};
