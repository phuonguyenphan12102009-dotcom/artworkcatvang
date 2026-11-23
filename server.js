const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Khoá để reset (đặt trên server). Để trống = ai cũng gọi được /reset (chỉ nên dùng khi chạy thử trên máy).
const ADMIN_KEY = process.env.ADMIN_KEY || '';

// Nơi lưu số người đã xem:
//  - Mặc định: file data.json (giữ được khi khởi động lại nếu ổ đĩa không bị xoá)
//  - Nếu đặt UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN: lưu ở Upstash Redis (miễn phí),
//    dùng khi deploy trên Render gói Free vì ổ đĩa ở đó bị xoá mỗi lần server ngủ/khởi động lại.
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data.json');
const UP_URL = process.env.UPSTASH_REDIS_REST_URL;
const UP_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// ---------- Lưu trữ: file ----------
function createFileStore() {
  let saved = {};
  try { saved = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch (e) { /* chưa có file */ }
  const viewers = new Set(Array.isArray(saved.viewers) ? saved.viewers : []);
  let resetSeq = Number(saved.resetSeq) || 0;

  const save = () => {
    try { fs.writeFileSync(DATA_FILE, JSON.stringify({ viewers: [...viewers], resetSeq })); }
    catch (e) { console.error('Không ghi được file dữ liệu:', e.message); }
  };

  return {
    async visit(id) {
      if (!viewers.has(id)) { viewers.add(id); save(); }
      return { count: viewers.size, resetSeq };
    },
    async state() { return { count: viewers.size, resetSeq }; },
    async reset() { viewers.clear(); resetSeq += 1; save(); return { count: 0, resetSeq }; },
  };
}

// ---------- Lưu trữ: Upstash Redis (REST) ----------
function createUpstashStore() {
  const K_VIEWERS = 'living-artwork:viewers';
  const K_SEQ = 'living-artwork:resetSeq';
  const CACHE_MS = 3000; // giảm số lệnh gửi lên Upstash khi nhiều người cùng poll
  let cache = null;
  let cacheAt = 0;

  const cmd = async (...args) => {
    const r = await fetch(UP_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${UP_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    });
    const d = await r.json();
    if (d.error) throw new Error(d.error);
    return d.result;
  };

  const fresh = async () => {
    cache = {
      count: Number(await cmd('SCARD', K_VIEWERS)) || 0,
      resetSeq: Number(await cmd('GET', K_SEQ)) || 0,
    };
    cacheAt = Date.now();
    return cache;
  };

  return {
    async visit(id) { await cmd('SADD', K_VIEWERS, id); return fresh(); },
    async state() { return cache && Date.now() - cacheAt < CACHE_MS ? cache : fresh(); },
    async reset() { await cmd('DEL', K_VIEWERS); await cmd('INCR', K_SEQ); return fresh(); },
  };
}

const store = UP_URL && UP_TOKEN ? createUpstashStore() : createFileStore();
console.log(UP_URL && UP_TOKEN ? 'Lưu trữ: Upstash Redis' : `Lưu trữ: file ${DATA_FILE}`);

// ---------- API ----------
const ID_RE = /^[A-Za-z0-9_-]{8,64}$/;

app.use(express.json({ limit: '1kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Một người (một thiết bị) ghé xem: được cộng dồn, mỗi thiết bị chỉ tính 1 lần
app.post('/visit', async (req, res) => {
  const id = req.body && req.body.id;
  if (typeof id !== 'string' || !ID_RE.test(id)) {
    return res.status(400).json({ ok: false, error: 'invalid id' });
  }
  try {
    res.json({ ok: true, ...(await store.visit(id)) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
});

// Lấy tổng số người đã xem
app.get('/count', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    res.json(await store.state());
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
});

// Reset về 0 (cần ADMIN_KEY nếu đã đặt)
app.post('/reset', async (req, res) => {
  if (ADMIN_KEY && req.get('x-admin-key') !== ADMIN_KEY) {
    return res.status(403).json({ ok: false, error: 'forbidden' });
  }
  try {
    res.json({ ok: true, ...(await store.reset()) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
});

app.listen(PORT, () => console.log(`Chạy tại http://localhost:${PORT}`));
