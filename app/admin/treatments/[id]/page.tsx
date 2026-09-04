"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

type Treatment = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  description: string | null;
  content: string | null;
  image: string | null;
  imagePublicId: string | null;
  status: string;
  isActive: boolean;
};

export default function EditTreatmentPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [treatment, setTreatment] =
    useState<Treatment | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] =
    useState("");
  const [description, setDescription] =
    useState("");
  const [content, setContent] =
    useState("");

  const [image, setImage] = useState("");
  const [imagePublicId, setImagePublicId] =
    useState("");

  const [status, setStatus] =
    useState("DRAFT");

  const [isActive, setIsActive] =
    useState(true);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    if (!id) return;

    async function loadTreatment() {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/admin/treatments/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load treatment"
          );
        }

        const item = data.treatment;

        setTreatment(item);

        setName(item.name || "");
        setCategory(item.category || "");
        setDescription(
          item.description || ""
        );
        setContent(item.content || "");

        setImage(item.image || "");
        setImagePublicId(
          item.imagePublicId || ""
        );

        setStatus(item.status);
        setIsActive(item.isActive);
      } catch (error) {
        console.error(error);

        alert(
          error instanceof Error
            ? error.message
            : "Failed to load treatment"
        );

        router.push("/admin/treatments");
      } finally {
        setLoading(false);
      }
    }

    loadTreatment();
  }, [id, router]);

  async function uploadImage(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        "/api/uploads/treatment",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Image upload failed"
        );
      }

      setImage(data.url);
      setImagePublicId(data.publicId);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Image upload failed"
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    if (!name.trim()) {
      alert(
        "Treatment name is required."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `/api/admin/treatments/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name,
            category,
            description,
            content,
            image,
            imagePublicId,
            status,
            isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update treatment"
        );
      }

      alert(
        "Treatment updated successfully."
      );

      router.push("/admin/treatments");
      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border bg-white p-8 text-center">
          Loading treatment...
        </div>
      </div>
    );
  }

  if (!treatment) {
    return (
      <div className="p-6">
        Treatment not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#151568]">
              Edit Treatment
            </h1>

            <p className="mt-2 text-gray-600">
              Update treatment information,
              image, content and publication
              status.
            </p>
          </div>

          <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold">
            {treatment.status}
          </span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm"
      >
        {/* Treatment Name */}
        <div>
          <label className="mb-2 block font-semibold text-gray-800">
            Treatment Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder="e.g. Migraine Treatment"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#151568] focus:ring-2 focus:ring-[#151568]/10"
          />
        </div>

        {/* Category */}
        <div>
          <label className="mb-2 block font-semibold text-gray-800">
            Category
          </label>

          <input
            type="text"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            placeholder="e.g. Neurological"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#151568] focus:ring-2 focus:ring-[#151568]/10"
          />
        </div>

        {/* Image */}
        <div>
          <label className="mb-2 block font-semibold text-gray-800">
            Featured Image
          </label>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={uploadImage}
            className="w-full rounded-xl border border-gray-300 p-3"
          />

          <p className="mt-2 text-xs text-gray-500">
            JPG, PNG or WEBP. Maximum 5MB.
          </p>

          {uploading && (
            <div className="mt-3 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
              Uploading image to
              Cloudinary...
            </div>
          )}

          {image && (
            <div className="relative mt-5 h-64 w-full overflow-hidden rounded-2xl border">
              <Image
                src={image}
                alt={name || "Treatment"}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block font-semibold text-gray-800">
            Short Description
          </label>

          <textarea
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            rows={5}
            placeholder="Short description displayed on treatment cards..."
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#151568] focus:ring-2 focus:ring-[#151568]/10"
          />
        </div>

        {/* Full Content */}
        <div>
          <label className="mb-2 block font-semibold text-gray-800">
            Full Treatment Content
          </label>

          <textarea
            value={content}
            onChange={(e) =>
              setContent(e.target.value)
            }
            rows={16}
            placeholder="Write the complete treatment information..."
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#151568] focus:ring-2 focus:ring-[#151568]/10"
          />

          <p className="mt-2 text-xs text-gray-500">
            This content appears on the
            treatment detail page.
          </p>
        </div>

        {/* Status */}
        <div>
          <label className="mb-2 block font-semibold text-gray-800">
            Publication Status
          </label>

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none"
          >
            <option value="DRAFT">
              Draft
            </option>

            <option value="PENDING_REVIEW">
              Pending Review
            </option>

            <option value="PUBLISHED">
              Published
            </option>

            <option value="REJECTED">
              Rejected
            </option>

            <option value="ARCHIVED">
              Archived
            </option>
          </select>
        </div>

        {/* Active */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) =>
                setIsActive(
                  e.target.checked
                )
              }
              className="h-5 w-5"
            />

            <div>
              <div className="font-semibold text-gray-800">
                Active Treatment
              </div>

              <p className="text-sm text-gray-500">
                Published treatments must
                also be active to appear on
                the public website.
              </p>
            </div>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap justify-end gap-3 border-t pt-6">
          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/treatments"
              )
            }
            className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              saving || uploading
            }
            className="rounded-xl bg-[#151568] px-7 py-3 font-semibold text-white transition hover:bg-[#10104f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}