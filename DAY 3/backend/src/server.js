import 'dotenv/config';
import { app } from './app.js';
const port = Number(process.env.PORT || 4000);
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.startsWith('REPLACE_WITH_')) throw new Error('Set a unique JWT_SECRET of at least 32 characters in backend/.env before starting the API.');
app.listen(port, () => console.log(`FreshNest API listening on http://localhost:${port}`));
