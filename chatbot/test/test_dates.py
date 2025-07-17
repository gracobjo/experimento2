#!/usr/bin/env python3
"""
Script de prueba para verificar la generación de fechas disponibles
"""

from datetime import datetime, timedelta

def get_available_dates():
    """Obtiene fechas disponibles para citas"""
    # Generar fechas disponibles (lunes a viernes, 9:00-18:00)
    available_dates = []
    today = datetime.now()
    
    print(f"Fecha actual: {today}")
    print(f"Generando fechas para las próximas 2 semanas...")
    print()
    
    for i in range(1, 15):  # Próximas 2 semanas
        base_date = today + timedelta(days=i)
        if base_date.weekday() < 5:  # Lunes a viernes
            print(f"Día {i}: {base_date.strftime('%A %d de %B')} (día laboral)")
            for hour in [9, 10, 11, 12, 16, 17]:  # Horarios disponibles
                # Crear fecha específica con la hora correcta
                specific_date = base_date.replace(hour=hour, minute=0, second=0, microsecond=0)
                
                # Formatear la fecha correctamente
                formatted_date = specific_date.strftime('%A %d de %B a las %H:%M')
                formatted_date = formatted_date.replace('Monday', 'Lunes')
                formatted_date = formatted_date.replace('Tuesday', 'Martes')
                formatted_date = formatted_date.replace('Wednesday', 'Miércoles')
                formatted_date = formatted_date.replace('Thursday', 'Jueves')
                formatted_date = formatted_date.replace('Friday', 'Viernes')
                formatted_date = formatted_date.replace('January', 'Enero')
                formatted_date = formatted_date.replace('February', 'Febrero')
                formatted_date = formatted_date.replace('March', 'Marzo')
                formatted_date = formatted_date.replace('April', 'Abril')
                formatted_date = formatted_date.replace('May', 'Mayo')
                formatted_date = formatted_date.replace('June', 'Junio')
                formatted_date = formatted_date.replace('July', 'Julio')
                formatted_date = formatted_date.replace('August', 'Agosto')
                formatted_date = formatted_date.replace('September', 'Septiembre')
                formatted_date = formatted_date.replace('October', 'Octubre')
                formatted_date = formatted_date.replace('November', 'Noviembre')
                formatted_date = formatted_date.replace('December', 'Diciembre')
                
                available_dates.append({
                    'date': specific_date,
                    'formatted': formatted_date
                })
                print(f"  - {formatted_date}")
        else:
            print(f"Día {i}: {base_date.strftime('%A %d de %B')} (fin de semana - omitido)")
    
    return available_dates

if __name__ == "__main__":
    print("=" * 60)
    print("PRUEBA DE GENERACIÓN DE FECHAS DISPONIBLES")
    print("=" * 60)
    print()
    
    dates = get_available_dates()
    
    print()
    print("=" * 60)
    print("RESUMEN DE FECHAS GENERADAS")
    print("=" * 60)
    print(f"Total de fechas disponibles: {len(dates)}")
    print()
    
    print("Primeras 5 fechas (como las muestra el chatbot):")
    for i, date_info in enumerate(dates[:5]):
        print(f"{i+1}. {date_info['formatted']}")
        print(f"   ISO: {date_info['date'].isoformat()}")
    
    print()
    print("Verificación:")
    print("- Todas las fechas son diferentes: ", len(set(d['formatted'] for d in dates)) == len(dates))
    print("- Todas las fechas son futuras: ", all(d['date'] > datetime.now() for d in dates))
    print("- Todas son días laborales: ", all(d['date'].weekday() < 5 for d in dates))
    print("- Horarios correctos: ", all(d['date'].hour in [9, 10, 11, 12, 16, 17] for d in dates)) 