'use client';

import { useEffect, useState } from 'react';

type Consultation = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status:
    | 'PENDING'
    | 'ASSIGNED'
    | 'IN_REVIEW'
    | 'CONTACTED'
    | 'APPOINTMENT_CREATED'
    | 'COMPLETED'
    | 'REJECTED';
  createdAt: string;
  treatment: {
    id: string;
    name: string;
  };
  doctor: {
    id: string;
    name: string;
    specialization: string | null;
    isActive: boolean;
  } | null;
};

type Doctor = {
  id: string;
  name: string;
  specialization: string | null;
  isActive: boolean;
};

export default function AdminConsultationsPage() {
  const [consultations, setConsultations] =
    useState<Consultation[]>([]);

  const [doctors, setDoctors] =
    useState<Doctor[]>([]);

  const [loading, setLoading] = useState(true);

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);

      const [
        consultationsResponse,
        doctorsResponse,
      ] = await Promise.all([
        fetch('/api/admin/consultations', {
          cache: 'no-store',
        }),
        fetch('/api/admin/doctors', {
          cache: 'no-store',
        }),
      ]);

      const consultationsData =
        await consultationsResponse.json();

      const doctorsData =
        await doctorsResponse.json();

      if (!consultationsResponse.ok) {
        throw new Error(
          consultationsData.message ||
            'Failed to load consultations'
        );
      }

      if (!doctorsResponse.ok) {
        throw new Error(
          doctorsData.message ||
            'Failed to load doctors'
        );
      }

      setConsultations(
        consultationsData.consultations || []
      );

      setDoctors(
        (doctorsData.doctors || []).filter(
          (doctor: Doctor) => doctor.isActive
        )
      );
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to load data'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function assignDoctor(
    consultationId: string,
    doctorId: string
  ) {
    if (!doctorId) return;

    try {
      setUpdatingId(consultationId);

      const response = await fetch(
        `/api/admin/consultations/${consultationId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            doctorId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            'Failed to assign doctor'
        );
      }

      setConsultations((previous) =>
        previous.map((consultation) =>
          consultation.id === consultationId
            ? result.consultation
            : consultation
        )
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to assign doctor'
      );
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        Loading consultations...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Consultation Requests
          </h1>

          <div className="text-sm text-gray-500 mt-1">
  Review and assign requests
</div>
        </div>

        <div className="space-y-4">
          {consultations.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center shadow-sm">
              <p className="text-gray-500">
                No consultation requests found.
              </p>
            </div>
          ) : (
            consultations.map((consultation) => (
              <div
                key={consultation.id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {consultation.name}
                      </h2>

                      <StatusBadge
                        status={consultation.status}
                      />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <Info
                        label="Email"
                        value={consultation.email}
                      />

                      <Info
                        label="Phone"
                        value={
                          consultation.phone ||
                          'Not provided'
                        }
                      />

                      <Info
                        label="Treatment"
                        value={
                          consultation.treatment.name
                        }
                      />

                      <Info
                        label="Submitted"
                        value={new Date(
                          consultation.createdAt
                        ).toLocaleString()}
                      />
                    </div>

                    <div className="mt-5">
                      <p className="text-xs font-semibold uppercase text-gray-400">
                        Patient Concern
                      </p>

                      <p className="mt-2 rounded-xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
                        {consultation.message}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <label className="text-sm font-semibold text-gray-700">
                      Assign Doctor
                    </label>

                    <select
                      value={
                        consultation.doctor?.id || ''
                      }
                      disabled={
                        updatingId === consultation.id
                      }
                      onChange={(e) =>
                        assignDoctor(
                          consultation.id,
                          e.target.value
                        )
                      }
                      className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm"
                    >
                      <option value="">
                        Select doctor
                      </option>

                      {doctors.map((doctor) => (
                        <option
                          key={doctor.id}
                          value={doctor.id}
                        >
                          {doctor.name}
                          {doctor.specialization
                            ? ` — ${doctor.specialization}`
                            : ''}
                        </option>
                      ))}
                    </select>

                    {consultation.doctor && (
                      <p className="mt-3 text-xs text-gray-500">
                        Assigned to{' '}
                        <span className="font-medium text-gray-700">
                          {consultation.doctor.name}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-gray-700">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: Consultation['status'];
}) {
  const classes: Record<
    Consultation['status'],
    string
  > = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    ASSIGNED: 'bg-blue-100 text-blue-700',
    IN_REVIEW: 'bg-purple-100 text-purple-700',
    CONTACTED: 'bg-indigo-100 text-indigo-700',
    APPOINTMENT_CREATED:
      'bg-cyan-100 text-cyan-700',
    COMPLETED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${classes[status]}`}
    >
      {status.replaceAll('_', ' ')}
    </span>
  );
}