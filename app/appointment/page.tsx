import { PageHero } from "@/src/components/sections/PageHero";
import { AppointmentBooking } from "@/src/components/sections/appointment/AppointmentBooking";
import { AppointmentBookingProvider } from "@/src/components/sections/appointment/AppointmentBookingProvider";

export const metadata = {
  title: "Book an Appointment - Heal By Nature",
  description:
    "Book a clinic visit or online consultation with Heal By Nature.",
};

type Props = {
  searchParams: Promise<{
    type?: string;
  }>;
};

export default async function AppointmentPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  const initialMeetingType =
    params.type === "online"
      ? "video"
      : "video";

  return (
    <main>
      <PageHero
        title="Book an Appointment"
        subtitle="Personalized Care"
        description="Choose your preferred consultation method, specialist, date, and time."
        backgroundImage="/images/ContactUsHero.png"
      />

      <AppointmentBookingProvider
        initialMeetingType={initialMeetingType}
      >
        <AppointmentBooking />
      </AppointmentBookingProvider>
    </main>
  );
}