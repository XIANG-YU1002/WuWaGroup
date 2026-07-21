# 01_Project_Specification_v2.1

**Project Name:** WuWaGroup  
**Document Type:** Project Specification  
**Frontend:** React、Vite、JavaScript  
**Backend:** Python、FastAPI  
**Database:** PostgreSQL  
**Version:** 2.1  
**Last Updated:** 2026-07-18  

---

# Change Log

| Version | Date | Description |
|---|---|---|
| 1.0 | Initial Draft | 建立原始專案規格 |
| 1.1 | Previous Version | 完善活動、商品、開團、訂單、公告與通知功能 |
| 1.2 | Previous Version | 新增團主申請、會員外部聯絡方式、團主公告綁定特定開團及訂單聯絡快照 |
| 2.0 | 2026-07-18 | 前端改為 React + Vite，加入完整第一版技術架構 |
| 2.1 | 2026-07-18 | 移除帳號、團主權限及公告停用功能；簡化團主 Dashboard 與團主申請；調整開團編輯、取消申請、訂單拒絕、角色刪除及公告範圍規則 |

---

# Table of Contents

1. Document Purpose  
2. Project Overview  
3. Project Background  
4. Project Objectives  
5. Project Scope  
6. Out of Scope  
7. User Roles  
8. Public Browsing Module  
9. Member Module  
10. Group Leader Module  
11. Administrator Module  
12. Activity and Product Rules  
13. Group Buy Rules  
14. Follow List Rules  
15. Order Rules  
16. Announcement and Notification Rules  
17. Frontend Architecture  
18. Backend Architecture  
19. Database Architecture  
20. Authentication and Authorization  
21. Search Design  
22. Image Management  
23. Error Handling  
24. Security Requirements  
25. User Experience Requirements  
26. Non-Functional Requirements  
27. Project Directory Structure  
28. Development Environment  
29. Deployment Requirements  
30. First Version Acceptance Criteria  
31. Future Expansion  
32. Final Design Decisions

---

# 1. Document Purpose

本文件定義 WuWaGroup 第一版的整體專案需求、系統範圍、使用者角色、核心功能、技術架構及開發限制。

本文件用途：

- 作為後續 User Flow 的需求來源
- 作為 UI / Wireframe Specification 的頁面依據
- 作為 Database Design 的資料模型依據
- 作為 API Design 的功能與權限依據
- 作為 Business Rules 的規則來源
- 作為 Development Roadmap 的開發範圍依據
- 避免開發期間持續加入未規劃功能
- 確保 React 前端、FastAPI 後端及 PostgreSQL 資料庫規格一致

本文件只定義第一版正式開發範圍。

未列入第一版的功能，不應在開發期間自行加入。

---

# 2. Project Overview

WuWaGroup 是一個以《鳴潮》官方周邊為主題的開團資訊整合與跟團管理平台。

平台主要整合：

- 官方活動
- 官方商品
- 商品關聯角色
- 多位團主的開團資訊
- 不同團主的商品價格
- 開團付款方式
- 是否需要二補
- 是否包含滿贈
- 收單截止時間
- 團規
- 團主外部聯絡方式
- 會員跟團清單
- 訂單狀態
- 團主公告（可由團主選擇是否公開）
- 系統通知

平台不直接處理金流、退款、物流或站內聊天。

實際付款、補款及聯絡仍透過平台外部工具進行，例如：

- Facebook
- Discord
- LINE

WuWaGroup 的定位是：

```text
官方周邊資訊整合
+
多團主開團比較
+
跟團清單管理
+
訂單狀態管理
+
公告與通知
```

不是：

```text
完整電子商務平台
```

---

# 3. Project Background

官方周邊活動通常分散在不同公告、社群貼文或平台。

會員想參加開團時，經常需要自行整理：

- 活動有哪些商品
- 商品對應哪些角色
- 哪些團主有開團
- 各團主價格
- 收單期限
- 付款方式
- 是否需要二補
- 是否包含滿贈
- 團規
- 團主聯絡方式

不同團主的資訊格式可能不一致，使會員難以快速比較。

團主則需要自行整理：

- 參團會員
- 商品數量
- 訂單狀態
- 付款確認
- 出貨進度
- 取消申請
- 團務公告

WuWaGroup 將上述資料整理為結構化資訊，降低會員比較開團及團主管理訂單的負擔。

---

# 4. Project Objectives

## 4.1 Information Aggregation

將官方活動、商品及角色整理為一致的資料結構。

會員可依活動、商品或角色搜尋資訊。

---

## 4.2 Group Buy Comparison

同一商品可以由多位團主開團。

會員可比較：

- 團主
- 團購價格
- 付款方式
- 是否需要二補
- 是否包含滿贈
- 收單期限
- 團規
- 主要聯絡平台

---

## 4.3 Member Order Management

會員可以：

- 收藏商品
- 建立跟團清單
- 調整商品數量
- 查看預估總額
- 送出正式訂單
- 查看訂單狀態
- 提出取消申請
- 查看通知

---

## 4.4 Group Leader Management

團主可以：

- 維護團主公開資料
- 設定預設團規
- 建立開團
- 設定商品價格與接單上限
- 查看訂單
- 接受或拒絕訂單
- 更新付款及出貨狀態
- 處理取消申請
- 發布團主整體公告與特定開團公告
- 選擇公告是否公開
- 修改或刪除自己的公告

---

## 4.5 Administrator Management

管理員可以：

- 管理官方活動
- 管理官方商品
- 管理角色
- 查看會員資料
- 審核團主申請
- 查看團主資料
- 建立、修改及刪除平台公告

---

## 4.6 Portfolio Objective

本專案同時作為個人作品集，展示：

