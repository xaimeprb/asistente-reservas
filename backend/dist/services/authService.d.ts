import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
export declare const AuthService: {
    generateToken(user: User): string;
    verifyToken(token: string): string | jwt.JwtPayload;
};
//# sourceMappingURL=authService.d.ts.map