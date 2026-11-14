/** Renders an email address that may only wrap after the "@". */
export function EmailText({ email }: { email: string }) {
  const [local, domain] = email.split("@");
  return (
    <>
      {local}@<wbr />
      {domain}
    </>
  );
}
