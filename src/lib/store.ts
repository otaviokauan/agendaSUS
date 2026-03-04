// Data store using localStorage
export interface User {
  id: string;
  nomeCompleto: string;
  cpf: string;
  telefone: string;
  cartaoSus: string;
  senha: string;
  tipo: 'paciente' | 'admin';
}

export interface Medico {
  id: string;
  nome: string;
  especialidade: string;
  horarios: string[]; // e.g. ["08:00", "09:00", "10:00"]
  diasDisponiveis: string[]; // e.g. ["segunda", "terça"]
}

export interface Agendamento {
  id: string;
  pacienteId: string;
  pacienteNome: string;
  pacienteCpf: string;
  medicoId: string;
  medicoNome: string;
  especialidade: string;
  data: string;
  horario: string;
  tipo: 'consulta' | 'vacina';
  vacina?: string;
  status: 'agendado' | 'concluido' | 'cancelado';
}

const USERS_KEY = 'sus_users';
const MEDICOS_KEY = 'sus_medicos';
const AGENDAMENTOS_KEY = 'sus_agendamentos';
const CURRENT_USER_KEY = 'sus_current_user';

function getItem<T>(key: string, fallback: T): T {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
}

function setItem<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Users
export function getUsers(): User[] { return getItem(USERS_KEY, []); }
export function saveUsers(users: User[]) { setItem(USERS_KEY, users); }

export function registerUser(user: Omit<User, 'id'>): { success: boolean; message: string } {
  const users = getUsers();
  if (users.find(u => u.cpf === user.cpf)) return { success: false, message: 'CPF já cadastrado.' };
  if (users.find(u => u.cartaoSus === user.cartaoSus)) return { success: false, message: 'Cartão SUS já cadastrado.' };
  const newUser: User = { ...user, id: crypto.randomUUID() };
  users.push(newUser);
  saveUsers(users);
  return { success: true, message: 'Conta criada com sucesso!' };
}

export function loginUser(cpf: string, senha: string): { success: boolean; user?: User; message: string } {
  const users = getUsers();
  const user = users.find(u => u.cpf === cpf && u.senha === senha);
  if (!user) return { success: false, message: 'CPF ou senha incorretos.' };
  setItem(CURRENT_USER_KEY, user);
  return { success: true, user, message: 'Login realizado!' };
}

export function getCurrentUser(): User | null { return getItem(CURRENT_USER_KEY, null); }
export function logout() { localStorage.removeItem(CURRENT_USER_KEY); }

// Médicos
export function getMedicos(): Medico[] { return getItem(MEDICOS_KEY, []); }
export function saveMedicos(medicos: Medico[]) { setItem(MEDICOS_KEY, medicos); }

export function addMedico(medico: Omit<Medico, 'id'>): Medico {
  const medicos = getMedicos();
  const novo: Medico = { ...medico, id: crypto.randomUUID() };
  medicos.push(novo);
  saveMedicos(medicos);
  return novo;
}

export function updateMedico(id: string, updates: Partial<Medico>) {
  const medicos = getMedicos();
  const idx = medicos.findIndex(m => m.id === id);
  if (idx !== -1) { medicos[idx] = { ...medicos[idx], ...updates }; saveMedicos(medicos); }
}

export function removeMedico(id: string) {
  saveMedicos(getMedicos().filter(m => m.id !== id));
}

// Agendamentos
export function getAgendamentos(): Agendamento[] { return getItem(AGENDAMENTOS_KEY, []); }
export function saveAgendamentos(a: Agendamento[]) { setItem(AGENDAMENTOS_KEY, a); }

export function criarAgendamento(ag: Omit<Agendamento, 'id' | 'status'>): { success: boolean; message: string } {
  const agendamentos = getAgendamentos();
  const conflito = agendamentos.find(
    a => a.medicoId === ag.medicoId && a.data === ag.data && a.horario === ag.horario && a.status === 'agendado'
  );
  if (conflito) return { success: false, message: 'Horário já ocupado.' };
  agendamentos.push({ ...ag, id: crypto.randomUUID(), status: 'agendado' });
  saveAgendamentos(agendamentos);
  return { success: true, message: 'Agendamento realizado com sucesso!' };
}

// Find a random available slot for a specialty on a given date
export function encontrarHorarioAleatorio(especialidade: string, data: string): { medico: Medico; horario: string } | null {
  const getDiaSemana = (dateStr: string): string => {
    const date = new Date(dateStr + 'T12:00:00');
    const dias = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
    return dias[date.getDay()];
  };
  const dia = getDiaSemana(data);
  const medicos = getMedicos().filter(m => m.especialidade === especialidade && m.diasDisponiveis.includes(dia));
  if (medicos.length === 0) return null;

  const agendamentos = getAgendamentos().filter(a => a.data === data && a.status === 'agendado');

  // Collect all available slots
  const slotsDisponiveis: { medico: Medico; horario: string }[] = [];
  for (const medico of medicos) {
    for (const horario of medico.horarios) {
      const ocupado = agendamentos.some(a => a.medicoId === medico.id && a.horario === horario);
      if (!ocupado) {
        slotsDisponiveis.push({ medico, horario });
      }
    }
  }

  if (slotsDisponiveis.length === 0) return null;
  return slotsDisponiveis[Math.floor(Math.random() * slotsDisponiveis.length)];
}

// Find a random available slot for vaccines on a given date
export function encontrarHorarioVacinaAleatorio(data: string): string | null {
  const horariosVacina = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00'];
  const agendamentos = getAgendamentos().filter(a => a.data === data && a.medicoId === 'vacina' && a.status === 'agendado');
  const ocupados = new Set(agendamentos.map(a => a.horario));
  const disponiveis = horariosVacina.filter(h => !ocupados.has(h));
  if (disponiveis.length === 0) return null;
  return disponiveis[Math.floor(Math.random() * disponiveis.length)];
}

export function cancelarAgendamento(id: string) {
  const agendamentos = getAgendamentos();
  const idx = agendamentos.findIndex(a => a.id === id);
  if (idx !== -1) { agendamentos[idx].status = 'cancelado'; saveAgendamentos(agendamentos); }
}

// Especialidades e Vacinas
export const especialidades = [
  'Clínico Geral', 'Pediatria', 'Ginecologia', 'Cardiologia', 'Dermatologia', 'Ortopedia', 'Oftalmologia'
];

export const vacinas = [
  'BCG', 'Hepatite B', 'Pentavalente', 'VIP/VOP (Poliomielite)', 'Pneumocócica 10V',
  'Rotavírus', 'Meningocócica C', 'Febre Amarela', 'Tríplice Viral (SCR)',
  'Hepatite A', 'DTP', 'HPV', 'Influenza (Gripe)', 'COVID-19', 'Dengue'
];

// Get available specialties (only from doctors added by admin)
export function getEspecialidadesDisponiveis(): string[] {
  const medicos = getMedicos();
  return [...new Set(medicos.map(m => m.especialidade))];
}

// Init admin if not exists
export function initAdmin() {
  const users = getUsers();
  if (!users.find(u => u.tipo === 'admin')) {
    users.push({
      id: 'admin-1',
      nomeCompleto: 'Administrador CDD',
      cpf: '00000000000',
      telefone: '0000000000',
      cartaoSus: '000000000000000',
      senha: 'admin123',
      tipo: 'admin'
    });
    saveUsers(users);
  }
}
