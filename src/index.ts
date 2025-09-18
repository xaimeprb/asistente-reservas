import { createServer } from './server';
import { authRouter } from './authRouter';
import "./jobs/reminders";

const PORT = process.env['PORT'] || 8080;
const app = createServer();

app.use('/api/auth', authRouter);

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
