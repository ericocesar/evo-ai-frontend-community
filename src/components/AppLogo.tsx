import type { CSSProperties } from 'react';

interface AppLogoProps {
  className?: string;
  alt?: string;
  src?: string;
  style?: CSSProperties;
  forceTheme?: 'dark' | 'light';
}

export function AppLogo({ className, alt = 'BChat CRM', src, style }: AppLogoProps) {
  return (
    <img
      src={src ?? `${import.meta.env.BASE_URL}logo.svg`}
      alt={alt}
      className={className}
      style={style}
    />
  );
}
