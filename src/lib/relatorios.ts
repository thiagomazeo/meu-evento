import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { formatarMoeda, dataISOParaBR, mascaraTelefone } from './formatadores';

// ============================================================================
// CARREGAMENTO DA LOGOMARCA PARA OS PDFs
// ============================================================================
async function carregarLogoParaPDF(): Promise<{
  dataUrl: string;
  largura: number;
  altura: number;
} | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);
      ctx.drawImage(img, 0, 0);
      const alturaDesejada = 8; // 8mm de altura no PDF
      const proporcao = img.naturalWidth / img.naturalHeight;
      resolve({
        dataUrl: canvas.toDataURL('image/png'),
        largura: alturaDesejada * proporcao,
        altura: alturaDesejada,
      });
    };
    img.onerror = () => resolve(null);
    img.src = '/logo.png';
  });
}

// ============================================================================
// FUNÇÕES AUXILIARES DE VISUALIZAÇÃO (PDF E EXCEL)
// ============================================================================
function abrirVisualizacaoPDF(doc: jsPDF, nomeArquivo: string) {
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const win = window.open('', '_blank');

  if (!win) {
    alert('Permita pop-ups no navegador para abrir a visualização do PDF.');
    return;
  }

  win.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <title>${nomeArquivo}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
        body { display: flex; flex-direction: column; height: 100vh; background: #0f172a; }
        .toolbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 20px; background: #1e293b; color: #fff; border-bottom: 1px solid #334155;
        }
        .title { font-size: 14px; font-weight: 600; }
        .actions { display: flex; gap: 10px; }
        .btn {
          padding: 8px 16px; border-radius: 8px; border: none; font-size: 13px;
          font-weight: 600; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center;
        }
        .btn-save { background: #4f46e5; color: #fff; }
        .btn-save:hover { background: #4338ca; }
        .btn-print { background: #fff; color: #0f172a; }
        .btn-print:hover { background: #e2e8f0; }
        iframe { flex: 1; width: 100%; border: none; background: #fff; }
      </style>
    </head>
    <body>
      <div class="toolbar">
        <span class="title">Visualização PDF — ${nomeArquivo}</span>
        <div class="actions">
          <a class="btn btn-save" href="${url}" download="${nomeArquivo}">Salvar como (PDF)</a>
          <button class="btn btn-print" onclick="document.getElementById('pdf-frame').contentWindow.print()">Imprimir</button>
        </div>
      </div>
      <iframe id="pdf-frame" src="${url}"></iframe>
    </body>
    </html>
  `);
  win.document.close();
}

function abrirVisualizacaoExcel(wb: XLSX.WorkBook, nomeArquivo: string, titulo: string) {
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);

  const tabelasHtml = wb.SheetNames.map((sheetName) => {
    const html = XLSX.utils.sheet_to_html(wb.Sheets[sheetName]);
    return `
      <section class="sheet">
        <h2>${sheetName}</h2>
        <div class="table-wrap">${html}</div>
      </section>
    `;
  }).join('');

  const win = window.open('', '_blank');
  if (!win) {
    alert('Permita pop-ups no navegador para abrir a visualização da planilha.');
    return;
  }

  win.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <title>${nomeArquivo}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
        body { background: #f8fafc; color: #0f172a; }
        .toolbar {
          position: sticky; top: 0; z-index: 10;
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 24px; background: #1e293b; color: #fff; border-bottom: 1px solid #334155;
        }
        .title { font-size: 14px; font-weight: 600; }
        .actions { display: flex; gap: 10px; }
        .btn {
          padding: 8px 16px; border-radius: 8px; border: none; font-size: 13px;
          font-weight: 600; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center;
        }
        .btn-save { background: #059669; color: #fff; }
        .btn-save:hover { background: #047857; }
        .btn-print { background: #fff; color: #0f172a; }
        .btn-print:hover { background: #e2e8f0; }
        main { max-width: 1100px; margin: 24px auto; padding: 0 20px 40px; }
        h1 { font-size: 20px; margin-bottom: 20px; }
        .sheet { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
        .sheet h2 { font-size: 15px; color: #4f46e5; margin-bottom: 12px; }
        .table-wrap { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        tr:first-child td { background: #f1f5f9; font-weight: 700; color: #334155; }
        td, th { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; }
        @media print {
          .toolbar { display: none !important; }
          body { background: #fff; }
          .sheet { border: none; padding: 0; page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="toolbar">
        <span class="title">Visualização Excel — ${nomeArquivo}</span>
        <div class="actions">
          <a class="btn btn-save" href="${url}" download="${nomeArquivo}">Salvar como (.xlsx)</a>
          <button class="btn btn-print" onclick="window.print()">Imprimir</button>
        </div>
      </div>
      <main>
        <h1>${titulo}</h1>
        ${tabelasHtml}
      </main>
    </body>
    </html>
  `);
  win.document.close();
}

// ============================================================================
// 1. RELATÓRIO GERAL (DASHBOARD CONSOLIDADO) — PDF
// ============================================================================
export async function exportarRelatorioGeralPDF(
  nomeProdutora: string,
  eventos: any[],
  resumos: Record<string, any>,
  totais: { faturamento: number; custos: number; taxas: number; lucro: number }
) {
  const doc = new jsPDF();
  const logo = await carregarLogoParaPDF();

  let yTitulo = 18;
  if (logo) {
    doc.addImage(logo.dataUrl, 'PNG', 14, 12, logo.largura, logo.altura);
    yTitulo = 28;
  }

  doc.setFontSize(15);
  doc.text(`Relatório Financeiro Geral — ${nomeProdutora}`, 14, yTitulo);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, yTitulo + 6);

  autoTable(doc, {
    startY: yTitulo + 13,
    head: [['Faturamento Total', 'Custos (Contratos)', 'Taxas e Impostos', 'Lucro / Prejuízo']],
    body: [[
      formatarMoeda(totais.faturamento),
      formatarMoeda(totais.custos),
      formatarMoeda(totais.taxas),
      formatarMoeda(totais.lucro),
    ]],
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] },
  });

  const linhas = eventos.map((ev) => {
    const r = resumos[ev.id] || {
      faturamento_bruto: 0,
      custo_total_contratos: 0,
      total_taxas_impostos: 0,
      lucro_ou_prejuizo: 0,
    };
    return [
      ev.nome,
      dataISOParaBR(ev.data_evento),
      ev.empresas_realizadoras?.razao_social || '-',
      formatarMoeda(r.faturamento_bruto),
      formatarMoeda(r.custo_total_contratos),
      formatarMoeda(r.total_taxas_impostos),
      formatarMoeda(r.lucro_ou_prejuizo),
    ];
  });

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [['Evento', 'Data', 'Empresa', 'Faturamento', 'Custos', 'Taxas', 'Resultado']],
    body: linhas,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [15, 23, 42] },
  });

  abrirVisualizacaoPDF(doc, `relatorio-geral-${new Date().toISOString().split('T')[0]}.pdf`);
}

