var shufflerAudio = {};
var nextClick;

$(document).ready(function() {

  var sa = shufflerAudio;

  var loadedClicksAmount = 8;
  sa.clickPosition = 0;

  sa.clicks = [];
  sa.leverPull = new Audio('snd/leverpull.wav');
  sa.finishJingle = new Audio('snd/finish.wav');

  // cheating for repeated playback
  for (var i = 0; i < (loadedClicksAmount); i++) {
    sa.clicks[i] = new Audio('snd/click.wav');
  }

  sa.maxInterval = 650;
  sa.currentInterval = 650;
  sa.minInterval = 50;
  sa.mustStop = false;

  sa.startAccelerating = function() {
    sa.currentInterval = sa.maxInterval;

    nextClick = setTimeout( function() {
      sa.nextAcceleration();
    }, sa.currentInterval)

    sa.playClick();
  }

  sa.startDecelerating = function() {
    clearTimeout(nextClick);

    nextClick = setTimeout( function() {
      shufflerAudio.nextDeceleration();
    }, sa.currentInterval)

    sa.playClick();
  }

  sa.nextAcceleration = function() {
    clearTimeout(nextClick);

    sa.currentInterval -= (sa.currentInterval - sa.minInterval) / 3;
    if (sa.currentInterval <= sa.minInterval) {
      sa.currentInterval = sa.minInterval
    }

    console.log(sa.currentInterval);

    nextClick = setTimeout( function() {
      shufflerAudio.nextAcceleration();
    }, shufflerAudio.currentInterval)

    sa.playClick();
  }

   sa.nextDeceleration = function() {
    clearTimeout(nextClick);

    sa.currentInterval += (sa.currentInterval - sa.minInterval) / 3;

    if (sa.currentInterval >= sa.maxInterval) {
      sa.currentInterval = sa.maxInterval;
    }

    nextClick = setTimeout( function() {
      shufflerAudio.nextDeceleration();
    }, shufflerAudio.currentInterval);

    sa.playClick();
  }

  sa.playClick = function () {
    sa.clicks[sa.clickPosition].currentTime = 0;
    sa.clicks[sa.clickPosition].volume = sa.currentInterval / (sa.maxInterval * 2) + 0.3;
    sa.clicks[sa.clickPosition].play();
    sa.clickPosition = (sa.clickPosition + 1) % 4;

    if(sa.mustStop) {
      clearTimeout(nextClick);
      sa.mustStop = false;
      return;
    }
  }

  sa.cutAll = function(){
    sa.mustStop = true;
  }
});
