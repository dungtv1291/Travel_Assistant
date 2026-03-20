import { Topbar } from "@/components/layout/Topbar";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditHotelPage({ params }: Props) {
  const { id } = await params;
  return (
    <>
      <Topbar title="Edit Hotel" />
      <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/hotels" className="hover:text-slate-700">Hotels</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">#{id}</span>
      </div>
      <div className="mt-4 bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
        Hotel edit form with sub-tabs (Badges, Images, Amenities, Room Types, Reviews) — Phase 3
      </div>
    </>
  );
}
