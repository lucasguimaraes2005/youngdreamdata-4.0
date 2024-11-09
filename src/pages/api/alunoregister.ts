import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function calculateFaceDistance(descriptor1: number[], descriptor2: number[]): number {
  return Math.sqrt(
      descriptor1.reduce((sum, val, i) => sum + Math.pow(val - descriptor2[i], 2), 0)
  );
}

async function checkForSimilarFace(
    faceDescriptor: number[],
    professorId: number,
    threshold: number = 0.5
): Promise<boolean> {
  const alunosExistentes = await prisma.aluno.findMany({
    where: {
      professorId: professorId,
      faceData: { not: null }
    },
    select: {
      faceData: true,
      nome: true
    }
  });

  for (const aluno of alunosExistentes) {
    if (!aluno.faceData) continue;

    const existingDescriptor = JSON.parse(aluno.faceData);
    const distance = calculateFaceDistance(faceDescriptor, existingDescriptor);

    if (distance < threshold) {
      return true;
    }
  }

  return false;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { nome, idade, turma, professorId, faceData } = req.body;

    const faceDescriptor = JSON.parse(faceData);

    const hasSimilarFace = await checkForSimilarFace(faceDescriptor, professorId);

    if (hasSimilarFace) {
      return res.status(400).json({
        error: 'Biometria facial similar já cadastrada',
        message: 'Um aluno com biometria facial muito similar já está cadastrado no sistema.'
      });
    }

    const aluno = await prisma.aluno.create({
      data: {
        nome,
        idade,
        turma,
        faceData,
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
    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
}