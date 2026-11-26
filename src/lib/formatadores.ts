// Formata número do banco para exibição: R$ 15.000,00
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor || 0);
}

// Máscara de digitação para campos de dinheiro: R$ 1.500,00
export function mascaraMoeda(valor: string): string {
  const digitos = valor.replace(/\D/g, '');
  if (!digitos) return '';
  const numero = Number(digitos) / 100;
  return formatarMoeda(numero);
}

// Converte "R$ 1.500,00" de volta para número (1500) para salvar no banco
export function moedaParaNumero(valor: string): number {
  const digitos = valor.replace(/\D/g, '');
  if (!digitos) return 0;
  return Number(digitos) / 100;
}

// Máscara de CNPJ: 00.000.000/0001-00
export function mascaraCNPJ(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

// Máscara de Telefone / WhatsApp: (00) 00000-0000
export function mascaraTelefone(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10) {
    return d
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return d
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

// Máscara de Data brasileira: DD/MM/AAAA
export function mascaraDataBR(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 8);
  return d
    .replace(/^(\d{2})(\d)/, '$1/$2')
    .replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
}

// Converte DD/MM/AAAA -> AAAA-MM-DD (para o Supabase)
export function dataBRParaISO(dataBR: string): string | null {
  if (!dataBR || dataBR.length !== 10) return null;
  const [dia, mes, ano] = dataBR.split('/');
  const d = Number(dia);
  const m = Number(mes);
  const a = Number(ano);
  if (m < 1 || m > 12 || d < 1 || d > 31 || a < 1900) return null;
  return `${ano}-${mes}-${dia}`;
}

// Converte AAAA-MM-DD (do Supabase) -> DD/MM/AAAA (para exibir na tela)
export function dataISOParaBR(dataISO: string | null | undefined): string {
  if (!dataISO) return '';
  const partes = dataISO.split('T')[0].split('-');
  if (partes.length !== 3) return dataISO;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// Máscara de número inteiro com ponto de milhar: 10.000
export function mascaraInteiro(valor: string): string {
  const d = valor.replace(/\D/g, '');
  if (!d) return '';
  return Number(d).toLocaleString('pt-BR');
}

export function inteiroParaNumero(valor: string): number {
  const d = valor.replace(/\D/g, '');
  return d ? Number(d) : 0;
}