"use client";

import { useEffect, useState } from "react";
import { STAFF_QUERY, CREATE_STAFF_MUTATION, UPDATE_STAFF_MUTATION } from "@juls/pickleball-kit/graphql";
import { createGraphQLClient } from "@juls/pickleball-kit/sdk";
import { getToken } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/recipes/card";
import { Stack } from "@/components/recipes/stack";
import { Button } from "@/components/recipes/button";
import { Input } from "@/components/recipes/input";
import { Badge } from "@/components/recipes/badge";

const client = createGraphQLClient({
  url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/graphql",
  getToken,
});

export default function Page() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ email: "", firstName: "", lastName: "", phone: "", password: "" });
  const [resetForm, setResetForm] = useState({ id: "", password: "" });

  async function load() {
    try {
      const data = await client.request<any>(STAFF_QUERY);
      setItems(data.staff || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    try {
      await client.request(CREATE_STAFF_MUTATION, { input: form });
      setForm({ email: "", firstName: "", lastName: "", phone: "", password: "" });
      await load();
    } catch (e) {
      console.error(e);
      alert("Failed to create staff");
    }
  }

  async function resetPassword() {
    if (!resetForm.id || !resetForm.password) return;
    try {
      await client.request(UPDATE_STAFF_MUTATION, { id: resetForm.id, input: { password: resetForm.password } });
      alert("Password updated");
      setResetForm({ id: "", password: "" });
    } catch (e) {
      console.error(e);
      alert("Failed to update password");
    }
  }

  return (
    <Stack gap={6}>
      <Stack gap={1}>
        <h1 className="text-2xl font-semibold tracking-tight text-[rgb(var(--color-chalk))]">Staff</h1>
        <p className="text-sm text-[rgb(var(--color-muted))]">Manage staff accounts</p>
      </Stack>
      <Card>
        <CardHeader>
          <CardTitle>Add Staff</CardTitle>
          <CardDescription>Create staff account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            <Input placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input type="password" placeholder="Password (optional)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="mt-3">
            <Button onClick={create}>Create</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Change staff password</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="Staff ID" value={resetForm.id} onChange={(e) => setResetForm({ ...resetForm, id: e.target.value })} />
            <Input type="password" placeholder="New password" value={resetForm.password} onChange={(e) => setResetForm({ ...resetForm, password: e.target.value })} />
          </div>
          <div className="mt-3">
            <Button onClick={resetPassword}>Update Password</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Staff List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-[rgb(var(--color-muted))]">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-[rgb(var(--color-muted))]">No staff</p>
          ) : (
            <div className="space-y-2">
              {items.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border border-[rgb(var(--color-line))] p-3">
                  <div>
                    <p className="text-sm font-medium text-[rgb(var(--color-chalk))]">{s.firstName} {s.lastName}</p>
                    <p className="text-xs text-[rgb(var(--color-muted))]">{s.email} · {s.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{s.role}</Badge>
                    <Badge variant={s.status === "active" ? "secondary" : "outline"}>{s.status}</Badge>
                    <Button size="sm" variant="ghost" onClick={() => setResetForm({ id: s.id, password: "" })}>Reset Password</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
