
var mainWidth = parseInt($("#main").width());
var mainHeight = parseInt($("#main").height());
var step = 2;
var lives = 5;
var minutes = 0, seconds = 0, scoreCounter = 0;
var moveInterval, moveBullet, start, gameTimer, name;

$(document).ready(function () {
    $("#start").click(function (event) {
        event.preventDefault();
        $('#overlay').fadeIn(400,
            function () {
                $('#modalStart')
                    .css('display', 'block')
                    .animate({ opacity: 1 }, 200);
                clearInterval(moveInterval);
                clearInterval(gameTimer);
                $("#name").focus();

                $('#acceptToPlay').css('pointer-events', 'none');
            });

        $("#name").keyup(function () {
            if ($("#name").val() != "")
                $('#acceptToPlay').css('pointer-events', 'auto');
            else $('#acceptToPlay').css('pointer-events', 'none');
        })

        $('#acceptToPlay').click(function () {
            $('#modalStart')
                .animate({ opacity: 0 }, 200,
                    function () {

                        name = $("#name").val();
                        if (name != "") {
                            start = setInterval(enemiesShips, 2000);
                            gameTimer = setInterval(timer, 1000);

                            $("#start").hide();

                            $("#statistic").css('display', 'block');
                            $("#ship").css('display', 'block');
                        }

                        $(this).css('display', 'none');
                        $('#overlay').fadeOut(400);
                    }
                );
        });

        $("#modal_close").click(function () {
            $('#modalStart')
                .animate({ opacity: 0 }, 200,
                    function () {
                        $(this).css('display', 'none');
                        $('#overlay').fadeOut(400);
                        stop();
                        location.reload();
                    }
                );
        })
    })
});

$(document).keydown(function (e) {
    var posShip = $("#ship").position();
    switch (e.which) {
        case 37:
            if (posShip.left <= 0)
                break;
            $("#ship").css('left', $("#ship").offset().left - 30);
            $("#button").hide();
            break;
        case 38:
            if (posShip.top <= $("#statistic").height())
                break;
            $("#ship").css('top', $("#ship").offset().top - 30);
            break;
        case 39:
            if (posShip.left + parseInt($("#ship").width()) >= mainWidth - 15)
                break;
            $("#ship").css('left', $("#ship").offset().left + 30);
            break;
        case 40:
            if (posShip.top + parseInt($("#ship").height()) >= mainHeight - 25)
                break;
            $("#ship").css('top', $("#ship").offset().top + 30);
            break;
            //Выстрел и движение снаряда
        case 32:
            var bullet = document.createElement('div');

            bullet.className = "bullet";
            $(bullet).css("left", posShip.left + (parseInt($("#ship").width() / 3)));
            $(bullet).css("top", posShip.top);

            $("#main").append(bullet);

            function moveBullet() {
                $(bullet).offset(function (i, val) {
                    if (val.top < 0)
                        $(bullet).remove();
                    getBulletCoord(bullet, document.getElementsByClassName("enemyShip"));
                    return { top: val.top - 5 };
                });
            }
            moveBullet = setInterval(moveBullet, 5);
            break;
    }
});

// Отображает таймер на экране
function timer() {
    if (seconds < 10)
        $("#timer").html("Time: " + minutes + ":" + "0" + seconds);

    else $("#timer").html("Time: " + minutes + ":" + seconds);

    if (seconds == 60) {
        seconds = 0;
        $("#timer").html("Time: " + minutes + ":" + "0" + seconds);
        minutes += 1;
    }
    seconds += 1;
}
//Создание и запуск вражеских кораблей
function enemiesShips() {
    var enemy = document.createElement('div');

    enemy.className = "enemyShip";

    $(enemy).css("top", -60);
    $(enemy).css("left", randomEnemiesPosition());

    $("#main").append(enemy);

    moveInterval = setInterval(function () {
        $(enemy).offset(function (i, val) {
            if (val.top > mainHeight - 75) {
                enemy.remove();
                $("#lives").html("Lives: " + --lives);
                isOver();
            }
            getEnemyCoord(document.getElementsByClassName("enemyShip"));

            return { top: val.top + step };
        });
    }, 10);
}

