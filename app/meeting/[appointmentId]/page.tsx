import { MeetingRoom } from "@/src/components/meeting/MeetingRoom";

type Props = {
  params: Promise<{
    appointmentId: string;
  }>;
};

export default async function MeetingPage({
  params,
}: Props) {
  const { appointmentId } =
    await params;

  return (
    <main className="min-h-screen bg-[#050d32]">
      <MeetingRoom
        appointmentId={
          appointmentId
        }
      />
    </main>
  );
}