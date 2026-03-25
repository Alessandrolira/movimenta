"use client";

import { Input } from "@/app/components/ui/Input/Input";
import { Label } from "@/app/components/ui/Label/Label";
import { CustomSelect } from "@/app/components/ui/Select/Select";
import { BeneficiaryTypes } from "@/app/types/Beneficiary";
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
          value={data.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Ex: Maria da Silva"
          type="text"
          id="name-benf"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dt-nasc">Data de Nascimento</Label>
        <Input
          value={data.birth}
          onChange={(e) => handleChange("birth", e.target.value)}
          type="date"
          id="dt-nasc"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cpf-benef">CPF</Label>
        <Input
          value={data.cpf}
          onChange={(e) => handleChange("cpf", e.target.value)}
          placeholder="Ex: 000.000.000-00"
          type="text"
          id="cpf-benef"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cep-benef">CEP</Label>
        <Input
          value={data.cep}
          onChange={(e) => handleChange("cep", e.target.value)}
          placeholder="Ex: 00000-000"
          type="text"
          id="cep-benef"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="state-benef">Estado</Label>
        <Input
          value={data.state}
          onChange={(e) => handleChange("state", e.target.value)}
          placeholder="Ex: São Paulo"
          type="text"
          id="state-benef"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="city-benef">Cidade</Label>
        <Input
          value={data.city}
          onChange={(e) => handleChange("city", e.target.value)}
          placeholder="Ex: São Paulo"
          type="text"
          id="city-benef"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nghood-benef">Bairro</Label>
        <Input
          value={data.neighborhood}
          onChange={(e) => handleChange("neighborhood", e.target.value)}
          placeholder="Ex: Jardins"
          type="text"
          id="nghood-benef"
        />
      </div>
      <div className="space-y-2 col-span-2">
        <Label htmlFor="street-benef">Logradouro</Label>
        <Input
          value={data.street}
          onChange={(e) => handleChange("street", e.target.value)}
          placeholder="Ex: Av. Paulista"
          type="text"
          id="street-benef"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="number-house">Número</Label>
        <Input
          value={data.number}
          onChange={(e) => handleChange("number", e.target.value)}
          placeholder="Ex: 1439"
          type="text"
          id="number-house"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="compl-house">Complemento</Label>
        <Input
          value={data.complement}
          onChange={(e) => handleChange("complement", e.target.value)}
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
            handleChange("dependency", e);
          }}
          options={dependencies}
          value={data.dependency}
        />
      </div>
      <div className={`space-y-2 ${data.dependency === "titular" ? "hidden" : ""}`}>
        <Label htmlFor="name-titular">Nome Titular</Label>
        <Input
          value={data.titularName}
          onChange={(e) => handleChange("titularName", e.target.value)}
          placeholder="Ex: Josué da Silva"
          type="text"
          id="name-titular"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="plan">Plano</Label>
        <Input
          value={data.plan}
          onChange={(e) => handleChange("plan", e.target.value)}
          placeholder="Ex: SMART 600 QP"
          type="string"
          id="plan"
        />
      </div>
      <div>
        <Label htmlFor="files">Documentos</Label>
        <Input
          onChange={(e) =>
            handleChange("docs", e.target.files?.[0]?.name || "")
          }
          id="files"
          type="file"
        />
      </div>
    </div>
  );
}
