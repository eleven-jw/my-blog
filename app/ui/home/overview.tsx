import {
  Card,
  CardContent
} from "@/components/ui/card"
import { cn } from "@/lib/utils";
import type { Props } from "@/types/home";

export default function StatsOverview({ items }: Props) {
  return (
    <Card className="rounded-xl border-gray-200">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-stretch gap-4">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={cn(
                "flex-1 min-w-0 px-4 py-3 bg-transparent",
                // add divider between items except first
                idx !== 0 ? "sm:border-l sm:border-gray-200" : ""
              )}
            >
              <div className="text-sm text-gray-500">{item.label}</div>

              <div className="mt-2 flex items-center gap-3">
                <div className="text-3xl font-semibold leading-tight">{item.value}</div>
              </div>

              <div>
                 {item.change ? (
                  <div
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 text-sm font-medium rounded text-white",
                      item.changeVariant === "down" ? "bg-red-500" : "bg-green-500"
                    )}
                  >
                    <svg
                      className="w-2 h-2 mr-1"
                      viewBox="0 0 15 15"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {item.changeVariant === "down" ? (
                        <path d="M5 7l5 5 5-5H5z" />
                      ) : (
                        <path d="M5 13l5-5 5 5H5z" />
                      )}
                    </svg>
                    <span>{item.change}</span>
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-gray-400">No Change Yesterday</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}