import { Section, SectionHeading } from "@/components/ui/section";
import { pricing, services, type ServiceKey } from "@/content/pricing";
import { formatETB } from "@/lib/utils";

const ROWS = ["landingPage", "businessWebsite", "fullDigitalization", "digitalMarketing"] as const;
const COLS = [
  { key: "basic", label: "Basic" },
  { key: "premium", label: "Premium" },
  { key: "platinum", label: "Platinum" },
] as const;

function billingLabel(key: ServiceKey) {
  return services[key].billing === "monthly" ? "/mo" : "one-time";
}

// At-a-glance comparison of every productized tier in one table.
export function PricingComparison() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Compare"
        title="Every package, side by side."
        intro="One-time project fees, except marketing which is a monthly retainer."
      />
      <div className="mt-10 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-paper-dim">
              <th scope="col" className="p-4 font-display font-semibold">Service</th>
              {COLS.map((col) => (
                <th key={col.key} scope="col" className="p-4 font-display font-semibold">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row} className="border-t border-line">
                <th scope="row" className="p-4 font-medium">
                  {services[row].name}
                  <span className="ml-2 text-xs font-normal text-muted">{billingLabel(row)}</span>
                </th>
                {COLS.map((col) => (
                  <td key={col.key} className="p-4 whitespace-nowrap text-ink-soft">
                    {formatETB(pricing[row][col.key].price)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
