import { LinkButton } from "@/components/v2";
import { ProjectCard } from "@/components/search/ProjectCard";
import type { ProjectListItem } from "@/data/list";
import type { Locale } from "@/i18n/config";
import { shared } from "@/content/shared";
import { projectCopy } from "@/content/projects";
import s from "./RelatedProjects.module.css";

/** Three more programmes — same city first, then the same standing — so no page is a dead end. */
export function RelatedProjects({ locale, items }: { locale: Locale; items: ProjectListItem[] }) {
  if (items.length === 0) return null;
  const c = projectCopy[locale];

  return (
    <section className={`u-shell ${s.section}`} aria-labelledby="related-title">
      <header className={s.head}>
        <div className={s.headText}>
          <p className="u-eyebrow u-enter" style={{ color: "var(--color-ochre-deep)" }}>
            {c.relatedEyebrow}
          </p>
          <h2 id="related-title" className={`u-display ${s.title}`} data-reveal="mask">
            <span className="reveal-inner">{c.relatedTitle}</span>
          </h2>
        </div>
        <div className="u-enter">
          <LinkButton href={`/${locale}/projets`} variant="outline">
            {shared[locale].allProjects}
          </LinkButton>
        </div>
      </header>

      <div className={s.grid}>
        {items.map((item) => (
          <div key={item.slug} className="u-enter">
            <ProjectCard locale={locale} item={item} sizes="(min-width: 64rem) 30rem, 92vw" />
          </div>
        ))}
      </div>
    </section>
  );
}
