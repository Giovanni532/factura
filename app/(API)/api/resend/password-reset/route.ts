import { Resend } from 'resend';
import EmailForgetPassword from '@/components/emails/email-forget-password';
import { prisma } from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, url } = body;

    if (!email || !url) {
      return Response.json({ error: 'Email ou URL manquant' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      console.log(`Tentative de réinitialisation de mot de passe pour un compte inexistant: ${email}`);
      return Response.json({ success: true });
    }

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Factura <onboarding@mail.giovannisalcuni.dev>',
      to: [email],
      subject: 'Réinitialisation de votre mot de passe',
      react: await EmailForgetPassword({ userName: name || user.name || email.split('@')[0], resetLink: url }),
    });

    if (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      return Response.json({ error }, { status: 500 });
    }

    return Response.json({ success: true, data });
  } catch (error) {
    console.error('Erreur dans la route API de réinitialisation de mot de passe:', error);
    return Response.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
} 