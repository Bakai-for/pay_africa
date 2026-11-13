# Tester PayAfrica Marketplace V2 depuis VS Code (Windows)

## 1. Prérequis (1 fois)

### Java 17 obligatoire
```powershell
java -version  # doit afficher 17.0.x
mvn -version   # doit afficher Java 17
```
Si `11` → installe **Temurin 17** https://adoptium.net → redémarre VS Code.

### Node.js 20
```powershell
node -v  # v20.x
npm -v   # 10.x
```

### Extensions VS Code (Ctrl+Shift+X)
- **Extension Pack for Java** (Microsoft)
- **Lombok Annotations Support for VS Code** (VMware) ← indispensable pour `getId()`

Après installation Lombok :
`Ctrl+Shift+P` → `Java: Clean Java Language Server Workspace` → Reload.

---

## 2. Ouvrir le projet

Ouvre **le dossier `payafrica-marketplace`** (pas `backend` seul) dans VS Code :
```
Fichier > Ouvrir dossier > E:\WorkspaceAsco\payafrica-marketplace
```

Le dossier contient déjà `.vscode/launch.json` et `tasks.json`.

### Config Java 17 dans VS Code
`Fichier > Préférences > Paramètres` → recherche `java configuration runtimes` →
ou ajoute dans `.vscode/settings.json` :
```json
"java.configuration.runtimes": [
  { "name": "JavaSE-17", "path": "C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.20.1-hotspot", "default": true }
]
```
Adapte le `path` à ton installation.

---

## 3. Lancer le Backend (Spring Boot)

### Méthode A - Terminal intégré (recommandée)
Dans VS Code : `Terminal > Nouveau terminal` (2 terminaux) :

**Terminal 1 - Backend**
```powershell
cd E:\WorkspaceAsco\payafrica-marketplace\backend
mvn clean compile   # 1ère fois après le fix Lombok, doit faire BUILD SUCCESS
mvn spring-boot:run
```
Attends : `Tomcat started on port(s): 8080` → `Started PayAfricaMarketplaceApplication in 4s`

**Vérifie :**
- http://localhost:8080/ → JSON `{name: PayAfrica Marketplace V2 API ...}`
- http://localhost:8080/health → `{"status":"UP"}`
- http://localhost:8080/swagger-ui.html → Swagger (pas 403)
- http://localhost:8080/api/v1/products → liste produits

### Méthode B - Run & Debug (F5)
- Menu `Exécuter et déboguer` (Ctrl+Shift+D) → choisis `PayAfrica Marketplace V2 Backend` → ▶️
- Même résultat, mais avec debug.

> Si tu as encore `cannot find symbol getId()` → `mvn clean compile` a échoué → refais étape Java 17 + Lombok.

---

## 4. Lancer le Frontend (React Vite)

**Terminal 2 - Frontend**
```powershell
cd E:\WorkspaceAsco\payafrica-marketplace\frontend
npm install   # 1ère fois (attend 30s, doit créer node_modules)
npm run dev
```
→ `VITE v5.4.21 ready in 300ms → Local: http://localhost:5173/`

Ouvre http://localhost:5173 → Marketplace multi-boutiques.

Le frontend proxy déjà `/api` → `http://localhost:8080`, donc pas de CORS.

---

## 5. Tester avec des comptes de démo (seed DataSeeder)

Base H2 en mémoire, recréée à chaque redémarrage backend.

| Rôle | Téléphone | PIN | Shop / Nom |
|------|-----------|-----|------------|
| **ADMIN** (propriétaire) | `237699999999` | `1234` | Admin PayAfrica |
| **PARTNER 1 validé** | `237699111222` | `1234` | Boutique Amina - Yaoundé |
| **PARTNER 2 validé** | `235660111222` | `1234` | Moussa Shop - N'Djamena |
| **CLIENT** | `237690333444` | `1234` | Jean Client |
| **CLIENT** | `237698765432` | `1234` | Fatou Client |

### Test via Swagger (le plus simple)
1. Ouvre http://localhost:8080/swagger-ui.html
2. `POST /api/v1/auth/login` → Try it out :
```json
{ "phone": "237699999999", "pin": "1234" }
```
→ copie le `token`
3. Bouton `Authorize` (cadenas en haut) → colle `Bearer VOTRE_TOKEN`
4. Teste :
   - `GET /api/v1/products` (public, pas besoin token)
   - `GET /api/v1/orders` (client)
   - `GET /api/v1/admin/orders` (admin)
   - `GET /api/v1/partner/orders` (partner)

### Test via cURL dans le terminal VS Code
```powershell
# 1. Products publics (pas de token)
curl http://localhost:8080/api/v1/products

# 2. Login admin
curl -X POST http://localhost:8080/api/v1/auth/login -H "Content-Type: application/json" -d "{\"phone\":\"237699999999\",\"pin\":\"1234\"}"

# 3. Login client + voir commandes
$resp = Invoke-RestMethod -Uri http://localhost:8080/api/v1/auth/login -Method POST -Body '{"phone":"237690333444","pin":"1234"}' -ContentType "application/json"
$token = $resp.token
Invoke-RestMethod -Uri http://localhost:8080/api/v1/orders -Headers @{Authorization="Bearer $token"}
```

### Test via Frontend
1. http://localhost:5173 → `Se connecter`
2. Entre `237690333444` + `1234` → catalogue multi-boutiques
3. Filtre par partenaire / catégorie → ajoute au panier → checkout Mobile Money (simulé)

---

## 6. Tâches VS Code déjà prêtes

`Terminal > Exécuter la tâche...`
- `Backend: mvn clean compile`
- `Backend: Run (spring-boot:run)`
- `Frontend: npm install`
- `Frontend: npm run dev`

---

## 7. Problèmes courants

| Erreur | Cause | Fix |
|--------|-------|-----|
| `getId() cannot find symbol` | Lombok non activé | Installe extension Lombok + `mvn clean compile` + `Java: Clean Workspace` |
| `release version 17 not supported` | VS Code utilise Java 11 | `java.configuration.runtimes` → Java 17 + `mvn -version` doit afficher 17 |
| `Port 8080 already in use` | Ancien backend tourne | `Ctrl+C` dans terminal backend ou `netstat -ano | findstr :8080` → `taskkill /PID XXXX /F` |
| `Whitelabel 403 /` | Ancien `SecurityConfig` | Utilise `PayAfrica-Marketplace-V2-FIXED-LOMBOK.zip` |
| Frontend blanc | `npm install` non fait | `cd frontend` → `npm install` → `npm run dev` |

---

## 8. Structure

```
payafrica-marketplace/
├── backend/            # Spring Boot 3.2.5 + Java 17 + H2 + Lombok
│   ├── src/main/java/com/payafrica/
│   └── pom.xml         # avec maven-compiler-plugin + Lombok 1.18.32
├── frontend/           # React Vite 5.4.21
│   └── vite.config.js  # proxy /api → 8080
└── .vscode/
    ├── launch.json     # F5 → Backend
    └── tasks.json      # mvn / npm
```

Swagger : http://localhost:8080/swagger-ui.html  
Frontend : http://localhost:5173  
Backend API : http://localhost:8080/
