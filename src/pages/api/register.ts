import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../database';

interface RegisterBody {
  nome: string;
  email: string;
  senha: string;
  instituicao: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { nome, email, senha, instituicao }: RegisterBody = req.body;

  if (!nome || !email || !senha || !instituicao) {
    return res.status(400).json({ error: 'Preencha todos os campos!' });
  }

  const existingUser = await prisma.professor.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(400).json({ error: 'E-mail já cadastrado!' });
  }

  const hashedPassword = await bcrypt.hash(senha, 10);

  const createdProfessor = await prisma.professor.create({
    data: {
      nome,
      email,
      senha: hashedPassword,
      instituicao,
    },
  });

  const token = jwt.sign({ email }, '97dc3f2852a79202f397d1714672f181fadf5b1a', { expiresIn: '1h' });

  res.status(201).json({ message: 'Registro realizado com sucesso!', token, professor: createdProfessor });
}
