"use client";

import { Input } from "@/app/components/ui/Input/Input";
import { Label } from "@/app/components/ui/Label/Label";
import { CustomSelect } from "@/app/components/ui/Select/Select";
import { BeneficiaryTypes } from "@/app/types/Beneficiary";
import { formatCEP, formatCPF } from "@/app/utils/format";
import { useState } from "react";

interface BeneficiaryProps {
  data: BeneficiaryTypes;
  onChange: (updatedData: BeneficiaryTypes) => void;
}

export default function Beneficiary({ data, onChange }: BeneficiaryProps) {
  const [dependencySelected, setDependencySelected] = useState(
    "Selecione a dependência",
  );

  const dependencies = [
    {
      label: "Titular",
      value: "titular",
    },
    {
      label: "Cônjuge",
      value: "conjuge",
    },
    {
      label: "Filho",
      value: "filho",
    },
    {
      label: "Agregado",
      value: "agregado",
    },
  ];

  const handleChange = (field: keyof BeneficiaryTypes, value: any) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="space-y-2 md:gap-2 md:grid lg:grid-cols-3 xl:grid-cols-4 ">
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="name-benf">Nome Beneficiário</Label>
        <Input
          value={data.nome}
          onChange={(e) => handleChange("nome", e.target.value)}
          placeholder="Ex: Maria da Silva"
          type="text"
          id="name-benf"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dt-nasc">Data de Nascimento</Label>
        <Input
          value={data.dataNascimento}
          onChange={(e) => handleChange("dataNascimento", e.target.value)}
          type="date"
          id="dt-nasc"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cpf-benef">CPF</Label>
        <Input
          value={formatCPF(data.cpf)}
          onChange={(e) => handleChange("cpf", e.target.value)}
          placeholder="Ex: 000.000.000-00"
          type="text"
          id="cpf-benef"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cep-benef">CEP</Label>
        <Input
          value={formatCEP(data.endereco.cep)}
          onChange={(e) => handleChange("endereco", { ...data.endereco, cep: e.target.value })}
          placeholder="Ex: 00000-000"
          type="text"
          id="cep-benef"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="state-benef">Estado</Label>
        <Input
          value={data.endereco.estado}
          onChange={(e) => handleChange("endereco", { ...data.endereco, estado: e.target.value})}
          placeholder="Ex: São Paulo"
          type="text"
          id="state-benef"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="city-benef">Cidade</Label>
        <Input
          value={data.endereco.cidade}
          onChange={(e) => handleChange("endereco", { ...data.endereco, cidade: e.target.value})}
          placeholder="Ex: São Paulo"
          type="text"
          id="city-benef"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nghood-benef">Bairro</Label>
        <Input
          value={data.endereco.bairro}
          onChange={(e) => handleChange("endereco", { ...data.endereco, bairro: e.target.value})}
          placeholder="Ex: Jardins"
          type="text"
          id="nghood-benef"
        />
      </div>
      <div className="space-y-2 col-span-2">
        <Label htmlFor="street-benef">Logradouro</Label>
        <Input
          value={data.endereco.logradouro}
          onChange={(e) => handleChange("endereco", { ...data.endereco, logradouro: e.target.value})}
          placeholder="Ex: Av. Paulista"
          type="text"
          id="street-benef"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="number-house">Número</Label>
        <Input
          value={data.endereco.numero}
          onChange={(e) => handleChange("endereco", { ...data.endereco, numero: e.target.value})}
          placeholder="Ex: 1439"
          type="text"
          id="number-house"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="compl-house">Complemento</Label>
        <Input
          value={data.endereco.complemento}
          onChange={(e) => handleChange("endereco", { ...data.endereco, complemento: e.target.value})}
          placeholder="Ex: Apto. 13"
          type="text"
          id="compl-house"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="select-dep">Dependência</Label>
        <CustomSelect
          id="select-dep"
          label={dependencySelected}
          onChange={(e) => {
            setDependencySelected(e);
            handleChange("dependencia", e);
          }}
          options={dependencies}
          value={data.dependencia}
        />
      </div>
      <div className={`space-y-2 ${data.dependencia === "TITULAR" ? "hidden" : ""}`}>
        <Label htmlFor="name-titular">Nome Titular</Label>
        <Input
          value={data.nomeTitular}
          onChange={(e) => handleChange("nomeTitular", e.target.value)}
          placeholder="Ex: Josué da Silva"
          type="text"
          id="name-titular"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="plan">Plano</Label>
        <Input
          value={data.plano}
          onChange={(e) => handleChange("plano", e.target.value)}
          placeholder="Ex: SMART 600 QP"
          type="string"
          id="plan"
        />
      </div>
      <div>
        <Label htmlFor="files">Documentos</Label>
        <Input
          onChange={(e) =>
            handleChange("dadosComplementares", e.target.files?.[0]?.name || "")
          }
          id="files"
          type="file"
        />
      </div>
    </div>
  );
}
