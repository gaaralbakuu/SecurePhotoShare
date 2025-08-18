import { DataReadingFormModel, DataReadingFormErrors } from "app/types/form-models/data-reading-form-models";
import React, { useEffect, useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

type Props = {
  handleSubmit: (value: DataReadingFormModel) => void;
  initialValues?: DataReadingFormModel;
};

const defaultInitialValues: DataReadingFormModel = {
  steps: undefined,
};

const validateForm = (values: DataReadingFormModel): DataReadingFormErrors => {
  const errors: DataReadingFormErrors = {};
  if (values.steps === undefined || values.steps === null) {
    errors.steps = "Steps is required";
  } else if (Number.isNaN(values.steps)) {
    errors.steps = "Steps must be a number";
  } else if (values.steps < 0 || values.steps > 500) {
    errors.steps = "Steps must be between 0 and 500";
  }
  return errors;
};

const DataReadingForm = ({ handleSubmit, initialValues = defaultInitialValues }: Props) => {
  const [formValues, setFormValues] = useState<DataReadingFormModel>(initialValues);
  const [validationErrors, setValidationErrors] = useState<DataReadingFormErrors>({});
  useEffect(() => {
    setValidationErrors(validateForm(formValues));
  }, [formValues]);

  return (
    <View>
      <TextInput
        placeholder="Steps"
        // value={formValues.steps.toString()}
        onChangeText={(newText: string) => {
          const steps = parseInt(newText, 10);
          setFormValues({ ...formValues, steps });
        }}
        keyboardType="numeric"
        style={{ padding: 8, backgroundColor: "#DDD" }}
      />
      {validationErrors.steps && <Text style={{ fontStyle: "italic", fontSize: 10 }}>{validationErrors.steps}</Text>}
      <View style={{ height: 16 }} />
      <Button
        title="Submit"
        onPress={() => {
          handleSubmit(formValues);
        }}
      />
    </View>
  );
};

export default DataReadingForm;
