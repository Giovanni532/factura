import { Resend } from 'resend';
import React from 'react';
import { renderEmailToString } from './email-utils';
import { VerificationEmail } from '@/components/emails/verification-email';
import { ResetPasswordEmail } from '@/components/emails/reset-password-email';

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  from?: string;
};

export const emailService = {
  async sendEmail({ to, subject, html, from = 'noreply@mail.giovannisalcuni.dev' }: EmailOptions) {
    try {
      const { data, error } = await resend.emails.send({
        from,
        to,
        subject,
        html,
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }
  },

  async sendVerificationEmail(params: {
    email: string;
    name: string;
    url: string;
  }) {
    const { email, name, url } = params;

    const emailComponent = React.createElement(VerificationEmail, {
      userName: name,
      verificationUrl: url,
      subject: 'Vérification de votre adresse email - Factura'
    });

    const html = renderEmailToString(emailComponent);

    return this.sendEmail({
      to: email,
      subject: 'Vérification de votre adresse email - Factura',
      html,
    });
  },

  async sendResetPasswordEmail(params: {
    email: string;
    name: string;
    url: string;
  }) {
    const { email, name, url } = params;

    const emailComponent = React.createElement(ResetPasswordEmail, {
      userName: name,
      resetPasswordUrl: url,
      subject: 'Réinitialisation de votre mot de passe - Factura'
    });

    const html = renderEmailToString(emailComponent);

    return this.sendEmail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe - Factura',
      html,
    });
  },
}; 