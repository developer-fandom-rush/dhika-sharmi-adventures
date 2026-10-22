# Four Walls visual cast

The opening chapters use four female reference photographs from Midnight Bet's Characters section.

| Four Walls lead | Midnight Bet reference | Source asset |
| --- | --- | --- |
| Ankita Bansal | Mira | `assets/midnight-bet/MIRA.jpg` |
| Shivani Sinha | Rhea | `assets/midnight-bet/RHEA.jpg` |
| Shreya Mehta | Naina | `assets/midnight-bet/NAINA.jpg` |
| Tanya Arora | Ananya | `assets/midnight-bet/ANANYA.jpg` |

The original reference images are unchanged. `character-visuals.json` records their source commit, original paths and SHA-256 checksums, plus the assigned Four Walls character IDs.

## Generated assets

Created with the built-in image-generation tool. The complete prompts and reference-file assignments are in `visual-prompts.json`.

| Asset | Placement and identity order |
| --- | --- |
| `assets/four-walls/husbands-atlas.webp` | Top left Ritvik, top right Aditya, bottom left Samar, bottom right Dev |
| `assets/four-walls/elders-atlas.webp` | Top left Mahendra, top right Harish, bottom left Prakash, bottom right Virendra |
| `assets/four-walls/prologue-morning.webp` | Prologue: Ankita, Shivani, Shreya, Tanya, left to right, in their individual morning routines |
| `assets/four-walls/part1-wedding-prep.webp` | Episode 01 Part 1: the same four leads preparing the wedding entrance |

The male portraits are invented identities. Each atlas contains four equal quadrants, displayed individually through CSS clipping. The scene illustrations use all four source photographs as facial references. Outfit colors stay consistent: dusty rose, burgundy, teal and navy, respectively. Scene images and invented portraits are labeled as AI-generated in the interface.

Generated compositions retain their full dimensions and are encoded as WebP for the website, totaling approximately 895 KiB. The image manifest contains dimensions and checksums for every generated asset.

## UI changes

- Twelve existing character profiles and their menu entries show portraits: four leads, four husbands and four senior men.
- Character Visuals contains the four named lead references, male portraits, family connections and a scene gallery.
- The Prologue and Episode 01 Part 1 each contain an illustration with a caption and a full-size image link.
- Original story text, 30 character fact sections and DHIKA source-review sections are preserved.

## Validation

Repository source-integrity and relationship/director-cycle checks pass. JavaScript syntax, asset paths, checksums, image dimensions, tab IDs, portrait assignments and preservation of existing story/profile content have been checked locally. Browser layout verification remains pending a reachable deployed preview.
