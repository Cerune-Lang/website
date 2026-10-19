import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { ion } from 'starlight-ion-theme';

export default defineConfig({
  site: 'https://cerune.hokutaka.dev',
  output: 'static',
  integrations: [
    starlight({
      title: 'Cerune Docs',
      description: 'Ceruneの言語機能、CLI、コンパイラ内部の解説。',
      favicon: '/favicon.svg',
      defaultLocale: 'root',
      locales: {
        root: { label: '日本語', lang: 'ja' },
        en: { label: 'English', lang: 'en' },
      },
      social: [
        { icon: 'github', label: 'Cerune on GitHub', href: 'https://github.com/Cerune-Lang/Cerune' },
        { icon: 'external', label: 'Open Tint', href: 'https://tint.hokutaka.dev/' },
      ],
      sidebar: [
        { label: 'はじめに', translations: { en: 'Getting Started' }, items: [{ slug: 'guide/getting-started' }] },
        { label: '言語リファレンス', translations: { en: 'Language Reference' }, items: [{ slug: 'reference/overview' }, { slug: 'reference/types' }, { slug: 'reference/variables' }, { slug: 'reference/functions' }, { slug: 'reference/arrays' }, { slug: 'reference/control-flow' }, { slug: 'reference/modules' }] },
        { label: 'CLI', items: [{ slug: 'cli/overview' }] },
        { label: 'コンパイラ内部', translations: { en: 'Compiler Internals' }, items: [{ slug: 'internals/overview' }, { slug: 'internals/ir' }, { slug: 'internals/mir' }] },
        { label: 'サンプル', translations: { en: 'Examples' }, items: [{ slug: 'examples/overview' }] },
      ],
      customCss: ['./src/styles/cerune.css'],
      plugins: [ion()],
    }),
  ],
});
