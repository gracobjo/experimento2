import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface AppointmentSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
  formatted: string;
}

interface AppointmentCalendarProps {
  onDateSelect: (date: string, time: string) => void;
  onClose: () => void;
  isVisible: boolean;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  onDateSelect,
  onClose,
  isVisible
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<AppointmentSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generar fechas disponibles para las próximas 2 semanas
  const generateAvailableDates = () => {
    const slots: AppointmentSlot[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Solo días laborables (lunes a viernes)
      if (date.getDay() >= 1 && date.getDay() <= 5) {
        const hours = [9, 10, 11, 12, 16, 17]; // Horarios disponibles
        
        hours.forEach(hour => {
          const slotDate = new Date(date);
          slotDate.setHours(hour, 0, 0, 0);
          
          slots.push({
            id: `${date.toISOString().split('T')[0]}-${hour}`,
            date: date.toISOString().split('T')[0],
            time: `${hour}:00`,
            available: true,
            formatted: formatDate(slotDate)
          });
        });
      }
    }
    
    return slots;
  };

  const formatDate = (date: Date): string => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]} a las ${date.getHours()}:00`;
  };

  useEffect(() => {
    if (isVisible) {
      setAvailableSlots(generateAvailableDates());
    }
  }, [isVisible]);

  const handleDateSelect = (date: string) => {
    console.log('handleDateSelect called with:', date);
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleTimeSelect = (time: string) => {
    console.log('handleTimeSelect called with:', time);
    setSelectedTime(time);
  };

  const handleConfirm = () => {
    console.log('handleConfirm called with:', { selectedDate, selectedTime });
    
    // Validaciones adicionales
    if (!selectedDate || !selectedTime) {
      console.error('Missing date or time:', { selectedDate, selectedTime });
      alert('Por favor, selecciona una fecha y hora antes de confirmar.');
      return;
    }
    
    // Validar formato de fecha
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(selectedDate)) {
      console.error('Invalid date format:', selectedDate);
      alert('Formato de fecha inválido. Por favor, selecciona de nuevo.');
      return;
    }
    
    // Validar formato de hora
    const timeRegex = /^\d{1,2}:\d{2}$/;
    if (!timeRegex.test(selectedTime)) {
      console.error('Invalid time format:', selectedTime);
      alert('Formato de hora inválido. Por favor, selecciona de nuevo.');
      return;
    }
    
    console.log('Calling onDateSelect with:', selectedDate, selectedTime);
    onDateSelect(selectedDate, selectedTime);
    onClose();
  };

  const getAvailableTimesForDate = (date: string) => {
    return availableSlots.filter(slot => slot.date === date);
  };

  const getUniqueDates = () => {
    return [...new Set(availableSlots.map(slot => slot.date))].sort();
  };

  const formatDateForDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                   'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()],
      full: `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]}`
    };
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex-shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">📅 Selecciona tu cita</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-xl font-bold"
            >
              ×
            </button>
          </div>
          <p className="text-blue-100 mt-1 text-sm">
            Elige la fecha y hora que mejor te convenga
          </p>
        </div>

        {/* Contenido principal con scroll */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Calendario - Lado izquierdo */}
          <div className="lg:w-1/2 p-4 border-r border-gray-200 overflow-y-auto">
            <h3 className="text-md font-semibold mb-3 text-gray-800">
              📆 Fechas disponibles
            </h3>
            
            <div className="space-y-2">
              {getUniqueDates().map((dateStr) => {
                const dateInfo = formatDateForDisplay(dateStr);
                const isSelected = selectedDate === dateStr;
                const availableTimes = getAvailableTimesForDate(dateStr);
                
                return (
                  <div
                    key={dateStr}
                    className={`border rounded-lg p-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleDateSelect(dateStr)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`text-center min-w-[50px] ${
                          isSelected ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                          <div className="text-xs font-medium">{dateInfo.day}</div>
                          <div className="text-md font-bold">{dateInfo.date}</div>
                          <div className="text-xs">{dateInfo.month}</div>
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium text-sm ${
                            isSelected ? 'text-blue-800' : 'text-gray-800'
                          }`}>
                            {dateInfo.full}
                          </div>
                          <div className="text-xs text-gray-500">
                            {availableTimes.length} horarios disponibles
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="text-blue-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Horarios - Lado derecho */}
          <div className="lg:w-1/2 p-4 overflow-y-auto">
            {selectedDate ? (
              <>
                <h3 className="text-md font-semibold mb-3 text-gray-800">
                  🕐 Horarios disponibles
                </h3>
                <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 font-medium text-sm">
                    Fecha seleccionada: {formatDateForDisplay(selectedDate).full}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {getAvailableTimesForDate(selectedDate).map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => handleTimeSelect(slot.time)}
                      className={`p-3 border rounded-lg text-center transition-all ${
                        selectedTime === slot.time
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="text-md font-semibold">{slot.time}</div>
                      <div className="text-xs opacity-75">Disponible</div>
                    </button>
                  ))}
                </div>

                {selectedTime && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-1 text-sm">
                      ✅ Cita seleccionada
                    </h4>
                    <p className="text-green-700 text-sm">
                      {formatDateForDisplay(selectedDate).full} a las {selectedTime}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm">Selecciona una fecha para ver los horarios disponibles</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer con botones - Siempre visible */}
        <div className="bg-gray-50 p-3 border-t border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              Cancelar
            </button>
            
            <button
              onClick={handleConfirm}
              disabled={!selectedDate || !selectedTime}
              className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                selectedDate && selectedTime
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Confirmar Cita
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCalendar; 