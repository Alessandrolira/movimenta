import { File, Plus, Users, X } from "lucide-react";
import { CustomSelect } from "@/app/components/ui/Select/Select";
import { Input } from "@/app/components/ui/Input/Input";
import { useState } from "react";
import Beneficiary from "@/app/components/Beneficiary/Beneficiary";
import { Label } from "../ui/Label/Label";
import { BeneficiaryTypes } from "@/app/types/BeneficiaryTypes";

interface NewMovementProps {
  companies: { label: string; value: string }[];
  onClick: () => void;
}

export default function NewMovementCard({
  onClick,
  companies,
}: NewMovementProps) {
  const [movementSelect, setMovementSelect] = useState("Tipo de Movimentação");
  const [companySelect, setCompanySelect] = useState("Seleciona a empresa");
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryTypes[]>([]);

  const addBenef = () => {
    const newBenef: BeneficiaryTypes = {
      nome: "",
      dataNascimento: "",
      cpf: "",
      endereco: {
        logradouro: "",
        numero: 0,
        cep: "",
        bairro: "",
        cidade: "",
        estado: "",
        complemento: "",
      },
      dependencia: "TITULAR",
      dadosComplementares: {
        documentosBeneficiario: [],
        documentoContratacao: "",
      },
      nomeTitular: "",
      plano: "",
      tipo: "INCLUSAO",
    };

    setBeneficiaries([...beneficiaries, newBenef]);
  };

  const deleteBenef = (index: number) => {
    const updatedBeneficiaries = beneficiaries.filter((_, i) => i !== index);
    setBeneficiaries(updatedBeneficiaries);
  };

  const updateBenef = (index: number, updatedData: BeneficiaryTypes) => {
    const newBenef = [...beneficiaries];
    newBenef[index] = updatedData;
    setBeneficiaries(newBenef);
  };

  const sendMovement = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fd = new FormData(event.currentTarget);
    const idEmpresa = fd.get("name-company");
    const tipoMovimentacao = fd.get("mvm-btn");
    const descritivo = fd.get("obs");
    const beneficiarios = beneficiaries.map((benef) => ({
      nome: benef.nome,
      cpf: benef.cpf,
      dataNascimento: benef.dataNascimento,
      endereco: {
        logradouro: benef.endereco.logradouro,
        numero: benef.endereco.numero,
        cep: benef.endereco.cep,
        bairro: benef.endereco.bairro,
        cidade: benef.endereco.cidade,
        estado: benef.endereco.estado,
        complemento: benef.endereco.complemento,
      },
      dependencia: benef.dependencia,
      dadosComplementares: {
        documentosBeneficiario:
          benef.dadosComplementares.documentosBeneficiario,
        documentoContratacao: benef.dadosComplementares.documentoContratacao,
      },
      nomeTitular: benef.nomeTitular,
      plano: benef.plano,
      tipo: benef.tipo,
    }));
  };

  const options = [
    {
      label: "Inclusão",
      value: "inclusao",
    },
    {
      label: "Exclusão",
      value: "exclusao",
    },
    {
      label: "Alteração Cadastral",
      value: "alteracao",
    },
    {
      label: "2° Via da Carteirinha",
      value: "segunda_via",
    },
  ];

  return (
    <div className="bg-black/20 backdrop-blur-xs absolute items-center justify-center overflow-y-scroll lg:overflow-y-auto inset-0 z-50 p-4 md:p-16">
      <div className="bg-(--bg-default) text-(--black) rounded-lg md:min-w-3/4">
        <div className="flex p-6 border-b border-black/20 justify-between items-center">
          <h2 className="font-bold text-2xl">Nova Movimentação</h2>
          <button type="button" onClick={onClick} className="cursor-pointer">
            <X />
          </button>
        </div>
        <form className="p-8 space-y-6" onSubmit={sendMovement}>
          <div className="grid gap-2 md:grid-cols-3 md:gap-8">
            <div className="grid gap-2">
              <Label htmlFor="mvm-btn">Tipo de Movimentação</Label>
              <CustomSelect
                id="mvm-btn"
                label={movementSelect}
                onChange={setMovementSelect}
                options={options}
                value={movementSelect}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name-company">Empresa</Label>
              <CustomSelect
                id="name-company"
                label={companySelect}
                onChange={setCompanySelect}
                options={companies}
                value={companySelect}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="obs">Descritivo/Observação</Label>
              <Input
                id="obs"
                type="text"
                placeholder="Digite aqui sua observação..."
              />
            </div>
          </div>
          <div className="space-y-4 md:space-y-0 md:flex items-center justify-between">
            <h2 className="font-bold flex gap-2">
              <Users className="text-(--blue-icon)" />
              Beneficiários ({beneficiaries.length})
            </h2>
            <div className="md:flex gap-2 space-y-2 md:space-y-0">
              <label className="flex gap-2 bg-white text-sm p-2 rounded border border-gray-200 shadow-md/20 hover:bg-(--branco) active:inset-shadow-sm/20 active:shadow-none cursor-pointer transition-all duration-50">
                <File />
                <p>Importar Planilha</p>
              </label>
              <button
                type="button"
                onClick={addBenef}
                className="flex w-full md:w-auto gap-2 bg-white text-sm p-2 rounded border border-gray-200 shadow-md/20 hover:bg-(--branco) active:inset-shadow-sm/20 active:shadow-none cursor-pointer transition-all duration-50"
              >
                <Plus />
                <p>Adicionar Beneficiario</p>
              </button>
            </div>
          </div>
          {beneficiaries.length > 0 && (
            <>
              {beneficiaries.map((benef, index) => (
                <div
                  key={index}
                  className="space-y-4 bg-white/60 rounded-lg border border-gray-300 p-4 inset-shadow-sm/20"
                >
                  <div className="font-bold flex justify-between">
                    <p>Beneficiário {index + 1}</p>
                    <button
                      type="button"
                      onClick={() => deleteBenef(index)}
                      className="cursor-pointer"
                    >
                      <X />
                    </button>
                  </div>
                  <Beneficiary
                    key={`beneficiary-field-${index}`}
                    data={benef}
                    onChange={(updatedData) => updateBenef(index, updatedData)}
                  />
                </div>
              ))}
              <div className="space-y-2 md:space-y-0 md:flex gap-2 justify-end">
                <button
                  type="button"
                  className="bg-(--green-btn) border border-green-400 text-(--branco) text-lg px-2 rounded-md w-full md:w-32 hover:text-(--branco) transition-all duration-100 active:inset-shadow-green-900 active:inset-shadow-sm/60"
                >
                  Enviar
                </button>
                <button
                  type="button"
                  className="bg-(--red-btn) border border-red-200 text-(--branco) text-lg px-2 rounded-md w-full md:w-32 cursor-pointer hover:text-(--branco) active:inset-shadow-sm/60 active:inset-shadow-red-900  transition-all duration-100"
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
