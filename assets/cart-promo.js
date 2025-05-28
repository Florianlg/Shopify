const GIFT_VARIANT_ID = 55987399197056;
let giftisAdded = false;

document.addEventListener('DOMContentLoaded', () => {
  // Récupère les infos du panier via l'API AJAX de Shopify
  async function fetchCart() {
    const res = await fetch('/cart.js');
    return res.ok ? res.json() : null;
  }

  // Actualise le Drawer
  async function updateCartDrawer() {
    const cart = await fetchCart();
    if (!cart) return;
    console.log(cart);
    updatePromoMessage(cart);
    await addGift(cart);
  }

  // Créé le container dans le Drawer
  function createPromoContainer() {
    const drawerHeader = document.querySelector('.drawer__header');
    drawerHeader.style.flexWrap = 'wrap';
    if (!drawerHeader || document.getElementById('promo-messages')) return;

    const promoMessage = document.createElement('p');
    promoMessage.id = 'promo-messages';
    promoMessage.style.margin = '1rem 0';
    promoMessage.style.width = '100%';
    promoMessage.style.fontWeight = 'bold';
    promoMessage.style.textAlign = 'center';
    promoMessage.textContent = 'Attention promotion !';
    drawerHeader.insertBefore(promoMessage, drawerHeader.lastChild);
  }

  // Créé la logique d'affichage du message
  function updatePromoMessage(cart) {
    createPromoContainer();
    const promoContainer = document.getElementById('promo-messages');
    if (!promoContainer) return;

    const total = cart.total_price / 100;
    promoContainer.innerHTML = '';

    if (total < 50) {
      promoContainer.textContent = `🚚 Plus que ${(50 - total).toFixed(2)} € pour la livraison gratuite.`;
    } else if (total < 100) {
      promoContainer.textContent = `🎁 Plus que ${(100 - total).toFixed(2)} € pour recevoir un cadeau offert.`;
    } else {
      promoContainer.textContent = `🎉 Félicitations, un cadeau vous a été ajouté !`;
    }
  }

  // Vérifie si le cadeau est dans le panier
  function giftIsInCart(cart) {
    const present = cart.items.some((item) => item.variant_id === GIFT_VARIANT_ID);
    if (!present) giftJustAdded = false;
    return present;
  }

  // Ajoute le cadeau
  async function addGift(cart) {
    if (cart.total_price >= 10000 && !giftIsInCart(cart) && !giftisAdded) {
      console.log('Le cadeau va être ajouté au panier');

      await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: GIFT_VARIANT_ID, quantity: 1 }),
      });

      giftJustAdded = true;
      await updateCartDrawer(); // met à jour les messages promo
    }
  }

  // Événement Shopify au refresh du cart
  document.body.addEventListener('cart:refresh', updateCartDrawer);

  // Premier chargement du Drawer
  updateCartDrawer();

  // Reagir aux formulaires d’ajout
  document.querySelectorAll('form[action="/cart/add"]').forEach((form) => {
    form.addEventListener('submit', () => {
      setTimeout(() => updateCartDrawer(), 1000); // ⏱ temps pour laisser Shopify ajouter l'article
    });
  });

  // Réagir aux boutons + / − ou suppression
  document.body.addEventListener('click', (e) => {
    const isQuantityOrRemove = e.target.closest('.quantity__button') || e.target.closest('.cart-remove-button');

    if (isQuantityOrRemove) {
      setTimeout(() => updateCartDrawer(), 800); // ⏱ petit délai pour laisser l’opération finir
    }
  });
});
