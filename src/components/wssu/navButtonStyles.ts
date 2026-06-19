export const navActionButtonTypography =
  "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] transition-all duration-300 ease-out";

export function navActionButtonSize(scrolled: boolean) {
  return scrolled ? "min-h-9 px-4 py-2.5" : "min-h-11 px-5 py-3.5";
}
