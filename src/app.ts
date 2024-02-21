import express from 'express';
import authRoutes from './routes/authRoutes';
import apiRoutes from './routes/apiRoutes';
import {tokenAuth} from './middleware/auth';

const app = express();

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/api', tokenAuth, apiRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});