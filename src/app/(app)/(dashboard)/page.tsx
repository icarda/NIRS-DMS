import PageWrapper from "@/components/page-wrapper";
import { getDashboardKpis } from "@/features/dashboard/actions/kpis";
import DashboardClient from "./components/dashboard-client";

export const revalidate = 0;
const EMPTY_FILTERS = { crop: "", qualityLab: "", year: "", country: "" };

export default async function Dashboard() {
  const initialKpis = await getDashboardKpis(EMPTY_FILTERS);

  return (
    <PageWrapper title="Dashboard">
      <DashboardClient initialKpis={initialKpis} />
    </PageWrapper>
  );
}
