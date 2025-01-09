"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const adminEmail = 'admin@aianonymizer.com';
    // First, find the existing admin user
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
        include: { subscription: true }
    });
    if (existingAdmin) {
        // Delete subscription first
        if (existingAdmin.subscription) {
            await prisma.subscription.delete({
                where: { id: existingAdmin.subscription.id }
            });
            console.log('Deleted existing subscription');
        }
        // Then delete the user
        await prisma.user.delete({
            where: { id: existingAdmin.id }
        });
        console.log('Deleted existing admin user');
    }
    // Create a new admin user with a simple password
    const hashedPassword = await bcryptjs_1.default.hash('admin123!', 10);
    const admin = await prisma.user.create({
        data: {
            email: adminEmail,
            firstName: 'Admin',
            lastName: 'User',
            password: hashedPassword,
            isAdmin: true,
            subscription: {
                create: {
                    tier: 'PREMIUM',
                    status: 'active',
                    monthlyLimit: 1000000,
                    tokenLimit: 10000000
                }
            }
        },
        include: { subscription: true }
    });
    console.log('Created new admin user:', admin);
    // Verify the password works
    const isValid = await bcryptjs_1.default.compare('admin123!', admin.password);
    console.log('Password verification:', isValid);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
