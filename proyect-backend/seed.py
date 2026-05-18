import firebase_admin
from firebase_admin import credentials, firestore

# 1. Conectar a Firebase
print("Conectando a Firebase...")
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# 2. Inyectar Instituciones
print("Creando instituciones...")
db.collection('institutions').add({"name": "Yachay Tech"})
db.collection('institutions').add({"name": "ESPOL"})
db.collection('institutions').add({"name": "Escuela Politécnica Nacional (EPN)"})

# 3. Inyectar Materias
print("Creando materias...")
db.collection('subjects').add({"name": "Bases de Datos"})
db.collection('subjects').add({"name": "Ecuaciones Diferenciales"})
db.collection('subjects').add({"name": "Ciberseguridad"})
db.collection('subjects').add({"name": "Arquitectura de Computadoras"})

print("¡Listo! Revisa tu consola de Firebase, las colecciones ya deben aparecer.")