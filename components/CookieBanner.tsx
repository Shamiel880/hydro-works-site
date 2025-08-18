"use client";

import { useEffect, useState } from "react";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = document.cookie.includes("hydroworks-consent=true");
    if (!consent) setShow(true);
  }, []);

  const acceptCookies = () => {
    document.cookie =
      "hydroworks-consent=true; path=/; max-age=" + 60 * 60 * 24 * 150; // 150 days
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-hydro-green text-hydro-white p-4 flex flex-col md:flex-row justify-between items-center z-50 shadow-lg">
      <span className="mb-2 md:mb-0 text-center md:text-left">
        We use cookies to improve your experience on Hydro Works.
      </span>
      <button
        onClick={acceptCookies}
        className="bg-hydro-onyx text-hydro-white px-4 py-2 rounded-md hover:bg-black transition"
      >
        Accept
      </button>
    </div>
  );
}
