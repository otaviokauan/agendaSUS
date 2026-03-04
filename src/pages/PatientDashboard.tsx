import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Calendar, Syringe, ClipboardList, LogOut, Menu, X } from 'lucide-react';
import AgendarConsulta from '@/components/AgendarConsulta';
import AgendarVacina from '@/components/AgendarVacina';
import MeusAgendamentos from '@/components/MeusAgendamentos';

type Tab = 'consulta' | 'vacina' | 'meus';

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('consulta');
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = [
    { id: 'consulta' as Tab, label: 'Agendar Consulta', icon: Calendar },
    { id: 'vacina' as Tab, label: 'Agendar Vacina', icon: Syringe },
    { id: 'meus' as Tab, label: 'Meus Agendamentos', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-sus sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary-foreground" />
            <span className="font-bold text-primary-foreground text-lg">Agenda SUS</span>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <span className="text-primary-foreground/80 text-sm">Olá, {user?.nomeCompleto.split(' ')[0]}</span>
            <button onClick={logout} className="flex items-center gap-1 text-primary-foreground/80 hover:text-primary-foreground text-sm transition-colors">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
          <button className="md:hidden text-primary-foreground" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-primary-foreground/20 px-4 py-3 space-y-2">
            <p className="text-primary-foreground/80 text-sm">Olá, {user?.nomeCompleto.split(' ')[0]}</p>
            {tabs.map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setMenuOpen(false); }}
                className={`w-full text-left py-2 px-3 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${tab === t.id ? 'bg-primary-foreground/20 text-primary-foreground' : 'text-primary-foreground/70'}`}>
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

      {/* Content */}
      <main className="container mx-auto px-4 py-6 animate-fade-in">
        {tab === 'consulta' && <AgendarConsulta />}
        {tab === 'vacina' && <AgendarVacina />}
        {tab === 'meus' && <MeusAgendamentos />}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
        <div className="flex">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${tab === t.id ? 'text-primary' : 'text-muted-foreground'}`}>
              <t.icon className="w-5 h-5" />
              <span>{t.label.replace('Agendar ', '')}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
