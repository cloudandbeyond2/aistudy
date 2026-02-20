import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const CookiePopup = () => {
  const [show, setShow] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");

    const isAdmin = location.pathname.startsWith("/admin");
    const isDashboard = location.pathname.startsWith("/dashboard");

    if (!consent && !isAdmin && !isDashboard) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [location.pathname]);

  const acceptAll = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setShow(false);
  };

  const rejectAll = () => {
    localStorage.setItem("cookieConsent", "rejected");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 px-4">
      <div className="bg-zinc-900 text-white max-w-sm w-full rounded-2xl p-6 shadow-2xl border border-zinc-700">
        <h2 className="text-lg font-semibold mb-3">
          Cookie Settings
        </h2>

        <p className="text-sm text-zinc-300 leading-relaxed mb-5">
          We use cookies to improve your experience. Read our{" "}
          <Link
            to="/privacy-policy"
            className="underline text-blue-400 hover:text-blue-300"
          >
            Cookie Policy
          </Link>.
        </p>

        <div className="flex gap-3">
          <button
            onClick={rejectAll}
            className="flex-1 border border-zinc-600 py-2 rounded-xl hover:bg-zinc-800 transition"
          >
            Reject
          </button>

          <button
            onClick={acceptAll}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl transition"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookiePopup;
