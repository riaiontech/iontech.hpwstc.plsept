# IONTECH Professional Computing Catalog

## GitHub Pages structure

Upload these files to the root of your repository:

- `index.html`
- `admin.html`
- `app.js`
- `admin.js`
- `products.js`
- `styles.css`
- `404.html`
- `robots.txt`
- `README.md`
- `catalog-summary.json`

GitHub Pages should use `main` → `/(root)` as the publishing source.

## Catalog behavior

The public catalog retains the search engine and uses model-family selections:

### Mobile Workstation
- ZB8 G1i
- ZB8 G2i
- ZB8 G2a
- ZBook X G1i
- ZBook X G2i
- ZB Ultra G1a

### Tower
- Z1 Tower G1i
- Z2 Mini G1a
- Z2 Tower G1i

### Thin Client
- ProDesk 5
- Elite t655
- Elite t660
- elite t755

There is no availability filter, quantity-available display, or price sorting.

Each product can show:
- On-Hand price
- Order-Basis price
- Two images
- Specifications
- One combined components table

Admin also provides:
- Editable "Pricelist updated as of" date
- General SEO title/description
- On-Hand SEO title/description
- Order-Basis SEO title/description
- Product images
- Product specifications
- Product components
- Branding/site SEO
- Backup/export/import

## Important admin limitation

This is a static GitHub Pages website. Browser-based Admin edits are stored in that browser's local storage; they do not automatically write changes back to GitHub for other visitors. A shared multi-user CMS requires a backend/database.
