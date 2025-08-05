import React, { useState, useRef, useEffect } from 'react';

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  required = false,
  className = '',
  placeholder = 'Seleccionar fecha y hora'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showValidation, setShowValidation] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parsear el valor inicial
  useEffect(() => {
    if (value) {
      try {
        const dateTime = new Date(value);
        if (!isNaN(dateTime.getTime())) {
          setSelectedDate(dateTime.toISOString().split('T')[0]);
          setSelectedTime(`${dateTime.getHours().toString().padStart(2, '0')}:${dateTime.getMinutes().toString().padStart(2, '0')}`);
        }
      } catch (error) {
        console.error('Error parsing date value:', error);
        setSelectedDate('');
        setSelectedTime('');
      }
    } else {
      setSelectedDate('');
      setSelectedTime('');
    }
  }, [value]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Ocultar validación cuando se cierra el dropdown
        setShowValidation(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Generar fechas disponibles (próximas 2 semanas)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Solo días laborables (lunes a viernes)
      if (date.getDay() >= 1 && date.getDay() <= 5) {
        dates.push(new Date(date));
      }
    }
    
    return dates;
  };

  // Generar horarios disponibles
  const generateAvailableTimes = () => {
    return [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '16:00', '16:30', '17:00', '17:30'
    ];
  };

  const handleDateSelect = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setShowValidation(false); // Ocultar validación cuando se selecciona fecha
    
    // Si ya hay una hora seleccionada, actualizar el valor completo
    if (selectedTime) {
      const newValue = `${dateStr}T${selectedTime}:00`;
      onChange(newValue);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setShowValidation(false); // Ocultar validación cuando se selecciona hora
    
    // Si ya hay una fecha seleccionada, actualizar el valor completo
    if (selectedDate) {
      const newValue = `${selectedDate}T${time}:00`;
      onChange(newValue);
    }
  };

  const formatDisplayValue = () => {
    if (selectedDate && selectedTime) {
      try {
        const date = new Date(`${selectedDate}T${selectedTime}:00`);
        if (!isNaN(date.getTime())) {
          return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      } catch (error) {
        console.error('Error formatting date:', error);
      }
    }
    return '';
  };

  const availableDates = generateAvailableDates();
  const availableTimes = generateAvailableTimes();

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <input
        type="text"
        value={formatDisplayValue()}
        readOnly
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer"
        placeholder={placeholder}
        onClick={() => {
          setIsOpen(!isOpen);
          // Mostrar validación solo si el campo está vacío y es requerido
          if (required && !selectedDate && !selectedTime) {
            setShowValidation(true);
          }
        }}
        onInvalid={(e) => {
          // Prevenir el mensaje de validación nativo del navegador
          e.preventDefault();
        }}
      />
      
      {/* Mensaje de validación personalizado */}
      {showValidation && required && !selectedDate && !selectedTime && (
        <div className="absolute top-full left-0 mt-1 px-3 py-2 bg-orange-100 border border-orange-300 rounded-md text-orange-800 text-sm z-[99999] whitespace-nowrap">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Completa este campo
          </div>
        </div>
      )}
      
             {isOpen && (
         <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-[99999] max-h-80 overflow-y-auto">
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Calendario */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-gray-700">Fecha</h3>
                <div className="space-y-2">
                  {availableDates.map((date) => (
                    <button
                      key={date.toISOString()}
                      onClick={() => handleDateSelect(date)}
                      className={`w-full p-2 text-left rounded border transition-colors ${
                        selectedDate === date.toISOString().split('T')[0]
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {date.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </button>
                  ))}
                </div>
              </div>

              {/* Horarios */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-gray-700">Hora</h3>
                <div className="grid grid-cols-2 gap-2">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className={`p-2 text-center rounded border transition-colors ${
                        selectedTime === time
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowValidation(false);
                }}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowValidation(false);
                }}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimePicker; 