import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import GuidePageOne from "@/components/guide/GuidePageOne";
import GuidePageTwo from "@/components/guide/GuidePageTwo";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

const PAGES = [GuidePageOne, GuidePageTwo];

export default function UserGuide() {
  const [page, setPage] = useState(0);
  const Page = PAGES[page];

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-600 text-white">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">User Guide</h1>
          <p className="text-sm text-muted-foreground">
            How to run the growth journey — Page {page + 1} of {PAGES.length}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Page />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex gap-1.5">
          {PAGES.map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full ${i === page ? "bg-teal-600" : "bg-slate-200"}`}
            />
          ))}
        </div>
        {page < PAGES.length - 1 ? (
          <Button onClick={() => setPage((p) => p + 1)}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline" onClick={() => setPage(0)}>
            Back to start
          </Button>
        )}
      </div>
    </div>
  );
}