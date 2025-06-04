## 1. Objectif

- Vérifier si une commande contient le produit cadeau (SKU `GIFT001` ou ID produit `15170885910912`).
- Déclencher un appel HTTP vers une application personnalisée externe.
- L'application vérifie le stock réel du produit cadeau.
- Si le stock est :
  - **< 5** → envoi d'une **alerte email** à l’équipe logistique.
  - **= 0** → désactivation de l’affichage du message cadeau dans l’interface client (via `metafield`).

---

## 2. Configuration du flux pas à pas

### Déclencheur

- **Order Created** (`Order / Order Created`)
  - Ce déclencheur active le flux dès qu'une nouvelle commande est enregistrée.

### Condition

- **Condition : la commande contient le produit cadeau**
  - Vérifie si un des `line items` a :
    - `Product ID` = `15170885910912`
    - ou `SKU` = `GIFT001`

### Action

- **Requête HTTP**
  - Méthode : `POST`
  - URL : `https://webhook.site/bb17a13b-b41f-4626-aea6-7dd8e40c23fa`
  - Headers :
    - `Content-Type: application/json`
  - `body` :

```json
{
  "order_id": {{ order.id }},
  "product_id": "15170885910912",
  "sku": "GIFT001",
  "variant_id": "55987399197056",
  "quantity": 1,
  "customer_email": {{ order.customer.email }}
}
```

---

## 3. Exemple de payload et logique de vérification du stock

Payload reçu via Webhook :

```json
{
  "order_id": "gid://shopify/Order/11755927830912", //Log la commande
  "sku": "GIFT001", // Identifie le produit
  "product_id": "15170885910912", // Identifie le produit
  "variant_id": "55987399197056", //Identifie la variante du produit si nécessaire
  "quantity": 1, //Nombre à décrémenter
  "customer_email": "client@example.com" //UTile si besoin de contacter le client
}
```

### Logique de traitement dans l'application

1. Appel à l’API Shopify pour récupérer l’`inventory_item_id` depuis le `product_id`.
   `GET /admin/api/2025-04/products/{product_id}/variants.json`

2. Appel à `GET /admin/api/2025-04/inventory_levels.json?inventory_item_ids=celuirécupéré` pour récupérer la quantité disponible `available` et la `location_id`.
3. Si :
   - `available >= 1` → décrémenter le stock via `POST /admin/api/2025-04/inventory_levels/adjust.json` avec les paramètres : `inventory_item_id` `location_id` `available_adjustment`
   - `available < 5` → envoyer une **alerte email**.
   - `available == 0` → mettre à jour le metafield `value` à `false` avec `PUT /admin/api/2025-04/products/{product_id}/metafields/{metafield_id}.json`. Le front lira la valeur du metafield et masquera alors les messages

---

## 4. Intégration avec la logique d’ajout automatique (exercice 1)

1. Le client ajoute des produits au panier. (le message du cadeau apparait en fonction du metafiled)
2. Si le panier atteint 100€, le script JS du cart drawer ajoute automatiquement le produit cadeau via AJAX si celui-ci est disponible
3. Le client passe commande.
4. Shopify Flow détecte la commande, vérifie la présence du produit cadeau, et envoie les données à l’application.
5. L'application reçoit la requête et va devoir récupérer l'`inventory_item_id` qui va nous permettre de consulter et modifier le stock:
   - Appeler ([doc](https://shopify.dev/docs/api/admin-rest/2025-04/resources/product-variant#get-products-product-id-variants))
     ```
     GET /admin/api/2025-04/products/{product_id}/variants.json
     ```
   - Récupérer
     ```json
     {
       "inventory_item_id": 123456
     }
     ```
   - Lire le stock :
     ```
     GET /admin/api/2025-04/inventory_levels.json?inventory_item_ids=123456
     ```
     Réponse :
   ```json
   {
     "available": 6,
     "location_id": 123456789
   }
   ```
6. L'application effectuera :

- **Si stock >= 1** : elle appelle l’API suivante pour **décrémenter**:

```json
{
  "location_id": 123456789,
  "inventory_item_id": 123456,
  "available_adjustment": -1
}
```

- **Si stock < 5** : elle peut envoyer un **email d’alerte en interne** .
- **Si stock = 0** : elle peut **mettre à jour un metafield** sur le produit pour **désactiver le message** sur le site.

---

## 5. Gestion des erreurs et scénarios particuliers

- Ne pas décrémenter le stock si le stock est déjà à 0
- Alerte interne :
  - **Email d’alerte**
  - Décision de **retirer manuellement** le produit de la commande, **envoyer un autre cadeau** à la place ou **contacter le client**.
- MAJ d'un `metafield` produit

  - On récupère `l'id du metafield` :

    `GET /admin/api/2025-04/products/{product_id}/metafields.json`

  - La réponse étant :

  ```json
  [
    {
      "value": "having fun",
      "owner_id": 632910392,
      "namespace": "my_fields",
      "key": "best_for",
      "id": 1001077698,
      "description": null,
      "created_at": "2025-01-02T11:29:59-05:00",
      "updated_at": "2025-01-02T11:32:28-05:00",
      "owner_resource": "product",
      "type": "single_line_text_field",
      "admin_graphql_api_id": "gid://shopify/Metafield/1001077698"
    }
  ]
  ```

  - On peut alors MAJ ce metafield :

    ```json
    PUT /admin/api/2025-04/products/{product_id}/metafields/1001077698.json
    Content-Type: application/json
    X-Shopify-Access-Token: shpat_xxxx

    {

    "metafield": {
    "value": "false",
    "type": "boolean"
    }
    }
    ```

  - Ce champ permettra alors au front de savoir si le produit est disponible ou non
    - A chaque affichage du paniern le script :
      1. Interroge le **Storefront** pour lire le metafield :
      - Si **value = false**, le front cache le message (“Plus que 100 € pour un cadeau offert”), **n’ajoute plus** le produit cadeau au panier, pourra afficher un message alternatif (“Cadeau temporairement indisponible”).

---

## 6. (Optionnel) Action complémentaire : gestion de produits liés

### Contexte

L'utilisateur passe une commande comprenant un produit appelé Kit Tennis, comprenant deux produits vendus également séparément (Lot de balles et Raquette de tennis).

### Objectif:

Lorsque l'utilisateur valide sa commande, la décrémentation des deux produits doit se faire. Pour cela, deux requête HTTP on été ajoutées afin que l'application puisse ensuite décrémenter ces produits.
Les payloads et la logique sont similaires que précédemment.

### Concrètement

Si le produit `Kit sport` (`SKU = KIT001`) est commandé, Shopify Flow envoie deux requêtes HTTP supplémentaires pour gérer :

- Le stock de `LOT001` (lot de balles),
- Le stock de `RAQ001` (raquette de tennis).

Les payloads sont les suivants :

Pour la raquette :

```json
{
  "order_id": gid://shopify/Order/11775694242176,
  "sku": "RAQ001",
  "product_id": "15184195027328",
"variant_id": "56026688356736",
  "quantity": 1,
"customer_email": "client@example.com"
}
```

Pour le lot de balles :

```json
{
  "order_id": gid://shopify/Order/11775694242176,
  "sku": "BAL001",
  "product_id": "15184193585536",
"variant_id": "56026715128192",
  "quantity": 1,
"customer_email":
}
```
