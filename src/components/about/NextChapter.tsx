import { Figure } from "@/components/media/Figure";
import { LinkButton } from "@/components/v2";
import { about } from "@/content/about";
import { getProject } from "@/data/projects";
import { isolateRun, type Locale } from "@/i18n/config";
import s from "./about.module.css";

/**
 * The page after the last date: the history ends on the programme being
 * launched now, Riad Garden II, full-bleed. It is a render, so it carries the
 * non-contractual note in its corner; the delivery year is read from the
 * project record, not typed.
 *
 * Structurally it is also the hinge out of the dark chronology: the ground
 * turns back to limestone behind this photograph rather than behind text.
 */
export function NextChapter({ locale }: { locale: Locale }) {
  const t = about[locale].next;
  const project = getProject("riad-garden-ii");
  if (!project) return null;
  const media = project.gallery.find((m) => m.key === "rg2_Ext_Cam_c1_jardin_1") ?? project.hero;

  return (
    <section className={`${s.band} ${s.bandNext}`} data-nav-media>
      <div className={s.bandMedia} data-parallax="0.25">
        <Figure ref_={media} locale={locale} sizes="100vw" className="h-full w-full object-cover" />
      </div>
      <div aria-hidden className={s.bandScrim} />
      {media.nature === "render" && <p className={s.renderNote}>{t.renderNote}</p>}

      <div className={`u-shell ${s.nextInner}`}>
        <p className="u-eyebrow u-enter" style={{ color: "var(--color-ochre-bright)" }}>
          {t.eyebrow}
        </p>
        <h2 className={`u-display ${s.nextTitle}`} data-reveal="mask">
          <span className="reveal-inner">{t.title}</span>
        </h2>
        <p className={`u-enter ${s.nextBody}`}>{t.body}</p>
        <div className="u-enter">
          <LinkButton href={`/${locale}/projets/${project.slug}`} variant="light">
            {t.cta}
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
