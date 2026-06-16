# CineIA 🎬

> Générateur de films IA viraux pour TikTok, YouTube Shorts & Instagram Reels

## ✦ Ce que ça fait

CineIA transforme une simple idée en film IA complet en quelques clics :

1. **Claude API** → Scénario, dialogues, prompts optimisés
2. **DALL·E 3** → Images cinématiques 9:16 par scène
3. **Runway Gen-3** *(optionnel)* → Anime chaque image en clip vidéo
4. **ElevenLabs** *(optionnel)* → Voix IA réaliste pour la narration
5. **Montage auto** → Export MP4 prêt pour TikTok

## 🚀 Déploiement Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/TON_USERNAME/cineia)

Ou manuellement :
```bash
npm i -g vercel
vercel --name cineia
```

## 🔑 APIs requises

| API | Usage | Coût | Lien |
|-----|-------|------|------|
| Claude (Anthropic) | Script IA | ~0.05€/vidéo | [console.anthropic.com](https://console.anthropic.com) |
| OpenAI (DALL·E 3) | Images | ~0.25€/vidéo | [platform.openai.com](https://platform.openai.com/api-keys) |
| Runway Gen-3 | Animation vidéo | ~0.50€/vidéo | [dev.runwayml.com](https://dev.runwayml.com) |
| ElevenLabs | Voix IA | ~0.10€/vidéo | [elevenlabs.io](https://elevenlabs.io) |

> Runway et ElevenLabs sont **optionnels** — l'app fonctionne avec Claude + OpenAI uniquement (~0.30€/vidéo)

## 💰 Coût total par vidéo

- **Minimum** (Claude + OpenAI) : ~0.30€
- **Complet** (toutes APIs) : ~0.90€

## 🎯 Formats supportés

- TikTok (9:16, jusqu'à 90s)
- YouTube Shorts (9:16, jusqu'à 60s)
- Instagram Reels (9:16, jusqu'à 90s)

## ⚡ Stack technique

- HTML5 Canvas pour le rendu et les animations
- MediaRecorder API pour l'export vidéo
- Web Speech API pour la voix gratuite
- LocalStorage pour l'historique des films
- Zero dépendances — fichier unique

## 📁 Structure

```
cineia/
├── index.html    # App complète (single file)
├── vercel.json   # Config Vercel
└── README.md     # Ce fichier
```

## 🛠 Développement local

Ouvre simplement `index.html` dans Chrome ou Edge. Aucune installation requise.

---

Made with ❤️ and AI