- React 元件化前端開發
- React Router 頁面路由
- 前後端 API 串接
- FastAPI REST API 設計
- JWT 身分驗證
- PostgreSQL 關聯式資料庫設計
- SQLAlchemy ORM
- Alembic Migration
- Pydantic 資料驗證
- Database Transaction
- Row Lock 併發數量保護
- 權限管理
- 訂單狀態流程
- 歷史資料快照
- Git 與 GitHub 開發流程

---

# 5. Project Scope

第一版包含以下主要模組：

```text
Authentication
User Profile
Group Leader Application
Activity
Product
Character
Group Buy
Follow List
Order
Cancellation Request
Product Favorite
Announcement
Notification
Group Leader Dashboard
Administrator Dashboard
Image Upload
Global Search
```

---

# 6. Out of Scope

第一版不包含以下功能：

- 站內付款
- 信用卡付款
- 銀行帳號驗證
- 自動對帳
- 退款
- 發票
- 物流公司串接
- 物流追蹤
- 站內聊天
- 私訊
- 商品評價
- 團主評價
- 會員評價
- 團主收藏
- 活動收藏
- 訂單留言
- 黑名單資料表
- 商品庫存欄位
- 團主信用系統
- 自動匯率換算
- 多語系
- 行動 App
- SSR
- 第三方社群登入
- Refresh Token
- Token Blacklist
- 開團草稿
- 開團重新開啟
- 管理員接管團主訂單
- 會員帳號停用及重新啟用
- 團主權限停用及重新啟用
- 公告停用

---

# 7. User Roles

系統包含四種使用者身分。

---

## 7.1 Visitor

Visitor 為未登入使用者。

Visitor 可以：

- 瀏覽首頁
- 瀏覽活動
- 瀏覽活動商品
- 瀏覽商品詳情
- 查看不同團主的開團資訊
- 查看公開團規
- 查看團主公開資料
- 在團主頁或特定開團頁查看團主選擇公開的公告
- 使用全站搜尋
- 註冊
- 登入

Visitor 不可以：

- 收藏商品
- 建立跟團清單
- 送出訂單
- 提出取消申請
- 查看通知
- 申請團主
- 進入團主後台
- 進入管理員後台

---

## 7.2 Member

Member 為已登入的一般會員。

Member 可以使用所有 Visitor 功能，並可：

- 查看及修改個人資料
- 修改外部聯絡方式
- 自由選擇是否上傳頭像
- 收藏商品
- 查看收藏商品
- 建立跟團清單
- 修改跟團清單數量
- 送出正式訂單
- 查看自己的訂單
- 提出取消申請
- 查看通知
- 標記通知已讀
- 申請成為團主
- 查看自己的團主申請結果

---

## 7.3 Group Leader

Group Leader 不是獨立的 `app_user.role`。

會員具有：

```text
group_leader_profile
```

即具有團主資格。

團主公開名稱與至少一項公開聯絡方式完成後，才可公開團主頁、建立開團及發布團主公告。

Group Leader 擁有所有 Member 功能，並可：

- 維護團主公開資料
- 維護公開聯絡方式
- 維護預設團規
- 查看簡化版團主 Dashboard
- 建立開團
- 修改符合規則的開團內容
- 修改商品接單上限
- 提前結單
- 查看自己開團的訂單
- 查看訂單會員聯絡快照及會員頭像
- 接受訂單
- 拒絕訂單
- 標記已付款
- 標記已出貨
- 完成訂單
- 同意取消申請
- 拒絕取消申請
- 發布團主整體公告
- 發布特定開團公告
- 修改自己的公告
- 刪除自己的公告

團主不得：

- 管理其他團主的開團
- 查看其他團主的訂單
- 查看非自己訂單的會員聯絡方式
- 為其他團主發布公告
- 修改官方活動或商品

---

## 7.4 Administrator

Administrator 為：

```text
app_user.role = admin
```

Administrator 可以使用一般會員功能，並可：

- 進入 `/admin`
- 管理活動
- 管理商品
- 管理商品圖片
- 管理角色
- 查看會員列表
- 查看會員詳情
- 審核團主申請
- 查看團主列表
- 查看團主詳情
- 建立平台公告
- 修改平台公告
- 刪除平台公告

管理員權限不代表自動具有團主權限。

管理員若要使用團主功能，仍需具有：

```text
group_leader_profile
```

---

# 8. Public Browsing Module

## 8.1 Header

Header 左側：

```text
WuWaGroup Logo
```

點擊後返回首頁。

Header 中間：

```text
全站搜尋欄
```

搜尋範圍：

- 活動名稱
- 商品名稱
- 角色名稱

Header 右側依登入狀態顯示。

Visitor：

```text
登入
註冊
```

Member：

```text
跟團清單
通知
收藏
使用者頭像
```

使用者頭像選單包含：

- 個人資料
- 我的訂單
- 申請成為團主
- 團主後台入口
- 管理員後台入口
- 登出

團主後台入口只在會員具有 `group_leader_profile` 時顯示。

管理員後台入口只在：

```text
app_user.role = admin
```

時顯示。

---

## 8.2 Homepage

首頁只顯示活動卡片，不直接顯示商品卡片。

首頁分為：

```text
目前活動
已結束活動
```

活動卡片至少顯示：

- 活動圖片
- 活動名稱
- 活動分類
- 活動狀態

目前活動與已結束活動皆依：

```text
created_at DESC
```

排序。

首頁提供活動分類篩選。

---

## 8.3 Activity Detail

活動詳情頁顯示：

- Breadcrumb
- 活動圖片
- 活動名稱
- 活動分類
- 活動狀態
- 活動說明
- 商品 Grid

活動頁的商品卡片只顯示：

- 商品主要圖片
- 商品名稱

不直接顯示：

