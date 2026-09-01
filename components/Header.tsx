import CategoryMenu from "./CategoryMenu";
import { HEADLINE, STORE } from "@/lib/config";
import type { CategoryMenu as Menu } from "@/lib/types";

const ACCOUNT_URL = "https://zolpo.co.il/החשבון-שלי";
const FAVOURITES_URL = "https://zolpo.co.il/המועדפים-שלי";
const CART_URL = "https://zolpo.co.il/עגלת-קניות";

/** Top strips + logo bar, rebuilt from the live zolpo.co.il homepage. */
function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d={path} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Header({
  menu,
  menuOpen = false,
}: {
  menu: Menu;
  menuOpen?: boolean;
}) {
  return (
    <header>
      {/* Utility links */}
      <div className="bg-zolpo-red text-white">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-x-5 gap-y-1 px-4 py-1.5 text-[12px]">
          <a
            href={HEADLINE.url}
            className="rounded-sm bg-white/15 px-2 py-0.5 font-semibold hover:bg-white/25"
          >
            סרטוני מוצרים והמלצות
          </a>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-1">
            {STORE.navHe.map((item) => (
              <a key={item.label} href={item.href} className="hover:underline">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Shipping promo strip */}
      <div className="bg-zolpo-red-dark text-center text-[13px] font-bold text-white">
        <p className="he mx-auto max-w-[1240px] px-4 py-1.5">{STORE.promoStripHe}</p>
      </div>

      {/* Logo + search + account icons */}
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-4 px-4 py-3">
        <a href="https://zolpo.co.il" className="flex items-center gap-2">
          <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden="true">
            <path d="M8 12h24l-3 22H11z" fill="#e21b1b" />
            <path d="M15 14v-3a5 5 0 0 1 10 0v3" fill="none" stroke="#16181d" strokeWidth="2.4" />
          </svg>
          <span className="leading-none">
            <span className="block text-2xl font-black text-zolpo-red">{STORE.nameHe}</span>
            <span className="block text-[11px] font-medium text-zolpo-ink/70">
              {STORE.taglineHe}
            </span>
          </span>
        </a>

        <CategoryMenu menu={menu} defaultOpen={menuOpen} />

        <div className="order-3 flex w-full items-center gap-0 md:order-none md:w-auto md:flex-1">
          <input
            type="search"
            placeholder={STORE.searchPlaceholderHe}
            aria-label={STORE.searchPlaceholderHe}
            className="h-10 w-full min-w-0 rounded-none border border-zolpo-line bg-white px-3 text-sm outline-none focus:border-zolpo-red"
          />
          <button
            type="button"
            aria-label="חיפוש"
            className="flex h-10 w-11 shrink-0 items-center justify-center bg-zolpo-red text-white"
          >
            <Icon path="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm5 12 4 4" />
          </button>
        </div>

        <div className="ms-auto flex items-center gap-5 text-[11px] text-zolpo-ink">
          <a href={ACCOUNT_URL} className="flex flex-col items-center gap-0.5 hover:text-zolpo-red">
            <Icon path="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8a7 7 0 0 1 14 0" />
            החשבון שלי
          </a>
          <a href={FAVOURITES_URL} className="flex flex-col items-center gap-0.5 text-zolpo-red">
            <Icon path="M12 20s-7-4.5-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.5-7 9-7 9z" />
            <span className="text-zolpo-ink hover:text-zolpo-red">המועדפים שלי</span>
          </a>
          <a href={menu.url} className="flex flex-col items-center gap-0.5 text-zolpo-red">
            <Icon path="M6 8h12l-1.4 11H7.4zM9.5 8V6a2.5 2.5 0 0 1 5 0v2" />
            <span className="text-zolpo-ink hover:text-zolpo-red">חנות</span>
          </a>
          <a href={CART_URL} className="flex flex-col items-center gap-0.5 text-zolpo-red">
            <Icon path="M4 5h2l2.2 10h9L19 8H7M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
            <span className="text-zolpo-ink hover:text-zolpo-red">
              פריטים <span dir="ltr">0</span>
            </span>
          </a>
        </div>
      </div>

      <div className="h-px bg-zolpo-line" />
    </header>
  );
}
