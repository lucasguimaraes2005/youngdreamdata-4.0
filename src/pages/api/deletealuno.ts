import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../database';

interface DeleteAlunoRequest {
  id: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method!== 'DELETE') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const queryId = req.query.id;
  const id = parseInt(queryId as string, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID do aluno é obrigatório' });
  }

  const alunoRequest: DeleteAlunoRequest = { id };

  const aluno = await prisma.aluno.findUnique({ where: { id } });

  if (!aluno) {
    return res.status(404).json({ error: 'Aluno não encontrado' });
  }

  await prisma.aluno.delete({ where: { id } });

  res.status(200).json({ message: 'Aluno deletado com sucesso' });
}