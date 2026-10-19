# Cerune Docs

The secondary, reader-friendly documentation website for [Cerune](https://github.com/Cerune-Lang/Cerune).

**Planned URL:** https://cerune.hokutaka.dev

- Built with Astro, Starlight, and the Ion theme.
- Japanese at `/`, English at `/en/`.
- Language specifications and implementation limitations stay **only** in the [Cerune repository](https://github.com/Cerune-Lang/Cerune/tree/master/docs).
- Canonical runnable code lives in [Cerune/examples](https://github.com/Cerune-Lang/Cerune/tree/master/examples).
- [Tint](https://tint.hokutaka.dev/) is the playground.

## Run locally

Requires Node.js 22.12+ (Node.js 24 recommended).

```sh
npm install
npm run dev
npm run build
```

The build outputs static files in `dist/` for hosting at `cerune.hokutaka.dev`.

## Editorial rules

1. Do not copy full specifications from the primary repository.
2. Keep explanations short, beginner-friendly, and link to the relevant authoritative documents.
3. Do not claim unsupported features work. Check the Cerune version and source before writing.
4. Prefer links to canonical examples over maintaining duplicate code blocks.
5. Maintain Japanese and English versions of the same topic.
6. A future CI improvement can check tracked upstream files for changes and flag potentially stale explanations.

## Deployment

This PR configures the production origin in Astro but **does not publish or change DNS**. Connect your existing host to `dist/`, configure the `cerune.hokutaka.dev` subdomain, and enable HTTPS separately. The CI only runs checks/build, and does not require deployment secrets.

## License

Site copy and source code are not assigned a new license by this initial scaffold. Decide the site's license before accepting outside contributions.
