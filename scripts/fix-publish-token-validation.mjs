import fs from 'node:fs';

const path = 'src/pages/AdminEditor.jsx';
let src = fs.readFileSync(path, 'utf8');

function replaceOnce(find, replacement, label) {
  if (!src.includes(find)) throw new Error(`Missing patch target: ${label}`);
  src = src.replace(find, replacement);
}

replaceOnce(
`  const handlePublish = async () => {
    if (!githubToken.trim()) {
      setPublishStatus('error');
      setPublishMessage('請先輸入發布授權憑證金鑰！');
      return;
    }
`,
`  const handlePublish = async () => {
    const cleanToken = githubToken.trim();
    if (!cleanToken) {
      setPublishStatus('error');
      setPublishMessage('請先輸入發布授權憑證金鑰！');
      return;
    }
`,
'normalize publish token'
);

src = src.replaceAll('Authorization: `Bearer ${githubToken}`', 'Authorization: `Bearer ${cleanToken}`');

replaceOnce(
`      if (!getRes.ok) {
        const errData = await getRes.json();
        throw new Error(errData.message || \`取得檔案失敗 (\${getRes.status})\`);
      }
`,
`      if (!getRes.ok) {
        const errData = await getRes.json().catch(() => ({}));
        if (getRes.status === 401) {
          localStorage.removeItem('mizo_gh_token');
          throw new Error('發布憑證無效或已失效，請重新貼上 GitHub Token 並按「儲存發布憑證至本機」');
        }
        if (getRes.status === 403) {
          throw new Error('發布憑證權限不足，請確認 Contents 權限為 Read and write');
        }
        throw new Error(errData.message || \`取得檔案失敗 (\${getRes.status})\`);
      }
`,
'friendly credential read error'
);

replaceOnce(
`      if (!putRes.ok) {
        const errData = await putRes.json();
        throw new Error(errData.message || \`發布失敗 (\${putRes.status})\`);
      }
`,
`      if (!putRes.ok) {
        const errData = await putRes.json().catch(() => ({}));
        if (putRes.status === 401) {
          localStorage.removeItem('mizo_gh_token');
          throw new Error('發布憑證無效或已失效，請重新貼上 GitHub Token');
        }
        if (putRes.status === 403) {
          throw new Error('發布憑證沒有寫入權限，請確認 Contents 權限為 Read and write');
        }
        throw new Error(errData.message || \`發布失敗 (\${putRes.status})\`);
      }
`,
'friendly credential write error'
);

replaceOnce(
`  const handleSaveToken = () => {
    localStorage.setItem('mizo_gh_token', githubToken);
    showToast('發布憑證金鑰已儲存至本機！');
  };
`,
`  const handleSaveToken = async () => {
    const cleanToken = githubToken.trim();
    if (!cleanToken) {
      localStorage.removeItem('mizo_gh_token');
      setGithubToken('');
      setPublishStatus('error');
      setPublishMessage('請先貼上 GitHub Publish Token。');
      return;
    }

    setPublishStatus('loading');
    setPublishMessage('正在驗證發布憑證…');

    try {
      const verifyRes = await fetch('https://api.github.com/repos/jayshih8/mizo-cleaning-web-/contents/src/data/contentConfig.json', {
        headers: {
          Authorization: \`Bearer \${cleanToken}\`,
          Accept: 'application/vnd.github+json',
        },
      });

      if (!verifyRes.ok) {
        const errData = await verifyRes.json().catch(() => ({}));
        if (verifyRes.status === 401) throw new Error('Token 無效，請確認貼上的是剛建立的完整 GitHub Token');
        if (verifyRes.status === 403) throw new Error('Token 權限不足，Contents 必須設定為 Read and write');
        throw new Error(errData.message || \`驗證失敗 (\${verifyRes.status})\`);
      }

      localStorage.setItem('mizo_gh_token', cleanToken);
      setGithubToken(cleanToken);
      setPublishStatus('success');
      setPublishMessage('✅ 發布憑證驗證成功，可以直接發布至官網。');
      showToast('發布憑證已驗證並儲存至本機！');
    } catch (err) {
      localStorage.removeItem('mizo_gh_token');
      setPublishStatus('error');
      setPublishMessage(\`❌ 憑證驗證失敗：\${err.message}\`);
    }
  };
`,
'validate token before saving'
);

fs.writeFileSync(path, src);
