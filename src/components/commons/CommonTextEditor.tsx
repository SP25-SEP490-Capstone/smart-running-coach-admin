// @components/commons/CommonTextEditor.tsx
import { useEffect, useRef, useState } from "react";
import "./CommonTextEditor.scss";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { Box, Typography } from "@mui/material";

interface CommonTextEditorProps {
  defaultValue?: string;
  height?: string;
  maxLimit?: number;
  onChange?: (content: string) => void;
  error?: boolean;
  helperText?: string;
}

const fontSizeArr = [
  "8px",
  "9px",
  "10px",
  "12px",
  "14px",
  "16px",
  "20px",
  "24px",
  "32px",
  "42px",
];

export default function CommonTextEditor({
  defaultValue = "",
  height = "300px",
  maxLimit = 2000,
  onChange,
  error = false,
  helperText = "",
}: CommonTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (!editorRef.current) return;

    // Register custom font sizes
    const Size = Quill.import("attributors/style/size");
    Size.whitelist = fontSizeArr;
    Quill.register(Size, true);

    // Initialize Quill editor
    const quill = new Quill(editorRef.current, {
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline"],
          [{ size: fontSizeArr }],
          ["link", "image", "code-block", "formula"],
        ],
      },
      placeholder: "Enter content...",
      theme: "snow",
    });

    // Set default font size
    quill.format("size", "12px");

    // Set initial content
    if (defaultValue) {
      quill.clipboard.dangerouslyPasteHTML(defaultValue);
    }

    // Handle text changes
    quill.on("text-change", () => {
      const text = quill.getText().trim();
      const html = quill.root.innerHTML;
      setCharCount(text.length);
      onChange?.(html);
    });

    quillRef.current = quill;

    return () => {
      quill.off("text-change");
    };
  }, []);

  const isLimitReached = charCount >= maxLimit;

  return (
    <Box sx={{ width: "100%" }}>
      <div 
        className="common-text-editor" 
        style={{ height, border: error ? "1px solid #d32f2f" : "1px solid #ccc" }}
      >
        <div ref={editorRef} />
        <div className={`character-count ${isLimitReached ? "limit-reached" : ""}`}>
          {charCount}/{maxLimit}
        </div>
      </div>
      {helperText && (
        <Typography variant="caption" color={error ? "error" : "textSecondary"}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
}