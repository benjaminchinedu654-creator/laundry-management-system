'use client';

import { useState, FormEvent } from 'react';
import { api } from '@/lib/api';
import { ApiException } from '@/types/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string[]>>({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwd, setPwd] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [pwdErrors, setPwdErrors] = useState<Record<string, string[]>>({});
  const [savingPwd, setSavingPwd] = useState(false);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setProfileErrors({});
    setSavingProfile(true);
    try {
      const res = await api.updateProfile(profile);
      setUser(res.user);
      toast.push('Profile updated', 'success');
    } catch (err) {
      if (err instanceof ApiException) {
        setProfileErrors(err.fieldErrors);
        toast.push(err.message, 'error');
      }
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePwd(e: FormEvent) {
    e.preventDefault();
    setPwdErrors({});
    setSavingPwd(true);
    try {
      await api.changePassword(pwd);
      setPwd({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
      toast.push('Password changed', 'success');
    } catch (err) {
      if (err instanceof ApiException) {
        setPwdErrors(err.fieldErrors);
        toast.push(err.message, 'error');
      }
    } finally {
      setSavingPwd(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-gray-600">
          Update your personal details and password.
        </p>
      </div>

      <Card>
        <CardHeader title="Personal details" />
        <CardBody>
          <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Full name"
              value={profile.full_name}
              onChange={(e) =>
                setProfile((p) => ({ ...p, full_name: e.target.value }))
              }
              error={profileErrors.full_name?.[0]}
            />
            <Input
              label="Email"
              value={user?.email || ''}
              disabled
              hint="Email can't be changed."
            />
            <Input
              label="Phone"
              value={profile.phone}
              onChange={(e) =>
                setProfile((p) => ({ ...p, phone: e.target.value }))
              }
              error={profileErrors.phone?.[0]}
            />
            <div className="sm:col-span-2">
              <Textarea
                label="Address"
                rows={2}
                value={profile.address ?? ''}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, address: e.target.value }))
                }
                error={profileErrors.address?.[0]}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" loading={savingProfile}>
                Save changes
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Change password" />
        <CardBody>
          <form onSubmit={savePwd} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Current password"
                type="password"
                value={pwd.current_password}
                onChange={(e) =>
                  setPwd((p) => ({ ...p, current_password: e.target.value }))
                }
                error={pwdErrors.current_password?.[0]}
                required
              />
            </div>
            <Input
              label="New password"
              type="password"
              value={pwd.new_password}
              onChange={(e) =>
                setPwd((p) => ({ ...p, new_password: e.target.value }))
              }
              error={pwdErrors.new_password?.[0]}
              required
            />
            <Input
              label="Confirm new password"
              type="password"
              value={pwd.new_password_confirmation}
              onChange={(e) =>
                setPwd((p) => ({
                  ...p,
                  new_password_confirmation: e.target.value,
                }))
              }
              error={pwdErrors.new_password_confirmation?.[0]}
              required
            />
            <div className="sm:col-span-2">
              <Button type="submit" loading={savingPwd}>
                Change password
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
