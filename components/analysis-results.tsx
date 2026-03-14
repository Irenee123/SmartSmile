"use client";

import type { TeethAnalysis } from "@/app/api/analyze/route";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AnalysisResultsProps {
  analysis: TeethAnalysis;
}

const conditionConfig: Record<
  string,
  { color: string; icon: React.ReactNode; bg: string }
> = {
  Excellent: {
    color: "text-success",
    bg: "bg-success/10",
    icon: <ShieldCheck className="h-6 w-6" />,
  },
  Good: {
    color: "text-success",
    bg: "bg-success/10",
    icon: <CheckCircle2 className="h-6 w-6" />,
  },
  Fair: {
    color: "text-warning",
    bg: "bg-warning/10",
    icon: <Info className="h-6 w-6" />,
  },
  Poor: {
    color: "text-destructive",
    bg: "bg-destructive/10",
    icon: <AlertTriangle className="h-6 w-6" />,
  },
  Critical: {
    color: "text-destructive",
    bg: "bg-destructive/10",
    icon: <ShieldAlert className="h-6 w-6" />,
  },
};

const severityColors: Record<string, string> = {
  Low: "bg-success/15 text-success border-success/20",
  Medium: "bg-warning/15 text-warning border-warning/20",
  High: "bg-destructive/15 text-destructive border-destructive/20",
};

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const config = conditionConfig[analysis.overallCondition] || conditionConfig.Fair;

  return (
    <div className="flex flex-col gap-6">
      {/* Overall Condition */}
      <Card className="overflow-hidden border-border">
        <div className={`${config.bg} px-6 py-5`}>
          <div className="flex items-center gap-4">
            <div className={`${config.color}`}>{config.icon}</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                Overall Condition
              </p>
              <p className={`text-2xl font-bold font-display ${config.color}`}>
                {analysis.overallCondition}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground">
                Confidence
              </p>
              <p className="text-2xl font-bold text-foreground">
                {analysis.confidenceScore}%
              </p>
            </div>
          </div>
        </div>
        <CardContent className="pt-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {analysis.summary}
          </p>
        </CardContent>
      </Card>

      {/* Findings */}
      {analysis.findings.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <Info className="h-5 w-5 text-primary" />
              Detailed Findings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {analysis.findings.map((finding, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground text-sm">
                        {finding.area}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${severityColors[finding.severity] || ""}`}
                      >
                        {finding.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {finding.condition}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <Lightbulb className="h-5 w-5 text-primary" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2.5">
              {analysis.recommendations.map((rec, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <div className="rounded-lg border border-warning/30 bg-warning/5 px-4 py-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Disclaimer:</strong> This AI analysis is
          for informational purposes only and should not replace professional dental
          consultation. Always visit a qualified dentist for proper diagnosis and
          treatment.
        </p>
      </div>
    </div>
  );
}
