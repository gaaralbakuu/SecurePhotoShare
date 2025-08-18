import React from "react";
import { Text, View } from "react-native";

import DataReadingForm from "app/components/forms/data-reading-form";
import { usePostDataReading } from "app/http-requests/data-reading";
import { DataReadingFormModel } from "app/types/form-models/data-reading-form-models";

const ReadingsScreen = () => {
  const { sendRequest, states, result } = usePostDataReading();

  const handleSubmit = (value: DataReadingFormModel) => {
    sendRequest({
      body: value,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ margin: 8, padding: 8, backgroundColor: "#FFF" }}>
        { states.isLoading ?
          <View style={{ height: 100, justifyContent: "center", alignItems: "center" }}>
            <Text>Loading...</Text>
          </View>
          :
          <View>
            <Text style={{ marginBottom: 16 }}>Enter a Steps Value to submit:</Text>
            <DataReadingForm handleSubmit={handleSubmit} />
          </View>
        }
        { (result?.response !== undefined) &&
          <View>
            <Text style={{ marginTop: 16 }}>Response:</Text>
            <Text>{JSON.stringify(result.response, null, 3)}</Text>
          </View>
        }
      </View>
    </View>
  );
};

export default ReadingsScreen;
