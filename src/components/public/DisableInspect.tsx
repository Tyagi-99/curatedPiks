"use client";

import { useEffect } from "react";

function shouldBlockKey(event: KeyboardEvent) {
  const key = event.key.toLowerCase();
  if (event.key === "F12") return true;
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && ["i", "j", "c"].includes(key)) return true;
  if ((event.ctrlKey || event.metaKey) && key === "u") return true;
  return false;
}

export function DisableInspect() {
  useEffect(() => {
    const onMenu = (event: MouseEvent) => event.preventDefault();
    const onKey = (event: KeyboardEvent) => {
      if (shouldBlockKey(event)) event.preventDefault();
    };
    const onDrag = (event: DragEvent) => event.preventDefault();
    document.addEventListener("contextmenu", onMenu);
    document.addEventListener("keydown", onKey);
    document.addEventListener("dragstart", onDrag);
    return () => {
      document.removeEventListener("contextmenu", onMenu);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("dragstart", onDrag);
    };
  }, []);

  return null;
}
