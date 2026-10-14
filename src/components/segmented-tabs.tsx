"use client";

export type SegmentedTabOption = { key: string; label: string };

export function SegmentedTabs({
  tabs,
  activeKey,
  onChange,
  ariaLabel,
}: {
  tabs: SegmentedTabOption[];
  activeKey: string;
  onChange: (key: string) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex items-center gap-1 rounded-full bg-surface-elevated p-1"
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={activeKey === tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex-1 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
            activeKey === tab.key
              ? "bg-brand text-brand-foreground"
              : "text-ink-muted"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
