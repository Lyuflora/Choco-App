import { describe, expect, it } from "vitest";
import { parseOptionalNumber, validateEntryDraft } from "../validation";
import type { Entry } from "../../types/models";

describe("parseOptionalNumber", () => {
  it("parses valid numbers and treats blanks as null", () => {
    expect(parseOptionalNumber("12.5")).toBe(12.5);
    expect(parseOptionalNumber("")).toBeNull();
  });

  it("rejects negative numbers", () => {
    expect(() => parseOptionalNumber("-1")).toThrow("Numbers cannot be negative.");
  });
});

describe("validateEntryDraft", () => {
  it("blocks no_chocolate when a chocolate entry already exists that day", () => {
    const entries: Entry[] = [
      {
        id: "e1",
        date: "2026-03-03",
        actionType: "eat",
        chocolateId: "c1",
        bars: 1,
        grams: 10,
        calories: 50,
        spend: null,
        note: "",
        createdAt: "2026-03-03T00:00:00.000Z",
        updatedAt: "2026-03-03T00:00:00.000Z",
      },
    ];

    expect(() =>
      validateEntryDraft(
        {
          actionType: "no_chocolate",
          chocolateId: null,
          bars: null,
          grams: null,
          calories: null,
          spend: null,
          note: "",
        },
        entries,
      ),
    ).toThrow("already has chocolate activity");
  });
});

