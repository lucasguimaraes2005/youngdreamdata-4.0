"use client";

import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useForm } from 'react-hook-form';
import { Label } from '@radix-ui/react-label';

interface RegisterFormInputs {
    name: string;
    email: string;
    password: string;
    institution: string;
}

export const RegisterForm: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormInputs>();

    const onSubmit = (data: RegisterFormInputs) => {
        console.log('Dados do formulário:', data);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-black">
            <Card className="w-[350px] p-6 mx-auto bg-black border border-gray-800 rounded-lg space-y-4" >
                <h2 className="text-xl font-semibold mb-4 text-white">Registre-se</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <Label htmlFor='name' className="text-white">Nome</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Nome"
                            className="bg-black border border-gray-800 text-white"
                            {...register("name", { required: true })}
                        />
                        {errors.name && <p className="text-red-500">Nome obrigatório</p>}
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
                            {...register("password", { required: true })}
                        />
                        {errors.password && <p className="text-red-500">Senha obrigatória</p>}
                    </div>
                    <div className="mb-4">
                        <Label htmlFor='institution' className="text-white">Instituição de Ensino</Label>
                        <Input
                            id="institution"
                            type="text"
                            placeholder="Instituição de Ensino"
                            className="bg-black border border-gray-800 text-white"
                            {...register("institution", { required: true })}
                        />
                        {errors.institution && <p className="text-red-500">Instituição de ensino obrigatória</p>}
                    </div>
                    <Button type="submit" className="w-full border border-gray-800" variant="secondary">
                        Registrar
                    </Button>
                </form>
            </Card>
        </div>
    );
};
