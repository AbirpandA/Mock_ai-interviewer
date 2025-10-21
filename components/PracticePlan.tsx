import React from "react";

type FocusArea = {
  name: string;
  reason?: string;
  drills?: string[];
};

const PracticePlan = ({
  plan,
}: {
  plan: { generatedAt?: string; plan?: { focusAreas?: FocusArea[] } } | null;
}) => {
  if (!plan) {
    return (
      <div className="card-border w-full p-4">
        <h3>No Practice Plan</h3>
        <p>
          Generate a personalized plan after you receive feedback from
          interviews.
        </p>
      </div>
    );
  }

  const data: { focusAreas?: FocusArea[] } = (plan.plan as
    | { focusAreas?: FocusArea[] }
    | undefined) ||
    (plan as unknown as { focusAreas?: FocusArea[] }) || { focusAreas: [] };

  return (
    <div className="card-border w-full p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Personalized Practice Plan</h3>
        <p className="text-sm text-muted-foreground">
          {plan?.generatedAt ? new Date(plan.generatedAt).toLocaleString() : ""}
        </p>
      </div>

      <div className="mt-3">
        {(data.focusAreas || [])
          .slice(0, 3)
          .map((f: FocusArea, idx: number) => (
            <div key={idx} className="mb-3">
              <h4 className="font-semibold">{f.name}</h4>
              <p className="text-sm">{f.reason}</p>
              <ul className="list-disc ml-5 text-sm mt-1">
                {(f.drills || []).slice(0, 3).map((d: string, i: number) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button className="btn-primary">Start Drill</button>
        <button className="btn-ghost">Regenerate</button>
      </div>
    </div>
  );
};

export default PracticePlan;
