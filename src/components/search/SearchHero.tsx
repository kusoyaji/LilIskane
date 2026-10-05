import Link from "next/link";
import { Figure } from "@/components/media/Figure";
import { Lattice } from "@/components/v2";
import v from "@/components/v2/v2.module.css";
import { getCity } from "@/data/cities";
import { getProject } from "@/data/projects";
import type { Project } from "@/data/types";
import type { Locale } from "@/i18n/config";
import { projectCopy } from "@/content/projects";
import s from "./search.module.css";

/**
 * Three programmes shown in the hero, largest first: a delivered programme as
 * photographed, then two renders, each captioned with its name, its city and
 * what kind of image it is. Real portfolio images only — never stock.
 */
const SHOWN = ["riad-garden-i", "oceane", "odyssee"] as const;

/**
 * /projets opening: the ink hero of the secondary pages (same type, lattice and
 * spacing as `PageHero`), with the portfolio itself in the right half rather
 * than an empty field. Each picture is a door into its programme.
 */
export function SearchHero({
  locale,
  eyebrow,
  title,
  lead,
  actions,
}: {
  locale: Locale;
  eyebrow: string;
  title: string;
  lead: string;
  actions?: React.ReactNode;
}) {
  const c = projectCopy[locale];
  const shown = SHOWN.map((slug) => getProject(slug)).filter((p): p is Project => p !== undefined);

  const note = (project: Project) =>
    project.hero.nature === "render"
      ? c.renderNote
      : project.readyNow
        ? c.photoReady
        : null;

  return (
    <section className={`${v.hero} ${v.heroInk} ${s.hero}`} data-nav-media="">
      <Lattice />
      <div className={`u-shell w-full ${s.heroGrid}`}>
        <div className={s.heroText}>
          <p className="u-eyebrow u-enter" style={{ color: "var(--color-ochre-bright)", marginBlockEnd: "1.4rem" }}>
            {eyebrow}
          </p>
          <h1 className={`u-display ${v.heroTitle}`} data-reveal="mask">
            <span className="reveal-inner">{title}</span>
          </h1>
          <p className={`u-enter ${v.heroLead}`}>{lead}</p>
          {actions && <div className={`u-enter ${v.heroActions}`}>{actions}</div>}
        </div>

        <ul className={s.heroStack}>
          {shown.map((project, index) => {
            const city = getCity(project.cityId);
            const caption = note(project);
            return (
              <li key={project.slug} className={`u-enter ${s.heroTile}`} data-step={String(index + 1)}>
                <Link href={`/${locale}/projets/${project.slug}`} className={s.heroLink}>
                  <span className={s.heroMedia}>
                    <Figure
                      ref_={project.hero}
                      locale={locale}
                      sizes={index === 0 ? "(min-width: 64rem) 30vw, 92vw" : "(min-width: 64rem) 18vw, 46vw"}
                      priority={index === 0}
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <span className={s.heroCaption}>
                    <span className={s.heroName}>
                      {project.name[locale]} <span className={s.heroCity}>· {city.name[locale]}</span>
                    </span>
                    {caption && <span className={s.heroNote}>{caption}</span>}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
