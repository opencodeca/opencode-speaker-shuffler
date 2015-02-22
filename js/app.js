var kInitNmbSpeakers = 5;
var kAvatarSize = {x: 61, y: 61};
var kCanvasSize = {x: kAvatarSize.x, y: 137};
var kSlotWidth = 95;

var gLoadedAvatars = 0;
var gSpunDownReels = 0;

var kMaxReelSpeed = 50;
var kReelSpeedDeltaUpDown = 0.1;

$(document).ready(function() {
    // most inappropriate image preloading!
    var img = new Image();
    img.src = 'img/machine-background-on.png';

    initSpeakerSelectionUI();
});

function initSpeakerSelectionUI() {
    initMoarLink();

    $('.speakers a.btn').click(function() {
        var speakers = [];

        $('.speakers input[type=text]').each(function(idx, el) {
            speakers.push({'twitter-email-url': $.trim($(el).val())});
        });
        $('.speakers input[type=checkbox]').each(function(idx, el) {
            speakers[idx].forcePosition = $(el).is(':checked');
        });

        // remove empties
        speakers = $(speakers).filter(function(idx) { return this['twitter-email-url'] !== ""; });
        // false alert
        if(speakers.length === 0)
            return;

        // do it!
        $(this).addClass('disabled');
        $(this).html('Un moment…');

        var speakerOrder = orderSpeakers(speakers);

        $.each(speakers, function(speakerIdx, speaker) {
            speaker.url = findImgUrl(speaker['twitter-email-url']);
        });

        preloadAvatars(speakers, function() {
            $('.speakers').remove();

            initSlotsUI(speakers, speakerOrder);
        });
    });

    $(".speakers").show();

    $('.progress .bar').css({'width': '25%'}).html("Préchargement…");
    $('.progress').addClass('progress-info').show();

    $.ajax({
        url: 'http://www.opencode.ca/api/editions/current',
        type: 'GET',
        dataType: 'json',
        success: loadSpeakers
    });
}

function loadSpeakers(data) {
    $('.progress .bar').css({'width': '100%'});

    $.each(data.talks, function(idx, talk) {
        $('.speakers input[type=text]').eq(idx).val(talk.author_screenname);

        // have an extra input field ready
        if(idx+1 === $('.speakers input[type=text]').length)
            $('a.moar').click();
    });

    // pure UI-appreciation delay...
    setTimeout(function() {
        $('.progress').hide();
        $('.progress').removeClass('progress-info');
    }, 1000);
}

function orderSpeakers(speakers) {
    var out = [];
    var unforcedPositions = [];

    $.each(speakers, function(idx, speaker) {
        if(speaker.forcePosition) {
            out[idx] = idx;
        } else {
            unforcedPositions.push(idx);
        }
    });

    // shuffle
    fisherYates(unforcedPositions);

    var outIdx = 0;
    for(var i = 0; i < unforcedPositions.length; i++) {
        if(typeof out[outIdx] === "undefined") {
            out[outIdx] = unforcedPositions[i];
        }
        else {
            // loop again
            i--;
        }
        outIdx++;
    }

    return out;
}

function fisherYates(myArray) {
  var i = myArray.length;
  if ( i == 0 ) return false;
  while ( --i ) {
     var j = Math.floor( Math.random() * ( i + 1 ) );
     var tempi = myArray[i];
     var tempj = myArray[j];
     myArray[i] = tempj;
     myArray[j] = tempi;
   }
}

function initMoarLink() {
    // do first separately
    $('.single-speaker').find('input[type=text]').keyup(inputValidator);

    // for every additional field...
    var moarHandler = function() {
        var speaker = $('.single-speaker:last');

        var clone = speaker.clone();
        clone.find('input[type=text]').val('').keyup(inputValidator); // DRY...

        speaker.after(clone);
    };

    for(var i = 0; i < kInitNmbSpeakers-1; i++)
        moarHandler();

    $('a.moar').click(moarHandler);
}

function inputValidator() {
    var str = $.trim($(this).val());

    if(str === "") {
        $(this).closest('.control-group').removeClass('success').removeClass('error');
        return;
    }

    if(findImgUrl(str) === null) {
        $(this).closest('.control-group').removeClass('success').addClass('error');
    } else {
        $(this).closest('.control-group').removeClass('error').addClass('success');
    }
}

function findImgUrl(twitterEmailUrl) {
    // ...simplified patterns!
    var patterns = [{
        // url
        're': /^http:\/\/(.+)$/,
        'process': function(url) { return url; }
    },{
        // email
        're': /^(.+)@([^\.]+)\.(.+)$/,
        'process': function(email) { return getGravatar(email); }
    },{
        // twitter
        're': /^@?([A-Za-z0-9_]+)$/,
        'process': function(user) { return "http://www.avatars.io/twitter/" + user ; }
    }];

    var out = null;
    $.each(patterns, function(idx, pattern) {
        var res = twitterEmailUrl.match(pattern.re);
        if(res !== null) {
            out = pattern.process(twitterEmailUrl);
            return false;
        }
    });
    return out;
}

