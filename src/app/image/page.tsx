import Link from "next/link";

export default function ImageSectionPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Image tools</h1>
      <p className="mt-2 text-foreground/70">
        <Link href="/image/batch-compressor" className="text-[#1856FF] underline">
          Batch compressor
        </Link>
      </p>
    </div>
  );
}
