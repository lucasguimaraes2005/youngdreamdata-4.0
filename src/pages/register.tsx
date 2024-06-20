import { RegisterForm } from "@/components/RegisterForm/registerform";
import { Button } from '../components/ui/button';
import Link from 'next/link';
import "../app/globals.css"
import { ToastContainer } from "react-toastify";

export default function Register() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen overflow-hidden transition-all ease-in-out duration-500">
            <div className="absolute top-4 left-4 transition-all ease-in-out duration-500">
                <h1 className="text-2xl font-bold text-white">Young Dream Data 📚</h1>
            </div>
            <div className="absolute top-4 right-4 transition-all ease-in-out duration-500">
                <Link href="/" passHref>
                    <Button variant="secondary">Voltar</Button>
                </Link>
            </div>
            <RegisterForm />
            <ToastContainer />
        </div>
    );
};
