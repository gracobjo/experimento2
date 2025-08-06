/**
 * SCRIPTS PARA ARREGLAR SERVICIOS DINÁMICOS
 * ===========================================
 * 
 * Este archivo contiene scripts temporales para solucionar el problema
 * de que los servicios no se muestran dinámicamente en el frontend.
 * 
 * PROBLEMA IDENTIFICADO:
 * - El componente ServiceCards usa datos estáticos del layout
 * - No consulta la API para obtener servicios dinámicos
 * - Vercel no está haciendo deploy debido al límite de 100 deploys/día
 * 
 * SOLUCIÓN TEMPORAL:
 * - Scripts que se ejecutan en la consola del navegador
 * - Fuerzan la carga de servicios desde la API
 * - Mapean iconos correctamente
 * 
 * CÓMO USAR:
 * 1. Abrir la consola del navegador (F12)
 * 2. Copiar y pegar el script deseado
 * 3. Presionar Enter
 * 4. Los servicios se actualizarán automáticamente
 */

// ============================================================================
// SCRIPT 1: DIAGNÓSTICO BÁSICO
// ============================================================================
/**
 * Propósito: Verificar si los servicios están llegando desde la API
 * Uso: Ejecutar primero para diagnosticar el problema
 */
function diagnoseServices() {
  console.log('=== DIAGNÓSTICO DE SERVICIOS ===');
  
  fetch('https://experimento2-production.up.railway.app/api/parametros/services')
    .then(response => response.json())
    .then(services => {
      console.log('Servicios completos:', services);
      console.log('Número de servicios:', services.length);
      
      services.forEach((service, index) => {
        console.log(`Servicio ${index}:`, {
          id: service.id,
          orden: service.orden,
          TITLE: service.TITLE,
          DESCRIPTION: service.DESCRIPTION,
          ICON: service.ICON,
          ORDER: service.ORDER,
          allKeys: Object.keys(service),
          allValues: Object.values(service)
        });
      });
    })
    .catch(error => console.error('Error en diagnóstico:', error));
}

// ============================================================================
// SCRIPT 2: ACTUALIZACIÓN BÁSICA DEL DASHBOARD
// ============================================================================
/**
 * Propósito: Actualizar solo el dashboard con servicios dinámicos
 * Uso: Cuando solo quieres arreglar las tarjetas principales
 */
async function updateDashboardServices() {
  try {
    const response = await fetch('https://experimento2-production.up.railway.app/api/parametros/services');
    const services = await response.json();
    
    const serviceSection = document.querySelector('.bg-white.p-6.rounded-lg.border');
    if (serviceSection) {
      const grid = serviceSection.querySelector('.grid');
      if (grid) {
        grid.innerHTML = '';
        
        services.forEach((service, index) => {
          console.log(`Creando tarjeta dashboard ${index}:`, service);
          const serviceCard = document.createElement('div');
          serviceCard.className = 'text-center p-4 border rounded-lg hover:shadow-md transition-shadow';
          serviceCard.innerHTML = `
            <div class="text-4xl mb-3">${service.ICON || '⚖️'}</div>
            <h3 class="text-lg font-semibold mb-2">${service.TITLE || 'Servicio'}</h3>
            <p class="text-gray-600">${service.DESCRIPTION || 'Descripción del servicio'}</p>
          `;
          grid.appendChild(serviceCard);
        });
        
        console.log('✅ Dashboard actualizado con servicios dinámicos');
      }
    }
  } catch (error) {
    console.error('Error actualizando dashboard:', error);
  }
}

// ============================================================================
// SCRIPT 3: MAPEO DE ICONOS
// ============================================================================
/**
 * Propósito: Convertir nombres de iconos a emojis
 * Uso: Cuando los iconos aparecen como texto (gavel, work, etc.)
 */
const iconMapping = {
  'gavel': '⚖️',
  'work': '👥',
  'family': '👨‍👩‍👧‍👦',
  'civil': '⚖️',
  'laboral': '👥',
  'familiar': '👨‍👩‍👧‍👦',
  'penal': '🚨',
  'administrativo': '🏛️',
  'mercantil': '💼',
  'fiscal': '💰',
  'herencias': '📜',
  'testamentos': '📜',
  'divorcios': '💔',
  'custodia': '👶',
  'contratos': '📋',
  'despidos': '🚪',
  'negociaciones': '🤝'
};

