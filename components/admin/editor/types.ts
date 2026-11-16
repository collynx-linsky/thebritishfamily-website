/** Props every editor form receives from its page (see loadEditor). */
export type EditorProps<V> = {
  values: V;
  version: string;
  canUndo: boolean;
  isOriginal: boolean;
};
