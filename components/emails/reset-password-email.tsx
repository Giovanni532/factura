import React from 'react';

interface ResetPasswordEmailProps {
  userName: string;
  resetPasswordUrl: string;
  subject?: string;
}

export const ResetPasswordEmail: React.FC<ResetPasswordEmailProps> = ({
  userName,
  resetPasswordUrl,
}) => {
  return (
    <>
      <h1>Réinitialisation de votre mot de passe</h1>
      <p>Bonjour {userName},</p>
      <p>
        Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Factura. 
        Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.
      </p>
      <p>
        Pour réinitialiser votre mot de passe, cliquez sur le bouton ci-dessous :
      </p>
      <a href={resetPasswordUrl} className="button">
        Réinitialiser mon mot de passe
      </a>
      <p>
        Si le bouton ne fonctionne pas, vous pouvez copier et coller le lien suivant dans votre navigateur :
      </p>
      <p>{resetPasswordUrl}</p>
      <p>
        Ce lien expirera dans 1 heure. Si vous n'avez pas demandé la réinitialisation de votre mot de passe, 
        vous pouvez ignorer cet email.
      </p>
      <div className="footer">
        <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
      </div>
    </>
  );
}; 