function getGravatar(email) {
    var MD5=function(s){function L(k,d){return(k<<d)|(k>>>(32-d))}function K(G,k){var I,d,F,H,x;F=(G&2147483648);H=(k&2147483648);I=(G&1073741824);d=(k&1073741824);x=(G&1073741823)+(k&1073741823);if(I&d){return(x^2147483648^F^H)}if(I|d){if(x&1073741824){return(x^3221225472^F^H)}else{return(x^1073741824^F^H)}}else{return(x^F^H)}}function r(d,F,k){return(d&F)|((~d)&k)}function q(d,F,k){return(d&k)|(F&(~k))}function p(d,F,k){return(d^F^k)}function n(d,F,k){return(F^(d|(~k)))}function u(G,F,aa,Z,k,H,I){G=K(G,K(K(r(F,aa,Z),k),I));return K(L(G,H),F)}function f(G,F,aa,Z,k,H,I){G=K(G,K(K(q(F,aa,Z),k),I));return K(L(G,H),F)}function D(G,F,aa,Z,k,H,I){G=K(G,K(K(p(F,aa,Z),k),I));return K(L(G,H),F)}function t(G,F,aa,Z,k,H,I){G=K(G,K(K(n(F,aa,Z),k),I));return K(L(G,H),F)}function e(G){var Z;var F=G.length;var x=F+8;var k=(x-(x%64))/64;var I=(k+1)*16;var aa=Array(I-1);var d=0;var H=0;while(H<F){Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=(aa[Z]|(G.charCodeAt(H)<<d));H++}Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=aa[Z]|(128<<d);aa[I-2]=F<<3;aa[I-1]=F>>>29;return aa}function B(x){var k="",F="",G,d;for(d=0;d<=3;d++){G=(x>>>(d*8))&255;F="0"+G.toString(16);k=k+F.substr(F.length-2,2)}return k}function J(k){k=k.replace(/rn/g,"n");var d="";for(var F=0;F<k.length;F++){var x=k.charCodeAt(F);if(x<128){d+=String.fromCharCode(x)}else{if((x>127)&&(x<2048)){d+=String.fromCharCode((x>>6)|192);d+=String.fromCharCode((x&63)|128)}else{d+=String.fromCharCode((x>>12)|224);d+=String.fromCharCode(((x>>6)&63)|128);d+=String.fromCharCode((x&63)|128)}}}return d}var C=Array();var P,h,E,v,g,Y,X,W,V;var S=7,Q=12,N=17,M=22;var A=5,z=9,y=14,w=20;var o=4,m=11,l=16,j=23;var U=6,T=10,R=15,O=21;s=J(s);C=e(s);Y=1732584193;X=4023233417;W=2562383102;V=271733878;for(P=0;P<C.length;P+=16){h=Y;E=X;v=W;g=V;Y=u(Y,X,W,V,C[P+0],S,3614090360);V=u(V,Y,X,W,C[P+1],Q,3905402710);W=u(W,V,Y,X,C[P+2],N,606105819);X=u(X,W,V,Y,C[P+3],M,3250441966);Y=u(Y,X,W,V,C[P+4],S,4118548399);V=u(V,Y,X,W,C[P+5],Q,1200080426);W=u(W,V,Y,X,C[P+6],N,2821735955);X=u(X,W,V,Y,C[P+7],M,4249261313);Y=u(Y,X,W,V,C[P+8],S,1770035416);V=u(V,Y,X,W,C[P+9],Q,2336552879);W=u(W,V,Y,X,C[P+10],N,4294925233);X=u(X,W,V,Y,C[P+11],M,2304563134);Y=u(Y,X,W,V,C[P+12],S,1804603682);V=u(V,Y,X,W,C[P+13],Q,4254626195);W=u(W,V,Y,X,C[P+14],N,2792965006);X=u(X,W,V,Y,C[P+15],M,1236535329);Y=f(Y,X,W,V,C[P+1],A,4129170786);V=f(V,Y,X,W,C[P+6],z,3225465664);W=f(W,V,Y,X,C[P+11],y,643717713);X=f(X,W,V,Y,C[P+0],w,3921069994);Y=f(Y,X,W,V,C[P+5],A,3593408605);V=f(V,Y,X,W,C[P+10],z,38016083);W=f(W,V,Y,X,C[P+15],y,3634488961);X=f(X,W,V,Y,C[P+4],w,3889429448);Y=f(Y,X,W,V,C[P+9],A,568446438);V=f(V,Y,X,W,C[P+14],z,3275163606);W=f(W,V,Y,X,C[P+3],y,4107603335);X=f(X,W,V,Y,C[P+8],w,1163531501);Y=f(Y,X,W,V,C[P+13],A,2850285829);V=f(V,Y,X,W,C[P+2],z,4243563512);W=f(W,V,Y,X,C[P+7],y,1735328473);X=f(X,W,V,Y,C[P+12],w,2368359562);Y=D(Y,X,W,V,C[P+5],o,4294588738);V=D(V,Y,X,W,C[P+8],m,2272392833);W=D(W,V,Y,X,C[P+11],l,1839030562);X=D(X,W,V,Y,C[P+14],j,4259657740);Y=D(Y,X,W,V,C[P+1],o,2763975236);V=D(V,Y,X,W,C[P+4],m,1272893353);W=D(W,V,Y,X,C[P+7],l,4139469664);X=D(X,W,V,Y,C[P+10],j,3200236656);Y=D(Y,X,W,V,C[P+13],o,681279174);V=D(V,Y,X,W,C[P+0],m,3936430074);W=D(W,V,Y,X,C[P+3],l,3572445317);X=D(X,W,V,Y,C[P+6],j,76029189);Y=D(Y,X,W,V,C[P+9],o,3654602809);V=D(V,Y,X,W,C[P+12],m,3873151461);W=D(W,V,Y,X,C[P+15],l,530742520);X=D(X,W,V,Y,C[P+2],j,3299628645);Y=t(Y,X,W,V,C[P+0],U,4096336452);V=t(V,Y,X,W,C[P+7],T,1126891415);W=t(W,V,Y,X,C[P+14],R,2878612391);X=t(X,W,V,Y,C[P+5],O,4237533241);Y=t(Y,X,W,V,C[P+12],U,1700485571);V=t(V,Y,X,W,C[P+3],T,2399980690);W=t(W,V,Y,X,C[P+10],R,4293915773);X=t(X,W,V,Y,C[P+1],O,2240044497);Y=t(Y,X,W,V,C[P+8],U,1873313359);V=t(V,Y,X,W,C[P+15],T,4264355552);W=t(W,V,Y,X,C[P+6],R,2734768916);X=t(X,W,V,Y,C[P+13],O,1309151649);Y=t(Y,X,W,V,C[P+4],U,4149444226);V=t(V,Y,X,W,C[P+11],T,3174756917);W=t(W,V,Y,X,C[P+2],R,718787259);X=t(X,W,V,Y,C[P+9],O,3951481745);Y=K(Y,h);X=K(X,E);W=K(W,v);V=K(V,g)}var i=B(Y)+B(X)+B(W)+B(V);return i.toLowerCase()};
    return 'http://www.gravatar.com/avatar/' + MD5(email) + '.jpg';
}