function getIcon(iconName) {
  if (!iconName) return '⚖️';
  
  // Si ya es un emoji, devolverlo tal como está
  if (/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(iconName)) {
    return iconName;
  }
  
  // Buscar en el mapeo
  const mappedIcon = iconMapping[iconName.toLowerCase()];
  if (mappedIcon) {
    return mappedIcon;
  }
  
  // Si no se encuentra, intentar mapear por palabras clave
  const lowerIcon = iconName.toLowerCase();
  for (const [key, emoji] of Object.entries(iconMapping)) {
    if (lowerIcon.includes(key)) {
      return emoji;
    }
  }
  
  // Icono por defecto
  return '⚖️';
}

// ============================================================================
// SCRIPT 4: ACTUALIZACIÓN COMPLETA CON ICONOS
// ============================================================================
/**
 * Propósito: Actualizar dashboard y modal con iconos correctos
 * Uso: Solución completa que incluye mapeo de iconos
 */
async function updateServicesWithIcons() {
  try {
    const response = await fetch('https://experimento2-production.up.railway.app/api/parametros/services');
    const services = await response.json();
    
    console.log('Servicios con iconos originales:', services.map(s => ({ title: s.TITLE, icon: s.ICON })));
    
    // Actualizar dashboard
    const serviceSection = document.querySelector('.bg-white.p-6.rounded-lg.border');
    if (serviceSection) {
      const grid = serviceSection.querySelector('.grid');
      if (grid) {
        grid.innerHTML = '';
        services.forEach(service => {
          const correctIcon = getIcon(service.ICON);
          console.log(`Mapeando icono: ${service.ICON} → ${correctIcon}`);
          
          const serviceCard = document.createElement('div');
          serviceCard.className = 'text-center p-4 border rounded-lg hover:shadow-md transition-shadow';
          serviceCard.innerHTML = `
            <div class="text-4xl mb-3">${correctIcon}</div>
            <h3 class="text-lg font-semibold mb-2">${service.TITLE || 'Servicio'}</h3>
            <p class="text-gray-600">${service.DESCRIPTION || 'Descripción del servicio'}</p>
          `;
          grid.appendChild(serviceCard);
        });
        console.log('✅ Dashboard actualizado con iconos correctos');
      }
    }
    
    // Configurar observer para modal
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && node.classList && node.classList.contains('fixed')) {
              console.log('Modal detectado, actualizando con iconos...');
              setTimeout(() => {
                const modal = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
                if (modal) {
                  const grid = modal.querySelector('.grid');
                  if (grid) {
                    grid.innerHTML = '';
                    services.forEach(service => {
                      const correctIcon = getIcon(service.ICON);
                      const serviceCard = document.createElement('div');
                      serviceCard.className = 'bg-gray-50 p-6 rounded-lg hover:shadow-md transition-shadow';
                      serviceCard.innerHTML = `
                        <div class="flex items-start space-x-4">
                          <div class="text-4xl flex-shrink-0">${correctIcon}</div>
                          <div class="flex-1">
                            <h3 class="text-xl font-semibold text-gray-900 mb-2">${service.TITLE || 'Servicio'}</h3>
                            <p class="text-gray-600 leading-relaxed">${service.DESCRIPTION || 'Descripción del servicio'}</p>
                          </div>
                        </div>
                      `;
                      grid.appendChild(serviceCard);
                    });
                    console.log('✅ Modal actualizado con iconos correctos');
                  }
                }
              }, 100);
            }
          });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// ============================================================================
// SCRIPT 5: SOLUCIÓN PERMANENTE (AUTO-EJECUTABLE)
// ============================================================================
/**
 * Propósito: Script que se ejecuta automáticamente y persiste
 * Uso: Solución más completa que no requiere ejecución manual
 */
