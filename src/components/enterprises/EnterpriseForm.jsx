import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const SECTORS = ["Agriculture", "Retail", "Technology"];
const STAGES = ["Idea", "Startup", "Growth", "Established"];
const REVENUE_BANDS = ["Pre-revenue", "R0-R100k", "R100k-R500k", "R500k-R1M", "R1M-R5M", "R5M+"];
const REG_STATUS = ["Registered", "Pending", "Not registered"];
const COMP_STATUS = ["Compliant", "Partially compliant", "Non-compliant"];
const PROVINCES = ["Gauteng", "Western Cape", "KwaZulu-Natal", "Limpopo", "Eastern Cape", "Free State", "Mpumalanga", "North West", "Northern Cape"];

const empty = {
  name: "", trading_name: "", founder_name: "", founder_email: "", founder_phone: "",
  sector: "Agriculture", stage: "Startup", employee_count: 0, revenue_band: "Pre-revenue",
  registration_number: "", registration_status: "Not registered", compliance_status: "Non-compliant",
  market_information: "", province: "Gauteng", contact_email: "", contact_phone: "",
};

export default function EnterpriseForm({ enterprise, onSaved, onCancel }) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (enterprise) setForm({ ...empty, ...enterprise });
  }, [enterprise]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = "Business name is required";
    if (form.founder_email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.founder_email)) e.founder_email = "Invalid email";
    if (form.contact_email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.contact_email)) e.contact_email = "Invalid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form, employee_count: Number(form.employee_count) || 0 };
      if (enterprise?.id) {
        await base44.entities.Enterprise.update(enterprise.id, payload);
        toast.success("Enterprise updated");
      } else {
        await base44.entities.Enterprise.create(payload);
        toast.success("Enterprise created");
      }
      onSaved?.();
    } catch (err) {
      toast.error(err.message || "Could not save enterprise");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Business name" error={errors.name} required>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Trading name">
          <Input value={form.trading_name} onChange={(e) => set("trading_name", e.target.value)} />
        </Field>
        <Field label="Founder name">
          <Input value={form.founder_name} onChange={(e) => set("founder_name", e.target.value)} />
        </Field>
        <Field label="Founder email" error={errors.founder_email}>
          <Input type="email" value={form.founder_email} onChange={(e) => set("founder_email", e.target.value)} />
        </Field>
        <Field label="Founder phone">
          <Input value={form.founder_phone} onChange={(e) => set("founder_phone", e.target.value)} />
        </Field>
        <Field label="Sector">
          <Select value={form.sector} onValueChange={(v) => set("sector", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{SECTORS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Stage">
          <Select value={form.stage} onValueChange={(v) => set("stage", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Employees">
          <Input type="number" min="0" value={form.employee_count} onChange={(e) => set("employee_count", e.target.value)} />
        </Field>
        <Field label="Revenue band">
          <Select value={form.revenue_band} onValueChange={(v) => set("revenue_band", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{REVENUE_BANDS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Registration number">
          <Input value={form.registration_number} onChange={(e) => set("registration_number", e.target.value)} />
        </Field>
        <Field label="Registration status">
          <Select value={form.registration_status} onValueChange={(v) => set("registration_status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{REG_STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Compliance status">
          <Select value={form.compliance_status} onValueChange={(v) => set("compliance_status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{COMP_STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Province">
          <Select value={form.province} onValueChange={(v) => set("province", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{PROVINCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Contact email" error={errors.contact_email}>
          <Input type="email" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} />
        </Field>
        <Field label="Contact phone">
          <Input value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} />
        </Field>
      </div>
      <Field label="Market information">
        <Textarea rows={3} value={form.market_information} onChange={(e) => set("market_information", e.target.value)} />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : enterprise?.id ? "Save changes" : "Create enterprise"}</Button>
      </div>
    </form>
  );
}

function Field({ label, error, required, children }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}{required && <span className="text-red-500"> *</span>}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}