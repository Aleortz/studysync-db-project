import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, GraduationCap, Eye, EyeOff, Terminal, Lock, User, Mail, Trash, Edit, Book, Plus, Check, X
} from 'lucide-react';
import { useState, useEffect } from 'react';

// URL de conexión con tu API de Flask
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
type ViewState = 'register' | 'login' | 'dashboard';

export default function App() {
  const [view, setView] = useState<ViewState>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string, username: string } | null>(null);

  // Estados para Instituciones (Catálogo Dinámico)
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [isAddingInstitution, setIsAddingInstitution] = useState(false);
  const [newInstitutionName, setNewInstitutionName] = useState('');

  // Estados para almacenar los datos de los formularios
  const [registerData, setRegisterData] = useState({
    first_name: '', last_name: '', username: '', email: '', password: '', current_semester: '', institution_id: ''
  });
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  // Cargar las instituciones desde el Backend al iniciar la aplicación
  const fetchInstitutions = async () => {
    try {
      const res = await fetch(`${API_URL}/institutions`);
      const data = await res.json();
      setInstitutions(data);
      if (data.length > 0 && !registerData.institution_id) {
        setRegisterData(prev => ({ ...prev, institution_id: data[0].id }));
      }
    } catch (err) {
      console.error("Error al cargar instituciones:", err);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  // Guardar una nueva institución en la Base de Datos
  const handleAddNewInstitution = async () => {
    if (!newInstitutionName.trim()) return;
    try {
      const res = await fetch(`${API_URL}/institutions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newInstitutionName })
      });
      if (res.ok) {
        const data = await res.json();
        await fetchInstitutions(); // Recargar el catálogo
        setRegisterData(prev => ({ ...prev, institution_id: data.id })); // Autoseleccionar la nueva
        setIsAddingInstitution(false);
        setNewInstitutionName('');
      }
    } catch (error) {
      console.error("Error al crear institución:", error);
    }
  };

  // Enviar registro de estudiante a Flask
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });
      if (response.ok) {
        alert('¡Cuenta creada exitosamente en la Base de Datos!');
        setView('login');
      } else {
        const err = await response.json();
        alert(`Error en el registro: ${err.error}`);
      }
    } catch (error) {
      alert('Error de conexión con el servidor de Backend.');
    }
  };

  // Autenticación Real conectada a Firebase mediante Flask
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser({ id: data.student_id, username: data.username });
        setView('dashboard');
      } else {
        const err = await response.json();
        alert(`Validación fallida: ${err.error}`);
      }
    } catch (error) {
      alert('Error de conexión con el servidor de Backend.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-surface-base selection:bg-brand-primary/30">
      <AnimatePresence mode="wait">
        {view === 'dashboard' && currentUser ? (
          <Dashboard key="dashboard" currentUser={currentUser} onLogout={() => { setCurrentUser(null); setView('login'); }} />
        ) : (
          <div key="auth" className="min-h-screen flex flex-col bg-[#050505]">
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Encabezado Principal */}
            <header className="sticky top-0 w-full z-50 border-b border-white/5 bg-[#050505]/70 backdrop-blur-xl px-8 h-20 flex justify-between items-center">
              <span className="text-2xl font-black text-white tracking-tighter font-display uppercase italic">StudySync</span>
              <nav className="flex gap-8 items-center">
                <button onClick={() => setView('register')} className={`font-display pb-1 transition-all ${view === 'register' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-[#908fa1] hover:text-white'}`}>Register</button>
                <button onClick={() => setView('login')} className={`font-display pb-1 transition-all ${view === 'login' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-[#908fa1] hover:text-white'}`}>Login</button>
              </nav>
            </header>

            {/* Layout de Autenticación */}
            <main className="flex-grow flex items-center justify-center px-6 py-12 relative z-10">
              <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="hidden lg:flex flex-col space-y-10">
                  <h1 className="font-display text-6xl font-bold text-white leading-[1.1]">
                    Your Academic <br /><span className="text-emerald-400">Collective Memory.</span>
                  </h1>
                  <p className="text-lg text-[#c7c4d8] max-w-md">Join a global network of students sharing distilled knowledge.</p>
                </motion.div>

                {/* Contenedor de Formularios */}
                <div className="w-full max-w-lg mx-auto">
                  <AnimatePresence mode="wait">
                    {view === 'register' ? (
                      <motion.div key="register" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[#0a0a0c] border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
                        <h2 className="text-3xl font-display font-bold text-white mb-6">Create Account</h2>
                        <form className="space-y-4" onSubmit={handleRegister}>
                          <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="First Name" mercantile-identity="true" required value={registerData.first_name} onChange={e => setRegisterData({ ...registerData, first_name: e.target.value })} className="w-full bg-[#131316] border border-[#464556] text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 text-sm" />
                            <input type="text" placeholder="Last Name" required value={registerData.last_name} onChange={e => setRegisterData({ ...registerData, last_name: e.target.value })} className="w-full bg-[#131316] border border-[#464556] text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 text-sm" />
                          </div>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#464556]" size={18} />
                            <input type="text" placeholder="Username" required value={registerData.username} onChange={e => setRegisterData({ ...registerData, username: e.target.value })} className="w-full bg-[#131316] border border-[#464556] text-white rounded-xl pl-12 pr-4 py-3 outline-none focus:border-emerald-500 text-sm" />
                          </div>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#464556]" size={18} />
                            <input type="email" placeholder="Email Address" required value={registerData.email} onChange={e => setRegisterData({ ...registerData, email: e.target.value })} className="w-full bg-[#131316] border border-[#464556] text-white rounded-xl pl-12 pr-4 py-3 outline-none focus:border-emerald-500 text-sm" />
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#464556]" size={18} />
                            <input type={showPassword ? "text" : "password"} placeholder="Password" required value={registerData.password} onChange={e => setRegisterData({ ...registerData, password: e.target.value })} className="w-full bg-[#131316] border border-[#464556] text-white rounded-xl pl-12 pr-12 py-3 outline-none focus:border-emerald-500 text-sm" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="Semester (e.g. 6th)" required value={registerData.current_semester} onChange={e => setRegisterData({ ...registerData, current_semester: e.target.value })} className="w-full bg-[#131316] border border-[#464556] text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 text-sm" />

                            {/* Desplegable Dinámico de Universidad + Botón "+" */}
                            <div className="relative flex gap-2">
                              {!isAddingInstitution ? (
                                <>
                                  <select value={registerData.institution_id} onChange={e => setRegisterData({ ...registerData, institution_id: e.target.value })} className="w-full bg-[#131316] border border-[#464556] text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 text-sm cursor-pointer">
                                    {institutions.map(inst => (
                                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                                    ))}
                                  </select>
                                  <button type="button" onClick={() => setIsAddingInstitution(true)} className="bg-[#1f1f22] border border-[#464556] text-emerald-400 px-3 rounded-xl hover:bg-[#2a2a2d] transition-colors" title="Add New Institution">
                                    <Plus size={16} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <input type="text" placeholder="New Institution..." value={newInstitutionName} onChange={e => setNewInstitutionName(e.target.value)} className="w-full bg-[#131316] border border-emerald-500 text-white rounded-xl px-4 py-3 outline-none text-sm" autoFocus />
                                  <button type="button" onClick={handleAddNewInstitution} className="bg-emerald-500/20 text-emerald-400 px-2 rounded-xl hover:bg-emerald-500 hover:text-white transition-colors">
                                    <Check size={16} />
                                  </button>
                                  <button type="button" onClick={() => setIsAddingInstitution(false)} className="bg-red-500/20 text-red-400 px-2 rounded-xl hover:bg-red-500 hover:text-white transition-colors">
                                    <X size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-xl mt-4 transition-all">Sign Up</button>
                        </form>
                      </motion.div>
                    ) : (
                      <motion.div key="login" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[#0a0a0c] border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
                        <h2 className="text-3xl font-display font-bold text-white mb-6">Welcome Back</h2>
                        <form className="space-y-4" onSubmit={handleLogin}>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#464556]" size={18} />
                            <input type="text" placeholder="Username or Email" required value={loginData.username} onChange={e => setLoginData({ ...loginData, username: e.target.value })} className="w-full bg-[#131316] border border-[#464556] text-white rounded-xl pl-12 pr-4 py-4 outline-none focus:border-emerald-500" />
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#464556]" size={18} />
                            <input type={showPassword ? "text" : "password"} placeholder="Password" required value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} className="w-full bg-[#131316] border border-[#464556] text-white rounded-xl pl-12 pr-12 py-4 outline-none focus:border-emerald-500" />
                          </div>
                          <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-xl mt-4 transition-all">Access Workspace</button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </main>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =====================================================================
// DASHBOARD COMPONENT - FULL CRUD & LOGICA DE AUTORIZACIÓN
// =====================================================================

function Dashboard({ currentUser, onLogout }: { currentUser: any, onLogout: () => void }) {
  const [search, setSearch] = useState('');
  const [resources, setResources] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  // Control de Estados para Ventanas Modales
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Estados para creación dinámica de materias
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  // Estados independientes para creación y edición
  const [formData, setFormData] = useState({ title: '', description: '', difficulty_level: '', language: 'Spanish', subject_id: '' });
  const [editData, setEditData] = useState({ id: '', title: '', description: '', difficulty_level: '', language: '', subject_id: '' });

  // R: GET (Cargar Recursos y Materias simultáneamente)
  const fetchInitialData = async () => {
    try {
      const [resResources, resSubjects] = await Promise.all([
        fetch(`${API_URL}/resources`),
        fetch(`${API_URL}/subjects`)
      ]);
      const dataResources = await resResources.json();
      const dataSubjects = await resSubjects.json();

      if (Array.isArray(dataResources)) setResources(dataResources);
      if (Array.isArray(dataSubjects)) {
        setSubjects(dataSubjects);
        if (dataSubjects.length > 0 && !formData.subject_id) {
          setFormData(prev => ({ ...prev, subject_id: dataSubjects[0].id }));
        }
      }
    } catch (error) {
      console.error("Error al sincronizar datos:", error);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Agregar nueva materia al catálogo NoSQL
  const handleAddNewSubject = async () => {
    if (!newSubjectName.trim()) return;
    try {
      const res = await fetch(`${API_URL}/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSubjectName })
      });
      if (res.ok) {
        const data = await res.json();
        await fetchInitialData();
        setFormData(prev => ({ ...prev, subject_id: data.id })); // Seleccionar la nueva automáticamente
        setIsAddingSubject(false);
        setNewSubjectName('');
      }
    } catch (error) {
      console.error("Error al inyectar materia:", error);
    }
  };

  // C: POST (Subir recurso inyectando autoría directa)
  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        student_id: currentUser.id,
        student_username: currentUser.username
      };
      const response = await fetch(`${API_URL}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setIsNewNoteModalOpen(false);
        setFormData(prev => ({ ...prev, title: '', description: '', difficulty_level: '' }));
        fetchInitialData();
      }
    } catch (error) {
      console.error('Error al guardar recurso:', error);
    }
  };

  // U: PUT (Actualizar título, descripción, materia, nivel o idioma)
  const handleUpdateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/resources/${editData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      if (response.ok) {
        setIsEditModalOpen(false);
        fetchInitialData();
      }
    } catch (error) {
      console.error('Error al actualizar base de datos:', error);
    }
  };

  // D: DELETE (Eliminar de forma lógica y limpiar tabla puente en cascada)
  const handleDeleteResource = async (id: string) => {
    if (!window.confirm("¿Estás completamente seguro de que deseas eliminar este nodo de estudio de la base de datos?")) return;
    try {
      const response = await fetch(`${API_URL}/resources/${id}`, { method: 'DELETE' });
      if (response.ok) fetchInitialData();
    } catch (error) {
      console.error('Error al purgar documento:', error);
    }
  };

  // Filtro Inteligente del Buscador (Busca por título o por autor @usuario)
  const filteredNotes = resources.filter(note =>
    note.title?.toLowerCase().includes(search.toLowerCase()) ||
    note.student_username?.toLowerCase().includes(search.toLowerCase())
  );

  const getSubjectName = (subjectId: string) => {
    const sub = subjects.find(s => s.id === subjectId);
    return sub ? sub.name : "Materia No Especificada";
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-screen w-full bg-[#050505]">
      {/* Barra Lateral Izquierda */}
      <aside className="w-64 border-r border-white/5 bg-[#0a0a0c] hidden lg:flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center">
            <Terminal size={20} className="text-white" />
          </div>
          <span className="text-xl font-black text-white tracking-tighter font-display uppercase italic">StudySync</span>
        </div>
        <div className="mb-6 px-4 pb-4 border-b border-white/5">
          <p className="text-[#908fa1] text-xs uppercase tracking-widest">Logged in as</p>
          <p className="text-emerald-400 font-bold">@{currentUser.username}</p>
        </div>
        <nav className="flex-grow space-y-2">
          <button onClick={() => setSearch('')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-500/10 text-emerald-400">
            <BookOpen size={20} /> <span className="font-semibold text-sm">Global Feed</span>
          </button>
          <button onClick={() => setSearch(currentUser.username)} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#908fa1] hover:text-white hover:bg-white/5">
            <User size={20} /> <span className="font-semibold text-sm">My Uploads</span>
          </button>
        </nav>
        <button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#908fa1] hover:text-red-400 transition-all">
          <Lock size={18} /> <span className="font-semibold text-sm">Sign Out</span>
        </button>
      </aside>

      {/* Área de Visualización Central */}
      <div className="flex-grow flex flex-col h-screen overflow-y-auto">
        <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between sticky top-0 bg-[#050505]/80 backdrop-blur-xl z-20">
          <div className="flex-grow max-w-xl relative">
            <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 text-[#464556]" size={16} />
            <input type="text" placeholder="Search by title or @username..." className="w-full bg-[#131316] border border-[#464556] text-white rounded-lg pl-12 pr-4 py-3 focus:border-emerald-500 outline-none text-sm font-mono" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button onClick={() => setIsNewNoteModalOpen(true)} className="ml-4 bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-transform active:scale-95">
            <Terminal size={16} /> Upload Resource
          </button>
        </header>

        <main className="p-8">
          <h2 className="text-3xl font-display font-bold text-white mb-8">Active Database Nodes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredNotes.map((note) => (
                <motion.div key={note.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#0a0a0c] border border-white/5 p-6 rounded-xl hover:border-emerald-500/50 transition-all group flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                      <BookOpen size={18} />
                    </div>
                    <div className="flex gap-2">
                      {/* CLAUSULA DE SEGURIDAD: Solo el autor ve los disparadores de edición y borrado */}
                      {note.student_id === currentUser.id && (
                        <>
                          <button onClick={() => { setEditData({ id: note.id, title: note.title, description: note.description || '', difficulty_level: note.difficulty_level, language: note.language, subject_id: note.subject_id || '' }); setIsEditModalOpen(true); }} className="p-1.5 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500 hover:text-white transition-colors"><Edit size={14} /></button>
                          <button onClick={() => handleDeleteResource(note.id)} className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500 hover:text-white transition-colors"><Trash size={14} /></button>
                        </>
                      )}
                    </div>
                  </div>
                  <h3 className="text-lg font-display font-semibold text-white mb-2 group-hover:text-emerald-400">{note.title}</h3>
                  <p className="text-xs text-[#908fa1] mb-4 line-clamp-3 leading-relaxed">{note.description || "No description provided."}</p>

                  <div className="text-[10px] text-[#464556] mb-6 flex-grow space-y-1">
                    <p className="flex items-center gap-1 text-emerald-400/80 mb-2"><Book size={12} /> {getSubjectName(note.subject_id)}</p>
                    <p><span className="font-bold uppercase tracking-widest">Lang:</span> {note.language} | <span className="font-bold uppercase tracking-widest">Level:</span> {note.difficulty_level}</p>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <button onClick={() => setSearch(note.student_username)} className="text-xs font-bold text-emerald-400 hover:underline px-2 py-1 bg-emerald-500/10 rounded-md">
                      @{note.student_username || "anonymous"}
                    </button>
                    <span className="text-[11px] font-bold text-[#908fa1]">Downloads: {note.stats?.downloads || 0}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </main>

        {/* MODAL: SUBIR RECURSO */}
        <AnimatePresence>
          {isNewNoteModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsNewNoteModalOpen(false)} className="absolute inset-0 bg-[#050505]/80 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="bg-[#0a0a0c] border border-white/10 w-full max-w-lg p-10 rounded-[2.5rem] shadow-2xl relative z-10">
                <h2 className="text-3xl font-display font-bold text-white mb-6 text-center">Upload to DB</h2>
                <form className="space-y-6" onSubmit={handleCreateResource}>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#908fa1] uppercase">Title</label>
                    <input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-[#131316] border border-[#464556] text-white rounded-2xl px-6 py-4 outline-none focus:border-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#908fa1] uppercase">General Description</label>
                    <textarea rows={3} required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-[#131316] border border-[#464556] text-white rounded-2xl px-6 py-4 outline-none focus:border-emerald-500 resize-none" placeholder="What is this resource about?..." />
                  </div>

                  {/* Selector Dinámico de Materias + Botón de Inyección Máxima "+" */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#908fa1] uppercase">Subject</label>
                    <div className="relative flex gap-2">
                      {!isAddingSubject ? (
                        <>
                          <select required value={formData.subject_id} onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })} className="w-full bg-[#131316] border border-[#464556] text-white rounded-2xl px-6 py-4 outline-none focus:border-emerald-500 cursor-pointer">
                            {subjects.map(sub => (
                              <option key={sub.id} value={sub.id}>{sub.name}</option>
                            ))}
                          </select>
                          <button type="button" onClick={() => setIsAddingSubject(true)} className="bg-[#1f1f22] border border-[#464556] text-emerald-400 px-3 rounded-xl hover:bg-[#2a2a2d] transition-colors" title="Add New Subject">
                            <Plus size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <input type="text" placeholder="New Subject Name..." value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} className="w-full bg-[#131316] border border-emerald-500 text-white rounded-xl px-4 py-3 outline-none text-sm" autoFocus />
                          <button type="button" onClick={handleAddNewSubject} className="bg-emerald-500/20 text-emerald-400 px-3 rounded-xl hover:bg-emerald-500 hover:text-white transition-colors">
                            <Check size={16} />
                          </button>
                          <button type="button" onClick={() => setIsAddingSubject(false)} className="bg-red-500/20 text-red-400 px-3 rounded-xl hover:bg-red-500 hover:text-white transition-colors">
                            <X size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#908fa1] uppercase">Language</label>
                      <select value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })} className="w-full bg-[#131316] border border-[#464556] text-white rounded-2xl px-6 py-4 outline-none focus:border-emerald-500">
                        <option>Spanish</option><option>English</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#908fa1] uppercase">Difficulty</label>
                      <input required value={formData.difficulty_level} onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })} className="w-full bg-[#131316] border border-[#464556] text-white rounded-2xl px-6 py-4 outline-none focus:border-emerald-500" />
                    </div>
                  </div>
                  <div className="pt-6 flex gap-4">
                    <button type="button" onClick={() => setIsNewNoteModalOpen(false)} className="flex-grow py-4 rounded-2xl border border-[#464556] text-[#908fa1] font-black text-xs uppercase hover:bg-white/5 transition-all">Cancel</button>
                    <button type="submit" className="flex-grow bg-emerald-500 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-emerald-400 transition-all">Publish</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: EDITAR RECURSO COMPLETO */}
        <AnimatePresence>
          {isEditModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditModalOpen(false)} className="absolute inset-0 bg-[#050505]/80 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="bg-[#0a0a0c] border border-blue-500/30 w-full max-w-lg p-10 rounded-[2.5rem] shadow-2xl relative z-10">
                <h2 className="text-3xl font-display font-bold text-white mb-6 text-center">Edit Resource</h2>
                <form className="space-y-6" onSubmit={handleUpdateResource}>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#908fa1] uppercase">Title</label>
                    <input required value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} className="w-full bg-[#131316] border border-[#464556] text-white rounded-2xl px-6 py-4 outline-none focus:border-blue-500" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#908fa1] uppercase">General Description</label>
                    <textarea rows={3} required value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} className="w-full bg-[#131316] border border-[#464556] text-white rounded-2xl px-6 py-4 outline-none focus:border-blue-500 resize-none" placeholder="Update description..." />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#908fa1] uppercase">Subject</label>
                    <select required value={editData.subject_id} onChange={(e) => setEditData({ ...editData, subject_id: e.target.value })} className="w-full bg-[#131316] border border-[#464556] text-white rounded-2xl px-6 py-4 outline-none focus:border-blue-500">
                      <option value="" disabled>Select Subject</option>
                      {subjects.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#908fa1] uppercase">Language</label>
                      <select value={editData.language} onChange={(e) => setEditData({ ...editData, language: e.target.value })} className="w-full bg-[#131316] border border-[#464556] text-white rounded-2xl px-6 py-4 outline-none focus:border-blue-500">
                        <option>Spanish</option><option>English</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#908fa1] uppercase">Difficulty</label>
                      <input required value={editData.difficulty_level} onChange={(e) => setEditData({ ...editData, difficulty_level: e.target.value })} className="w-full bg-[#131316] border border-[#464556] text-white rounded-2xl px-6 py-4 outline-none focus:border-blue-500" />
                    </div>
                  </div>
                  <div className="pt-6 flex gap-4">
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-grow py-4 rounded-2xl border border-[#464556] text-[#908fa1] font-black text-xs uppercase hover:bg-white/5 transition-all">Cancel</button>
                    <button type="submit" className="flex-grow bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-xl transition-colors">Update DB</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}