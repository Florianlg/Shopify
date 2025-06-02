# 🎯 Documentation Technique : Affichage dynamique des remises - Shopify

## ✅ Contexte

Avec le thème Dawn, afficher dynamiquement une remise auto de 10 % pour tous les produits appartenant à la collection _Promotions_.

Elle doit être visible alors :

- Sur la fiche produit
- Sur les pages de collection
- Dans le panier classique (`main-cart-items`)
- Dans le cart drawer (`cart-drawer`)

---

## 1. Détection de la collection et application de la remise

- Une fois la collection créée dans l'admin, vérifier qu'elle porte bien le handle (URL) `promotions`.
- Le taux de remise sera stocké dans le `settings_schema.json` via :

```json
{
  "type": "text",
  "id": "promo_discount_percent",
  "label": "Pourcentage de remise sur 'promotions'",
  "default": "10"
}
```

- Les fichiers modifiés sont :
  - `price.liquid`,
  - `main-cart-items.liquid`,
  - `cart-drawer.liquid`,
- On vient ensuite vérifier si le produit est concerné par la réduction grâce à `collections.promotions.products` pour vérifi s'il est concerné.
- Le prix remisé est calculé avec :

```liquid
{% assign discount_percent = settings.promo_discount_percent | plus: 0 %}
{% assign discount_multiplier = discount_percent | divided_by: 100.0 %}
{% assign discount_amount = price | times: discount_multiplier %}
{% assign discounted_price = price | minus: discount_amount %}
```

---

## 2. Affichage du prix barré + prix remisé

### 2.1 Sur la fiche produit et les pages de collection (`price.liquid`)

- On barre le prix d'origine avec `text-decoration: line-through`
- Le prix remisé est affiché juste après
- Le badge affiche automatiquement la remise `-10%` par défaut.
- Le bloc Liquid complet :

```liquid
<span class="price-item price-item--regular" style="text-decoration: line-through;">
  {{ money_price }}
</span>
<span class="price-item price-item--sale">
  {{ discounted_price | money }}
</span>
<span class="badge">-{{ discount_percent }}%</span>
```

---

## 3. Mise à jour dynamique dans le panier

### 3.1 Dans `main-cart-items.liquid`

- Affichage du prix barré (original)
- Affichage du prix remisé avec `final_price` si `line_level_discount_allocations` n'est pas vide
- On cache le badge par défaut `.discounts list-unstyled`
- Possible d'affichaer le nom dynamique de la remise avec :

```liquid
<span class="badge">
  {{ item.line_level_discount_allocations[0].discount_application.title }}
</span>
```

### 3.2 Dans `cart-drawer.liquid`

Même logique pour le drawer : :

```liquid
{% if item.line_level_discount_allocations.size > 0 %}
  <s>{{ item.original_price | money }}</s>
  <strong>{{ item.final_price | money }}</strong>
  <span class="badge">{{ item.line_level_discount_allocations[0].discount_application.title }}</span>
{% endif %}
```

> La promotion est gérée dans l'admin Shopify (Remise automatique sur la collection `Promotions`).

---

## 4. Performance et maintenabilité

- Le code est commenté
- Le calcul Liquid est réalisé **dans le template** pour une meilleure performance
- Le badge est dynamique `promo_collection.title`.
- Le badge se met à jour automatiquement si le nom change.

---

## Instructions de test

1. **Vérifier la collection "Promotions"** existe et contient des produits.
2. **Créer une remise automatique** depuis l’admin Shopify :

   - Avec pour nom : "Soldes"
   - Une remise de : 10 %
   - qui cible la collection "Promotions"

3. Sur une fiche produit de cette collection :

   - Vérifier que le prix barré et le prix remisé s’affichent.
   - Vérifier que le badge affiche bien le nom de la promotion (Soldes).

4. Ajouter le produit au panier :

   - Le prix original doit être barré.
   - Le prix remisé doit être affiché.
   - Le label de la promo doit s’afficher.

5. Changer le nom ou le pourcentage de la promotion :

   - L’interface s’adapte automatiquement.

---

## Fichiers modifiés

- `price.liquid`
- `main-cart-items.liquid`
- `cart-drawer.liquid`
- `settings_schema.json`
