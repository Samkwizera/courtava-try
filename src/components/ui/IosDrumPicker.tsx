import { useRef, useEffect, useCallback, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const ITEM_H = 44;
const VISIBLE = 5; // rows visible (2 above + selected + 2 below)
const PAD = ITEM_H * 2;

// ── Single drum column ────────────────────────────────────────────────────────

function PickerColumn({
  items,
  selectedIndex,
  onChange,
  className,
}: {
  items: string[];
  selectedIndex: number;
  onChange: (i: number) => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const snapTimer = useRef<ReturnType<typeof setTimeout>>();

  const applyOpacities = useCallback((centerIdx: number) => {
    const el = ref.current;
    if (!el) return;
    el.querySelectorAll<HTMLElement>("[data-item]").forEach((child, i) => {
      const dist = Math.abs(i - centerIdx);
      child.style.opacity = String(Math.max(0.16, 1 - dist * 0.42));
      child.style.fontSize = dist < 0.6 ? "20px" : dist < 1.5 ? "17px" : "15px";
      child.style.fontWeight = dist < 0.6 ? "700" : "400";
    });
  }, []);

  // Set initial scroll position on mount (no animation)
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = selectedIndex * ITEM_H;
    // Immediately apply opacities for initial render
    applyOpacities(selectedIndex);
  }, [applyOpacities, selectedIndex]);

  const handleScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    // Real-time opacity update during scroll
    const centerIdx = el.scrollTop / ITEM_H;
    applyOpacities(centerIdx);

    // Snap to nearest item after scroll settles
    clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(() => {
      const idx = Math.round(el.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      el.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
      onChange(clamped);
    }, 90);
  }, [applyOpacities, items.length, onChange]);

  return (
    <div className={cn("relative flex-1 overflow-hidden", className)}>
      <div
        ref={ref}
        onScroll={handleScroll}
        className="picker-scroll"
        style={{
          height: ITEM_H * VISIBLE,
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div style={{ height: PAD }} aria-hidden="true" />
        {items.map((label, i) => {
          const dist = Math.abs(i - selectedIndex);
          return (
            <div
              key={i}
              data-item
              onClick={() => {
                ref.current?.scrollTo({ top: i * ITEM_H, behavior: "smooth" });
                onChange(i);
              }}
              style={{
                height: ITEM_H,
                scrollSnapAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontFamily: "inherit",
                // Initial values — overridden by applyOpacities during scroll
                opacity: Math.max(0.16, 1 - dist * 0.42),
                fontSize: dist < 0.6 ? "20px" : dist < 1.5 ? "17px" : "15px",
                fontWeight: dist < 0.6 ? 700 : 400,
                color: "hsl(var(--foreground))",
              }}
            >
              {label}
            </div>
          );
        })}
        <div style={{ height: PAD }} aria-hidden="true" />
      </div>
    </div>
  );
}

// ── Data generators ───────────────────────────────────────────────────────────

function generateDates(count = 60) {
  const result: { label: string; value: string }[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const value = d.toISOString().split("T")[0];
    let label: string;
    if (i === 0) label = "Today";
    else if (i === 1) label = "Tomorrow";
    else {
      label = d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
    result.push({ label, value });
  }
  return result;
}

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));
const AMPM = ["AM", "PM"];

// ── Bottom-sheet picker ───────────────────────────────────────────────────────

