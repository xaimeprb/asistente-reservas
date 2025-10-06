import { User } from '@prisma/client';
export declare const UserService: {
    create(email: string, password: string, tenantId: string, role?: "ADMIN" | "SUPERADMIN"): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    validatePassword(user: User, password: string): Promise<boolean>;
};
//# sourceMappingURL=userService.d.ts.map