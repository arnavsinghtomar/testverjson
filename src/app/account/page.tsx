/** Account settings. */

async function getAccount() {
  const res = await fetch('/api/account', { cache: 'no-store' });
  return res.json();
}

export default async function AccountPage() {
  const account = await getAccount();
  return (
    <section>
      <h1>Account</h1>
      <dl>
        <dt>Name</dt>
        <dd>{account.name}</dd>
        <dt>Email</dt>
        <dd>{account.email}</dd>
        <dt>Phone</dt>
        <dd>{account.phone ?? 'Not given'}</dd>
        <dt>Member since</dt>
        <dd>{account.memberSince}</dd>
      </dl>
    </section>
  );
}
