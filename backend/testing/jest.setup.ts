// jest.setup.ts

// Silencia console.error en tests, excepto si el mensaje es relevante
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    const message = args.join(' ');

    // Si quieres permitir algunos errores concretos, puedes filtrarlos aquí:
    const allowed = ['Error crítico']; // añade aquí excepciones si quieres verlas

    const isAllowed = allowed.some(allowedMsg => message.includes(allowedMsg));

    if (isAllowed) {
      process.stdout.write(`[console.error permitido]: ${message}\n`);
    }

    // Silencia por defecto
  });
});

// Opcional: también silenciar console.log durante tests si quieres
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation((...args) => {
    const message = args.join(' ');
    
    // Solo mostrar logs que contengan palabras clave importantes
    const importantKeywords = ['ERROR', 'CRITICAL', 'FATAL'];
    const isImportant = importantKeywords.some(keyword => 
      message.toUpperCase().includes(keyword)
    );
    
    if (isImportant) {
      process.stdout.write(`[console.log importante]: ${message}\n`);
    }
    
    // Silencia el resto
  });
}); 