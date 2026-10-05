import Link from "next/link";
import { Arrow, CtaBand, LinkButton, PageHero } from "@/components/v2";
import { company } from "@/data/company";
import { legalChrome, legalDocs, legalHref, type LegalBlock, type LegalPage } from "@/content/legal";
import { isolateRun, type Locale } from "@/i18n/config";
import { LegalToc } from "./LegalToc";
import { typeset } from "./typeset";
import s from "./legal.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The shared reading layout for the two legal pages.
 *
 * Numbered sections with stable ASCII anchors (the same in both languages, so
 * a link to #cookies works from either), a sticky contents rail on desktop,
 * and a measure that keeps long paragraphs readable. Motion is limited to the
 * section titles: body copy on a legal page should simply be there.
 */
export function LegalDocument({ locale, page }: { locale: Locale; page: LegalPage }) {
  const doc = legalDocs[page][locale];
  const chrome = legalChrome[locale];
  const other: LegalPage = page === "mentions" ? "privacy" : "mentions";
  const otherDoc = legalDocs[other][locale];

  const toc = doc.sections.map((sec, i) => ({ id: sec.id, num: pad(i + 1), title: sec.title }));

  return (
    <>
      <div data-tone="paper">
        <PageHero
          locale={locale}
          variant="paper"
          crumb={doc.title}
          eyebrow={doc.eyebrow}
          title={doc.title}
          lead={typeset(doc.lead, locale)}
        />
      </div>

      <div data-tone="paper">
        <div className={s.body}>
          <div className={`u-shell ${s.layout}`}>
            <aside className={s.aside}>
              <LegalToc label={chrome.toc} items={toc} />
            </aside>

            <article className={s.article}>
              {doc.sections.map((sec, i) => (
                <section key={sec.id} id={sec.id} tabIndex={-1} aria-labelledby={`${sec.id}-title`} className={s.sec}>
                  <header className={s.secHead}>
                    <span className={s.num} aria-hidden>
                      {pad(i + 1)}
                    </span>
                    <h2 id={`${sec.id}-title`} className={`u-display-tight ${s.secTitle}`} data-reveal="mask">
                      <span className="reveal-inner">{sec.title}</span>
                    </h2>
                  </header>
                  <div className={s.secBody}>
                    {sec.blocks.map((block, j) => (
                      <Block key={j} block={block} locale={locale} />
                    ))}
                  </div>
                </section>
              ))}
            </article>
          </div>
        </div>
      </div>

      <div data-tone="paper">
        <section className={s.closing} aria-label={chrome.nextEyebrow}>
          <div className={`u-shell ${s.closingGrid}`}>
            <div>
              <p className={`u-eyebrow ${s.nextEyebrow}`}>{chrome.nextEyebrow}</p>
              <Link href={`/${locale}/${legalHref[other]}`} className={s.nextLink}>
                <span className={`u-display ${s.nextTitle}`}>{otherDoc.title}</span>
                <span aria-hidden className={s.nextArrow}>
                  <Arrow />
                </span>
              </Link>
              <p className={s.nextLead}>{typeset(otherDoc.lead, locale)}</p>
            </div>

            <div className={s.ask}>
              <h2 className={`u-display-tight ${s.askTitle}`}>{chrome.questionsTitle}</h2>
              <p className={s.askBody}>{chrome.questionsBody}</p>
              <a href={company.phoneHref} className={s.phone} aria-label={`${chrome.callLabel} : ${company.phone}`}>
                {isolateRun(company.phone, locale)}
              </a>
              <div className={s.askActions}>
                <LinkButton href={`/${locale}/contact`} variant="outline">
                  {chrome.contactLabel}
                </LinkButton>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Paper, not ink: the band is an opaque photograph, so its ground is
          never seen — an ink tone would only darken the page a screen early,
          under the last lines of text. */}
      <div data-tone="paper">
        <CtaBand locale={locale} />
      </div>
    </>
  );
}

function Block({ block, locale }: { block: LegalBlock; locale: Locale }) {
  const t = (text: string) => typeset(text, locale);
  switch (block.kind) {
    case "p":
      return <p className={s.p}>{t(block.text)}</p>;
    case "note":
      return <p className={s.note}>{t(block.text)}</p>;
    case "list":
      return (
        <ul className={s.list}>
          {block.items.map((item) => (
            <li key={item}>{t(item)}</li>
          ))}
        </ul>
      );
    case "rows":
      return (
        <dl className={s.rows}>
          {block.rows.map((row) => (
            <div key={row.label} className={s.row}>
              <dt className="u-eyebrow">{row.label}</dt>
              <dd>{row.href ? <a href={row.href}>{t(row.value)}</a> : t(row.value)}</dd>
            </div>
          ))}
        </dl>
      );
  }
}
