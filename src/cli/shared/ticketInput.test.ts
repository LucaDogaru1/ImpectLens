import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { resolveTicketInput, resolveTicketPath } from "./ticketInput";

function testFlagPath(): void {
    assert.equal(resolveTicketPath(["--ticket=tickets/a.txt", "--json"]), "tickets/a.txt");
}

function testPositionalPath(): void {
    assert.equal(resolveTicketPath(["tickets/a.txt"]), "tickets/a.txt");
}

function testNpmConfigFallback(): void {
    const previous = process.env.npm_config_ticket;
    process.env.npm_config_ticket = "tickets/from-npm.txt";

    try {
        assert.equal(resolveTicketPath([]), "tickets/from-npm.txt");
        assert.equal(resolveTicketPath(["--json"]), "tickets/from-npm.txt");
    } finally {
        if (previous === undefined) {
            delete process.env.npm_config_ticket;
        } else {
            process.env.npm_config_ticket = previous;
        }
    }
}

function testInlineTicketText(): void {
    const result = resolveTicketInput([
        "--ticket=Hero teaser layout for homepage",
        "--non-interactive",
    ]);
    assert.equal(result.text, "Hero teaser layout for homepage");
    assert.equal(result.source, "inline");
}

function testInlineTicketFromFile(): void {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "impactlens-ticket-"));
    const filePath = path.join(dir, "ticket.txt");
    fs.writeFileSync(filePath, "Queue job archives VOD after 30 days", "utf8");

    try {
        const result = resolveTicketInput([`--ticket=${filePath}`]);
        assert.equal(result.text, "Queue job archives VOD after 30 days");
        assert.equal(result.source, filePath);
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
}

function run(): void {
    testFlagPath();
    testPositionalPath();
    testNpmConfigFallback();
    testInlineTicketText();
    testInlineTicketFromFile();
    console.log("ticketInput tests passed.");
}

run();
