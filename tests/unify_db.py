import json
import re
import os

print("Iniciando fusión de bases de datos...")

# 1. Base Pastrypedia + Edulcorantes Técnicos (Hardcoded for perfect precision)
core_data = {
  'LECHES Y LÁCTEOS': {
    'Leche entera': { 'mg': 3.6, 'slng': 8.4, 'agua': 88, 'pac': 4, 'pod': 0 },
    'Leche semi-desnatada': { 'mg': 1.8, 'slng': 8.4, 'agua': 89, 'pac': 3.6, 'pod': 0 },
    'Leche desnatada': { 'mg': 0, 'slng': 8.4, 'agua': 91, 'pac': 3.2, 'pod': 0 },
    'Nata 35% m.g.': { 'mg': 35, 'slng': 6, 'agua': 59, 'pac': 3, 'pod': 0 },
    'Nata 38% m.g.': { 'mg': 38, 'slng': 6, 'agua': 56, 'pac': 3.6, 'pod': 0 },
    'Leche en polvo entera': { 'mg': 26, 'slng': 74, 'agua': 0, 'pac': 39, 'pod': 0 },
    'Leche en polvo desnatada': { 'mg': 0.4, 'slng': 100, 'agua': 0, 'pac': 50, 'pod': 0 },
    'Yogurt natural': { 'mg': 3.6, 'slng': 9.6, 'agua': 85, 'pac': 5, 'pod': 0 },
    'Yogurt Griego': { 'mg': 10, 'slng': 11, 'agua': 80, 'pac': 5.8, 'pod': 0 },
    'Mascarpone': { 'mg': 42.4, 'slng': 8.2, 'agua': 50, 'pac': 1, 'pod': 0 },
    'Queso crema': { 'mg': 29, 'slng': 14, 'agua': 56, 'pac': 1, 'pod': 2 }
  },
  'EDULCORANTES Y FIBRAS': {
    'Eritritol': { 'mg': 0, 'slng': 0, 'agua': 0, 'pac': 280, 'pod': 70 },
    'Xilitol': { 'mg': 0, 'slng': 0, 'agua': 0, 'pac': 190, 'pod': 100 },
    'Maltitol': { 'mg': 0, 'slng': 0, 'agua': 0, 'pac': 100, 'pod': 85 },
    'Isomalt': { 'mg': 0, 'slng': 0, 'agua': 0, 'pac': 100, 'pod': 50 },
    'Inulina (Polidextrosa)': { 'mg': 0, 'slng': 0, 'agua': 0, 'pac': 30, 'pod': 10 }
  },
  'AZÚCARES CLÁSICOS': {
    'Sacarosa': { 'mg': 0, 'slng': 0, 'agua': 0, 'pac': 100, 'pod': 100 },
    'Dextrosa': { 'mg': 0, 'slng': 0, 'agua': 8, 'pac': 190, 'pod': 70 },
    'Azúcar invertido': { 'mg': 0, 'slng': 0, 'agua': 25, 'pac': 190, 'pod': 130 },
    'Jarabe de glucosa (42 DE)': { 'mg': 0, 'slng': 0, 'agua': 20, 'pac': 90, 'pod': 50 },
    'Jarabe de glucosa (62 DE)': { 'mg': 0, 'slng': 0, 'agua': 20, 'pac': 120, 'pod': 64 },
    'Maltodextrina 18 DE': { 'mg': 0, 'slng': 0, 'agua': 5, 'pac': 35, 'pod': 15 },
    'Fructosa': { 'mg': 0, 'slng': 0, 'agua': 0, 'pac': 190, 'pod': 170 },
    'Lactosa': { 'mg': 0, 'slng': 0, 'agua': 0, 'pac': 100, 'pod': 16 },
    'Miel': { 'mg': 0, 'slng': 0, 'agua': 20, 'pac': 190, 'pod': 130 }
  },
  'GRASAS Y PASTAS': {
    'Mantequilla': { 'mg': 80, 'slng': 1, 'agua': 16, 'pac': -12, 'pod': 0 },
    'Manteca de cacao': { 'mg': 100, 'slng': 0, 'agua': 0, 'pac': -90, 'pod': 0 },
    'Pasta de Pistacho': { 'mg': 50, 'slng': 50, 'agua': 0, 'pac': -70, 'pod': 0 },
    'Pasta de Avellana': { 'mg': 65, 'slng': 35, 'agua': 0, 'pac': -91, 'pod': 0 },
    'Cacao en Polvo 22/24': { 'mg': 22, 'slng': 78, 'agua': 0, 'pac': -160, 'pod': 0 },
    'Cacao Puro desgrasado': { 'mg': 11, 'slng': 89, 'agua': 0, 'pac': -180, 'pod': 0 }
  },
  'COMPLEMENTOS': {
    'Neutro Genérico': { 'mg': 0, 'slng': 0, 'agua': 0, 'pac': 0, 'pod': 0 },
    'Sal': { 'mg': 0, 'slng': 0, 'agua': 0, 'pac': 100, 'pod': 0 },
    'Yema de huevo': { 'mg': 30, 'slng': 0, 'agua': 44, 'pac': 2, 'pod': 0 },
    'Agua': { 'mg': 0, 'slng': 0, 'agua': 100, 'pac': 0, 'pod': 0 }
  }
}

