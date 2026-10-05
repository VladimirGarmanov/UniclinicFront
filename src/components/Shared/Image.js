import React from 'react';
import { imageProps } from '../../utils/images';
export default function Image({ src, alt = '', loading, sizes, ...props }) {
  return <img {...imageProps(src, { loading, sizes })} {...props} alt={alt} />;
}
