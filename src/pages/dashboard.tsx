import "../app/globals.css"
import Link from 'next/link';
import { Button } from '../components/ui/button';
import  AlunoModal  from "@/components/AlunoModal/AlunoModal";
import { ToastContainer } from "react-toastify";

export default function Dashboard() {
    return (
        <>
            <div className="flex flex-col items-center justify-center min-h-screen overflow-hidden transition-all ease-in-out duration-500">
            <div className="absolute top-4 left-4 transition-all ease-in-out duration-500">
                <h1 className="text-2xl font-bold text-white">Young Dream Data 📚</h1>
            </div>
            <div className="absolute top-4 right-4 transition-all ease-in-out duration-500">
                <Link href="/" passHref>
                    <Button variant="secondary">Sair</Button>
                </Link>
                <AlunoModal />
            </div>
            </div>

        </>
    )
}