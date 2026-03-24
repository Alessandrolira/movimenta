import { File, Plus, Users, X } from "lucide-react";
import { CustomSelect } from "@/app/components/ui/Select/Select";
import { Input } from "@/app/components/ui/Input/Input";
import { useState } from "react";
import Beneficiary from "@/app/components/Beneficiary/Beneficiary";
import { Label } from "../ui/Label/Label";
import { BeneficiaryTypes } from "@/app/types/Beneficiary";

export default function NewMovementCard({ onClick }: { onClick: () => void }) {
  const [movementSelect, setMovementSelect] = useState("Tipo de Movimentação");
  const [companySelect, setCompanySelect] = useState("Seleciona a empresa");
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryTypes[]>([]);

  const addBenef = () => {
    const newBenef: BeneficiaryTypes = {
      name: "",
      birth: new Date(),
      cpf: "",
      cep: "",
      state: "",
      city: "",
      neighborhood: "",
      street: "",
      number: "",
      complement: "",
      dependency: "titular",
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

  const companies = [
    {
      label: "W3G",
      value: "w3g",
    },
    {
      label: "Casa das Alianças",
      value: "casa_das_aliancas",
    },
  ];

  return (
    <div className="bg-black/20 backdrop-blur-xs absolute items-center justify-center overflow-y-scroll lg:overflow-y-auto inset-0 z-50 p-4 md:p-16">
      <div className="bg-(--bg-default) text-(--black) rounded-lg md:min-w-3/4">
        <div className="flex p-6 border-b border-black/20 justify-between items-center">
          <h2 className="font-bold text-2xl">Nova Movimentação</h2>
          <button type="button" onClick={onClick}>
            <X />
          </button>
        </div>
        <form className="p-8 space-y-6">
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
                <div className="space-y-4 bg-white/60 rounded-lg border border-gray-300 p-4 inset-shadow-sm/20">
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
                    key={benef.cpf}
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
