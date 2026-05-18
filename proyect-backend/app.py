import firebase_admin
from firebase_admin import credentials, firestore
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

# Configuración de Firebase
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

app = Flask(__name__)
CORS(app)

# ==========================================
# 1. ENDPOINTS DE ESTUDIANTES / AUTH (100%)
# ==========================================

@app.route('/students', methods=['POST'])
def register_student():
    """C: Registrar un nuevo estudiante."""
    try:
        data = request.get_json()
        existing_users = db.collection('students').where("email", "==", data['email']).stream()
        if len(list(existing_users)) > 0:
            return jsonify({"error": "El email ya está registrado"}), 400
            
        student_data = {
            "first_name": data['first_name'],
            "last_name": data['last_name'],
            "username": data['username'],
            "email": data['email'],
            "password": data['password'], 
            "current_semester": data['current_semester'],
            "institution_id": data['institution_id'],
            "registration_date": datetime.utcnow().strftime('%Y-%m-%d')
        }
        _, doc_ref = db.collection('students').add(student_data)
        return jsonify({"message": "Estudiante registrado exitosamente", "student_id": doc_ref.id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/login', methods=['POST'])
def login_student():
    """R: Validar credenciales de inicio de sesión."""
    try:
        data = request.get_json()
        username_or_email = data['username']
        password = data['password']
        
        # Buscar por username
        users = list(db.collection('students').where("username", "==", username_or_email).stream())
        # Si no lo encuentra, buscar por email
        if not users:
            users = list(db.collection('students').where("email", "==", username_or_email).stream())
            
        if not users:
            return jsonify({"error": "Usuario no encontrado"}), 404
            
        user_data = users[0].to_dict()
        if user_data['password'] != password:
            return jsonify({"error": "Contraseña incorrecta"}), 401
            
        return jsonify({
            "message": "Login exitoso", 
            "student_id": users[0].id,
            "username": user_data['username']
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ==========================================
# 2. ENDPOINTS DE RECURSOS CRUD (100%)
# ==========================================

@app.route('/resources', methods=['POST'])
def upload_resource():
    """C: Crear un recurso con descripción y autoría directa."""
    try:
        data = request.get_json()
        
        # Desnormalización: Guardamos el autor directamente en el recurso para lectura rápida
        resource_data = {
            "title": data['title'],
            "description": data.get('description', 'Sin descripción detallada.'), # NUEVO CAMPO
            "difficulty_level": data['difficulty_level'],
            "language": data['language'],
            "subject_id": data['subject_id'],
            "student_id": data['student_id'],             # NUEVO: Para saber quién es el dueño
            "student_username": data['student_username'], # NUEVO: Para mostrarlo en la interfaz
            "upload_date": datetime.utcnow().strftime('%Y-%m-%d'),
            "stats": {"downloads": 0, "likes": 0}
        }
        
        # 1. Crear el recurso
        _, res_ref = db.collection('resources').add(resource_data)
        
        # 2. Registrar la actividad en la tabla puente
        db.collection('activities').add({
            "student_id": data['student_id'],
            "resource_id": res_ref.id,
            "activity_type": "UPLOAD",
            "date": datetime.utcnow()
        })
        return jsonify({"message": "Recurso subido", "id": res_ref.id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
@app.route('/resources', methods=['GET'])
def get_all_resources():
    """R: Leer todos los recursos."""
    try:
        docs = db.collection('resources').stream()
        resources = [{"id": doc.id, **doc.to_dict()} for doc in docs]
        return jsonify(resources), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/resources/<resource_id>', methods=['PUT'])
def update_resource(resource_id):
    """U: Actualizar datos de un recurso."""
    try:
        data = request.get_json()
        res_ref = db.collection('resources').document(resource_id)
        
        if not res_ref.get().exists:
            return jsonify({"error": "Recurso no encontrado"}), 404
            
        # NUEVO: Añadimos 'description' y 'subject_id' a los campos permitidos
        update_data = {k: v for k, v in data.items() if k in ['title', 'description', 'difficulty_level', 'language', 'subject_id']}
        res_ref.update(update_data)
        
        return jsonify({"message": "Recurso actualizado con éxito"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/resources/<resource_id>', methods=['DELETE'])
def delete_resource(resource_id):
    """D: Eliminar un recurso y sus actividades asociadas."""
    try:
        res_ref = db.collection('resources').document(resource_id)
        if not res_ref.get().exists:
            return jsonify({"error": "Recurso no encontrado"}), 404
        
        # 1. Borrar el recurso
        res_ref.delete()
        
        # 2. Borrar las actividades asociadas (para no dejar datos huérfanos)
        activities = db.collection('activities').where("resource_id", "==", resource_id).stream()
        batch = db.batch()
        for act in activities:
            batch.delete(act.reference)
        batch.commit()
            
        return jsonify({"message": "Recurso y actividades eliminadas"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==========================================
# 3. INTERACCIONES
# ==========================================

@app.route('/download', methods=['POST'])
def log_download():
    """Registrar un evento de descarga."""
    try:
        data = request.get_json()
        db.collection('activities').add({
            'student_id': data['student_id'],
            'resource_id': data['resource_id'],
            'activity_type': 'DOWNLOAD',
            'activity_date': datetime.utcnow()
        })
        res_ref = db.collection('resources').document(data['resource_id'])
        res_ref.update({'stats.downloads': firestore.Increment(1)})
        return jsonify({"message": "Descarga registrada"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
    # ==========================================
# 4. TABLAS CATÁLOGO (Institutions & Subjects)
# ==========================================

@app.route('/institutions', methods=['GET', 'POST'])
def manage_institutions():
    """R/C para la colección de Instituciones"""
    if request.method == 'POST':
        data = request.get_json()
        _, doc_ref = db.collection('institutions').add({"name": data['name']})
        return jsonify({"message": "Institución creada", "id": doc_ref.id}), 201
    else:
        docs = db.collection('institutions').stream()
        return jsonify([{"id": doc.id, "name": doc.to_dict().get("name")} for doc in docs]), 200

@app.route('/subjects', methods=['GET', 'POST'])
def manage_subjects():
    """R/C para la colección de Materias"""
    if request.method == 'POST':
        data = request.get_json()
        _, doc_ref = db.collection('subjects').add({"name": data['name']})
        return jsonify({"message": "Materia creada", "id": doc_ref.id}), 201
    else:
        docs = db.collection('subjects').stream()
        return jsonify([{"id": doc.id, "name": doc.to_dict().get("name")} for doc in docs]), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)