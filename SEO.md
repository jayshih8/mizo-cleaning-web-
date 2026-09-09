# SEO 維護說明

正式網域：https://tbcleanpro.com/。目前依網站既有文案設定台北市、新北市服務範圍。

## 內容與建置

- `src/data/contentConfig.json` 保留後台原始圖文資料。後台發布仍只更新這個檔案。
- `src/data/seoConfig.json` 管理正式網域、網站名稱、服務地區及六頁搜尋標題、描述。
- `src/lib/seo.js` 是 canonical、Open Graph、Twitter Card、robots 與 JSON-LD 的共用來源；原始 HTML 與前台導覽使用相同規則。
- `npm run build` 先產生壓縮圖片與公開內容，再輸出六頁完整 HTML、404 頁、後台登入空殼、sitemap.xml 和 robots.txt，最後執行 SEO 檢查。不可只執行 `vite build` 部署。
- `src/data/siteContent.generated.json`、`public/media/`、`.ssr/`、`dist/` 均為產物，不應手動修改或提交。原始照片只隨後台的獨立程式檔載入，公開頁面使用 WebP、圖片尺寸及 srcset。

## 收錄與結構化資料

六個公開網址為 `/`、`/about`、`/services`、`/process`、`/credentials`、`/contact`，均有獨立標題、描述、canonical 及可讀取的主要內容。

JSON-LD 使用 LocalBusiness、WebSite、WebPage（含 AboutPage、ContactPage、CollectionPage）、BreadcrumbList、Service、OfferCatalog、ItemList。電話、公司名稱與地址來自後台；營業時間僅在能解析已顯示的週一至週五時段時標記。沒有新增虛構評分、價格、經緯度或 FAQ／HowTo 標記；Facebook 首頁占位連結不當作公司社群帳號。

Vercel 透過 cleanUrls 提供各頁靜態 HTML，不再把任意路徑回傳首頁。不存在的頁面使用 404；`/admin-portal` 具有原始 HTML noindex 與 X-Robots-Tag，且不列入 sitemap。robots.txt 允許搜尋引擎讀取 noindex 指令；這不是管理後台的權限保護。

www、舊 Vercel 正式網址及 `/home` 使用永久轉址；`/admin` 轉向 `/admin-portal`。GitHub Pages 工作流程只發布舊頁面到正式網域的即時 meta refresh 與 canonical；GitHub Pages 不支援此專案設定自訂 HTTP 301 回應，因此不把 meta refresh 宣稱為 HTTP 轉址。

## Google Search Console 與 GA4

1. 在 Search Console 新增 `https://tbcleanpro.com/` URL 前置字元資源。選擇 HTML 標記驗證，將 `content` 值填入後台「公司基本資訊」中的 Google Search Console 驗證碼，發布並等部署完成，再驗證所有權。驗證值會寫進原始 HTML。
2. 或建立 `tbcleanpro.com` 網域資源，依 Google 指示在網域 DNS 加入 TXT 記錄；此方式不使用 HTML 標記欄位。
3. 驗證後提交 `https://tbcleanpro.com/sitemap.xml`，對首頁與重要服務頁使用網址檢查。收錄與排名仍由搜尋引擎決定。
4. 若已有 GA4，在相同後台頁面填入 `G-` 開頭的評估 ID 並發布。網站會追蹤公開頁面的 page_view；未填 ID 時不載入追蹤程式。
5. 公司 Google 商家檔案應保持公司名稱、電話、地址與網站一致；需由公司帳號驗證與維護。

## 驗證

```sh
npm ci
npm run lint
npm test
npm run build
npm run preview
```

`npm test` 驗證深層網址、404／後台 noindex、正式網域、資料一致性、服務標記與 JSON-LD 安全序列化。`npm run build` 逐頁檢查標題與描述唯一性、H1、canonical、單一 JSON-LD、圖片替代文字與檔案存在、服務內容、sitemap，以及公開入口 JS 小於 500 KB。

正式部署後另外檢查 HTTP 狀態、轉址、各頁原始 HTML、手機排版、相簿、後台載入及瀏覽器錯誤。Lighthouse 是實驗室測量，不代表 Search Console／CrUX 的真實訪客 Core Web Vitals；站內測試也不能代替 Google 的收錄或複合式搜尋結果資格判定。

## 官方參考

- [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [LocalBusiness 結構化資料](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [結構化資料品質規範](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Canonical 與重複網址](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Sitemap 建立與提交](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
