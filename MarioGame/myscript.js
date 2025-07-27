const bgWidth = 1750;
const moveStep = 50;
const bgStep = 20;
let coin = 0;
let life = 3;
let gameEnded = false;
let isFalling = false;

let jumpCount = 0;         // 현재 연속 점프 횟수
const maxJump = 3;         // 최대 3단 점프
let gameStarted = false;   // 시작화면 컨트롤용

let playerName = '';
let clearTimeList = [];
let startTime = 0;

function startGame() {
    // 게임 변수 초기화 및 시작!
    coin = 0;
    life = 3;
    gameEnded = false;
    jumpCount = 0;
    // 타이머 시작
    startTime = Date.now();
    // 점수판 등 리셋
    $("#coinScore").text(0);
    $("#life").text(3);
    $("#gameOver").hide();
    $("#coinClear").hide();

    // 마리오, 아이템, 적 위치 초기화
    $("#mario").css({ left: "80px", top: "350px" });
    $("#rocket").hide();
    $("#mushroom").hide();
    $("#coin").hide();

    // 코인/버섯/로켓 소환
    spawnCoin();
    spawnMushroom();
    spawnrocket();

    // 조작키 등록 (게임 시작 후에만 동작)
    $(document).off("keydown.game").on("keydown.game", function(e) {
        if (gameEnded) return;
        if (e.which === 32) jump();
        else if (e.which === 37) moveMario(-1, 0);
        else if (e.which === 39) moveMario(1, 0);
        else if (e.which === 40) moveMario(0, 1);
    });

    // 기존 타이머 중복 제거
    if (window.moveEnemiesTimer) clearInterval(window.moveEnemiesTimer);
    if (window.checkHitTimer) clearInterval(window.checkHitTimer);
    if (window.spawnCoinTimer) clearInterval(window.spawnCoinTimer);
    if (window.spawnMushroomTimer) clearInterval(window.spawnMushroomTimer);
    if (window.spawnRocketTimer) clearInterval(window.spawnRocketTimer);

    window.moveEnemiesTimer = setInterval(moveEnemiesAndItems, 30);
    window.checkHitTimer = setInterval(checkHit, 40);
    window.spawnCoinTimer = setInterval(spawnCoin, randBetween(2000, 3500));
    window.spawnMushroomTimer = setInterval(spawnMushroom, randBetween(2100, 3900));
    window.spawnRocketTimer = setInterval(spawnrocket, 30000);
}

$(function() {
    $("#startScreen").show();

    function startGameIfReady() {
        let nickname = $("#nicknameInput").val().trim();
        if (nickname.length === 0) {
            alert("닉네임을 입력하세요.");
            return false;
        }
        playerName = nickname;  // 닉네임 저장
        gameStarted = true;
        $("#startScreen").fadeOut(200);
        startGame();
        return true;
    }

    // 스페이스 누를 때 닉네임 입력 후 시작
    $(document).on("keydown.start", function(e) {
        if (!gameStarted && e.which === 32) {
            startGameIfReady();
        }
    });

    // START 버튼 클릭 시 시작
    $("#startButton").on("click", function() {
        startGameIfReady();
    });

    // 클리어 화면 다시 시작 버튼 이벤트 (한 번만 바인딩)
    $("#restartButton").on("click", function() {
        $("#coinClear").hide();
        startGame();
        gameStarted = true;
    });

    // 게임오버 화면 다시 시작 버튼 이벤트 (한 번만 바인딩)
    $("#restartGameOver").on("click", function() {
        $("#gameOver").hide();
        startGame();
        gameStarted = true;
    });
});

