// The root route immediately sends the user to the daily logging flow, which is the fastest entry point for the MVP.
import { Redirect } from "expo-router";

export default function IndexScreen() {
  return <Redirect href="/(tabs)/today" />;
}
