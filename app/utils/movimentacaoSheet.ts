import ExcelJS from "exceljs";
import { BeneficiaryTypes } from "@/app/types/BeneficiaryTypes";

const TIPOS = [
  "INCLUSAO",
  "EXCLUSAO",
  "ALTERACAO_DE_DADOS_CADASTRAIS",
  "SEGUNDA_VIA_DE_CARTEIRINHA",
];
const DEPENDENCIAS = ["TITULAR", "CONJUGE", "FILHO", "AGREGADO"];

const COLUMNS: { key: string; header: string; width: number; obrigatorio: boolean }[] = [
  { key: "tipoMovimentacao", header: "Tipo de Movimentacao",        width: 36, obrigatorio: true  },
  { key: "nome",             header: "Nome Beneficiario",           width: 32, obrigatorio: true  },
  { key: "cpf",              header: "CPF",                         width: 18, obrigatorio: true  },
  { key: "dataNascimento",   header: "Data de Nascimento",          width: 22, obrigatorio: false },
  { key: "dependencia",      header: "Dependencia",                 width: 20, obrigatorio: false },
  { key: "nomeTitular",      header: "Nome do Titular",             width: 30, obrigatorio: false },
  { key: "planoAtual",       header: "Plano",                       width: 20, obrigatorio: false },
  { key: "cep",              header: "CEP",                         width: 14, obrigatorio: false },
  { key: "logradouro",       header: "Logradouro",                  width: 28, obrigatorio: false },
  { key: "numero",           header: "Numero",                      width: 12, obrigatorio: false },
  { key: "complemento",      header: "Complemento",                 width: 20, obrigatorio: false },
  { key: "bairro",           header: "Bairro",                      width: 20, obrigatorio: false },
  { key: "cidade",           header: "Cidade",                      width: 20, obrigatorio: false },
  { key: "estado",           header: "Estado",                      width: 10, obrigatorio: false },
  { key: "observacao",       header: "Observacao",                  width: 30, obrigatorio: false },
];

// Cor azul principal do sistema
const COR_HEADER_OBRIGATORIO = "FF1E40AF"; // azul escuro
const COR_HEADER_OPCIONAL    = "FF3B82F6"; // azul claro
const COR_TEXTO_HEADER       = "FFFFFFFF"; // branco

export async function downloadModeloSheet() {
  const wb = new ExcelJS.Workbook();

  // Aba oculta com os valores das listas
  const wsListas = wb.addWorksheet("Listas", { state: "veryHidden" });
  wsListas.addRow(TIPOS);
  wsListas.addRow(DEPENDENCIAS);

  const ws = wb.addWorksheet("Movimentacoes");

  // Colunas e larguras
  ws.columns = COLUMNS.map((c) => ({ key: c.key, width: c.width }));

  // Linha de cabeçalho
  const headerRow = ws.addRow(COLUMNS.map((c) => c.header));
  headerRow.height = 22;

  headerRow.eachCell((cell, colNum) => {
    const col = COLUMNS[colNum - 1];
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: col.obrigatorio ? COR_HEADER_OBRIGATORIO : COR_HEADER_OPCIONAL },
    };
    cell.font = {
      bold: true,
      color: { argb: COR_TEXTO_HEADER },
      size: 11,
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FFBFDBFE" } },
    };
  });

  // Data validation — listas suspensas nas colunas A e E (linhas 2-1001)
  // Tipo de Movimentacao (coluna A)
  for (let row = 2; row <= 1001; row++) {
    const cell = ws.getCell(row, 1);
    cell.dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: [`Listas!$A$1:$D$1`],
      showErrorMessage: true,
      errorStyle: "stop",
      errorTitle: "Valor invalido",
      error: "Selecione um tipo valido na lista suspensa.",
    };
  }

  // Dependencia (coluna E)
  for (let row = 2; row <= 1001; row++) {
    const cell = ws.getCell(row, 5);
    cell.dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [`Listas!$A$2:$D$2`],
      showErrorMessage: true,
      errorStyle: "stop",
      errorTitle: "Valor invalido",
      error: "Selecione uma dependencia valida na lista suspensa.",
    };
  }

  // Formatar CEP (col 8) e CPF (col 3) como texto para preservar zeros à esquerda
  const colsTexto = [3, 8]; // CPF, CEP
  for (const colNum of colsTexto) {
    for (let row = 2; row <= 1001; row++) {
      ws.getCell(row, colNum).numFmt = "@";
    }
  }

  // Congelar linha do cabeçalho
  ws.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];

  // Gerar buffer e disparar download no browser
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "modelo_movimentacao.xlsx";
  a.click();
  URL.revokeObjectURL(url);
}

