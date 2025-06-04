const GIFT_VARIANT_ID = 55987399197056;

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
    await removeGift(cart);
    lockGift();
  }

  // Créé le container dans le Drawer
  function createPromoContainer() {
    const drawerHeader = document.querySelector('.drawer__header');
    drawerHeader.style.flexWrap = 'wrap';
    // Vérification pour éviter doublon
    if (!drawerHeader || document.getElementById('promo-messages')) return;

    const promoMessage = document.createElement('p');
    promoMessage.id = 'promo-messages';
    promoMessage.style.margin = '1rem 0';
    promoMessage.style.width = '100%';
    promoMessage.style.fontWeight = 'bold';
    promoMessage.style.textAlign = 'center';
    // promoMessage.textContent = 'Attention promotion !';
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
      promoContainer.textContent = `Plus que ${(50 - total).toFixed(2)} € pour la livraison gratuite.`;
    } else if (total < 100) {
      promoContainer.textContent = `Plus que ${(100 - total).toFixed(2)} € pour recevoir un cadeau offert.`;
    } else {
      promoContainer.textContent = `Félicitations, un cadeau vous a été ajouté !`;
    }
  }

  // Vérifie si le cadeau est dans le panier
  function giftIsInCart(cart) {
    const present = cart.items.some((item) => item.variant_id === GIFT_VARIANT_ID);
    return present;
  }

  // Ajoute le cadeau
  async function addGift(cart) {
    if (cart.total_price >= 10000 && !giftIsInCart(cart)) {
      console.log('Le cadeau va être ajouté au panier');

      await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: GIFT_VARIANT_ID, quantity: 1 }),
      });

      //Pause réelle de 500ms
      await new Promise((resolve) => setTimeout(resolve, 500));
      await refreshDrawerWithLatestCart();
    }
  }

  // MAJ du Drawer avec renderContents()
  async function refreshDrawerWithLatestCart() {
    //Appelle la page courante mais Shopify retourne seulement cart-drawer
    const res = await fetch(`${window.location.pathname}?sections=cart-drawer`);
    const sections = await res.json();

    const cartDrawerElement = document.querySelector('cart-drawer');
    //Vérification si cart-drawer existe et renderContents()
    if (!cartDrawerElement?.renderContents) {
      console.warn('cart-drawer introuvable ou renderContents indisponible');
      return;
    }

    //Utilise la méthode renderContents() pour mettre à jour cart-drawer
    cartDrawerElement.renderContents({
      sections: {
        'cart-drawer': sections['cart-drawer'],
      },
    });
  }

  // Récupère la key unique du produit cadeau dans le panier
  function getGiftKey(cart) {
    const giftItem = cart.items.find((item) => item.variant_id === GIFT_VARIANT_ID);
    return giftItem?.key;
  }

  // Supprime le cadeau
  async function removeGift(cart) {
    if (cart.total_price < 10000 && giftIsInCart(cart)) {
      console.log('Le cadeau va être retiré du panier');

      await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: getGiftKey(cart), quantity: 0 }),
      });

      await refreshDrawerWithLatestCart();
    }
  }

  function lockGift() {
    const giftInput = document.querySelector(`input[data-quantity-variant-id="${GIFT_VARIANT_ID}"]`);
    if (!giftInput) return;

    // Ajoute une classe spéciale au <td> du produit cadeau
    const td = giftInput.closest('td.cart-item__quantity');
    if (td) {
      td.classList.add('gift-product');
    }

    // Verrouillage visuel
    giftInput.setAttribute('readonly', true);
    giftInput.style.cursor = 'not-allowed';
    giftInput.style.backgroundColor = '#f5f5f5';

    // Supprimer le bouton Supprimer
    const removeButton = giftInput.closest('.cart-item')?.querySelector('.cart-remove-button');
    if (removeButton) removeButton.remove();
  }

  // Événement Shopify au refresh du cart
  document.body.addEventListener('cart:refresh', updateCartDrawer);

  // Premier chargement du Drawer
  updateCartDrawer();

  // Reagir aux formulaires d’ajout
  document.querySelectorAll('form[action="/cart/add"]').forEach((form) => {
    form.addEventListener('submit', () => {
      setTimeout(() => updateCartDrawer(), 1000); //  délai  pour laisser Shopify ajouter l'article
    });
  });

  // Réagir aux boutons + / − ou suppression
  document.body.addEventListener('click', (e) => {
    const isQuantityOrRemove = e.target.closest('.quantity__button') || e.target.closest('.cart-remove-button');

    if (isQuantityOrRemove) {
      setTimeout(() => updateCartDrawer(), 1000); // délai pour laisser l’opération finir
    }
  });
});