function preloadAvatars(speakers, callback) {
    $('.progress .bar').css({'width': '25%'}).html("Chargement…");
    $('.progress').addClass('progress-success').show();
    var deltaProgress = 75 / speakers.length;
    var currProgress = 25;

    $.each(speakers, function(id, speaker){
        var img = new Image();
        img.onload = function(){
            speaker.img = img;

            currProgress += deltaProgress;
            $('.progress .bar').css({'width': currProgress +'%'});

            gLoadedAvatars++;
            if(gLoadedAvatars == speakers.length) {
                callback.call();
            }
        };

        var catholder = '/img/catholder.jpg';

        // YQL CORS-simulating base64-replying WIN!!
        $.ajax({
            url: speaker.url,
            type: 'GET',
            isImg: true,
            success: function(res) {
                if(res.responseText.indexOf('error') !== -1) {
                    img.src = catholder;
                } else {
                    img.src = speaker.url;
                }
                return;
            },
            error: function() {
                img.src = catholder;
            }
        });
    });
}

function initSlotsUI(speakers, speakerOrder) {
    $('#results').show();
    $('#machine').show();
    $('#slots').show();

    $('#slots').css('width', kSlotWidth * speakers.length);

    for(var idx = 0; idx < speakers.length; idx++) {
        var canvasDiv = $('<div>').addClass('slot');
        var canvas = $('<canvas>').attr('id', 'slot'+idx);
        canvasDiv.append(canvas);
        $('#slots').append(canvasDiv);
    }

    $('canvas').each(function() {
        $(this).attr('width', kCanvasSize.x);
        $(this).attr('height', kCanvasSize.y);
    });

    var reelHeight = kAvatarSize.y * speakers.length;

    $('canvas').each(function(idx) {
        var speakerList = speakers;
        var winner = speakerOrder[idx];

        // cute hack.
        if(speakers[idx].forcePosition) {
            speakerList = [speakers[idx]];
            winner = 0;
        }

        var slot = new Slot({
            canvasId: $(this).attr('id'),
            avatarSize: kAvatarSize,

            speakers: speakerList,
            winnerIdx: winner,

            deltaY: parseInt(Math.floor(Math.random() * reelHeight)),

            rotateDownCallback: function() {
                if(++gSpunDownReels == speakers.length) {
                    // the end!
                    listSpeakers(speakers, speakerOrder);

                    setInterval(function() {
                        $('#machine').toggleClass('on');
                    }, 300);
                }
            }
        });

        slot.rotateUntilWinner();
    });
}

function listSpeakers(speakers, speakerOrder) {
    var out = [];
    for(var i = 0; i < speakerOrder.length; i++) {
        out.push('<li>'+ speakers[speakerOrder[i]]['twitter-email-url'] +'</li>');
    }
    out = "<ul>"+ out.join('') +'</ul>';
    $("#results").html(out);
}
