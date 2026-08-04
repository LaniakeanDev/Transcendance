'use client';

import CookieConsent from 'react-cookie-consent';

export default function CookieBanner() {
  return (
    <CookieConsent
      location="bottom"
      buttonText="J'accepte"
      declineButtonText="Refuser"
      enableDeclineButton
      cookieName="transcendance-cookie-consent"
      cookieValue="accepted"
      declineCookieValue="declined"
      expires={150}
      style={{ background: '#2B373B', fontSize: '14px' }}
      buttonStyle={{
        background: '#4CAF50',
        color: 'white',
        fontSize: '13px',
        borderRadius: '4px',
        padding: '8px 16px',
      }}
      declineButtonStyle={{
        background: 'transparent',
        border: '1px solid white',
        color: 'white',
        fontSize: '13px',
        borderRadius: '4px',
        padding: '8px 16px',
      }}
    >
      Ce site utilise des cookies pour améliorer votre expérience.
    </CookieConsent>
  );
}
