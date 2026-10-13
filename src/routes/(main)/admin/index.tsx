'use client';

import { Flexbox } from '@lobehub/ui';
import { Button, Text, toast } from '@lobehub/ui/base-ui';
import { createStaticStyles, cssVar } from 'antd-style';
import { ShieldCheck } from 'lucide-react';
import { memo, useCallback, useState } from 'react';

const styles = createStaticStyles(({ css }) => ({
  card: css`
    width: min(480px, 100%);
    padding: 28px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 16px;
    background: ${cssVar.colorBgContainer};
  `,
  field: css`
    display: flex;
    flex-direction: column;
    gap: 6px;
  `,
  input: css`
    width: 100%;
    padding: 10px 12px;
    border: 1px solid ${cssVar.colorBorder};
    border-radius: 10px;
    font: inherit;
    color: ${cssVar.colorText};
    background: ${cssVar.colorBgContainer};
  `,
  page: css`
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
  `,
}));

/**
 * Bootstrap admin gate — one-time creation of the first admin account when none
 * exists. Protected by MCIT_ADMIN_BOOTSTRAP_TOKEN (server env). After the first
 * admin exists, use normal sign-in. Do not expose the bootstrap token in the UI.
 */
const AdminBootstrapPage = memo(() => {
  const [username, setUsername] = useState('admin');
  const [email, setEmail] = useState('admin@mcit.local');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = useCallback(async () => {
    if (password.length < 12) {
      toast.error('Password must be at least 12 characters.');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    if (!token.trim()) {
      toast.error('Bootstrap token is required (from server env MCIT_ADMIN_BOOTSTRAP_TOKEN).');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/webapi/mcit/admin/bootstrap', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-mcit-bootstrap-token': token.trim(),
        },
        body: JSON.stringify({ username: username.trim(), email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Failed (${res.status})`);
      toast.success('Admin created. Sign in with that account.');
      window.location.href = '/signin';
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Bootstrap failed');
    } finally {
      setLoading(false);
    }
  }, [confirm, email, password, token, username]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Flexbox gap={16}>
          <Flexbox horizontal align="center" gap={10}>
            <ShieldCheck size={22} />
            <Text as="h1" fontSize={22} weight="bold">
              MCIT Admin setup
            </Text>
          </Flexbox>
          <Text type="secondary" fontSize={13}>
            Create the first administrator. This endpoint is disabled after an admin already
            exists, and always requires the server-side bootstrap token. Prefer rotating the
            token after use.
          </Text>
          <label className={styles.field}>
            <Text fontSize={13}>Username</Text>
            <input className={styles.input} value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <label className={styles.field}>
            <Text fontSize={13}>Email</Text>
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <Text fontSize={13}>Password (min 12)</Text>
            <input
              className={styles.input}
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <Text fontSize={13}>Confirm password</Text>
            <input
              className={styles.input}
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <Text fontSize={13}>Bootstrap token</Text>
            <input
              className={styles.input}
              type="password"
              autoComplete="off"
              placeholder="MCIT_ADMIN_BOOTSTRAP_TOKEN"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </label>
          <Button loading={loading} type="primary" onClick={() => void submit()}>
            Create admin
          </Button>
        </Flexbox>
      </div>
    </div>
  );
});

export default AdminBootstrapPage;
