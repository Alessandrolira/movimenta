import { verifyConnected } from "./utils/verifyConnected";

export default async function Home() {
  await verifyConnected("/dashboard");
}
