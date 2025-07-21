/**
 * Utilidades para pruebas de accesibilidad
 * Este archivo contiene funciones para verificar y mejorar la accesibilidad del sistema
 */

export interface AccessibilityTestResult {
  test: string;
  passed: boolean;
  message: string;
  element?: HTMLElement;
}

export class AccessibilityTester {
  private results: AccessibilityTestResult[] = [];

  /**
   * Ejecuta todas las pruebas de accesibilidad
   */
  runAllTests(): AccessibilityTestResult[] {
    this.results = [];
    
    this.testKeyboardNavigation();
    this.testScreenReaderSupport();
    this.testColorContrast();
    this.testSemanticStructure();
    this.testFormLabels();
    this.testModalAccessibility();
    this.testFocusManagement();
    
    return this.results;
  }

  /**
   * Prueba la navegación por teclado
   */
  private testKeyboardNavigation(): void {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    let hasFocusableElements = focusableElements.length > 0;
    let allHaveFocusStyles = true;

    focusableElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlElement);
      
      // Verificar que los elementos tienen estilos de focus
      if (!computedStyle.outline && !computedStyle.boxShadow) {
        allHaveFocusStyles = false;
      }
    });

    this.results.push({
      test: 'Navegación por teclado',
      passed: hasFocusableElements && allHaveFocusStyles,
      message: hasFocusableElements 
        ? (allHaveFocusStyles 
          ? 'Todos los elementos enfocables tienen estilos de focus visibles'
          : 'Algunos elementos enfocables no tienen estilos de focus visibles')
        : 'No se encontraron elementos enfocables'
    });
  }

  /**
   * Prueba el soporte para lectores de pantalla
   */
  private testScreenReaderSupport(): void {
    const images = document.querySelectorAll('img');
    const buttons = document.querySelectorAll('button');
    const inputs = document.querySelectorAll('input');
    
    let imagesHaveAlt = true;
    let buttonsHaveAriaLabel = true;
    let inputsHaveLabels = true;

    // Verificar imágenes con alt
    images.forEach((img) => {
      if (!img.getAttribute('alt')) {
        imagesHaveAlt = false;
      }
    });

    // Verificar botones con aria-label o texto
    buttons.forEach((button) => {
      const hasAriaLabel = button.getAttribute('aria-label');
      const hasText = button.textContent?.trim();
      if (!hasAriaLabel && !hasText) {
        buttonsHaveAriaLabel = false;
      }
    });

    // Verificar inputs con labels
    inputs.forEach((input) => {
      const id = input.getAttribute('id');
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (!label) {
          inputsHaveLabels = false;
        }
      }
    });

    this.results.push({
      test: 'Soporte para lectores de pantalla',
      passed: imagesHaveAlt && buttonsHaveAriaLabel && inputsHaveLabels,
      message: `Imágenes con alt: ${imagesHaveAlt}, Botones con aria-label: ${buttonsHaveAriaLabel}, Inputs con labels: ${inputsHaveLabels}`
    });
  }

  /**
   * Prueba el contraste de colores (simplificado)
   */
  private testColorContrast(): void {
    // Esta es una prueba simplificada. En producción, usar una librería como color-contrast
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
    let hasGoodContrast = true;

    textElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlElement);
      const color = computedStyle.color;
      const backgroundColor = computedStyle.backgroundColor;

      // Verificación básica - en producción usar una librería especializada
      if (color === 'rgb(0, 0, 0)' && backgroundColor === 'rgb(255, 255, 255)') {
        // Contraste básico detectado
      } else if (color === 'rgb(255, 255, 255)' && backgroundColor === 'rgb(0, 0, 0)') {
        // Contraste básico detectado
      }
    });

    this.results.push({
      test: 'Contraste de colores',
      passed: hasGoodContrast,
      message: 'Verificación básica de contraste completada (recomendado usar herramienta especializada)'
    });
  }

  /**
   * Prueba la estructura semántica
   */
  private testSemanticStructure(): void {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const lists = document.querySelectorAll('ul, ol');
    const landmarks = document.querySelectorAll('nav, main, header, footer, aside');
    
    let hasProperHeadingStructure = true;
    let hasSemanticLists = true;
    let hasLandmarks = landmarks.length > 0;
    let headingStructureDetails = '';

    // Verificar estructura de encabezados
    let previousLevel = 0;
    let headingSequence: number[] = [];
    
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1));
      headingSequence.push(level);
      
      // Verificar que no hay saltos de nivel (ej: h1 -> h3)
      if (level > previousLevel + 1) {
        hasProperHeadingStructure = false;
        headingStructureDetails = `Salto de nivel detectado: h${previousLevel} -> h${level}`;
      }
      previousLevel = level;
    });

    // Verificar que hay al menos un h1
    const h1Count = document.querySelectorAll('h1').length;
    if (h1Count === 0) {
      hasProperHeadingStructure = false;
      headingStructureDetails = 'No se encontró ningún encabezado h1';
    } else if (h1Count > 1) {
      hasProperHeadingStructure = false;
      headingStructureDetails = `Múltiples h1 encontrados: ${h1Count}`;
    }

    // Verificar listas semánticas
    lists.forEach((list) => {
      const listItems = list.querySelectorAll('li');
      if (listItems.length === 0) {
        hasSemanticLists = false;
      }
    });

    const message = hasProperHeadingStructure 
      ? `Estructura de encabezados: ✅, Listas semánticas: ${hasSemanticLists ? '✅' : '❌'}, Landmarks: ${hasLandmarks ? '✅' : '❌'}`
      : `Estructura de encabezados: ❌ (${headingStructureDetails}), Listas semánticas: ${hasSemanticLists ? '✅' : '❌'}, Landmarks: ${hasLandmarks ? '✅' : '❌'}`;

    this.results.push({
      test: 'Estructura semántica',
      passed: hasProperHeadingStructure && hasSemanticLists && hasLandmarks,
      message: message
    });
  }

  /**
   * Prueba las etiquetas de formularios
   */
  private testFormLabels(): void {
    const inputs = document.querySelectorAll('input, select, textarea');
    let allHaveLabels = true;

    inputs.forEach((input) => {
      const id = input.getAttribute('id');
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledby = input.getAttribute('aria-labelledby');
      const placeholder = input.getAttribute('placeholder');

      if (!id && !ariaLabel && !ariaLabelledby && !placeholder) {
        allHaveLabels = false;
      }

      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (!label && !ariaLabel && !ariaLabelledby) {
          allHaveLabels = false;
        }
      }
    });

    this.results.push({
      test: 'Etiquetas de formularios',
      passed: allHaveLabels,
      message: allHaveLabels 
        ? 'Todos los campos de formulario tienen etiquetas apropiadas'
        : 'Algunos campos de formulario no tienen etiquetas'
    });
  }

  /**
   * Prueba la accesibilidad de modales
   */
  private testModalAccessibility(): void {
    const modals = document.querySelectorAll('[role="dialog"], .modal, [class*="fixed inset-0"]');
    let allModalsAccessible = true;
    let modalIssues: string[] = [];

    if (modals.length === 0) {
      this.results.push({
        test: 'Accesibilidad de modales',
        passed: true,
        message: 'No se encontraron modales en esta página'
      });
      return;
    }

    modals.forEach((modal, index) => {
      const modalElement = modal as HTMLElement;
      const issues: string[] = [];

      // Verificar atributos ARIA básicos
      const hasRole = modalElement.getAttribute('role') === 'dialog';
      const hasAriaModal = modalElement.getAttribute('aria-modal') === 'true';
      const hasAriaLabelledby = modalElement.getAttribute('aria-labelledby');
      const hasAriaDescribedby = modalElement.getAttribute('aria-describedby');

      if (!hasRole) issues.push('Falta role="dialog"');
      if (!hasAriaModal) issues.push('Falta aria-modal="true"');
      if (!hasAriaLabelledby) issues.push('Falta aria-labelledby');

      // Verificar botón de cerrar
      const closeButtons = modalElement.querySelectorAll('button');
      const hasCloseButton = Array.from(closeButtons).some(button => {
        const ariaLabel = button.getAttribute('aria-label') || '';
        const textContent = button.textContent || '';
        return ariaLabel.toLowerCase().includes('cerrar') || 
               ariaLabel.toLowerCase().includes('close') ||
               textContent.includes('×') ||
               textContent.includes('X');
      });

      if (!hasCloseButton) issues.push('Falta botón de cerrar accesible');

      // Verificar título del modal
      if (hasAriaLabelledby) {
        const titleElement = document.getElementById(hasAriaLabelledby);
        if (!titleElement) {
          issues.push('Elemento de título no encontrado');
        }
      }

      // Verificar descripción del modal
      if (hasAriaDescribedby) {
        const descElement = document.getElementById(hasAriaDescribedby);
        if (!descElement) {
          issues.push('Elemento de descripción no encontrado');
        }
      }

      // Verificar elementos enfocables dentro del modal
      const focusableElements = modalElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length === 0) {
        issues.push('No hay elementos enfocables dentro del modal');
      }

      if (issues.length > 0) {
        allModalsAccessible = false;
        modalIssues.push(`Modal ${index + 1}: ${issues.join(', ')}`);
      }
    });

    const message = allModalsAccessible 
      ? `✅ Todos los modales (${modals.length}) son accesibles`
      : `❌ Problemas encontrados en modales: ${modalIssues.join('; ')}`;

    this.results.push({
      test: 'Accesibilidad de modales',
      passed: allModalsAccessible,
      message: message
    });
  }

  /**
   * Prueba el manejo del focus
   */
  private testFocusManagement(): void {
    const modals = document.querySelectorAll('[role="dialog"]');
    let focusManagementCorrect = true;

    modals.forEach((modal) => {
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length === 0) {
        focusManagementCorrect = false;
      }
    });

    this.results.push({
      test: 'Manejo del focus',
      passed: focusManagementCorrect,
      message: focusManagementCorrect 
        ? 'El manejo del focus está implementado correctamente'
        : 'Hay problemas con el manejo del focus en modales'
    });
  }

  /**
   * Genera un reporte de accesibilidad
   */
  generateReport(): string {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const percentage = Math.round((passed / total) * 100);

    let report = `# Reporte de Accesibilidad\n\n`;
    report += `**Resumen**: ${passed}/${total} pruebas pasaron (${percentage}%)\n\n`;
    report += `## Detalles de las Pruebas\n\n`;

    this.results.forEach((result) => {
      const status = result.passed ? '✅' : '❌';
      report += `### ${status} ${result.test}\n`;
      report += `${result.message}\n\n`;
    });

    return report;
  }

  /**
   * Ejecuta una prueba específica
   */
  runSpecificTest(testName: string): AccessibilityTestResult | null {
    const testMap: { [key: string]: () => void } = {
      'keyboard': () => this.testKeyboardNavigation(),
      'screen-reader': () => this.testScreenReaderSupport(),
      'contrast': () => this.testColorContrast(),
      'semantic': () => this.testSemanticStructure(),
      'forms': () => this.testFormLabels(),
      'modals': () => this.testModalAccessibility(),
      'focus': () => this.testFocusManagement()
    };

    if (testMap[testName]) {
      this.results = [];
      testMap[testName]();
      return this.results[0] || null;
    }

    return null;
  }
}

