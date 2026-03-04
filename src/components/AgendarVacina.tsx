import { useState } from 'react';
import { vacinas, criarAgendamento, encontrarHorarioVacinaAleatorio } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { Syringe, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

export default function AgendarVacina() {
  const { user } = useAuth();
  const [vacina, setVacina] = useState('');
  const [data, setData] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('error');
  const [resultado, setResultado] = useState<{ vacina: string; horario: string; data: string } | null>(null);

  const handleAgendar = () => {
    if (!user || !vacina || !data) {
      setMsg('Preencha todos os campos.'); setMsgType('error'); return;
    }

    const horario = encontrarHorarioVacinaAleatorio(data);
    if (!horario) {
      setMsg('Todos os horários de vacinação estão ocupados nesta data. Tente outra data.'); setMsgType('error'); setResultado(null); return;
    }

    const result = criarAgendamento({
      pacienteId: user.id,
      pacienteNome: user.nomeCompleto,
      pacienteCpf: user.cpf,
      medicoId: 'vacina',
      medicoNome: 'Equipe de Vacinação',
      especialidade: 'Vacinação',
      data,
      horario,
      tipo: 'vacina',
      vacina
    });

    if (result.success) {
      setResultado({ vacina, horario, data });
      setMsg('');
      setVacina('');
      setData('');
    } else {
      setMsg(result.message); setMsgType('error'); setResultado(null);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const formatDate = (d: string) => { const [y, m, day] = d.split('-'); return `${day}/${m}/${y}`; };

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Syringe className="w-5 h-5 text-secondary-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Agendar Vacina</h2>
          <p className="text-sm text-muted-foreground">Escolha a vacina e a data. O horário será atribuído automaticamente.</p>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${msgType === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-secondary/10 text-secondary'}`}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          {msg}
        </div>
      )}

      {resultado && (
        <div className="mb-4 p-4 rounded-xl bg-secondary/10 border border-secondary/30 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-secondary" />
            <span className="font-bold text-secondary">Vacinação Agendada!</span>
          </div>
          <div className="space-y-1 text-sm text-foreground">
            <p><strong>Vacina:</strong> {resultado.vacina}</p>
            <p><strong>Data:</strong> {formatDate(resultado.data)}</p>
            <p><strong>Horário:</strong> {resultado.horario}</p>
          </div>
        </div>
      )}

      <div className="sus-card space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block flex items-center gap-1.5">
            <Syringe className="w-4 h-4 text-secondary" /> Vacina
          </label>
          <select className="sus-input" value={vacina} onChange={e => { setVacina(e.target.value); setResultado(null); }}>
            <option value="">Selecione a vacina...</option>
            {vacinas.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-secondary" /> Data
          </label>
          <input type="date" className="sus-input" min={today} value={data} onChange={e => { setData(e.target.value); setResultado(null); }} />
        </div>

        <p className="text-xs text-muted-foreground text-center">O horário será atribuído automaticamente.</p>

        <button onClick={handleAgendar} disabled={!vacina || !data} className="sus-btn-secondary w-full">
          Confirmar Vacinação
        </button>
      </div>
    </div>
  );
}
