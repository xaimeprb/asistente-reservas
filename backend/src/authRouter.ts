import { Router } from 'express';
import { UserService } from './services/userService';
import { AuthService } from './services/authService';
import { TenantService } from './services/tenants';

export const authRouter = Router();

// Registro de admin en un tenant (con tenantId o tenantSlug)
authRouter.post('/register', async (req, res) => {
  const { email, password, tenantId, tenantSlug } = req.body;

  let tenant = null;
  if (tenantId) {
    tenant = await TenantService.getById(tenantId);
  } else if (tenantSlug) {
    tenant = await TenantService.getBySlug(tenantSlug);
  }

  if (!tenant) {
    return res.status(400).json({ error: 'Tenant no válido' });
  }

  const user = await UserService.create(email, password, tenant.id, 'ADMIN');
  return res.json({ ok: true, user });
});

// Login con cookie + token en respuesta
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await UserService.findByEmail(email);

  if (!user || !(await UserService.validatePassword(user, password))) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = AuthService.generateToken(user);

  // Guardar cookie segura
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
  });

  // Devolver también el token en JSON
  return res.json({ ok: true, message: 'Login correcto', token });
});

// Logout (borra cookie)
authRouter.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ ok: true, message: 'Logout correcto' });
});
