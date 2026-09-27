import { prisma } from '../lib/prisma';

interface NotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: 'APPLICATION' | 'VERIFICATION' | 'CERTIFICATE' | 'EXPIRY' | 'SYSTEM';
  link?: string;
}

export async function createNotification({
  userId,
  title,
  message,
  type = 'SYSTEM',
  link,
}: NotificationParams): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link,
        isRead: false,
      },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

export async function notifyAdmins(title: string, message: string, link?: string): Promise<void> {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN', status: 'APPROVED' },
      select: { id: true },
    });

    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        title,
        message,
        type: 'SYSTEM',
        link,
      });
    }
  } catch (error) {
    console.error('Failed to notify admins:', error);
  }
}
