import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAgendamentos, getMedicos, saveMedicos, addMedico, removeMedico, updateMedico, Agendamento, Medico, especialidades, cancelarAgendamento } from '@/lib/store';
import { Heart, LogOut, Users, CalendarCheck, UserPlus, Settings, Trash2, Edit, X, Check, Menu } from 'lucide-react';

type Tab = 'agendamentos' | 'medicos' | 'adicionar';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [tab, setTab] = useState<Tab>('agendamentos');
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [medicos, setMedicosState] = useState<Medico[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const refresh = () => {
    setAgendamentos(getAgendamentos());
    setMedicosState(getMedicos());
  };

  useEffect(() => { refresh(); }, []);

  // Add doctor form
  const [novoMedico, setNovoMedico] = useState({ nome: '', especialidade: '', horarios: '' as string, dias: [] as string[] });
  const diasOpcoes = ['segunda', 'terça', 'quarta', 'quinta', 'sexta'];

  const handleAddMedico = () => {
    if (!novoMedico.nome || !novoMedico.especialidade || !novoMedico.horarios || novoMedico.dias.length === 0) return;
    const horarios = novoMedico.horarios.split(',').map(h => h.trim()).filter(Boolean);
    addMedico({ nome: novoMedico.nome, especialidade: novoMedico.especialidade, horarios, diasDisponiveis: novoMedico.dias });
    setNovoMedico({ nome: '', especialidade: '', horarios: '', dias: [] });
    refresh();
  };

  const toggleDia = (dia: string) => {
    setNovoMedico(prev => ({
      ...prev,
      dias: prev.dias.includes(dia) ? prev.dias.filter(d => d !== dia) : [...prev.dias, dia]
    }));
  };

  // Edit doctor
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ horarios: '', dias: [] as string[] });

  const startEdit = (m: Medico) => {
    setEditingId(m.id);
    setEditForm({ horarios: m.horarios.join(', '), dias: [...m.diasDisponiveis] });
  };

  const saveEdit = (id: string) => {
    const horarios = editForm.horarios.split(',').map(h => h.trim()).filter(Boolean);
    updateMedico(id, { horarios, diasDisponiveis: editForm.dias });
    setEditingId(null);
    refresh();
  };

  const handleRemoveMedico = (id: string) => {
    removeMedico(id);
    refresh();
  };

  const handleCancelar = (id: string) => {
    cancelarAgendamento(id);
    refresh();
  };

  const formatDate = (d: string) => { const [y, m, day] = d.split('-'); return `${day}/${m}/${y}`; };

  const tabs = [
    { id: 'agendamentos' as Tab, label: 'Agendamentos', icon: CalendarCheck },
    { id: 'medicos' as Tab, label: 'Médicos', icon: Users },
    { id: 'adicionar' as Tab, label: 'Adicionar Médico', icon: UserPlus },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <header className="gradient-sus-dark sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary-foreground" />
            <span className="font-bold text-primary-foreground text-lg">Admin CDD</span>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <span className="text-primary-foreground/80 text-sm">Painel Administrativo</span>
            <button onClick={logout} className="flex items-center gap-1 text-primary-foreground/80 hover:text-primary-foreground text-sm">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
          <button className="md:hidden text-primary-foreground" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-primary-foreground/20 px-4 py-3 space-y-2">
            {tabs.map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setMenuOpen(false); }}
                className={`w-full text-left py-2 px-3 rounded-lg text-sm font-medium flex items-center gap-2 ${tab === t.id ? 'bg-primary-foreground/20 text-primary-foreground' : 'text-primary-foreground/70'}`}>
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
            <button onClick={logout} className="w-full text-left py-2 px-3 text-primary-foreground/70 text-sm flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        )}
      </header>

      {/* Desktop Tabs */}
      <div className="hidden md:block border-b border-border bg-card">
        <div className="container mx-auto px-4 flex gap-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`py-3 px-5 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Agendamentos', value: agendamentos.length, color: 'text-primary' },
            { label: 'Agendados', value: agendamentos.filter(a => a.status === 'agendado').length, color: 'text-secondary' },
            { label: 'Cancelados', value: agendamentos.filter(a => a.status === 'cancelado').length, color: 'text-destructive' },
            { label: 'Médicos', value: medicos.length, color: 'text-primary' },
          ].map((s, i) => (
            <div key={i} className="sus-card text-center">
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {tab === 'agendamentos' && (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Todos os Agendamentos</h2>
            {agendamentos.length === 0 ? (
              <div className="sus-card text-center py-10">
                <CalendarCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum agendamento.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {agendamentos.map(a => (
                  <div key={a.id} className={`sus-card ${a.status === 'cancelado' ? 'opacity-50' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground">{a.pacienteNome}</p>
                        <p className="text-xs text-muted-foreground">CPF: {a.pacienteCpf} • {a.tipo === 'vacina' ? `Vacina: ${a.vacina}` : a.especialidade}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(a.data)} às {a.horario} • {a.medicoNome}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${a.status === 'agendado' ? 'bg-secondary/15 text-secondary' : 'bg-destructive/10 text-destructive'}`}>
                          {a.status}
                        </span>
                        {a.status === 'agendado' && (
                          <button onClick={() => handleCancelar(a.id)} className="text-destructive hover:text-destructive/80" title="Cancelar">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'medicos' && (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Médicos Cadastrados</h2>
            <div className="space-y-3">
              {medicos.map(m => (
                <div key={m.id} className="sus-card">
                  {editingId === m.id ? (
                    <div className="space-y-3">
                      <p className="font-semibold text-foreground">{m.nome} - {m.especialidade}</p>
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1 block">Horários (separados por vírgula)</label>
                        <input className="sus-input" value={editForm.horarios} onChange={e => setEditForm(prev => ({ ...prev, horarios: e.target.value }))} />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1 block">Dias</label>
                        <div className="flex flex-wrap gap-1.5">
                          {diasOpcoes.map(d => (
                            <button key={d} onClick={() => setEditForm(prev => ({
                              ...prev, dias: prev.dias.includes(d) ? prev.dias.filter(x => x !== d) : [...prev.dias, d]
                            }))}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${editForm.dias.includes(d) ? 'gradient-sus text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(m.id)} className="sus-btn-primary flex-1 flex items-center justify-center gap-1"><Check className="w-4 h-4" /> Salvar</button>
                        <button onClick={() => setEditingId(null)} className="sus-btn-outline flex-1">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground text-sm">{m.nome}</p>
                        <p className="text-xs text-primary font-medium">{m.especialidade}</p>
                        <p className="text-xs text-muted-foreground mt-1">Horários: {m.horarios.join(', ')}</p>
                        <p className="text-xs text-muted-foreground">Dias: {m.diasDisponiveis.join(', ')}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => startEdit(m)} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Editar">
                          <Edit className="w-4 h-4 text-primary" />
                        </button>
                        <button onClick={() => handleRemoveMedico(m.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors" title="Remover">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'adicionar' && (
          <div className="max-w-lg mx-auto">
            <h2 className="text-lg font-bold text-foreground mb-4">Adicionar Novo Médico</h2>
            <div className="sus-card space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Nome do Médico</label>
                <input className="sus-input" placeholder="Dr(a). Nome Completo" value={novoMedico.nome} onChange={e => setNovoMedico(prev => ({ ...prev, nome: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Especialidade</label>
                <select className="sus-input" value={novoMedico.especialidade} onChange={e => setNovoMedico(prev => ({ ...prev, especialidade: e.target.value }))}>
                  <option value="">Selecione...</option>
                  {especialidades.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Horários (separados por vírgula)</label>
                <input className="sus-input" placeholder="08:00, 09:00, 10:00" value={novoMedico.horarios} onChange={e => setNovoMedico(prev => ({ ...prev, horarios: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Dias de Atendimento</label>
                <div className="flex flex-wrap gap-2">
                  {diasOpcoes.map(d => (
                    <button key={d} onClick={() => toggleDia(d)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${novoMedico.dias.includes(d) ? 'gradient-sus text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-primary/10'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleAddMedico} className="sus-btn-primary w-full">Adicionar Médico</button>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
        <div className="flex">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${tab === t.id ? 'text-primary' : 'text-muted-foreground'}`}>
              <t.icon className="w-5 h-5" />
              <span className="truncate px-1">{t.label.replace('Adicionar ', '+')}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