- 官方價格
- 團購價格
- 團主數量
- 角色
- 收藏數

---

## 8.4 Product Detail

商品詳情頁顯示：

- Breadcrumb
- 商品主要圖片
- 額外官方圖片
- 商品名稱
- 所屬活動
- 關聯角色
- 官方原價
- 官方幣別
- 收藏按鈕
- 團主開團卡片

同一商品可以關聯多名角色，但資料庫中仍只有一筆商品。

第一版不拆分：

- 角色款式
- 隨機款
- 盲盒款
- 綁定組合
- 不同規格
- 不同版本

---

## 8.5 Group Buy Card

商品頁的團主開團卡片顯示：

- 團主頭像
- 團主名稱
- 團購價格
- 付款方式
- 是否需要二補
- 是否包含滿贈
- 收單截止時間
- 主要聯絡平台
- 查看團規
- 加入跟團清單

團購價格統一使用：

```text
TWD
```

滿贈資訊只在活動支援滿贈時顯示。

---

# 9. Member Module

## 9.1 Registration

會員註冊必填：

- Email
- 密碼
- 確認密碼
- 暱稱
- 至少一項外部聯絡方式

外部聯絡方式：

- Facebook
- Discord
- LINE

可同時提供多項。

空白字串不視為有效聯絡方式。

會員頭像為非必填欄位。

會員可在註冊時上傳頭像，也可以使用系統預設頭像並於日後修改。

---

## 9.2 Login

登入使用：

- Email
- 密碼

登入成功後：

```text
取得 JWT Access Token
↓
保存至 sessionStorage
↓
呼叫 /auth/me
↓
建立 React 登入狀態
```

---

## 9.3 Member Profile

會員可以修改：

- 暱稱
- 頭像
- Facebook 聯絡資料
- Discord 聯絡資料
- LINE 聯絡資料

修改後仍必須保留至少一項有效聯絡方式。

頭像為非必填；未上傳時顯示系統預設頭像。

會員聯絡方式不公開顯示。

會員作為下單者時，目前頭像可顯示給該筆訂單所屬團主，用於辨識會員；其他團主及一般訪客不得查看會員頭像。

---

## 9.4 Product Favorite

第一版只支援商品收藏。

會員可以：

- 收藏商品
- 取消收藏商品
- 查看收藏商品列表

不支援：

- 收藏活動
- 收藏團主
- 追蹤團主
- 團主最愛

收藏商品不代表：

- 保留數量
- 參加開團
- 接收團主公告

---

## 9.5 Group Leader Application

一般會員可申請成為團主。

第一版申請流程保持簡單，不要求申請說明，也不提供管理員審核備註。

申請狀態：

```text
pending
approved
rejected
```

申請限制：

- 同一會員同時最多只能有一筆 `pending` 申請
- 已具有 `group_leader_profile` 的會員不可再次申請
- 申請被拒絕後，只要目前沒有 `pending` 申請，即可再次申請

申請通過時建立新的：

```text
group_leader_profile
```

申請通過後，會員先進入團主資料設定頁，完成：

- 團主公開名稱
- 至少一項團主公開聯絡方式

在資料完成前，可以進入團主資料設定頁，但不可公開團主頁、建立開團或發布團主公告。

會員私人聯絡方式不會自動複製成團主公開聯絡方式。

---

# 10. Group Leader Module

## 10.1 Group Leader Profile

團主公開資料包含：

- 團主頭像
- 團主公開名稱
- 自我介紹
- Facebook
- Discord
- LINE
- 預設團規
- 成為團主時間
- 開團次數
- 完成訂單數

團主頭像使用會員目前頭像；未上傳時顯示系統預設頭像。

團主自我介紹為非必填。

團主公開頁、第一筆開團及團主公告啟用前，必須完成：

- 團主公開名稱
- 至少一項公開聯絡方式

團主公開聯絡方式與會員私人聯絡方式為不同資料，不會自動將會員私人聯絡方式公開。

---

## 10.2 Group Leader Dashboard

Dashboard 使用簡化版，顯示：

- 目前開團
- 待處理訂單
- 待處理取消申請
- 最近訂單

詳細資料仍由各管理列表顯示，不在 Dashboard 重複建立大量統計。

---

## 10.3 Create Group Buy Wizard

建立開團使用三步驟 Wizard。

### Step 1：Select Products

顯示指定活動的商品。

功能：

- 商品 Checkbox
- 全選
- 清除選擇
- 上一步
- 下一步

至少選擇一項商品。

---

### Step 2：Price and Quantity

針對每項已選商品填寫：

- 團購價格
- 接單數量上限

規則：

```text
unit_price >= 0
max_quantity > 0
```

---

### Step 3：Group Buy Settings

填寫：

- 付款方式
- 是否需要二補
- 是否包含滿贈
- 收單截止時間
- 團規
- 主要聯絡平台
- 主要聯絡內容

每個開團只能選擇一個主要聯絡平台。

主要聯絡平台：

```text
facebook
discord
line
```

團規預設帶入：

```text
group_leader_profile.default_rules
```

第一版不支援草稿。

建立成功後立即成為：

```text
status = open
```

---

## 10.4 Group Buy Editing

若開團尚未建立任何正式訂單，團主可以修改：

- 已選商品集合
- 商品價格
- 商品接單數量上限
- 付款方式
- 是否需要二補
- 是否包含滿贈
- 收單截止時間
- 團規
- 主要聯絡平台
- 主要聯絡內容

若開團已經存在至少一筆正式訂單，只能修改：

- 收單截止時間
- 主要聯絡平台
- 主要聯絡內容
- 商品接單數量上限

已經存在正式訂單後，不可修改：

- 所屬團主
- 所屬活動
- 已選商品集合
- 商品價格
- 付款方式
- 是否需要二補
- 是否包含滿贈
- 團規
- 建立時間

