"use client";

import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useForm } from 'react-hook-form';

interface LoginFormInputs {
    email: string;
    password: string;
}

export const LoginForm: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();

    const onSubmit = (data: LoginFormInputs) => {
        console.log('Dados do formulário:', data);
    };

    return (
        <Card className="w-96 p-6">
            <h2 className="text-xl font-semibold mb-4">Entre utilizando o email</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                    <Input
                        type="email"
                        placeholder="Email"
                        {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
                    />
                    {errors.email && <p className="text-red-500">Email inválido</p>}
                </div>
                <div className="mb-4">
                    <Input
                        type="password"
                        placeholder="Senha"
                        {...register("password", { required: true })}
                    />
                    {errors.password && <p className="text-red-500">Senha obrigatória</p>}
                </div>
                <Button type="submit" className="w-full">
                    Entrar
                </Button>
            </form>
        </Card>
    );
};

