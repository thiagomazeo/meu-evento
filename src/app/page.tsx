'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  formatarMoeda,
  mascaraCNPJ,
  mascaraTelefone,
  mascaraDataBR,
  dataBRParaISO,
  dataISOParaBR,
  mascaraInteiro,
  inteiroParaNumero,
} from '@/lib/formatadores';
import {
  exportarRelatorioGeralPDF,
  exportarRelatorioGeralExcel,
} from '@/lib/relatorios';
import {
  Calendar,
  Building2,
  Plus,
  LogOut,
  MapPin,
  Users,
  ArrowRight,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileWarning,
  Printer,
  Clock,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';

type Organizacao = {
  id: string;
  nome: string;
  plano: string;
};

type Empresa = {
  id: string;
  razao_social: string;
  nome_fantasia: string | null;
  cnpj: string;
  responsavel_nome: string | null;
  responsavel_contato: string | null;
};

type Evento = {
  id: string;
  empresa_realizadora_id: string;
  nome: string;
  data_evento: string;
  local_evento: string;
  publico_estimado: number;
  status: string;
  empresas_realizadoras?: { razao_social: string } | null;
};

type ResumoFinanceiro = {
  evento_id: string;
  faturamento_bruto: number;
  total_taxas_impostos: number;
  custo_total_contratos: number;
  total_pago: number;
  total_a_pagar: number;
  lucro_ou_prejuizo: number;
};

type ContratoPendente = {
  id: string;
  evento_id: string;
  descricao_servico: string;
  valor_total: number;
  status_assinatura: string;
  eventos?: { nome: string } | null;
  parceiros?: { nome: string } | null;
};

type PagamentoAlerta = {
  id: string;
  descricao_parcela: string;
  valor: number;
  data_vencimento: string;
  status: string;
  contratos?: {
    evento_id: string;
    eventos?: { nome: string } | null;
    parceiros?: { nome: string } | null;
  } | null;
};

const STATUS_LABELS: Record<string, { label: string; cor: string }> = {
  planejamento: { label: 'Planejamento', cor: 'bg-slate-100 text-slate-700' },
  pre_producao: { label: 'Pré-produção', cor: 'bg-amber-100 text-amber-800' },
  em_andamento: { label: 'Em andamento', cor: 'bg-blue-100 text-blue-800' },
  realizado: { label: 'Realizado', cor: 'bg-indigo-100 text-indigo-800' },
  fechado: { label: 'Fechado', cor: 'bg-emerald-100 text-emerald-800' },
  cancelado: { label: 'Cancelado', cor: 'bg-red-100 text-red-700' },
};

export default function Home() {
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState<any>(null);
  const [organizacao, setOrganizacao] = useState<Organizacao | null>(null);

  // Autenticação
  const [modoAuth, setModoAuth] = useState<'login' | 'registo'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [nomeProdutora, setNomeProdutora] = useState('');
  const [erroAuth, setErroAuth] = useState('');
  const [processandoAuth, setProcessandoAuth] = useState(false);

  // Navegação e Dados
  const [abaAtiva, setAbaAtiva] = useState<'dashboard' | 'eventos' | 'empresas'>('dashboard');
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [resumos, setResumos] = useState<Record<string, ResumoFinanceiro>>({});
  const [contratosPendentes, setContratosPendentes] = useState<ContratoPendente[]>([]);
  const [pagamentosAlerta, setPagamentosAlerta] = useState<PagamentoAlerta[]>([]);

  // Filtros do Dashboard
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroEmpresa, setFiltroEmpresa] = useState<string>('todas');
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');

  // Formulário Empresa (Criar / Editar)
  const [editandoEmpresaId, setEditandoEmpresaId] = useState<string | null>(null);
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [respEmpresa, setRespEmpresa] = useState('');
  const [contatoEmpresa, setContatoEmpresa] = useState('');

  // Formulário Evento (Criar / Editar)
  const [editandoEventoId, setEditandoEventoId] = useState<string | null>(null);
  const [nomeEvento, setNomeEvento] = useState('');
  const [dataEvento, setDataEvento] = useState('');
  const [localEvento, setLocalEvento] = useState('');
  const [publicoEstimado, setPublicoEstimado] = useState('');
  const [empresaId, setEmpresaId] = useState('');

  useEffect(() => {
    verificarSessao();
  }, []);

  async function verificarSessao() {
    setCarregando(true);
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setUsuario(data.user);
      await carregarDadosOrganizacao(data.user.id);
    }
    setCarregando(false);
  }

  async function carregarDadosOrganizacao(userId: string) {
    const { data: membro } = await supabase
      .from('membros_organizacao')
      .select('organizacao_id, organizacoes(id, nome, plano)')
      .eq('usuario_id', userId)
      .limit(1)
      .single();

    if (membro && membro.organizacoes) {
      const org = membro.organizacoes as unknown as Organizacao;
      setOrganizacao(org);
      await Promise.all([
        carregarEmpresas(org.id),
        carregarEventos(org.id),
        carregarResumosFinanceiros(org.id),
        carregarAlertas(org.id),
      ]);
    }
  }

  async function carregarEmpresas(orgId: string) {
    const { data } = await supabase
      .from('empresas_realizadoras')
      .select('*')
      .eq('organizacao_id', orgId)
      .order('criado_em', { ascending: false });
    if (data) {
      setEmpresas(data);
      if (data.length > 0 && !empresaId) setEmpresaId(data[0].id);
    }
  }

  async function carregarEventos(orgId: string) {
    const { data } = await supabase
      .from('eventos')
      .select('*, empresas_realizadoras(razao_social)')
      .eq('organizacao_id', orgId)
      .order('data_evento', { ascending: true });
    if (data) setEventos(data);
  }

  async function carregarResumosFinanceiros(orgId: string) {
    const { data } = await supabase
      .from('vw_resumo_financeiro_evento')
      .select('*')
      .eq('organizacao_id', orgId);

    if (data) {
      const mapa: Record<string, ResumoFinanceiro> = {};
      data.forEach((item: any) => {
        mapa[item.evento_id] = {
          evento_id: item.evento_id,
          faturamento_bruto: Number(item.faturamento_bruto || 0),
          total_taxas_impostos: Number(item.total_taxas_impostos || 0),
          custo_total_contratos: Number(item.custo_total_contratos || 0),
          total_pago: Number(item.total_pago || 0),
          total_a_pagar: Number(item.total_a_pagar || 0),
          lucro_ou_prejuizo: Number(item.lucro_ou_prejuizo || 0),
        };
      });
      setResumos(mapa);
    }
  }

  async function carregarAlertas(orgId: string) {
    const { data: conts } = await supabase
      .from('contratos')
      .select('id, evento_id, descricao_servico, valor_total, status_assinatura, eventos(nome), parceiros(nome)')
      .eq('organizacao_id', orgId)
      .in('status_assinatura', ['pendente', 'enviado'])
      .order('criado_em', { ascending: false });

    if (conts) setContratosPendentes(conts as unknown as ContratoPendente[]);

    const limite = new Date();
    limite.setDate(limite.getDate() + 7);
    const dataLimiteStr = limite.toISOString().split('T')[0];

    const { data: pags } = await supabase
      .from('pagamentos')
      .select('id, descricao_parcela, valor, data_vencimento, status, contratos(evento_id, eventos(nome), parceiros(nome))')
      .eq('organizacao_id', orgId)
      .neq('status', 'pago')
      .lte('data_vencimento', dataLimiteStr)
      .order('data_vencimento', { ascending: true });

    if (pags) setPagamentosAlerta(pags as unknown as PagamentoAlerta[]);
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setErroAuth('');
    setProcessandoAuth(true);

    try {
      if (modoAuth === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          setUsuario(data.user);
          await carregarDadosOrganizacao(data.user.id);
        }
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.user) throw new Error('Não foi possível criar a conta.');

        const { error: errPerfil } = await supabase.from('perfis').insert({
          id: data.user.id,
          nome_completo: nomeCompleto,
          email,
        });
        if (errPerfil) throw errPerfil;

        const orgId = crypto.randomUUID();
        const slug =
          nomeProdutora
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') +
          '-' +
          Math.floor(1000 + Math.random() * 9000);

        const { error: errOrg } = await supabase.from('organizacoes').insert({
          id: orgId,
          nome: nomeProdutora,
          slug,
        });
        if (errOrg) throw errOrg;

        const { error: errMembro } = await supabase.from('membros_organizacao').insert({
          organizacao_id: orgId,
          usuario_id: data.user.id,
          papel: 'admin',
        });
        if (errMembro) throw errMembro;

        setUsuario(data.user);
        await carregarDadosOrganizacao(data.user.id);
      }
    } catch (err: any) {
      setErroAuth(err.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setProcessandoAuth(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUsuario(null);
    setOrganizacao(null);
    setEventos([]);
    setEmpresas([]);
  }

  // --- EMPRESAS: CRIAR, EDITAR E EXCLUIR ---
  function iniciarEdicaoEmpresa(emp: Empresa) {
    setEditandoEmpresaId(emp.id);
    setRazaoSocial(emp.razao_social);
    setCnpj(mascaraCNPJ(emp.cnpj));
    setRespEmpresa(emp.responsavel_nome || '');
    setContatoEmpresa(emp.responsavel_contato ? mascaraTelefone(emp.responsavel_contato) : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelarEdicaoEmpresa() {
    setEditandoEmpresaId(null);
    setRazaoSocial('');
    setCnpj('');
    setRespEmpresa('');
    setContatoEmpresa('');
  }

  async function salvarEmpresa(e: React.FormEvent) {
    e.preventDefault();
    if (!organizacao) return;

    if (cnpj.replace(/\D/g, '').length !== 14) {
      alert('Digite um CNPJ completo com 14 números.');
      return;
    }

    const payload = {
      razao_social: razaoSocial,
      cnpj,
      responsavel_nome: respEmpresa,
      responsavel_contato: contatoEmpresa,
    };

    const { error } = editandoEmpresaId
      ? await supabase
          .from('empresas_realizadoras')
          .update(payload)
          .eq('id', editandoEmpresaId)
      : await supabase
          .from('empresas_realizadoras')
          .insert({ ...payload, organizacao_id: organizacao.id });

    if (!error) {
      cancelarEdicaoEmpresa();
      await Promise.all([
        carregarEmpresas(organizacao.id),
        carregarEventos(organizacao.id),
      ]);
    } else {
      alert('Erro ao salvar empresa: ' + error.message);
    }
  }

  async function excluirEmpresa(emp: Empresa) {
    if (!organizacao) return;
    if (!window.confirm(`Deseja realmente excluir a empresa "${emp.razao_social}"?`)) return;

    const { error } = await supabase
      .from('empresas_realizadoras')
      .delete()
      .eq('id', emp.id);

    if (error) {
      alert(
        'Não foi possível excluir esta empresa. Verifique se existem eventos vinculados a ela.'
      );
      return;
    }

    if (editandoEmpresaId === emp.id) cancelarEdicaoEmpresa();
    await carregarEmpresas(organizacao.id);
  }

  // --- EVENTOS: CRIAR, EDITAR E EXCLUIR ---
  function iniciarEdicaoEvento(ev: Evento) {
    setEditandoEventoId(ev.id);
    setEmpresaId(ev.empresa_realizadora_id);
    setNomeEvento(ev.nome);
    setDataEvento(dataISOParaBR(ev.data_evento));
    setLocalEvento(ev.local_evento);
    setPublicoEstimado(
      ev.publico_estimado ? Number(ev.publico_estimado).toLocaleString('pt-BR') : ''
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelarEdicaoEvento() {
    setEditandoEventoId(null);
    setNomeEvento('');
    setDataEvento('');
    setLocalEvento('');
    setPublicoEstimado('');
  }

  async function salvarEvento(e: React.FormEvent) {
    e.preventDefault();
    if (!organizacao || !empresaId) {
      alert('Cadastre primeiro uma Empresa Realizadora antes de criar o evento.');
      return;
    }

    const dataISO = dataBRParaISO(dataEvento);
    if (!dataISO) {
      alert('Digite uma data válida no formato DD/MM/AAAA.');
      return;
    }

    const payload = {
      empresa_realizadora_id: empresaId,
      nome: nomeEvento,
      data_evento: dataISO,
      local_evento: localEvento,
      publico_estimado: inteiroParaNumero(publicoEstimado),
    };

    const { error } = editandoEventoId
      ? await supabase.from('eventos').update(payload).eq('id', editandoEventoId)
      : await supabase.from('eventos').insert({
          ...payload,
          organizacao_id: organizacao.id,
          status: 'planejamento',
        });

    if (!error) {
      cancelarEdicaoEvento();
      await Promise.all([
        carregarEventos(organizacao.id),
        carregarResumosFinanceiros(organizacao.id),
      ]);
    } else {
      alert('Erro ao salvar evento: ' + error.message);
    }
  }

  async function excluirEvento(ev: Evento) {
    if (!organizacao) return;
    if (
      !window.confirm(
        `Deseja realmente excluir o evento "${ev.nome}"? Todos os contratos, pagamentos e fechamentos dele também serão removidos.`
      )
    ) {
      return;
    }

    const { error } = await supabase.from('eventos').delete().eq('id', ev.id);

    if (error) {
      alert('Erro ao excluir evento: ' + error.message);
      return;
    }

    if (editandoEventoId === ev.id) cancelarEdicaoEvento();
    await Promise.all([
      carregarEventos(organizacao.id),
      carregarResumosFinanceiros(organizacao.id),
      carregarAlertas(organizacao.id),
    ]);
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        Carregando sistema...
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <img
              src="/logo.png"
              alt="MEU EVENTO"
              className="h-10 w-auto object-contain mb-2"
            />
            <p className="text-xs text-slate-500">Gestão Profissional de Eventos</p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => setModoAuth('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                modoAuth === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setModoAuth('registo')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                modoAuth === 'registo' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Criar Produtora
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {modoAuth === 'registo' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nome da Produtora
                  </label>
                  <input
                    type="text"
                    required
                    value={nomeProdutora}
                    onChange={(e) => setNomeProdutora(e.target.value)}
                    placeholder="Ex: Horizonte Eventos"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Seu Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={nomeCompleto}
                    onChange={(e) => setNomeCompleto(e.target.value)}
                    placeholder="Ex: Thiago Mazeo"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@produtora.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            {erroAuth && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {erroAuth}
              </div>
            )}

            <button
              type="submit"
              disabled={processandoAuth}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition disabled:opacity-50"
            >
              {processandoAuth
                ? 'Processando...'
                : modoAuth === 'login'
                ? 'Acessar Painel'
                : 'Criar Conta da Produtora'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const dataInicioISO = dataBRParaISO(dataInicio);
  const dataFimISO = dataBRParaISO(dataFim);

  const eventosFiltrados = eventos.filter((ev) => {
    if (filtroStatus !== 'todos' && ev.status !== filtroStatus) return false;
    if (filtroEmpresa !== 'todas' && ev.empresa_realizadora_id !== filtroEmpresa) return false;
    if (dataInicioISO && ev.data_evento < dataInicioISO) return false;
    if (dataFimISO && ev.data_evento > dataFimISO) return false;
    return true;
  });

  const totais = eventosFiltrados.reduce(
    (acc, ev) => {
      const r = resumos[ev.id];
      if (r) {
        acc.faturamento += r.faturamento_bruto;
        acc.custos += r.custo_total_contratos;
        acc.taxas += r.total_taxas_impostos;
        acc.lucro += r.lucro_ou_prejuizo;
        acc.pago += r.total_pago;
        acc.aPagar += r.total_a_pagar;
      }
      return acc;
    },
    { faturamento: 0, custos: 0, taxas: 0, lucro: 0, pago: 0, aPagar: 0 }
  );

  const hojeStr = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 print:static">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="MEU EVENTO"
              className="h-8 w-auto object-contain"
            />
            <span className="text-slate-300 hidden sm:inline">|</span>
            <div className="hidden sm:block">
              <span className="font-semibold text-sm text-slate-800 block leading-tight">
                {organizacao?.nome || 'Minha Produtora'}
              </span>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider">
                Plano {organizacao?.plano || 'Trial'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 print:hidden">
            <span className="text-sm text-slate-600 hidden sm:inline">{usuario.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-red-600 font-medium"
            >
              <LogOut size={16} /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 border-b border-slate-200 pb-4 print:hidden">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setAbaAtiva('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                abaAtiva === 'dashboard'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <BarChart3 size={16} /> Dashboard & Relatórios
            </button>
            <button
              onClick={() => setAbaAtiva('eventos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                abaAtiva === 'eventos'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Calendar size={16} /> Eventos ({eventos.length})
            </button>
            <button
              onClick={() => setAbaAtiva('empresas')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                abaAtiva === 'empresas'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Building2 size={16} /> Empresas Realizadoras ({empresas.length})
            </button>
          </div>

          {abaAtiva === 'dashboard' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  exportarRelatorioGeralPDF(
                    organizacao?.nome || 'Produtora',
                    eventosFiltrados,
                    resumos,
                    totais
                  )
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg"
              >
                <Printer size={16} /> Exportar PDF
              </button>
              <button
                onClick={() =>
                  exportarRelatorioGeralExcel(eventosFiltrados, resumos)
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg"
              >
                <BarChart3 size={16} /> Exportar Excel
              </button>
            </div>
          )}
        </div>

        {/* ABA 1: DASHBOARD */}
        {abaAtiva === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                  Empresa Realizadora
                </label>
                <select
                  value={filtroEmpresa}
                  onChange={(e) => setFiltroEmpresa(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="todas">Todas as empresas</option>
                  {empresas.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.razao_social}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                  Status do Evento
                </label>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="todos">Todos os status</option>
                  {Object.entries(STATUS_LABELS).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                  De (Data Inicial)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  value={dataInicio}
                  onChange={(e) => setDataInicio(mascaraDataBR(e.target.value))}
                  placeholder="DD/MM/AAAA"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                  Até (Data Final)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  value={dataFim}
                  onChange={(e) => setDataFim(mascaraDataBR(e.target.value))}
                  placeholder="DD/MM/AAAA"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500">Faturamento Consolidado</span>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {formatarMoeda(totais.faturamento)}
                </p>
                <span className="text-[11px] text-slate-500">
                  {eventosFiltrados.length} evento(s) no filtro
                </span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500">Custos Totais (Contratos)</span>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {formatarMoeda(totais.custos)}
                </p>
                <span className="text-[11px] text-slate-500">
                  Pago: {formatarMoeda(totais.pago)} | Falta: {formatarMoeda(totais.aPagar)}
                </span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500">Total Taxas e Impostos</span>
                <p className="text-2xl font-bold text-amber-700 mt-1">
                  {formatarMoeda(totais.taxas)}
                </p>
              </div>

              <div
                className={`p-5 rounded-xl border ${
                  totais.lucro >= 0
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <span className="text-xs font-medium flex items-center gap-1">
                  {totais.lucro >= 0 ? (
                    <>
                      <TrendingUp size={14} className="text-emerald-700" /> Lucro Consolidado
                    </>
                  ) : (
                    <>
                      <TrendingDown size={14} className="text-red-700" /> Prejuízo Consolidado
                    </>
                  )}
                </span>
                <p
                  className={`text-2xl font-bold mt-1 ${
                    totais.lucro >= 0 ? 'text-emerald-800' : 'text-red-800'
                  }`}
                >
                  {formatarMoeda(totais.lucro)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
              <div className="bg-white p-5 rounded-xl border border-slate-200">
                <h2 className="font-bold text-base mb-3 flex items-center gap-2 text-amber-800">
                  <FileWarning size={18} /> Contratos Aguardando Assinatura ({contratosPendentes.length})
                </h2>
                {contratosPendentes.length === 0 ? (
                  <p className="text-sm text-slate-500">Todos os contratos estão assinados.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {contratosPendentes.map((c) => (
                      <a
                        key={c.id}
                        href={`/eventos/${c.evento_id}`}
                        className="flex items-center justify-between p-3 bg-amber-50/60 hover:bg-amber-50 border border-amber-100 rounded-lg transition"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {c.parceiros?.nome} — {c.descricao_servico}
                          </p>
                          <p className="text-xs text-slate-500">
                            Evento: {c.eventos?.nome} • Status: {c.status_assinatura}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {formatarMoeda(Number(c.valor_total))}
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200">
                <h2 className="font-bold text-base mb-3 flex items-center gap-2 text-red-700">
                  <AlertTriangle size={18} /> Pagamentos Vencidos ou Próximos 7 dias ({pagamentosAlerta.length})
                </h2>
                {pagamentosAlerta.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Nenhum pagamento vencido ou próximo do vencimento.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {pagamentosAlerta.map((p) => {
                      const atrasado = p.data_vencimento < hojeStr;
                      return (
                        <a
                          key={p.id}
                          href={`/eventos/${p.contratos?.evento_id}`}
                          className={`flex items-center justify-between p-3 rounded-lg border transition ${
                            atrasado
                              ? 'bg-red-50/70 hover:bg-red-50 border-red-200'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {p.contratos?.parceiros?.nome} — {p.descricao_parcela}
                            </p>
                            <p className="text-xs text-slate-600 flex items-center gap-1.5">
                              <Clock size={12} /> Vence: {dataISOParaBR(p.data_vencimento)} •{' '}
                              {p.contratos?.eventos?.nome}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold block">
                              {formatarMoeda(Number(p.valor))}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                atrasado
                                  ? 'bg-red-200 text-red-900'
                                  : 'bg-amber-200 text-amber-900'
                              }`}
                            >
                              {atrasado ? 'Atrasado' : 'Em breve'}
                            </span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-200">
                <h2 className="font-bold text-base">Relatório Financeiro por Evento</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3">Evento</th>
                      <th className="px-4 py-3">Data</th>
                      <th className="px-4 py-3">Empresa</th>
                      <th className="px-4 py-3 text-right">Faturamento</th>
                      <th className="px-4 py-3 text-right">Custos</th>
                      <th className="px-4 py-3 text-right">Taxas</th>
                      <th className="px-4 py-3 text-right">Lucro / Prejuízo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {eventosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                          Nenhum evento encontrado com os filtros selecionados.
                        </td>
                      </tr>
                    ) : (
                      eventosFiltrados.map((ev) => {
                        const r = resumos[ev.id] || {
                          faturamento_bruto: 0,
                          custo_total_contratos: 0,
                          total_taxas_impostos: 0,
                          lucro_ou_prejuizo: 0,
                        };
                        return (
                          <tr key={ev.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium">
                              <a
                                href={`/eventos/${ev.id}`}
                                className="text-indigo-600 hover:underline"
                              >
                                {ev.nome}
                              </a>
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {dataISOParaBR(ev.data_evento)}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {ev.empresas_realizadoras?.razao_social}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {formatarMoeda(r.faturamento_bruto)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {formatarMoeda(r.custo_total_contratos)}
                            </td>
                            <td className="px-4 py-3 text-right text-amber-700">
                              {formatarMoeda(r.total_taxas_impostos)}
                            </td>
                            <td
                              className={`px-4 py-3 text-right font-bold ${
                                r.lucro_ou_prejuizo >= 0 ? 'text-emerald-700' : 'text-red-700'
                              }`}
                            >
                              {formatarMoeda(r.lucro_ou_prejuizo)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: EVENTOS */}
        {abaAtiva === 'eventos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 h-fit">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  {editandoEventoId ? (
                    <>
                      <Pencil size={18} className="text-amber-600" /> Editar Evento
                    </>
                  ) : (
                    <>
                      <Plus size={18} className="text-indigo-600" /> Novo Evento
                    </>
                  )}
                </h2>
                {editandoEventoId && (
                  <button
                    type="button"
                    onClick={cancelarEdicaoEvento}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <X size={14} /> Cancelar
                  </button>
                )}
              </div>

              {empresas.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                  Para criar o primeiro evento, cadastre primeiro uma{' '}
                  <button
                    onClick={() => setAbaAtiva('empresas')}
                    className="underline font-semibold"
                  >
                    Empresa Realizadora
                  </button>
                  .
                </div>
              ) : (
                <form onSubmit={salvarEvento} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Empresa Responsável (CNPJ)
                    </label>
                    <select
                      required
                      value={empresaId}
                      onChange={(e) => setEmpresaId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      {empresas.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.razao_social} ({mascaraCNPJ(emp.cnpj)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Nome do Evento
                    </label>
                    <input
                      type="text"
                      required
                      value={nomeEvento}
                      onChange={(e) => setNomeEvento(e.target.value)}
                      placeholder="Ex: Festival de Verão 2026"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Data (DD/MM/AAAA)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={10}
                        required
                        value={dataEvento}
                        onChange={(e) => setDataEvento(mascaraDataBR(e.target.value))}
                        placeholder="DD/MM/AAAA"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Público Estimado
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={publicoEstimado}
                        onChange={(e) => setPublicoEstimado(mascaraInteiro(e.target.value))}
                        placeholder="Ex: 10.000"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Local do Evento
                    </label>
                    <input
                      type="text"
                      required
                      value={localEvento}
                      onChange={(e) => setLocalEvento(e.target.value)}
                      placeholder="Ex: Arena Central"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-2.5 text-white text-sm font-medium rounded-lg transition ${
                      editandoEventoId
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {editandoEventoId ? 'Salvar Alterações' : 'Salvar Evento'}
                  </button>
                </form>
              )}
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-bold text-lg">Seus Eventos</h2>
              {eventos.length === 0 ? (
                <div className="bg-white p-10 rounded-xl border border-slate-200 text-center text-slate-500 text-sm">
                  Nenhum evento cadastrado ainda.
                </div>
              ) : (
                eventos.map((ev) => {
                  const badge = STATUS_LABELS[ev.status] || STATUS_LABELS.planejamento;
                  return (
                    <div
                      key={ev.id}
                      className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900 text-base">{ev.nome}</h3>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${badge.cor}`}>
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-2">
                          Realização: {ev.empresas_realizadoras?.razao_social}
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} /> {dataISOParaBR(ev.data_evento)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={14} /> {ev.local_evento}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={14} /> {Number(ev.publico_estimado).toLocaleString('pt-BR')} pessoas
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => iniciarEdicaoEvento(ev)}
                          title="Editar Evento"
                          className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => excluirEvento(ev)}
                          title="Excluir Evento"
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={16} />
                        </button>
                        <a
                          href={`/eventos/${ev.id}`}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-medium rounded-lg transition"
                        >
                          Gerir Evento <ArrowRight size={14} />
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ABA 3: EMPRESAS REALIZADORAS */}
        {abaAtiva === 'empresas' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 h-fit">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  {editandoEmpresaId ? (
                    <>
                      <Pencil size={18} className="text-amber-600" /> Editar Empresa
                    </>
                  ) : (
                    <>
                      <Plus size={18} className="text-indigo-600" /> Nova Empresa
                    </>
                  )}
                </h2>
                {editandoEmpresaId && (
                  <button
                    type="button"
                    onClick={cancelarEdicaoEmpresa}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <X size={14} /> Cancelar
                  </button>
                )}
              </div>

              <form onSubmit={salvarEmpresa} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Razão Social
                  </label>
                  <input
                    type="text"
                    required
                    value={razaoSocial}
                    onChange={(e) => setRazaoSocial(e.target.value)}
                    placeholder="Ex: Horizonte Produções Ltda"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">CNPJ</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={18}
                    required
                    value={cnpj}
                    onChange={(e) => setCnpj(mascaraCNPJ(e.target.value))}
                    placeholder="00.000.000/0001-00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Responsável Legal
                  </label>
                  <input
                    type="text"
                    value={respEmpresa}
                    onChange={(e) => setRespEmpresa(e.target.value)}
                    placeholder="Nome do responsável"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    WhatsApp / Telefone
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={15}
                    value={contatoEmpresa}
                    onChange={(e) => setContatoEmpresa(mascaraTelefone(e.target.value))}
                    placeholder="(31) 99999-9999"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className={`w-full py-2.5 text-white text-sm font-medium rounded-lg transition ${
                    editandoEmpresaId
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {editandoEmpresaId ? 'Salvar Alterações' : 'Salvar Empresa'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-3">
              <h2 className="font-bold text-lg">Empresas Realizadoras</h2>
              {empresas.length === 0 ? (
                <div className="bg-white p-10 rounded-xl border border-slate-200 text-center text-slate-500 text-sm">
                  Ainda não existem empresas cadastradas.
                </div>
              ) : (
                empresas.map((emp) => (
                  <div
                    key={emp.id}
                    className="bg-white p-5 rounded-xl border border-slate-200 flex justify-between items-center gap-4"
                  >
                    <div>
                      <h3 className="font-bold text-slate-900">{emp.razao_social}</h3>
                      <p className="text-xs text-slate-500">CNPJ: {mascaraCNPJ(emp.cnpj)}</p>
                      {emp.responsavel_nome && (
                        <p className="text-xs text-slate-600 mt-1">
                          Responsável: {emp.responsavel_nome} —{' '}
                          {emp.responsavel_contato ? mascaraTelefone(emp.responsavel_contato) : ''}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => iniciarEdicaoEmpresa(emp)}
                        title="Editar Empresa"
                        className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => excluirEmpresa(emp)}
                        title="Excluir Empresa"
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}