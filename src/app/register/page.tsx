'use client';

/** Create an account. */

import { useState } from 'react';

export default function RegisterPage() {
  const [done, setDone] = useState(false);

  async function submit(form: FormData) {
    await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: form.get('email'),
        password: form.get('password'),
        displayName: form.get('displayName'),
        phone: form.get('phone'),
        marketingOptIn: form.get('marketing') === 'on',
      }),
    });
    setDone(true);
  }

  return (
    <form action={submit}>
      <h1>Create an account</h1>
      <input name="displayName" placeholder="Name" />
      <input name="email" type="email" placeholder="Email" />
      <input name="phone" placeholder="Phone (optional)" />
      <input name="password" type="password" placeholder="Password" />
      <label>
        <input name="marketing" type="checkbox" /> Email me about new shows
      </label>
      <button type="submit">Sign up</button>
      {done && <p>Check your inbox.</p>}
    </form>
  );
}
