import { useState } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '@radix-ui/react-label';

export const AlunoModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpenModal = () => {
        setIsOpen(true);
    };

    const handleCloseModal = () => {
        setIsOpen(false);
    };

    const handleCadastroAluno = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const professorId = parseInt(localStorage.getItem('professorId') || '0', 10);
        const professorEmail = localStorage.getItem('professorEmail');
        const token = localStorage.getItem('token')

        const data = {
            nome: formData.get('nome'),
            idade: formData.get('idade'),
            turma: formData.get('turma'),
            professorId,
            professor: professorEmail
        };

        try {

            const response = await fetch('/api/alunoregister', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });


            if (response.ok) {
                const result = await response.json();
                console.log('Aluno cadastrado:', result.message);

                handleCloseModal();
            } else {
                const error = await response.json();
                console.error('Erro ao cadastrar aluno:', error.error);
            }
        } catch (error) {
            console.error('Erro ao fazer a requisição:', error);
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
                        <form onSubmit={handleCadastroAluno}>
                            <div className="mb-4">
                                <Label htmlFor="nome" className="text-white">
                                    Nome
                                </Label>
                                <Input
                                    id="nome"
                                    type="text"
                                    placeholder="Nome do aluno"
                                    className="bg-black border border-gray-800 text-white"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <Label htmlFor="idade" className="text-white">
                                    Idade
                                </Label>
                                <Input
                                    id="idade"
                                    type="number"
                                    placeholder="Idade do aluno"
                                    className="bg-black border border-gray-800 text-white"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <Label htmlFor="turma" className="text-white">
                                    Turma
                                </Label>
                                <Input
                                    id="turma"
                                    type="text"
                                    placeholder="Turma do aluno"
                                    className="bg-black border border-gray-800 text-white"
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full border border-gray-800" variant="secondary">
                                Cadastrar
                            </Button>
                        </form>
                        <Button onClick={handleCloseModal} className="mt-4 w-full" variant="secondary">
                            Fechar
                        </Button>
                    </Card>
                </div>
            )}
        </>
    );
};
