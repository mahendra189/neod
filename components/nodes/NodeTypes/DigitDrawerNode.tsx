import React, { useState, useRef, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import { Handle, Position, NodeProps } from 'reactflow';
import { Icon } from '@iconify/react';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';

interface DigitDrawerNodeProps extends NodeProps {
  data: {
    label?: string;
    icon?: string;
    prediction?: number;
    confidence?: number;
    isDrawing?: boolean;
    onInference?: (imageData: number[][]) => Promise<{ prediction: number; confidence: number }>;
  } & Record<string, any>;
}

const DigitDrawerNode = ({ data, selected, isConnectable }: DigitDrawerNodeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const CANVAS_SIZE = 280;
  const DIGIT_SIZE = 28;

  // Initialize canvas
  useEffect(() => {
    if (!showModal) return;

    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = CANVAS_SIZE;
      canvas.height = CANVAS_SIZE;

      // Fill with white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Set drawing properties
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'black';
    }, 50);

    return () => clearTimeout(timer);
  }, [showModal]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    setPrediction(null);
    setConfidence(null);
  };

  const getImageData = (): number[][] => {
    const canvas = canvasRef.current;
    if (!canvas) return [];

    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    // Get image data
    const imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    const data = imageData.data;

    // Convert to grayscale and resize to 28x28
    const resizedData: number[][] = [];
    for (let y = 0; y < DIGIT_SIZE; y++) {
      resizedData[y] = [];
      for (let x = 0; x < DIGIT_SIZE; x++) {
        // Simple nearest neighbor scaling
        const sourceX = Math.floor((x / DIGIT_SIZE) * CANVAS_SIZE);
        const sourceY = Math.floor((y / DIGIT_SIZE) * CANVAS_SIZE);
        const index = (sourceY * CANVAS_SIZE + sourceX) * 4;

        // Convert to grayscale (invert colors for MNIST format)
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const gray = (r + g + b) / 3;

        // Normalize to 0-1 (MNIST format expects white digits on black background)
        resizedData[y][x] = (255 - gray) / 255;
      }
    }

    return resizedData;
  };

  const runInference = async () => {
    if (!data.onInference) {
      alert('No inference function available. Please connect a trained model.');
      return;
    }

    const imageData = getImageData();
    if (!imageData || imageData.length === 0) {
      setShowModal(true);
      return;
    }

    setIsProcessing(true);
    try {
      const result = await data.onInference(imageData);
      setPrediction(result.prediction);
      setConfidence(result.confidence);
    } catch (error: any) {
      console.error('Inference failed:', error);
      alert(error?.message || 'Inference failed. Please check your model connection.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div
        className={clsx(
          'bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg shadow-lg border-2',
          'min-w-[200px] transition-all duration-200 p-3',
          selected ? 'border-white ring-2 ring-purple-300' : 'border-transparent',
        )}
        onDoubleClick={() => setShowModal(true)}
      >
        <Handle
          className="w-3 h-3 bg-blue-500"
          isConnectable={isConnectable}
          position={Position.Left}
          type="target"
        />
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5" icon="lucide:edit" />
            <span className="font-medium">Digit Drawer</span>
          </div>

          <div className="text-xs opacity-80 text-center">
            Draw a digit & test inference
          </div>

          {prediction !== null && (
            <div className="mt-2 p-2 bg-white/20 rounded text-center">
              <div className="text-lg font-bold">{prediction}</div>
              <div className="text-xs">
                {confidence !== null && `${(confidence * 100).toFixed(1)}%`}
              </div>
            </div>
          )}

          <div className="flex gap-1 mt-1">
            <Button
              size="sm"
              color="secondary"
              onClick={() => setShowModal(true)}
              className="text-xs"
            >
              Draw
            </Button>
            <Button
              size="sm"
              color="primary"
              onClick={runInference}
              isLoading={isProcessing}
              disabled={isProcessing}
              className="text-xs"
            >
              {isProcessing ? '...' : 'Test'}
            </Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        size="lg"
      >
        <ModalContent>
          <ModalHeader>Digit Drawer - MNIST Inference</ModalHeader>
          <ModalBody>
            <div className="flex flex-col items-center gap-4">
              <div className="text-sm text-gray-600 text-center">
                Draw a digit (0-9) on the canvas below, then click &quot;Run Inference&quot; to test your trained CNN model.
              </div>

              <div className="border-2 border-gray-300 rounded-lg p-2">
                <canvas
                  ref={canvasRef}
                  className="border border-gray-400 cursor-crosshair"
                  width={CANVAS_SIZE}
                  height={CANVAS_SIZE}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  style={{
                    maxWidth: '280px',
                    maxHeight: '280px',
                    width: '100%',
                    height: 'auto'
                  }}
                />
              </div>

              <div className="flex gap-2">
                <Button color="secondary" onClick={clearCanvas}>
                  Clear
                </Button>
                <Button
                  color="primary"
                  onClick={runInference}
                  isLoading={isProcessing}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Running Inference...' : 'Run Inference'}
                </Button>
              </div>

              {prediction !== null && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-800 mb-2">
                    Prediction: {prediction}
                  </div>
                  {confidence !== null && (
                    <div className="text-sm text-green-600">
                      Confidence: {(confidence * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="default" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default React.memo(DigitDrawerNode);