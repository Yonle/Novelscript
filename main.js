const dialog = document.getElementById("dialog");
const menu = document.getElementById("menu");
const img = document.getElementsByTagName("img")[0];
const valid_cmd = ["w", "fw", "br", "cl", "s", "set_ns", "set_tps", "load", "l_img", "h_img", "m_play", "m_stop", "set_bg", "set_color", "title", "s_play", "set_fi", "set_fo", "add_menu", "c_url", "refresh"];
const m_aud = new Audio();
const s_aud = new Audio();

let ns = 0;
let tps = 40;
let fi = 70;
let fo = 70;

let vt = "";

function ht() {
  document.getElementById("tip").style.visibility = "hidden";
}

function st() {
  document.getElementById("tip").style.visibility = "visible";
}

function fw(t) {
  dialog.style.visibility = "visible";
  vt += t;
  dialog.value = vt;
  dialog.scrollTo(0, dialog.scrollHeight);
  br();
  st();
  
  return new Promise(r => {
    if (ns) setTimeout(r, ns);
    else dialog.onclick = r;
  });
}

function w(t) {
  t = t.split("");
  dialog.style.visibility = "visible";
  ht();
  return new Promise(r => {
    let i = setInterval(_ => {
      const w = t.shift();
      if (!w) {
        br();
        st();
        if (ns) setTimeout(r, ns);
        else dialog.onclick = r;
        dialog.value = vt;
        return clearInterval(i);
      }
      vt += w;
      dialog.value = vt + "|";
      dialog.scrollTo(0, dialog.scrollHeight);
    }, tps)
  });
}

function br() {
  vt += "\n";
}

function cl() {
  vt = "";
  dialog.value = "";
  dialog.style.visibility = "hidden";
  ht();
}

function s(ms) {
  return new Promise(r => setTimeout(r, ms * 1000));
}

function set_ns(t) {
  ns = t * 1000;
}

function set_tps(s) {
  tps = s;
}

async function l_img(url) {
  if (img.style.opacity >= 1) await h_img(true);
  let op = 0
  img.src = url;
  img.style.opacity = 0;
  img.style.visibility = "visible";

  let i = setInterval(_ => {
    if (op >= 1) return clearInterval(i);
    op += 0.1
    img.style.opacity = op;
  }, fi);
}

function h_img(wait) {
  return new Promise(r => {
    let op = 1
    let i = setInterval(_ => {
      if (op <= 0) {
        img.style.visibility = "hidden";
        if (wait) r();
        img.src = "";
        return clearInterval(i);
      }
      op -= 0.1
      img.style.opacity = op;
    }, fo);
    
    if (!wait) r();
  })
}

function m_play(url, loop = true) {
  m_aud.loop = loop;
  m_aud.src = url;
  m_aud.seek = 0;
  m_aud.play();
}

function m_stop() {
  m_aud.pause();
}

function s_play(url) {
  s_aud.src = url;
  s_aud.seek = 0;
  s_aud.play();
}

function set_bg(bg) {
  dialog.style.background = bg;
  document.body.style.background = bg;
}

function set_color(col) {
  dialog.style.color = col;
  document.body.style.color = col;
}

function set_fi (i) {
  fi = i;
}

function set_fo (i) {
  fo = i;
}

function title(title) {
  document.title = title;
}

function add_menu(ns_u, t) {
  let a = document.createElement("a");
  a.setAttribute("onclick", `load('${ns_u}')`);
  a.href = location.hash || "#";
  a.innerText = t;
  menu.appendChild(a);
  menu.innerHTML += "<br>";
  menu.style.visibility = "visible";
}

function c_url(s_url) {
  location.hash = "#story=" + s_url;
}

function refresh() {
  location.reload();
}

async function panic(err) {
  console.error(err);
  set_ns(0.1);
  set_tps(30);
  dialog.style.position = "absolute";
  dialog.style.top = "0";
  dialog.style.left = "0";
  dialog.style.width = "100vw";
  dialog.style.height = "100vh";
  dialog.style.color = "red";
  dialog.style.background = "black";
  dialog.style.padding = "5px";
  await w("An error has occured.");
  await fw(err.toString());
  br();

  await w("End of error. Not doing anything.");
}

async function runstory(story) {
  document.getElementById("main").style.visibility = "hidden";
  document.getElementsByTagName("details")[0].hidden = true;
  let code = story.split("\n")
    .map(i => {
      if (!i.length || i.startsWith(";")) return "";
      const a = i.split(" ");
      if (!valid_cmd.includes(a[0])) return "";
      return `await ${a[0]}(${a.slice(1).join(" ")});`;
    }).join("\n");
  console.log(story);
  console.log(code);
  try {
    eval("(async () => { " + code + "})();");
  } catch (err) {
    panic(err);
  }
}

async function load(p) {
  ht();
  document.getElementById("main").style.visibility = "hidden";
  menu.innerHTML = "";
  menu.style.visibility = "hidden";

  try {
    const story = await fetch(p)
      .catch(panic)
      .then(res => res.text());

    runstory(story);
  } catch (err) {
    panic(err);
  }
}

if (location.hash) {
  const query = new URLSearchParams(location.hash.slice(1));
  const storypath = query.get("story");

  load(storypath);
}

function play() {
  const ustory = document.getElementById("ustory").value;
  const url = document.getElementById("loadinput").value;
  if (!url.length && !ustory.length) return alert("A story please.");
  if (!url.length && ustory.length) return runstory(ustory);
  location.hash = "#story=" + url;
  load(url);
}
