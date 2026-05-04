"use strict";

var moves = ["rock", "paper", "scissors"];

var urls = {
  rock: "https://zachtsch.github.io/rpsimages/rock.png",
  paper: "https://zachtsch.github.io/rpsimages/paper.png",
  scissors: "https://zachtsch.github.io/rpsimages/scissors.png"
};

var wins = 0;
var losses = 0;
var draws = 0;

function getComputerMove() {
  return moves[Math.floor(Math.random() * moves.length)];
}

function determineWinner(player, computer) {
  if (player === computer) return "tie";

  if (
    (player === "rock" && computer === "scissors") ||
    (player === "paper" && computer === "rock") ||
    (player === "scissors" && computer === "paper")
  ) return "win";

  return "lose";
}

function updateStats(result) {
  if (result === "win") wins++;
  else if (result === "lose") losses++;
  else draws++;

  var total = wins + losses + draws;
  var percent = total === 0 ? "N/A" : ((wins / total) * 100).toFixed(1) + "%";

  document.getElementById("wins").textContent = wins.toString();
  document.getElementById("losses").textContent = losses.toString();
  document.getElementById("draws").textContent = draws.toString();
  document.getElementById("winPercent").textContent = percent;
}

function startGame(playerMove) {
  var buttons = document.querySelectorAll("button");
  buttons.forEach(function (b) {
    b.disabled = true;
  });

  var countdown = document.getElementById("countdown");
  var count = 3;

  countdown.textContent = "Rock...";

  var interval = setInterval(function () {
    count--;

    if (count === 2) countdown.textContent = "Paper...";
    else if (count === 1) countdown.textContent = "Scissors...";
    else if (count === 0) countdown.textContent = "SHOOT!";
    else {
      clearInterval(interval);
      playRound(playerMove);
      buttons.forEach(function (b) {
        b.disabled = false;
      });
    }
  }, 500);
}

function playRound(playerMove) {
  var computerMove = getComputerMove();
  var result = determineWinner(playerMove, computerMove);

  var playerImg = document.getElementById("playerImg");
  var computerImg = document.getElementById("computerImg");
  var resultText = document.getElementById("result");

  // Reset animation
  playerImg.classList.remove("pop");
  computerImg.classList.remove("pop");
  void playerImg.offsetWidth;
  void computerImg.offsetWidth;

  // Set images
  playerImg.src = urls[playerMove];
  computerImg.src = urls[computerMove];

  // Trigger animation
  playerImg.classList.add("pop");
  computerImg.classList.add("pop");

  resultText.className = "";

  if (result === "win") {
    resultText.textContent = "You win!";
    resultText.classList.add("win");
  } else if (result === "lose") {
    resultText.textContent = "Computer wins!";
    resultText.classList.add("lose");
  } else {
    resultText.textContent = "It's a tie!";
    resultText.classList.add("tie");
  }

  updateStats(result);
}

// Make callable from HTML
window.startGame = startGame;
