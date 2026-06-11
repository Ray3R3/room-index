import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import CinematicBackdrop from "@/components/CinematicBackdrop";
import { CATEGORIES, categoryLabel } from "@/data/categories";
import type { Category } from "@/data/londonRooms";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Submit a Room — The Room Index" },
      {
        name: "description",
        content:
          "Nominate a hotel room for the index. We seed the shortlist. Travellers decide what ranks.",
      },
      { property: "og:title", content: "Submit a Room — The Room Index" },
      { property: "og:description", content: "Nominate a room. We may feature it." },
    ],
  }),
  component: SubmitPage,
});

const schema = z.object({
  hotelName: z.string().min(1, "Required"),
  city: z.string().min(1, "Required"),
  roomType: z.string().min(1, "Required"),
  didStay: z.enum(["yes", "no"]),
  categories: z.array(z.string()).min(1, "Pick at least one"),
  bestForCategory: z.string().optional(),
  worstForCategory: z.string().optional(),
  rating: z.number().min(1).max(10),
  wouldBookAgain: z.enum(["yes", "no"]),
  verdict: z.string().min(1, "Required").max(140, "Max 140 characters"),
  mediaUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  instagram: z.string().optional(),
  permission: z.literal(true, { errorMap: () => ({ message: "Required" }) }),
});

type FormValues = z.infer<typeof schema>;

function SubmitPage() {
  const [done, setDone] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      hotelName: "",
      city: "London",
      roomType: "",
      didStay: "yes",
      categories: [],
      bestForCategory: "",
      worstForCategory: "",
      rating: 8,
      wouldBookAgain: "yes",
      verdict: "",
      mediaUrl: "",
      instagram: "",
      permission: false as unknown as true,
    },
  });

  if (done) {
    return (
      <CinematicBackdrop>
        <div className="mx-auto max-w-xl px-6 py-32 text-center text-white">
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            Nomination received
          </p>
          <h1
            className="mt-4"
            style={{
              fontFamily: "'Qidea','Cormorant Garamond',serif",
              fontSize: "48px",
              lineHeight: 1.05,
            }}
          >
            Thanks — we&rsquo;ll review your nomination.
          </h1>
          <p
            className="mt-6"
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontStyle: "italic",
              fontSize: "20px",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            If we feature it, we&rsquo;ll credit your handle unless you ask us not to.
          </p>
          <Link
            to="/london"
            className="mt-10 inline-block rounded-full px-7 py-3"
            style={{
              background: "#e11d48",
              color: "#fff",
              fontSize: "12px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            Back to London Index
          </Link>
        </div>
      </CinematicBackdrop>
    );
  }

  return (
    <CinematicBackdrop>
      <div className="mx-auto w-full max-w-2xl px-6 pb-24 pt-24 text-white">
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.55)",
          }}
        >
          The Room Index · Submit
        </p>
        <h1
          className="mt-3"
          style={{
            fontFamily: "'Qidea','Cormorant Garamond',serif",
            fontSize: "clamp(38px, 5vw, 56px)",
            fontWeight: 400,
            lineHeight: 1.05,
          }}
        >
          Nominate a room
        </h1>
        <p
          className="mt-3 max-w-lg"
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontStyle: "italic",
            fontSize: "20px",
            color: "rgba(255,255,255,0.78)",
          }}
        >
          Stayed somewhere worth ranking? Tell us about the room, not the trip.
        </p>

        <form
          onSubmit={form.handleSubmit(() => setDone(true))}
          className="mt-12 flex flex-col gap-7"
        >
          <Field label="Hotel name" required error={form.formState.errors.hotelName?.message}>
            <input className={inputCls} {...form.register("hotelName")} />
          </Field>
          <Field label="City" required error={form.formState.errors.city?.message}>
            <input className={inputCls} {...form.register("city")} />
          </Field>
          <Field label="Room type / name" required error={form.formState.errors.roomType?.message}>
            <input className={inputCls} placeholder="e.g. Deluxe King, Loft Suite" {...form.register("roomType")} />
          </Field>

          <Field label="Did you stay there?" required>
            <RadioRow name="didStay" form={form} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
          </Field>

          <Field
            label="Category nomination"
            required
            error={form.formState.errors.categories?.message as string}
            help="Pick every category this room genuinely competes in."
          >
            <Controller
              control={form.control}
              name="categories"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => {
                    const active = field.value.includes(c.key);
                    return (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() =>
                          field.onChange(
                            active
                              ? field.value.filter((v) => v !== c.key)
                              : [...field.value, c.key]
                          )
                        }
                        className="rounded-full px-4 py-1.5"
                        style={{
                          background: active ? "#fff" : "rgba(255,255,255,0.04)",
                          color: active ? "#0a0f14" : "rgba(255,255,255,0.85)",
                          border: `1px solid ${active ? "#fff" : "rgba(255,255,255,0.22)"}`,
                          fontSize: "12px",
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                        }}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </Field>

          <div className="grid gap-7 sm:grid-cols-2">
            <Field label="Best for category">
              <select className={inputCls} {...form.register("bestForCategory")}>
                <option value="">—</option>
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Worst for category">
              <select className={inputCls} {...form.register("worstForCategory")}>
                <option value="">—</option>
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label={`Rating: ${form.watch("rating")}/10`}>
            <Controller
              control={form.control}
              name="rating"
              render={({ field }) => (
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={field.value}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                  className="w-full accent-[#e11d48]"
                />
              )}
            />
          </Field>

          <Field label="Would you book again?">
            <RadioRow name="wouldBookAgain" form={form} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
          </Field>

          <Field label="One-line verdict" required error={form.formState.errors.verdict?.message} help={`${form.watch("verdict")?.length ?? 0}/140`}>
            <textarea
              maxLength={140}
              rows={2}
              className={inputCls}
              placeholder="The bathroom is doing more work than the bedroom."
              {...form.register("verdict")}
            />
          </Field>

          <Field label="Photo / video link" error={form.formState.errors.mediaUrl?.message}>
            <input className={inputCls} placeholder="https://…" {...form.register("mediaUrl")} />
          </Field>
          <Field label="Instagram handle">
            <input className={inputCls} placeholder="@handle" {...form.register("instagram")} />
          </Field>

          <label className="flex items-start gap-3" style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)" }}>
            <input type="checkbox" {...form.register("permission")} className="mt-1 accent-[#e11d48]" />
            <span>
              I give The Room Index permission to feature this nomination.
              {form.formState.errors.permission && (
                <span className="block text-[#fda4af]" style={{ fontSize: "11px", marginTop: "4px" }}>
                  {form.formState.errors.permission.message as string}
                </span>
              )}
            </span>
          </label>

          <button
            type="submit"
            className="mt-4 rounded-full px-8 py-3 transition hover:opacity-90"
            style={{
              background: "#e11d48",
              color: "#fff",
              fontSize: "12px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              alignSelf: "flex-start",
            }}
          >
            Submit nomination
          </button>
        </form>
      </div>
    </CinematicBackdrop>
  );
}

