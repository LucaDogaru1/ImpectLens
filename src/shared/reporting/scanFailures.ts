import chalk from "chalk";

export type ScanFailureReason =
    | "php_parse_error"
    | "php_parser_crash"
    | "blade_scan_failed"
    | "route_extraction_failed"
    | "js_parse_error"
    | "vue_parse_error"
    | "vue_parser_crash"
    | "ts_parse_failed";

export interface ScanFailure {
    file: string;
    reason: ScanFailureReason;
    detail?: string;
}

const failures: ScanFailure[] = [];
const seen = new Set<string>();

const REASON_LABELS: Record<ScanFailureReason, string> = {
    php_parse_error: "PHP parse error",
    php_parser_crash: "PHP parser crash",
    blade_scan_failed: "Blade scan failed",
    route_extraction_failed: "Route extraction failed",
    js_parse_error: "JS parse error",
    vue_parse_error: "Vue script parse error",
    vue_parser_crash: "Vue parser crash",
    ts_parse_failed: "TypeScript parse failed",
};

export function resetScanFailures(): void {
    failures.length = 0;
    seen.clear();
}

export function recordScanFailure(failure: ScanFailure): void {
    const key = `${failure.file}:${failure.reason}`;

    if (seen.has(key)) {
        return;
    }

    seen.add(key);
    failures.push(failure);
}

export function getScanFailures(): ScanFailure[] {
    return failures;
}

export function errorDetail(error: unknown): string | undefined {
    if (error instanceof Error) {
        return error.message;
    }

    return typeof error === "string" ? error : undefined;
}

export function printScanFailureSummary(): void {
    if (failures.length === 0) {
        console.log(chalk.green("Scan failures: 0"));
        return;
    }

    console.log();
    console.log(chalk.yellow.bold(`Scan failures: ${failures.length}`));

    for (const failure of failures) {
        console.log(chalk.yellow(`   • ${failure.file}`));
        const label = REASON_LABELS[failure.reason];
        const detail = failure.detail ? ` — ${failure.detail}` : "";
        console.log(chalk.gray(`     ${label}${detail}`));
    }
}
