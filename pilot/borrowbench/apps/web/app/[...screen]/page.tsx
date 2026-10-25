import { Workspace } from "../components/workspace";
export const dynamic = "force-dynamic";
export default async function Screen({ params }: { params: Promise<{ screen: string[] }> }) {
  const { screen } = await params;
  return <Workspace screen={screen} />;
}
