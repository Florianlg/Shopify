# Test Développeur E-commerce Shopify

## Installation et configuration de l’environnement local

### Prérequis

- Node.js v16 minimum : [https://nodejs.org/](https://nodejs.org/)
- Shopify CLI : [https://shopify.dev/docs/themes/tools/cli/installation](https://shopify.dev/docs/themes/tools/cli/installation)
- Git : [https://git-scm.com/](https://git-scm.com/)
- Une boutique Shopify

### 🔧 Installation

1. Cloner le dépôt Git :

```bash
git clone https://github.com/Florianlg/Shopify.git
```

2. Se connecter à la boutique Shopify :

```bash
shopify login --store boutique.myshopify.com
```

NB: Remplacer boutique, par l'URL de votre boutique

3. Lancer le serveur de développement :

```bash
shopify theme dev
```

Suivre l'URL de prévisualisation générée.

---

## 📁 Structure du projet

```
.
├── assets/
│   └── promo-cart.js
│   └── component-cart-drawer.css
├── sections/
├── config/
├── templates/
├── locales/
├── snippets/
├── layout/
└── theme.liquid
└── README.md
```

---

## 🔧 Commandes utiles Shopify CLI

| Commande             | Description                              |
| -------------------- | ---------------------------------------- |
| `shopify theme dev`  | Lance le serveur local                   |
| `shopify theme push` | Pousse les modifications sur la boutique |
| `shopify theme open` | Ouvre la boutique dans le navigateur     |

---

## 🔹 Fonctionnalités mises en place

- Affichage dynamique de messages promotionnels selon le montant du panier :

  - Moins de 50 € : incitation livraison gratuite
  - Moins de 100 € : incitation cadeau offert
  - 100 € ou plus : message de félicitation

- Ajout automatique d’un produit cadeau via l’AJAX API Shopify lorsque le total ≥ 100 €

- Mise à jour dynamique du cart drawer sans rechargement de page

- Suppression du cadeau si le montant redescend sous 100 €

- Verrouillage visuel et fonctionnel du produit cadeau dans le drawer

---

## Gestion de version Git

- Branche principale : `main`
- Branche fonctionnelle : `feature/exo1-cart-promo`

---

## Test en local

1. Lancer `shopify theme dev`
2. Ajouter ou retirer des produits depuis la boutique
3. Ouvrir le drawer panier : les messages s’affichent dynamiquement
4. Tester les seuils : vérifier apparition/disparition du cadeau et des messages

---
