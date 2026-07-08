import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { App } from "./App";

vi.mock("./api/notesApi", () => ({
  listNotes: vi.fn().mockResolvedValue([]),
  createNote: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn()
}));

describe("App", () => {
  it("renders the note list view by default", async () => {
    render(<App />);

    expect(await screen.findByText("새 메모")).toBeInTheDocument();
  });
});
