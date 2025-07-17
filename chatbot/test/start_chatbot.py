#!/usr/bin/env python3
"""
Script simple para iniciar el chatbot mejorado
"""

import subprocess
import sys
import time
import os

def main():
    """Inicia el chatbot mejorado"""
    print("🚀 Iniciando chatbot mejorado...")
    print("📍 Puerto: http://localhost:8000")
    print("📍 Health check: http://localhost:8000/health")
    print("📍 Chat endpoint: http://localhost:8000/chat")
    print("\nPresiona Ctrl+C para detener el chatbot")
    print("=" * 50)
    
    try:
        # Verificar que el archivo existe
        if not os.path.exists("main_improved.py"):
            print("❌ No se encontró main_improved.py")
            print("   Asegúrate de estar en el directorio correcto")
            return
        
        # Iniciar el chatbot
        subprocess.run([sys.executable, "main_improved.py"])
        
    except KeyboardInterrupt:
        print("\n\n🛑 Chatbot detenido por el usuario")
    except Exception as e:
        print(f"\n❌ Error iniciando chatbot: {e}")

if __name__ == "__main__":
    main() 