const inputCls =
  "w-full rounded-md bg-[rgba(255,255,255,0.04)] px-4 py-3 text-white placeholder-white/40 outline-none border border-white/15 focus:border-white/40 transition";

function Field({
  label,
  children,
  required,
  error,
  help,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
  help?: string;
}) {
  return (
    <div>
      <label
        className="mb-2 block"
        style={{
          fontSize: "11px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.7)",
        }}
      >
        {label} {required && <span style={{ color: "#e11d48" }}>*</span>}
      </label>
      {children}
      {help && (
        <p className="mt-1" style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>
          {help}
        </p>
      )}
      {error && (
        <p className="mt-1" style={{ fontSize: "11px", color: "#fda4af" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function RadioRow<T extends string>({
  name,
  form,
  options,
}: {
  name: keyof FormValues;
  form: ReturnType<typeof useForm<FormValues>>;
  options: { value: T; label: string }[];
}) {
  const value = form.watch(name) as string;
  return (
    <div className="flex gap-2">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <label
            key={o.value}
            className="cursor-pointer rounded-full px-4 py-1.5"
            style={{
              background: active ? "#fff" : "rgba(255,255,255,0.04)",
              color: active ? "#0a0f14" : "rgba(255,255,255,0.85)",
              border: `1px solid ${active ? "#fff" : "rgba(255,255,255,0.22)"}`,
              fontSize: "12px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            <input
              type="radio"
              value={o.value}
              {...form.register(name)}
              className="sr-only"
            />
            {o.label}
          </label>
        );
      })}
    </div>
  );
}
