export type DataReadingFormModel = {
  steps?: number;
};

type DataReadingFormModelKeys = keyof DataReadingFormModel;

export type DataReadingFormErrors = {
  [key in DataReadingFormModelKeys]?: string
};
