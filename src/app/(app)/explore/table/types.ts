export type SearchParams = {
  [key: string]: string | string[] | undefined;
};

export type DatePreset = {
  label: string;
  from: Date;
  to: Date;
  shortcut: string;
};

export type Option = {
  label: string;
  value: string;
};

export type Input = {
  type: "input";
  options?: Option[];
};

export type Checkbox = {
  type: "checkbox";
  options?: Option[];
};

export type Slider = {
  type: "slider";
  min: number;
  max: number;
  // if options is undefined, we will provide all the steps between min and max
  options?: Option[];
  unit: string;
};

export type Timerange = {
  type: "timerange";
  options?: Option[]; // required for TS
};

export type Base<TData> = {
  label: string;
  value: keyof TData;
  /**
   * Defines if the accordion in the filter bar is open by default
   */
  defaultOpen?: boolean;
};

export type DataTableCheckboxFilterField<TData> = Base<TData> & Checkbox;
export type DataTableSliderFilterField<TData> = Base<TData> & Slider;
export type DataTableInputFilterField<TData> = Base<TData> & Input;
export type DataTableTimerangeFilterField<TData> = Base<TData> & Timerange;

export type DataTableFilterField<TData> =
  | DataTableCheckboxFilterField<TData>
  | DataTableSliderFilterField<TData>
  | DataTableInputFilterField<TData>
  | DataTableTimerangeFilterField<TData>;

type AdditionalMetadata = {
  [key: string]: string | number | boolean | null;
};

export type Trial = {
  id: number;
  name: string;
  plantingDate: string;
  soilType: string;
  irrigation: boolean;
  location: string;
  latitude: string;
  longitude: string;
  additionalMetadata: AdditionalMetadata;
  cropId: number;
  species: string;
  fertilizers: {
    id: number;
    type: string;
    amount: number;
  }[];
  createdAt: string;
  updatedAt: string;
  crop: { name: string; id: number };
};

export type ProductType = {
  id: number;
  name: string;
  cropId: number;
  createdAt: string;
  updatedAt: string;
};

export type QualityLab = {
  id: number;
  centerId: number;
  name: string;
  location: string;
  country: string;
  createdAt: string;
  updatedAt: string;
};

export type NirModel = {
  id: number;
  name: string;
  type: string;
  wavelengthRange: string;
  resolution: string;
  manufacturer: string;
  createdAt: string;
  updatedAt: string;
};

export type PhysiologicalStage = {
  id: number;
  name: string;
  cropId: number;
  createdAt: string;
  updatedAt: string;
};

export type Study = {
  id: number;
  trialId: number;
  studyCode: string;
  productTypeId: number;
  program: string;
  nirModelId: number;
  requesterName: string | null;
  requesterEmail: string | null;
  sampleDate: string;
  physiologicalStageId: number;
  additionalMetadata: {
    [key: string]: string | number | null;
  };
  qualityLabId: number;
  createdAt: string;
  updatedAt: string;
  trial: Trial;
  productType: ProductType;
  qualityLab: QualityLab;
  nirModel: NirModel;
  physiologicalStage: PhysiologicalStage;
};
