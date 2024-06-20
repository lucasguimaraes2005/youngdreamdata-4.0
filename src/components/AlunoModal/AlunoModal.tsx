import { useState } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '@radix-ui/react-label';
import { toast } from 'react-toastify';

interface AlunoData {
  nome: string;
  idade: number;
  turma: string;
  professorId: number;
}

const AlunoModal: React.FC = () => {
  const [nome, setNome] = useState('');
  const [nomeError, setNomeError] = useState('');
  const [idade, setIdade] = useState(0);
  const [idadeError, setIdadeError] = useState('');
  const [turma, setTurma] = useState('');
  const [turmaError, setTurmaError] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  const handleCadastroAluno = async () => {
    if (!nome || nome.trim() === '') {
      setNomeError('Campo nome é obrigatório!');
      return;
    }

    if (nome.length > 100) {
      setNomeError('Nome não pode ter mais de 100 caracteres!');
      return;
    }

    if (idade < 5 || idade > 20) {
      setIdadeError('Idade deve ser entre 5 e 20 anos!');
      return;
    }

    if (!turma || turma.trim() === '') {
      setTurmaError('Campo turma é obrigatório!');
      return;
    }

    if (turma.length !== 3) {
      setTurmaError('Turma deve ter exatamente 3 caracteres!');
      return;
    }

    try {
      const professorId = parseInt(localStorage.getItem('professorId') || '0', 10);
      const data: AlunoData = {
        nome,
        idade,
        turma,
        professorId,
      };

      const response = await fetch('/api/alunoregister', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        handleCloseModal();
        toast.success("Aluno cadastrado!")
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (error: any) {
      const errorMessage = `Erro ao cadastrar aluno: ${error.message}`;
      toast.error(errorMessage);
      console.error(errorMessage);
    }
  };

  return (
    <>
      <Button onClick={handleOpenModal} variant="secondary">
        Cadastre um aluno
      </Button>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <Card className="w-[350px] p-6 bg-black border border-gray-800 rounded-lg space-y-4">
            <h2 className="text-xl font-semibold mb-4 text-white">Cadastro de Aluno</h2>
            <form>
              <div className="mb-4">
                <Label htmlFor="nome" className="text-white">
                  Nome
                </Label>
                <Input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do aluno"
                  className="bg-black border border-gray-800 text-white"
                  required
                />
                {nomeError && <p className="text-red-500">{nomeError}</p>}
              </div>
              <div className="mb-4">
                <Label htmlFor="idade" className="text-white">
                  Idade
                </Label>
                <Input
                  id="idade"
                  type="number"
                  value={idade}
                  onChange={(e) => setIdade(parseInt(e.target.value, 10))}
                  placeholder="Idade do aluno"
                  className="bg-black border border-gray-800 text-white"
                  required
                />
                {idadeError && <p className="text-red-500">{idadeError}</p>}
              </div>
              <div className="mb-4">
                <Label htmlFor="turma" className="text-white">
                  Turma
                </Label>
                <Input
                  id="turma"
                  type="text"
                  value={turma}
                  onChange={(e) => setTurma(e.target.value)}
                  placeholder="Turma do aluno"
                  className="bg-black border border-gray-800 text-white"
                  required
                />
                {turmaError && <p className="text-red-500">{turmaError}</p>}
                </div>
              <div className="flex justify-end">
                <Button onClick={handleCadastroAluno} variant="secondary">
                  Cadastrar
                </Button>
                <Button onClick={handleCloseModal} variant="secondary">
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
};

export default AlunoModal;