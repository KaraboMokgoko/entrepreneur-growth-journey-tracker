import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import DiagnosticForm from "@/components/diagnostics/DiagnosticForm";

export default function DiagnosticFormPage() {
  const navigate = useNavigate();
  const [enterprises, setEnterprises] = useState([]);

  useEffect(() => { base44.entities.Enterprise.list("-created_date", 300).then(setEnterprises).catch(() => {}); }, []);

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate("/diagnostics")} className="mb-3"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
      <h1 className="text-2xl font-bold mb-5">New diagnostic</h1>
      <DiagnosticForm enterprises={enterprises} onSaved={(d) => navigate(`/enterprises/${d.enterprise_id}`)} onCancel={() => navigate("/diagnostics")} />
    </div>
  );
}