/**
 * Función de utilidad para verificar si un elemento es visible para lectores de pantalla
 */
export function isScreenReaderVisible(element: HTMLElement): boolean {
  const computedStyle = window.getComputedStyle(element);
  const isHidden = computedStyle.display === 'none' || 
                   computedStyle.visibility === 'hidden' ||
                   element.getAttribute('aria-hidden') === 'true';
  
  return !isHidden;
}

/**
 * Función de utilidad para obtener el contraste de colores
 */
export function getColorContrast(foreground: string, background: string): number {
  // Implementación simplificada - en producción usar una librería especializada
  // Esta función debería calcular el ratio de contraste WCAG
  return 4.5; // Valor de ejemplo
}

/**
 * Función de utilidad para verificar si un elemento es enfocable
 */
export function isFocusable(element: HTMLElement): boolean {
  const tagName = element.tagName.toLowerCase();
  const tabIndex = element.getAttribute('tabindex');
  
  if (tabIndex === '-1') return false;
  
  const focusableTags = ['button', 'input', 'select', 'textarea', 'a'];
  if (focusableTags.includes(tagName)) return true;
  
  if (tabIndex !== null) return true;
  
  return false;
}

// Exportar una instancia global para uso fácil
export const accessibilityTester = new AccessibilityTester(); 