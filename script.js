/* =========================================================
   DOM
========================================================= */

const header = document.querySelector('.site-header');

const about = document.querySelector('#about');
const blog = document.querySelector('#blog');
const homeSection = document.querySelector('#home');
const intro = document.querySelector('#intro');
const hackmdPosts = document.querySelector('#hackmd-posts');

let hasLoadedHackmdPosts = false;

const typeLines = document.querySelectorAll('.type-line');
const typingCursor = document.querySelector('.typing-cursor');

const backgroundCodeLayer =
  document.querySelector('.background-code-layer');


/* =========================================================
   HERO TITLE
   只打字，不刪除
========================================================= */

let currentLine = 0;
let currentCharacter = 0;

function typeHeroTitle() {

  if (currentLine >= typeLines.length) {

    if (typingCursor) {
      typingCursor.classList.add('visible');
    }

    return;
  }

  const line = typeLines[currentLine];
  const text = line.dataset.text || '';

  line.textContent =
    text.slice(0, currentCharacter + 1);

  currentCharacter += 1;

  if (currentCharacter >= text.length) {

    currentLine += 1;
    currentCharacter = 0;

    setTimeout(
      typeHeroTitle,
      260
    );

    return;
  }

  setTimeout(
    typeHeroTitle,
    105
  );
}


/* =========================================================
   啟動 HERO TITLE
========================================================= */

setTimeout(
  typeHeroTitle,
  350
);


/* =========================================================
   BACKGROUND CODE
========================================================= */

let codeBlocks = [];

let backgroundTimers = [];

let resizeTimer = null;


/* =========================================================
   解析 background-code.txt
========================================================= */

