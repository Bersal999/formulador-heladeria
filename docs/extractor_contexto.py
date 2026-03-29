import os
import argparse
from pathlib import Path
import time

# ============================================================================
# CONFIGURACIÓN DEL ARQUITECTO
# ============================================================================
# Directorios que el script ignorará completamente para ahorrar tokens y tiempo
DIRECTORIOS_IGNORADOS = {
    '.git', '.vscode', '.idea', '__pycache__', 'venv', 'env', 
    'node_modules', 'dist', 'build', '.pytest_cache'
}

# Extensiones de archivos que no contienen texto útil para el LLM
EXTENSIONES_IGNORADAS = {
    # Binarios y multimedia
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.mp4', '.mp3', '.wav',
    # Documentos compilados o empaquetados
    '.pdf', '.zip', '.tar', '.gz', '.rar', '.7z',
    # Archivos compilados o de bases de datos locales
    '.pyc', '.pyo', '.pyd', '.so', '.dll', '.class', '.sqlite3', '.db', '.DS_Store'
}

def es_archivo_valido(ruta_archivo: Path) -> bool:
    """Valida si el archivo debe ser procesado según su extensión y directorio."""
    # Revisar si alguna parte de la ruta está en la lista de ignorados
    for parte in ruta_archivo.parts:
        if parte in DIRECTORIOS_IGNORADOS:
            return False
            
    # Revisar si la extensión es ignorada
    if ruta_archivo.suffix.lower() in EXTENSIONES_IGNORADAS:
        return False
        
    return True

def extraer_codigo(directorio_origen: str, archivo_salida: str) -> None:
    """Extrae y formatea todo el código del directorio en un solo archivo de texto."""
    ruta_origen = Path(directorio_origen).resolve()
    ruta_salida = Path(archivo_salida).resolve()
    
    if not ruta_origen.is_dir():
        print(f"[ERROR] El directorio '{directorio_origen}' no existe.")
        return

    archivos_procesados = 0
    archivos_omitidos = 0
    inicio_tiempo = time.time()

    print(f"[*] Iniciando extracción en: {ruta_origen}")
    print(f"[*] Archivo de destino: {ruta_salida.name}\n")

    with ruta_salida.open('w', encoding='utf-8') as f_salida:
        # Escribir cabecera del documento
        f_salida.write("# " + "="*78 + "\n")
        f_salida.write(f"# EXTRACCIÓN DE CONTEXTO DE CÓDIGO\n")
        f_salida.write(f"# Directorio Base: {ruta_origen.name}\n")
        f_salida.write("# " + "="*78 + "\n\n")

        # Recorrer el árbol de directorios
        for raiz, directorios, archivos in os.walk(ruta_origen):
            # Modificar la lista 'directorios' in-place para que os.walk no entre en ellos
            directorios[:] = [d for d in directorios if d not in DIRECTORIOS_IGNORADOS]
            
            for nombre_archivo in archivos:
                ruta_completa = Path(raiz) / nombre_archivo
                ruta_relativa = ruta_completa.relative_to(ruta_origen)

                # Evitar que el script se lea a sí mismo o al archivo de salida
                if ruta_completa == ruta_salida or nombre_archivo == "extractor_contexto.py":
                    continue

                if not es_archivo_valido(ruta_completa):
                    archivos_omitidos += 1
                    continue

                try:
                    # Intentar leer el archivo asumiendo UTF-8
                    with ruta_completa.open('r', encoding='utf-8') as f_entrada:
                        contenido = f_entrada.read()
                    
                    # Escribir delimitadores claros para el LLM
                    f_salida.write(f"\n{'='*80}\n")
                    f_salida.write(f"--- INICIO DEL ARCHIVO: {ruta_relativa} ---\n")
                    f_salida.write(f"{'='*80}\n\n")
                    f_salida.write(contenido)
                    f_salida.write(f"\n\n--- FIN DEL ARCHIVO: {ruta_relativa} ---\n")
                    
                    print(f"[+] Procesado: {ruta_relativa}")
                    archivos_procesados += 1
                    
                except UnicodeDecodeError:
                    # Captura silenciosa para archivos binarios sin extensión estándar
                    print(f"[-] Omitido (Binario/Codificación no soportada): {ruta_relativa}")
                    archivos_omitidos += 1
                except Exception as e:
                    print(f"[!] Error leyendo {ruta_relativa}: {str(e)}")

    tiempo_total = time.time() - inicio_tiempo
    print("\n" + "="*50)
    print("RESUMEN DE EXTRACCIÓN (UX/UI)")
    print("="*50)
    print(f"Archivos procesados exitosamente: {archivos_procesados}")
    print(f"Archivos omitidos (ignorados/binarios): {archivos_omitidos}")
    print(f"Tiempo de ejecución: {tiempo_total:.2f} segundos")
    print(f"Archivo generado: {ruta_salida}")
    print("="*50)

if __name__ == "__main__":
    # Configuración de argumentos CLI para uso a nivel Enterprise
    parser = argparse.ArgumentParser(description="Extrae y unifica el código fuente de un directorio para análisis de LLMs.")
    parser.add_argument("-d", "--directorio", type=str, default=".", help="Ruta del directorio a escanear (por defecto: actual)")
    parser.add_argument("-o", "--salida", type=str, default="contexto_proyecto.txt", help="Nombre del archivo de salida")
    
    args = parser.parse_args()
    
    extraer_codigo(args.directorio, args.salida)