new_db = []

def generate_id(name):
    # Genera un ID amigable sin espacios ni acentos
    id_str = name.lower()
    replacements = {'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', ' ': '_', '(': '', ')': '', '%': ''}
    for old, new in replacements.items():
        id_str = id_str.replace(old, new)
    return id_str

def add_item(name, cat, data):
    azucares_total = data.get('azucares', data.get('pod', 0) if 'AZÚCARES' in cat or 'EDULCORANTES' in cat else 0)
    
    agua = data.get('agua', 0)
    grasa = data.get('mg', 0)
    slng = data.get('slng', 0)
    
    # Resto de sólidos no azúcar ni grasa ni slng
    otros = max(0, 100 - (agua + grasa + azucares_total + slng))
    
    new_db.append({
        'id': generate_id(name),
        'nombre': name,
        'categoria': cat,
        'composicion': {
            'agua': round(agua, 2),
            'grasa': round(grasa, 2),
            'azucares': round(azucares_total, 2),
            'sngl': round(slng, 2),
            'otros': round(otros, 2)
        },
        'parametros': {
            'pod': round(data.get('pod', 0), 2),
            'pac_positivo': round(max(0, data.get('pac', 0)), 2),
            'pac_negativo': -round(min(0, data.get('pac', 0)), 2),
            'indice_glucemico': 0
        }
    })

# Añadir datos base
for cat, items in core_data.items():
    for name, data in items.items():
        add_item(name, cat, data)

# 2. Extract Fruits from Gap 4
gap4_path = os.path.join("Info helados", "Gap 4.txt")
if os.path.exists(gap4_path):
    print("Leyendo frutas desde Gap 4.txt...")
    with open(gap4_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    for line in lines:
        if line.startswith('| **'):
            parts = line.split('|')
            if len(parts) >= 5:
                # Ejemplo: | **Naranja** (Valencia, MX) | 2.4 | 2.4 | 4.7 |
                fruit_name = parts[1].split('**')[1].strip()
                try:
                    gluc = float(parts[2].strip())
                    fruc = float(parts[3].strip())
                    sac = float(parts[4].strip())
                    
                    # Cálculo riguroso de PAC y POD
                    pac = (gluc * 1.9) + (fruc * 1.9) + (sac * 1.0)
                    pod = (gluc * 0.7) + (fruc * 1.7) + (sac * 1.0)
                    total_sugar = gluc + fruc + sac
                    
                    # Agua aproximada basada en el resto (menos ~2% de fibra/semillas)
                    water = 100 - total_sugar - 2.0
                    
                    add_item(fruit_name, 'FRUTAS', {
                        'mg': 0.1,
                        'slng': 1.9, # Fibra
                        'agua': water,
                        'pac': pac,
                        'pod': pod,
                        'azucares': total_sugar
                    })
                except Exception as e:
                    print(f"Error procesando {fruit_name}: {e}")
else:
    print("Advertencia: No se encontró Gap 4.txt, omitiendo frutas.")

# Save to DB
db_path = os.path.join("src", "data", "database.json")
try:
    with open(db_path, 'w', encoding='utf-8') as f:
        json.dump(new_db, f, indent=2, ensure_ascii=False)
    print(f"✅ ¡Éxito! Base de datos unificada generada en database.json con {len(new_db)} ingredientes totales.")
except Exception as e:
    print(f"Error al guardar la base de datos: {e}")