// ============================================================================
// 2. RELATÓRIO GERAL (DASHBOARD CONSOLIDADO) — EXCEL (.xlsx)
// ============================================================================
export function exportarRelatorioGeralExcel(
  eventos: any[],
  resumos: Record<string, any>
) {
  const linhas = eventos.map((ev) => {
    const r = resumos[ev.id] || {
      faturamento_bruto: 0,
      custo_total_contratos: 0,
      total_taxas_impostos: 0,
      total_pago: 0,
      total_a_pagar: 0,
      lucro_ou_prejuizo: 0,
    };
    return {
      Evento: ev.nome,
      Data: dataISOParaBR(ev.data_evento),
      Local: ev.local_evento,
      Empresa: ev.empresas_realizadoras?.razao_social || '',
      Status: ev.status,
      'Faturamento Bruto': formatarMoeda(Number(r.faturamento_bruto)),
      'Custos Contratos': formatarMoeda(Number(r.custo_total_contratos)),
      'Total Pago': formatarMoeda(Number(r.total_pago)),
      'Falta Pagar': formatarMoeda(Number(r.total_a_pagar)),
      'Taxas e Impostos': formatarMoeda(Number(r.total_taxas_impostos)),
      'Lucro / Prejuízo': formatarMoeda(Number(r.lucro_ou_prejuizo)),
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(linhas);
  XLSX.utils.book_append_sheet(wb, ws, 'Resumo Eventos');

  abrirVisualizacaoExcel(
    wb,
    `relatorio-geral-${new Date().toISOString().split('T')[0]}.xlsx`,
    'Relatório Financeiro Geral'
  );
}

// ============================================================================
// 3. FECHAMENTO INDIVIDUAL DO EVENTO (BORDERÔ) — PDF
// ============================================================================
export async function exportarFechamentoEventoPDF(dados: {
  evento: any;
  bilheteria: number;
  bar: number;
  outrasReceitas: number;
  faturamentoBruto: number;
  custoContratos: number;
  totalTaxas: number;
  lucroPrejuizo: number;
  contratos: any[];
  pagamentos: any[];
  taxas: any[];
}) {
  const { evento } = dados;
  const doc = new jsPDF();
  const logo = await carregarLogoParaPDF();

  let yTitulo = 18;
  if (logo) {
    doc.addImage(logo.dataUrl, 'PNG', 14, 12, logo.largura, logo.altura);
    yTitulo = 28;
  }

  doc.setFontSize(15);
  doc.text(`Fechamento do Evento: ${evento.nome}`, 14, yTitulo);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    `Data: ${dataISOParaBR(evento.data_evento)} | Local: ${evento.local_evento} | Realização: ${evento.empresas_realizadoras?.razao_social || '-'}`,
    14,
    yTitulo + 6
  );

  autoTable(doc, {
    startY: yTitulo + 13,
    head: [['Descrição Financeira', 'Valor']],
    body: [
      ['(+) Bilheteria', formatarMoeda(dados.bilheteria)],
      ['(+) Vendas do Bar', formatarMoeda(dados.bar)],
      ['(+) Outras Receitas', formatarMoeda(dados.outrasReceitas)],
      ['(=) Faturamento Bruto Total', formatarMoeda(dados.faturamentoBruto)],
      ['(-) Custos de Contratos (Fornecedores e Artistas)', formatarMoeda(dados.custoContratos)],
      ['(-) Taxas e Impostos', formatarMoeda(dados.totalTaxas)],
      ['(=) LUCRO / PREJUÍZO LÍQUIDO', formatarMoeda(dados.lucroPrejuizo)],
    ],
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] },
  });

  if (dados.contratos.length > 0) {
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Fornecedor / Artista', 'Serviço', 'Assinatura', 'Valor']],
      body: dados.contratos.map((c) => [
        c.parceiros?.nome || '-',
        c.descricao_servico,
        c.status_assinatura.toUpperCase(),
        formatarMoeda(Number(c.valor_total)),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [15, 23, 42] },
    });
  }

  if (dados.pagamentos.length > 0) {
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Fornecedor', 'Parcela', 'Vencimento', 'Status', 'Valor']],
      body: dados.pagamentos.map((p) => [
        p.contratos?.parceiros?.nome || '-',
        p.descricao_parcela,
        dataISOParaBR(p.data_vencimento),
        p.status.toUpperCase(),
        formatarMoeda(Number(p.valor)),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [51, 65, 85] },
    });
  }

  const nomeArquivo = evento.nome.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  abrirVisualizacaoPDF(doc, `fechamento-${nomeArquivo}.pdf`);
}

