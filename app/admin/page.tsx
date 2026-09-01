import AdminPanel from "@/components/AdminPanel";
import { buildPlan } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Zolpo Homepage Automation — Preview Console",
};

export default async function AdminPage() {
  const plan = await buildPlan();
  return <AdminPanel initialPlan={plan} />;
}
