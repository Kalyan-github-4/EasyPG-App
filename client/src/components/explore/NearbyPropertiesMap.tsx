import { Platform } from "react-native";
import NearbyPropertiesMapWeb from "./NearbyPropertiesMap.web";
import NearbyPropertiesMapNative from "./NearbyPropertiesMap.native";

const NearbyPropertiesMap =
  Platform.OS === "web" ? NearbyPropertiesMapWeb : NearbyPropertiesMapNative;

export default NearbyPropertiesMap;
