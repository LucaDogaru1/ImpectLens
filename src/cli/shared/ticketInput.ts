import fs from "node:fs";
import path from "node:path";
import { getOptionValue } from "./cliArgs";

function firstPositionalTicketArg(args: string[]): string | undefined {
    for (const arg of args) {
        if (arg.startsWith("-")) {
            continue;
        }

        return arg;
    }

    return undefined;
}

/** Raw `--ticket` flag value, positional path/text, or npm_config_ticket. */
export function resolveTicketPath(args: string[]): string | undefined {
    const fromFlag = getOptionValue(args, "--ticket")?.trim();
    if (fromFlag) {
        return fromFlag;
    }

    const fromPositional = firstPositionalTicketArg(args)?.trim();
    if (fromPositional) {
        return fromPositional;
    }

    const fromNpmConfig = process.env.npm_config_ticket?.trim();
    if (fromNpmConfig) {
        return fromNpmConfig;
    }

    return undefined;
}

function isExistingTicketFile(value: string): boolean {
    if (value.includes("\n")) {
        return false;
    }

    const resolved = path.resolve(value);
    try {
        return fs.existsSync(resolved) && fs.statSync(resolved).isFile();
    } catch {
        return false;
    }
}

/** Resolve ticket text from a file path or inline `--ticket` body. */
export function resolveTicketInput(args: string[]): { text: string; source: string } {
    const raw = resolveTicketPath(args);
    if (!raw?.trim()) {
        return { text: "", source: "" };
    }

    if (isExistingTicketFile(raw)) {
        const resolved = path.resolve(raw);
        return {
            text: fs.readFileSync(resolved, "utf8"),
            source: resolved,
        };
    }

    return { text: raw, source: "inline" };
}

/** @deprecated Use resolveTicketInput — kept for callers that only pass a path. */
export function readTicketFile(ticketPath: string | undefined): { text: string; source: string } {
    if (!ticketPath?.trim()) {
        return { text: "", source: "" };
    }

    if (!isExistingTicketFile(ticketPath)) {
        return { text: ticketPath, source: "inline" };
    }

    const resolved = path.resolve(ticketPath);
    return {
        text: fs.readFileSync(resolved, "utf8"),
        source: resolved,
    };
}

export const TICKET_INPUT_HELP = [
    "Ticket source (any one):",
    "  --ticket=text        Inline ticket text (agent reads user ticket and passes it here)",
    "  --ticket=path        Path to ticket text file when a file exists on disk",
    "  path/to/ticket.txt   Positional file path (after -- when using npm run)",
    "",
    "npm run note: use `--` before flags:",
    "  npm run analyze:ticket -- sqlite/Graph.sqlite --ticket=\"Hero teaser layout…\" --answers=…",
    "  npm run analyze:ticket -- sqlite/Graph.sqlite --ticket=tickets/fe-new.txt --answers=…",
].join("\n");
