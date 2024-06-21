import { Card, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useState, useEffect } from 'react';

interface Aluno {
  id: number;
  nome: string;
  idade: number;
  turma: string;
}

const AlunosList = () => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAlunos = async () => {
      const response = await fetch('/api/alunos');
      const data = await response.json();
      setAlunos(data.alunos);
      setLoading(false);
    };
    fetchAlunos();
  }, []);

  const handleDeleteAluno = async (id: number) => {
    try {
      const response = await fetch(`/api/deletealuno?id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setAlunos(alunos.filter((aluno: Aluno) => aluno.id!== id));
      } else {
        console.error('Erro ao deletar aluno');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredAlunos = alunos.filter((aluno: Aluno) => {
    return aluno.turma.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="container mx-auto p-4 pt-40">
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className='pb-2'>
          <Input
            id="search"
            type="search"
            placeholder="Pesquisar por turma"
            className="bg-gray-800 border border-gray-600 text-white rounded-lg p-2"
            value={searchTerm}
            onChange={handleSearch}
          />
          <div className="flex flex-row flex-wrap gap-3 pt-3">
            {filteredAlunos.map((aluno: Aluno) => (
              <div key={aluno.id} className="bg-gray-800 rounded-lg shadow-md p-2 w-64">
                <CardContent>
                  <h2 className="text-white">{aluno.nome}</h2>
                  <p className="text-white">Idade: {aluno.idade}</p>
                  <p className="text-white">Turma: {aluno.turma}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="destructive" onClick={() => handleDeleteAluno(aluno.id)}>
                    Deletar
                  </Button>
                </CardFooter>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlunosList;