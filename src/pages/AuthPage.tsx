import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, UserPlus, LogIn, Shield } from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register' | 'admin'>('login');
  const { login, register } = useAuth();
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('error');

  const [form, setForm] = useState({
    nomeCompleto: '', cpf: '', telefone: '', cartaoSus: '', senha: '', confirmarSenha: ''
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const formatCPF = (v: string) => {
    const nums = v.replace(/\D/g, '').slice(0, 11);
    return nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatTel = (v: string) => {
    const nums = v.replace(/\D/g, '').slice(0, 11);
    if (nums.length <= 10) return nums.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    return nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const handleLogin = () => {
    const cpfClean = form.cpf.replace(/\D/g, '');
    if (!cpfClean || !form.senha) { setMsg('Preencha todos os campos.'); setMsgType('error'); return; }
    const result = login(cpfClean, form.senha);
    setMsg(result.message);
    setMsgType(result.success ? 'success' : 'error');
  };

  const handleRegister = () => {
    if (!form.nomeCompleto || !form.cpf || !form.telefone || !form.cartaoSus || !form.senha) {
      setMsg('Preencha todos os campos.'); setMsgType('error'); return;
    }
    if (form.senha !== form.confirmarSenha) {
      setMsg('As senhas não coincidem.'); setMsgType('error'); return;
    }
    if (form.senha.length < 6) {
      setMsg('A senha deve ter pelo menos 6 caracteres.'); setMsgType('error'); return;
    }
    const result = register({
      nomeCompleto: form.nomeCompleto.trim(),
      cpf: form.cpf.replace(/\D/g, ''),
      telefone: form.telefone.replace(/\D/g, ''),
      cartaoSus: form.cartaoSus.replace(/\D/g, ''),
      senha: form.senha,
      tipo: 'paciente'
    });
    setMsg(result.message);
    setMsgType(result.success ? 'success' : 'error');
    if (result.success) {
      setMode('login');
      setForm({ nomeCompleto: '', cpf: '', telefone: '', cartaoSus: '', senha: '', confirmarSenha: '' });
    }
  };

  const handleAdminLogin = () => {
    const result = login('00000000000', form.senha);
    setMsg(result.message);
    setMsgType(result.success ? 'success' : 'error');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-sus mb-4">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">Agenda SUS</h1>
          <p className="text-muted-foreground text-sm mt-1">Sistema de Agendamento - UBS CDD</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted p-1 rounded-xl">
          <button onClick={() => { setMode('login'); setMsg(''); }} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${mode === 'login' ? 'gradient-sus text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}>
            <LogIn className="w-4 h-4" /> Entrar
          </button>
          <button onClick={() => { setMode('register'); setMsg(''); }} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${mode === 'register' ? 'gradient-sus text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}>
            <UserPlus className="w-4 h-4" /> Criar Conta
          </button>
          <button onClick={() => { setMode('admin'); setMsg(''); }} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${mode === 'admin' ? 'gradient-sus text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}>
            <Shield className="w-4 h-4" /> Admin
          </button>
        </div>

        {/* Form */}
        <div className="sus-card">
          {msg && (
            <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${msgType === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-secondary/20 text-secondary'}`}>
              {msg}
            </div>
          )}

          {mode === 'login' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">CPF</label>
                <input className="sus-input" placeholder="000.000.000-00" value={formatCPF(form.cpf)} onChange={e => handleChange('cpf', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Senha</label>
                <input className="sus-input" type="password" placeholder="Sua senha" value={form.senha} onChange={e => handleChange('senha', e.target.value)} />
              </div>
              <button onClick={handleLogin} className="sus-btn-primary w-full">Entrar</button>
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Nome Completo</label>
                <input className="sus-input" placeholder="Seu nome completo" value={form.nomeCompleto} onChange={e => handleChange('nomeCompleto', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">CPF</label>
                <input className="sus-input" placeholder="000.000.000-00" value={formatCPF(form.cpf)} onChange={e => handleChange('cpf', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Telefone</label>
                <input className="sus-input" placeholder="(00) 00000-0000" value={formatTel(form.telefone)} onChange={e => handleChange('telefone', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Cartão SUS</label>
                <input className="sus-input" placeholder="Número do cartão SUS" maxLength={15} value={form.cartaoSus} onChange={e => handleChange('cartaoSus', e.target.value.replace(/\D/g, ''))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Senha</label>
                <input className="sus-input" type="password" placeholder="Mínimo 6 caracteres" value={form.senha} onChange={e => handleChange('senha', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Confirmar Senha</label>
                <input className="sus-input" type="password" placeholder="Repita a senha" value={form.confirmarSenha} onChange={e => handleChange('confirmarSenha', e.target.value)} />
              </div>
              <button onClick={handleRegister} className="sus-btn-primary w-full">Criar Conta</button>
            </div>
          )}

          {mode === 'admin' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">Acesso restrito à Agência de Saúde CDD</p>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Senha do Administrador</label>
                <input className="sus-input" type="password" placeholder="Senha admin" value={form.senha} onChange={e => handleChange('senha', e.target.value)} />
              </div>
              <button onClick={handleAdminLogin} className="sus-btn-primary w-full">Entrar como Admin</button>
              <p className="text-xs text-muted-foreground text-center">Senha padrão: admin123</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
