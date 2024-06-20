import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../database';

interface AlunoBody {
  nome: string;
  idade: number;
  turma: string;
  professorId: number;
  professor: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { nome, idade, turma, professorId, professor }: AlunoBody = req.body;

  try {
    await prisma.aluno.create({
      data: {
        nome,
        idade,
        turma,
        professorId,
        professor,
      },
    });

    res.status(201).json({ message: 'Aluno cadastrado com sucesso!' });
  } catch (error) {
    console.error('Erro ao cadastrar aluno:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}
