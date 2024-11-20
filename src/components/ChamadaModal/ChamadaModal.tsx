import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as faceapi from 'face-api.js';
import { toast } from 'react-toastify';

interface Aluno {
    id: number;
    nome: string;
    faceData: string;
}

interface ChamadaModalProps {
    professorId: number;
}

const ChamadaModal: React.FC<ChamadaModalProps> = ({ professorId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [presentStudents, setPresentStudents] = useState<Aluno[]>([]);
    const [allStudents, setAllStudents] = useState<Aluno[]>([]);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const loadModels = async () => {
            try {
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                    faceapi.nets.faceRecognitionNet.loadFromUri('/models')
                ]);
                setIsModelLoaded(true);
                console.log('Modelos carregados com sucesso!');
            } catch (error) {
                console.error('Erro ao carregar modelos:', error);
                toast.error('Erro ao carregar modelos de reconhecimento facial');
            }
        };

        const fetchStudents = async () => {
            try {
                const response = await fetch('/api/alunos');
                const data = await response.json();
                setAllStudents(data.alunos.filter((aluno: Aluno) => aluno.faceData));
            } catch (error) {
                console.error('Erro ao buscar alunos:', error);
                toast.error('Erro ao carregar lista de alunos');
            }
        };

        loadModels();
        fetchStudents();

        return () => {
            stopCamera();
        };
    }, []);

    const calculateFaceDistance = (descriptor1: number[], descriptor2: number[]): number => {
        return Math.sqrt(
            descriptor1.reduce((sum, val, i) => sum + Math.pow(val - descriptor2[i], 2), 0)
        );
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsCameraActive(true);
                if (canvasRef.current) {
                    const ctx = canvasRef.current.getContext('2d');
                    ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                }
            }
        } catch (error) {
            console.error('Erro ao acessar câmera:', error);
            toast.error('Erro ao acessar câmera');
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsCameraActive(false);
        }
    };

    const recognizeFace = async () => {
        if (!videoRef.current || !canvasRef.current || !isModelLoaded) return;

        try {
            const options = new faceapi.TinyFaceDetectorOptions({
                inputSize: 512,
                scoreThreshold: 0.5
            });

            const detections = await faceapi
                .detectSingleFace(videoRef.current, options)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (detections) {
                const detectedDescriptor = Array.from(detections.descriptor);
                const matchedStudent = allStudents.find(aluno => {
                    const studentDescriptor = JSON.parse(aluno.faceData);
                    const distance = calculateFaceDistance(detectedDescriptor, studentDescriptor);
                    return distance < 0.5;
                });

                if (matchedStudent) {
                    const isAlreadyPresent = presentStudents.some(student => student.id === matchedStudent.id);

                    if (!isAlreadyPresent) {
                        setPresentStudents(prev => [...prev, matchedStudent]);
                        toast.success(`${matchedStudent.nome} registrado(a) na chamada!`);
                    } else {
                        toast.info(`${matchedStudent.nome} já estava na lista de presença.`);
                    }
                } else {
                    toast.error('Aluno não reconhecido. Tente novamente.');
                }

                // Highlight detected face
                const displaySize = {
                    width: videoRef.current.videoWidth,
                    height: videoRef.current.videoHeight
                };

                faceapi.matchDimensions(canvasRef.current, displaySize);
                const resizedDetections = faceapi.resizeResults(detections, displaySize);

                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
                    faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
                }
            } else {
                toast.error('Nenhum rosto detectado. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro ao reconhecer rosto:', error);
            toast.error('Erro ao processar imagem facial');
        }
    };

    const handleOpenModal = () => setIsOpen(true);

    const handleCloseModal = () => {
        setIsOpen(false);
        stopCamera();
        setPresentStudents([]);
    };

    const finalizarChamada = async () => {
        try {
            console.log('Alunos presentes:', presentStudents);
            toast.success(`Chamada finalizada. ${presentStudents.length} alunos presentes.`);
            handleCloseModal();
        } catch (error) {
            console.error('Erro ao finalizar chamada:', error);
            toast.error('Erro ao finalizar chamada');
        }
    };

    return (
        <>
            <Button onClick={handleOpenModal} variant="secondary">
                Lista de Chamada
            </Button>
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <Card className="w-[800px] p-6 bg-black border border-gray-800 rounded-lg space-y-4">
                        <h2 className="text-xl font-semibold mb-4 text-white">Lista de Chamada</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                                <canvas
                                    ref={canvasRef}
                                    className="absolute top-0 left-0 w-full h-full"
                                />
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-white">Alunos Presentes</h3>
                                <div className="max-h-80 overflow-y-auto">
                                    {presentStudents.length === 0 ? (
                                        <p className="text-gray-400">Nenhum aluno registrado</p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {presentStudents.map(student => (
                                                <li
                                                    key={student.id}
                                                    className="bg-gray-800 p-2 rounded-md text-white"
                                                >
                                                    {student.nome}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-2 mt-4">
                            {!isCameraActive ? (
                                <Button
                                    onClick={startCamera}
                                    variant="secondary"
                                    className="w-full"
                                    disabled={!isModelLoaded}
                                >
                                    Iniciar Câmera
                                </Button>
                            ) : (
                                <Button
                                    onClick={recognizeFace}
                                    variant="secondary"
                                    className="w-full"
                                    disabled={!isModelLoaded}
                                >
                                    Capturar e Reconhecer
                                </Button>
                            )}
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button
                                onClick={finalizarChamada}
                                variant="secondary"
                                disabled={presentStudents.length === 0}
                            >
                                Finalizar Chamada
                            </Button>
                            <Button onClick={handleCloseModal} variant="secondary">
                                Cancelar
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </>
    );
};

export default ChamadaModal;