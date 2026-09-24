// Resolves when the preloader has lifted, so page intros don't play behind it.
let resolveIntro
export const introDone = new Promise((r) => (resolveIntro = r))
export const finishIntro = () => resolveIntro()