// ============================================================================
// 4. FECHAMENTO INDIVIDUAL DO EVENTO — EXCEL (.xlsx) COM 4 ABAS
// ============================================================================
export function exportarFechamentoEventoExcel(dados: {
  evento: any;
  bilheteria: number;
  bar: number;
  outrasReceitas: number;
  faturamentoBruto: number;
  custoContratos: number;
  totalTaxas: number;
  lucroPrejuizo: number;
  contratos: any[];
  pagamentos: any[];
  taxas: any[];
}) {
  const wb = XLSX.utils.book_new();

  const wsResumo = XLSX.utils.json_to_sheet([
    { Item: 'Evento', Valor: dados.evento.nome },
    { Item: 'Data', Valor: dataISOParaBR(dados.evento.data_evento) },
    { Item: 'Local', Valor: dados.evento.local_evento },
    { Item: 'Bilheteria', Valor: formatarMoeda(dados.bilheteria) },
    { Item: 'Bar', Valor: formatarMoeda(dados.bar) },
    { Item: 'Outras Receitas', Valor: formatarMoeda(dados.outrasReceitas) },
    { Item: 'Faturamento Bruto', Valor: formatarMoeda(dados.faturamentoBruto) },
    { Item: 'Custos Contratos', Valor: formatarMoeda(dados.custoContratos) },
    { Item: 'Taxas e Impostos', Valor: formatarMoeda(dados.totalTaxas) },
    { Item: 'Lucro / Prejuízo Líquido', Valor: formatarMoeda(dados.lucroPrejuizo) },
  ]);
  XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

  const wsContratos = XLSX.utils.json_to_sheet(
    dados.contratos.map((c) => ({
      Tipo: c.parceiros?.tipo || '',
      'Fornecedor / Artista': c.parceiros?.nome || '',
      Responsável: c.parceiros?.responsavel_nome || '',
      WhatsApp: c.parceiros?.responsavel_whatsapp
        ? mascaraTelefone(c.parceiros.responsavel_whatsapp)
        : '',
      Serviço: c.descricao_servico,
      Assinatura: c.status_assinatura,
      'Valor Total': formatarMoeda(Number(c.valor_total)),
    }))
  );
  XLSX.utils.book_append_sheet(wb, wsContratos, 'Contratos');

  const wsPagamentos = XLSX.utils.json_to_sheet(
    dados.pagamentos.map((p) => ({
      'Fornecedor / Artista': p.contratos?.parceiros?.nome || '',
      Parcela: p.descricao_parcela,
      Vencimento: dataISOParaBR(p.data_vencimento),
      'Data Pagamento': dataISOParaBR(p.data_pagamento),
      Status: p.status,
      Valor: formatarMoeda(Number(p.valor)),
    }))
  );
  XLSX.utils.book_append_sheet(wb, wsPagamentos, 'Pagamentos');

  const wsTaxas = XLSX.utils.json_to_sheet(
    dados.taxas.map((t) => ({
      Nome: t.nome,
      Tipo: t.tipo_calculo === 'percentual' ? 'Percentual (%)' : 'Valor Fixo (R$)',
      Base: t.base_calculo,
      'Valor ou %':
        t.tipo_calculo === 'valor_fixo'
          ? formatarMoeda(Number(t.valor_ou_percentual))
          : `${String(t.valor_ou_percentual).replace('.', ',')}%`,
    }))
  );
  XLSX.utils.book_append_sheet(wb, wsTaxas, 'Taxas e Impostos');

  const nomeArquivo = dados.evento.nome.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  abrirVisualizacaoExcel(
    wb,
    `fechamento-${nomeArquivo}.xlsx`,
    `Fechamento do Evento: ${dados.evento.nome}`
  );
}