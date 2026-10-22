import Dashboard from "@/components/Dashboard";
import { AGENTS } from "@/lib/agents";

export default function Home() {
  return <Dashboard agents={AGENTS.map(({ id, name, office }) => ({ id, name, office }))} />;
}
