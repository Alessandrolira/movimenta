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
          placeholder="Ex: Maria da Silva"
          type="text"
          id="name-benf"
          value={data.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dt-nasc">Data de Nascimento</Label>
        <Input type="date" id="dt-nasc" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cpf-benef">CPF</Label>
        <Input placeholder="Ex: 000.000.000-00" type="text" id="cpf-benef" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cep-benef">CEP</Label>
        <Input placeholder="Ex: 00000-000" type="text" id="cep-benef" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="state-benef">Estado</Label>
        <Input placeholder="Ex: São Paulo" type="text" id="state-benef" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="city-benef">Cidade</Label>
        <Input placeholder="Ex: São Paulo" type="text" id="city-benef" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nghood-benef">Bairro</Label>
        <Input placeholder="Ex: Jardins" type="text" id="nghood-benef" />
      </div>
      <div className="space-y-2 col-span-2">
        <Label htmlFor="street-benef">Logradouro</Label>
        <Input placeholder="Ex: Av. Paulista" type="text" id="street-benef" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="number-house">Número</Label>
        <Input placeholder="Ex: 1439" type="text" id="number-house" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="compl-house">Complemento</Label>
        <Input placeholder="Ex: Apto. 13" type="text" id="compl-house" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="select-dep">Dependência</Label>
        <CustomSelect
          id="select-dep"
          label={dependencySelected}
          onChange={setDependencySelected}
          options={dependencies}
          value={dependencySelected}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name-titular">Nome Titular</Label>
        <Input placeholder="Ex: Josué da Silva" type="text" id="name-titular" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="vinc-empreg">Vínculo Empregatício</Label>
        <Input type="file" id="vinc-empreg" />
      </div>
      <div>
        <Label htmlFor="files">Documentos</Label>
        <Input id="files" type="file" />
      </div>
    </div>
  );
}