// 점프: 3단 가능, 삼중 점프 때 앞구르기, 점프시 앞으로도 이동!
function jump() {
    if (jumpCount >= maxJump) return;
    jumpCount++;

    let mario = $("#mario");
    mario.stop();

    let jumpForward = 60;
    let left = parseInt(mario.css("left"));
    let newLeft = left + jumpForward;
    if (newLeft > bgWidth - 70) newLeft = bgWidth - 70;

    let jumpTop;
    if (jumpCount === 1)      jumpTop = 100;
    else if (jumpCount === 2) jumpTop = 60;
    else                      jumpTop = 20;

    let jumpSpeed = (jumpCount === 3) ? 110 : 170;
    let fallSpeed = (jumpCount === 3) ? 350 : 400;

    if (jumpCount === 3) mario.addClass("forward-roll");

    isFalling = false;
    mario.animate({ top: `${jumpTop}px`, left: `${newLeft}px` }, jumpSpeed, function() {
        isFalling = true;
        mario.animate({ top: '350px' }, fallSpeed, function() {
            isFalling = false;
            if (jumpCount === 3) mario.removeClass("forward-roll");
            if (parseInt(mario.css('top')) === 350) {
                jumpCount = 0;
            }
        });
    });
}

function moveMario(dirX, dirY) {
    var mario = $("#mario");
    var left = parseInt(mario.css("left"));
    var top = parseInt(mario.css("top"));
    var center = 900;
    var moveStep = 50;
    var moveStepY = 40;
    var maxTop = 430;

    if (dirX === 1) {
        mario.css("transform", "scaleX(1)");
        if (left < center) {
            mario.animate({ left: (left + moveStep) + 'px' }, 100);
        } else {
            moveBackground(-bgStep);
        }
    }
    else if (dirX === -1) {
        mario.css("transform", "scaleX(-1)");
        if (left > 0) {
            mario.animate({ left: (left - moveStep) + 'px' }, 100);
        } else {
            moveBackground(bgStep);
        }
    }

    if (dirY === 1) {
        if (top + moveStepY < maxTop) {
            mario.animate({ top: (top + moveStepY) + 'px' }, 80);
        }
    }
}

function moveBackground(delta) {
    $(".bgImg").each(function() {
        let left = Math.round(parseFloat($(this).css("left"))) + delta;
        if (left < -bgWidth) left += 2 * bgWidth;
        if (left >= bgWidth) left -= 2 * bgWidth;
        $(this).css("left", left + "px");
    });
    $(".enemy, .item").each(function() {
        let left = Math.round(parseFloat($(this).css("left"))) + delta;
        $(this).css("left", left + "px");
    });
}

$(window).resize(function() {
    bgWidth = window.innerWidth;
    $(".bgImg").css("width", bgWidth + "px");
    $("#bg2").css("left", bgWidth + "px");
});

function moveEnemiesAndItems() {
    if (gameEnded) return;
    let rocket = $("#rocket");
    if (rocket.is(":visible")) {
        let left = parseInt(rocket.css("left"));
        rocket.css("left", (left - 7) + "px");
        if (left < -60) rocket.hide();
    }
    let mushroom = $("#mushroom");
    if (mushroom.is(":visible")) {
        let left = parseInt(mushroom.css("left"));
        let dir = mushroom.data("dir") || 1;
        mushroom.css("left", (left + 2 * dir) + "px");
        if (left < 10 || left > (bgWidth-70)) mushroom.hide();
    }
}

function spawnCoin() {
    if (gameEnded) return;
    let coin = $("#coin");
    if (!coin.is(":visible")) {
        coin.css({
            left: randBetween(150, bgWidth-100) + "px",
            top: randBetween(120, 440) + "px"
        }).show();
    }
}

function spawnrocket() {
    if (gameEnded) return;
    let rocket = $("#rocket");
    if (!rocket.is(":visible")) {
        rocket.css({
            left: (bgWidth + 30) + "px",
            top: randBetween(300, 440) + "px"
        });
        rocket.show();
    }
}

function spawnMushroom() {
    if (gameEnded) return;
    let mushroom = $("#mushroom");
    if (!mushroom.is(":visible")) {
        let startLeft = randBetween(150, bgWidth-100);
        mushroom.css({
            left: startLeft + "px",
            top: randBetween(350, 450) + "px"
        });
        mushroom.data("dir", Math.random()>0.5?1:-1);
        mushroom.show();
    }
}

