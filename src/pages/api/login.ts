import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../database';

interface LoginBody {
  email: string;
  senha: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { email, senha } = req.body as LoginBody;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  const user = await prisma.professor.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({ error: 'Email ou senha inválidos' });
  }

  const isValidPassword = await bcrypt.compare(senha, user.senha);

  if (!isValidPassword) {
    return res.status(401).json({ error: 'Email ou senha inválidos' });
  }


  const professorDetails = {
    id: user.id,
    nome: user.nome,
    email: user.email,
    instituicao: user.instituicao,

  };

  const token = jwt.sign({ email }, '97dc3f2852a79202f397d1714672f181fadf5b1a', { expiresIn: '1h' });

  res.status(200).json({ message: 'Login bem-sucedido!', token, professor: professorDetails });
}
