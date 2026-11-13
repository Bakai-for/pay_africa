# PayAfrica Marketplace V2 — Place de Marché Multi-Partenaires
### 3 Acteurs • Commission 1.5% • Paiement Mobile Money • Bons de Réduction

**Réorientation du 21 Oct 2026 — Yaoundé**

---

## 🎯 Les 3 Acteurs

| Acteur | Rôle | Ce qu'il peut faire |
|--------|------|---------------------|
| **🏪 Entreprise Partenaire** | Commerçant / Boutique | Crée un compte, ajoute coordonnées (nom boutique, adresse, GPS, téléphone, logo), crée des catégories/types d'articles, ajoute articles avec prix, gère stock, voit commandes, encaisse (total - 1.5% commission), demande payout vers son Mobile Money |
| **🛒 Client** | Acheteur final | Crée un compte (sans wallet — il paie directement), parcourt catalogue de TOUS les partenaires, ajoute au panier, paie via MTN/Orange/Airtel/… (USSD Push), reçoit bons de réduction selon fidélité, consulte historique |
| **👑 Propriétaire (Admin)** | Prestataire PayAfrica | Gère TOUT : taux commission (1.5% par défaut), règles bons de réduction (ex: 5 transactions = 5%), valide/suspend partenaires, voit toutes transactions, encaisse commission, édite CGU / Politique de confidentialité, tableau de bord CA global |

---

## 🔄 Flux Complet

```
1. Partenaire s'inscrit → Admin valide → Partenaire ajoute "Boutique Amina - Yaoundé Bastos" + articles (Riz 5 000 XAF, Huile 3 500 XAF...)
2. Client s'inscrit → accepte CGU → parcourt "Tous les articles" → filtre par partenaire/catégorie
3. Client met 2 articles au panier → Voit total 8 500 XAF → Applique bon de réduction (-500) → Total 8 000 XAF
4. Client choisit opérateur (MTN MoMo) + numéro → Clique "Payer" → USSD Push → valide PIN → Paiement
5. Backend : Collect 8 000 XAF → Commission 1.5% = 120 XAF → 7 880 XAF pour partenaire, 120 XAF pour Admin
6. Commande passe en "PAYÉ" → Partenaire notifié → Prépare livraison → Client voit "En préparation"
7. Fidélité : Client gagne 1 point par transaction → Après 5 commandes → Bon -10% auto-généré
```

**Important : Le client N'A PAS de wallet PayAfrica.** Il paie à chaque fois via son Mobile Money externe. C'est plus simple réglementairement (pas de détention de fonds).

---

## 🗃️ Modèle de Données (Nouveau)

```
User (phone, fullName, pinHash, role: CLIENT/PARTNER/ADMIN, termsAccepted, termsVersion)
  └─ PartnerProfile (userId, shopName, description, address, city, gpsLat, gpsLng, logo, phone, isValidated, rating)
       └─ ProductCategory (partnerId, name: "Alimentation", "Cosmétiques"...)
            └─ Product (categoryId, name, price, stock, image, description, isActive)
  └─ Order (clientId, partnerId, total, commission, netToPartner, discount, status: PENDING/PAYÉ/PRÉPARATION/LIVRÉ/ANNULÉ, operator, clientPhone)
       └─ OrderItem (orderId, productId, qty, unitPrice, subtotal)
  └─ Voucher (clientId, code: "FIDELITE-5-XXXX", discountPercent, discountAmount, minOrder, isUsed, expiresAt, reason: "5 commandes")
  └─ TermsVersion (version, cguContent, privacyContent, createdAt)
  └─ TermsAcceptance (userId, termsVersion, acceptedAt)
  └─ AppSettings (commissionPercent: 1.5, voucherRules JSON, ...)

Ancien : Wallet/Transaction → Conservé uniquement pour les collect/payout techniques, mais le client n'a plus de Wallet visible.
```

---

## 🎁 Système de Bons de Réduction (Géré par Admin)

Admin configure dans `/admin/parametres` :

```json
{
  "commissionPercent": 1.5,
  "voucherRules": [
    { "minTransactions": 5, "discountPercent": 5, "expiresInDays": 30 },
    { "minTransactions": 10, "discountPercent": 10, "expiresInDays": 60 },
    { "minTransactions": 20, "discountPercent": 15, "expiresInDays": 90 },
    { "minTransactions": 50, "discountPercent": 20, "expiresInDays": 90 }
  ],
  "usageBonus": { "highUsageThreshold": 10, "bonusPercent": 2 }
}
```

**Logique** : Après chaque commande PAYÉE → `LoyaltyService` compte transactions du client → si palier atteint et bon non déjà offert → génère `Voucher` → notif client "Bravo ! -10% sur votre prochaine commande".

Le client applique le code au checkout → `discount = total * discountPercent` → `netToPartner = (total - discount) * 0.985`.

---

## 🔐 CGU & Confidentialité

- Admin édite le contenu dans `/admin/cgu` (éditeur riche)
- À l'inscription, chaque acteur doit cocher "J'ai lu et j'accepte les CGU et la politique de confidentialité" (lien vers `/cgu`)
- `TermsAcceptance` enregistré avec `termsVersion`
- Si Admin publie une nouvelle version → au prochain login, l'utilisateur doit re-accepter (bloquant)

---

## 🚀 Structure Technique V2

```
backend/src/main/java/com/payafrica/
  entity/
    User (role CLIENT/PARTNER/ADMIN)
    PartnerProfile
    ProductCategory
    Product
    Order + OrderItem
    Voucher
    AppSettings (singleton row id=1)
    TermsVersion + TermsAcceptance
  controller/
    AuthController (register avec role + termsAccepted)
    PartnerController (/partner/profile, /partner/products, /partner/orders)
    ProductController (/products, /products?partnerId=, /categories)
    OrderController (/orders/place, /orders/my, /orders/partner)
    AdminController (/admin/settings, /admin/partners, /admin/orders, /admin/stats)
    VoucherController (/vouchers/my, /vouchers/apply)
    TermsController (/terms/current, /terms/accept)
  service/
    OrderService (placeOrder → collect Mobile Money → commission → voucher)
    LoyaltyService (check & generate voucher)
    SettingsService (commission, rules)

frontend/src/pages/
  client/  Shop.jsx (catalogue), Cart.jsx, Checkout.jsx, MyOrders.jsx
  partner/ Dashboard.jsx, Catalog.jsx, Orders.jsx, Payout.jsx
  admin/   Dashboard.jsx, Partners.jsx, OrdersAdmin.jsx, Settings.jsx (commission + vouchers + CGU), Stats.jsx
  Terms.jsx (CGU à accepter)

mobile/lib/screens/
  client/ (shop, cart, checkout)
  partner/ (catalog, orders)
```

---

## 📦 Lancer la V2

```bash
# Backend V2 (même stack Java 17 + H2)
cd payafrica-marketplace/backend
mvn spring-boot:run  # http://localhost:8080

# Frontend V2
cd payafrica-marketplace/frontend
npm install
npm run dev  # http://localhost:5173

# Comptes seed V2
# Admin (propriétaire) : 237699999999 / 1234
# Partenaire : 237699111222 / 1234  (Boutique Amina)
# Partenaire 2 : 235660111222 / 1234 (Moussa Tchad)
# Client : 237690333444 / 1234
# Client 2 : 237698765432 / 1234
```

---

*PayAfrica Marketplace V2 — 21 Oct 2026*
