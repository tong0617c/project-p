export function pagesBase(env = process.env) {
  let base = env.PAGES_BASE_PATH;
  if (base === undefined && env.GITHUB_ACTIONS === 'true') {
    const [owner, repo, extra] = (env.GITHUB_REPOSITORY || '').split('/');
    if (!owner || !repo || extra) throw new Error('GITHUB_REPOSITORY must be owner/repository');
    base = repo.toLowerCase() === `${owner.toLowerCase()}.github.io` ? '/' : `/${repo}/`;
  }
  base ??= '/';
  if (!/^\/(?:[A-Za-z0-9_.-]+\/)*$/.test(base) || base.split('/').some(p => p === '.' || p === '..')) {
    throw new Error('PAGES_BASE_PATH must be / or a slash-delimited path such as /project-p-mobile/');
  }
  return base;
}