function normalizeStr(s: string) {
  return s?.toString().trim().toUpperCase().replace(/\s+/g, "_") ?? "";
}

function padCEP(raw: string): string {
  if (!raw) return "";
  const digits = raw.toString().replace(/\D/g, "");
  return digits.padStart(8, "0");
}

function toISODate(raw: string): string {
  if (!raw) return "";
  const str = raw.toString().trim();
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const [d, m, y] = str.split("/");
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  return str;
}

export function parseMovimentacaoSheet(file: File): Promise<BeneficiaryTypes[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const buffer = e.target!.result as ArrayBuffer;
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(buffer);

        const ws = wb.getWorksheet("Movimentacoes") ?? wb.worksheets[0];
        if (!ws) throw new Error("Aba 'Movimentacoes' nao encontrada na planilha.");

        const rows: BeneficiaryTypes[] = [];
        const headerRow = ws.getRow(1);
        const headerMap: Record<string, number> = {};
        headerRow.eachCell((cell, colNum) => {
          headerMap[cell.text.toString().trim()] = colNum;
        });

        const get = (row: ExcelJS.Row, header: string): string => {
          const col = headerMap[header];
          if (!col) return "";
          const cell = row.getCell(col);
          return cell.text?.toString().trim() ?? "";
        };

        ws.eachRow((row, rowNum) => {
          if (rowNum === 1) return; // pula cabeçalho

          const tipo = normalizeStr(get(row, "Tipo de Movimentacao"));
          if (!tipo) return; // linha vazia

          if (!TIPOS.includes(tipo)) {
            throw new Error(
              `Linha ${rowNum}: tipo invalido "${tipo}". Use: ${TIPOS.join(", ")}`
            );
          }

          const dep = normalizeStr(get(row, "Dependencia")) || "TITULAR";
          const validDep = DEPENDENCIAS.includes(dep) ? dep : "TITULAR";

          rows.push({
            nome: get(row, "Nome Beneficiario"),
            cpf: get(row, "CPF"),
            dataNascimento: toISODate(get(row, "Data de Nascimento")),
            dependencia: validDep as BeneficiaryTypes["dependencia"],
            nomeTitular: get(row, "Nome do Titular"),
            planoAtual: get(row, "Plano"),
            tipoMovimentacao: tipo as BeneficiaryTypes["tipoMovimentacao"],
            observacao: get(row, "Observacao"),
            status: "PENDENTE",
            endereco: {
              cep: padCEP(get(row, "CEP")),
              logradouro: get(row, "Logradouro"),
              numero: get(row, "Numero") || "0",
              complemento: get(row, "Complemento"),
              bairro: get(row, "Bairro"),
              cidade: get(row, "Cidade"),
              estado: get(row, "Estado"),
            },
            dadosComplementares: {
              documentosBeneficiario: [],
              documentosEmpresa: [],
            },
          });
        });

        if (rows.length === 0) {
          throw new Error("A planilha esta vazia ou sem dados alem do cabecalho.");
        }

        resolve(rows);
      } catch (err: any) {
        reject(new Error(err?.message ?? "Erro ao processar a planilha."));
      }
    };
    reader.onerror = () => reject(new Error("Erro ao ler o arquivo."));
    reader.readAsArrayBuffer(file);
  });
}
