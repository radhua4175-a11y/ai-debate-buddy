const base =
  "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-lg font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

export const btnPrimary = `${base} bg-primary text-primary-foreground hover:bg-primary-hover`;
export const btnSecondary = `${base} border-2 border-border bg-card text-foreground hover:border-primary`;
export const btnDanger = `${base} border-2 border-against/40 bg-card text-against hover:bg-against/10`;

export const card = "rounded-3xl border-2 border-border bg-card p-5 shadow-sm sm:p-6";
export const input =
  "w-full rounded-2xl border-2 border-border bg-card px-4 py-3 text-lg text-foreground placeholder:text-muted/70";
export const errorBox = "rounded-2xl border-2 border-against/40 bg-against/10 p-3 text-against";
