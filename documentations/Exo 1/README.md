## Contexte

Le but ici est :

- d'inciter à augmenter le panier avec des messages de progression
- de récompenser le client avec un cadeau offert à partir de 100 €
- d'éviter tout rechargement de page lors de l'ajout ou suppression du cadeau

Bonus :

- Le cadeau est supprimé lorsque le panier repasse sous les 100€
- Le modification du produit cadeau n'est plus disponible (commandes '+', '-', qunatité, suppression)

---

## Méthode de récupération du total du panier

Le total du panier est récupéré en appelant l’API AJAX de Shopify :

```js
fetch("/cart.js").then((res) => res.json());
```

Cela retourne un objet `cart` contenant notamment:

- `total_price` : total en centimes
- `items` : tableau des produits
- `item_count` : nombre d’articles dans le cart

---

## Logique de calcul et d'affichage

1. **Affichage dynamique du message** dans le cart drawer :

   - `< 50 €` : message sur la livraison gratuite
   - `< 100 €` : message sur le cadeau
   - `>= 100 €` : message de félicitations

2. **Ajout du message dans `.drawer__header`** du cart drawer avec un `p#promo-messages`

3. **Rafraîchissement des messages** déclenché :
   - au chargement
   - après ajout de produit
   - après modification ou suppression d’article dans le drawer

---

## Procédure d'ajout du produit cadeau

### Plusieurs conditions à vérifier:

- Le panier atteint ou dépasse **100 €**
- Le produit cadeau **n’est pas déjà présent**
- Il **n’a pas déjà été ajouté lors de cette session**

### Si conditions vérifiées alors on envoie une requête AJAX :

```js
fetch("/cart/add.js", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id: GIFT_VARIANT_ID, quantity: 1 }),
});
```

Elle contient l'id du produit cadeau à ajouter, et la quantité.

Puis on recharge dynamiquement seulement le cart drawer via :

```js
fetch(window.location.pathname + "?sections=cart-drawer");
```

Dans cart-drawer.js, nous avons la méthode renderContents() instanciée pour mettre à jour automatiquement le DOM où cart-drawer est égal à la réponse obtenue

```js
cartDrawerElement.renderContents({...});
```

---

## Verrouillage du produit cadeau

Une fois dans le panier :

- Boutons `+`, `−` supprimés
- Bouton “Supprimer” masqué
- Champ quantité rendu `readonly`
- Ajout d’une classe CSS `.gift-product` sur le `<td>` pour cacher les éléments en CSS et éviter les flashs visuels

---

## Suppression automatique

Si le panier repasse sous 100 € :

- Le produit cadeau est retiré via `/cart/change.js` (quantity: 0)
- Le cart drawer est mis à jour dynamiquement

---

## Test en local via Shopify CLI

1. Lancer Shopify CLI :

```bash
shopify theme init votre-projet --clone-url https://github.com/Shopify/dawn
shopify theme dev --store=your-store.myshopify.com
```

Remplacer your-store.myshopify.com par votre url.

2. Accéder à l’URL générée par le CLI
3. Coller dans `assets/` le fichier `cart-promo.js` fourni
4. Ajouter le script `cart-promo.js` dans `theme.liquid` :

```liquid
 <script src="{{ 'promo-cart.js' | asset_url }}" defer="defer"></script>
```

4. Ajouter des produits jusqu’à 100 € pour tester

5. Dans les paramètres, penser à modifier le cart en Drawer

---

## Fichier configurable

```js
const GIFT_VARIANT_ID = 55987399197056;
```

Attention : Cette constante est à adapter à votre projet ! C'est un id unique à chaque produit. Pour cela, récupérez l'ID de la variante:

1. Ajouter le produit cadeau au panier
2. Dans la console :

```js
fetch("/cart.js")
  .then((r) => r.text())
  .then(console.log);
```

3. Récupérer l'id de variant_id dans la réponse console

4. L'intégrer :

```js
const GIFT_VARIANT_ID = ...
```

---

## Fichiers concernés

- `assets/promo-cart.js` : script principal
- `theme.liquid` : inclure le script JS
- `component-cart-drawer.css` : Ajout de style pour vérouiller le produit cadeau

---
