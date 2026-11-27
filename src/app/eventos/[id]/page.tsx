'use client';

import { Suspense, useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import {
  formatarMoeda,
  mascaraMoeda,
  moedaParaNumero,
  mascaraTelefone,
  mascaraDataBR,
  dataBRParaISO,
  dataISOParaBR,
} from '@/lib/formatadores';
import {
  exportarFechamentoEventoPDF,
  exportarFechamentoEventoExcel,
} from '@/lib/relatorios';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  FileText,
  DollarSign,
  CheckCircle2,
  Clock,
  Plus,
  Printer,
  Trash2,
  Phone,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Upload,
  ExternalLink,
  Pencil,
  X,
} from 'lucide-react';

type Evento = {
  id: string;
  organizacao_id: string;
  nome: string;
  data_evento: string;
  local_evento: string;
  publico_estimado: number;
  status: string;
  empresas_realizadoras?: { razao_social: string; cnpj: string } | null;
};

type Parceiro = {
  id: string;
  tipo: 'fornecedor' | 'artista';
  nome: string;
  categoria: string;
  responsavel_nome: string;
  responsavel_whatsapp: string;
  responsavel_email: string | null;
};

type Contrato = {
  id: string;
  parceiro_id: string;
  descricao_servico: string;
  valor_total: number;
  status_assinatura: 'pendente' | 'enviado' | 'assinado' | 'cancelado' | 'sem_contrato';
  arquivo_contrato_path: string | null;
  parceiros?: Parceiro;
};

type Pagamento = {
  id: string;
  contrato_id: string;
  descricao_parcela: string;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: 'pendente' | 'pago' | 'atrasado';
  comprovante_path: string | null;
  contratos?: {
    descricao_servico: string;
    parceiros?: { nome: string };
  };
};

type TaxaImposto = {
  id: string;
  nome: string;
  tipo_calculo: 'percentual' | 'valor_fixo';
  base_calculo: 'bilheteria' | 'bar' | 'faturamento_total';
  valor_ou_percentual: number;
};

