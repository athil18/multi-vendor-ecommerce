/**
 * Super Admin — User Directory & Role Management Console
 * 
 * Inspect platform accounts, promote/demote roles (customer, seller, admin),
 * and manage account suspension or active statuses.
 * 
 * @agent engineering-identity-access-engineer
 * @agent security-appsec-engineer
 */

'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  Users, Shield, Store, ShoppingBag, 
  Search, RefreshCw, CheckCircle2, Ban, UserCheck 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function AdminUsersPage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: users = [] as any[], isLoading, refetch } = useQuery({
    queryKey: ['adminUsers', roleFilter, searchQuery],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users?role=${roleFilter}&search=${searchQuery}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch user directory');
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!user,
  });

  const handleUpdateUser = async (userId: string, updates: { role?: string; status?: string }) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userId, ...updates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user');
      toast.success(data.message || 'User updated successfully');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const customerCount = users.filter((u: any) => u.role === 'customer').length;
  const sellerCount = users.filter((u: any) => u.role === 'seller').length;
  const adminCount = users.filter((u: any) => u.role === 'admin').length;

  return (
    <div className="px-6 md:px-10 pt-8 pb-12 flex flex-col gap-8 bg-background min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-display-lg text-on-surface mb-1 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            User & Role Management
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            Super Admin Access: Manage identity directory, assign RBAC permissions, and enforce account governance.
          </p>
        </div>
        <Button variant="primary" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Directory
        </Button>
      </div>

      {/* Role Counts Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl">
          <p className="text-label-md text-on-surface-variant mb-1">Total Platform Accounts</p>
          <p className="text-headline-lg text-on-surface font-geist font-bold">{users.length}</p>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-purple-500/20">
          <p className="text-label-md text-purple-400 mb-1 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Super Admins
          </p>
          <p className="text-headline-lg text-purple-300 font-geist font-bold">{adminCount}</p>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-brand-500/20">
          <p className="text-label-md text-brand-400 mb-1 flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5" /> Active Creators (Sellers)
          </p>
          <p className="text-headline-lg text-brand-300 font-geist font-bold">{sellerCount}</p>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-emerald-500/20">
          <p className="text-label-md text-emerald-400 mb-1 flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5" /> Customers
          </p>
          <p className="text-headline-lg text-emerald-300 font-geist font-bold">{customerCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['all', 'customer', 'seller', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                roleFilter === r
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {r === 'all' ? 'All Roles' : `${r}s`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-surface-400" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* User Directory Table */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : users.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl text-on-surface-variant">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <h3 className="font-bold text-lg text-on-surface">No Users Found</h3>
          <p className="text-xs">No accounts match the current filter.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-high/60 text-on-surface-variant uppercase tracking-wider text-[10px] font-bold border-b border-white/5">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Current Role</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4">Orders Placed</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 text-right">Super Admin Role & Status Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-on-surface text-sm">{u.name}</div>
                      <div className="text-surface-400 text-[11px] font-mono">{u.email}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : u.role === 'seller'
                          ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        u.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-geist">
                      {u._count?.orders || 0} orders
                    </td>
                    <td className="py-4 px-4 text-surface-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      {/* Role selection dropdown */}
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateUser(u.id, { role: e.target.value })}
                        aria-label={`Change role for ${u.name}`}
                        className="bg-surface-container-high text-on-surface text-[11px] font-semibold rounded-lg px-2 py-1 border border-white/10 focus:outline-none"
                      >
                        <option value="customer">Role: Customer</option>
                        <option value="seller">Role: Seller</option>
                        <option value="admin">Role: Admin</option>
                      </select>

                      {/* Status toggle button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateUser(u.id, { status: u.status === 'suspended' ? 'active' : 'suspended' })}
                        className={`rounded-lg text-[10px] h-7 px-2 ${
                          u.status === 'suspended'
                            ? 'text-emerald-400 border-emerald-500/30'
                            : 'text-red-400 border-red-500/30'
                        }`}
                      >
                        {u.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
