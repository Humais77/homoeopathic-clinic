import { NextResponse } from 'next/server';
import { requireDoctor } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';

export async function GET() {
  try {
    const user = await requireDoctor();

    const doctor =
      await prisma.doctor.findUnique({
        where: {
          userId: user.id,
        },
        include: {
          appointments: {
            orderBy: [
              {
                appointmentDate: 'asc',
              },
              {
                createdAt: 'desc',
              },
            ],
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },

          consultations: {
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              treatment: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },

          notifications: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 10,
          },
        },
      });

    if (!doctor) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Doctor profile has not been created yet.',
        },
        { status: 404 }
      );
    }

    const totalAppointments =
      doctor.appointments.length;

    const pendingAppointments =
      doctor.appointments.filter(
        (appointment) =>
          appointment.status === 'PENDING'
      ).length;

    const confirmedAppointments =
      doctor.appointments.filter(
        (appointment) =>
          appointment.status === 'CONFIRMED'
      ).length;

    const completedAppointments =
      doctor.appointments.filter(
        (appointment) =>
          appointment.status === 'COMPLETED'
      ).length;

    const totalConsultations =
      doctor.consultations.length;

    const pendingConsultations =
      doctor.consultations.filter(
        (consultation) =>
          consultation.status === 'PENDING' ||
          consultation.status === 'ASSIGNED'
      ).length;

    const completedConsultations =
      doctor.consultations.filter(
        (consultation) =>
          consultation.status === 'COMPLETED'
      ).length;

    return NextResponse.json({
      success: true,

      doctor: {
        id: doctor.id,
        name: doctor.name,
        qualification: doctor.qualification,
        specialization: doctor.specialization,
        experience: doctor.experience,
        description: doctor.description,
        image: doctor.image,
        isActive: doctor.isActive,
      },

      consultations:
        doctor.consultations,

      appointments:
        doctor.appointments,

      notifications:
        doctor.notifications,

      stats: {
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,

        totalConsultations,
        pendingConsultations,
        completedConsultations,
      },
    });
  } catch (error) {
    console.error(
      'Doctor dashboard error:',
      error
    );

    if (
      error instanceof Error &&
      error.message === 'Unauthorized'
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    if (
      error instanceof Error &&
      error.message === 'Forbidden'
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Doctor access required',
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to load dashboard',
      },
      { status: 500 }
    );
  }
}