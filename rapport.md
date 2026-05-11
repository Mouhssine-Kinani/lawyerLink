# Rapport de Projet : LawyerLink

## Plateforme de Mise en Relation des Clients avec des Avocats Assistée par l'IA

---

## 1. Problématique

L'accès à une consultation juridique de qualité reste un défi majeur pour les citoyens. Les difficultés sont multiples :

- **Difficulté de trouver un avocat spécialisé** : Les clients ne savent pas toujours quel avocat contacter pour leur type de litige spécifique (droit familial, droit commercial, droit immobilier, etc.).
- **Absence de transparence** : Il est difficile de comparer les avocats (tarifs, langues parlées, disponibilités, avis clients).
- **Barrière géographique et linguistique** : Les clients recherchent souvent un avocat dans leur ville ou région, parlant leur langue.
- **Processus manuel et chronophage** : La prise de rendez-vous, la communication initiale et le paiement se font souvent par téléphone ou email sans plateforme centralisée.

Ce projet vise à résoudre ces problématiques en créant une plateforme numérique complète qui simplifie l'ensemble du parcours client, de la recherche d'un avocat jusqu'à la consultation.

---

## 2. Technologies Utilisées

### Frontend

| Technologie | Version | Rôle |
|---|---|---|
| **React** | 19.x | Bibliothèque UI pour la construction de l'interface utilisateur |
| **Vite** | 8.x | Outil de build et serveur de développement rapide |
| **React Router DOM** | 7.x | Routage côté client (navigation entre les pages) |
| **Tailwind CSS** | 4.x | Framework CSS utilitaire pour le stylage et le responsive design |
| **React Markdown** | 10.x | Rendu du Markdown dans l'assistant de chat IA |
| **ESLint** | 9.x | Linting et qualité du code |

### Backend

| Technologie | Version | Rôle |
|---|---|---|
| **Python** | 3.10+ | Langage de programmation |
| **FastAPI** | Dernière | Framework web asynchrone pour l'API REST |
| **Uvicorn** | Dernière | Serveur ASGI |
| **SQLAlchemy** | Dernière | ORM (Object-Relational Mapping) pour l'accès à la base de données |
| **PyMySQL** | Dernière | Pilote de connexion MySQL |
| **Alembic** | Dernière | Gestion des migrations de base de données |
| **Pydantic** | Dernière | Validation des données et schémas |
| **Google Gemini API** | Dernière | Assistant IA conversationnel et recommandations |
| **Stripe** | Dernière | Système de paiement et d'abonnement |
| **Python-JOSE** | Dernière | Gestion des tokens JWT |
| **Passlib + bcrypt** | Dernière | Hachage et vérification des mots de passe |
| **Pillow** | Dernière | Traitement d'images (photos de profil) |
| **Pytest** | Dernière | Framework de tests |

### Base de données

| Type | Technologie |
|---|---|
| **Production** | MySQL (lawyerlink_db) |
| **Tests** | SQLite (test.db) |

### Outils de développement

| Outil | Rôle |
|---|---|
| **Concurrently** | Exécution simultanée du frontend et backend |
| **PlantUML** | Conception des diagrammes UML |
| **Stitch** | Prototypage des maquettes UI |

---

## 3. Solution : LawyerLink

LawyerLink est une **plateforme de marketplace de consultation juridique assistée par intelligence artificielle** qui connecte les clients avec des avocats. Elle couvre l'ensemble du parcours : découverte, recommandation, prise de rendez-vous, paiement et avis.

### 3.1 Architecture du Système

```
┌──────────────────┐      HTTP/JSON       ┌─────────────────┐      ┌──────────┐
│   React SPA       │ ◄─────────────────►  │   FastAPI        │◄────►│  MySQL   │
│  (Vite, Tailwind) │    localhost:5173    │  (Uvicorn)       │      │    DB    │
│                   │                      │  localhost:8000  │      └──────────┘
│  React Router DOM │                      │  SQLAlchemy ORM  │
│  Context API      │                      │  Pydantic        │      ┌──────────┐
└──────────────────┘                      │  JWT Auth        │◄────►│  Stripe  │
                                            │                  │      └──────────┘
                                            │  Gemini IA       │◄────►│  Google  │
                                            └─────────────────┘      │  Gemini  │
                                                                      └──────────┘
```

### 3.2 Architecture du Backend (Modulaire)

```
backend/
├── app/
│   ├── main.py              # Point d'entrée FastAPI
│   ├── core/                # Configuration globale
│   │   ├── config.py        # Variables d'environnement
│   │   ├── database.py      # Moteur SQLAlchemy
│   │   ├── security.py      # JWT + hachage
│   │   ├── dependencies.py  # Dépendances d'authentification
│   │   └── blacklist.py     # Blacklist de tokens
│   ├── auth/                # Module d'authentification
│   ├── user/                # Module utilisateur
│   ├── lawyer/              # Module avocat
│   ├── chat/                # Module chat IA
│   ├── recommendation/      # Module recommandations
│   ├── reservation/         # Module réservations
│   ├── review/              # Module avis
│   ├── payment/             # Module paiements Stripe
│   └── admin/               # Module administration
```

### 3.3 Modèle de Données (8 tables principales)