修改商品接單數量上限時，新上限不得低於該商品目前被有效訂單占用的數量。

---

## 10.5 Close Group Buy

團主可以提前結單。

結單後：

- 不接受新的跟團清單項目
- 不接受新的正式訂單
- 既有訂單仍可處理
- 團主仍可發布公告

第一版不提供重新開啟。

---

# 11. Administrator Module

## 11.1 Activity Management

管理員可以：

- 建立活動
- 查看活動列表
- 查看活動詳情
- 修改活動
- 將活動設為已結束

活動欄位包含：

- 名稱
- 分類
- 說明
- 圖片
- 狀態
- 是否支援滿贈

---

## 11.2 Product Management

管理員可以：

- 建立商品
- 修改商品
- 上架商品
- 下架商品
- 管理主要圖片
- 管理額外圖片
- 關聯角色

商品下架後：

- 不顯示於一般活動商品列表
- 不可加入新開團
- 歷史開團及訂單關聯仍保留

---

## 11.3 Character Management

管理員可以：

- 建立角色
- 修改角色名稱
- 查看角色關聯商品
- 刪除未關聯任何商品的角色

角色名稱不可重複。

已關聯商品的角色不可直接刪除，必須先解除所有商品關聯。

---

## 11.4 User Management

管理員可以：

- 查看會員列表
- 查看會員詳情
- 查看會員是否具有團主資格

第一版不提供會員帳號停用、重新啟用或刪除功能。

---

## 11.5 Group Leader Application Review

管理員可以：

- 查看待審核申請
- 查看申請詳情
- 通過申請
- 拒絕申請

同一筆申請只能處理一次。

審核完成後不可再次變更該筆申請結果。

---

## 11.6 Group Leader Management

管理員可以：

- 查看團主列表
- 查看團主詳情
- 查看團主公開資料
- 查看團主目前開團與歷史統計

第一版不提供團主權限停用、重新啟用或移除功能。

---

## 11.7 Platform Announcement

管理員可以：

- 建立平台公告
- 修改平台公告
- 刪除平台公告

平台公告發布後，通知所有已註冊會員。

修改平台公告時，該公告已建立的通知內容同步更新。

刪除平台公告時，該公告已建立的通知一併刪除。

---

# 12. Activity and Product Rules

## 12.1 Activity Status

活動狀態：

```text
open
ended
```

活動結束後仍可：

- 瀏覽活動
- 瀏覽商品
- 查看歷史開團
- 查看歷史訂單

但不可建立新開團。

---

## 12.2 Full Gift

活動使用：

```text
has_full_gift
```

控制是否支援滿贈。

若：

```text
has_full_gift = false
```

團主建立開團時：

- 不顯示滿贈選項
- `includes_full_gift` 必須為 `false`

---

## 12.3 Official Price

官方價格保存：

- 原始金額
- 原始幣別

第一版至少支援：

```text
CNY
JPY
TWD
```

不自動換算為新台幣。

---

## 12.4 Product Character Relationship

一項商品可以關聯多名角色。

一名角色也可以關聯多項商品。

商品與角色為多對多關聯。

---

# 13. Group Buy Rules

一筆開團必須：

- 屬於一名具有 `group_leader_profile` 的團主
- 團主已完成公開名稱與至少一項公開聯絡方式
- 屬於一項活動
- 至少包含一項商品
- 使用一種付款方式
- 設定收單截止時間
- 設定團規
- 設定一個主要聯絡平台
- 設定一個主要聯絡內容

開團狀態：

```text
open
closed
```

實際可跟團狀態需同時確認：

```text
group_buy.status = open
AND
group_buy.deadline_at > current_time
AND
activity.status = open
```

即使資料庫保存：

```text
status = open
```

只要已超過截止時間，仍不可跟團。

---

# 14. Follow List Rules

每名會員最多只有一份跟團清單。

一份跟團清單只能屬於一筆開團，因此同時只會對應：

- 一名團主
- 一項活動
- 一筆開團

跟團清單可以包含該開團中的多項商品。

顯示：

- 團主
- 活動
- 商品
- 單價
- 數量
- 小計
- 預估總額
- 團規
- 付款方式
- 主要聯絡方式

跟團清單不保留商品數量。

加入跟團清單時可以進行初步數量檢查，但正式送出訂單時必須重新驗證。

會員不能在同一跟團清單中混合不同團主或不同開團的商品。

若會員已有跟團清單，又選擇其他開團商品，前端需提示先清空或替換目前清單。

---

# 15. Order Rules

## 15.1 Order Creation

正式訂單由目前跟團清單建立。

前端不得提交：

- 商品價格
- 小計
- 訂單總額
- 團主名稱快照
- 活動名稱快照
- 團規快照
- 聯絡方式快照

以上資料由後端重新查詢及計算。

送出訂單時，後端必須：

```text
1. 驗證登入會員與資源權限
2. 鎖定相關 group_buy_product
3. 驗證開團仍可接受訂單
4. 重新計算有效訂單占用數量
5. 驗證商品數量
6. 重新取得商品價格
7. 計算小計及總額
8. 建立訂單
9. 建立訂單明細
10. 保存必要快照
11. 清空跟團清單
12. Commit
```

---

## 15.2 Order Status

訂單狀態：

```text
pending_confirmation
pending_payment
paid
shipped
completed
cancelled
rejected
```

流程：

```text
pending_confirmation
↓ 接受
pending_payment
↓ 確認付款
paid
↓ 出貨
shipped
↓ 完成
completed
```

拒絕：

```text
pending_confirmation
↓
rejected
```

取消：

```text
允許取消的訂單狀態
↓ 團主同意取消
cancelled
```

