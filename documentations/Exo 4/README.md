# Exercice 4 – Remise automatique de 10 %

## Contexte

Les produits appartenant à la collection `Promotions` ont une une remise automatique
L’objectif est d’afficher les prix barrés, les prix remisés et un badge de promotion sur :

- Les fiches produits
- La page de collection Promotions
- Le panier
- Le cart drawer

La remise est définie par une **promotion automatique dans l’admin Shopify**. Le système s’adapte automatiquement si le pourcentage ou le nom de la promo change.

---

## Objectif fonctionnel

Pour tous les produits de la collection `Promotions` :

- Affichage du **prix barré** et du **prix remisé**
- Affichage d’un **badge dynamique** modifiable dans les paramètres
- Affichage d’un **total estimé après remise** dans le panier et le cart drawer
- NB : Le montant réel n'a pas pu être traité, il reste géré par Shopify au moment du checkout

---

## Paramètres configurables dans l'admin (`settings_schema.json`)

```json
{
  "type": "text",
  "id": "promo_badge_label",
  "label": "Texte du badge",
  "default": "Soldes"
},
{
  "type": "range",
  "id": "promo_discount_percent",
  "label": "Remise automatique (%)",
  "min": 0,
  "max": 100,
  "default": 10,
  "step": 1
}
```

## Mise en place technqique

### Fichiers modifiés

- `main-cart-items.liquid`
- `cart-drawer.liquid`
- `price.liquid`
- `main-cart-footer.liquid`
- `settings_schema.json`
- `theme.liquid`
- `cart-promo.js`

### Fichiers créés

- `promo-line-total.liquid`
- `promo-cart-totals/liquid`
- `promo-price.liquid`

### `settings_schema.json`

Création d'un onglet dans l'admin avec la possibilité de modifier le pourcentage de remise et le titre de la promotion

### `promo-price.liquid`

Création d'un snippet pour afficher le prix barré + le prix remisé + le badge promo si le produit appartient à "Promotions"
Plusieurs paramètres requis :

- product
- promo_discount_percent (optionnel, fallback 10)
- promo_badge_label (optionnel, fallback 'Soldes')

### `promo-line-total.liquid`

Création d'un snippet pour afficher le total remisé par ligne de panier si le produit appartient à "promotions"
Requiert :

- item : l'objet ligne du panier (cart item)
- promo_discount_percent : (optionnel) transmis depuis settings

### `promo-cart-totals.liquid`

Création d'un snippet pour afficher le total du panier

### `main-cart-items.liquid`

- Appel du snippet promo-price pour l'affichage des prix
- Appel 2x du snippet promo-line-total pour afficher le total de la ligne du panier
- Cache l'ancien badge

### `cart-drawer.liquid`

- Appel du snippet promo-price pour l'affichage des prix
- Appel du snippet promo-line-total pour afficher le total de la ligne du panier
- Appel du snippet promo-cart-totals pour affihcer le total du panier
- Liaison avec le JS, ajout en attribut du variant-id et de data-promo

### `price.liquid`

- Appel 2x du snippet promo-price pour l'affichage des prix

### `main-cart-footer.liquid`

- Appel du snippet promo-cart-totals pour affihcer le total du panier

### `cart-promo.js`

- On lit la remise dynamiquement avec `Number(document.documentElement.dataset.promoDiscount) || 10`
- Création d'une fonction `getCartTotal(cart)` qui boucle sur chaque item du panier et calcul le total si promo ou non.
- On utilise cette fonction pour **Ajouter le cadeau**, **Supprimer le cadeau**, **Ajuster les messages**

### `theme.liquid`

- Modification de la balise HTML (ajout d'un attribut data-promo-discount pour la récupérer en JS)

---

## Test local

### 1. Configuration dans l’admin

1. Créer une collection avec le handle (URL) : `promotions`
2. Ajouter des produits liés à cette collection
3. Créer une **promotion automatique** de -10% dans l’admin sur cette collection
   - Nom de la promo : Soldes

### 2. Ajout et création des fichiers fournis

### REmplacer les fichiers existant :

- `main-cart-items.liquid`
- `cart-drawer.liquid`
- `price.liquid`
- `main-cart-footer.liquid`
- `settings_schema.json`
- `theme.liquid`
- `cart-promo.js`

### Créer les fichiers dans `snippet/`

- `promo-line-total.liquid`
- `promo-cart-totals/liquid`
- `promo-price.liquid`

### 3. Lancement de l'environnement de développement

- `shopify theme dev`

### 4. Vérifications visuelles

- Sur les fiches produits

  - Affichage du prix barré
  - Affichage du prix remisé
  - Badge avec le texte dynamique (ex. « Soldes printemps »)

- Sur les pages de collection

  - Identique à la fiche produit

- Dans le panier

  - Ligne du produit remisé :

    - Total remisé en fonction de la quantité
    - Message affiché

  - Total estimé après remise

- Dans le cart drawer
  - Idem que panier : prix remisé + total estimé dynamique

```

```
