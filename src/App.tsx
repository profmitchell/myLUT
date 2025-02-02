import React from 'react';
import { HelpCircle, Download, Image as ImageIcon } from 'lucide-react';
import { ImageDropZone } from './components/ImageDropZone';
import { ProcessingOverlay } from './components/ProcessingOverlay';
import { generateLUT, applyLUT, exportLUTFile } from './utils/lutGenerator';
import type { LUTSettings, ProcessingStatus } from './types';

function App() {
  const [sourceImage, setSourceImage] = React.useState<HTMLImageElement | null>(null);
  const [previewImage, setPreviewImage] = React.useState<HTMLImageElement | null>(null);
  const [lut, setLut] = React.useState<Uint8Array | null>(null);
  const [settings, setSettings] = React.useState<LUTSettings>({
    resolution: '17x17x17',
    strength: 1
  });
  const [processing, setProcessing] = React.useState<ProcessingStatus>({
    isProcessing: false,
    progress: 0,
    message: ''
  });
  const [lutActive, setLutActive] = React.useState(true);
  const [showAttribution, setShowAttribution] = React.useState(false);
  const previewCanvasRef = React.useRef<HTMLCanvasElement>(null);

  const handleGenerateLUT = async () => {
    if (!sourceImage) return;

    setProcessing({
      isProcessing: true,
      progress: 0,
      message: 'Generating LUT...'
    });

    try {
      const newLut = await generateLUT(
        sourceImage,
        settings.resolution,
        (progress) => {
          setProcessing(prev => ({
            ...prev,
            progress
          }));
        }
      );
      setLut(newLut);
      
      if (previewImage) {
        updatePreview(previewImage, newLut);
      }
    } catch (error) {
      console.error('Error generating LUT:', error);
    } finally {
      setProcessing({
        isProcessing: false,
        progress: 0,
        message: ''
      });
    }
  };

  const updatePreview = React.useCallback((image: HTMLImageElement, currentLut: Uint8Array | null) => {
    if (!previewCanvasRef.current || !currentLut) return;

    const ctx = previewCanvasRef.current.getContext('2d');
    if (!ctx) return;

    previewCanvasRef.current.width = image.width;
    previewCanvasRef.current.height = image.height;

    if (lutActive) {
      const processedImageData = applyLUT(image, currentLut, settings.resolution, settings.strength);
      ctx.putImageData(processedImageData, 0, 0);
    } else {
      ctx.drawImage(image, 0, 0);
    }
  }, [lutActive, settings.resolution, settings.strength]);

  React.useEffect(() => {
    if (previewImage && lut) {
      updatePreview(previewImage, lut);
    }
  }, [previewImage, lut, updatePreview]);

  const handleExportLUT = () => {
    if (!lut) return;

    const content = exportLUTFile(lut, settings.resolution);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `myLUT_${settings.resolution}.cube`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {showAttribution && (
        <div className="fixed inset-x-0 top-0 z-50 p-4 bg-gray-800/95 backdrop-blur-sm shadow-xl">
          <div className="container mx-auto">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold mb-2">myLUT Generator</h3>
                <p className="text-sm text-gray-300 mb-4">
                  Developed by Mitchell Cohen<br />
                  Newton, MA 2025<br />
                  <a 
                    href="http://www.mitchellcohen.net" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    www.mitchellcohen.net
                  </a>
                </p>
                <div className="text-sm text-gray-300">
                  <p className="font-medium mb-1">Quick Start:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Load a color-graded source image</li>
                    <li>Generate LUT to extract the color profile</li>
                    <li>Load a preview image to test the LUT</li>
                    <li>Adjust strength and toggle preview</li>
                    <li>Export .cube file when satisfied</li>
                  </ol>
                </div>
              </div>
              <button 
                onClick={() => setShowAttribution(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-8 h-8" />
            <h1 className="text-2xl font-bold">myLUT</h1>
          </div>
          <button
            onClick={() => setShowAttribution(prev => !prev)}
            className="hover:text-white text-gray-400 transition-colors"
          >
            <HelpCircle className="w-6 h-6" />
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Source Image Section */}
          <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 relative">
            <h2 className="text-lg font-semibold mb-4">Source Image</h2>
            <div className="aspect-video mb-4">
              {sourceImage ? (
                <img
                  src={sourceImage.src}
                  alt="Source"
                  className="w-full h-full object-contain bg-black/40 rounded-lg"
                />
              ) : (
                <ImageDropZone
                  onImageLoad={setSourceImage}
                  label="Drop source image here or click to browse"
                />
              )}
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  LUT Resolution
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['17x17x17', '33x33x33', '64x64x64'] as const).map((res) => (
                    <button
                      key={res}
                      onClick={() => setSettings(prev => ({ ...prev, resolution: res }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        settings.resolution === res
                          ? 'bg-white text-black'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleGenerateLUT}
                disabled={!sourceImage || processing.isProcessing}
                className="w-full px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {lut ? 'Regenerate LUT' : 'Generate LUT'}
              </button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 relative">
            <h2 className="text-lg font-semibold mb-4">Preview</h2>
            <div className="aspect-video mb-4 relative">
              {previewImage ? (
                <>
                  <canvas
                    ref={previewCanvasRef}
                    className="w-full h-full object-contain bg-black/40 rounded-lg"
                  />
                  {processing.isProcessing && (
                    <ProcessingOverlay
                      progress={processing.progress}
                      message={processing.message}
                    />
                  )}
                </>
              ) : (
                <ImageDropZone
                  onImageLoad={setPreviewImage}
                  label="Drop preview image here or click to browse"
                />
              )}
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  LUT Strength
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.001"
                  value={settings.strength}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    strength: parseFloat(e.target.value)
                  }))}
                  className="w-full"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setLutActive(prev => !prev)}
                  disabled={!lut || !previewImage}
                  className="flex-1 px-4 py-2 bg-gray-700/50 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {lutActive ? 'Show Original' : 'Show with LUT'}
                </button>
                <button
                  onClick={handleExportLUT}
                  disabled={!lut}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  Export LUT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;