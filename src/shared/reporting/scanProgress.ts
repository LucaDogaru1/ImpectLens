import path from "node:path";

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export interface ScanProgressOptions {
    label: string;
    total?: number;
}

export interface ScanProgressHandle {
    start: () => void;
    tick: (currentFile?: string) => void;
    done: (finalMessage?: string) => void;
}

export function createScanProgress(options: ScanProgressOptions): ScanProgressHandle {
    const { label, total } = options;
    let current = 0;
    let frame = 0;
    let lastFile: string | undefined;
    let interval: ReturnType<typeof setInterval> | undefined;
    const enabled = Boolean(process.stderr.isTTY);

    function render(): void {
        if (!enabled) {
            return;
        }

        frame = (frame + 1) % FRAMES.length;
        const columns = process.stderr.columns ?? 80;
        const pct = total && total > 0 ? Math.floor((current / total) * 100) : undefined;
        const count = total ? `${current}/${total}` : String(current);
        const pctText = pct !== undefined ? ` (${pct}%)` : "";
        const fileText = lastFile ? ` · ${path.basename(lastFile)}` : "";
        const base = `${FRAMES[frame]} ${label} ${count}${pctText}${fileText}`;
        const line = base.length >= columns - 1 ? `${base.slice(0, columns - 4)}...` : base;
        process.stderr.write(`\r${line.padEnd(columns - 1, " ")}`);
    }

    function tick(currentFile?: string): void {
        current += 1;

        if (currentFile) {
            lastFile = currentFile;
        }

        if (enabled) {
            render();
            return;
        }

        const milestone = total ? Math.max(1, Math.floor(total / 20)) : 500;
        if (current % milestone === 0 || (total !== undefined && current === total)) {
            const pct = total ? ` (${Math.floor((current / total) * 100)}%)` : "";
            console.log(`${label}: ${current}${total ? `/${total}` : ""}${pct}`);
        }
    }

    function start(): void {
        if (!enabled) {
            return;
        }

        interval = setInterval(render, 100);
    }

    function done(finalMessage?: string): void {
        if (interval) {
            clearInterval(interval);
            interval = undefined;
        }

        if (enabled) {
            process.stderr.write("\r\x1b[2K");
        }

        if (finalMessage) {
            console.log(finalMessage);
        }
    }

    return { start, tick, done };
}
