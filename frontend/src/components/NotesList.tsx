import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

interface Note {
  id: string;
  title: string;
  content: string;
  isPrivate: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
}

interface NotesListProps {
  expedienteId: string;
  onNoteAdded?: (note: Note) => void;
}

const NotesList: React.FC<NotesListProps> = ({ expedienteId, onNoteAdded }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', content: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPrivate, setFilterPrivate] = useState<'all' | 'public' | 'private'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', content: '', isPrivate: false });

  useEffect(() => {
    fetchNotes();
  }, [expedienteId]);

  const fetchNotes = async () => {
    try {
      console.log('Fetching notes for expediente:', expedienteId);
      
      // Temporalmente usar datos mock mientras se soluciona el backend
      const mockNotes = [
        {
          id: '1',
          title: 'Nota de prueba del expediente',
          content: 'Esta es una nota de prueba para verificar que el sistema funciona correctamente. Contiene información importante sobre el caso.',
          isPrivate: false,
          createdAt: new Date().toISOString(),
          author: {
            id: user?.id || '1',
            name: user?.name || 'Usuario Test',
            email: user?.email || 'test@example.com'
          }
        },
        {
          id: '2',
          title: 'Segunda nota de prueba',
          content: 'Esta es otra nota para verificar que se muestran múltiples notas. Incluye detalles adicionales sobre el progreso del caso.',
          isPrivate: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 día antes
          author: {
            id: user?.id || '1',
            name: user?.name || 'Usuario Test',
            email: user?.email || 'test@example.com'
          }
        },
        {
          id: '3',
          title: 'Nota privada del abogado',
          content: 'Esta es una nota privada que solo debe ser visible para abogados y administradores.',
          isPrivate: true,
          createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 días antes
          author: {
            id: user?.id || '1',
            name: user?.name || 'Usuario Test',
            email: user?.email || 'test@example.com'
          }
        }
      ];
      
      // Usar datos reales del API
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'Present' : 'Missing');
      
      const response = await api.get(`/notes/expediente/${expedienteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Notes response:', response.data);
      setNotes(response.data);
    } catch (err: any) {
      console.error('Error fetching notes:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Error al cargar las notas');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note.id);
    setEditForm({ title: note.title, content: note.content });
  };

  const handleSaveEdit = async (noteId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.patch(`/notes/${noteId}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotes(notes.map(note => 
        note.id === noteId ? response.data : note
      ));
      setEditingNote(null);
      setEditForm({ title: '', content: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar la nota');
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta nota?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotes(notes.filter(note => note.id !== noteId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar la nota');
    }
  };

  const canEditNote = (note: Note) => {
    return note.author.id === user?.id || user?.role === 'ADMIN';
  };

  const canDeleteNote = (note: Note) => {
    return note.author.id === user?.id || user?.role === 'ADMIN';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const handleCreateNote = async () => {
    try {
      const token = localStorage.getItem('token');
      const payload = {
        expedienteId,
        title: createForm.title,
        content: createForm.content,
        isPrivate: createForm.isPrivate,
      };
      const response = await api.post('/notes', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotes([response.data, ...notes]);
      setCreateForm({ title: '', content: '', isPrivate: false });
      setShowCreateForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear la nota');
    }
  };

  const filteredNotes = notes.filter(note => {
    // Filtro por búsqueda de texto
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por privacidad
    const matchesFilter = filterPrivate === 'all' || 
                         (filterPrivate === 'public' && !note.isPrivate) ||
                         (filterPrivate === 'private' && note.isPrivate);
    
    // Filtro por fecha
    const noteDate = new Date(note.createdAt);
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    let matchesDate = true;
    
    switch (dateFilter) {
      case 'today':
        matchesDate = noteDate >= startOfDay;
        break;
      case 'week':
        matchesDate = noteDate >= startOfWeek;
        break;
      case 'month':
        matchesDate = noteDate >= startOfMonth;
        break;
      case 'custom':
        if (customDateFrom && customDateTo) {
          const fromDate = new Date(customDateFrom);
          const toDate = new Date(customDateTo);
          toDate.setHours(23, 59, 59, 999); // Incluir todo el día final
          matchesDate = noteDate >= fromDate && noteDate <= toDate;
        } else if (customDateFrom) {
          const fromDate = new Date(customDateFrom);
          matchesDate = noteDate >= fromDate;
        } else if (customDateTo) {
          const toDate = new Date(customDateTo);
          toDate.setHours(23, 59, 59, 999);
          matchesDate = noteDate <= toDate;
        }
        break;
      default:
        matchesDate = true;
    }
    
    return matchesSearch && matchesFilter && matchesDate;
  });

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notas del Expediente</h2>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Cargando notas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Notas del Expediente</h2>
        <div className="flex gap-2">
          <button
            onClick={fetchNotes}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            aria-label="Recargar notas"
          >
            🔄 Recargar
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Crear nueva nota"
          >
            {showCreateForm ? 'Cancelar' : 'Crear Nota'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Formulario de creación */}
      {showCreateForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-md font-medium text-gray-900 mb-3">Nueva Nota</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Título de la nota"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Contenido de la nota"
              value={createForm.content}
              onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {(user?.role === 'ABOGADO' || user?.role === 'ADMIN') && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={createForm.isPrivate}
                  onChange={(e) => setCreateForm({ ...createForm, isPrivate: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Nota privada (solo visible para abogados)
                </label>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleCreateNote}
                disabled={!createForm.title || !createForm.content}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Guardar Nota
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filtros y contador */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-2">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Buscar en notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">🔒</span>
            <select
              value={filterPrivate}
              onChange={(e) => setFilterPrivate(e.target.value as 'all' | 'public' | 'private')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las notas</option>
              <option value="public">Solo públicas</option>
              <option value="private">Solo privadas</option>
            </select>
          </div>
        </div>
        
        {/* Filtros de fecha */}
        <div className="flex flex-col sm:flex-row gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">📅</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as 'all' | 'today' | 'week' | 'month' | 'custom')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
              <option value="custom">Rango personalizado</option>
            </select>
          </div>
          
          {dateFilter === 'custom' && (
            <div className="flex gap-2">
              <input
                type="date"
                value={customDateFrom}
                onChange={(e) => setCustomDateFrom(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Desde"
              />
              <input
                type="date"
                value={customDateTo}
                onChange={(e) => setCustomDateTo(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Hasta"
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Mostrando {filteredNotes.length} de {notes.length} notas
            {searchTerm && ` (filtradas por "${searchTerm}")`}
            {dateFilter !== 'all' && (
              <span>
                {dateFilter === 'today' && ' (hoy)'}
                {dateFilter === 'week' && ' (esta semana)'}
                {dateFilter === 'month' && ' (este mes)'}
                {dateFilter === 'custom' && ' (rango personalizado)'}
              </span>
            )}
          </div>
          {(searchTerm || filterPrivate !== 'all' || dateFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterPrivate('all');
                setDateFilter('all');
                setCustomDateFrom('');
                setCustomDateTo('');
              }}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay notas</h3>
          <p className="mt-1 text-sm text-gray-500">Aún no se han agregado notas a este expediente.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((note) => (
            <div key={note.id} className="border border-gray-200 rounded-lg p-4">
              {editingNote === note.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Título de la nota"
                  />
                  <textarea
                    value={editForm.content}
                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contenido de la nota"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(note.id)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingNote(null)}
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{note.title}</h3>
                        {note.isPrivate && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Privada
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                      <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                        <span>Por: {note.author.name}</span>
                        <span>•</span>
                        <span>{formatDate(note.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {canEditNote(note) && (
                        <button
                          onClick={() => handleEdit(note)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium"
                          aria-label="Editar nota"
                        >
                          Editar
                        </button>
                      )}
                      {canDeleteNote(note) && (
                        <button
                          onClick={() => handleDelete(note.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm font-medium"
                          aria-label="Eliminar nota"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesList; 