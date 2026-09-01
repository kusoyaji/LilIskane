import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES } from "@/i18n/config";

/**
 * Sends bare paths to a locale. French is the default because that is what the
 * Moroccan market browses in; Arabic is offered explicitly rather than sniffed,
 * so an `ar` Accept-Language header from a device in Montreal doesn't override
 * a link someone was deliberately sent.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next|media|favicon|.*\\.).*)"],
};
