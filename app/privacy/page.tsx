import type { Metadata } from 'next';
import Link from 'next/link';

// TODO: replace with the real contact address before going live
const CONTACT_EMAIL = 'contact@example.com';
const LAST_UPDATED = 'September 3, 2026';

export const metadata: Metadata = {
  title: 'Privacy Policy — Glint',
  description: 'How Glint collects, uses and protects your personal data.',
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

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Last updated: {LAST_UPDATED}
      </p>

      <Section title="1. Who is responsible for your data">
        <p>
          Glint is a social photo-sharing application developed as a student
          project. The team operating Glint acts as the data controller for the
          personal data described below. You can reach us at{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-(--glint) hover:opacity-80"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>

      <Section title="2. What we collect">
        <p>
          <strong className="font-medium">Account data.</strong> Your username,
          email address and account creation date. If you sign up with a
          password, we store a bcrypt hash of it — never the password itself. If
          you sign in with Google, we store the identifier Google gives us
          instead of a password.
        </p>
        <p>
          <strong className="font-medium">Profile data.</strong> Your biography
          and profile picture, if you choose to add them.
        </p>
        <p>
          <strong className="font-medium">Content you publish.</strong> The
          images and captions of your posts, your comments, and the posts you
          like. Images are stored on Cloudinary (see section 5).
        </p>
        <p>
          <strong className="font-medium">Private messages.</strong> The content
          of messages you send and receive, along with the sender, the recipient
          and whether the message has been read.
        </p>
      </Section>

      <Section title="3. Why we use it, and on what legal basis">
        <p>
          We use account and profile data to create and secure your account, and
          to display your identity next to your content. The legal basis is the
          performance of our agreement with you (Article 6(1)(b) GDPR).
        </p>
        <p>
          We use your content and messages to provide the service itself —
          showing your posts in the feed, delivering your messages to their
          recipient. Same legal basis.
        </p>
        <p>
          We do not use your data for advertising, we do not profile you, and we
          do not sell your data to anyone.
        </p>
      </Section>

      <Section title="4. Cookies">
        <p>Glint uses three cookies, and none of them are for advertising:</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <code className="text-xs">session</code> — keeps you logged in. It
            is an httpOnly, SameSite=Lax cookie containing a signed token, valid
            for 7 days. Strictly necessary; without it you cannot stay signed
            in.
          </li>
          <li>
            <code className="text-xs">oauth_state</code> — protects the Google
            sign-in flow against cross-site request forgery. It lasts 10
            minutes. Strictly necessary.
          </li>
          <li>
            <code className="text-xs">transcendance-cookie-consent</code> —
            remembers your answer to the cookie banner, for 150 days.
          </li>
        </ul>
        <p>
          You can delete these cookies at any time in your browser settings.
          Removing the session cookie logs you out.
        </p>
      </Section>

      <Section title="5. Who else sees your data">
        <p>
          <strong className="font-medium">Cloudinary</strong> hosts the images
          you upload and delivers them to visitors.
        </p>
        <p>
          <strong className="font-medium">Google</strong> receives a sign-in
          request only if you choose to use Google authentication. We never send
          Google your Glint activity.
        </p>
        <p>
          Beyond these providers and our own database host, we do not share your
          personal data with third parties. We may disclose data if legally
          required to do so.
        </p>
      </Section>

      <Section title="6. Visibility of your content">
        <p>
          Posts, comments, likes, your username and your profile are visible to
          every signed-in user of Glint. Do not publish anything you would not
          want other users to see.
        </p>
        <p>
          Private messages are visible only to you and your recipient, but they
          are stored unencrypted in our database, which means the people who
          operate Glint are technically able to read them. They are not
          end-to-end encrypted — please do not use them for sensitive
          information.
        </p>
      </Section>

      <Section title="7. How long we keep it">
        <p>
          Your account data is kept for as long as your account exists. When you
          delete a post, it is removed from our database along with its likes
          and comments, and the image is deleted from Cloudinary.
        </p>
        <p>
          If your account is deleted, your posts, comments, likes and messages
          are deleted with it.
        </p>
      </Section>

      <Section title="8. Your rights">
        <p>
          Under the GDPR you have the right to access your data, to correct it,
          to have it erased, to receive a portable copy, to restrict or object
          to its processing, and to withdraw consent where processing is based
          on consent.
        </p>
        <p>
          You can edit your username, biography and profile picture yourself
          from your profile page, and delete your own posts at any time. For
          anything else — a full copy of your data, or deletion of your account
          — write to{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-(--glint) hover:opacity-80"
          >
            {CONTACT_EMAIL}
          </a>{' '}
          and we will act on your request within one month.
        </p>
        <p>
          If you believe we are mishandling your data, you may lodge a complaint
          with the CNIL, the French data protection authority, at cnil.fr.
        </p>
      </Section>

      <Section title="9. Security">
        <p>
          Passwords are hashed with bcrypt. Session tokens are signed and stored
          in httpOnly cookies, so they cannot be read by scripts running in your
          browser. Access to posts is checked on the server, not only in the
          interface.
        </p>
        <p>
          No system is perfectly secure. Glint is a student project and has not
          undergone an independent security audit.
        </p>
      </Section>

      <Section title="10. Children">
        <p>
          Glint is not intended for children under 15. If you believe a child
          under 15 has created an account, contact us and we will remove it.
        </p>
      </Section>

      <Section title="11. Changes to this policy">
        <p>
          We may update this policy. When we do, we will change the date at the
          top of this page. Significant changes will be announced in the
          application.
        </p>
      </Section>

      <p className="mt-10 text-sm text-gray-500 dark:text-gray-400">
        See also our{' '}
        <Link href="/terms" className="text-(--glint) hover:opacity-80">
          Terms of Service
        </Link>
        .
      </p>
    </main>
  );
}
