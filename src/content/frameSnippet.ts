// Transcribed from the supplied screenshot. This is a renderer excerpt,
// not a complete function or a sample of an exported page.
export const frameSnippet = `export function DemoBlockRenderer({
  block,
  selectedId,
  onSelect,
  assetUrls = {},
  editorInteraction,
}: {
  block: DemoBlock;
  selectedId?: string;
  onSelect?: (blockId: string) => void;
  assetUrls?: Record<string, string>;
  editorInteraction?: DemoEditorInteraction;
}) {
  const base = block.style;

  const tablet = {
    ...base,
    padding: Math.min(base.padding, 36),
    gridColumns: Math.min(base.gridColumns, 2),
    ...block.responsive.tablet,
  };

  const mobile = {
    ...tablet,
    padding: Math.min(tablet.padding, 24),
    gridColumns: 1,
    ...block.responsive.mobile,
  };

  const automaticText = automaticTextStyle(block);
  const childLayoutDisplay = block.type === "Grid" ? "grid" : "flex";

  const style = {
    ...responsiveVariables("base", base, automaticText, childLayoutDisplay),
    ...responsiveVariables("tablet", tablet, automaticText, childLayoutDisplay),
    ...responsiveVariables("mobile", mobile, automaticText, childLayoutDisplay),
  } as CSSProperties;`;