function checkHit() {
    if (gameEnded) return;
    let m = $("#mario").offset(), mw = $("#mario").width(), mh = $("#mario").height();
    let mushroom = $("#mushroom");
    if (mushroom.is(":visible") && rectsOverlapObj("#mario", "#mushroom")) {
        let mBottom = m.top + mh;
        let mush = mushroom.offset(), mushTop = mush.top, mhsh = mushroom.height();
        if (
            isFalling &&
            mBottom > mushTop + 5 &&
            mBottom < mushTop + mhsh - 10 &&
            m.top + mh/2 < mushTop + mhsh/2
        ) {
            stompMushroom();
            isFalling = false;
            $("#mario").stop().animate({ top: '-=60px' }, 120).animate({ top: '350px' }, 200, function() {
                isFalling = false;
                jumpCount = 0;
            });
        } else {
            hit();
            mushroom.hide();
        }
    }
    let rocket = $("#rocket");
    if (rocket.is(":visible") && rectsOverlapObj("#mario", "#rocket")) {
        hit();
        rocket.hide();
    }
    let coinObj = $("#coin");
    if (coinObj.is(":visible") && rectsOverlapObj("#mario", "#coin")) {
        coin++;
        $("#coinScore").text(coin);
        coinObj.hide();

        if (coin >= 10 && !gameEnded) {
            gameEnded = true;
            finishGame();
        }
    }
}

function hit() {
    life--;
    $("#life").text(life);

    $("#mario").addClass("grayhit");
    $("#mario").animate({ top: '470px' }, 250, function() {
        setTimeout(() => {
            $("#mario").css({ left: '80px' });
            $("#mario").animate({ top: '350px' }, 300, function() {
                $("#mario").removeClass("grayhit");
                jumpCount = 0;
            });
        }, 200);
    });

    if (life <= 0) gameOver();
}

function stompMushroom() {
    $("#mushroom").addClass("grayhit");
    $("#mushroom").animate({ top: '600px', opacity: 0.2 }, 600, function() {
        $(this).hide().css({ top: '430px', opacity: 1 }).removeClass("grayhit");
    });
}

function gameOver() {
    gameEnded = true;
    $("#gameOver").fadeIn();
}

// 게임 재시작 함수 (게임 초기화 + 화면 전환)
function restartGame() {
    $("#gameOver").hide();
    $("#coinClear").hide();
    $("#startScreen").show();  // 닉네임 입력창 다시 보이도록
    gameStarted = false;
}

$(function() {
    // 버튼 클릭 시 게임 재시작
   $(document).on("click", "#restartGameOver", function() {
    restartGame();  // 위에서 수정한 함수 호출
});

    // 클리어 화면 다시 시작 버튼 이벤트 
    $("#restartButton").on("click", function() {
    $("#coinClear").hide();
    $("#startScreen").show();  // 닉네임 입력창 다시 보이도록
    gameStarted = false;
});

});

function rectsOverlapObj(id1, id2) {
    let o1 = $(id1).offset(), w1 = $(id1).width() * 0.7, h1 = $(id1).height() * 0.7;
    let o2 = $(id2).offset(), w2 = $(id2).width() * 0.7, h2 = $(id2).height() * 0.7;
    o1.left += w1*0.15; o1.top += h1*0.15; o2.left += w2*0.15; o2.top += h2*0.15;
    return !(o2.left > o1.left + w1 || o2.left + w2 < o1.left || o2.top > o1.top + h1 || o2.top + h2 < o1.top);
}

function randBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function finishGame() {
    let clearTime = ((Date.now() - startTime) / 1000).toFixed(2);
    clearTimeList.push({ name: playerName, time: clearTime });
    clearTimeList.sort((a, b) => a.time - b.time);

    $("#clearTime").text(`클리어 타임: ${clearTime}초`);

    let html = "<b>클리어 기록</b><br>";
    clearTimeList.forEach((rec, i) => {
        html += ` ${rec.name} - ${rec.time}초<br>`;
    });
    $("#clearTimeList").html(html);

    $("#coinClear").fadeIn();
}
