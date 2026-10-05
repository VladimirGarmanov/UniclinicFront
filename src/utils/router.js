import React from 'react';
import { Link as RouterLink, NavLink as RouterNavLink } from 'react-router-dom';
import { normalizeUrl, unavailable } from '../config/urls';
export * from 'react-router-dom';
export function Link({ to, children, reloadDocument, ...props }) {
  const normalized = typeof to === 'string' ? normalizeUrl(to) : to;
  if (unavailable.has(normalized)) return <span className={props.className} style={props.style}>{children}</span>;
  return <RouterLink reloadDocument to={normalized} {...props}>{children}</RouterLink>;
}
export function NavLink({ to, ...props }) {
  return <RouterNavLink {...props} reloadDocument to={typeof to === 'string' ? normalizeUrl(to) : to} />;
}
