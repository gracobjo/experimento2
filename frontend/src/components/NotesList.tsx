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
            aria-describedby="recargar-notas-help"
          >
            🔄 Recargar
          </button>
          <div id="recargar-notas-help" className="sr-only">
            Actualizar la lista de notas del expediente
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Crear nueva nota"
            aria-describedby="crear-nota-help"
          >
            {showCreateForm ? 'Cancelar' : 'Crear Nota'}
          </button>
          <div id="crear-nota-help" className="sr-only">
            {showCreateForm ? 'Cancelar la creación de una nueva nota' : 'Abrir formulario para crear una nueva nota'}
          </div>
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
            <div>
              <label htmlFor="create-note-title" className="block text-sm font-medium text-gray-700 mb-1">
                Título de la nota
              </label>
              <input
                id="create-note-title"
                type="text"
                placeholder="Título de la nota"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-describedby="create-note-title-help"
              />
              <div id="create-note-title-help" className="sr-only">
                Ingrese un título descriptivo para la nota
              </div>
            </div>
            <div>
              <label htmlFor="create-note-content" className="block text-sm font-medium text-gray-700 mb-1">
                Contenido de la nota
              </label>
              <textarea
                id="create-note-content"
                placeholder="Contenido de la nota"
                value={createForm.content}
                onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-describedby="create-note-content-help"
              />
              <div id="create-note-content-help" className="sr-only">
                Escriba el contenido de la nota que desea agregar al expediente
              </div>
            </div>
            {(user?.role === 'ABOGADO' || user?.role === 'ADMIN') && (
              <div className="flex items-center">
                <input
                  id="create-note-private"
                  type="checkbox"
                  checked={createForm.isPrivate}
                  onChange={(e) => setCreateForm({ ...createForm, isPrivate: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  aria-describedby="create-note-private-help"
                />
                <label htmlFor="create-note-private" className="ml-2 text-sm text-gray-700">
                  Nota privada (solo visible para abogados)
                </label>
                <div id="create-note-private-help" className="sr-only">
                  Marque esta opción si la nota debe ser visible solo para abogados y administradores
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleCreateNote}
                disabled={!createForm.title || !createForm.content}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Guardar nueva nota"
                aria-describedby="save-create-note-help"
              >
                Guardar Nota
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                aria-label="Cancelar creación de nota"
                aria-describedby="cancel-create-note-help"
              >
                Cancelar
              </button>
              <div id="save-create-note-help" className="sr-only">
                Guardar la nueva nota en el expediente
              </div>
              <div id="cancel-create-note-help" className="sr-only">
                Cancelar la creación de la nota y cerrar el formulario
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros y contador */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-2">
          <div className="flex-1 relative">
            <label htmlFor="search-notes" className="sr-only">
              Buscar en notas
            </label>
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            <input
              id="search-notes"
              type="text"
              placeholder="Buscar en notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-describedby="search-notes-help"
            />
            <div id="search-notes-help" className="sr-only">
              Busque en el título y contenido de las notas
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="filter-privacy" className="sr-only">
              Filtrar por privacidad
            </label>
            <span className="text-gray-500">🔒</span>
            <select
              id="filter-privacy"
              value={filterPrivate}
              onChange={(e) => setFilterPrivate(e.target.value as 'all' | 'public' | 'private')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-describedby="filter-privacy-help"
            >
              <option value="all">Todas las notas</option>
              <option value="public">Solo públicas</option>
              <option value="private">Solo privadas</option>
            </select>
            <div id="filter-privacy-help" className="sr-only">
              Seleccione el tipo de notas que desea ver
            </div>
          </div>
        </div>
        
        {/* Filtros de fecha */}
        <div className="flex flex-col sm:flex-row gap-3 mb-2">
          <div className="flex items-center gap-2">
            <label htmlFor="filter-date" className="sr-only">
              Filtrar por fecha
            </label>
            <span className="text-gray-500">📅</span>
            <select
              id="filter-date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as 'all' | 'today' | 'week' | 'month' | 'custom')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-describedby="filter-date-help"
            >
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
              <option value="custom">Rango personalizado</option>
            </select>
            <div id="filter-date-help" className="sr-only">
              Seleccione el período de tiempo para filtrar las notas
            </div>
          </div>
          
          {dateFilter === 'custom' && (
            <div className="flex gap-2">
              <div>
                <label htmlFor="custom-date-from" className="sr-only">
                  Fecha desde
                </label>
                <input
                  id="custom-date-from"
                  type="date"
                  value={customDateFrom}
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Desde"
                  aria-describedby="custom-date-from-help"
                />
                <div id="custom-date-from-help" className="sr-only">
                  Seleccione la fecha de inicio para el filtro personalizado
                </div>
              </div>
              <div>
                <label htmlFor="custom-date-to" className="sr-only">
                  Fecha hasta
                </label>
                <input
                  id="custom-date-to"
                  type="date"
                  value={customDateTo}
                  onChange={(e) => setCustomDateTo(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Hasta"
                  aria-describedby="custom-date-to-help"
                />
                <div id="custom-date-to-help" className="sr-only">
                  Seleccione la fecha de fin para el filtro personalizado
                </div>
              </div>
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
              aria-label="Limpiar todos los filtros aplicados"
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
                  <div>
                    <label htmlFor={`edit-note-title-${note.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Título de la nota
                    </label>
                    <input
                      id={`edit-note-title-${note.id}`}
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Título de la nota"
                      aria-describedby={`edit-note-title-help-${note.id}`}
                    />
                    <div id={`edit-note-title-help-${note.id}`} className="sr-only">
                      Edite el título de la nota
                    </div>
                  </div>
                  <div>
                    <label htmlFor={`edit-note-content-${note.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Contenido de la nota
                    </label>
                    <textarea
                      id={`edit-note-content-${note.id}`}
                      value={editForm.content}
                      onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contenido de la nota"
                      aria-describedby={`edit-note-content-help-${note.id}`}
                    />
                    <div id={`edit-note-content-help-${note.id}`} className="sr-only">
                      Edite el contenido de la nota
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(note.id)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                      aria-label="Guardar cambios en la nota"
                      aria-describedby={`save-edit-help-${note.id}`}
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingNote(null)}
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
                      aria-label="Cancelar edición de la nota"
                      aria-describedby={`cancel-edit-help-${note.id}`}
                    >
                      Cancelar
                    </button>
                    <div id={`save-edit-help-${note.id}`} className="sr-only">
                      Confirmar los cambios realizados en la nota
                    </div>
                    <div id={`cancel-edit-help-${note.id}`} className="sr-only">
                      Descartar los cambios y volver a la vista normal de la nota
                    </div>
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
                          aria-describedby={`edit-note-help-${note.id}`}
                        >
                          Editar
                        </button>
                      )}
                      {canDeleteNote(note) && (
                        <button
                          onClick={() => handleDelete(note.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm font-medium"
                          aria-label="Eliminar nota"
                          aria-describedby={`delete-note-help-${note.id}`}
                        >
                          Eliminar
                        </button>
                      )}
                      <div id={`edit-note-help-${note.id}`} className="sr-only">
                        Modificar el contenido de esta nota
                      </div>
                      <div id={`delete-note-help-${note.id}`} className="sr-only">
                        Eliminar permanentemente esta nota del expediente
                      </div>
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