(function() {
  console.log('Script permanente cargado...');
  
  async function updateServices() {
    try {
      const response = await fetch('https://experimento2-production.up.railway.app/api/parametros/services');
      const services = await response.json();
      
      // Actualizar dashboard
      const serviceSection = document.querySelector('.bg-white.p-6.rounded-lg.border');
      if (serviceSection) {
        const grid = serviceSection.querySelector('.grid');
        if (grid) {
          grid.innerHTML = '';
          services.forEach(service => {
            const correctIcon = getIcon(service.ICON);
            const serviceCard = document.createElement('div');
            serviceCard.className = 'text-center p-4 border rounded-lg hover:shadow-md transition-shadow';
            serviceCard.innerHTML = `
              <div class="text-4xl mb-3">${correctIcon}</div>
              <h3 class="text-lg font-semibold mb-2">${service.TITLE || 'Servicio'}</h3>
              <p class="text-gray-600">${service.DESCRIPTION || 'Descripción del servicio'}</p>
            `;
            grid.appendChild(serviceCard);
          });
          console.log('✅ Dashboard actualizado');
        }
      }
      
      // Configurar observer para modal
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === 1 && node.classList && node.classList.contains('fixed')) {
                console.log('Modal detectado, actualizando...');
                setTimeout(() => {
                  const modal = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
                  if (modal) {
                    const grid = modal.querySelector('.grid');
                    if (grid) {
                      grid.innerHTML = '';
                      services.forEach(service => {
                        const correctIcon = getIcon(service.ICON);
                        const serviceCard = document.createElement('div');
                        serviceCard.className = 'bg-gray-50 p-6 rounded-lg hover:shadow-md transition-shadow';
                        serviceCard.innerHTML = `
                          <div class="flex items-start space-x-4">
                            <div class="text-4xl flex-shrink-0">${correctIcon}</div>
                            <div class="flex-1">
                              <h3 class="text-xl font-semibold text-gray-900 mb-2">${service.TITLE || 'Servicio'}</h3>
                              <p class="text-gray-600 leading-relaxed">${service.DESCRIPTION || 'Descripción del servicio'}</p>
                            </div>
                          </div>
                        `;
                        grid.appendChild(serviceCard);
                      });
                      console.log('✅ Modal actualizado');
                    }
                  }
                }, 100);
              }
            });
          }
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      console.log('✅ Script permanente configurado');
      
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  // Ejecutar cuando la página esté lista
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateServices);
  } else {
    updateServices();
  }
  
  // También ejecutar después de un tiempo por si acaso
  setTimeout(updateServices, 1000);
  
})();

// ============================================================================
// INSTRUCCIONES DE USO
// ============================================================================
/**
 * CÓMO USAR ESTOS SCRIPTS:
 * 
 * 1. DIAGNÓSTICO:
 *    - Ejecutar: diagnoseServices()
 *    - Propósito: Verificar si los servicios llegan correctamente
 * 
 * 2. ACTUALIZACIÓN BÁSICA:
 *    - Ejecutar: updateDashboardServices()
 *    - Propósito: Solo actualizar el dashboard
 * 
 * 3. ACTUALIZACIÓN CON ICONOS:
 *    - Ejecutar: updateServicesWithIcons()
 *    - Propósito: Actualizar dashboard y modal con iconos correctos
 * 
 * 4. SOLUCIÓN PERMANENTE:
 *    - Ejecutar: (copiar todo el script 5)
 *    - Propósito: Se ejecuta automáticamente y persiste
 * 
 * PASOS RECOMENDADOS:
 * 1. Abrir consola del navegador (F12)
 * 2. Ejecutar diagnoseServices() para verificar datos
 * 3. Ejecutar updateServicesWithIcons() para arreglar todo
 * 4. Verificar que funcionan dashboard y modal
 * 
 * NOTA: Estos scripts son temporales hasta que se complete el deploy de Vercel
 */

console.log('Scripts de servicios cargados. Usa las funciones:');
console.log('- diagnoseServices() - Para diagnóstico');
console.log('- updateDashboardServices() - Solo dashboard');
console.log('- updateServicesWithIcons() - Completo con iconos'); 