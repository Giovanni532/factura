import { auth } from '@/lib/auth';
import { authClient } from '@/lib/auth-client';
import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // Clear existing data
    await prisma.payment.deleteMany({});
    await prisma.invoiceItem.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.quoteItem.deleteMany({});
    await prisma.quote.deleteMany({});
    await prisma.item.deleteMany({});
    await prisma.client.deleteMany({});
    await prisma.business.deleteMany({});
    await prisma.subscription.deleteMany({});

    // Create test users
    const testUsers = [
        { email: 'test@test.ch' },
        { email: 'testt@test.ch' }
    ];

    for (const userData of testUsers) {
        // Hash the password

        const user = await prisma.user.findUnique({
            where: {
                email: userData.email
            }
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Create business for user
        const business = await prisma.business.create({
            data: {
                name: `Business of ${userData.email}`,
                address: '123 Business St',
                userId: user.id,
            }
        });

        // Create clients (male and female)
        const clients = await Promise.all([
            prisma.client.create({
                data: {
                    name: 'Jane Doe',
                    email: `jane.doe.${userData.email.split('@')[0]}@example.com`,
                    phone: '+41 79 123 45 67',
                    company: 'ABC Corp',
                    address: '123 Female St',
                    userId: user.id,
                }
            }),
            prisma.client.create({
                data: {
                    name: 'John Doe',
                    email: `john.doe.${userData.email.split('@')[0]}@example.com`,
                    phone: '+41 79 765 43 21',
                    company: 'XYZ Ltd',
                    address: '456 Male St',
                    userId: user.id,
                }
            })
        ]);

        // Create items
        const items = await Promise.all([
            prisma.item.create({
                data: {
                    name: 'Web Development',
                    description: 'Full stack web development services',
                    unitPrice: 120.00,
                    userId: user.id,
                }
            }),
            prisma.item.create({
                data: {
                    name: 'UI/UX Design',
                    description: 'User interface and experience design',
                    unitPrice: 95.00,
                    userId: user.id,
                }
            })
        ]);

        // Create subscription
        await prisma.subscription.create({
            data: {
                userId: user.id,
                plan: 'FREE',
                status: 'ACTIVE',
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            }
        });

        // Create quotes and invoices for each client
        for (const client of clients) {
            // Create quotes
            const quote = await prisma.quote.create({
                data: {
                    clientId: client.id,
                    userId: user.id,
                    status: 'SENT',
                    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                    quoteItems: {
                        create: [
                            {
                                itemId: items[0].id,
                                quantity: 10,
                                unitPrice: items[0].unitPrice,
                            },
                            {
                                itemId: items[1].id,
                                quantity: 5,
                                unitPrice: items[1].unitPrice,
                            }
                        ]
                    },
                    total: (10 * items[0].unitPrice) + (5 * items[1].unitPrice),
                },
                include: {
                    quoteItems: true,
                }
            });

            // Create invoice
            const invoice = await prisma.invoice.create({
                data: {
                    clientId: client.id,
                    userId: user.id,
                    status: 'PENDING',
                    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
                    invoiceItems: {
                        create: [
                            {
                                itemId: items[0].id,
                                quantity: 8,
                                unitPrice: items[0].unitPrice,
                            },
                            {
                                itemId: items[1].id,
                                quantity: 4,
                                unitPrice: items[1].unitPrice,
                            }
                        ]
                    },
                    total: (8 * items[0].unitPrice) + (4 * items[1].unitPrice),
                },
                include: {
                    invoiceItems: true,
                }
            });

            // Create a payment for one of the invoices (only for the first client)
            if (client.id === clients[0].id) {
                await prisma.payment.create({
                    data: {
                        amount: (8 * items[0].unitPrice) + (4 * items[1].unitPrice) / 2, // Pay half of the invoice
                        invoiceId: invoice.id,
                        userId: user.id,
                        method: 'Credit Card',
                    }
                });
            }
        }
    }

    console.log('Database has been seeded successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 