---

## 15.3 Order Rejection

團主只能拒絕：

```text
pending_confirmation
```

狀態的訂單。

拒絕原因第一版為必填。

拒絕後保存於：

```text
group_order.rejection_reason
```

會員可以在訂單詳情查看拒絕原因。

拒絕完成後不允許修改拒絕原因，也不允許將拒絕訂單恢復為待確認。

---

## 15.4 Order Quantity Occupation

以下訂單計入占用數量：

```text
pending_confirmation
pending_payment
paid
shipped
completed
```

以下訂單不計入：

```text
cancelled
rejected
```

---

## 15.5 Historical Snapshot

訂單建立時需保存：

- 團主名稱
- 活動名稱
- 付款方式
- 是否需要二補
- 是否包含滿贈
- 團規
- 團主主要聯絡方式
- 會員外部聯絡方式
- 商品名稱
- 商品圖片
- 商品單價
- 商品數量
- 商品小計
- 訂單總額

後續修改會員資料、團主資料、開團價格或團規，不影響既有訂單。

---

## 15.6 Cancellation Request

取消申請狀態：

```text
pending
approved
rejected
```

建立取消申請時：

```text
訂單狀態不變
```

團主同意後：

```text
cancellation_request.status = approved
group_order.status = cancelled
```

團主拒絕後：

```text
cancellation_request.status = rejected
group_order.status 保持原狀
```

同一筆訂單在同一時間最多只能有一筆 `pending` 取消申請。

先前取消申請已被拒絕後，只要訂單仍符合取消條件，會員可以再次提出新的取消申請。

---

# 16. Announcement and Notification Rules

## 16.1 Announcement Types

公告分為：

```text
platform
group_leader_general
group_buy
```

- `platform`：管理員發布的平台公告
- `group_leader_general`：團主對自己所有未完成訂單會員發布的整體公告
- `group_buy`：團主針對特定開團發布的公告

---

## 16.2 Platform Announcement

平台公告由管理員建立。

通知對象為所有已註冊會員。

平台公告不建立獨立公開公告頁，主要顯示於會員通知中心。

---

## 16.3 Group Leader General Announcement

團主整體公告不綁定單一開團。

通知對象為該團主名下至少有一筆未完成訂單的會員。

適用情境例如：

- 團主臨時無法處理訂單
- 整體出貨作業延遲
- 團主需要通知所有尚未完成交易的會員

團主可選擇是否公開。

選擇公開時，公告顯示於團主公開資料頁；未登入訪客也可以查看。

---

## 16.4 Specific Group Buy Announcement

特定開團公告必須綁定：

```text
group_buy
```

通知對象為該開團中至少有一筆未完成訂單的會員。

適用情境例如：

- 指定官方活動商品延期
- 指定商品接單上限已滿
- 該開團提前收單
- 該開團到貨或出貨發生狀況

團主可選擇是否公開。

選擇公開時，公告顯示於該開團詳情頁；未登入訪客也可以查看。

---

## 16.5 Unfinished Order Audience

團主公告的未完成訂單狀態為：

```text
pending_confirmation
pending_payment
paid
shipped
```

不通知：

```text
completed
cancelled
rejected
```

同一會員即使有多筆符合條件的訂單，也只建立一則相同公告通知。

團主不能手動指定個別通知對象。

公告是否公開只影響公開頁面顯示，不改變通知對象。

---

## 16.6 Announcement Editing and Deletion

公告發布後可以修改或刪除，不提供停用功能。

修改公告時：

- 公告內容更新
- 該公告已建立的通知內容同步更新
- 不重新建立第二批通知

刪除公告時：

- 公告資料刪除
- 該公告已建立的通知一併刪除

團主只能修改或刪除自己的公告。

管理員只能修改或刪除平台公告。

---

## 16.7 Notification Types

通知分類：

```text
system
group_leader
```

通知集中顯示於同一列表，以標籤區分來源。

通知支援：

- 查看列表
- 查看未讀數量
- 標記單筆已讀
- 全部標記已讀

會員不可自行刪除通知。

公告被刪除時，由系統一併刪除該公告產生的通知；訂單狀態等其他系統通知不受影響。

---

# 17. Frontend Architecture

## 17.1 Core Technology

前端使用：

```text
React
Vite
JavaScript
React Router
Fetch API
CSS
```

第一版不使用：

```text
TypeScript
Redux
Axios
TanStack Query
Tailwind CSS
Bootstrap
Material UI
Next.js
SSR
```

---

## 17.2 React Responsibility

React 負責：

- 頁面渲染
- 元件管理
- 表單狀態
- Loading 狀態
- Error 狀態
- Modal
- 登入狀態
- 權限畫面
- 路由導向
- API 資料顯示
- 跟團清單操作
- 訂單操作
- 管理員操作

---

## 17.3 Routing

使用：

```text
BrowserRouter
```

主要 Route：

```text
/
 /login
 /register
 /search
 /activities/:activityId
 /products/:productId
 /group-buys/:groupBuyId
 /group-leaders/:groupLeaderId
 /favorites
 /follow-list
 /orders
 /orders/:orderId
 /notifications
 /profile
 /group-leader/*
 /admin/*
```

Route Guard 只負責前端顯示與導向。

後端仍必須重新驗證所有權限。

---

## 17.4 State Management

全域狀態只使用：

```text
AuthContext
```

保存：

- 目前使用者
- 是否登入
- 是否為管理員
- 是否具有 `group_leader_profile`
- 登入初始化狀態

一般頁面資料使用：

```text
useState
useEffect
```

第一版不加入 Redux。

---

## 17.5 API Communication

使用原生：

```text
fetch
```

建立共用：

```text
apiClient
```

統一處理：

