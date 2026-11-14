import {
  siCloudflare,
  siDjango,
  siDocker,
  siGit,
  siGo,
  siKotlin,
  siLinux,
  siNestjs,
  siOpenjdk,
  siPostgresql,
  siRailway,
  siReact,
  siRedis,
  siRender,
  siRust,
  siSpringboot,
  siTailwindcss,
  siTypescript,
  siVercel,
  type SimpleIcon,
} from 'simple-icons';

/** Brand logos for the icon keys stored on skills in the admin panel. */
const icons: Record<string, SimpleIcon> = {
  java: siOpenjdk,
  spring: siSpringboot,
  kotlin: siKotlin,
  go: siGo,
  django: siDjango,
  nestjs: siNestjs,
  rust: siRust,
  postgresql: siPostgresql,
  redis: siRedis,
  docker: siDocker,
  react: siReact,
  typescript: siTypescript,
  tailwind: siTailwindcss,
  git: siGit,
  linux: siLinux,
  railway: siRailway,
  render: siRender,
  vercel: siVercel,
  cloudflare: siCloudflare,
};

/** Icon keys the frontend can draw, for the admin panel's picker. */
export const skillIconKeys = Object.keys(icons);

/** The logo for a skill, or undefined when its key is unknown (callers fall back to initials). */
export function skillIcon(iconKey: string | null): SimpleIcon | undefined {
  return iconKey ? icons[iconKey.toLowerCase()] : undefined;
}

/** Up to two letters to stand in for a skill that has no logo. */
export function skillInitials(name: string): string {
  const words = name.split(/[\s&/]+/).filter(Boolean);
  const letters = words.length > 1 ? words.map((word) => word[0]).join('') : name.slice(0, 2);
  return letters.slice(0, 2).toUpperCase();
}
