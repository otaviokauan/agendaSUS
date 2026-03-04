import { useState, useEffect } from 'react';
import { getAgendamentos, cancelarAgendamento, Agendamento } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { ClipboardList, XCircle, Calendar, Clock, Stethoscope, Syringe } from 'lucide-react';

export default function MeusAgendamentos() {
  const { user } = useAuth();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [filtro, setFiltro] = useState<'todos' | 'agendado' | 'cancelado'>('todos');

  const refresh = () => {
    if (!user) return;
    setAgendamentos(getAgendamentos().filter(a => a.pacienteId === user.id));
  };

  useEffect(() => { refresh(); }, [user]);

  const handleCancelar = (id: string) => {
    cancelarAgendamento(id);
    refresh();
  };

  const filtered = filtro === 'todos' ? agendamentos : agendamentos.filter(a => a.status === filtro);

  const formatDate = (d: string) => {
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-sus flex items-center justify-center">
          <ClipboardList className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Meus Agendamentos</h2>
          <p className="text-sm text-muted-foreground">{agendamentos.length} agendamento(s)</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {(['todos', 'agendado', 'cancelado'] as const).map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all capitalize ${filtro === f ? 'gradient-sus text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="sus-card text-center py-10">
          <ClipboardList className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum agendamento encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <div key={a.id} className={`sus-card ${a.status === 'cancelado' ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {a.tipo === 'vacina' ? <Syringe className="w-4 h-4 text-secondary shrink-0" /> : <Stethoscope className="w-4 h-4 text-primary shrink-0" />}
                    <span className="font-semibold text-foreground text-sm truncate">
                      {a.tipo === 'vacina' ? a.vacina : a.especialidade}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(a.data)}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.horario}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{a.medicoNome}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${a.status === 'agendado' ? 'bg-secondary/15 text-secondary' : a.status === 'cancelado' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                    {a.status}
                  </span>
                  {a.status === 'agendado' && (
                    <button onClick={() => handleCancelar(a.id)} className="text-destructive hover:text-destructive/80 transition-colors" title="Cancelar">
                      <XCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