export function IosDateTimePicker({
  open,
  onClose,
  onConfirm,
  initialDate,
  initialTime,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (date: string, time: string) => void;
  initialDate?: string; // YYYY-MM-DD
  initialTime?: string; // HH:MM (24h)
}) {
  const DATES = useMemo(() => generateDates(60), []);

  const parseInitial = useCallback(() => {
    let dateIdx = 0;
    let hourIdx = 6; // default: 7
    let minIdx = 0;  // default: :00
    let ampmIdx = 1; // default: PM

    if (initialDate) {
      const i = DATES.findIndex((d) => d.value === initialDate);
      if (i >= 0) dateIdx = i;
    }

    if (initialTime) {
      const [hStr, mStr] = initialTime.split(":");
      const h24 = parseInt(hStr);
      const m = parseInt(mStr);
      const isPM = h24 >= 12;
      const h12 = h24 % 12 || 12;
      hourIdx = h12 - 1;
      minIdx = Math.min(11, Math.round(m / 5));
      ampmIdx = isPM ? 1 : 0;
    }

    return { dateIdx, hourIdx, minIdx, ampmIdx };
  }, [DATES, initialDate, initialTime]);

  const [dateIdx, setDateIdx] = useState(0);
  const [hourIdx, setHourIdx] = useState(6);
  const [minIdx, setMinIdx] = useState(0);
  const [ampmIdx, setAmpmIdx] = useState(1);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      const init = parseInitial();
      setDateIdx(init.dateIdx);
      setHourIdx(init.hourIdx);
      setMinIdx(init.minIdx);
      setAmpmIdx(init.ampmIdx);
      // Slight delay so the sheet renders before animating in
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open, parseInitial]);

  const handleDone = () => {
    const selectedDate = DATES[dateIdx].value;
    const h12 = parseInt(HOURS[hourIdx]);
    const m = parseInt(MINUTES[minIdx]);
    const isPM = AMPM[ampmIdx] === "PM";
    const h24 = isPM ? (h12 === 12 ? 12 : h12 + 12) : h12 === 12 ? 0 : h12;
    const timeStr = `${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    onConfirm(selectedDate, timeStr);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60]"
        style={{
          background: "rgba(0,0,0,0.4)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.25s ease",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
        }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[70] bg-card"
        style={{
          borderRadius: "20px 20px 0 0",
          border: "0.5px solid hsl(var(--border))",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.18), 0 -1px 0 rgba(0,0,0,0.06)",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.42s cubic-bezier(0.32, 1.2, 0.64, 1)",
          paddingBottom: "max(env(safe-area-inset-bottom, 8px), 8px)",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-[5px] rounded-full bg-muted-foreground/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "0.5px solid hsl(var(--border))" }}>
          <button
            onClick={onClose}
            className="text-[17px] text-muted-foreground ios-tap"
          >
            Cancel
          </button>
          <span className="text-[17px] font-semibold text-foreground">Date & Time</span>
          <button
            onClick={handleDone}
            className="text-[17px] font-semibold text-primary ios-tap"
          >
            Done
          </button>
        </div>

        {/* Picker area */}
        <div className="relative mx-4 mt-2 mb-4" style={{ height: ITEM_H * VISIBLE }}>
          {/* Selection highlight band */}
          <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              top: ITEM_H * 2,
              height: ITEM_H,
              background: "hsl(var(--muted))",
              borderRadius: 10,
              zIndex: 0,
              opacity: 0.8,
            }}
          />

          {/* Top fade */}
          <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              top: 0,
              height: PAD,
              background: "linear-gradient(to bottom, hsl(var(--card)) 0%, transparent 100%)",
              zIndex: 2,
            }}
          />

          {/* Bottom fade */}
          <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              bottom: 0,
              height: PAD,
              background: "linear-gradient(to top, hsl(var(--card)) 0%, transparent 100%)",
              zIndex: 2,
            }}
          />

          {/* Columns */}
          <div className="flex h-full" style={{ position: "relative", zIndex: 1 }}>
            {/* Date — wider */}
            <PickerColumn
              items={DATES.map((d) => d.label)}
              selectedIndex={dateIdx}
              onChange={setDateIdx}
              className="flex-[2.2]"
            />

            {/* Separator */}
            <div className="flex items-center self-center pb-1 text-foreground/60 font-semibold text-[17px] px-0.5 select-none" style={{ zIndex: 3 }}>
              ·
            </div>

            {/* Hour */}
            <PickerColumn
              items={HOURS}
              selectedIndex={hourIdx}
              onChange={setHourIdx}
              className="flex-1"
            />

            {/* Colon separator */}
            <div className="flex items-center self-center pb-1 text-foreground/80 font-bold text-[20px] select-none" style={{ zIndex: 3 }}>
              :
            </div>

            {/* Minute */}
            <PickerColumn
              items={MINUTES}
              selectedIndex={minIdx}
              onChange={setMinIdx}
              className="flex-1"
            />

            {/* AM/PM */}
            <PickerColumn
              items={AMPM}
              selectedIndex={ampmIdx}
              onChange={setAmpmIdx}
              className="flex-1"
            />
          </div>
        </div>

        {/* Done button */}
        <div className="px-4 pb-2">
          <button
            onClick={handleDone}
            className="w-full h-[54px] rounded-2xl bg-primary text-primary-foreground font-semibold ios-tap"
            style={{ fontSize: "17px" }}
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}
