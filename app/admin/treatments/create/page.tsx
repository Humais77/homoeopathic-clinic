"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateTreatmentPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] =
    useState("");
  const [content, setContent] = useState("");

  const [image, setImage] = useState("");
  const [imagePublicId, setImagePublicId] =
    useState("");

  const [uploading, setUploading] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [status, setStatus] =
    useState("DRAFT");

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
          data.error || "Upload failed"
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
      alert("Treatment name is required");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        "/api/admin/treatments",
        {
          method: "POST",
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
            isActive:
              status === "PUBLISHED",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to create treatment"
        );
      }

      alert(
        "Treatment created successfully."
      );

      router.push("/admin/treatments");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#151568]">
          Create Treatment
        </h1>

        <p className="mt-2 text-gray-600">
          Add a new treatment to the website.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm"
      >
        {/* Name */}
        <div>
          <label className="mb-2 block font-semibold">
            Treatment Name
          </label>

          <input
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder="e.g. Migraine Treatment"
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-[#151568]"
          />
        </div>

        {/* Category */}
        <div>
          <label className="mb-2 block font-semibold">
            Category
          </label>

          <input
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            placeholder="e.g. Neurological"
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-[#151568]"
          />
        </div>

        {/* Image */}
        <div>
          <label className="mb-2 block font-semibold">
            Featured Image
          </label>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={uploadImage}
            className="w-full rounded-xl border p-3"
          />

          {uploading && (
            <p className="mt-2 text-sm text-gray-500">
              Uploading image...
            </p>
          )}

          {image && (
            <div className="mt-4">
              <img
                src={image}
                alt="Treatment preview"
                className="h-48 w-full rounded-xl object-cover"
              />
            </div>
          )}
        </div>

        {/* Short description */}
        <div>
          <label className="mb-2 block font-semibold">
            Short Description
          </label>

          <textarea
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            rows={4}
            placeholder="Short description shown on treatment cards..."
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-[#151568]"
          />
        </div>

        {/* Full Content */}
        <div>
          <label className="mb-2 block font-semibold">
            Treatment Content
          </label>

          <textarea
            value={content}
            onChange={(e) =>
              setContent(e.target.value)
            }
            rows={14}
            placeholder="Write the complete treatment information..."
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-[#151568]"
          />
        </div>

        {/* Status */}
        <div>
          <label className="mb-2 block font-semibold">
            Status
          </label>

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            className="w-full rounded-xl border px-4 py-3"
          >
            <option value="DRAFT">
              Draft
            </option>

            <option value="PUBLISHED">
              Published
            </option>
          </select>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/treatments"
              )
            }
            className="rounded-xl border px-6 py-3 font-semibold"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              submitting || uploading
            }
            className="rounded-xl bg-[#151568] px-6 py-3 font-semibold text-white disabled:opacity-50"
          >
            {submitting
              ? "Creating..."
              : "Create Treatment"}
          </button>
        </div>
      </form>
    </div>
  );
}