import { useEffect, useRef, useState } from "react";
import "./CommonTextEditor.scss";
import Quill from "quill";
import "quill/dist/quill.snow.css";

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
  ref = useRef(),
  defaultValue = "",
  height = "250px",
  maxLimit = 2000,
  ...props
}) {
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    var Size = Quill.import("attributors/style/size");
    Size.whitelist = fontSizeArr;
    Quill.register(Size, true);

    const quill = new Quill(ref.current, {
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

    // Set default font size to 12px
    const defaultFontSize = "12px";
    quill.format("size", defaultFontSize);

    quill.setText(defaultValue);

    quill.on("text-change", () => {
      setCharCount(quill.getText().trim().length);
    });

    return () => {
      quill.off("text-change");
      quill.deleteText(0, quill.getLength());
      ref.current = null;
    };
  }, [defaultValue]);

  const isLimitReached = charCount >= maxLimit;

  return (
    <div className="common-text-editor">
      <div ref={ref}>{props.children}</div>
      <div
        className={`character-count ${isLimitReached ? "limit-reached" : ""}`}
      >
        {charCount}/{maxLimit}
      </div>
    </div>
  );
}