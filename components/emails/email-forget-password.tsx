import * as React from 'react';

interface EmailForgetPasswordProps {
  userName: string;
  resetLink: string;
}

export const EmailForgetPassword: React.FC<Readonly<EmailForgetPasswordProps>> = ({
  userName,
  resetLink,
}) => (
  <div style={{
    fontFamily: 'system-ui, -apple-system, sans-serif',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '10px',
  }}>
    <h1 style={{ color: '#333', marginBottom: '24px' }}>Réinitialisation de mot de passe</h1>
    <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#555' }}>
      Bonjour {userName || 'utilisateur'},
    </p>
    <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#555' }}>
      Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte.
      Veuillez cliquer sur le lien ci-dessous pour définir un nouveau mot de passe:
    </p>
    <div style={{ margin: '32px 0' }}>
      <a
        href={resetLink}
        style={{
          backgroundColor: '#0070f3',
          color: 'white',
          padding: '12px 24px',
          textDecoration: 'none',
          borderRadius: '5px',
          fontWeight: 'bold',
          display: 'inline-block'
        }}
      >
        Réinitialiser mon mot de passe
      </a>
    </div>
    <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#555' }}>
      Si vous n&apos;avez pas demandé cette réinitialisation, veuillez ignorer cet email.
    </p>
    <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#555', marginTop: '32px' }}>
      Ce lien expirera dans 1 heure pour des raisons de sécurité.
    </p>
    <div style={{ marginTop: '32px', fontSize: '14px', color: '#999', borderTop: '1px solid #eee', paddingTop: '16px' }}>
      © {new Date().getFullYear()} Factura. Tous droits réservés.
    </div>
  </div>
);

export default EmailForgetPassword;
