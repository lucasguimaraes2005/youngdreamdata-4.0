import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@radix-ui/react-label';
import { toast } from 'react-toastify';
import * as faceapi from 'face-api.js';
import 'react-toastify/dist/ReactToastify.css';

interface AlunoData {
  nome: string;
  idade: number;
  turma: string;
  professorId: number;
  faceData?: string;
}

const AlunoModal = () => {
  const [nome, setNome] = useState('');
  const [nomeError, setNomeError] = useState('');
  const [idade, setIdade] = useState(0);
  const [idadeError, setIdadeError] = useState('');
  const [turma, setTurma] = useState('');
  const [turmaError, setTurmaError] = useState('');
  const [apiError, setApiError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [biometriaExistente, setBiometriaExistente] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState<Float32Array | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

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

    loadModels();

    return () => {
      stopCamera();
    };
  }, []);

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
        setFaceDetected(false);
        setBiometriaExistente(false);
        setApiError('');
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

  const captureFace = async () => {
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
        setFaceDetected(true);
        setBiometriaExistente(false);
        setFaceDescriptor(detections.descriptor);
        setApiError('');

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

        toast.success('Rosto detectado com sucesso!');
      } else {
        toast.error('Nenhum rosto detectado. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao capturar rosto:', error);
      toast.error('Erro ao processar imagem facial');
    }
  };

  const validateInputs = () => {
    let isValid = true;

    setNomeError('');
    setIdadeError('');
    setTurmaError('');
    setApiError('');

    if (!nome || nome.trim() === '') {
      setNomeError('Campo nome é obrigatório!');
      isValid = false;
    } else if (nome.length > 100) {
      setNomeError('Nome não pode ter mais de 100 caracteres!');
      isValid = false;
    }

    if (idade < 5 || idade > 20) {
      setIdadeError('Idade deve ser entre 5 e 20 anos!');
      isValid = false;
    }

    if (!turma || turma.trim() === '') {
      setTurmaError('Campo turma é obrigatório!');
      isValid = false;
    } else if (turma.length !== 3) {
      setTurmaError('Turma deve ter exatamente 3 caracteres!');
      isValid = false;
    }

    if (!faceDescriptor) {
      toast.error('É necessário capturar a biometria facial');
      isValid = false;
    }

    return isValid;
  };

  const handleCadastroAluno = async () => {
    if (!validateInputs()) return;

    try {
      const professorId = parseInt(localStorage.getItem('professorId') || '0', 10);
      const data: AlunoData = {
        nome: nome.trim(),
        idade,
        turma: turma.trim().toUpperCase(),
        professorId,
        faceData: JSON.stringify(Array.from(faceDescriptor!))
      };

      const response = await fetch('/api/alunoregister', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Aluno cadastrado com sucesso!");
        stopCamera();
        handleCloseModal();
      } else {
        const error = await response.json();
        if (error.error.includes('biometria já cadastrada')) {
          setBiometriaExistente(true);
          setFaceDetected(false);
          setApiError(error.error);
        } else {
          throw new Error(error.error);
        }
      }
    } catch (error: any) {
      setApiError(error.message);
      console.error('Erro ao cadastrar aluno:', error);
    }
  };

  const handleOpenModal = () => setIsOpen(true);
  const handleCloseModal = () => {
    setIsOpen(false);
    stopCamera();
    setNome('');
    setIdade(0);
    setTurma('');
    setFaceDetected(false);
    setBiometriaExistente(false);
    setFaceDescriptor(null);
    setNomeError('');
    setIdadeError('');
    setTurmaError('');
    setApiError('');
  };

  return (
      <>
        <Button onClick={handleOpenModal} variant="secondary">
          Cadastre um aluno
        </Button>
        {isOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <Card className="w-[600px] p-6 bg-black border border-gray-800 rounded-lg space-y-4">
                <h2 className="text-xl font-semibold mb-4 text-white">Cadastro de Aluno</h2>

                {apiError && (
                    <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-md p-3 mb-4">
                      <p className="text-red-500 text-sm">{apiError}</p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nome" className="text-white">Nome</Label>
                      <Input
                          id="nome"
                          type="text"
                          value={nome}
                          onChange={(e) => {
                            setNome(e.target.value);
                            setNomeError('');
                          }}
                          placeholder="Nome do aluno"
                          className="bg-black border border-gray-800 text-white"
                          required
                      />
                      {nomeError && <p className="text-red-500 text-sm">{nomeError}</p>}
                    </div>

                    <div>
                      <Label htmlFor="idade" className="text-white">Idade</Label>
                      <Input
                          id="idade"
                          type="number"
                          value={idade || ''}
                          onChange={(e) => {
                            setIdade(parseInt(e.target.value, 10));
                            setIdadeError('');
                          }}
                          placeholder="Idade do aluno"
                          className="bg-black border border-gray-800 text-white"
                          required
                      />
                      {idadeError && <p className="text-red-500 text-sm">{idadeError}</p>}
                    </div>

                    <div>
                      <Label htmlFor="turma" className="text-white">Turma</Label>
                      <Input
                          id="turma"
                          type="text"
                          value={turma}
                          onChange={(e) => {
                            setTurma(e.target.value.toUpperCase());
                            setTurmaError('');
                          }}
                          placeholder="Ex: 1A2"
                          maxLength={3}
                          className="bg-black border border-gray-800 text-white"
                          required
                      />
                      {turmaError && <p className="text-red-500 text-sm">{turmaError}</p>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="relative w-full h-48 bg-gray-900 rounded-lg overflow-hidden">
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
                      {faceDetected && (
                          <div className="absolute top-2 right-2">
                            <div className="bg-green-500 text-white px-2 py-1 rounded-md text-sm">
                              Rosto Detectado
                            </div>
                          </div>
                      )}
                      {biometriaExistente && (
                          <div className="absolute top-2 right-2">
                            <div className="bg-red-500 text-white px-2 py-1 rounded-md text-sm">
                              Biometria Já Cadastrada
                            </div>
                          </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
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
                              onClick={captureFace}
                              variant="secondary"
                              className="w-full"
                              disabled={!isModelLoaded}
                          >
                            Capturar Face
                          </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                      onClick={handleCadastroAluno}
                      variant="secondary"
                      disabled={!faceDetected || biometriaExistente}
                  >
                    Cadastrar
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

export default AlunoModal;