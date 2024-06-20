import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("aaa")

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('req.body:', req.body);

  const { nome, idade, turma, professorId } = req.body;

  try {
    const aluno = await prisma.aluno.create({
      data: {
        nome,
        idade,
        turma,
        professor: {
          connect: {
            id: professorId,
          },
        },
      },
    });

    return res.status(201).json({ message: 'Aluno cadastrado com sucesso!' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor', message: error.message, stack: error.stack });
  }
}