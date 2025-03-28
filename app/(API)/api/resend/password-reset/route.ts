import { Resend } from 'resend';
import EmailForgetPassword from '@/components/emails/email-forget-password';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, url } = body;

    if (!email || !url) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Factura <onboarding@mail.giovannisalcuni.dev>',
      to: [email],
      subject: 'Réinitialisation de votre mot de passe',
      react: EmailForgetPassword({ userName: name || email.split('@')[0], resetLink: url }),
    });

    if (error) {
      console.error('Error sending email:', error);
      return Response.json({ error }, { status: 500 });
    }

    return Response.json({ success: true, data });
  } catch (error) {
    console.error('Error in password reset API route:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
} 