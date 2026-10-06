'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { User } from '@/types/user';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardBody } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/format';
import { useDebounce } from '@/hooks/useDebounce';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState({ page: 1, per_page: 15, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 400);

  const load = (page = 1) => {
    setLoading(true);
    api
      .adminListUsers({ page, per_page: 15, search: debounced || undefined })
      .then((res) => {
        setUsers(res.users);
        setMeta(res.meta);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="mt-1 text-gray-600">
          All registered customers. Click a row to see details.
        </p>
      </div>

      <Card>
        <CardBody>
          <Input
            placeholder="Search by name, email or phone&hellip;"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </CardBody>
      </Card>

      {loading ? (
        <PageSpinner />
      ) : users.length === 0 ? (
        <EmptyState
          title="No customers found"
          description="Try a different search."
        />
      ) : (
        <Card>
          <CardBody className="overflow-x-auto p-0">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {u.full_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {u.address || 'No address'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-700">{u.email}</div>
                      <div className="text-xs text-gray-500">{u.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      {u.is_active ? (
                        <Badge className="border-green-200 bg-green-100 text-green-800">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="border-red-200 bg-red-100 text-red-800">
                          Inactive
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="text-xs font-medium text-blue-700 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      <Pagination
        page={meta.page}
        lastPage={meta.last_page}
        onChange={(p) => load(p)}
      />
    </div>
  );
}
