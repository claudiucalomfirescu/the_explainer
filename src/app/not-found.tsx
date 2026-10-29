import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold">Page not found</h1>
      <p className="mt-3">
        That milestone does not exist.{" "}
        <Link href="/" className="text-primary underline underline-offset-4">
          Back to the start of the timeline
        </Link>
        .
      </p>
    </div>
  );
}
