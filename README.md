## 改作業囉（請詳閱！）
0.我實作了進階要求中的更換頭貼和已讀系統。
（有時候pusher反應比較慢，請有點耐心，感謝）

1.首先請去取得pusher和mongodb的connection string

2.按照之前用過的方式操作mongodb和pusher並填入.env (我的.env和助教的不一樣，請小心！)
建議你先：
```bash
cp .env.example .env
```
3.打開.env，開始填寫資料：請務必模仿以下範例：
```bash
DATABASE_URL="mongodb+srv://<username>:<password>@cluster?.<yourRandomCharacters>.mongodb.net/messenger-clone" 
#假設你拿到的connection string 長這樣：
#mongodb+srv://wptester:pAssWorD@cluster0.iwktxcl.mongodb.net/?retryWrites=true&w=majority
#請砍掉mongodb.net/後面的部分，留下mongodb+srv://wptester:pAssWorD@cluster0.iwktxcl.mongodb.net
#然後在後面加上/messenger-clone即可！
NEXTAUTH_SECRET="NEXTAUTH_SECRET" #不用特別改也沒差

NEXT_PUBLIC_PUSHER_APP_KEY=<yourPusherAppKey> #以下四個都不用加""
PUSHER_APP_ID=<yourPusherAppId>
PUSHER_SECRET=<yourPusherSecret>
NEXT_PUBLIC_PUSHER_CLUSTER=<yourPusherCluster>



-----------------------------------------------
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="dsmewul6f" #請勿更改這項（與上傳圖片功能相關）
```
4.安裝必要資源
```bash
npm i
yarn
npx prisma db push
```
4.開始測試！
```bash
npm run dev
# or
yarn dev
```
然後打開localhost:3000（之類的）
偶爾剛npm run dev完第一次打開按鈕會沒反應（我不知道為什麼），直接刷新就正常了。

5.雅爾林特！
```bash
yarn lint
```

6.感謝你幫我改作業，祝你期末順利
