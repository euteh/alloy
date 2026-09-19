import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

export function Card({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "var(--alloy-white)",
        border: "1px solid var(--alloy-gray-200)",
        borderRadius: 10,
        padding: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Button({
  variant = "primary",
  style,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  const base: React.CSSProperties = {
    borderRadius: 8,
    padding: "8px 14px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    border: "1px solid transparent",
  };
  const byVariant: Record<string, React.CSSProperties> = {
    primary: { background: "var(--alloy-red)", color: "#fff" },
    secondary: {
      background: "var(--alloy-white)",
      color: "var(--alloy-gray-900)",
      border: "1px solid var(--alloy-gray-200)",
    },
    ghost: { background: "transparent", color: "var(--alloy-gray-700)" },
  };
  return <button {...props} style={{ ...base, ...byVariant[variant], ...style }} />;
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        border: "1px solid var(--alloy-gray-200)",
        borderRadius: 8,
        padding: "8px 10px",
        fontSize: 14,
        width: "100%",
        ...props.style,
      }}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{
        border: "1px solid var(--alloy-gray-200)",
        borderRadius: 8,
        padding: "8px 10px",
        fontSize: 14,
        width: "100%",
        background: "#fff",
        ...props.style,
      }}
    />
  );
}

export function Badge({ tone = "gray", children }: { tone?: "gray" | "green" | "red" | "amber"; children: ReactNode }) {
  const colors: Record<string, [string, string]> = {
    gray: ["var(--alloy-gray-200)", "var(--alloy-gray-700)"],
    green: ["#e6f5ec", "var(--alloy-green)"],
    red: ["var(--alloy-red-soft)", "var(--alloy-red)"],
    amber: ["#fbf3df", "var(--alloy-amber)"],
  };
  const [bg, fg] = colors[tone];
  return (
    <span
      style={{
        background: bg,
        color: fg,
        borderRadius: 999,
        padding: "2px 10px",
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>{children}</table>
    </div>
  );
}

export function Th({ children }: { children: ReactNode }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "10px 12px",
        borderBottom: "1px solid var(--alloy-gray-200)",
        color: "var(--alloy-gray-500)",
        fontWeight: 600,
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: 0.3,
      }}
    >
      {children}
    </th>
  );
}

export function Td({ children }: { children: ReactNode }) {
  return (
    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--alloy-gray-100)" }}>{children}</td>
  );
}

export function PageTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{children}</h1>
      {action}
    </div>
  );
}
