import type { Person as PersonData } from "@/lib/schema";
import { asset } from "@/lib/paths";

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "")).toUpperCase();
}

/** One person in part 3 (REQ-5): portrait with its credit (REQ-12) or an initials placeholder. */
export function Person({ person, note }: { person: PersonData; note: string }) {
  const { name, portrait } = person;
  return (
    <li data-testid="person" className="flex gap-4">
      {portrait ? (
        <figure className="m-0 w-20 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- static export, pre-sized files */}
          <img
            src={asset(portrait.file)}
            alt={`Portrait of ${name}`}
            width={80}
            height={100}
            loading="lazy"
            className="h-[100px] w-20 rounded-md object-cover"
          />
          <figcaption data-small-print className="mt-1 text-xs leading-tight text-muted-foreground">
            {/* One run, not two stacked links: stacked 12 px links fail WCAG 2.2 target size (axe, 2026-10-22). */}
            <a href={portrait.sourceUrl} className="underline underline-offset-2">
              {portrait.author}
            </a>
            ,{" "}
            <a href={portrait.licenceUrl} className="underline underline-offset-2">
              {portrait.licence}
            </a>
            {/* Every portrait is cropped and resized; CC BY and CC BY-SA ask that changes be indicated. */}
            , cropped
          </figcaption>
        </figure>
      ) : (
        <span
          data-testid="portrait-placeholder"
          aria-hidden="true"
          className="grid h-[100px] w-20 shrink-0 place-items-center rounded-md bg-muted font-heading text-lg font-semibold text-muted-foreground"
        >
          {initials(name)}
        </span>
      )}
      <div>
        <h3 className="text-base font-semibold">{name}</h3>
        <p className="mt-1">{note}</p>
      </div>
    </li>
  );
}
