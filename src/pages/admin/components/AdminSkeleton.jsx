export const AdminListSkeleton = ({ rows = 5 }) => (
  <div className="space-y-2 animate-pulse">
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="h-14 rounded-lg bg-white/5" />
    ))}
  </div>
);

export const AdminPanelSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-8 w-48 rounded bg-white/5" />
    <div className="h-32 rounded-xl bg-white/5" />
    <div className="h-32 rounded-xl bg-white/5" />
  </div>
);

export const AdminOverviewSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
    {Array.from({ length: 4 }, (_, i) => (
      <div key={i} className="h-24 rounded-xl bg-white/5" />
    ))}
  </div>
);
