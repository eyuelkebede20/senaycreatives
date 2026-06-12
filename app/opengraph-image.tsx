import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE, OG_ALT } from "@/components/seo/og-image";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = OG_ALT;

export default function OpengraphImage() {
  return renderOgImage();
}
