import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, url } = body;

    if (!userId || !url) {
      return NextResponse.json(
        { error: 'Missing required fields: userId or url' },
        { status: 400 }
      );
    }

    // Récupérer les informations de l'utilisateur depuis la base de données
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const result = await emailService.sendResetPasswordEmail({
      email: user.email,
      name: user.name || 'Utilisateur',
      url,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send reset password email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in /api/emails/reset-password:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 