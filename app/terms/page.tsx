import type { Metadata } from 'next';
import Link from 'next/link';

// TODO: replace with the real contact address before going live
const CONTACT_EMAIL = 'contact@glint.com';
const LAST_UPDATED = 'September 3, 2026';

export const metadata: Metadata = {
  title: 'Terms of Service — Glint',
  description: 'The rules for using Glint.',
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-3 space-y-3 text-sm text-gray-600 dark:text-gray-300">
        {children}
      </div>
    </section>
  );
}

export default function TermsOfServicePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Terms of Service</h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Last updated: {LAST_UPDATED}
      </p>

      <Section title="1. Agreement">
        <p>
          By creating an account or using Glint, you agree to these terms. If
          you do not agree with them, please do not use the service.
        </p>
        <p>
          Glint is a social photo-sharing application built as a student
          project. It is provided free of charge.
        </p>
      </Section>

      <Section title="2. Who may use Glint">
        <p>
          You must be at least 15 years old to create an account. You must
          provide an email address you control, and the information you give us
          must be accurate.
        </p>
      </Section>

      <Section title="3. Your account">
        <p>
          You are responsible for what happens on your account and for keeping
          your password confidential. Tell us immediately at{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-(--glint) hover:opacity-80"
          >
            {CONTACT_EMAIL}
          </a>{' '}
          if you think someone else has access to it.
        </p>
        <p>
          One person, one account. Do not impersonate anyone else, and do not
          create an account on behalf of someone without their permission.
        </p>
      </Section>

      <Section title="4. Your content">
        <p>
          You keep ownership of the photos, captions and comments you publish.
          Publishing them does not transfer any ownership to us.
        </p>
        <p>
          You do grant us the permission we need to actually run the service: to
          store your content, resize your images, and display them to other
          users of Glint. This permission ends when you delete the content or
          your account.
        </p>
        <p>
          You confirm that you have the right to publish what you upload — that
          you took the photo or have permission to use it, and that the people
          it identifies agree to appear on Glint.
        </p>
      </Section>

      <Section title="5. What you may not do">
        <p>You may not use Glint to:</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            publish content that is illegal, hateful, harassing, violent, or
            sexually explicit;
          </li>
          <li>
            publish content that infringes someone else&apos;s copyright,
            trademark or privacy;
          </li>
          <li>
            harass, threaten, or repeatedly contact users against their will;
          </li>
          <li>
            send spam, advertising, chain messages or automated bulk messages;
          </li>
          <li>
            attempt to access accounts, data or parts of the system you are not
            authorised to access, or probe the service for vulnerabilities
            without our written permission;
          </li>
          <li>
            scrape the service, or use bots to create accounts, posts, likes or
            comments.
          </li>
        </ul>
      </Section>

      <Section title="6. Moderation">
        <p>
          We may remove content or suspend an account that breaks these terms,
          or that we are legally required to remove. Where it is reasonable to
          do so, we will tell you why.
        </p>
        <p>
          You can report content or a user by writing to{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-(--glint) hover:opacity-80"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>

      <Section title="7. Ending your use of Glint">
        <p>
          You can stop using Glint at any time and ask us to delete your
          account. Deleting your account removes your posts, comments, likes and
          messages.
        </p>
      </Section>

      <Section title="8. Availability and warranties">
        <p>
          Glint is a student project. It is provided &quot;as is&quot;, without
          any warranty of availability, reliability or fitness for a particular
          purpose. We may change, suspend or discontinue it at any time, and we
          do not guarantee that your content will be preserved. Keep your own
          copies of anything you care about.
        </p>
      </Section>

      <Section title="9. Liability">
        <p>
          To the extent permitted by law, we are not liable for indirect damage
          arising from your use of Glint, including loss of data or loss of
          content. Nothing in these terms limits liability that cannot be
          limited by law.
        </p>
        <p>
          Content published on Glint is the responsibility of the user who
          published it, not ours.
        </p>
      </Section>

      <Section title="10. Changes to these terms">
        <p>
          We may update these terms. The date at the top of this page shows when
          they last changed. If you keep using Glint after a change, you accept
          the updated terms.
        </p>
      </Section>

      <Section title="11. Governing law">
        <p>
          These terms are governed by French law. If a dispute cannot be
          resolved amicably, it will be brought before the competent French
          courts.
        </p>
      </Section>

      <p className="mt-10 text-sm text-gray-500 dark:text-gray-400">
        See also our{' '}
        <Link href="/privacy" className="text-(--glint) hover:opacity-80">
          Privacy Policy
        </Link>
        .
      </p>
    </main>
  );
}
