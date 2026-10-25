/* eslint-disable @next/next/no-html-link-for-pages -- Full document navigation intentionally remounts protected actor context; Auth0 routes require document navigation. */
import Link from "next/link";

export default function SignInError() {
  return <main><h1>We couldn’t sign you in</h1>
    <p>Try again. If this continues, ask the pilot operator to check authentication setup.</p>
    <a href="/auth/login">Try signing in again</a><p><Link href="/">Return to BorrowBench</Link></p>
  </main>;
}
