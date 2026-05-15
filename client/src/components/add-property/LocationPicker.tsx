import React from "react";

type Coordinates = { latitude: number; longitude: number };

type Props = {
  city: string;
  location: string;
  pincode: string;
  value: Coordinates | null;
  onChange: (coords: Coordinates) => void;
};

export default function LocationPicker(props: Props) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Comp = require("./LocationPicker.web").default;

  return <Comp {...props} />;
}