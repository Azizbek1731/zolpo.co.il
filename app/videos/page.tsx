import Link from "next/link";

/** Placeholder target for the new headline link (VIDEOS_PAGE_URL). */
export default function VideosPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-extrabold text-zolpo-red">
        עמוד סרטונים אמיתיים
      </h1>
      <p className="text-sm text-zolpo-ink/70">
        זהו עמוד דמו. בהגדרות המערכת ניתן להצביע על כתובת העמוד האמיתי בחנות
        באמצעות המשתנה <span dir="ltr" className="font-latin">VIDEOS_PAGE_URL</span>.
      </p>
      <Link href="/" className="text-sm font-semibold text-zolpo-red hover:underline">
        ← חזרה לעמוד הבית
      </Link>
    </main>
  );
}
