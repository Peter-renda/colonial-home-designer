"use client";

import { TakeoffResult, Trade } from "../types";
import { groupByTrade, formatUSD } from "../lib/takeoff";

interface Props {
  result: TakeoffResult;
}

export default function BomTable({ result }: Props) {
  const groups = groupByTrade(result.lines);

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-4 bg-blue-50 flex items-baseline justify-between">
        <span className="text-sm uppercase tracking-wide text-gray-600">
          Estimated total
        </span>
        <span className="text-2xl font-semibold">
          {formatUSD(result.grandTotal)}
        </span>
      </div>

      {Array.from(groups.entries()).map(([trade, lines]) => {
        if (lines.length === 0) return null;
        const subtotal = result.totalsByTrade[trade as Trade];
        return (
          <section key={trade} className="border rounded-lg bg-white overflow-hidden">
            <header className="px-4 py-2 bg-gray-50 border-b flex items-baseline justify-between">
              <h3 className="font-semibold">{trade}</h3>
              <span className="text-sm text-gray-700">{formatUSD(subtotal)}</span>
            </header>
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500">
                <tr>
                  <th className="px-4 py-2 font-medium">Item</th>
                  <th className="px-4 py-2 font-medium text-right">Qty</th>
                  <th className="px-4 py-2 font-medium">Unit</th>
                  <th className="px-4 py-2 font-medium text-right">Unit price</th>
                  <th className="px-4 py-2 font-medium text-right">Line total</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-2">
                      <div>{line.itemName}</div>
                      <div className="text-xs text-gray-400">
                        {line.conditionsMet.join(" · ")}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {line.quantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-gray-600">{line.unit}</td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {formatUSD(line.unitPrice)}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums font-medium">
                      {formatUSD(line.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );
      })}
    </div>
  );
}
