// @ts-nocheck
'use client';

import React, { Suspense, useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Wallet,
  Wine,
  Users,
  Gift,
  CheckSquare,
  Plus,
  Trash2,
  Download,
  Printer,
  AlertTriangle,
  CheckCircle2,
  Search,
  Calendar,
  MapPin,
  RotateCcw,
  Menu,
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShieldCheck,
  Utensils,
  Music,
  Building2,
  Percent,
  FileSpreadsheet,
  Info,
  Copy,
  ArrowLeft,
  Pencil,
} from 'lucide-react';

const STORAGE_KEY = 'fechaevento_pro_v1_data';

const formatBRL = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

const round2 = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const normalizeText = (str) =>
  (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const createInitialAkatuEvent = () => ({
  id: 'akatu-2026-11-20',
  name: 'Akatu Villa — 20/11/2026',
  date: '2026-11-20',
  venue: 'Akatu Villa',
  status: 'Em Conferência',
  publicCount: 493,
  dreInputs: {
    centralEventos: 0.0,
    taxaSistema: 1302.76,
    estorno: 0.0,
    valorRecebidoAkatu: 13246.95,
  },
  cashiers: [
    { id: 'c1', name: 'Amanda - Portaria', debito: 320.0, credito: 40.0, pix: 85.0, dinheiro: 90.0, sistema: 535.0 },
    { id: 'c2', name: 'Liliane - Portaria', debito: 550.0, credito: 315.0, pix: 230.0, dinheiro: 335.0, sistema: 1430.0 },
    { id: 'c3', name: 'Gaby', debito: 2227.3, credito: 1936.7, pix: 1099.9, dinheiro: 228.0, sistema: 5491.9 },
    { id: 'c4', name: 'Luis', debito: 2771.4, credito: 926.9, pix: 441.8, dinheiro: 28.0, sistema: 4168.1 },
    { id: 'c5', name: 'Debora', debito: 2185.8, credito: 1223.0, pix: 1241.2, dinheiro: 417.0, sistema: 5067.0 },
    { id: 'c6', name: 'Anna Luiza', debito: 1847.8, credito: 1904.1, pix: 515.7, dinheiro: 114.0, sistema: 4381.6 },
    { id: 'c7', name: 'Iolanda', debito: 1846.64, credito: 1239.33, pix: 939.43, dinheiro: 127.0, sistema: 4152.4 },
    { id: 'c8', name: 'Ana Carolina', debito: 2309.3, credito: 1733.6, pix: 1032.8, dinheiro: 60.0, sistema: 5135.7 },
    { id: 'c9', name: 'Milena', debito: 2065.13, credito: 981.7, pix: 1898.17, dinheiro: 485.0, sistema: 5430.0 },
    { id: 'c10', name: 'Fixo', debito: 232.6, credito: 82.0, pix: 0.0, dinheiro: 0.0, sistema: 314.6 },
    { id: 'c11', name: 'Produção', debito: 424.0, credito: 60.0, pix: 0.0, dinheiro: 0.0, sistema: 484.0 },
  ],
  beverages: [
    { id: 'b1', name: 'Água', qty: 82, unitPrice: 0.99 },
    { id: 'b2', name: 'Água com Gás', qty: 41, unitPrice: 1.65 },
    { id: 'b3', name: 'Água Tônica', qty: 3, unitPrice: 3.19 },
    { id: 'b4', name: 'Água de coco', qty: 8, unitPrice: 3.69 },
    { id: 'b5', name: 'Gelo de Coco', qty: 3, unitPrice: 2.0 },
    { id: 'b6', name: 'Refrigerante', qty: 43, unitPrice: 3.69 },
    { id: 'b7', name: 'Suco', qty: 15, unitPrice: 3.89 },
    { id: 'b8', name: 'Red Bull', qty: 50, unitPrice: 7.5 },
    { id: 'b9', name: 'St.Pierre', qty: 0, unitPrice: 4.09 },
    { id: 'b10', name: 'Heineken', qty: 191, unitPrice: 6.19 },
    { id: 'b11', name: 'Heineken Zero', qty: 11, unitPrice: 6.19 },
    { id: 'b12', name: 'Petra', qty: 23, unitPrice: 4.17 },
    { id: 'b13', name: 'Xeque mate', qty: 18, unitPrice: 6.99 },
    { id: 'b14', name: 'Balde Heineken', qty: 88, unitPrice: 61.9 },
    { id: 'b15', name: 'Balde Heineken Zero', qty: 3, unitPrice: 61.9 },
    { id: 'b16', name: 'Balde Petra', qty: 9, unitPrice: 41.7 },
    { id: 'b17', name: 'Balde Xeque mate', qty: 3, unitPrice: 33.45 },
    { id: 'b18', name: 'Combo Red Bull 3 unid', qty: 19, unitPrice: 22.5 },
    { id: 'b19', name: 'Smirnoff 1L', qty: 0, unitPrice: 37.0 },
    { id: 'b20', name: 'Absolut', qty: 0, unitPrice: 89.0 },
    { id: 'b21', name: 'Red Label', qty: 1, unitPrice: 89.9 },
    { id: 'b22', name: 'Black Label', qty: 2, unitPrice: 179.99 },
    { id: 'b23', name: 'Gold Label', qty: 0, unitPrice: 289.0 },
    { id: 'b24', name: 'Ciroc+Red Bull', qty: 2, unitPrice: 210.0 },
    { id: 'b25', name: 'Tanqueray', qty: 7, unitPrice: 99.9 },
    { id: 'b26', name: 'Total Red Bull combos', qty: 48, unitPrice: 7.5 },
    { id: 'b27', name: 'Total Gelo de Coco combos', qty: 14, unitPrice: 2.0 },
    { id: 'b28', name: 'Drink Gin Tropical', qty: 34, unitPrice: 18.45 },
    { id: 'b29', name: 'Drink Gin Tonica', qty: 1, unitPrice: 18.45 },
    { id: 'b30', name: 'Drink Melancita', qty: 10, unitPrice: 18.45 },
    { id: 'b31', name: 'Drink Caipirinha', qty: 50, unitPrice: 13.45 },
    { id: 'b32', name: 'Drink Caipivodka', qty: 11, unitPrice: 15.45 },
    { id: 'b33', name: 'Drink Caipmaracuja', qty: 14, unitPrice: 19.95 },
    { id: 'b34', name: 'Dose Campari', qty: 3, unitPrice: 12.5 },
    { id: 'b35', name: 'Chop 300ml', qty: 12, unitPrice: 3.75 },
    { id: 'b36', name: 'Chop 500ml', qty: 9, unitPrice: 6.25 },
    { id: 'b37', name: 'Chopp 300ml Rodada Dupla', qty: 101, unitPrice: 7.5 },
  ],
  foods: [
    { id: 'f1', name: 'Porção de Fritas', qty: 5, unitPrice: 15.0 },
    { id: 'f2', name: 'Porção de Fritas com Cheddar e Bacon', qty: 19, unitPrice: 17.5 },
    { id: 'f3', name: 'Frango Passarinho com Fritas', qty: 0, unitPrice: 29.5 },
    { id: 'f4', name: 'Picanha com Fritas', qty: 0, unitPrice: 64.95 },
    { id: 'f5', name: 'Filé de Frango com Fritas', qty: 4, unitPrice: 29.5 },
    { id: 'f6', name: 'Filé com Fritas', qty: 5, unitPrice: 44.95 },
    { id: 'f7', name: 'Filé de Tilápia com Fritas', qty: 4, unitPrice: 44.95 },
    { id: 'f8', name: 'Lombo com Fritas', qty: 1, unitPrice: 34.95 },
    { id: 'f9', name: 'Torresmo de Barriga', qty: 0, unitPrice: 29.95 },
    { id: 'f10', name: 'Bolinho de Costela', qty: 4, unitPrice: 20.0 },
  ],
  staff: [
    { id: 's1', name: 'Atendente Balcão', qty: 3, unitPrice: 150.0 },
    { id: 's2', name: 'Coordenação Bar - Diego', qty: 1, unitPrice: 150.0 },
    { id: 's3', name: 'Montagem Bar', qty: 1, unitPrice: 300.0 },
    { id: 's4', name: 'Drink Sergio', qty: 1, unitPrice: 150.0 },
    { id: 's5', name: 'Drink Jean', qty: 1, unitPrice: 150.0 },
    { id: 's6', name: 'Cozinha', qty: 2, unitPrice: 150.0 },
    { id: 's7', name: 'Caixa volante', qty: 7, unitPrice: 130.0 },
    { id: 's8', name: 'Caixa fixo', qty: 1, unitPrice: 150.0 },
    { id: 's9', name: 'Comissão de caixa', qty: 1, unitPrice: 320.0 },
    { id: 's10', name: 'Financeiro', qty: 1, unitPrice: 350.0 },
    { id: 's11', name: 'Limpeza Evento - Ariane e Luis', qty: 2, unitPrice: 150.0 },
    { id: 's12', name: 'Limpeza Evento - Vanice e Fabiano', qty: 2, unitPrice: 180.0 },
    { id: 's13', name: 'Limpeza Pós evento - Vanice', qty: 1, unitPrice: 150.0 },
    { id: 's14', name: 'P2', qty: 1, unitPrice: 300.0 },
    { id: 's15', name: 'Seguranças', qty: 7, unitPrice: 170.0 },
    { id: 's16', name: 'Bombeiro Civil', qty: 1, unitPrice: 170.0 },
    { id: 's17', name: 'Portaria', qty: 2, unitPrice: 150.0 },
    { id: 's18', name: 'Hoster - Kathellen', qty: 1, unitPrice: 150.0 },
  ],
  generalCosts: [
    { id: 'g1', name: 'Aluguel Máquinas/Sistema', qty: 1, unitPrice: 150.0 },
    { id: 'g2', name: 'Lanche Funcionários', qty: 1, unitPrice: 400.0 },
    { id: 'g3', name: 'Caixa Térmica', qty: 1, unitPrice: 100.0 },
    { id: 'g4', name: 'Gelo Cubo', qty: 26, unitPrice: 5.0 },
    { id: 'g5', name: 'Gelo Escama', qty: 25, unitPrice: 11.0 },
    { id: 'g6', name: 'Aluguel Espaço', qty: 1, unitPrice: 6000.0 },
    { id: 'g7', name: 'Tráfego Pago', qty: 1, unitPrice: 650.0 },
    { id: 'g8', name: 'Designer Flyer', qty: 0, unitPrice: 150.0 },
    { id: 'g9', name: 'Balão', qty: 7, unitPrice: 25.0 },
    { id: 'g10', name: 'Caçamba/Carroça', qty: 1, unitPrice: 150.0 },
  ],
  attractions: [
    { id: 'a1', name: 'DJ', qty: 1, unitPrice: 350.0 },
    { id: 'a2', name: 'Som', qty: 1, unitPrice: 1500.0 },
  ],
  promoters: [
    { id: 'p1', name: 'Promoter Mazeo', percent: 1.0 },
    { id: 'p2', name: 'Promoter Renatinho', percent: 0.5 },
    { id: 'p3', name: 'Promoter Bruno', percent: 0.5 },
    { id: 'p4', name: 'Promoter Marcelo', percent: 0.5 },
    { id: 'p5', name: 'Promoter Wesley', percent: 0.5 },
  ],
  production: [
    { id: 'pr1', beneficiary: 'DJ', item: 'Red Bull', qty: 2, unitPrice: 7.5 },
    { id: 'pr2', beneficiary: 'DJ', item: 'Água', qty: 1, unitPrice: 1.65 },
    { id: 'pr3', beneficiary: 'DJ', item: 'Água com gás', qty: 2, unitPrice: 0.99 },
    { id: 'pr4', beneficiary: 'Serginho Peixe', item: 'Água', qty: 11, unitPrice: 0.99 },
    { id: 'pr5', beneficiary: 'Serginho Peixe', item: 'Refrigerante', qty: 7, unitPrice: 3.69 },
    { id: 'pr6', beneficiary: 'Serginho Peixe', item: 'Heineken', qty: 5, unitPrice: 6.19 },
    { id: 'pr7', beneficiary: 'Mazeo', item: 'Refrigerante', qty: 1, unitPrice: 3.69 },
    { id: 'pr8', beneficiary: 'Mazeo', item: 'Água', qty: 1, unitPrice: 0.99 },
    { id: 'pr9', beneficiary: 'Promoter (Renatinho)', item: 'Combo Black Label', qty: 1, unitPrice: 209.99 },
    { id: 'pr10', beneficiary: 'Promoter (Renatinho)', item: 'Água com gás', qty: 2, unitPrice: 1.65 },
    { id: 'pr11', beneficiary: 'Promoter (Renatinho)', item: 'Água de Coco', qty: 5, unitPrice: 3.89 },
    { id: 'pr12', beneficiary: 'Aniversariantes/Divulgadores', item: 'Caipirinha - Aniversariantes', qty: 8, unitPrice: 13.45 },
    { id: 'pr13', beneficiary: 'Aniversariantes/Divulgadores', item: 'Drink Divulgador - Caipirinha', qty: 1, unitPrice: 13.45 },
  ],
  halfPriceConsumption: [
    { id: 'h1', person: 'Marcelo', item: 'Combinho Red Bull', paymentMethod: 'Débito', qty: 1, unitPrice: 27.5, authorizedBy: 'Produção' },
    { id: 'h2', person: 'Wesley', item: 'Refrigerante', paymentMethod: 'Débito', qty: 2, unitPrice: 4.0, authorizedBy: 'Produção' },
    { id: 'h3', person: 'Wesley', item: 'Água', paymentMethod: 'Débito', qty: 2, unitPrice: 2.5, authorizedBy: 'Produção' },
    { id: 'h4', person: 'Bruno', item: 'Combo Ciroc', paymentMethod: 'Débito', qty: 1, unitPrice: 255.0, authorizedBy: 'Produção' },
    { id: 'h5', person: 'Bruno', item: 'Água com Gás', paymentMethod: 'Débito', qty: 2, unitPrice: 3.0, authorizedBy: 'Produção' },
    { id: 'h6', person: 'Bruno', item: 'Água de Coco', paymentMethod: 'Débito', qty: 5, unitPrice: 5.0, authorizedBy: 'Produção' },
    { id: 'h7', person: 'Pacheco', item: 'Red Bull', paymentMethod: 'Débito', qty: 1, unitPrice: 27.5, authorizedBy: 'Produção' },
  ],
  checklist: [
    { id: 'chk1', label: 'Conferência de caixas zerada (Débito + Crédito + Pix + Dinheiro = Sistema)', done: true },
    { id: 'chk2', label: 'Relatório do PDV conferido com consumo de Bebidas e Alimentação', done: true },
    { id: 'chk3', label: 'Lista de freelancers, diárias e comissões de caixa validadas', done: false },
    { id: 'chk4', label: 'Consumo de produção, artistas e aniversariantes conferido (preços vs catálogo)', done: false },
    { id: 'chk5', label: 'Autorizações de consumo 50% validadas pela Produção', done: true },
    { id: 'chk6', label: 'DRE revisado e repasse financeiro aprovado com o sócio/casa', done: false },
  ],
});

function computeEventMetrics(event) {
  let totalDebito = 0;
  let totalCredito = 0;
  let totalPix = 0;
  let totalDinheiro = 0;
  let totalConferido = 0;
  let totalSistema = 0;
  const cashierDivergences = [];

  event.cashiers.forEach((c) => {
    const conf = round2((Number(c.debito) || 0) + (Number(c.credito) || 0) + (Number(c.pix) || 0) + (Number(c.dinheiro) || 0));
    const sist = round2(Number(c.sistema) || 0);
    const diff = round2(conf - sist);
    totalDebito = round2(totalDebito + (Number(c.debito) || 0));
    totalCredito = round2(totalCredito + (Number(c.credito) || 0));
    totalPix = round2(totalPix + (Number(c.pix) || 0));
    totalDinheiro = round2(totalDinheiro + (Number(c.dinheiro) || 0));
    totalConferido = round2(totalConferido + conf);
    totalSistema = round2(totalSistema + sist);
    if (Math.abs(diff) >= 0.01) {
      cashierDivergences.push({ name: c.name, diff });
    }
  });
  const totalCashierDiff = round2(totalConferido - totalSistema);

  const totalBebidas = round2(
    event.beverages.reduce((acc, item) => acc + round2((Number(item.qty) || 0) * (Number(item.unitPrice) || 0)), 0)
  );
  const totalAlimentacao = round2(
    event.foods.reduce((acc, item) => acc + round2((Number(item.qty) || 0) * (Number(item.unitPrice) || 0)), 0)
  );
  const totalStaff = round2(
    event.staff.reduce((acc, item) => acc + round2((Number(item.qty) || 0) * (Number(item.unitPrice) || 0)), 0)
  );
  const totalGeneralCosts = round2(
    event.generalCosts.reduce((acc, item) => acc + round2((Number(item.qty) || 0) * (Number(item.unitPrice) || 0)), 0)
  );
  const totalAttractions = round2(
    event.attractions.reduce((acc, item) => acc + round2((Number(item.qty) || 0) * (Number(item.unitPrice) || 0)), 0)
  );
  const custoOperacional = round2(totalStaff + totalGeneralCosts + totalAttractions);

  const totalProducao = round2(
    event.production.reduce((acc, item) => acc + round2((Number(item.qty) || 0) * (Number(item.unitPrice) || 0)), 0)
  );
  const totalConsumo50 = round2(
    event.halfPriceConsumption.reduce((acc, item) => acc + round2((Number(item.qty) || 0) * (Number(item.unitPrice) || 0)), 0)
  );

  const estorno = round2(Number(event.dreInputs.estorno) || 0);
  const centralEventos = round2(Number(event.dreInputs.centralEventos) || 0);
  const taxaSistema = round2(Number(event.dreInputs.taxaSistema) || 0);
  const valorRecebidoAkatu = round2(Number(event.dreInputs.valorRecebidoAkatu) || 0);

  const faturamento = round2(totalSistema - estorno);
  const baseComissao = round2(faturamento + centralEventos);

  const totalPromoters = round2(
    event.promoters.reduce((acc, p) => acc + baseComissao * ((Number(p.percent) || 0) / 100), 0)
  );

  const custoTotal = round2(custoOperacional + totalBebidas + totalAlimentacao + taxaSistema + totalProducao);
  const repasseAkatu = round2(faturamento - custoTotal);
  const lucroEvento = round2(repasseAkatu - totalPromoters + centralEventos);
  const valorAReceberDevolver = round2(repasseAkatu - valorRecebidoAkatu);

  const publicCount = Number(event.publicCount) || 0;
  const ticketMedio = publicCount > 0 ? round2(faturamento / publicCount) : 0;

  const catalogPriceMap = new Map();
  [...event.beverages, ...event.foods].forEach((p) => {
    catalogPriceMap.set(normalizeText(p.name), { name: p.name, price: Number(p.unitPrice) || 0 });
  });

  const priceMismatches = [];
  event.production.forEach((pr) => {
    const key = normalizeText(pr.item);
    if (catalogPriceMap.has(key)) {
      const cat = catalogPriceMap.get(key);
      if (Math.abs(cat.price - (Number(pr.unitPrice) || 0)) >= 0.01) {
        priceMismatches.push({
          id: pr.id,
          beneficiary: pr.beneficiary,
          item: pr.item,
          prodPrice: Number(pr.unitPrice) || 0,
          catalogPrice: cat.price,
        });
      }
    }
  });

  const checklistDone = event.checklist.filter((c) => c.done).length;
  const checklistTotal = event.checklist.length;
  const checklistPct = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0;

  return {
    totalDebito,
    totalCredito,
    totalPix,
    totalDinheiro,
    totalConferido,
    totalSistema,
    totalCashierDiff,
    cashierDivergences,
    totalBebidas,
    totalAlimentacao,
    totalStaff,
    totalGeneralCosts,
    totalAttractions,
    custoOperacional,
    totalProducao,
    totalConsumo50,
    estorno,
    centralEventos,
    taxaSistema,
    valorRecebidoAkatu,
    faturamento,
    baseComissao,
    totalPromoters,
    custoTotal,
    repasseAkatu,
    lucroEvento,
    valorAReceberDevolver,
    publicCount,
    ticketMedio,
    priceMismatches,
    checklistDone,
    checklistTotal,
    checklistPct,
  };
}

function ConteudoEventosSemanais() {
  const [events, setEvents] = useState([createInitialAkatuEvent()]);
  const [hydrated, setHydrated] = useState(false);

  const [activeEventId, setActiveEventId] = useState('akatu-2026-11-20');
  const [activeTab, setActiveTab] = useState('dre');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [newEventModalOpen, setNewEventModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [editEventModalOpen, setEditEventModalOpen] = useState(false);
  const [deleteEventModalOpen, setDeleteEventModalOpen] = useState(false);
  const [editEventForm, setEditEventForm] = useState({ name: '', date: '', venue: '' });
  const [toast, setToast] = useState(null);

  const [newEventForm, setNewEventForm] = useState({
    name: '',
    date: '',
    venue: 'Akatu Villa',
    cloneStructure: true,
  });

  const [catalogSubTab, setCatalogSubTab] = useState('beverages');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [onlyConsumed, setOnlyConsumed] = useState(false);
  const [prodSubTab, setProdSubTab] = useState('production');

  useEffect(() => {
    setNewEventForm((f) => ({ ...f, date: new Date().toISOString().slice(0, 10) }));
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setEvents(parsed);
          setActiveEventId(parsed[0]?.id || '');
        }
      }
    } catch (e) {
      console.error('Erro ao ler localStorage:', e);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      console.error('Erro ao salvar localStorage:', e);
    }
  }, [events, hydrated]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const activeEvent = useMemo(
    () => events.find((e) => e.id === activeEventId) || events[0] || null,
    [events, activeEventId]
  );

  const metrics = useMemo(
    () => (activeEvent ? computeEventMetrics(activeEvent) : null),
    [activeEvent]
  );

  const updateActiveEvent = (updater) => {
    if (!activeEvent) return;
    setEvents((prev) =>
      prev.map((ev) => (ev.id === activeEvent.id ? (typeof updater === 'function' ? updater(ev) : updater) : ev))
    );
  };

  const handleCreateWeeklyEvent = (e) => {
    e.preventDefault();
    if (!newEventForm.name.trim()) {
      showToast('Informe o nome da edição semanal.', 'error');
      return;
    }

    const base = activeEvent;
    const newId = uid();

    const createdEvent = newEventForm.cloneStructure && base
      ? {
          id: newId,
          name: newEventForm.name.trim(),
          date: newEventForm.date || new Date().toISOString().slice(0, 10),
          venue: newEventForm.venue.trim() || base.venue,
          status: 'Em Conferência',
          publicCount: 0,
          dreInputs: { centralEventos: 0, taxaSistema: 0, estorno: 0, valorRecebidoAkatu: 0 },
          cashiers: base.cashiers.map((c) => ({ ...c, id: uid(), debito: 0, credito: 0, pix: 0, dinheiro: 0, sistema: 0 })),
          beverages: base.beverages.map((b) => ({ ...b, id: uid(), qty: 0 })),
          foods: base.foods.map((f) => ({ ...f, id: uid(), qty: 0 })),
          staff: base.staff.map((s) => ({ ...s, id: uid(), qty: 0 })),
          generalCosts: base.generalCosts.map((g) => ({ ...g, id: uid(), qty: 0 })),
          attractions: base.attractions.map((a) => ({ ...a, id: uid(), qty: 0 })),
          promoters: base.promoters.map((p) => ({ ...p, id: uid() })),
          production: [],
          halfPriceConsumption: [],
          checklist: base.checklist.map((chk) => ({ ...chk, id: uid(), done: false })),
        }
      : {
          id: newId,
          name: newEventForm.name.trim(),
          date: newEventForm.date || new Date().toISOString().slice(0, 10),
          venue: newEventForm.venue.trim() || 'Local do Evento',
          status: 'Em Conferência',
          publicCount: 0,
          dreInputs: { centralEventos: 0, taxaSistema: 0, estorno: 0, valorRecebidoAkatu: 0 },
          cashiers: [{ id: uid(), name: 'Caixa Principal', debito: 0, credito: 0, pix: 0, dinheiro: 0, sistema: 0 }],
          beverages: [],
          foods: [],
          staff: [],
          generalCosts: [],
          attractions: [],
          promoters: [],
          production: [],
          halfPriceConsumption: [],
          checklist: createInitialAkatuEvent().checklist.map((chk) => ({ ...chk, id: uid(), done: false })),
        };

    setEvents((prev) => [createdEvent, ...prev]);
    setActiveEventId(newId);
    setNewEventModalOpen(false);
    setNewEventForm({
      name: '',
      date: new Date().toISOString().slice(0, 10),
      venue: base?.venue || 'Local do Evento',
      cloneStructure: true,
    });
    setActiveTab('dre');
    showToast(
      newEventForm.cloneStructure && base
        ? `Edição "${createdEvent.name}" criada com catálogo e equipe clonados!`
        : `Edição "${createdEvent.name}" criada em branco.`
    );
  };

  const handleResetDemo = () => {
    const fresh = createInitialAkatuEvent();
    setEvents([fresh]);
    setActiveEventId(fresh.id);
    setResetModalOpen(false);
    showToast('Dados restaurados para o fechamento oficial Akatu Villa (20/11/2026).');
  };

  const openEditEventModal = () => {
    if (!activeEvent) return;
    setEditEventForm({
      name: activeEvent.name,
      date: activeEvent.date,
      venue: activeEvent.venue,
    });
    setEditEventModalOpen(true);
  };

  const handleSaveEditEvent = (e) => {
    e.preventDefault();
    if (!editEventForm.name.trim()) {
      showToast('Informe o nome do fechamento.', 'error');
      return;
    }
    updateActiveEvent((ev) => ({
      ...ev,
      name: editEventForm.name.trim(),
      date: editEventForm.date || ev.date,
      venue: editEventForm.venue.trim() || ev.venue,
    }));
    setEditEventModalOpen(false);
    showToast('Dados do fechamento atualizados com sucesso!');
  };

  const handleDeleteActiveEvent = () => {
    if (!activeEvent) return;
    const nomeExcluido = activeEvent.name;
    const remaining = events.filter((ev) => ev.id !== activeEvent.id);
    setEvents(remaining);
    setActiveEventId(remaining[0]?.id || '');
    setDeleteEventModalOpen(false);
    showToast(`Fechamento "${nomeExcluido}" excluído.`);
  };

  const handleFixPriceMismatches = () => {
    if (!metrics) return;
    const mismatchMap = new Map(metrics.priceMismatches.map((m) => [m.id, m.catalogPrice]));
    updateActiveEvent((ev) => ({
      ...ev,
      production: ev.production.map((item) =>
        mismatchMap.has(item.id) ? { ...item, unitPrice: mismatchMap.get(item.id) } : item
      ),
    }));
    showToast('Preços unitários da aba Produção sincronizados com o Catálogo oficial!');
  };

  const handleExportCSV = () => {
    if (!activeEvent || !metrics) return;
    const rows = [
      ['FECHAEVENTO PRO - RELATORIO DE FECHAMENTO SEMANAL'],
      ['Evento', activeEvent.name, 'Data', activeEvent.date, 'Local', activeEvent.venue, 'Status', activeEvent.status],
      [],
      ['=== RESUMO DRE ===', 'VALOR (R$)'],
      ['Faturamento Total (Sistema - Estorno)', metrics.faturamento.toFixed(2).replace('.', ',')],
      ['Central Eventos', metrics.centralEventos.toFixed(2).replace('.', ',')],
      ['Custo Operacional (Atracoes + Equipe + Gerais)', metrics.custoOperacional.toFixed(2).replace('.', ',')],
      ['Custo Produto - Bebidas', metrics.totalBebidas.toFixed(2).replace('.', ',')],
      ['Custo Produto - Alimentacao', metrics.totalAlimentacao.toFixed(2).replace('.', ',')],
      ['Taxa Sistema', metrics.taxaSistema.toFixed(2).replace('.', ',')],
      ['Estorno', metrics.estorno.toFixed(2).replace('.', ',')],
      ['Producao / Aniversarios', metrics.totalProducao.toFixed(2).replace('.', ',')],
      ['CUSTO TOTAL', metrics.custoTotal.toFixed(2).replace('.', ',')],
      ['REPASSE AKATU', metrics.repasseAkatu.toFixed(2).replace('.', ',')],
      ['Comissoes Promoters (Custos Extra)', metrics.totalPromoters.toFixed(2).replace('.', ',')],
      ['LUCRO LIQUIDO DO EVENTO', metrics.lucroEvento.toFixed(2).replace('.', ',')],
      ['Valor Recebido Akatu', metrics.valorRecebidoAkatu.toFixed(2).replace('.', ',')],
      ['Valor a Receber / Devolver', metrics.valorAReceberDevolver.toFixed(2).replace('.', ',')],
      ['Publico Total', String(metrics.publicCount)],
      ['Ticket Medio', metrics.ticketMedio.toFixed(2).replace('.', ',')],
      [],
      ['=== CONFERENCIA DE CAIXAS ==='],
      ['Operador', 'Debito', 'Credito', 'Pix', 'Dinheiro', 'Total Conferido', 'Total Sistema', 'Diferenca'],
      ...activeEvent.cashiers.map((c) => {
        const conf = round2(c.debito + c.credito + c.pix + c.dinheiro);
        const diff = round2(conf - c.sistema);
        return [
          c.name,
          c.debito.toFixed(2).replace('.', ','),
          c.credito.toFixed(2).replace('.', ','),
          c.pix.toFixed(2).replace('.', ','),
          c.dinheiro.toFixed(2).replace('.', ','),
          conf.toFixed(2).replace('.', ','),
          c.sistema.toFixed(2).replace('.', ','),
          diff.toFixed(2).replace('.', ','),
        ];
      }),
      [],
      ['=== CONSUMO BEBIDAS (ITENS > 0) ==='],
      ['Produto', 'Quantidade', 'Valor Unitario', 'Total'],
      ...activeEvent.beverages
        .filter((b) => b.qty > 0)
        .map((b) => [b.name, String(b.qty), b.unitPrice.toFixed(2).replace('.', ','), round2(b.qty * b.unitPrice).toFixed(2).replace('.', ',')]),
      [],
      ['=== CONSUMO ALIMENTACAO (ITENS > 0) ==='],
      ['Produto', 'Quantidade', 'Valor Unitario', 'Total'],
      ...activeEvent.foods
        .filter((f) => f.qty > 0)
        .map((f) => [f.name, String(f.qty), f.unitPrice.toFixed(2).replace('.', ','), round2(f.qty * f.unitPrice).toFixed(2).replace('.', ',')]),
      [],
      ['=== MAO DE OBRA / FREELANCERS ==='],
      ['Funcao', 'Qtd', 'Valor Unitario', 'Total'],
      ...activeEvent.staff.map((s) => [s.name, String(s.qty), s.unitPrice.toFixed(2).replace('.', ','), round2(s.qty * s.unitPrice).toFixed(2).replace('.', ',')]),
      [],
      ['=== CUSTOS GERAIS / ESTRUTURA ==='],
      ['Item', 'Qtd', 'Valor Unitario', 'Total'],
      ...activeEvent.generalCosts.map((g) => [g.name, String(g.qty), g.unitPrice.toFixed(2).replace('.', ','), round2(g.qty * g.unitPrice).toFixed(2).replace('.', ',')]),
      [],
      ['=== PRODUCAO & ANIVERSARIOS ==='],
      ['Beneficiario', 'Item', 'Qtd', 'Valor Unitario', 'Total'],
      ...activeEvent.production.map((p) => [p.beneficiary, p.item, String(p.qty), p.unitPrice.toFixed(2).replace('.', ','), round2(p.qty * p.unitPrice).toFixed(2).replace('.', ',')]),
      [],
      ['=== CONSUMO 50% (AUDITORIA) ==='],
      ['Pessoa', 'Item', 'Pagamento', 'Qtd', 'Valor Unitario', 'Total', 'Autorizado Por'],
      ...activeEvent.halfPriceConsumption.map((h) => [
        h.person,
        h.item,
        h.paymentMethod,
        String(h.qty),
        h.unitPrice.toFixed(2).replace('.', ','),
        round2(h.qty * h.unitPrice).toFixed(2).replace('.', ','),
        h.authorizedBy,
      ]),
    ];

    const csvContent = '\uFEFF' + rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `fechamento-${normalizeText(activeEvent.name).replace(/\s+/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Arquivo CSV exportado com sucesso!');
  };

  const navItems = [
    { id: 'dre', label: 'Resumo & DRE', icon: LayoutDashboard },
    { id: 'cashiers', label: 'Conferência de Caixas', icon: Wallet, badge: metrics && Math.abs(metrics.totalCashierDiff) >= 0.01 ? 'Erro' : null },
    { id: 'catalog', label: 'Bebidas & Alimentação', icon: Wine },
    { id: 'operations', label: 'Equipe, Estrutura & Atrações', icon: Users },
    { id: 'production', label: 'Produção, Aniversários & 50%', icon: Gift, badge: metrics && metrics.priceMismatches.length > 0 ? `${metrics.priceMismatches.length}` : null },
    { id: 'audit', label: 'Conferência & Exportar', icon: CheckSquare },
  ];

  const renderDREModule = () => {
    const costBreakdown = [
      { label: 'Bebidas', value: metrics.totalBebidas, color: 'bg-indigo-600' },
      { label: 'Estrutura & Gerais', value: metrics.totalGeneralCosts, color: 'bg-sky-500' },
      { label: 'Mão de Obra / Freelancers', value: metrics.totalStaff, color: 'bg-violet-500' },
      { label: 'Atrações (DJ / Som)', value: metrics.totalAttractions, color: 'bg-amber-500' },
      { label: 'Taxa Sistema', value: metrics.taxaSistema, color: 'bg-slate-500' },
      { label: 'Comissões Promoters', value: metrics.totalPromoters, color: 'bg-pink-500' },
      { label: 'Alimentação', value: metrics.totalAlimentacao, color: 'bg-emerald-500' },
      { label: 'Produção & Aniversários', value: metrics.totalProducao, color: 'bg-rose-500' },
    ].sort((a, b) => b.value - a.value);

    const totalAllCosts = Math.max(costBreakdown.reduce((acc, c) => acc + c.value, 0), 1);
    const isCashierOk = Math.abs(metrics.totalCashierDiff) < 0.01 && metrics.cashierDivergences.length === 0;

    return (
      <div className="space-y-6">
        {(!isCashierOk || metrics.priceMismatches.length > 0) && (
          <div className="space-y-3 print:hidden">
            {!isCashierOk && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-900">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Divergência detectada na Conferência de Caixas</p>
                    <p className="text-xs text-rose-700 mt-0.5">
                      Diferença total de <span className="font-bold tabular-nums">{formatBRL(metrics.totalCashierDiff)}</span> em {metrics.cashierDivergences.length} operador(es).
                    </p>
                  </div>
                </div>
                <button onClick={() => setActiveTab('cashiers')} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-lg transition shrink-0">
                  Conferir Caixas
                </button>
              </div>
            )}

            {metrics.priceMismatches.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Auditoria de Preços: {metrics.priceMismatches.length} item(ns) na aba Produção divergem do Catálogo</p>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Ex: {metrics.priceMismatches.slice(0, 3).map((m) => `${m.item} (${m.beneficiary}: ${formatBRL(m.prodPrice)} vs catálogo ${formatBRL(m.catalogPrice)})`).join(' • ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setActiveTab('production')} className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 text-xs font-medium rounded-lg transition">
                    Ver Itens
                  </button>
                  <button onClick={handleFixPriceMismatches} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition">
                    Corrigir Preços
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Faturamento Total</span>
              <DollarSign className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">{formatBRL(metrics.faturamento)}</div>
            <div className="text-xs text-slate-500 mt-1">Sistema: {formatBRL(metrics.totalSistema)}</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Custo Total</span>
              <TrendingDown className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">{formatBRL(metrics.custoTotal)}</div>
            <div className="text-xs text-slate-500 mt-1">
              {metrics.faturamento > 0 ? `${((metrics.custoTotal / metrics.faturamento) * 100).toFixed(1)}% do faturamento` : '0%'}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Lucro Líquido</span>
              <TrendingUp className={`w-4 h-4 ${metrics.lucroEvento >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} />
            </div>
            <div className={`text-2xl font-bold tabular-nums ${metrics.lucroEvento >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatBRL(metrics.lucroEvento)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Margem: <span className="font-medium text-slate-700">{metrics.faturamento > 0 ? `${((metrics.lucroEvento / metrics.faturamento) * 100).toFixed(1)}%` : '0%'}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Público & Ticket Médio</span>
              <Users className="w-4 h-4 text-sky-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <input
                type="number"
                min="0"
                value={activeEvent.publicCount}
                onChange={(e) => updateActiveEvent((ev) => ({ ...ev, publicCount: Math.max(0, parseInt(e.target.value, 10) || 0) }))}
                className="w-20 text-2xl font-bold text-slate-900 tabular-nums bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-500">pessoas</span>
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Ticket Médio: <span className="font-semibold tabular-nums">{formatBRL(metrics.ticketMedio)}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Status dos Caixas</span>
              <ShieldCheck className={`w-4 h-4 ${isCashierOk ? 'text-emerald-500' : 'text-rose-500'}`} />
            </div>
            <div className="my-1">
              {isCashierOk ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Caixas Batendo: R$ 0,00
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  <AlertTriangle className="w-3.5 h-3.5" /> Divergência: {formatBRL(metrics.totalCashierDiff)}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500">{activeEvent.cashiers.length} operadores lançados</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div>
                <h2 className="text-base font-bold text-slate-900">Demonstrativo de Resultado (DRE)</h2>
                <p className="text-xs text-slate-500">Campos destacados em azul permitem edição direta</p>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                Cálculo Automático
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-sm">
              <div className="px-5 py-3 flex items-center justify-between bg-emerald-50/40">
                <div>
                  <span className="font-semibold text-slate-900">Faturamento (Caixas - Estorno)</span>
                  <span className="block text-xs text-slate-500">Total Sistema: {formatBRL(metrics.totalSistema)}</span>
                </div>
                <span className="font-bold text-emerald-700 tabular-nums text-base">{formatBRL(metrics.faturamento)}</span>
              </div>

              <div className="px-5 py-2.5 flex items-center justify-between hover:bg-slate-50">
                <label className="text-slate-700 font-medium">Central Eventos (Receita Extra)</label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={activeEvent.dreInputs.centralEventos}
                    onChange={(e) => updateActiveEvent((ev) => ({ ...ev, dreInputs: { ...ev.dreInputs, centralEventos: parseFloat(e.target.value) || 0 } }))}
                    className="w-32 text-right font-semibold tabular-nums bg-indigo-50/60 border border-indigo-200 rounded-lg px-2.5 py-1 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="px-5 py-2.5 flex items-center justify-between">
                <div>
                  <span className="text-slate-700">Custo Operacional</span>
                  <span className="block text-xs text-slate-400">
                    Atrações ({formatBRL(metrics.totalAttractions)}) + Mão de Obra ({formatBRL(metrics.totalStaff)}) + Gerais ({formatBRL(metrics.totalGeneralCosts)})
                  </span>
                </div>
                <span className="font-medium text-slate-800 tabular-nums">{formatBRL(metrics.custoOperacional)}</span>
              </div>

              <div className="px-5 py-2.5 flex items-center justify-between">
                <span className="text-slate-700">Custo Produto — Bebidas</span>
                <span className="font-medium text-slate-800 tabular-nums">{formatBRL(metrics.totalBebidas)}</span>
              </div>

              <div className="px-5 py-2.5 flex items-center justify-between">
                <span className="text-slate-700">Custo Produto — Alimentação</span>
                <span className="font-medium text-slate-800 tabular-nums">{formatBRL(metrics.totalAlimentacao)}</span>
              </div>

              <div className="px-5 py-2.5 flex items-center justify-between hover:bg-slate-50">
                <label className="text-slate-700 font-medium">Taxa Sistema / Maquininha</label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={activeEvent.dreInputs.taxaSistema}
                    onChange={(e) => updateActiveEvent((ev) => ({ ...ev, dreInputs: { ...ev.dreInputs, taxaSistema: parseFloat(e.target.value) || 0 } }))}
                    className="w-32 text-right font-semibold tabular-nums bg-indigo-50/60 border border-indigo-200 rounded-lg px-2.5 py-1 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="px-5 py-2.5 flex items-center justify-between hover:bg-slate-50">
                <label className="text-slate-700 font-medium">Estorno (deduzido do Faturamento)</label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={activeEvent.dreInputs.estorno}
                    onChange={(e) => updateActiveEvent((ev) => ({ ...ev, dreInputs: { ...ev.dreInputs, estorno: parseFloat(e.target.value) || 0 } }))}
                    className="w-32 text-right font-semibold tabular-nums bg-indigo-50/60 border border-indigo-200 rounded-lg px-2.5 py-1 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="px-5 py-2.5 flex items-center justify-between">
                <span className="text-slate-700">Produção / Aniversários</span>
                <span className="font-medium text-slate-800 tabular-nums">{formatBRL(metrics.totalProducao)}</span>
              </div>

              <div className="px-5 py-3 flex items-center justify-between bg-slate-100/80 font-semibold">
                <span className="text-slate-900">CUSTO TOTAL</span>
                <span className="text-slate-900 tabular-nums">{formatBRL(metrics.custoTotal)}</span>
              </div>

              <div className="px-5 py-3 flex items-center justify-between bg-indigo-50/50 font-semibold">
                <span className="text-indigo-950">REPASSE AKATU (Faturamento - Custo Total)</span>
                <span className="text-indigo-700 tabular-nums">{formatBRL(metrics.repasseAkatu)}</span>
              </div>

              <div className="px-5 py-2.5 flex items-center justify-between">
                <span className="text-slate-700">Custos Extra / Comissões Promoters (S4)</span>
                <span className="font-medium text-rose-600 tabular-nums">- {formatBRL(metrics.totalPromoters)}</span>
              </div>

              <div className="px-5 py-3.5 flex items-center justify-between bg-slate-900 text-white">
                <div>
                  <span className="font-bold tracking-wide text-sm">LUCRO LÍQUIDO DO EVENTO</span>
                  <span className="block text-[11px] text-slate-300">Repasse Akatu - Comissões Promoters + Central Eventos</span>
                </div>
                <span className={`text-lg font-bold tabular-nums ${metrics.lucroEvento >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatBRL(metrics.lucroEvento)}
                </span>
              </div>

              <div className="px-5 py-3 bg-slate-50 space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Acerto Financeiro (Casa / Sócio)</div>
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-medium">Valor Recebido Akatu (Adiantamento / Caixa)</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={activeEvent.dreInputs.valorRecebidoAkatu}
                      onChange={(e) => updateActiveEvent((ev) => ({ ...ev, dreInputs: { ...ev.dreInputs, valorRecebidoAkatu: parseFloat(e.target.value) || 0 } }))}
                      className="w-32 text-right font-semibold tabular-nums bg-white border border-indigo-200 rounded-lg px-2.5 py-1 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <div>
                    <span className="font-bold text-slate-900">{metrics.valorAReceberDevolver < 0 ? 'Valor a Devolver / Acertar' : 'Valor a Receber'}</span>
                    <span className="block text-xs text-slate-500">Repasse Akatu - Valor Recebido Akatu</span>
                  </div>
                  <span className={`text-base font-bold tabular-nums px-3 py-1 rounded-lg ${metrics.valorAReceberDevolver < 0 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>
                    {formatBRL(metrics.valorAReceberDevolver)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <h3 className="text-base font-bold text-slate-900 mb-1">Composição de Custos</h3>
              <p className="text-xs text-slate-500 mb-4">Distribuição percentual de todas as despesas do evento</p>
              <div className="space-y-3.5">
                {costBreakdown.map((item) => {
                  const pct = (item.value / totalAllCosts) * 100;
                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700">{item.label}</span>
                        <div className="flex items-center gap-2 tabular-nums">
                          <span className="text-slate-400">{pct.toFixed(1)}%</span>
                          <span className="font-semibold text-slate-900 w-24 text-right">{formatBRL(item.value)}</span>
                        </div>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${item.color}`} style={{ width: `${Math.min(100, Math.max(pct, 0.8))}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <h3 className="text-base font-bold text-slate-900 mb-1">Entradas por Meio de Pagamento</h3>
              <p className="text-xs text-slate-500 mb-4">Consolidado dos {activeEvent.cashiers.length} operadores de caixa</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Débito', val: metrics.totalDebito, bg: 'bg-indigo-50 text-indigo-900 border-indigo-100' },
                  { label: 'Crédito', val: metrics.totalCredito, bg: 'bg-sky-50 text-sky-900 border-sky-100' },
                  { label: 'Pix', val: metrics.totalPix, bg: 'bg-emerald-50 text-emerald-900 border-emerald-100' },
                  { label: 'Dinheiro', val: metrics.totalDinheiro, bg: 'bg-amber-50 text-amber-900 border-amber-100' },
                ].map((m) => {
                  const pct = metrics.totalConferido > 0 ? (m.val / metrics.totalConferido) * 100 : 0;
                  return (
                    <div key={m.label} className={`p-3 rounded-xl border ${m.bg}`}>
                      <div className="flex items-center justify-between text-xs opacity-80 mb-1">
                        <span className="font-medium">{m.label}</span>
                        <span className="tabular-nums">{pct.toFixed(1)}%</span>
                      </div>
                      <div className="text-base font-bold tabular-nums">{formatBRL(m.val)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCashiersModule = () => {
    const updateCashier = (id, field, value) => {
      updateActiveEvent((ev) => ({
        ...ev,
        cashiers: ev.cashiers.map((c) => (c.id === id ? { ...c, [field]: field === 'name' ? value : parseFloat(value) || 0 } : c)),
      }));
    };

    const addCashier = () => {
      updateActiveEvent((ev) => ({
        ...ev,
        cashiers: [...ev.cashiers, { id: uid(), name: `Novo Operador ${ev.cashiers.length + 1}`, debito: 0, credito: 0, pix: 0, dinheiro: 0, sistema: 0 }],
      }));
      showToast('Operador de caixa adicionado.');
    };

    const removeCashier = (id) => {
      updateActiveEvent((ev) => ({ ...ev, cashiers: ev.cashiers.filter((c) => c.id !== id) }));
      showToast('Operador removido.');
    };

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Conferência de Caixas</h2>
            <p className="text-xs text-slate-500">Confronte os valores físicos/maquininha com o relatório do sistema PDV operador por operador.</p>
          </div>
          <button onClick={addCashier} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition">
            <Plus className="w-4 h-4" /> Adicionar Operador de Caixa
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                <tr>
                  <th className="px-4 py-3 min-w-[180px]">Operador</th>
                  <th className="px-3 py-3 text-right min-w-[110px]">Débito</th>
                  <th className="px-3 py-3 text-right min-w-[110px]">Crédito</th>
                  <th className="px-3 py-3 text-right min-w-[110px]">Pix</th>
                  <th className="px-3 py-3 text-right min-w-[110px]">Dinheiro</th>
                  <th className="px-3 py-3 text-right min-w-[125px] bg-slate-100/60">Total Conferido</th>
                  <th className="px-3 py-3 text-right min-w-[120px]">Total Sistema</th>
                  <th className="px-3 py-3 text-right min-w-[125px]">Diferença</th>
                  <th className="px-3 py-3 text-center w-12">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeEvent.cashiers.map((c) => {
                  const conf = round2(c.debito + c.credito + c.pix + c.dinheiro);
                  const diff = round2(conf - c.sistema);
                  const isOk = Math.abs(diff) < 0.01;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-2">
                        <input type="text" value={c.name} onChange={(e) => updateCashier(c.id, 'name', e.target.value)} className="w-full bg-transparent font-medium text-slate-900 border border-transparent hover:border-slate-200 focus:border-indigo-400 focus:bg-white rounded px-2 py-1 focus:outline-none" />
                      </td>
                      {['debito', 'credito', 'pix', 'dinheiro'].map((field) => (
                        <td key={field} className="px-2 py-2 text-right">
                          <input type="number" step="0.01" value={c[field]} onChange={(e) => updateCashier(c.id, field, e.target.value)} className="w-24 text-right tabular-nums bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded px-2 py-1 text-slate-800 focus:outline-none" />
                        </td>
                      ))}
                      <td className="px-3 py-2 text-right font-semibold tabular-nums text-slate-900 bg-slate-50/80">{formatBRL(conf)}</td>
                      <td className="px-2 py-2 text-right">
                        <input type="number" step="0.01" value={c.sistema} onChange={(e) => updateCashier(c.id, 'sistema', e.target.value)} className="w-24 text-right tabular-nums font-medium bg-indigo-50/50 border border-indigo-200 focus:border-indigo-500 focus:bg-white rounded px-2 py-1 text-indigo-950 focus:outline-none" />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold tabular-nums ${isOk ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                          {formatBRL(diff)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button onClick={() => removeCashier(c.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-900 text-white font-semibold text-xs">
                <tr>
                  <td className="px-4 py-3.5 uppercase tracking-wider">Totais ({activeEvent.cashiers.length})</td>
                  <td className="px-3 py-3.5 text-right tabular-nums">{formatBRL(metrics.totalDebito)}</td>
                  <td className="px-3 py-3.5 text-right tabular-nums">{formatBRL(metrics.totalCredito)}</td>
                  <td className="px-3 py-3.5 text-right tabular-nums">{formatBRL(metrics.totalPix)}</td>
                  <td className="px-3 py-3.5 text-right tabular-nums">{formatBRL(metrics.totalDinheiro)}</td>
                  <td className="px-3 py-3.5 text-right tabular-nums bg-slate-800">{formatBRL(metrics.totalConferido)}</td>
                  <td className="px-3 py-3.5 text-right tabular-nums">{formatBRL(metrics.totalSistema)}</td>
                  <td className="px-3 py-3.5 text-right tabular-nums">
                    <span className={Math.abs(metrics.totalCashierDiff) < 0.01 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {formatBRL(metrics.totalCashierDiff)}
                    </span>
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderCatalogModule = () => {
    const isBev = catalogSubTab === 'beverages';
    const listKey = isBev ? 'beverages' : 'foods';
    const items = activeEvent[listKey];

    const filtered = items.filter((item) => {
      const matchesSearch = normalizeText(item.name).includes(normalizeText(catalogSearch));
      const matchesConsumed = !onlyConsumed || Number(item.qty) > 0;
      return matchesSearch && matchesConsumed;
    });

    const updateItem = (id, field, value) => {
      updateActiveEvent((ev) => ({
        ...ev,
        [listKey]: ev[listKey].map((item) => (item.id === id ? { ...item, [field]: field === 'name' ? value : parseFloat(value) || 0 } : item)),
      }));
    };

    const addItem = () => {
      updateActiveEvent((ev) => ({
        ...ev,
        [listKey]: [{ id: uid(), name: isBev ? 'Nova Bebida' : 'Nova Porção', qty: 0, unitPrice: 0 }, ...ev[listKey]],
      }));
      showToast(`Novo item adicionado em ${isBev ? 'Bebidas' : 'Alimentação'}.`);
    };

    const removeItem = (id) => {
      updateActiveEvent((ev) => ({ ...ev, [listKey]: ev[listKey].filter((item) => item.id !== id) }));
    };

    const categoryTotal = isBev ? metrics.totalBebidas : metrics.totalAlimentacao;

    return (
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="inline-flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm self-start">
            <button onClick={() => setCatalogSubTab('beverages')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${isBev ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
              <Wine className="w-4 h-4" /> Bebidas ({formatBRL(metrics.totalBebidas)})
            </button>
            <button onClick={() => setCatalogSubTab('foods')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${!isBev ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
              <Utensils className="w-4 h-4" /> Alimentação ({formatBRL(metrics.totalAlimentacao)})
            </button>
          </div>
          <button onClick={addItem} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition">
            <Plus className="w-4 h-4" /> Novo Produto
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Buscar produto em ${isBev ? 'Bebidas' : 'Alimentação'}...`}
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none px-2">
            <input type="checkbox" checked={onlyConsumed} onChange={(e) => setOnlyConsumed(e.target.checked)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
            Mostrar apenas itens com consumo &gt; 0
          </label>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                <tr>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3 text-right w-32">Quantidade</th>
                  <th className="px-4 py-3 text-right w-36">Valor Unit. (R$)</th>
                  <th className="px-4 py-3 text-right w-36">Total</th>
                  <th className="px-3 py-3 text-center w-12">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const rowTotal = round2((Number(item.qty) || 0) * (Number(item.unitPrice) || 0));
                  return (
                    <tr key={item.id} className={`hover:bg-slate-50 transition ${item.qty === 0 ? 'opacity-65' : ''}`}>
                      <td className="px-4 py-2">
                        <input type="text" value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} className="w-full bg-transparent font-medium text-slate-900 border border-transparent hover:border-slate-200 focus:border-indigo-400 focus:bg-white rounded px-2 py-1 focus:outline-none" />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <input type="number" min="0" step="1" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', e.target.value)} className="w-24 text-right tabular-nums bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded px-2 py-1 font-semibold text-slate-900 focus:outline-none" />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)} className="w-28 text-right tabular-nums bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded px-2 py-1 text-slate-700 focus:outline-none" />
                      </td>
                      <td className="px-4 py-2 text-right font-semibold tabular-nums text-slate-900">{formatBRL(rowTotal)}</td>
                      <td className="px-3 py-2 text-center">
                        <button onClick={() => removeItem(item.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">Nenhum produto encontrado com os filtros atuais.</td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-slate-900 text-white font-semibold">
                <tr>
                  <td className="px-4 py-3 text-xs uppercase tracking-wider">Total {isBev ? 'Bebidas' : 'Alimentação'} ({items.length} itens no catálogo)</td>
                  <td className="px-4 py-3 text-right tabular-nums text-xs">{items.reduce((acc, i) => acc + (Number(i.qty) || 0), 0)} unid.</td>
                  <td />
                  <td className="px-4 py-3 text-right tabular-nums">{formatBRL(categoryTotal)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderOperationsModule = () => {
    const renderCostBlock = (title, subtitle, icon, listKey, totalValue, accentClass) => {
      const Icon = icon;
      const list = activeEvent[listKey];

      const updateRow = (id, field, value) => {
        updateActiveEvent((ev) => ({
          ...ev,
          [listKey]: ev[listKey].map((item) => (item.id === id ? { ...item, [field]: field === 'name' ? value : parseFloat(value) || 0 } : item)),
        }));
      };

      const addRow = () => {
        updateActiveEvent((ev) => ({ ...ev, [listKey]: [...ev[listKey], { id: uid(), name: 'Novo Item', qty: 1, unitPrice: 0 }] }));
      };

      const removeRow = (id) => {
        updateActiveEvent((ev) => ({ ...ev, [listKey]: ev[listKey].filter((item) => item.id !== id) }));
      };

      return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${accentClass}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
                <p className="text-xs text-slate-500">{subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-900 tabular-nums text-sm">{formatBRL(totalValue)}</span>
              <button onClick={addRow} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition">
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/60 border-b border-slate-100 text-[11px] uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-2.5">Descrição / Função</th>
                  <th className="px-2 py-2.5 text-right w-20">Qtd</th>
                  <th className="px-2 py-2.5 text-right w-28">Valor Unit.</th>
                  <th className="px-3 py-2.5 text-right w-28">Total</th>
                  <th className="px-2 py-2.5 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((item) => {
                  const rowTotal = round2((Number(item.qty) || 0) * (Number(item.unitPrice) || 0));
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="px-3 py-1.5">
                        <input type="text" value={item.name} onChange={(e) => updateRow(item.id, 'name', e.target.value)} className="w-full bg-transparent text-slate-800 font-medium border border-transparent hover:border-slate-200 focus:border-indigo-400 focus:bg-white rounded px-2 py-1 focus:outline-none" />
                      </td>
                      <td className="px-2 py-1.5 text-right">
                        <input type="number" min="0" value={item.qty} onChange={(e) => updateRow(item.id, 'qty', e.target.value)} className="w-16 text-right tabular-nums bg-slate-50 border border-slate-200 rounded px-1.5 py-1 focus:outline-none focus:border-indigo-500" />
                      </td>
                      <td className="px-2 py-1.5 text-right">
                        <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => updateRow(item.id, 'unitPrice', e.target.value)} className="w-24 text-right tabular-nums bg-slate-50 border border-slate-200 rounded px-1.5 py-1 focus:outline-none focus:border-indigo-500" />
                      </td>
                      <td className="px-3 py-1.5 text-right font-semibold tabular-nums text-slate-900">{formatBRL(rowTotal)}</td>
                      <td className="px-2 py-1.5 text-center">
                        <button onClick={() => removeRow(item.id)} className="p-1 text-slate-400 hover:text-rose-600 rounded transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs text-slate-500 font-medium">Mão de Obra / Freelancers</div>
            <div className="text-xl font-bold text-slate-900 tabular-nums mt-1">{formatBRL(metrics.totalStaff)}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs text-slate-500 font-medium">Custos Gerais / Estrutura</div>
            <div className="text-xl font-bold text-slate-900 tabular-nums mt-1">{formatBRL(metrics.totalGeneralCosts)}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs text-slate-500 font-medium">Atrações (Artistas & Som)</div>
            <div className="text-xl font-bold text-slate-900 tabular-nums mt-1">{formatBRL(metrics.totalAttractions)}</div>
          </div>
          <div className="bg-slate-900 text-white rounded-xl p-4">
            <div className="text-xs text-slate-300 font-medium">Total Custo Operacional</div>
            <div className="text-xl font-bold text-emerald-400 tabular-nums mt-1">{formatBRL(metrics.custoOperacional)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {renderCostBlock('Mão de Obra / Freelancers', 'Diárias de bar, cozinha, caixas, segurança e limpeza', Users, 'staff', metrics.totalStaff, 'bg-violet-100 text-violet-700')}

          <div className="space-y-6">
            {renderCostBlock('Custos Gerais / Estrutura', 'Aluguel de espaço, gelo, tráfego pago e insumos', Building2, 'generalCosts', metrics.totalGeneralCosts, 'bg-sky-100 text-sky-700')}
            {renderCostBlock('Atrações & Sonorização', 'Cachês de DJs, bandas e equipamento de som', Music, 'attractions', metrics.totalAttractions, 'bg-amber-100 text-amber-700')}

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-pink-100 text-pink-700">
                    <Percent className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Comissões Promoters (Custos Extra S4)</h3>
                    <p className="text-xs text-slate-500">Base de cálculo: {formatBRL(metrics.baseComissao)} (Faturamento + Central Eventos)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 tabular-nums text-sm">{formatBRL(metrics.totalPromoters)}</span>
                  <button
                    onClick={() => updateActiveEvent((ev) => ({ ...ev, promoters: [...ev.promoters, { id: uid(), name: 'Novo Promoter', percent: 0.5 }] }))}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>
              </div>

              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/60 border-b border-slate-100 text-[11px] uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5">Promoter</th>
                    <th className="px-3 py-2.5 text-right w-28">% Comissão</th>
                    <th className="px-3 py-2.5 text-right w-32">Valor Calculado</th>
                    <th className="px-2 py-2.5 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeEvent.promoters.map((p) => {
                    const val = round2(metrics.baseComissao * ((Number(p.percent) || 0) / 100));
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70">
                        <td className="px-3 py-1.5">
                          <input type="text" value={p.name} onChange={(e) => updateActiveEvent((ev) => ({ ...ev, promoters: ev.promoters.map((x) => (x.id === p.id ? { ...x, name: e.target.value } : x)) }))} className="w-full bg-transparent text-slate-800 font-medium border border-transparent hover:border-slate-200 focus:border-indigo-400 focus:bg-white rounded px-2 py-1 focus:outline-none" />
                        </td>
                        <td className="px-3 py-1.5 text-right">
                          <div className="inline-flex items-center gap-1">
                            <input type="number" step="0.1" min="0" value={p.percent} onChange={(e) => updateActiveEvent((ev) => ({ ...ev, promoters: ev.promoters.map((x) => (x.id === p.id ? { ...x, percent: parseFloat(e.target.value) || 0 } : x)) }))} className="w-16 text-right tabular-nums bg-slate-50 border border-slate-200 rounded px-1.5 py-1 focus:outline-none focus:border-indigo-500" />
                            <span className="text-slate-400 text-xs">%</span>
                          </div>
                        </td>
                        <td className="px-3 py-1.5 text-right font-semibold tabular-nums text-slate-900">{formatBRL(val)}</td>
                        <td className="px-2 py-1.5 text-center">
                          <button onClick={() => updateActiveEvent((ev) => ({ ...ev, promoters: ev.promoters.filter((x) => x.id !== p.id) }))} className="p-1 text-slate-400 hover:text-rose-600 rounded transition">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProductionModule = () => {
    const isProd = prodSubTab === 'production';
    const beneficiaryOptions = ['DJ', 'Serginho Peixe', 'Mazeo', 'Promoter (Renatinho)', 'Aniversariantes/Divulgadores', 'PM', 'Outros'];
    const mismatchIds = new Map(metrics.priceMismatches.map((m) => [m.id, m.catalogPrice]));

    return (
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="inline-flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm self-start">
            <button onClick={() => setProdSubTab('production')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${isProd ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
              Produção & Aniversários ({formatBRL(metrics.totalProducao)})
            </button>
            <button onClick={() => setProdSubTab('half')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${!isProd ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
              Consumo 50% — Auditoria ({formatBRL(metrics.totalConsumo50)})
            </button>
          </div>

          {isProd ? (
            <button
              onClick={() => updateActiveEvent((ev) => ({ ...ev, production: [{ id: uid(), beneficiary: 'DJ', item: 'Água', qty: 1, unitPrice: 0.99 }, ...ev.production] }))}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
            >
              <Plus className="w-4 h-4" /> Lançar Item de Produção
            </button>
          ) : (
            <button
              onClick={() => updateActiveEvent((ev) => ({ ...ev, halfPriceConsumption: [{ id: uid(), person: 'Novo Beneficiário', item: 'Produto', paymentMethod: 'Débito', qty: 1, unitPrice: 0, authorizedBy: 'Produção' }, ...ev.halfPriceConsumption] }))}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
            >
              <Plus className="w-4 h-4" /> Lançar Consumo 50%
            </button>
          )}
        </div>

        {isProd ? (
          <div className="space-y-3">
            {metrics.priceMismatches.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span><strong>{metrics.priceMismatches.length} item(ns)</strong> estão com preço unitário diferente do catálogo de Bebidas/Alimentação.</span>
                </div>
                <button onClick={handleFixPriceMismatches} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition shrink-0">
                  Sincronizar com Catálogo
                </button>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                    <tr>
                      <th className="px-4 py-3 min-w-[190px]">Beneficiário / Categoria</th>
                      <th className="px-4 py-3 min-w-[200px]">Item (ou escolha do catálogo)</th>
                      <th className="px-3 py-3 text-right w-24">Qtd</th>
                      <th className="px-3 py-3 text-right w-36">Valor Unit. (R$)</th>
                      <th className="px-4 py-3 text-right w-32">Total</th>
                      <th className="px-3 py-3 w-12" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeEvent.production.map((row) => {
                      const rowTotal = round2((Number(row.qty) || 0) * (Number(row.unitPrice) || 0));
                      const catalogExpected = mismatchIds.get(row.id);
                      return (
                        <tr key={row.id} className={catalogExpected !== undefined ? 'bg-amber-50/50' : 'hover:bg-slate-50'}>
                          <td className="px-3 py-2">
                            <input list="beneficiary-list" value={row.beneficiary} onChange={(e) => updateActiveEvent((ev) => ({ ...ev, production: ev.production.map((p) => (p.id === row.id ? { ...p, beneficiary: e.target.value } : p)) }))} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 font-medium focus:outline-none focus:border-indigo-500" />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              list="catalog-products-list"
                              value={row.item}
                              onChange={(e) => {
                                const val = e.target.value;
                                const match = [...activeEvent.beverages, ...activeEvent.foods].find((c) => normalizeText(c.name) === normalizeText(val));
                                updateActiveEvent((ev) => ({ ...ev, production: ev.production.map((p) => (p.id === row.id ? { ...p, item: val, unitPrice: match ? match.unitPrice : p.unitPrice } : p)) }));
                              }}
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 focus:outline-none focus:border-indigo-500"
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input type="number" min="0" value={row.qty} onChange={(e) => updateActiveEvent((ev) => ({ ...ev, production: ev.production.map((p) => (p.id === row.id ? { ...p, qty: parseFloat(e.target.value) || 0 } : p)) }))} className="w-20 text-right tabular-nums bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-indigo-500" />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={row.unitPrice}
                              onChange={(e) => updateActiveEvent((ev) => ({ ...ev, production: ev.production.map((p) => (p.id === row.id ? { ...p, unitPrice: parseFloat(e.target.value) || 0 } : p)) }))}
                              className={`w-24 text-right tabular-nums border rounded px-2 py-1 focus:outline-none ${catalogExpected !== undefined ? 'bg-amber-100 border-amber-400 text-amber-950 font-semibold' : 'bg-white border-slate-200'}`}
                            />
                            {catalogExpected !== undefined && <div className="text-[10px] text-amber-700 mt-0.5">Catálogo: {formatBRL(catalogExpected)}</div>}
                          </td>
                          <td className="px-4 py-2 text-right font-semibold tabular-nums text-slate-900">{formatBRL(rowTotal)}</td>
                          <td className="px-3 py-2 text-center">
                            <button onClick={() => updateActiveEvent((ev) => ({ ...ev, production: ev.production.filter((p) => p.id !== row.id) }))} className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-900 text-white font-semibold">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-xs uppercase tracking-wider">Total Produção & Aniversários (entra no Custo Total do DRE)</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatBRL(metrics.totalProducao)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
              <datalist id="beneficiary-list">{beneficiaryOptions.map((opt) => <option key={opt} value={opt} />)}</datalist>
              <datalist id="catalog-products-list">{[...activeEvent.beverages, ...activeEvent.foods].map((c) => <option key={c.id} value={c.name} />)}</datalist>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-indigo-50/50 border-b border-slate-200 text-xs text-indigo-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Controle de auditoria de consumo com 50% de desconto. Este bloco não altera o Custo Total do DRE.</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Pessoa</th>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-3 py-3">Pagamento</th>
                    <th className="px-3 py-3 text-right w-20">Qtd</th>
                    <th className="px-3 py-3 text-right w-28">Valor Unit.</th>
                    <th className="px-3 py-3 text-right w-28">Total</th>
                    <th className="px-4 py-3">Autorizado por</th>
                    <th className="px-2 py-3 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeEvent.halfPriceConsumption.map((h) => {
                    const rowTotal = round2((Number(h.qty) || 0) * (Number(h.unitPrice) || 0));
                    const updateHalf = (field, val) => {
                      updateActiveEvent((ev) => ({ ...ev, halfPriceConsumption: ev.halfPriceConsumption.map((item) => (item.id === h.id ? { ...item, [field]: val } : item)) }));
                    };
                    return (
                      <tr key={h.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2"><input type="text" value={h.person} onChange={(e) => updateHalf('person', e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1 font-medium text-slate-800 focus:outline-none focus:border-indigo-500" /></td>
                        <td className="px-3 py-2"><input type="text" value={h.item} onChange={(e) => updateHalf('item', e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 focus:outline-none focus:border-indigo-500" /></td>
                        <td className="px-3 py-2">
                          <select value={h.paymentMethod} onChange={(e) => updateHalf('paymentMethod', e.target.value)} className="bg-white border border-slate-200 rounded px-2 py-1 text-slate-700 focus:outline-none focus:border-indigo-500">
                            <option value="Débito">Débito</option>
                            <option value="Crédito">Crédito</option>
                            <option value="Pix">Pix</option>
                            <option value="Dinheiro">Dinheiro</option>
                          </select>
                        </td>
                        <td className="px-3 py-2 text-right"><input type="number" min="0" value={h.qty} onChange={(e) => updateHalf('qty', parseFloat(e.target.value) || 0)} className="w-16 text-right tabular-nums bg-white border border-slate-200 rounded px-1.5 py-1" /></td>
                        <td className="px-3 py-2 text-right"><input type="number" step="0.01" min="0" value={h.unitPrice} onChange={(e) => updateHalf('unitPrice', parseFloat(e.target.value) || 0)} className="w-24 text-right tabular-nums bg-white border border-slate-200 rounded px-1.5 py-1" /></td>
                        <td className="px-3 py-2 text-right font-semibold tabular-nums text-slate-900">{formatBRL(rowTotal)}</td>
                        <td className="px-3 py-2"><input type="text" value={h.authorizedBy} onChange={(e) => updateHalf('authorizedBy', e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-700 focus:outline-none focus:border-indigo-500" /></td>
                        <td className="px-2 py-2 text-center">
                          <button onClick={() => updateActiveEvent((ev) => ({ ...ev, halfPriceConsumption: ev.halfPriceConsumption.filter((item) => item.id !== h.id) }))} className="p-1 text-slate-400 hover:text-rose-600 rounded transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-900 text-white font-semibold">
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-xs uppercase tracking-wider">Total Consumo 50% (Auditoria)</td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatBRL(metrics.totalConsumo50)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAuditModule = () => {
    const toggleCheck = (id) => {
      updateActiveEvent((ev) => ({ ...ev, checklist: ev.checklist.map((c) => (c.id === id ? { ...c, done: !c.done } : c)) }));
    };

    const toggleEventStatus = () => {
      const nextStatus = activeEvent.status === 'Fechado e Aprovado' ? 'Em Conferência' : 'Fechado e Aprovado';
      updateActiveEvent((ev) => ({ ...ev, status: nextStatus }));
      showToast(`Status do evento atualizado para "${nextStatus}".`);
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Checklist de Auditoria Semanal</h2>
              <p className="text-xs text-slate-500">Valide cada etapa antes de aprovar e enviar o fechamento</p>
            </div>
            <span className="text-sm font-bold text-indigo-600 tabular-nums">{metrics.checklistPct}%</span>
          </div>

          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-300 ${metrics.checklistPct === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`} style={{ width: `${metrics.checklistPct}%` }} />
          </div>

          <div className="space-y-2.5">
            {activeEvent.checklist.map((item) => (
              <label key={item.id} className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${item.done ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100/70'}`}>
                <input type="checkbox" checked={item.done} onChange={() => toggleCheck(item.id)} className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300" />
                <span className={`text-sm ${item.done ? 'line-through opacity-80' : 'font-medium'}`}>{item.label}</span>
              </label>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Status atual:{' '}
              <span className={`font-semibold px-2 py-0.5 rounded-full ${activeEvent.status === 'Fechado e Aprovado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {activeEvent.status}
              </span>
            </div>
            <button onClick={toggleEventStatus} className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition shadow-sm ${activeEvent.status === 'Fechado e Aprovado' ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
              <CheckCircle2 className="w-4 h-4" />
              {activeEvent.status === 'Fechado e Aprovado' ? 'Reabrir para Conferência' : 'Marcar como Fechado e Aprovado'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Exportar & Compartilhar Fechamento</h3>
            <button onClick={handleExportCSV} className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition text-left group">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700"><FileSpreadsheet className="w-5 h-5" /></div>
                <div>
                  <div className="font-semibold text-sm text-slate-900 group-hover:text-indigo-700">Exportar Fechamento em CSV</div>
                  <div className="text-xs text-slate-500">Abre direto no Excel com DRE e todos os detalhamentos</div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            </button>
            <button onClick={() => window.print()} className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition text-left group">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-100 text-indigo-700"><Printer className="w-5 h-5" /></div>
                <div>
                  <div className="font-semibold text-sm text-slate-900 group-hover:text-indigo-700">Imprimir / Salvar PDF</div>
                  <div className="text-xs text-slate-500">Layout executivo limpo para envio via WhatsApp/E-mail</div>
                </div>
              </div>
              <Printer className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            </button>
          </div>

          <div className="bg-slate-900 text-white rounded-xl p-5 space-y-2">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Resumo Executivo Rápido</div>
            <div className="flex justify-between text-sm"><span className="text-slate-300">Faturamento</span><span className="font-bold tabular-nums">{formatBRL(metrics.faturamento)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-300">Custo Total</span><span className="font-bold tabular-nums">{formatBRL(metrics.custoTotal)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-300">Comissões Promoters</span><span className="font-bold tabular-nums">{formatBRL(metrics.totalPromoters)}</span></div>
            <div className="flex justify-between text-base pt-2 border-t border-slate-700">
              <span className="font-bold">Lucro Líquido</span>
              <span className={`font-bold tabular-nums ${metrics.lucroEvento >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{formatBRL(metrics.lucroEvento)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row font-sans">
      <style>{`
        @media print {
          aside, header, .print\\:hidden { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; width: 100% !important; }
          body { background: white !important; }
        }
      `}</style>

      {mobileMenuOpen && <div className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />}

      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-slate-900 text-slate-100 flex flex-col shrink-0 transition-transform duration-200 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="px-5 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-600/30">FE</div>
            <div>
              <div className="font-bold text-base tracking-tight leading-none">Eventos Semanais</div>
              <div className="text-[11px] text-slate-400 mt-1">MEU EVENTO • Fechamento</div>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-4 pt-3">
          <a href="/" className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition">
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao MEU EVENTO
          </a>
        </div>

        <div className="p-4 border-b border-slate-800 space-y-2.5">
          <label className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">Edição Semanal Ativa</label>
          <select
            value={activeEvent?.id || ''}
            onChange={(e) => setActiveEventId(e.target.value)}
            disabled={events.length === 0}
            className="w-full bg-slate-800 border border-slate-700 text-sm font-medium text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {events.length === 0 ? (
              <option value="">Nenhum fechamento</option>
            ) : (
              events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))
            )}
          </select>
          <button
            onClick={() => {
              setNewEventForm((f) => ({
                ...f,
                venue: activeEvent?.venue || '',
                cloneStructure: Boolean(activeEvent),
              }));
              setNewEventModalOpen(true);
            }}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> Novo Fechamento Semanal
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition ${active ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950">{item.badge}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button onClick={() => setResetModalOpen(true)} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
            <RotateCcw className="w-3.5 h-3.5" /> Restaurar Demo (20/11/2026)
          </button>
          <div className="text-[11px] text-center text-slate-500">Salvamento automático ativo</div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {activeEvent ? (
          <>
            <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                  aria-label="Abrir menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                      {activeEvent.name}
                    </h1>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        activeEvent.status === 'Fechado e Aprovado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {activeEvent.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />{' '}
                      {activeEvent.date.split('-').reverse().join('/')}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {activeEvent.venue}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap print:hidden">
                    <button
                      type="button"
                      onClick={openEditEventModal}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition"
                    >
                      <Pencil className="w-3 h-3" /> Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteEventModalOpen(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-md transition"
                    >
                      <Trash2 className="w-3 h-3" /> Excluir
                    </button>
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition"
                >
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
                >
                  <Printer className="w-3.5 h-3.5" /> PDF
                </button>
              </div>
            </header>

            <main className="flex-1 p-4 sm:p-6 max-w-[1440px] w-full mx-auto">
              {activeTab === 'dre' && renderDREModule()}
              {activeTab === 'cashiers' && renderCashiersModule()}
              {activeTab === 'catalog' && renderCatalogModule()}
              {activeTab === 'operations' && renderOperationsModule()}
              {activeTab === 'production' && renderProductionModule()}
              {activeTab === 'audit' && renderAuditModule()}
            </main>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="lg:hidden self-start mb-auto">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                aria-label="Abrir menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
              <Calendar className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Nenhum fechamento semanal cadastrado</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-md">
              Crie um novo fechamento do zero ou restaure os dados de demonstração para começar.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <button
                onClick={() => {
                  setNewEventForm({
                    name: '',
                    date: new Date().toISOString().slice(0, 10),
                    venue: '',
                    cloneStructure: false,
                  });
                  setNewEventModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition"
              >
                <Plus className="w-4 h-4" /> Novo Fechamento Semanal
              </button>
              <button
                onClick={() => setResetModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition"
              >
                <RotateCcw className="w-4 h-4" /> Restaurar Demo
              </button>
            </div>
          </div>
        )}
      </div>

      {newEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Novo Fechamento Semanal</h3>
              <button onClick={() => setNewEventModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateWeeklyEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Edição *</label>
                <input type="text" required placeholder="Ex: Akatu Villa — 27/11/2026" value={newEventForm.name} onChange={(e) => setNewEventForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data do Evento</label>
                  <input type="date" value={newEventForm.date} onChange={(e) => setNewEventForm((f) => ({ ...f, date: e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Local</label>
                  <input type="text" value={newEventForm.venue} onChange={(e) => setNewEventForm((f) => ({ ...f, venue: e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              {activeEvent && (
                <label className="flex items-start gap-3 p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 cursor-pointer">
                  <input type="checkbox" checked={newEventForm.cloneStructure} onChange={(e) => setNewEventForm((f) => ({ ...f, cloneStructure: e.target.checked }))} className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                  <div className="text-xs text-indigo-950">
                    <div className="font-semibold flex items-center gap-1"><Copy className="w-3.5 h-3.5" /> Clonar estrutura do evento atual (recomendado)</div>
                    <p className="text-indigo-800/80 mt-0.5">Mantém catálogo, equipe, custos gerais, operadores e promoters — zerando apenas quantidades e caixas.</p>
                  </div>
                </label>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setNewEventModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition">Criar Edição</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {resetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-slate-900">Restaurar dados de demonstração?</h3>
            </div>
            <p className="text-sm text-slate-600">Isso substituirá as alterações salvas localmente pelos dados originais da planilha <strong>Akatu Villa — 20/11/2026</strong>.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setResetModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button onClick={handleResetDemo} className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg">Restaurar Agora</button>
            </div>
          </div>
        </div>
      )}

      {editEventModalOpen && activeEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Editar Fechamento</h3>
              <button onClick={() => setEditEventModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEditEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Evento *</label>
                <input
                  type="text"
                  required
                  value={editEventForm.name}
                  onChange={(e) => setEditEventForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data</label>
                  <input
                    type="date"
                    value={editEventForm.date}
                    onChange={(e) => setEditEventForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Local</label>
                  <input
                    type="text"
                    value={editEventForm.venue}
                    onChange={(e) => setEditEventForm((f) => ({ ...f, venue: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditEventModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteEventModalOpen && activeEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-slate-900">Excluir este fechamento?</h3>
            </div>
            <p className="text-sm text-slate-600">
              Tem certeza que deseja excluir permanentemente o fechamento <strong>{activeEvent.name}</strong>? Essa ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteEventModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteActiveEvent}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Excluir Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 print:hidden">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.type === 'error' ? 'bg-rose-600' : 'bg-slate-900'}`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EventosSemanaisPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Carregando Eventos Semanais...</div>}>
      <ConteudoEventosSemanais />
    </Suspense>
  );
}