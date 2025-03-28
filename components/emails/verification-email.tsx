import React from 'react';

interface VerificationEmailProps {
  userName: string;
  verificationUrl: string;
  subject?: string;
}

export const VerificationEmail: React.FC<VerificationEmailProps> = ({
  userName,
  verificationUrl,
}) => {
  return (
    <>
      <h1>Vérification de votre adresse email</h1>
      <p>Bonjour {userName},</p>
      <p>
        Merci de vous être inscrit sur Factura. Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :
      </p>
      <a href={verificationUrl} className="button">
        Vérifier mon email
      </a>
      <p>
        Si le bouton ne fonctionne pas, vous pouvez copier et coller le lien suivant dans votre navigateur :
      </p>
      <p>{verificationUrl}</p>
      <p>
        Ce lien expirera dans 24 heures. Si vous n'avez pas créé de compte sur Factura, vous pouvez ignorer cet email.
      </p>
      <div className="footer">
        <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
      </div>
    </>
  );
}; 