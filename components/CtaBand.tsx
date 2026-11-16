import { company, cta, primaryPhone, telHref } from "@/lib/site";
import { ButtonLink, Container } from "./ui";

/** Gold call-to-action band shown above the footer. */
export function CtaBand({
  title = cta.title,
  body = cta.body,
  emailHref = `mailto:${company.email}`,
  fx = false,
}: {
  title?: string;
  body?: string;
  emailHref?: string;
  /** Premium buttons and a scroll reveal on the heading */
  fx?: boolean;
}) {
  return (
    <section aria-labelledby="cta-title" className="bg-gold text-ink">
      <Container className="flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between md:gap-12 md:py-14">
        <div className="flex max-w-xl flex-col gap-1.5" data-reveal={fx ? "up" : undefined}>
          <h2 id="cta-title" className="text-cta font-extrabold">
            {title}
          </h2>
          <p className="text-[1.0625rem]">{body}</p>
        </div>
        <div
          className="flex flex-col gap-3.5 sm:flex-row sm:flex-wrap"
          data-reveal={fx ? "stagger" : undefined}
        >
          <ButtonLink href={telHref(primaryPhone)} variant="navy" icon="phone" fx={fx}>
            Call {primaryPhone.display}
          </ButtonLink>
          <ButtonLink href={emailHref} variant="outline" icon="mail" fx={fx}>
            {cta.emailLabel}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
