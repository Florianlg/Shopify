const GIFT_VARIANT_ID = 55987399197056;

document.addEventListener('DOMContentLoaded', () => {
  // On recupère un nombre de l'élément HTML (data-promo-discount)
  const PROMO_DISCOUNT_PERCENT = Number(document.documentElement.dataset.promoDiscount) || 10;

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

  //récupère le montant du cart
  function getCartTotal(cart) {
    let estimatedTotal = 0;

    // on parcoure le cart
    cart.items.forEach((item) => {
      // On cherche le <tr> avec data-variant
      const row = document.querySelector(`tr[data-variant-id="${item.variant_id}"]`);
      // on vérifie si data-promo=true
      const isPromo = row?.dataset.promo === 'true';
      // prix total avant remise
      const linePrice = (item.original_price * item.quantity) / 100;

      // applique la promo
      if (isPromo) {
        const discount = (linePrice * PROMO_DISCOUNT_PERCENT) / 100;
        estimatedTotal += linePrice - discount;
      } else {
        estimatedTotal += linePrice;
      }
    });

    return estimatedTotal;
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

    const estimatedTotal = getCartTotal(cart);
    promoContainer.innerHTML = '';

    if (estimatedTotal < 50) {
      promoContainer.textContent = `Plus que ${(50 - estimatedTotal).toFixed(2)} € pour la livraison gratuite.`;
    } else if (estimatedTotal < 100) {
      promoContainer.textContent = `Plus que ${(100 - estimatedTotal).toFixed(2)} € pour recevoir un cadeau offert.`;
    } else {
      promoContainer.textContent = 'Félicitations, un cadeau vous a été ajouté !';
    }
  }

  // Vérifie si le cadeau est dans le panier
  function giftIsInCart(cart) {
    const present = cart.items.some((item) => item.variant_id === GIFT_VARIANT_ID);
    return present;
  }

  // Ajoute le cadeau
  async function addGift(cart) {
    const estimatedTotal = getCartTotal(cart);
    if (estimatedTotal >= 100 && !giftIsInCart(cart)) {
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

    //ajout d'une promesse pour attendre que le nouveau dom soit injecté
    return new Promise((resolve) => {
      // création d'un spy qui attend les chgmt
      const observer = new MutationObserver((mutations, obs) => {
        // on vérifie si le cadeau est dans le dom
        const giftInput = document.querySelector(`input[data-quantity-variant-id="${GIFT_VARIANT_ID}"]`);
        if (giftInput) {
          // On arrête l'observation, on applique la fct lockGift(), et on sort de la promesse
          obs.disconnect();
          lockGift();
          resolve();
        }
      });

      // On observe les chgmt sur les enfants, et les couches inférieures
      observer.observe(cartDrawerElement, {
        childList: true,
        subtree: true,
      });

      // on injecte le nouveau html
      cartDrawerElement.renderContents({
        sections: {
          'cart-drawer': sections['cart-drawer'],
        },
      });
    });
  }

  // Récupère la key unique du produit cadeau dans le panier
  function getGiftKey(cart) {
    const giftItem = cart.items.find((item) => item.variant_id === GIFT_VARIANT_ID);
    return giftItem?.key;
  }

  // Supprime le cadeau
  async function removeGift(cart) {
    const estimatedTotal = getCartTotal(cart);
    if (estimatedTotal < 100 && giftIsInCart(cart)) {
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
