"use client";

import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useForm } from 'react-hook-form';
import { Label } from '@radix-ui/react-label';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

interface RegisterFormInputs {
    nome: string;
    email: string;
    senha: string;
    instituicao: string;
}

export const RegisterForm: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormInputs>();
    const router = useRouter();

    const onSubmit = async (data: RegisterFormInputs) => {
        try {
          const response = await fetch('/api/register', { 
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          if (response.ok) {
            const result = await response.json();
            toast.success(result.message); 
            localStorage.setItem('token', result.token);
            localStorage.setItem('professorId', result.professor.id.toString());
            localStorage.setItem('professorEmail', result.professor.email);

            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
          } else {
            const error = await response.json();
            toast.error(error.error); 
          }
        } catch (error) {
          console.error('Registration error:', error);
          toast.error('Ocorreu um erro durante o registro. Tente novamente.'); 
        }
      };

    return (
        <div className="flex items-center justify-center min-h-screen bg-black">
            <Card className="w-[350px] p-6 mx-auto bg-black border border-gray-800 rounded-lg space-y-4" >
                <h2 className="text-xl font-semibold mb-4 text-white">Registre-se</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <Label htmlFor='name' className="text-white">Nome</Label>
                        <Input
                            id="nome"
                            type="text"
                            placeholder="Nome"
                            className="bg-black border border-gray-800 text-white"
                            {...register("nome", { required: true })}
                        />
                        {errors.nome && <p className="text-red-500">Nome obrigatório</p>}
                    </div>
                    <div className="mb-4">
                        <Label htmlFor='email' className="text-white">E-mail</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Email"
                            className="bg-black border border-gray-800 text-white"
                            {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
                        />
                        {errors.email && <p className="text-red-500">Email inválido</p>}
                    </div>
                    <div className="mb-4">
                        <Label htmlFor='senha' className="text-white">Senha</Label>
                        <Input
                            id="senha"
                            type="password"
                            placeholder="Senha"
                            className="bg-black border border-gray-800 text-white"
                            {...register("senha", { required: true })}
                        />
                        {errors.senha && <p className="text-red-500">Senha obrigatória</p>}
                    </div>
                    <div className="mb-4">
                        <Label htmlFor='instituicao' className="text-white">Instituição de Ensino</Label>
                        <Input
                            id="instituicao"
                            type="text"
                            placeholder="Instituição de Ensino"
                            className="bg-black border border-gray-800 text-white"
                            {...register("instituicao", { required: true })}
                        />
                        {errors.instituicao && <p className="text-red-500">Instituição de ensino obrigatória</p>}
                    </div>
                    <Button type="submit" className="w-full border border-gray-800" variant="secondary">
                        Registrar
                    </Button>
                </form>
            </Card>
        </div>
    );
};