- API Base URL
- Authorization Header
- JSON 解析
- 共通錯誤
- 401
- Network Error

API Base URL 從環境變數取得：

```text
VITE_API_BASE_URL
```

---

## 17.6 Token Storage

JWT Access Token 保存於：

```text
sessionStorage
```

登出時：

```text
移除 Token
清除 AuthContext
導向首頁或登入頁
```

頁面重新整理時：

```text
讀取 sessionStorage
↓
呼叫 GET /auth/me
↓
重新建立登入狀態
```

第一版不使用 Refresh Token。

---

## 17.7 Styling

第一版使用一般 CSS。

CSS 分為：

```text
global
layout
page
component
```

不使用 CSS Framework。

元件 Class Name 需避免全域命名衝突。

---

## 17.8 React Layouts

主要 Layout：

```text
MainLayout
MemberLayout
GroupLeaderLayout
AdminLayout
```

`MainLayout` 包含：

- Header
- Main Content
- Footer

`GroupLeaderLayout` 包含：

- 團主後台側邊選單
- 團主頁面內容

`AdminLayout` 包含：

- 管理員側邊選單
- 管理員頁面內容

---

# 18. Backend Architecture

後端使用：

```text
Python
FastAPI
SQLAlchemy
Pydantic
Alembic
JWT
PostgreSQL
```

後端採分層結構：

```text
Router
Service
Repository / Query
Model
Schema
```

責任：

### Router

- 接收 HTTP Request
- 驗證基本參數
- 呼叫 Service
- 回傳 Response

### Service

- 商業規則
- 權限驗證
- 狀態轉換
- Transaction
- 通知建立
- 數量檢查

### Repository / Query

- 資料庫查詢
- 複雜 Join
- 分頁
- Row Lock

### Model

- SQLAlchemy 資料表模型
- Relationship
- Constraint

### Schema

- Pydantic Request
- Pydantic Response
- 欄位驗證

---

# 19. Database Architecture

資料庫使用：

```text
PostgreSQL
```

第一版預計使用 18 張主要資料表：

1. app_user
2. group_leader_application
3. group_leader_profile
4. activity
5. product
6. product_image
7. character
8. product_character
9. group_buy
10. group_buy_product
11. follow_list
12. follow_list_item
13. group_order
14. order_item
15. cancellation_request
16. product_favorite
17. announcement
18. notification

主要設計原則：

- Primary Key 使用 UUID
- 時間使用 TIMESTAMPTZ
- 資料庫保存 UTC
- 前端顯示 Asia/Taipei
- 金額使用 NUMERIC
- 不使用 FLOAT 保存金額
- 歷史訂單使用 Snapshot
- 訂單及必要歷史資料不直接刪除
- 使用 Foreign Key 維持關聯
- 使用 Unique Constraint 避免重複
- 使用 Check Constraint 維持狀態一致性
- 使用 Transaction 維持跨表一致性
- 使用 Row Lock 防止超量接單

---

# 20. Authentication and Authorization

## 20.1 Authentication

使用：

```text
JWT Bearer Access Token
```

Header：

```http
Authorization: Bearer <token>
```

第一版不提供：

```text
Refresh Token
Token Blacklist
Server-Side Logout
```

登出由前端移除 Token。

---

## 20.2 Protected API

所有受保護 API 必須重新確認：

- JWT 有效且未過期
- 對應會員仍存在
- 目前會員具有該資源所需權限

不得只依賴前端畫面隱藏功能。

---

## 20.3 Group Leader API

所有 `/group-leader/*` API 必須確認目前會員具有：

```text
group_leader_profile
```

建立開團或發布團主公告時，另需確認團主已完成公開名稱與至少一項公開聯絡方式。

---

## 20.4 Administrator API

所有 `/admin/*` API 必須確認：

```text
app_user.role = admin
```

---

## 20.5 Resource Ownership

後端必須驗證：

- 會員只能查看自己的訂單
- 團主只能查看自己開團的訂單
- 團主只能管理自己的開團
- 團主只能管理自己的公告
- 會員只能修改自己的跟團清單
- 會員只能處理自己的取消申請

前端 Route Guard 不可取代後端驗證。

---

# 21. Search Design

全站搜尋支援：

- 活動名稱
- 商品名稱
- 角色名稱

不搜尋：

- 會員
- 團主
- 訂單
- 團規
- 公告
- 外部聯絡方式

搜尋結果分類顯示：

```text
活動
商品
角色
```

點擊角色搜尋結果後，顯示該角色關聯商品。

---

# 22. Image Management

第一版支援上傳：

- 會員頭像
- 活動圖片
- 商品圖片

圖片分類：

```text
avatar
activity
product
```

資料庫只保存圖片 URL，不保存圖片 Binary。

主要圖片：

- 活動一張主要圖片
- 商品一張主要圖片
- 會員一張非必填頭像

商品可以有多張額外圖片。

未上傳會員頭像時，前端顯示系統預設頭像。

會員成為團主後，團主公開頁與開團卡片使用同一張會員頭像。

會員作為下單者時，該筆訂單所屬團主可以查看會員目前頭像，以協助辨識；其他使用者不可查看一般會員頭像。

第一版使用共用圖片上傳 API。

檔案大小、格式及尺寸限制由 API Design 與 Business Rules 定義。

---

# 23. Error Handling

