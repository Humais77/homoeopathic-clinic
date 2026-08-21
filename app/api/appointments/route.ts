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
      timeSlot,
      concerns,
    } = body;

    // Basic validation
    if (
      !name ||
      !email ||
      !meetingType ||
      !appointmentDate ||
      !timeSlot ||
      !concerns
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill in all required fields.",
        },
        { status: 400 }
      );
    }

    // Validate meeting type
    if (!["clinic", "online"].includes(meetingType)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid meeting type.",
        },
        { status: 400 }
      );
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        meetingType,
        appointmentDate: new Date(appointmentDate),
        timeSlot,
        concerns: concerns.trim(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Appointment request submitted successfully.",
        appointment: {
          id: appointment.id,
          status: appointment.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Appointment creation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while booking the appointment.",
      },
      { status: 500 }
    );
  }
}