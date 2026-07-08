import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NoteList } from "./NoteList";
import * as notesApi from "../api/notesApi";

vi.mock("../api/notesApi", () => ({
  listNotes: vi.fn()
}));

describe("NoteList", () => {
  it("renders notes returned by listNotes", async () => {
    vi.mocked(notesApi.listNotes).mockResolvedValue([
      {
        id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        source: { type: "InAppMemo" },
        title: "첫 메모",
        contentMarkdown: "내용",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z"
      }
    ]);

    render(<NoteList onSelectNote={() => {}} onCreateNote={() => {}} />);

    expect(await screen.findByText("첫 메모")).toBeInTheDocument();
  });
});
