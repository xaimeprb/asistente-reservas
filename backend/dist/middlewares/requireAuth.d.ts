import { Request, Response, NextFunction } from 'express';
export declare function requireAuth(roles?: string[]): (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
//# sourceMappingURL=requireAuth.d.ts.map