# CritMe – React Native (Expo) creator flow

This is the CritMe demo flow rebuilt as React Native components for the app.

Explore → **+** → pick a video → tap the bubble and write a message → **Initialize** → swipe Crit's takes → **Upload** → the post appears at the top of Explore.

The app runs end to end on a mock API with the two demo takes. To connect the backend, set one environment variable and add your auth token (see below).

- Expo SDK 58, React Native 0.88, TypeScript (strict). `npm run typecheck` passes and the Android bundle builds.
- Native packages: `expo-video`, `expo-image-picker`, `expo-linear-gradient`, `react-native-svg`, `react-native-safe-area-context`.

## Run it

```bash
npm install
npx expo run:ios      # or: npx expo run:android  (dev build; expo-video needs native code)
```

## Connect the backend

1. Copy `.env.example` to `.env` and set `EXPO_PUBLIC_CRITME_API_URL=https://api.yourdomain.com`.
2. In `src/api/index.ts`, make `getToken()` return the signed-in user's token.

With no URL set, the app uses `createMockApi()`. With a URL set, it uses `createHttpApi()`. The screens only use the `CritMeApi` interface in `src/api/types.ts`, so you can also write your own client.

Suggested endpoints (`src/api/http.ts`; rename them freely):

| Call | Request | Response |
|---|---|---|
| `POST /videos` | multipart `file` (+ `durationMs`) | `{ id, url, durationMs? }` |
| `POST /takes` | `{ videoId, message, hashtags[], frameTimestamps[] }` | `{ takes: [{ id, text }] }` |
| `POST /posts` | `{ videoId, message, hashtags[], take }` | `Post` |

The video starts uploading as soon as it's picked, while the creator is still typing. Initialize then usually waits only for the takes.

### Frame sampling for Takes (`src/api/sampling.ts`)

- Number of frames N by video length: 60 s or less → 4, 120 s or more → 8, linear in between, rounded (75 s → 5, 90 s → 6).
- Frames are spaced `duration / (N − 1)` apart, so the first and last frames are always included.
- On the server, read the real duration and fps with **ffprobe** instead of assuming 30 fps. Snap each timestamp to a real frame: `round(t × fps) / fps`.

## Where things live

```
App.tsx                         demo wiring (swap for your navigator)
src/screens/CreateScreen.tsx    composer → initializing → takes → upload, on one screen
src/screens/FeedScreen.tsx      vertical Explore feed
src/hooks/useCritFlow.ts        flow state + API calls (upload, generate takes, publish)
src/components/MessageBubble    the message bar (user and Crit), WhatsApp-style sizing + pulsing glow
src/components/GradientButton   Initialize (bright) and Upload (muted), same shape
src/components/TakesCarousel    full-width paging, only the current take is visible
src/components/PagerDots        low-contrast dots
src/components/InputBar         translucent field + # button + send icon
src/components/InitializingView Crit avatar with a spinning gradient ring
src/theme.ts                    colours and gradients from the HTML demo
```

## The message bar

The shape is CritMe's own: a rounded bar (radius 20) with a small pointer tail near a bottom corner. `tail="left"` is the creator's bar and `tail="right"` is Crit's take. The bar resizes the way WhatsApp's does:

- **It hugs the text.** One word gives a small bar. Longer text grows wider, then wraps at the parent's `maxWidth`.
- **It has a minimum width (64).** A single short word stays a short bar instead of turning into a circle. WhatsApp gets the same effect from its timestamp.
- **The padding is wider than it is tall:** 16 at the sides, 7–8 at the top and bottom.

The glow is two outline rings, cyan and purple, that cross-fade every 2.6 s on the native driver. Use `glow={false}` for the static version in the Explore feed.

## Not ported yet

These are in the HTML demo but not in this project: the Crit Meter on feed posts, double-tap to pop the meter, live like and comment counts, and the comment sheet. They're feed features. The creator flow above doesn't depend on them.

The demo uses the system font. To match the HTML exactly, load Inter with `expo-font`.