function extractCodeBlocks(source) {

  const blocks = [];

  const blockStart =
    /[A-Za-z][A-Za-z0-9_]*\s*\{/g;

  let match;

  while (
    (match = blockStart.exec(source))
  ) {

    let depth = 0;
    let end = match.index;

    for (
      ;
      end < source.length;
      end += 1
    ) {

      if (source[end] === '{') {
        depth += 1;
      }

      if (source[end] === '}') {

        depth -= 1;

        if (depth === 0) {
          break;
        }
      }
    }

    if (depth === 0) {

      const hasSemicolon =
        source[end + 1] === ';';

      const block =
        source
          .slice(
            match.index,
            end + (
              hasSemicolon
                ? 2
                : 1
            )
          )
          .trim();

      if (block) {
        blocks.push(block);
      }

      blockStart.lastIndex =
        end + 1;
    }
  }

  return blocks;
}


/* =========================================================
   Fisher-Yates Shuffle
========================================================= */

function shuffle(array) {

  const result = [...array];

  for (
    let i = result.length - 1;
    i > 0;
    i -= 1
  ) {

    const j =
      Math.floor(
        Math.random() * (i + 1)
      );

    [
      result[i],
      result[j]
    ] = [
      result[j],
      result[i]
    ];
  }

  return result;
}


/* =========================================================
   背景程式碼位置
   ★ 桌機固定 3 個位置；手機固定 1 個置中位置
========================================================= */

function getBackgroundPositions() {

  const isMobile = window.matchMedia('(max-width: 700px)').matches;

  if (isMobile) {
    return [{ left: 50, top: 50 }];
  }

  return [
    {
      left: 3,
      top: 50
    },
    {
      left: 35.5,
      top: 50
    },
    {
      left: 68,
      top: 50
    }
  ];
}


/* =========================================================
   選擇程式碼
   避免同一區塊連續出現相同內容
========================================================= */

function chooseCodeBlock(previousCodeIndex) {

  if (!codeBlocks.length) {

    return {
      code: '',
      index: -1
    };
  }


  if (codeBlocks.length === 1) {

    return {
      code: codeBlocks[0],
      index: 0
    };
  }


  let nextIndex;

  do {

    nextIndex =
      Math.floor(
        Math.random() *
        codeBlocks.length
      );

  } while (
    nextIndex === previousCodeIndex
  );


  return {
    code: codeBlocks[nextIndex],
    index: nextIndex
  };
}


/* =========================================================
   單一背景區塊動畫
   ★ 每一塊完全獨立
========================================================= */

function animateBackgroundCode(block) {

  if (
    !block ||
    !block.isConnected
  ) {
    return;
  }


  const backgroundCode =
    block.querySelector('code');

  const backgroundCodeCursor =
    block.querySelector(
      '.background-code-cursor'
    );


  if (
    !backgroundCode ||
    !backgroundCodeCursor
  ) {
    return;
  }


  /* -----------------------------------------
     取得上一次程式碼
  ----------------------------------------- */

  const previousCodeIndex =
    Number(
      block.dataset.previousCodeIndex
    );


  /* -----------------------------------------
     選擇新程式碼
  ----------------------------------------- */

  const selection =
    chooseCodeBlock(
      previousCodeIndex
    );


  const selectedCode =
    selection.code;


  block.dataset.previousCodeIndex =
    selection.index;


  let character = 0;


  /* -----------------------------------------
     清空
  ----------------------------------------- */

  backgroundCode.textContent = '';

  backgroundCodeCursor.classList.remove(
    'waiting'
  );


  /* =====================================================
     打字
  ===================================================== */

  function typeCharacter() {

    if (
      !block.isConnected
    ) {
      return;
    }


    backgroundCode.textContent =
      selectedCode.slice(
        0,
        character + 1
      );


    character += 1;


    /* -----------------------------------------
       尚未打完
    ----------------------------------------- */

    if (
      character <
      selectedCode.length
    ) {

      setTimeout(
        typeCharacter,
        9
      );

      return;
    }


    /* -----------------------------------------
       打完
       底線開始閃爍
    ----------------------------------------- */

    backgroundCodeCursor.classList.add(
      'waiting'
    );


    /* -----------------------------------------
       閃爍 3 秒
    ----------------------------------------- */

    setTimeout(
      deleteCharacters,
      3000
    );
  }


  /* =====================================================
     快速刪除
===================================================== */

  function deleteCharacters() {

    if (
      !block.isConnected
    ) {
      return;
    }


    backgroundCodeCursor.classList.remove(
      'waiting'
    );


    character =
      selectedCode.length;


    function removeCharacter() {

      if (
        !block.isConnected
      ) {
        return;
      }


      character -= 1;


      backgroundCode.textContent =
        selectedCode.slice(
          0,
          character
        );


      /* -----------------------------------------
         繼續刪除
      ----------------------------------------- */

      if (
        character > 0
      ) {

        setTimeout(
          removeCharacter,
          2
        );

        return;
      }


      /* -----------------------------------------
         完全刪除
         300ms 後換新內容
      ----------------------------------------- */

      setTimeout(
        () => {

          if (
            block.isConnected
          ) {

            animateBackgroundCode(
              block
            );
          }

        },
        300
      );
    }


    removeCharacter();
  }


  /* -----------------------------------------
     開始
  ----------------------------------------- */

  typeCharacter();
}


/* =========================================================
   建立背景程式碼
   ★ 一定建立 3 塊
========================================================= */

function createBackgroundCodeBlocks() {

  if (
    !backgroundCodeLayer
  ) {
    return;
  }


  /* -----------------------------------------
     清除舊計時器
  ----------------------------------------- */

  backgroundTimers.forEach(
    timer => clearTimeout(timer)
  );

  backgroundTimers = [];


  /* -----------------------------------------
     清除舊區塊
  ----------------------------------------- */

  backgroundCodeLayer.innerHTML = '';


  /* -----------------------------------------
     依螢幕尺寸取得背景位置
  ----------------------------------------- */

  const positions =
    getBackgroundPositions();


  /* =====================================================
     ★ 桌機建立 3 個、手機建立 1 個
  ===================================================== */

  const blockCount = positions.length;


  /* =====================================================
     建立背景區塊
  ===================================================== */

  for (
    let index = 0;
    index < blockCount;
    index += 1
  ) {

    const position =
      positions[index];


    const block =
      document.createElement('pre');


    block.className =
      'background-code';


    block.style.left =
      `${position.left}%`;


    block.style.top =
      `${position.top}%`;


    /* -----------------------------------------
       每個區塊自己的程式碼記錄
    ----------------------------------------- */

    block.dataset.previousCodeIndex =
      '-1';


    block.innerHTML = `
      <code></code>
      <span class="background-code-cursor">_</span>
    `;


    backgroundCodeLayer.appendChild(
      block
    );


    /* =================================================
       ★ 各區塊分開啟動
    ================================================= */

    const startDelay =
      350 +
      index * 1300 +
      Math.floor(
        Math.random() * 500
      );


    const timer =
      setTimeout(
        () => {

          animateBackgroundCode(
            block
          );

        },
        startDelay
      );


    backgroundTimers.push(
      timer
    );
  }
}


/* =========================================================
   載入 background-code.txt
========================================================= */

function loadBackgroundCode() {

  fetch(
    'background-code.txt'
  )

    .then(response => {

      if (!response.ok) {

        throw new Error(
          'Unable to load background code'
        );
      }

      return response.text();
    })


    .then(source => {

      codeBlocks =
        extractCodeBlocks(
          source
        );


      /* -----------------------------------------
         如果沒有找到程式碼
      ----------------------------------------- */

      if (
        !codeBlocks.length
      ) {

        codeBlocks = [
          `Code {
    // background animation
};`
        ];
      }


      createBackgroundCodeBlocks();
    })


    .catch(() => {

      /* -----------------------------------------
         Fallback
      ----------------------------------------- */

      codeBlocks = [
        `Code {
    // 請使用本機伺服器預覽此背景動畫
};`
      ];


      createBackgroundCodeBlocks();
    });
}


/* =========================================================
   啟動
========================================================= */

loadBackgroundCode();


/* =========================================================
   Resize
========================================================= */

window.addEventListener(
  'resize',
  () => {

    clearTimeout(
      resizeTimer
    );


    resizeTimer =
      setTimeout(
        () => {

          if (
            codeBlocks.length
          ) {

            createBackgroundCodeBlocks();
          }

        },
        250
      );
  }
);


/* =========================================================
   NAVIGATION
========================================================= */

function setActive(label) {

  document
    .querySelectorAll('nav a')
    .forEach(link => {

      link.classList.toggle(
        'active',
        link.textContent.trim() === label
      );

    });
}


/* =========================================================
   HOME
========================================================= */

function showHome() {

  if (about) {

    about.classList.remove(
      'visible'
    );

    about.setAttribute(
      'aria-hidden',
      'true'
    );
  }


  if (blog) {

    blog.classList.remove(
      'visible'
    );

    blog.setAttribute(
      'aria-hidden',
      'true'
    );
  }


  if (homeSection) {
    homeSection.style.display = '';
  }


  if (intro) {
    intro.style.display = '';
  }


  setActive('首頁');


  window.scrollTo({
    top: 0,
    behavior: 'auto'
  });
}


/* =========================================================
   ABOUT
========================================================= */

function showAbout() {

  if (homeSection) {
    homeSection.style.display = 'none';
  }


  if (intro) {
    intro.style.display = 'none';
  }


  if (blog) {

    blog.classList.remove(
      'visible'
    );

    blog.setAttribute(
      'aria-hidden',
      'true'
    );
  }


  if (about) {

    about.classList.add(
      'visible'
    );

    about.setAttribute(
      'aria-hidden',
      'false'
    );
  }


  setActive('關於');


  window.scrollTo({
    top: 0,
    behavior: 'auto'
  });
}


/* =========================================================
   BLOG
========================================================= */

function formatPostDate(timestamp) {

  if (!timestamp) {
    return '';
  }


  return new Intl.DateTimeFormat(
    'zh-TW',
    { year: 'numeric', month: 'short', day: 'numeric' }
  ).format(new Date(timestamp));
}


function createPostCard(post) {

  const article = document.createElement('article');
  const label = document.createElement('span');
  const title = document.createElement('h3');
  const meta = document.createElement('p');
  const link = document.createElement('a');

  article.className = 'post-card';
  label.className = 'post-label';
  label.textContent = 'HACKMD';
  title.textContent = post.title || '未命名文章';
  meta.className = 'post-meta';
  meta.textContent = formatPostDate(post.lastChangedAt || post.createdAt);
  link.className = 'post-link';
  link.href = post.publishLink;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = '前往 HackMD ↗';

  article.append(label, title, meta, link);

  return article;
}


async function loadHackmdPosts() {

  if (!hackmdPosts || hasLoadedHackmdPosts) {
    return;
  }


  hasLoadedHackmdPosts = true;

  try {

    const response = await fetch('hackmd-posts.json', { cache: 'no-cache' });

    if (!response.ok) {
      throw new Error('HackMD articles could not be loaded.');
    }


    const posts = await response.json();

    hackmdPosts.replaceChildren();

    if (!posts.length) {
      const status = document.createElement('p');
      status.className = 'posts-status';
      status.textContent = '目前沒有公開文章。';
      hackmdPosts.append(status);
      return;
    }


    posts.forEach(post => hackmdPosts.append(createPostCard(post)));

  } catch (error) {

    console.error(error);
    hackmdPosts.innerHTML = '<p class="posts-status">文章目前無法載入，請稍後再試。</p>';

  } finally {

    hackmdPosts.setAttribute('aria-busy', 'false');
  }
}

function showBlog() {

  if (homeSection) {
    homeSection.style.display = 'none';
  }


  if (intro) {
    intro.style.display = 'none';
  }


  if (about) {

    about.classList.remove(
      'visible'
    );

    about.setAttribute(
      'aria-hidden',
      'true'
    );
  }


  if (blog) {

    blog.classList.add(
      'visible'
    );

    blog.setAttribute(
      'aria-hidden',
      'false'
    );
  }


  setActive('blog');


  loadHackmdPosts();


  window.scrollTo({
    top: 0,
    behavior: 'auto'
  });
}


/* =========================================================
   HOME NAV
========================================================= */

document
  .querySelectorAll('.nav-home')
  .forEach(link => {

    link.addEventListener(
      'click',
      event => {

        event.preventDefault();

        showHome();
      }
    );

  });


/* =========================================================
   ABOUT NAV
========================================================= */

document
  .querySelectorAll('.nav-about')
  .forEach(link => {

    link.addEventListener(
      'click',
      event => {

        event.preventDefault();

        showAbout();
      }
    );

  });


/* =========================================================
   BLOG NAV
========================================================= */

const blogLink =
  document.querySelector(
    'nav a[href="#blog"]'
  );


if (blogLink) {

  blogLink.addEventListener(
    'click',
    event => {

      event.preventDefault();

      showBlog();
    }
  );
}


/* =========================================================
   HEADER SCROLL
========================================================= */

window.addEventListener(
  'scroll',
  () => {

    if (!header) {
      return;
    }


    header.classList.toggle(
      'scrolled',
      window.scrollY > 30
    );
  }
);
