const grid = document.getElementById("grid");
const width = 10;
const height = 20;
const cells = [];

for (let i = 0; i < width * height; i++) {
  const cell = document.createElement("div");
  grid.appendChild(cell);
  cells.push(cell);
}

const teto_minoes = {
  I: [[[0,1],[1,1],[2,1],[3,1]], [[2,0],[2,1],[2,2],[2,3]], [[0,2],[1,2],[2,2],[3,2]], [[1,0],[1,1],[1,2],[1,3]]],
  J: [[[0,0],[0,1],[1,1],[2,1]], [[1,0],[1,1],[1,2],[2,0]], [[0,1],[1,1],[2,1],[2,2]], [[0,2],[1,0],[1,1],[1,2]]],
  L: [[[2,0],[0,1],[1,1],[2,1]], [[1,0],[1,1],[1,2],[2,2]], [[0,1],[1,1],[2,1],[0,2]], [[0,0],[1,0],[1,1],[1,2]]],
  O: [[[1,0],[2,0],[1,1],[2,1]]],
  S: [[[1,0],[2,0],[0,1],[1,1]], [[1,0],[1,1],[2,1],[2,2]], [[1,1],[2,1],[0,2],[1,2]], [[0,0],[0,1],[1,1],[1,2]]],
  T: [[[1,0],[0,1],[1,1],[2,1]], [[1,0],[1,1],[2,1],[1,2]], [[0,1],[1,1],[2,1],[1,2]], [[1,0],[0,1],[1,1],[1,2]]],
  Z: [[[0,0],[1,0],[1,1],[2,1]], [[2,0],[1,1],[2,1],[1,2]], [[0,1],[1,1],[1,2],[2,2]], [[1,0],[0,1],[1,1],[0,2]]]
};

const colors = { I: 'I', J: 'J', L: 'L', O: 'O', S: 'S', T: 'T', Z: 'Z' };

let current, position, rotation, gameInterval;

function mino_draw() {
  teto_minoes[current.type][rotation].forEach(([dx, dy]) => {
    const x = position.x + dx;
    const y = position.y + dy;
    if (y >= 0) cells[y * width + x].classList.add(colors[current.type]);
  });
}

function mino_undraw() {
  teto_minoes[current.type][rotation].forEach(([dx, dy]) => {
    const x = position.x + dx;
    const y = position.y + dy;
    if (y >= 0) cells[y * width + x].classList.remove(colors[current.type]);
  });
}

function valid_Move(dx, dy, rot) {
  return teto_minoes[current.type][rot].every(([x, y]) => {
    const nx = position.x + x + dx;
    const ny = position.y + y + dy;
    return nx >= 0 && nx < width && ny < height && (ny < 0 || !cells[ny * width + nx].classList.contains("taken"));
  });
}

function mino_move(dx, dy) {
  if (valid_Move(dx, dy, rotation)) {
    mino_undraw();
    position.x += dx;
    position.y += dy;
    mino_draw();
  } else if (dy === 1) {
    mino_freeze();
    mino_spawn();
  }
}

function mino_rotate() {
  const next = (rotation + 1) % 4;
  if (valid_Move(0, 0, next)) {
    mino_undraw();
    rotation = next;
    mino_draw();
  }
}

function mino_freeze() {
  teto_minoes[current.type][rotation].forEach(([dx, dy]) => {
    const x = position.x + dx;
    const y = position.y + dy;
    if (y >= 0) cells[y * width + x].classList.add("taken");
  });
  clear_Lines();
}

function clear_Lines() {
  for (let y = height - 1; y >= 0; y--) {
    if (Array.from({ length: width }, (_, x) => cells[y * width + x].classList.contains("taken")).every(Boolean)) {
      for (let x = 0; x < width; x++) cells[y * width + x].className = "";
      const removed = cells.splice(y * width, width);
      removed.forEach(c => c.remove());
      for (let i = 0; i < width; i++) {
        const cell = document.createElement("div");
        grid.prepend(cell);
        cells.unshift(cell);
      }
      y++;
    }
  }
}

function mino_spawn() {
  const types = Object.keys(teto_minoes);
  const type = types[Math.floor(Math.random() * types.length)];
  current = { type };
  position = { x: 3, y: 0 };
  rotation = 0;
  if (!valid_Move(0, 0, rotation)) {
    clearInterval(gameInterval);
    document.getElementById("game-over").style.display = "block";
  } else {
    mino_draw();
  }
}

function game_Loop() {
  mino_move(0, 1);
}

function reset_Game() {
  clearInterval(gameInterval);
  cells.forEach(cell => cell.className = "");
  document.getElementById("game-over").style.display = "none";
  mino_spawn();
  gameInterval = setInterval(game_Loop, 500);
}

document.getElementById("reset-button").addEventListener("click", reset_Game);

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") mino_move(-1, 0);
  else if (e.key === "ArrowRight") mino_move(1, 0);
  else if (e.key === "ArrowDown") mino_move(0, 1);
  else if (e.key === "ArrowUp") mino_rotate();
});

mino_spawn();
gameInterval = setInterval(game_Loop, 500);
