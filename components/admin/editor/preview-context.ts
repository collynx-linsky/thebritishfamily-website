"use client";

import { createContext, useContext } from "react";
import type { EditorResult } from "@/lib/admin/form-data";

/**
 * Lets the editor workspace (live preview) hear about form changes and
 * finished saves without each editor form passing callbacks through.
 */
export type EditorHooks = {
  onFormChange?: (data: FormData) => void;
  onSettled?: (result: EditorResult) => void;
};

export const EditorHooksContext = createContext<EditorHooks>({});
export const useEditorHooks = () => useContext(EditorHooksContext);
