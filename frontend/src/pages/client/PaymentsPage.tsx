import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Link } from 'react-router-dom';

interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: string;
  qrUrl?: string;
  pdfUrl?: string;
  paymentDate?: string;
  lawyerName?: string;
}

const PaymentsPage = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lawyers, setLawyers] = useState<{id: string, name: string}[]>([]);
  const [selectedLawyer, setSelectedLawyer] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/users/lawyers');
        setLawyers(res.data);
      } catch {}
    };
    fetchLawyers();
  }, []);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const params: any = {};
        if (selectedLawyer) params.lawyerId = selectedLawyer;
        if (selectedDate) params.paymentDate = selectedDate;
        const response = await api.get('/invoices/my', {
          params,
        });
        setInvoices(response.data);
        setError(null);
      } catch (err: any) {
        setError('Error al cargar las facturas');
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [selectedLawyer, selectedDate]);

  return (
    <div className="py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-semibold mb-2">Gestionar pagos y facturas</h1>
          <p className="text-gray-600 mb-6">Aquí puedes consultar tus facturas, descargar el PDF y acceder al QR para pago o verificación.</p>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">Filtros de Búsqueda</h2>
          {/* Filtros */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Abogado</label>
              <select value={selectedLawyer} onChange={e => setSelectedLawyer(e.target.value)} className="border rounded px-2 py-1">
                <option value="">Todos</option>
                {lawyers.map(lawyer => (
                  <option key={lawyer.id} value={lawyer.id}>{lawyer.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de pago</label>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="border rounded px-2 py-1" />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
          ) : invoices.length === 0 ? (
            <div className="text-gray-500">No tienes facturas registradas.</div>
          ) : (
            <div className="overflow-x-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Lista de Facturas</h2>
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nº Factura</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Importe</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Abogado</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha de pago</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">QR</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">PDF</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-4 py-2">{invoice.number}</td>
                      <td className="px-4 py-2">{new Date(invoice.date).toLocaleDateString()}</td>
                      <td className="px-4 py-2">{invoice.amount.toFixed(2)} €</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${invoice.status === 'PAGADA' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{invoice.status}</span>
                      </td>
                      <td className="px-4 py-2">{invoice.lawyerName || '-'}</td>
                      <td className="px-4 py-2">{invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-2">
                        {invoice.qrUrl ? (
                          <img src={invoice.qrUrl} alt="QR Factura" className="h-12 w-12 object-contain" />
                        ) : (
                          <span className="text-gray-400">No disponible</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {invoice.pdfUrl ? (
                          <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Descargar</a>
                        ) : (
                          <span className="text-gray-400">No disponible</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-8 flex justify-between items-center">
            <Link to="/dashboard" className="text-blue-600 hover:underline">Volver al Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage; 