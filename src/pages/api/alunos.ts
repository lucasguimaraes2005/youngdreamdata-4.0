import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../database';

interface AlunosResponse {
  alunos: {
    id: number;
    nome: string;
    idade: number;
    turma: string;
    faceData?: string;
  }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const alunos = await prisma.aluno.findMany();

  if (!alunos) {
    return res.status(404).json({ error: 'Nenhum aluno encontrado' });
  }

  res.status(200).json({ alunos });
}