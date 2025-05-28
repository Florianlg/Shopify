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
