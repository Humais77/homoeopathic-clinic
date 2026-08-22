import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/src/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      meetingType,
      appointmentDate,
      appointmentTime,
      concerns,
      doctorId,
    } = body;

    // =====================================================
    // BASIC VALIDATION
    // =====================================================

    if (
      !name ||
      !email ||
      !meetingType ||
      !appointmentDate ||
      !appointmentTime ||
      !concerns ||
      !doctorId
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill in all required fields.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // VALIDATE MEETING TYPE
    // =====================================================

    if (!["clinic", "online"].includes(meetingType)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid meeting type.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // VALIDATE DATE
    // =====================================================

    const parsedAppointmentDate = new Date(
      appointmentDate
    );

    if (Number.isNaN(parsedAppointmentDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid appointment date.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // CHECK DOCTOR EXISTS
    // =====================================================

    const doctor = await prisma.doctor.findUnique({
      where: {
        id: doctorId,
      },
    });

    if (!doctor) {
      return NextResponse.json(
        {
          success: false,
          message: "The selected doctor could not be found.",
        },
        { status: 404 }
      );
    }

    // =====================================================
    // CREATE APPOINTMENT
    // =====================================================

    const appointment = await prisma.appointment.create({
      data: {
        name: name.trim(),

        email: email.trim(),

        meetingType,

        appointmentDate: parsedAppointmentDate,

        appointmentTime: appointmentTime.trim(),

        concerns: concerns.trim(),

        doctorId: doctor.id,
      },
    });

    // =====================================================
    // RESPONSE
    // =====================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Appointment request submitted successfully.",

        appointment: {
          id: appointment.id,

          status: appointment.status,

          name: appointment.name,

          email: appointment.email,

          meetingType: appointment.meetingType,

          appointmentDate:
            appointment.appointmentDate,

          appointmentTime:
            appointment.appointmentTime,

          concerns: appointment.concerns,

          doctorId: appointment.doctorId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Appointment creation error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while booking the appointment.",
      },
      { status: 500 }
    );
  }
}