import json

pastrypedia_data = {
  "LECHES Y LÁCTEOS": {
    "Leche entera": { "mg": 3.6, "slng": 8.4, "agua": 88, "pac": 4, "pod": 0 },
    "Leche semi-desnatada": { "mg": 1.8, "slng": 8.4, "agua": 89, "pac": 3.6, "pod": 0 },
    "Leche desnatada": { "mg": 0, "slng": 8.4, "agua": 91, "pac": 3.2, "pod": 0 },
    "Nata 35% m.g.": { "mg": 35, "slng": 6, "agua": 59, "pac": 3, "pod": 0 },
    "Nata 38% m.g.": { "mg": 38, "slng": 6, "agua": 56, "pac": 3.6, "pod": 0 },
    "Leche en polvo entera": { "mg": 26, "slng": 74, "agua": 0, "pac": 39, "pod": 0 },
    "Leche en polvo desnatada": { "mg": 0.4, "slng": 100, "agua": 0, "pac": 50, "pod": 0 },
    "Yogurt natural": { "mg": 3.6, "slng": 9.6, "agua": 85, "pac": 5, "pod": 0 },
    "Yogurt Griego": { "mg": 10, "slng": 11, "agua": 80, "pac": 5.8, "pod": 0 },
    "Mascarpone": { "mg": 42.4, "slng": 8.2, "agua": 50, "pac": 1, "pod": 0 },
    "Queso crema": { "mg": 29, "slng": 14, "agua": 56, "pac": 1, "pod": 2 }
  },
  "AZÚCARES": {
    "Sacarosa": { "mg": 0, "slng": 0, "agua": 0, "pac": 100, "pod": 100 },
    "Dextrosa": { "mg": 0, "slng": 0, "agua": 8, "pac": 190, "pod": 70 },
    "Azúcar invertido": { "mg": 0, "slng": 0, "agua": 25, "pac": 190, "pod": 130 },
    "Jarabe de glucosa": { "mg": 0, "slng": 0, "agua": 20, "pac": 108, "pod": 45 },
    "Miel": { "mg": 0, "slng": 0, "agua": 20, "pac": 190, "pod": 130 },
    "Fructosa": { "mg": 0, "slng": 0, "agua": 0, "pac": 190, "pod": 170 },
    "Lactosa": { "mg": 0, "slng": 0, "agua": 0, "pac": 100, "pod": 16 },
    "Glicerina": { "mg": 0, "slng": 0, "agua": 80, "pac": 342, "pod": 75 },
    "Maltodextrina": { "mg": 0, "slng": 0, "agua": 0, "pac": 35, "pod": 15 },
    "Eritritol": { "mg": 0, "slng": 0, "agua": 0, "pac": 280, "pod": 70 },
    "Xilitol": { "mg": 0, "slng": 0, "agua": 0, "pac": 70, "pod": 100 }
  },
  "GRASAS": {
    "Mantequilla": { "mg": 80, "slng": 1, "agua": 16, "pac": -12, "pod": 0 },
    "Manteca de cacao": { "mg": 100, "slng": 0, "agua": 0, "pac": -90, "pod": 0 },
    "Aceite vegetal": { "mg": 100, "slng": 0, "agua": 0, "pac": -90, "pod": 0 }
  },
  "FRUTOS SECOS (Pastas)": {
    "Pistacho (pasta)": { "mg": 46, "slng": 0, "agua": 0, "pac": -74, "pod": 0 },
    "Avellana (pasta)": { "mg": 62, "slng": 0, "agua": 0, "pac": -90, "pod": 0 },
    "Almendra (pasta)": { "mg": 54, "slng": 0, "agua": 0, "pac": -72, "pod": 0 },
    "Nuez pecana (pasta)": { "mg": 75, "slng": 0, "agua": 0, "pac": -102, "pod": 0 },
    "Cacahuate (pasta)": { "mg": 45, "slng": 0, "agua": 0, "pac": -70, "pod": 0 }
  },
  "FRUTAS (Puré/Zumo)": {
    "Mango": { "mg": 0.3, "slng": 0, "agua": 83, "pac": 16, "pod": 15 },
    "Fresa": { "mg": 0.3, "slng": 0, "agua": 91, "pac": 9, "pod": 8.5 },
    "Frambuesa": { "mg": 0.5, "slng": 0, "agua": 85, "pac": 10, "pod": 11 },
    "Kiwi": { "mg": 0.5, "slng": 0, "agua": 83, "pac": 14, "pod": 10 },
    "Limón (zumo)": { "mg": 0.3, "slng": 0, "agua": 91, "pac": 4, "pod": 2.5 }
  },
  "NEUTROS Y COMPLEMENTOS": {
    "Neutro": { "mg": 0, "slng": 0, "agua": 0, "pac": 0, "pod": 0 },
    "Sal": { "mg": 0, "slng": 0, "agua": 0, "pac": 100, "pod": 0 },
    "Yemas de huevo": { "mg": 30, "slng": 0, "agua": 44, "pac": 2, "pod": 0 },
    "Agua": { "mg": 0, "slng": 0, "agua": 100, "pac": 0, "pod": 0 }
  }
}

base_path = r'C:\Users\DUSTER\Documents\Formulador de heladeria\src\data\database.json'
with open(base_path, 'r', encoding='utf-8') as f:
    db = json.load(f)

# Generar un mapeo de nombres existentes
db_names = {ing['nombre'].lower(): ing for ing in db}

new_db = []

# Procesar categorías de Pastrypedia
for cat_name, items in pastrypedia_data.items():
    for item_name, data in items.items():
        # Buscar si ya existe por nombre
        existing = db_names.get(item_name.lower())
        
        # Mapeo de parámetros
        pac_pos = max(0, data['pac'])
        pac_neg = abs(min(0, data['pac']))
        
        new_item = {
            "id": existing['id'] if existing else item_name.lower().replace(" ", "_").replace("(", "").replace(")", ""),
            "nombre": item_name,
            "categoria": cat_name,
            "composicion": {
                "agua": data.get('agua', 0),
                "grasa": data.get('mg', 0),
                "azucares": data.get('pod', 0) if cat_name == "AZÚCARES" else existing['composicion']['azucares'] if existing else 0,
                "sngl": data.get('slng', 0),
                "otros": 0
            },
            "parametros": {
                "pod": data.get('pod', 0),
                "pac_positivo": pac_pos,
                "pac_negativo": pac_neg,
                "indice_glucemico": existing['parametros']['indice_glucemico'] if existing else 0
            }
        }
        new_db.append(new_item)

# Guardar la nueva base de datos
with open(base_path, 'w', encoding='utf-8') as f:
    json.dump(new_db, f, indent=2, ensure_ascii=False)

print("✅ Base de datos actualizada con ADN Pastrypedia.")
