# PLAN MCP — @tsed/cli (MVP proche du CLI)

MVP visant un comportement très proche du CLI Ts.ED en mode MCP (stdio). Pas de dry‑run ni diff complexes: actions immédiates, avec garde‑fous minimaux (CWD explicite, confirmations via prompts, logs structurés).

---

## 1) Objectifs

- Couvrir en priorité:
  - set-workspace (équivalent `-r`) — fixe le CWD et renvoie un snapshot du projet
  - generate-file ≃ `tsed generate|g`
  - (Prochainement) init-project ≃ `tsed init`
- Rester fidèle au CLI: exécution immédiate (pas de dry‑run).
- Sécuriser via: CWD contrôlé, confirmations (prompts), erreurs standardisées.

## 2) Mode stdio & CWD

- Le serveur MCP (stdio) n’a pas un CWD fiable par défaut.
- Seul `set-workspace` définit le CWD global pour le serveur via `ProjectPackageJson.setCWD()`.
- Les resources sont strictement lecture seule et ne modifient jamais le CWD.
- Variable d’environnement supportée (optionnelle):
  - `TSED_MCP_WORKSPACE`: CWD initial par défaut si défini (sinon `process.cwd()`).
- Resource d’info: `tsed://server/info` → `{ pid, serverCwd, projectCwd, tsedCliVersion, mcpSdkVersion, projectExists }`.

## 3) Tools (API d’actions)

### 3.1 set-workspace

- Rôle: fixer la racine d’exécution (équivalent `-r`). Résout automatiquement la racine projet (nearest `package.json`) via `ProjectPackageJson`.
- Input:

```
{ cwd: string }
```

- Output (snapshot minimal du projet courant):

```
{
  cwd: string,        // racine projet résolue
  pkg: object,        // package.json résolu (via ProjectPackageJson)
  preferences: object // préférences Ts.ED (champ packageJson[<name>])
}
```

- Comportement:
  - Si le chemin existe: `projectPackage.setCWD(cwd)` puis retourner `projectPackage.cwd`, `projectPackage.toJSON()` et `projectPackage.preferences`.
  - Si le chemin n’existe pas: ne crée rien; renvoyer une erreur `E_CWD_NOT_FOUND` avec une suggestion d’utiliser `init-project` après confirmation de création.

### 3.2 list-templates (read‑only)

- Rôle: exposer les templates disponibles pour `generate`.
- Input: `{ type?: string }` (filtre optionnel par sous‑chaîne sur id/label).
- Output:

```
{ items: [{ id: string; type: string; label?: string; description?: string }] }
```

### 3.3 generate-file (exécution immédiate)

- ≃ `tsed g`
- Input:

```
{
  type: string,
  name: string,
  route?: string,
  directory?: string,
  templateType?: string,
  middlewarePosition?: string
}
```

- Output (à standardiser dans M2):

```
{ files?: string[]; count?: number; symbolPath?: string; logs?: string[] }
```

- Implémentation: `CliProjectService.createFromTemplate(type, ctx)` puis `transformFiles(ctx)`; lister les fichiers via `CliTemplatesService.renderedFiles`.

## 4) Resources (lecture seule)

- `tsed://server/info` (server-info)
  - Process et versions:
    ```
    { pid, serverCwd, projectCwd, tsedCliVersion, mcpSdkVersion, projectExists }
    ```
- `tsed://project/info` (project-info)
  - Snapshot projet courant (lié au CWD fixé) sans effet de bord:
    ```
    { cwd, isInitialized: boolean, pkg: object, preferences: object }
    ```

## 5) Prompts (guidance + confirmation)

- `prompt/set-workspace`: demander le chemin; en cas d’erreur `E_CWD_NOT_FOUND`, proposer l’initialisation du projet.
- `prompt/generate-file`: collecter `type`, `name`, etc., confirmer l’action puis appeler `generate-file`.

## 6) Sécurité & politique CWD

- Exiger `set-workspace` (ou un champ `cwd` futur si nécessaire) pour toute écriture.
- Normaliser les chemins côté tool; refuser les chemins manifestement invalides.
- Pas d’allowlist de dossiers pour le MVP (suppression de `TSED_MCP_ALLOWED_DIRS`).

## 7) Gestion des erreurs & logs

- Format d’erreur standard:

```
{ code: string; message: string; suggestion?: string; details?: any }
```

- Codes utilisés à ce stade: `E_CWD_NOT_FOUND`, `E_TEMPLATE_UNKNOWN` (generate si type invalide), `E_FS_PERM`, `E_CONFLICT`.
- Logs: retourner un résumé `logs` dans la sortie des tools si pertinent; éviter les `console.log` bruts en stdio.

## 8) Tests (MVP)

- Intégration: `set-workspace` ⇒ snapshot cohérent (`cwd`, `pkg`, `preferences`).
- Intégration: `list-templates` retourne une liste non vide (selon templates installés/custom).
- Intégration: `generate-file` (plusieurs `type`) ⇒ fichiers présents et listés via `renderedFiles`.
- Erreurs: dossier inexistant ⇒ `E_CWD_NOT_FOUND`; type inconnu ⇒ `E_TEMPLATE_UNKNOWN`.

## 9) Roadmap d’implémentation (MVP)

- M1 (fait):
  - `set-workspace` (retourne snapshot projet)
  - `tsed://server/info`
  - `tsed://project/info`
  - `list-templates`
- M2 (suivant):
  - Compléter `generate-file` (sortie: `files`, `count`, `symbolPath`, `logs`) + gestion d’erreurs simples.
  - Prompts basiques pour `generate-file`.
- M3:
  - `init-project` (exécution immédiate) + prompt d’initialisation.
- M4:
  - Standardisation des erreurs/logs et documentation succincte d’intégration MCP.
