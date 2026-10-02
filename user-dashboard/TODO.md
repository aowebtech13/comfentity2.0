# Task: Show user uploaded profile image in MobileFooter

## Steps

- [x] 1. Read relevant files to understand current avatar handling (done).
- [x] 2. Modify `user-dashboard/src/components/partials/footer/MobileFooter.jsx`:
  - Import `useSelector` from `react-redux`.
  - Read `user` from `state.auth.user`.
  - Add `avatarError` fallback state.
  - Use `user?.avatar_url || FooterAvatar` as image `src` with `onError` fallback.
- [x] 3. Verify the change (build/lint) — `npm run build` succeeded.