API 使用統一錯誤格式：

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "錯誤訊息",
    "details": null
  }
}
```

React 前端需處理：

- 表單驗證錯誤
- 權限不足
- 資源不存在
- 狀態衝突
- 數量不足
- Token 無效
- 網路錯誤
- 伺服器錯誤

不得只依賴 HTTP Status 顯示同一段通用錯誤。

---

# 24. Security Requirements

第一版至少需要：

- 密碼雜湊
- JWT 簽章驗證
- JWT 到期時間
- Role 驗證
- Group Leader Profile 驗證
- Resource Ownership 驗證
- Pydantic 輸入驗證
- SQLAlchemy 參數化查詢
- 圖片檔案格式限制
- 圖片大小限制
- CORS Origin 白名單
- 前端文字正常轉義
- 不執行會員輸入的 HTML
- 登入錯誤不透露 Email 是否存在
- 私人聯絡方式不公開
- 一般會員頭像只對本人及其訂單所屬團主顯示
- 敏感操作使用 Transaction

Access Token 使用 `sessionStorage` 時，仍需避免 XSS。

第一版前端不使用：

```text
dangerouslySetInnerHTML
```

顯示團規、公告及拒絕原因時，皆以一般文字方式輸出。

---

# 25. User Experience Requirements

前端需提供：

- Loading 狀態
- Empty State
- Error State
- Confirmation Modal
- 成功訊息
- 表單欄位錯誤
- 禁止重複送出
- 基本 Responsive Layout
- Breadcrumb
- 清楚的狀態標籤
- 可理解的權限提示

重要操作需確認：

- 清空或替換跟團清單
- 送出訂單
- 提出取消申請
- 接受訂單
- 拒絕訂單
- 標記付款
- 標記出貨
- 完成訂單
- 同意取消
- 拒絕取消
- 結單
- 刪除公告
- 刪除角色

---

# 26. Non-Functional Requirements

## 26.1 Maintainability

程式需：

- 功能分層
- 元件化
- 避免單一大型檔案
- 避免重複 API 邏輯
- 避免重複權限判斷
- 使用一致命名
- 保留必要註解

---

## 26.2 Performance

列表 API 必須分頁。

搜尋欄位需建立適當索引。

避免 React 頁面重複呼叫相同 API。

避免在列表 API 回傳完整大型內容。

---

## 26.3 Responsive Design

第一版至少需支援：

- 桌面
- 手機

平板使用相同的 Responsive Layout 自然調整。

管理員與團主後台以桌面操作體驗為優先，但仍需能在小螢幕查看主要資料與完成必要操作。

---

## 26.4 Accessibility

第一版至少提供：

- 表單 Label
- 圖片 Alt
- 可辨識按鈕文字
- 不只依賴顏色表達狀態
- 合理標題階層

完整的進階無障礙與 Modal Focus 管理不列為第一版驗收項目。

---

## 26.5 Timezone

資料庫：

```text
UTC
```

前端預設顯示：

```text
Asia/Taipei
```

---

# 27. Project Directory Structure

```text
WuWaGroup/
├─ frontend/
│  ├─ public/
│  ├─ src/
│  │  ├─ assets/
│  │  ├─ components/
│  │  │  ├─ common/
│  │  │  ├─ activity/
│  │  │  ├─ product/
│  │  │  ├─ group-buy/
│  │  │  ├─ order/
│  │  │  ├─ group-leader/
│  │  │  └─ admin/
│  │  ├─ contexts/
│  │  │  └─ AuthContext.jsx
│  │  ├─ hooks/
│  │  ├─ layouts/
│  │  │  ├─ MainLayout.jsx
│  │  │  ├─ GroupLeaderLayout.jsx
│  │  │  └─ AdminLayout.jsx
│  │  ├─ pages/
│  │  │  ├─ public/
│  │  │  ├─ auth/
│  │  │  ├─ member/
│  │  │  ├─ group-leader/
│  │  │  └─ admin/
│  │  ├─ routes/
│  │  │  └─ AppRoutes.jsx
│  │  ├─ services/
│  │  │  ├─ apiClient.js
│  │  │  ├─ authService.js
│  │  │  ├─ activityService.js
│  │  │  ├─ productService.js
│  │  │  ├─ orderService.js
│  │  │  └─ adminService.js
│  │  ├─ styles/
│  │  ├─ utils/
│  │  ├─ App.jsx
│  │  └─ main.jsx
│  ├─ .env.example
│  ├─ index.html
│  ├─ package.json
│  └─ vite.config.js
│
├─ backend/
│  ├─ app/
│  │  ├─ api/
│  │  ├─ core/
│  │  ├─ models/
│  │  ├─ repositories/
│  │  ├─ schemas/
│  │  ├─ services/
│  │  ├─ utils/
│  │  └─ main.py
│  ├─ alembic/
│  ├─ tests/
│  ├─ .env.example
│  ├─ alembic.ini
│  └─ requirements.txt
│
├─ docs/
│  ├─ 01_Project_Specification_v2.1.md
│  ├─ 02_User_Flow_v2.0.md
│  ├─ 03_UI_Wireframe_Specification_v2.0.md
│  ├─ 04_Database_Design_v2.0.md
│  ├─ 05_API_Design_v2.0.md
│  ├─ 06_Business_Rules_v2.0.md
│  └─ 07_Development_Roadmap_v2.0.md
│
├─ .gitignore
└─ README.md
```

---

# 28. Development Environment

開發環境：

```text
Frontend：React Development Server
Backend：FastAPI Development Server
Database：PostgreSQL
```

預設本機位置可使用：

```text
React：http://localhost:5173
FastAPI：http://localhost:8000
```

FastAPI 僅允許明確設定的 React Origin。

Frontend 環境變數：

```text
VITE_API_BASE_URL
```

Backend 環境變數至少包含：

```text
DATABASE_URL
JWT_SECRET_KEY
JWT_ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES
CORS_ALLOWED_ORIGINS
UPLOAD_DIRECTORY
```

`.env` 不提交至 GitHub。

GitHub 只提交：

```text
.env.example
```

---

# 29. Deployment Requirements

前端與後端可以分開部署。

Frontend：

```text
Vite Production Build
```

Backend：

```text
FastAPI Application
```

Database：

```text
PostgreSQL
```

使用 `BrowserRouter` 時，前端部署環境必須將未知前端 Route 回退至：

```text
index.html
```

正式環境必須：

- 使用 HTTPS
- 設定正式 API Base URL
- 設定正式 CORS Origin
- 不公開 `.env`
- 不使用開發用 Secret
- 不啟用不必要的 Debug 資訊

第一版不在本文件指定特定雲端服務供應商。

---

# 30. First Version Acceptance Criteria

第一版完成需至少符合以下條件。

## Authentication

- 會員可以註冊
- 會員可以登入
- 會員可以登出
- 受保護 API 會重新驗證 JWT、會員及資源權限

## Public Information

- 可以瀏覽活動
- 可以瀏覽商品
- 可以查看商品角色
- 可以查看多位團主開團
- 可以搜尋活動、商品與角色
- 可以在團主頁或特定開團頁查看公開公告

## Member

- 註冊時至少提供一項外部聯絡方式
- 可以選擇是否上傳頭像
- 可以修改個人資料
- 可以收藏商品
- 可以建立跟團清單
- 可以送出訂單
- 可以查看訂單
- 可以提出取消申請
- 取消申請被拒後，符合條件時可以再次申請
- 可以查看通知並標記已讀
- 可以申請團主
- 同一時間不能建立兩筆待審核團主申請

## Group Leader

- 可以維護團主公開資料
- 自我介紹可以留空
- 公開團主頁、建立第一筆開團或發布公告前，完成公開名稱與至少一項公開聯絡方式
- 可以建立開團
- 無正式訂單時可以修改全部開團內容
- 有正式訂單後仍可修改收單時間、聯絡方式及接單上限
- 接單上限不可低於目前有效訂單占用數量
- 可以結單
- 可以查看訂單會員聯絡快照及頭像
- 可以接受或拒絕訂單
- 拒絕訂單必須填寫原因
- 可以更新訂單狀態
- 可以處理取消申請
- 可以發布團主整體公告
- 可以發布特定開團公告
- 可以選擇團主公告是否公開
- 可以修改或刪除自己的公告

## Administrator

- 可以管理活動
- 可以管理商品
- 可以建立、編輯及刪除符合條件的角色
- 可以查看會員及團主資料
- 可以審核團主申請
- 可以建立、修改及刪除平台公告

## Announcement and Notification

- 團主整體公告通知該團主所有未完成訂單會員
- 特定開團公告只通知該開團未完成訂單會員
- 已完成、取消或拒絕訂單不接收團主公告
- 同一公告對同一會員只建立一則通知
- 修改公告會同步更新相關通知內容
- 刪除公告會刪除相關通知
- 會員不可自行刪除通知

## Data Integrity

- 跟團清單不保留數量
- 正式下單使用 Transaction
- 正式下單使用 Row Lock
- 不允許超過接單上限
- 訂單保存必要快照
- 被拒絕或取消訂單不占用數量
- 私人聯絡方式不公開

---

# 31. Future Expansion

未來版本可考慮：

- 評價功能
- 盲盒商品
- 人氣款價格
- 平台內付款
- 行動 App

以上功能不納入第一版。

---

# 32. Final Design Decisions

第一版最終決策：

1. 前端使用 React + Vite + JavaScript。
2. 使用 React Router 的 BrowserRouter。
3. 使用原生 Fetch API。
4. 使用 AuthContext 管理登入狀態。
5. 不使用 Redux、Axios 或 CSS Framework。
6. JWT Access Token 保存於 sessionStorage。
7. 第一版不使用 Refresh Token。
8. 後端使用 FastAPI、SQLAlchemy、Pydantic 及 Alembic。
9. 資料庫使用 PostgreSQL。
10. 平台定位為資訊整合與跟團管理，不是完整電商平台。
11. 不處理站內付款、退款、物流及聊天。
12. 收藏功能只收藏商品。
13. 會員頭像為非必填，未上傳時使用預設頭像。
14. 一般會員頭像只對本人及其訂單所屬團主顯示；團主頭像公開顯示。
15. 跟團清單一次只能屬於一筆開團。
16. 跟團清單不保留商品數量。
17. 正式下單重新驗證價格、數量與狀態。
18. 訂單保存必要歷史快照。
19. 團主不是獨立 UserRole；具有 `group_leader_profile` 即具有團主資格。
20. 團主申請不要求申請說明或審核備註，同一時間最多一筆待審核申請。
21. 申請通過後建立新的團主資料，並在公開團主頁、首次開團或發布公告前完成公開名稱與至少一項公開聯絡方式。
22. 團主 Dashboard 使用簡化版。
23. 開團沒有正式訂單時可修改全部內容。
24. 開團已有正式訂單後，只可修改收單時間、主要聯絡方式及接單上限。
25. 接單上限不可低於目前有效訂單占用數量。
26. 第一版不支援開團草稿或重新開啟已結單開團。
27. 訂單拒絕原因為必填，拒絕後不可修改或恢復訂單。
28. 同一訂單同時最多一筆待處理取消申請，被拒後符合條件時可再次申請。
29. 團主公告分為團主整體公告與特定開團公告。
30. 團主公告只通知未完成訂單會員，並可選擇是否公開。
31. 公告可以修改或刪除，不提供停用功能。
32. 修改公告同步更新相關通知，刪除公告一併刪除相關通知。
33. 會員不可自行刪除通知。
34. 角色可編輯名稱；未關聯商品時可刪除，已關聯商品時不可直接刪除。
35. 第一版不提供會員帳號停用、團主權限停用或公告停用。
36. 第一版維持可完成、可測試及可展示的個人專案範圍。

---

# End of Document
