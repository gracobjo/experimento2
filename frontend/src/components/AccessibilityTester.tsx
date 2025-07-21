import React, { useState, useEffect } from 'react';
import { accessibilityTester, AccessibilityTestResult } from '../utils/accessibility-test';

interface AccessibilityTesterProps {
  isVisible?: boolean;
  onClose?: () => void;
}

const AccessibilityTester: React.FC<AccessibilityTesterProps> = ({ 
  isVisible = false, 
  onClose 
}) => {
  const [results, setResults] = useState<AccessibilityTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    // Simular un pequeño delay para mostrar el estado de carga
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const testResults = accessibilityTester.runAllTests();
    setResults(testResults);
    setIsRunning(false);
  };

  const runSpecificTest = async (testName: string) => {
    setIsRunning(true);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const result = accessibilityTester.runSpecificTest(testName);
    if (result) {
      setResults([result]);
    }
    setIsRunning(false);
  };

  const generateReport = () => {
    const report = accessibilityTester.generateReport();
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accessibility-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (isVisible) {
      runTests();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  const percentage = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-tester-title"
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 id="accessibility-tester-title" className="text-2xl font-bold text-gray-900">
            Tester de Accesibilidad
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Cerrar tester de accesibilidad"
          >
            ×
          </button>
        </div>

        {/* Resumen */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Resumen</h3>
              <p className="text-gray-600">
                {passedTests} de {totalTests} pruebas pasaron ({percentage}%)
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={runTests}
                disabled={isRunning}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Ejecutar todas las pruebas de accesibilidad"
              >
                {isRunning ? 'Ejecutando...' : 'Ejecutar Todas'}
              </button>
              <button
                onClick={generateReport}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                aria-label="Descargar reporte de accesibilidad"
              >
                Descargar Reporte
              </button>
            </div>
          </div>
        </div>

        {/* Pruebas específicas */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Pruebas Específicas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { key: 'keyboard', label: 'Teclado' },
              { key: 'screen-reader', label: 'Lector Pantalla' },
              { key: 'contrast', label: 'Contraste' },
              { key: 'semantic', label: 'Estructura' },
              { key: 'forms', label: 'Formularios' },
              { key: 'modals', label: 'Modales' },
              { key: 'focus', label: 'Focus' }
            ].map((test) => (
              <button
                key={test.key}
                onClick={() => runSpecificTest(test.key)}
                disabled={isRunning}
                className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                aria-label={`Ejecutar prueba de ${test.label}`}
              >
                {test.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resultados */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Resultados</h3>
          {isRunning ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">Ejecutando pruebas...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.passed 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 flex items-center">
                        {result.passed ? '✅' : '❌'} {result.test}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        result.passed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {result.passed ? 'PASÓ' : 'FALLÓ'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay resultados disponibles. Ejecuta las pruebas para ver los resultados.
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Información</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Las pruebas verifican el cumplimiento de WCAG 2.1 AA</li>
            <li>• Se recomienda usar herramientas especializadas para contraste de colores</li>
            <li>• Los resultados son una guía, no reemplazan pruebas manuales</li>
            <li>• Para pruebas completas, usar lectores de pantalla reales</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityTester; 