import { Platform } from "react-native";
import LocationPickerWeb from "./LocationPicker.web";
import LocationPickerNative from "./LocationPicker.native";

const LocationPicker = Platform.OS === "web" ? LocationPickerWeb : LocationPickerNative;

export default LocationPicker;