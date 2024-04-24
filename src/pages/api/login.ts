
import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

interface LoginBody {
    email: string;
    password: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { email, password } = req.body as LoginBody;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // aq vai ser validado no banco

    const token = jwt.sign({ email }, '97dc3f2852a79202f397d1714672f181fadf5b1a', { expiresIn: '1h' });

    res.status(200).json({ message: 'Login bem-sucedido!', token });
}
