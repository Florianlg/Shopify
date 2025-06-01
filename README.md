# Test Développeur E-commerce Shopify

## Objectif

Projet réalisé dans le cadre d’un test technique visant à démontrer la maîtrise de Shopify CLI, du thème Dawn, de la personnalisation du panier avec le drawer, de l’API Shopify, et de bonnes pratiques de versioning GitHub.

## Installation et configuration de l’environnement local

### Prérequis

- Node.js v16
- Shopify CLI
- Git
- Une boutique Shopify

### Installation

1. Cloner le dépôt Git :

```bash
git clone https://github.com/Florianlg/Shopify.git
cd Shopify
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

## Bonnes pratiques

- Commentaires de code clairs pour expliquer les blocs de logique

- Branches dédiées pour chaque fonctionnalité (feature/exo1-cart-promo)

- Commits fréquents et explicites

---

## Test en local

1. Lancer `shopify theme dev`
2. Ajouter ou retirer des produits depuis la boutique
3. Ouvrir le drawer panier : les messages s’affichent dynamiquement
4. Tester les seuils : vérifier apparition/disparition du cadeau et des messages
5. Vérifier que les paramètres activent le Drawer pour le cart.

---

## Liens

- [Exercice 1](./documentations/Exo%201/README.md)
- [Exercice 2](./documentations/Exo%202/Flow_Configuration.md)

---
