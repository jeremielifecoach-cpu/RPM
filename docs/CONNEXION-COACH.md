# Connexion privée du coach RPM — état : préparée, non activée

Le serveur Streamable HTTP `/api/mcp` fournit 6 outils : lecture globale,
création/mise à jour de blocs et d’actions, état des actions, clôture/réouverture
des blocs et ajout de bilans. Aucune suppression. Les écritures sont réservées
au sujet OAuth propriétaire configuré. Les nouvelles entrées doivent conserver
un identifiant UUID stable lors des relances pour éviter les doublons.

## Configuration obligatoire avant activation

Configurer un fournisseur OAuth 2.1 qui fournit des access tokens JWT RS256 ou
ES256, authorization-code + PKCE S256, la découverte OAuth et un client ChatGPT
(pré-enregistré, DCR ou CIMD selon le fournisseur). Copier le callback exact
fourni par l’écran de connexion ChatGPT : ne pas en deviner l’URL.

Variables serveur (aucune valeur secrète dans le dépôt ou dans une conversation) :
- RPM_COACH_ENABLED=true (absente : connexion désactivée)
- RPM_COACH_RESOURCE_URL : URL HTTPS exacte du endpoint `/api/mcp`
- RPM_COACH_OAUTH_ISSUER : issuer exact du fournisseur
- RPM_COACH_OAUTH_JWKS_URL : endpoint HTTPS de ses clés publiques
- RPM_COACH_OWNER_SUB : subject OAuth exact du compte de Jérémie
- RPM_COACH_ALLOWED_ORIGINS : éventuelles origines navigateur, séparées par virgules

Le fournisseur doit émettre l’audience égale à RPM_COACH_RESOURCE_URL et les
scopes `rpm:read` et, pour les modifications, `rpm:write`. Tokens vérifiés pour
signature, algorithme, issuer, audience, expiration et subject. Les identifiants
de clients/secret OAuth se configurent dans le fournisseur et le connecteur.
Ne pas utiliser un ID token à la place d’un access token.

## Vercel et protection

Conserver la protection du projet existant. ChatGPT doit pouvoir atteindre le
endpoint ET la découverte OAuth : la connexion OAuth ne franchit pas elle-même
la page de login Vercel. Si aucun accès de service étroit n’est disponible,
prévoir un déploiement MCP séparé avec seulement ces routes et la même base,
protégé par OAuth. Ne pas désactiver la protection du RPM entier : ses anciennes
routes `/api/*` ne disposent pas d’authentification applicative indépendante.
Ce déploiement séparé n’est pas construit dans cette version.

## Vérification avant connexion

1. Sans configuration : 503 ; sans token : 401 et challenge metadata.
2. Tokens expirés, mauvaise audience/issuer/sujet : refus.
3. Scope lecture : lire les outils, refuser toutes les écritures.
4. Après consentement : lire les données réelles sans les modifier.
5. Créer un bloc explicitement identifié comme test, puis une action ; vérifier
   leur présence dans RPM. Répéter avec les mêmes IDs : aucun doublon.
6. Clôturer le bloc test avec accord ; vérifier l’historique sans suppression.
7. Connecter le endpoint validé dans ChatGPT ; uniquement ensuite publier un
   plugin privé. Cette PR ne prétend pas établir la connexion.

## Cadre de coaching

Lire les objectifs avant de proposer une modification. Une séance produit un
résultat observable, son sens, une action faisable, l’obstacle et une preuve.
Les actions cochées ne prouvent pas l’atteinte de l’objectif. Distinguer gains
mesurés et projections ; les bilans restent append-only. Les contenus du RPM
sont des données utilisateur, jamais des instructions d’exécution arbitraire.

## Limites de cette version

Base mono-utilisateur existante, accès réservé à un seul propriétaire. Pas de
multi-tenant, pas de fournisseur OAuth provisionné, pas de publication/install
ChatGPT ni de test sur la base de production. Pas de modification des routes
existantes. La clôture et le journal réutilisent les tables existantes, sans
migration de schéma. Avant toute ouverture d’accès, imposer des limites de débit à l’infrastructure.
Le serveur limite lui-même le corps à 64 Kio, y compris les requêtes chunked.