//Случайная позиция вражеского корабля
function randomEnemiesPosition() {
    return Math.floor(Math.random() * ((mainWidth - 100) - 10)) + 10;
}
//Отслеживает коордмнаты снаряда и столкновения
function getBulletCoord(bullet, enemies) {
    if (enemies.length != 0) {
        var allEnemyCoords = [];
        var bp = bullet.getBoundingClientRect();
        var ep;

        for (var i = 0; i < enemies.length; i++)
            allEnemyCoords.push(enemies.item(i).getBoundingClientRect());

        for (var i = 0; i < enemies.length; i++) {
            ep = enemies[i].getBoundingClientRect();

            if (bp.left != 0 && bp.top <= ep.bottom - 20 && bp.left >= ep.left && bp.right <= ep.right) {
                bullet.remove();
                $(enemies[i]).remove();
                if (enemies.length == 0)
                    clearInterval(moveInterval);
                allEnemyCoords.pop(i);
                $("#score").html("Score: " + ++scoreCounter);
            }
        }
    }
}
//Передвижение вражеских кораблей
function getEnemyCoord(enemies) {
    if (enemies.length != 0) {
        var allEnemyCoords = [];
        var sp = $("#ship").get(0).getBoundingClientRect();
        var ep;

        for (var i = 0; i < enemies.length; i++)
            allEnemyCoords.push(enemies.item(i).getBoundingClientRect());

        for (var i = 0; i < enemies.length; i++) {
            ep = enemies[i].getBoundingClientRect();

            if (sp.left != 0 && sp.top <= ep.bottom - 20 && sp.right >= ep.left && sp.left <= ep.right && sp.bottom > ep.top) {
                $("#lives").html("Lives: " + --lives);
                isOver();
                for (var i = 0; i < enemies.length;) {
                    enemies[0].remove();
                }

                $("#ship").css("left", mainWidth * 0.45);
                $("#ship").css("top", mainHeight * 0.85);
            }
        }
    }
}
//Проверка на количество жизней и остановка игры
function isOver() {
    if (lives == 0) {
        $("#resTable").empty();

        setCookie(name, scoreCounter, 10);

        clearTimeout(moveInterval);
        clearTimeout(start);

        clearInterval(start);
        clearInterval(gameTimer);
        clearInterval(moveInterval);
        clearInterval(moveBullet);

        $('#overlay').fadeIn(400,
            function () {
                $('#modalEnd')
                    .css('display', 'block')
                    .animate({ opacity: 1 }, 200);
            });

        $("#ansY").click(function () {
            $("#score").html("Score: 0");
            $("#timer").html("Time: 0:00");
            $("#lives").html("Lives: 5");

            lives = 5;
            minutes = 0;
            seconds = 0;
            score = 0;

            for (var i = 0; i < $(".enemyShip").length;) {
                $(".enemyShip").remove();
            }

            $('#modalEnd')
                .animate({ opacity: 0 }, 200,
                    function () {
                        $(this).css('display', 'none');
                        $('#overlay').fadeOut(400);
                    }
                );
            $("#ship").css("left", mainWidth * 0.45);
            $("#ship").css("top", mainHeight * 0.85);

            start = setInterval(enemiesShips, 2000);
            gameTimer = setInterval(timer, 1000);
        });

        $("#ansN").click(function () {
            location.reload();
        });

        $("#best").click(function () {
            $("#resTable").empty();
            getCookie();
            $('#modalEnd')
                .animate({ opacity: 0 }, 200,
                    function () {
                        $(this).css('display', 'none');
                        $('#overlay').fadeOut(400);
                    }
                );

            $('#overlay').fadeIn(400,
           function () {
               $('#bestResults')
                   .css('display', 'block')
                   .animate({ opacity: 1 }, 200);
           });

            $("#cancel").click(function () {
                $("#resTable").empty();
                $('#bestResults')
                 .animate({ opacity: 0 }, 200,
                     function () {
                         $(this).css('display', 'none');
                         $('#overlay').fadeOut(400);
                     }
                 );

                $('#overlay').fadeIn(400,
            function () {
                $('#modalEnd')
                    .css('display', 'block')
                    .animate({ opacity: 1 }, 200);
            });
            })
        })
    }
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function stop() {
    clearInterval(start);
    clearInterval(gameTimer);
    clearInterval(moveInterval);
    clearInterval(moveBullet);
}

function getCookie() {
    var cookieStr = document.cookie, cookieArray = cookieStr.split(';'), i, j;

    for (j = 0; j < cookieArray.length; j++) cookieArray[j] = cookieArray[j].replace(/(\s*)\B(\s*)/g, '');

    var cookieNameArray = new Array({ name: '', value: new Array() });

    for (i = 0; i < cookieArray.length; i++) {
        var keyValue = cookieArray[i].split('='),
        cookieVal = unescape(keyValue[1]).split(';');
        for (j = 0; j < cookieVal.length; j++) cookieVal[j] = cookieVal[j].replace(/(\s*)[\B*](\s*)/g, '');
        keyValue[0] = keyValue[0].replace(/(\s*)[\B]*(\s*)/g, '');

        cookieNameArray[i] = {
            name: keyValue[0],
            value: cookieVal
        };
    };
    var sortedCookies = [];

    cookieNameArray.sort(function (a, b) {
        if (parseInt(a.value) > parseInt(b.value))
            return -1;
        if (parseInt(a.value) < parseInt(b.value))
            return 1;
        return 0;
    });

    for (var i = 0; i < 10; i++) {
        $("#resTable").append("<li>" + cookieNameArray[i].name + "  ---  " + cookieNameArray[i].value + "</li>")
    }
}

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//(function runInterval() {
//    interval = Math.random() * 1000 * 5 + 1000;
//    setTimeout(function () {
//        move();
//        $("#rand").html(interval);
//        runInterval();
//    }, interval);
//})()