function ConteudoEvento({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: eventoId } = use(params);

  const [carregando, setCarregando] = useState(true);
  const [evento, setEvento] = useState<Evento | null>(null);
  const [aba, setAba] = useState<'contratos' | 'pagamentos' | 'parceiros' | 'fechamento'>('contratos');
  const [enviandoArquivoId, setEnviandoArquivoId] = useState<string | null>(null);

  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [taxas, setTaxas] = useState<TaxaImposto[]>([]);

  // Fechamento (formatados em R$ e com trava de edição)
  const [bilheteria, setBilheteria] = useState('R$ 0,00');
  const [bar, setBar] = useState('R$ 0,00');
  const [outrasReceitas, setOutrasReceitas] = useState('R$ 0,00');
  const [salvandoFechamento, setSalvandoFechamento] = useState(false);
  const [editandoReceitas, setEditandoReceitas] = useState(true);

  // Parceiro (Criar / Editar)
  const [editandoParceiroId, setEditandoParceiroId] = useState<string | null>(null);
  const [tipoParceiro, setTipoParceiro] = useState<'fornecedor' | 'artista'>('fornecedor');
  const [nomeParceiro, setNomeParceiro] = useState('');
  const [categoriaParceiro, setCategoriaParceiro] = useState('');
  const [respNome, setRespNome] = useState('');
  const [respWhats, setRespWhats] = useState('');
  const [respEmail, setRespEmail] = useState('');

  // Contrato (Criar / Editar)
  const [editandoContratoId, setEditandoContratoId] = useState<string | null>(null);
  const [parceiroContratoId, setParceiroContratoId] = useState('');
  const [descServico, setDescServico] = useState('');
  const [valorContrato, setValorContrato] = useState('');

  // Pagamento (Criar / Editar)
  const [editandoPagamentoId, setEditandoPagamentoId] = useState<string | null>(null);
  const [contratoPagId, setContratoPagId] = useState('');
  const [descParcela, setDescParcela] = useState('');
  const [valorPag, setValorPag] = useState('');
  const [vencimentoPag, setVencimentoPag] = useState('');

  // Nova Taxa / Imposto
  const [nomeTaxa, setNomeTaxa] = useState('');
  const [tipoTaxa, setTipoTaxa] = useState<'percentual' | 'valor_fixo'>('percentual');
  const [baseTaxa, setBaseTaxa] = useState<'faturamento_total' | 'bilheteria' | 'bar'>('faturamento_total');
  const [valorTaxa, setValorTaxa] = useState('');

  useEffect(() => {
    carregarTudo();
  }, [eventoId]);

  async function carregarTudo() {
    setCarregando(true);
    const { data: ev } = await supabase
      .from('eventos')
      .select('*, empresas_realizadoras(razao_social, cnpj)')
      .eq('id', eventoId)
      .single();

    if (ev) {
      setEvento(ev);
      await Promise.all([
        carregarParceiros(ev.organizacao_id),
        carregarContratos(),
        carregarFechamento(),
        carregarTaxas(),
      ]);
    }
    setCarregando(false);
  }

  async function carregarParceiros(orgId: string) {
    const { data } = await supabase
      .from('parceiros')
      .select('*')
      .eq('organizacao_id', orgId)
      .order('nome');
    if (data) {
      setParceiros(data);
      if (data.length > 0 && !parceiroContratoId) setParceiroContratoId(data[0].id);
    }
  }

  async function carregarContratos() {
    const { data } = await supabase
      .from('contratos')
      .select('*, parceiros(*)')
      .eq('evento_id', eventoId)
      .order('criado_em', { ascending: false });
    if (data) {
      setContratos(data);
      if (data.length > 0 && !contratoPagId) setContratoPagId(data[0].id);
      const ids = data.map((c) => c.id);
      if (ids.length > 0) {
        const { data: pags } = await supabase
          .from('pagamentos')
          .select('*, contratos(descricao_servico, parceiros(nome))')
          .in('contrato_id', ids)
          .order('data_vencimento', { ascending: true });
        if (pags) setPagamentos(pags);
      } else {
        setPagamentos([]);
      }
    }
  }

  async function carregarFechamento() {
    const { data } = await supabase
      .from('fechamentos_evento')
      .select('*')
      .eq('evento_id', eventoId)
      .maybeSingle();
    if (data) {
      setBilheteria(formatarMoeda(Number(data.receita_bilheteria || 0)));
      setBar(formatarMoeda(Number(data.receita_bar || 0)));
      setOutrasReceitas(formatarMoeda(Number(data.outras_receitas || 0)));
      setEditandoReceitas(false);
    } else {
      setEditandoReceitas(true);
    }
  }

  async function carregarTaxas() {
    const { data } = await supabase
      .from('taxas_impostos_evento')
      .select('*')
      .eq('evento_id', eventoId)
      .order('criado_em', { ascending: true });
    if (data) setTaxas(data);
  }

  async function handleUploadArquivo(
    file: File | undefined,
    tipo: 'contrato' | 'comprovante',
    registroId: string
  ) {
    if (!file || !evento) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('O arquivo deve ter no máximo 10 MB.');
      return;
    }

    setEnviandoArquivoId(registroId);
    try {
      const extensao = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      const caminho = `${evento.organizacao_id}/${evento.id}/${tipo}s/${registroId}-${Date.now()}.${extensao}`;

      const { error: uploadError } = await supabase.storage
        .from('documentos-eventos')
        .upload(caminho, file, { upsert: true });

      if (uploadError) throw uploadError;

      if (tipo === 'contrato') {
        const { error: dbError } = await supabase
          .from('contratos')
          .update({ arquivo_contrato_path: caminho })
          .eq('id', registroId);
        if (dbError) throw dbError;
      } else {
        const { error: dbError } = await supabase
          .from('pagamentos')
          .update({ comprovante_path: caminho })
          .eq('id', registroId);
        if (dbError) throw dbError;
      }

      await carregarContratos();
    } catch (err: any) {
      alert('Erro ao enviar arquivo: ' + (err.message || 'Tente novamente.'));
    } finally {
      setEnviandoArquivoId(null);
    }
  }

  async function abrirArquivo(caminho: string) {
    const { data, error } = await supabase.storage
      .from('documentos-eventos')
      .createSignedUrl(caminho, 60);

    if (error || !data?.signedUrl) {
      alert('Não foi possível abrir o arquivo.');
      return;
    }
    window.open(data.signedUrl, '_blank');
  }

  async function atualizarStatusEvento(novoStatus: string) {
    if (!evento) return;
    await supabase.from('eventos').update({ status: novoStatus }).eq('id', evento.id);
    setEvento({ ...evento, status: novoStatus });
  }

  // --- PARCEIROS (FORNECEDORES / ARTISTAS): CRIAR, EDITAR E EXCLUIR ---
  function iniciarEdicaoParceiro(p: Parceiro) {
    setEditandoParceiroId(p.id);
    setTipoParceiro(p.tipo);
    setNomeParceiro(p.nome);
    setCategoriaParceiro(p.categoria);
    setRespNome(p.responsavel_nome);
    setRespWhats(mascaraTelefone(p.responsavel_whatsapp));
    setRespEmail(p.responsavel_email || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelarEdicaoParceiro() {
    setEditandoParceiroId(null);
    setTipoParceiro('fornecedor');
    setNomeParceiro('');
    setCategoriaParceiro('');
    setRespNome('');
    setRespWhats('');
    setRespEmail('');
  }

  async function salvarParceiro(e: React.FormEvent) {
    e.preventDefault();
    if (!evento) return;

    const payload = {
      tipo: tipoParceiro,
      nome: nomeParceiro,
      categoria: categoriaParceiro,
      responsavel_nome: respNome,
      responsavel_whatsapp: respWhats,
      responsavel_email: respEmail || null,
    };

    const { error } = editandoParceiroId
      ? await supabase.from('parceiros').update(payload).eq('id', editandoParceiroId)
      : await supabase
          .from('parceiros')
          .insert({ ...payload, organizacao_id: evento.organizacao_id });

    if (!error) {
      cancelarEdicaoParceiro();
      await Promise.all([
        carregarParceiros(evento.organizacao_id),
        carregarContratos(),
      ]);
    } else {
      alert('Erro ao salvar: ' + error.message);
    }
  }

  async function excluirParceiro(p: Parceiro) {
    if (!evento) return;
    if (!window.confirm(`Deseja realmente excluir "${p.nome}"?`)) return;

    const { error } = await supabase.from('parceiros').delete().eq('id', p.id);

    if (error) {
      alert(
        'Não foi possível excluir este fornecedor/artista. Verifique se existem contratos vinculados a ele.'
      );
      return;
    }

    if (editandoParceiroId === p.id) cancelarEdicaoParceiro();
    await carregarParceiros(evento.organizacao_id);
  }

  // --- CONTRATOS: CRIAR, EDITAR E EXCLUIR ---
  function iniciarEdicaoContrato(c: Contrato) {
    setEditandoContratoId(c.id);
    setParceiroContratoId(c.parceiro_id);
    setDescServico(c.descricao_servico);
    setValorContrato(formatarMoeda(Number(c.valor_total)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelarEdicaoContrato() {
    setEditandoContratoId(null);
    setDescServico('');
    setValorContrato('');
  }

  async function salvarContrato(e: React.FormEvent) {
    e.preventDefault();
    if (!evento || !parceiroContratoId) return;

    const payload = {
      parceiro_id: parceiroContratoId,
      descricao_servico: descServico,
      valor_total: moedaParaNumero(valorContrato),
    };

    const { error } = editandoContratoId
      ? await supabase.from('contratos').update(payload).eq('id', editandoContratoId)
      : await supabase.from('contratos').insert({
          ...payload,
          organizacao_id: evento.organizacao_id,
          evento_id: evento.id,
          status_assinatura: 'pendente',
        });

    if (!error) {
      cancelarEdicaoContrato();
      await carregarContratos();
    } else {
      alert('Erro ao salvar contrato: ' + error.message);
    }
  }

  async function excluirContrato(c: Contrato) {
    if (
      !window.confirm(
        `Deseja realmente excluir o contrato "${c.descricao_servico}" (${c.parceiros?.nome})? Os pagamentos vinculados a ele também podem ser removidos.`
      )
    ) {
      return;
    }

    const { error } = await supabase.from('contratos').delete().eq('id', c.id);

    if (error) {
      alert('Erro ao excluir contrato: ' + error.message);
      return;
    }

    if (editandoContratoId === c.id) cancelarEdicaoContrato();
    await carregarContratos();
  }

  async function alterarStatusAssinatura(contratoId: string, status: string) {
    await supabase
      .from('contratos')
      .update({
        status_assinatura: status,
        data_assinatura: status === 'assinado' ? new Date().toISOString().split('T')[0] : null,
      })
      .eq('id', contratoId);
    await carregarContratos();
  }

  // --- PAGAMENTOS: CRIAR, EDITAR E EXCLUIR ---
  function iniciarEdicaoPagamento(p: Pagamento) {
    setEditandoPagamentoId(p.id);
    setContratoPagId(p.contrato_id);
    setDescParcela(p.descricao_parcela);
    setValorPag(formatarMoeda(Number(p.valor)));
    setVencimentoPag(dataISOParaBR(p.data_vencimento));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelarEdicaoPagamento() {
    setEditandoPagamentoId(null);
    setDescParcela('');
    setValorPag('');
    setVencimentoPag('');
  }

  async function salvarPagamento(e: React.FormEvent) {
    e.preventDefault();
    if (!evento || !contratoPagId) return;

    const vencimentoISO = dataBRParaISO(vencimentoPag);
    if (!vencimentoISO) {
      alert('Digite uma data de vencimento válida no formato DD/MM/AAAA.');
      return;
    }

    const payload = {
      contrato_id: contratoPagId,
      descricao_parcela: descParcela,
      valor: moedaParaNumero(valorPag),
      data_vencimento: vencimentoISO,
    };

    const { error } = editandoPagamentoId
      ? await supabase.from('pagamentos').update(payload).eq('id', editandoPagamentoId)
      : await supabase.from('pagamentos').insert({
          ...payload,
          organizacao_id: evento.organizacao_id,
          status: 'pendente',
        });

    if (!error) {
      cancelarEdicaoPagamento();
      await carregarContratos();
    } else {
      alert('Erro ao salvar pagamento: ' + error.message);
    }
  }

  async function excluirPagamento(p: Pagamento) {
    if (
      !window.confirm(
        `Deseja realmente excluir o pagamento "${p.descricao_parcela}" (${formatarMoeda(Number(p.valor))})?`
      )
    ) {
      return;
    }

    const { error } = await supabase.from('pagamentos').delete().eq('id', p.id);

    if (error) {
      alert('Erro ao excluir pagamento: ' + error.message);
      return;
    }

    if (editandoPagamentoId === p.id) cancelarEdicaoPagamento();
    await carregarContratos();
  }

  async function alternarPagamento(pag: Pagamento) {
    const novoStatus = pag.status === 'pago' ? 'pendente' : 'pago';
    await supabase
      .from('pagamentos')
      .update({
        status: novoStatus,
        data_pagamento: novoStatus === 'pago' ? new Date().toISOString().split('T')[0] : null,
      })
      .eq('id', pag.id);
    await carregarContratos();
  }

  async function salvarReceitas(e: React.FormEvent) {
    e.preventDefault();
    if (!evento) return;
    setSalvandoFechamento(true);
    const { error } = await supabase.from('fechamentos_evento').upsert(
      {
        organizacao_id: evento.organizacao_id,
        evento_id: evento.id,
        receita_bilheteria: moedaParaNumero(bilheteria),
        receita_bar: moedaParaNumero(bar),
        outras_receitas: moedaParaNumero(outrasReceitas),
        atualizado_em: new Date().toISOString(),
      },
      { onConflict: 'evento_id' }
    );
    setSalvandoFechamento(false);
    if (error) {
      alert('Erro ao salvar receitas: ' + error.message);
    } else {
      setEditandoReceitas(false);
    }
  }

  async function adicionarTaxa(e: React.FormEvent) {
    e.preventDefault();
    if (!evento) return;

    const valorNumerico =
      tipoTaxa === 'valor_fixo'
        ? moedaParaNumero(valorTaxa)
        : Number(valorTaxa.replace(',', '.')) || 0;

    const { error } = await supabase.from('taxas_impostos_evento').insert({
      organizacao_id: evento.organizacao_id,
      evento_id: evento.id,
      nome: nomeTaxa,
      tipo_calculo: tipoTaxa,
      base_calculo: baseTaxa,
      valor_ou_percentual: valorNumerico,
    });
    if (!error) {
      setNomeTaxa('');
      setValorTaxa('');
      await carregarTaxas();
    } else {
      alert('Erro ao adicionar taxa: ' + error.message);
    }
  }

  async function removerTaxa(id: string) {
    await supabase.from('taxas_impostos_evento').delete().eq('id', id);
    await carregarTaxas();
  }

  if (carregando) {
    return <div className="p-10 text-center text-slate-500">Carregando evento...</div>;
  }

  if (!evento) {
    return (
      <div className="p-10 text-center">
        <p className="text-slate-600 mb-4">Evento não encontrado.</p>
        <a href="/" className="text-indigo-600 underline">Voltar ao painel</a>
      </div>
    );
  }

  const valBilheteria = moedaParaNumero(bilheteria);
  const valBar = moedaParaNumero(bar);
  const valOutras = moedaParaNumero(outrasReceitas);
  const faturamentoBruto = valBilheteria + valBar + valOutras;

  const totalTaxas = taxas.reduce((acc, t) => {
    if (t.tipo_calculo === 'valor_fixo') return acc + Number(t.valor_ou_percentual);
    const base =
      t.base_calculo === 'bilheteria'
        ? valBilheteria
        : t.base_calculo === 'bar'
        ? valBar
        : faturamentoBruto;
    return acc + base * (Number(t.valor_ou_percentual) / 100);
  }, 0);

  const custoContratos = contratos
    .filter((c) => c.status_assinatura !== 'cancelado')
    .reduce((acc, c) => acc + Number(c.valor_total), 0);

  const totalPago = pagamentos
    .filter((p) => p.status === 'pago')
    .reduce((acc, p) => acc + Number(p.valor), 0);

  const totalPendente = pagamentos
    .filter((p) => p.status !== 'pago')
    .reduce((acc, p) => acc + Number(p.valor), 0);

  const lucroPrejuizo = faturamentoBruto - totalTaxas - custoContratos;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <header className="bg-white border-b border-slate-200 print:border-none">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 mb-2 print:hidden"
            >
              <ArrowLeft size={14} /> Voltar aos Eventos
            </a>
            <h1 className="text-2xl font-bold text-slate-900">{evento.nome}</h1>
            <div className="flex flex-wrap gap-4 text-xs text-slate-600 mt-1">
              <span className="flex items-center gap-1">
                <Calendar size={14} /> {dataISOParaBR(evento.data_evento)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={14} /> {evento.local_evento}
              </span>
              <span className="flex items-center gap-1">
                <Users size={14} /> {Number(evento.publico_estimado).toLocaleString('pt-BR')} pessoas
              </span>
              <span>
                Realização: <strong>{evento.empresas_realizadoras?.razao_social}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 print:hidden">
            <select
              value={evento.status}
              onChange={(e) => atualizarStatusEvento(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium bg-white"
            >
              <option value="planejamento">Planejamento</option>
              <option value="pre_producao">Pré-produção</option>
              <option value="em_andamento">Em andamento</option>
              <option value="realizado">Realizado</option>
              <option value="fechado">Fechado</option>
              <option value="cancelado">Cancelado</option>
            </select>

            <button
              onClick={() =>
                exportarFechamentoEventoPDF({
                  evento,
                  bilheteria: valBilheteria,
                  bar: valBar,
                  outrasReceitas: valOutras,
                  faturamentoBruto,
                  custoContratos,
                  totalTaxas,
                  lucroPrejuizo,
                  contratos,
                  pagamentos,
                  taxas,
                })
              }
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg"
            >
              <Printer size={16} /> PDF
            </button>

            <button
              onClick={() =>
                exportarFechamentoEventoExcel({
                  evento,
                  bilheteria: valBilheteria,
                  bar: valBar,
                  outrasReceitas: valOutras,
                  faturamentoBruto,
                  custoContratos,
                  totalTaxas,
                  lucroPrejuizo,
                  contratos,
                  pagamentos,
                  taxas,
                })
              }
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg"
            >
              <FileText size={16} /> Excel
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500">Faturamento Bruto</span>
            <p className="text-xl font-bold text-slate-900 mt-1">
              {formatarMoeda(faturamentoBruto)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500">Custos (Contratos)</span>
            <p className="text-xl font-bold text-slate-900 mt-1">
              {formatarMoeda(custoContratos)}
            </p>
            <span className="text-[11px] text-slate-500">
              Pago: {formatarMoeda(totalPago)} | Falta: {formatarMoeda(totalPendente)}
            </span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500">Taxas e Impostos</span>
            <p className="text-xl font-bold text-amber-700 mt-1">
              {formatarMoeda(totalTaxas)}
            </p>
          </div>
          <div
            className={`p-4 rounded-xl border ${
              lucroPrejuizo >= 0
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <span className="text-xs font-medium flex items-center gap-1">
              {lucroPrejuizo >= 0 ? (
                <>
                  <TrendingUp size={14} className="text-emerald-700" /> Lucro Líquido
                </>
              ) : (
                <>
                  <TrendingDown size={14} className="text-red-700" /> Prejuízo
                </>
              )}
            </span>
            <p
              className={`text-xl font-bold mt-1 ${
                lucroPrejuizo >= 0 ? 'text-emerald-800' : 'text-red-800'
              }`}
            >
              {formatarMoeda(lucroPrejuizo)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-3 print:hidden">
          {[
            { id: 'contratos', label: `Contratos (${contratos.length})`, icon: FileText },
            { id: 'pagamentos', label: `Pagamentos (${pagamentos.length})`, icon: DollarSign },
            { id: 'parceiros', label: `Fornecedores e Artistas (${parceiros.length})`, icon: UserCheck },
            { id: 'fechamento', label: 'Fechamento & Taxas', icon: TrendingUp },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setAba(item.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  aba === item.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Icon size={16} /> {item.label}
              </button>
            );
          })}
        </div>

        {/* ABA 1: CONTRATOS */}
        {aba === 'contratos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 h-fit print:hidden">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold flex items-center gap-2">
                  {editandoContratoId ? (
                    <>
                      <Pencil size={18} className="text-amber-600" /> Editar Contrato
                    </>
                  ) : (
                    <>
                      <Plus size={18} className="text-indigo-600" /> Novo Contrato
                    </>
                  )}
                </h2>
                {editandoContratoId && (
                  <button
                    type="button"
                    onClick={cancelarEdicaoContrato}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <X size={14} /> Cancelar
                  </button>
                )}
              </div>

              {parceiros.length === 0 ? (
                <p className="text-sm text-amber-800 bg-amber-50 p-3 rounded-lg">
                  Cadastre primeiro um Fornecedor ou Artista na aba{' '}
                  <button
                    onClick={() => setAba('parceiros')}
                    className="underline font-semibold"
                  >
                    Fornecedores e Artistas
                  </button>
                  .
                </p>
              ) : (
                <form onSubmit={salvarContrato} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Fornecedor / Artista
                    </label>
                    <select
                      required
                      value={parceiroContratoId}
                      onChange={(e) => setParceiroContratoId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      {parceiros.map((p) => (
                        <option key={p.id} value={p.id}>
                          [{p.tipo.toUpperCase()}] {p.nome} ({p.categoria})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Serviço / Cachê
                    </label>
                    <input
                      type="text"
                      required
                      value={descServico}
                      onChange={(e) => setDescServico(e.target.value)}
                      placeholder="Ex: Sonorização e Iluminação Palco Principal"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Valor Total (R$)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={valorContrato}
                      onChange={(e) => setValorContrato(mascaraMoeda(e.target.value))}
                      placeholder="R$ 0,00"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className={`w-full py-2.5 text-white text-sm font-medium rounded-lg transition ${
                      editandoContratoId
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {editandoContratoId ? 'Salvar Alterações' : 'Adicionar Contrato'}
                  </button>
                </form>
              )}
            </div>

            <div className="lg:col-span-2 space-y-3">
              {contratos.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-sm">
                  Nenhum contrato cadastrado neste evento.
                </div>
              ) : (
                contratos.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {c.parceiros?.tipo}
                        </span>
                        <h3 className="font-bold text-slate-900">{c.parceiros?.nome}</h3>
                      </div>
                      <p className="text-sm text-slate-600 mt-0.5">{c.descricao_servico}</p>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <Phone size={12} /> Resp: {c.parceiros?.responsavel_nome} (
                        {c.parceiros?.responsavel_whatsapp
                          ? mascaraTelefone(c.parceiros.responsavel_whatsapp)
                          : ''}
                        )
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-3 print:hidden">
                        <label className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md cursor-pointer transition">
                          <Upload size={13} />
                          {enviandoArquivoId === c.id
                            ? 'Enviando...'
                            : c.arquivo_contrato_path
                            ? 'Substituir PDF'
                            : 'Anexar PDF do Contrato'}
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            className="hidden"
                            disabled={enviandoArquivoId === c.id}
                            onChange={(e) =>
                              handleUploadArquivo(e.target.files?.[0], 'contrato', c.id)
                            }
                          />
                        </label>

                        {c.arquivo_contrato_path && (
                          <button
                            onClick={() => abrirArquivo(c.arquivo_contrato_path!)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium rounded-md transition"
                          >
                            <ExternalLink size={13} /> Ver Contrato
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 mr-1">
                          {formatarMoeda(Number(c.valor_total))}
                        </span>
                        <button
                          onClick={() => iniciarEdicaoContrato(c)}
                          title="Editar Contrato"
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition print:hidden"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => excluirContrato(c)}
                          title="Excluir Contrato"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition print:hidden"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <select
                        value={c.status_assinatura}
                        onChange={(e) => alterarStatusAssinatura(c.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                     c.status_assinatura === 'assinado'
  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
  : c.status_assinatura === 'enviado'
  ? 'bg-blue-50 text-blue-700 border-blue-300'
  : c.status_assinatura === 'sem_contrato'
  ? 'bg-slate-100 text-slate-700 border-slate-300'
  : c.status_assinatura === 'cancelado'
  ? 'bg-red-50 text-red-700 border-red-300'
  : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="pendente">Assinatura Pendente</option>
                        <option value="enviado">Enviado p/ Assinatura</option>
                        <option value="assinado">Contrato Assinado</option>
                        <option value="sem_contrato">Não tem contrato</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ABA 2: PAGAMENTOS */}
        {aba === 'pagamentos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 h-fit print:hidden">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold flex items-center gap-2">
                  {editandoPagamentoId ? (
                    <>
                      <Pencil size={18} className="text-amber-600" /> Editar Pagamento
                    </>
                  ) : (
                    <>
                      <Plus size={18} className="text-indigo-600" /> Lançar Pagamento
                    </>
                  )}
                </h2>
                {editandoPagamentoId && (
                  <button
                    type="button"
                    onClick={cancelarEdicaoPagamento}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <X size={14} /> Cancelar
                  </button>
                )}
              </div>

              {contratos.length === 0 ? (
                <p className="text-sm text-amber-800 bg-amber-50 p-3 rounded-lg">
                  Adicione primeiro um contrato na aba Contratos.
                </p>
              ) : (
                <form onSubmit={salvarPagamento} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Contrato
                    </label>
                    <select
                      required
                      value={contratoPagId}
                      onChange={(e) => setContratoPagId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      {contratos.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.parceiros?.nome} — {c.descricao_servico}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Descrição da Parcela
                    </label>
                    <input
                      type="text"
                      required
                      value={descParcela}
                      onChange={(e) => setDescParcela(e.target.value)}
                      placeholder="Ex: Sinal 50% ou Quitação"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Valor (R$)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        required
                        value={valorPag}
                        onChange={(e) => setValorPag(mascaraMoeda(e.target.value))}
                        placeholder="R$ 0,00"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Vencimento
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={10}
                        required
                        value={vencimentoPag}
                        onChange={(e) => setVencimentoPag(mascaraDataBR(e.target.value))}
                        placeholder="DD/MM/AAAA"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className={`w-full py-2.5 text-white text-sm font-medium rounded-lg transition ${
                      editandoPagamentoId
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {editandoPagamentoId ? 'Salvar Alterações' : 'Registrar Pagamento'}
                  </button>
                </form>
              )}
            </div>

            <div className="lg:col-span-2 space-y-3">
              {pagamentos.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-sm">
                  Nenhum pagamento lançado neste evento.
                </div>
              ) : (
                pagamentos.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {p.contratos?.parceiros?.nome} — {p.descricao_parcela}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Vencimento: {dataISOParaBR(p.data_vencimento)}
                        {p.data_pagamento && ` • Pago em: ${dataISOParaBR(p.data_pagamento)}`}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-2.5 print:hidden">
                        <label className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md cursor-pointer transition">
                          <Upload size={13} />
                          {enviandoArquivoId === p.id
                            ? 'Enviando...'
                            : p.comprovante_path
                            ? 'Trocar Comprovante'
                            : 'Anexar Comprovante'}
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            className="hidden"
                            disabled={enviandoArquivoId === p.id}
                            onChange={(e) =>
                              handleUploadArquivo(e.target.files?.[0], 'comprovante', p.id)
                            }
                          />
                        </label>

                        {p.comprovante_path && (
                          <button
                            onClick={() => abrirArquivo(p.comprovante_path!)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium rounded-md transition"
                          >
                            <ExternalLink size={13} /> Ver Comprovante
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold mr-1">{formatarMoeda(Number(p.valor))}</span>
                      <button
                        onClick={() => iniciarEdicaoPagamento(p)}
                        title="Editar Pagamento"
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition print:hidden"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => excluirPagamento(p)}
                        title="Excluir Pagamento"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition print:hidden"
                      >
                        <Trash2 size={15} />
                      </button>
                      <button
                        onClick={() => alternarPagamento(p)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          p.status === 'pago'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        {p.status === 'pago' ? (
                          <>
                            <CheckCircle2 size={14} /> Pago
                          </>
                        ) : (
                          <>
                            <Clock size={14} /> Marcar Pago
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ABA 3: FORNECEDORES E ARTISTAS */}
        {aba === 'parceiros' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 h-fit print:hidden">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold flex items-center gap-2">
                  {editandoParceiroId ? (
                    <>
                      <Pencil size={18} className="text-amber-600" /> Editar Contato
                    </>
                  ) : (
                    <>
                      <Plus size={18} className="text-indigo-600" /> Novo Fornecedor / Artista
                    </>
                  )}
                </h2>
                {editandoParceiroId && (
                  <button
                    type="button"
                    onClick={cancelarEdicaoParceiro}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <X size={14} /> Cancelar
                  </button>
                )}
              </div>

              <form onSubmit={salvarParceiro} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTipoParceiro('fornecedor')}
                    className={`py-2 text-xs font-semibold rounded-lg border ${
                      tipoParceiro === 'fornecedor'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Fornecedor
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoParceiro('artista')}
                    className={`py-2 text-xs font-semibold rounded-lg border ${
                      tipoParceiro === 'artista'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Artista / Banda
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={nomeParceiro}
                  onChange={(e) => setNomeParceiro(e.target.value)}
                  placeholder="Nome da Empresa ou Artista"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
                <input
                  type="text"
                  required
                  value={categoriaParceiro}
                  onChange={(e) => setCategoriaParceiro(e.target.value)}
                  placeholder="Categoria (Ex: Som, Segurança, Pagode, DJ)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
                <input
                  type="text"
                  required
                  value={respNome}
                  onChange={(e) => setRespNome(e.target.value)}
                  placeholder="Nome do Responsável / Empresário"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={15}
                  required
                  value={respWhats}
                  onChange={(e) => setRespWhats(mascaraTelefone(e.target.value))}
                  placeholder="WhatsApp: (31) 99999-9999"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
                <input
                  type="email"
                  value={respEmail}
                  onChange={(e) => setRespEmail(e.target.value)}
                  placeholder="E-mail (opcional)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
                <button
                  type="submit"
                  className={`w-full py-2.5 text-white text-sm font-medium rounded-lg ${
                    editandoParceiroId
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {editandoParceiroId ? 'Salvar Alterações' : 'Salvar Contato'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-3">
              {parceiros.map((p) => (
                <div
                  key={p.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        {p.tipo}
                      </span>
                      <h3 className="font-bold">{p.nome}</h3>
                      <span className="text-xs text-slate-500">• {p.categoria}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Responsável: <strong>{p.responsavel_nome}</strong> —{' '}
                      {mascaraTelefone(p.responsavel_whatsapp)}{' '}
                      {p.responsavel_email && `• ${p.responsavel_email}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 print:hidden">
                    <button
                      onClick={() => iniciarEdicaoParceiro(p)}
                      title="Editar Contato"
                      className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => excluirParceiro(p)}
                      title="Excluir Contato"
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 4: FECHAMENTO FINANCEIRO & TAXAS */}
        {aba === 'fechamento' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">Receitas do Evento</h2>
                {!editandoReceitas && (
                  <button
                    type="button"
                    onClick={() => setEditandoReceitas(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold rounded-lg transition print:hidden"
                  >
                    <Pencil size={14} /> Editar Valores
                  </button>
                )}
              </div>

              <form onSubmit={salvarReceitas} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Valor de Bilheteria (R$)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    disabled={!editandoReceitas}
                    value={bilheteria}
                    onChange={(e) => setBilheteria(mascaraMoeda(e.target.value))}
                    placeholder="R$ 0,00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Faturamento de Vendas do Bar (R$)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    disabled={!editandoReceitas}
                    value={bar}
                    onChange={(e) => setBar(mascaraMoeda(e.target.value))}
                    placeholder="R$ 0,00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Outras Receitas (Patrocínio, Estacionamento, etc.)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    disabled={!editandoReceitas}
                    value={outrasReceitas}
                    onChange={(e) => setOutrasReceitas(mascaraMoeda(e.target.value))}
                    placeholder="R$ 0,00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed"
                  />
                </div>

                {editandoReceitas && (
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={salvandoFechamento}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition"
                    >
                      {salvandoFechamento ? 'Salvando...' : 'Salvar Valores de Fechamento'}
                    </button>
                    <button
                      type="button"
                      onClick={() => carregarFechamento()}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </form>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h2 className="font-bold text-lg mb-4">Taxas e Impostos</h2>
              <form onSubmit={adicionarTaxa} className="space-y-3 mb-5 print:hidden">
                <input
                  type="text"
                  required
                  value={nomeTaxa}
                  onChange={(e) => setNomeTaxa(e.target.value)}
                  placeholder="Nome (Ex: ISS, ECAD, Taxa Bilheteria, Maquininha)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={tipoTaxa}
                    onChange={(e) => {
                      setTipoTaxa(e.target.value as any);
                      setValorTaxa('');
                    }}
                    className="px-2 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="percentual">Percentual (%)</option>
                    <option value="valor_fixo">Valor Fixo (R$)</option>
                  </select>
                  <select
                    value={baseTaxa}
                    onChange={(e) => setBaseTaxa(e.target.value as any)}
                    className="px-2 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="faturamento_total">S/ Total</option>
                    <option value="bilheteria">S/ Bilheteria</option>
                    <option value="bar">S/ Bar</option>
                  </select>
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    value={valorTaxa}
                    onChange={(e) =>
                      setValorTaxa(
                        tipoTaxa === 'valor_fixo'
                          ? mascaraMoeda(e.target.value)
                          : e.target.value.replace(/[^0-9.,]/g, '')
                      )
                    }
                    placeholder={tipoTaxa === 'valor_fixo' ? 'R$ 0,00' : 'Ex: 5,5'}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg"
                >
                  + Adicionar Taxa / Imposto
                </button>
              </form>

              <div className="space-y-2">
                {taxas.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-sm"
                  >
                    <div>
                      <span className="font-medium">{t.nome}</span>
                      <span className="text-xs text-slate-500 block">
                        {t.tipo_calculo === 'percentual'
                          ? `${String(t.valor_ou_percentual).replace('.', ',')}% sobre ${t.base_calculo.replace('_', ' ')}`
                          : `Valor fixo: ${formatarMoeda(Number(t.valor_ou_percentual))}`}
                      </span>
                    </div>
                    <button
                      onClick={() => removerTaxa(t.id)}
                      className="text-slate-400 hover:text-red-600 print:hidden"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
export default function PaginaEvento({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-slate-500">Carregando evento...</div>
      }
    >
      <ConteudoEvento params={params} />
    </Suspense>
  );
}