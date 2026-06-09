import React from 'react'

const APP_LOGO_SRC = `${(import.meta as unknown as { env: { BASE_URL: string } }).env.BASE_URL}app-logo.png`

export function KiroBitLogo({ variant = "primary", size = "lg" }: { variant?: "primary" | "icon" | "minimal"; size?: "xs" | "sm" | "md" | "lg" }) {
  const sizes = {
    xs: { container: 28, icon: 28 },
    sm: { container: 80, icon: 60 },
    md: { container: 120, icon: 90 },
    lg: { container: 160, icon: 120 }
  };

  const { container, icon } = sizes[size];

  if (variant === "icon") {
    return (
      <img
        src={APP_LOGO_SRC}
        width={icon}
        height={icon}
        alt=""
        aria-hidden
        className="block shrink-0 select-none rounded-lg"
        draggable={false}
      />
    );
  }

  if (variant === "minimal") {
    return (
      <img
        src={APP_LOGO_SRC}
        width={icon}
        height={icon}
        alt=""
        aria-hidden
        className="block shrink-0 select-none rounded-md"
        draggable={false}
      />
    )
  }

  return (
    <img
      src={APP_LOGO_SRC}
      width={container}
      height={container}
      alt="KiroBit"
      className="block shrink-0 select-none rounded-xl"
      draggable={false}
    />
  );
}
