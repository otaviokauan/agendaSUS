import { useState } from 'react';
import { getEspecialidadesDisponiveis, encontrarHorarioAleatorio, criarAgendamento } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Stethoscope, CheckCircle, AlertCircle } from 'lucide-react';

export default function AgendarConsulta() {
  const { user } = useAuth();
  const [especialidade, setEspecialidade] = useState('');
  const [data, setData] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('error');
  const [resultado, setResultado] = useState<{ medico: string; horario: string; especialidade: string } | null>(null);

  const especialidadesDisponiveis = getEspecialidadesDisponiveis();

  const handleAgendar = () => {
    if (!user || !especialidade || !data) {
      setMsg('Preencha todos os campos.'); setMsgType('error'); return;
    }

    const slot = encontrarHorarioAleatorio(especialidade, data);
    if (!slot) {
      setMsg('Nenhum horário disponível para esta especialidade nesta data. Tente outra data.'); setMsgType('error'); setResultado(null); return;
    }

    const result = criarAgendamento({
      pacienteId: user.id,
      pacienteNome: user.nomeCompleto,
      pacienteCpf: user.cpf,
      medicoId: slot.medico.id,
      medicoNome: slot.medico.nome,
      especialidade,
      data,
      horario: slot.horario,
      tipo: 'consulta'
    });

    if (result.success) {
      setResultado({ medico: slot.medico.nome, horario: slot.horario, especialidade });
      setMsg('');
      setEspecialidade('');
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
        <div className="w-10 h-10 rounded-xl gradient-sus flex items-center justify-center">
          <Stethoscope className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Agendar Consulta</h2>
          <p className="text-sm text-muted-foreground">Escolha a especialidade e a data. O horário será atribuído automaticamente.</p>
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
            <span className="font-bold text-secondary">Agendamento Confirmado!</span>
          </div>
          <div className="space-y-1 text-sm text-foreground">
            <p><strong>Especialidade:</strong> {resultado.especialidade}</p>
            <p><strong>Médico(a):</strong> {resultado.medico}</p>
            <p><strong>Horário:</strong> {resultado.horario}</p>
          </div>
        </div>
      )}

      {especialidadesDisponiveis.length === 0 ? (
        <div className="sus-card text-center py-10">
          <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum médico cadastrado ainda.</p>
          <p className="text-xs text-muted-foreground mt-1">A unidade de saúde precisa cadastrar os médicos primeiro.</p>
        </div>
      ) : (
        <div className="sus-card space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-primary" /> Especialidade
            </label>
            <select className="sus-input" value={especialidade} onChange={e => { setEspecialidade(e.target.value); setResultado(null); }}>
              <option value="">Selecione...</option>
              {especialidadesDisponiveis.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" /> Data
            </label>
            <input type="date" className="sus-input" min={today} value={data} onChange={e => { setData(e.target.value); setResultado(null); }} />
          </div>

          <p className="text-xs text-muted-foreground text-center">O horário e o médico serão atribuídos automaticamente.</p>

          <button onClick={handleAgendar} disabled={!especialidade || !data} className="sus-btn-primary w-full">
            Confirmar Agendamento
          </button>
        </div>
      )}
    </div>
  );
}
