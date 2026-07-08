import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { NoteEditor } from "./NoteEditor";

describe("NoteEditor", () => {
  it("renders markdown input as HTML in the preview pane", () => {
    render(<NoteEditor onSaved={() => {}} onCancel={() => {}} />);
    const textarea = screen.getByLabelText("content");

    fireEvent.change(textarea, { target: { value: "# 제목" } });

    expect(screen.getByRole("heading", { level: 1, name: "제목" })).toBeInTheDocument();
  });

  it("does not render an executable <script> tag when input contains one (XSS)", () => {
    render(<NoteEditor onSaved={() => {}} onCancel={() => {}} />);
    const textarea = screen.getByLabelText("content");

    fireEvent.change(textarea, { target: { value: "<script>alert(1)</script>" } });

    const preview = screen.getByTestId("markdown-preview");
    expect(preview.querySelector("script")).toBeNull();
  });
});
