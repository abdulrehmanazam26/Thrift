"use client";
import { useState } from "react";
import { Ruler, ArrowUpRight } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
export function Measurements({
  measurements,
}: {
  measurements: Record<string, number>;
}) {
  const [guide, setGuide] = useState(false),
    [unit, setUnit] = useState<"cm" | "in">("cm"),
    [own, setOwn] = useState<Record<string, string>>({});
  return (
    <div className="measurements">
      <div className="subheading">
        <h3>THE MEASUREMENTS</h3>
        <div className="unit-toggle" aria-label="Measurement unit">
          <button aria-pressed={unit === "cm"} onClick={() => setUnit("cm")}>
            CM
          </button>
          <button aria-pressed={unit === "in"} onClick={() => setUnit("in")}>
            IN
          </button>
        </div>
      </div>
      <div className="measurement-table">
        {Object.entries(measurements).map(([name, value]) => (
          <div key={name}>
            <span>{name === "Chest" ? "Chest / pit-to-pit" : name}</span>
            <strong>
              {unit === "cm" ? value : (value / 2.54).toFixed(1)} {unit}
            </strong>
          </div>
        ))}
      </div>
      <button className="text-link" onClick={() => setGuide(true)}>
        <Ruler size={16} /> HOW TO MEASURE <ArrowUpRight size={15} />
      </button>
      <Modal open={guide} onOpenChange={setGuide} title="NOT SURE IF IT FITS?">
        <div className="guide-content">
          <p>
            For the best fit, compare these measurements with a similar item you
            already wear. Lay it flat, smooth it gently, and measure without
            stretching.
          </p>
          <ol>
            <li>
              <strong>Chest:</strong> straight across, from armpit to armpit.
            </li>
            <li>
              <strong>Length:</strong> top of the shoulder to the hem.
            </li>
            <li>
              <strong>Waist:</strong> across the waistband, with it fastened.
            </li>
            <li>
              <strong>Inseam:</strong> crotch seam to the bottom of the leg.
            </li>
            <li>
              <strong>Shoulder:</strong> across the back between shoulder seams.
              Sleeve: shoulder seam to cuff.
            </li>
            <li>
              <strong>Rise:</strong> crotch seam to waistband. Leg opening:
              straight across the hem.
            </li>
          </ol>
          <h3>COMPARE YOUR OWN PIECE</h3>
          <p className="muted">
            Enter your garment’s flat measurements in {unit}. Small differences
            in cut and fabric can affect fit.
          </p>
          {Object.entries(measurements).map(([name, value]) => {
            const target = unit === "cm" ? value : value / 2.54;
            const input = Number(own[name]);
            return (
              <div className="fit-row" key={name}>
                <label htmlFor={`fit-${name}`}>{name}</label>
                <input
                  id={`fit-${name}`}
                  type="number"
                  min="1"
                  max="300"
                  step="0.1"
                  placeholder={unit}
                  value={own[name] || ""}
                  onChange={(e) => setOwn({ ...own, [name]: e.target.value })}
                />
                <span>
                  {own[name] && input > 0
                    ? `${Math.abs(target - input).toFixed(1)} ${unit} ${target >= input ? "larger" : "smaller"}`
                    : `Piece: ${target.toFixed(1)} ${unit}`}
                </span>
              </div>
            );
          })}
          <p className="small muted">
            This comparison is a guide, not an exact fit guarantee.
          </p>
        </div>
      </Modal>
    </div>
  );
}
