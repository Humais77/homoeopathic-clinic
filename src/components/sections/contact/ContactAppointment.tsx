import { CONTACT_APPOINTMENT } from "@/src/lib/constants";
import { ContactAppointmentClient } from "./ContactAppointmentClient";

export function ContactAppointment() {
  return (
    <section className="bg-white pb-10 md:pb-14">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="rounded-[22px] border border-gray-300 bg-white px-4 py-7 shadow-sm md:px-6 md:py-8">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-[#10105c] md:text-4xl">
              {CONTACT_APPOINTMENT.title}
            </h2>
          </div>

          <ContactAppointmentClient
            meetingTypes={CONTACT_APPOINTMENT.meetingTypes}
            specialist={CONTACT_APPOINTMENT.specialist}
            slots={CONTACT_APPOINTMENT.slots}
            form={CONTACT_APPOINTMENT.form}
          />
        </div>
      </div>
    </section>
  );
}