| Table | Description |
|---|---|
| **users** | Utilisateurs (email, mot de passe, rôle, ville) |
| **clients** | Profils clients (nom, téléphone) |
| **lawyers** | Profils avocats (spécialités, langues, tarifs, notation) |
| **chat_sessions** | Sessions de chat IA |
| **chat_messages** | Messages individuels |
| **reservations** | Rendez-vous clients-avocats |
| **reviews** | Avis clients sur les consultations |
| **subscriptions** | Abonnements mensuels des avocats |
| **boost_payments** | Paiements de visibilité boostée |
| **payment_transactions** | Historique de tous les paiements |
| **recommendation_logs** | Journal des recommandations IA |

### 3.4 Fonctionnalités

#### Clients
- **Assistant Juridique IA** : Chatbot intelligent (Google Gemini 2.0 Flash) qui mène un entretien structuré en 5 étapes (salutation, ville, type de litige, langue préférée, budget). Détecte automatiquement la langue (Arabe/Français/Anglais) et recommande les 3 meilleurs avocats avec classement IA.
- **Annuaire des avocats** : Recherche et filtrage des avocats par spécialité, ville, langue, tarif.
- **Profils détaillés** : Consultation des profils avec spécialités, langues, tarifs horaires, notes et avis.
- **Prise de rendez-vous** : Réservation de consultations avec gestion des disponibilités.
- **Avis et notations** : Dépôt d'avis après consultation (fenêtre de modification de 7 jours).
- **Recommandations personnalisées** : Suggestions d'avocats générées par l'IA.

#### Avocats
- **Tableau de bord** : Aperçu des réservations, avis et revenus.
- **Gestion de profil** : Modification des informations professionnelles.
- **Gestion des réservations** : Acceptation, refus, complétion et annulation des rendez-vous.
- **Abonnement** : Abonnement mensuel (299 MAD / 0 MAD en mode test) pour apparaître dans les résultats de recherche.
- **Boost de visibilité** : Achat de boosts (niveaux 1 à 5, 49 MAD par niveau pour 7 jours).
- **Historique des paiements** : Consultation de toutes les transactions.

#### Administrateurs
- **Tableau de bord** : Statistiques globales (utilisateurs, avocats, réservations, avis, notes).
- **Gestion des utilisateurs** : CRUD complet sur tous les utilisateurs.
- **Gestion des avocats** : Activation/désactivation des comptes avocats.
- **Modération des avis** : Consultation de tous les avis de la plateforme.

### 3.5 Système de Paiement (Stripe)

- **Abonnement mensuel** : 299 MAD avec création d'un enregistrement Subscription (dates début/fin).
- **Boost de visibilité** : Paiement unique par niveau (49 MAD x niveau) avec expiration à 7 jours.
- **Mode test PFA** : 0 MAD via Stripe SetupIntent pour les démonstrations.
- **Webhook** : Traitement asynchrone des événements `payment_intent.succeeded` et `setup_intent.succeeded`.

### 3.6 Sécurité

- Authentification par JWT avec blacklisting des tokens lors de la déconnexion.
- Hachage des mots de passe avec bcrypt.
- Contrôle d'accès basé sur les rôles (RBAC) : 3 rôles (client, avocat, admin), 39 endpoints protégés.
- Validation des données avec Pydantic.
- Protection des routes côté frontend et backend.

---

## 4. Diagrammes de Conception

Le projet inclut des diagrammes UML complets :

- **Diagramme de classes** : Modélisation complète des entités et leurs relations.
- **Diagramme de composants** : Architecture des composants logiciels.
- **Diagramme de déploiement** : Architecture physique du système.
- **Diagrammes d'états** : Machines à états pour les paiements, réservations et abonnements.
- **Diagrammes de séquence** : Flux des paiements et réservations.
- **Diagramme d'activité** : Flux de travail global.
- **Diagramme de paquetage** : Organisation des modules.
- **Diagramme de cas d'utilisation** : Interactions acteurs-système.

---

## 5. Tests

Le backend est testé avec Pytest en utilisant une base de données SQLite isolée :

- **test_auth.py** : Tests d'inscription, connexion, déconnexion, réinitialisation de mot de passe.
- **test_user.py** : Tests de gestion de profil utilisateur.
- **test_lawyer.py** : Tests de gestion des profils avocats.
- **test_chat.py** : Tests du chat IA.
- **test_reservation.py** : Tests de réservation.
- **test_payment.py** : Tests de paiement.

---

## 6. Conclusion

LawyerLink est une solution complète et moderne qui répond aux problématiques d'accès à la consultation juridique. En combinant :

- Une **interface utilisateur réactive** construite avec React et Tailwind CSS
- Une **API REST robuste** avec FastAPI et SQLAlchemy
- Une **intelligence artificielle** (Google Gemini) pour le matching intelligent
- Un **système de paiement intégré** (Stripe) pour les abonnements et boosts
- Une **architecture modulaire et extensible** facilitant la maintenance et l'évolution

La plateforme couvre l'ensemble du parcours client : de la découverte d'un avocat via le chat IA, à la prise de rendez-vous, en passant par le paiement et l'évaluation. Les trois rôles (client, avocat, administrateur) disposent chacun d'outils adaptés à leurs besoins spécifiques, faisant de LawyerLink une place de marché juridique complète et innovante.
