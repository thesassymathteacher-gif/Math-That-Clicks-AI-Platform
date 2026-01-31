type ProgressIndicatorProps = {
  label: string;
  step: number;
  total: number;
};

export default function ProgressIndicator({ label, step, total }: ProgressIndicatorProps) {
  const percent = Math.round((step / total) * 100);
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>{label}</span>
        <span>
          {step}/{total}
        </span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
        <div
          className="h-2 rounded-full bg-brand-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
