var Slot = function(options) {
    this.init = function() {
        this.canvasId = options.canvasId;
        this.canvasSize = {
            x: parseInt($("#"+this.canvasId).attr('width')),
            y: parseInt($("#"+this.canvasId).attr('height'))
        };
        this.canvasContext = $("#"+this.canvasId)[0].getContext('2d');

        this.speakers = options.speakers;
        this.avatarSize = options.avatarSize;

        this.speed = options.speed || 0;
        this.deltaY = options.deltaY || 0;

        this.winnerIdx = options.winnerIdx;
        this.rotateDownCallback = options.rotateDownCallback || function() {};
    };

    this.rotateUntilWinner = function() {
        var _this = this;
        var rotateUpInterval = setInterval(function() {
            _this.speed += kReelSpeedDeltaUpDown;
            _this.deltaY += _this.speed;
            _this.draw();

            if(_this.speed > kMaxReelSpeed) {
                clearInterval(rotateUpInterval);
                _this.startRotateDown();
            }
        }, 10);
    }

    this.startRotateDown = function() {
        var reelHeight = this.avatarSize.y * this.speakers.length;
        var finalDeltaY = reelHeight - (this.avatarSize.y * this.winnerIdx);
        // move it up to red line
        finalDeltaY += (this.canvasSize.y - this.avatarSize.y) / 2;
        // overflow
        finalDeltaY %= reelHeight;

        var _this = this;
        var rotateDownInterval = setInterval(function() {
            if(_this.speed < 3) {
                _this.deltaY += _this.speed;

                if(Math.abs(_this.deltaY - finalDeltaY) < 4) {
                    clearInterval(rotateDownInterval);
                    _this.deltaY = finalDeltaY;

                    _this.rotateDownCallback();
                }

                _this.draw();
            } else {
                _this.speed -= kReelSpeedDeltaUpDown;
                _this.deltaY += _this.speed;
                _this.draw();
            }
        }, 10);
    }

    this.draw = function() {
        this.drawAvatars();
        stackBlurCanvasRGB(this.canvasId, 0, 0, this.canvasSize.x, this.canvasSize.y, this.speed/4);

        // centered red line
        this.canvasContext.beginPath();
        this.canvasContext.lineWidth = 4;
        this.canvasContext.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        this.canvasContext.moveTo(0, this.canvasSize.y / 2);
        this.canvasContext.lineTo(this.canvasSize.x, this.canvasSize.y / 2);
        this.canvasContext.stroke();
    };

    this.drawAvatars = function() {
        var deltaAvatarHeight = this.avatarSize.y * this.speakers.length;
        this.deltaY %= deltaAvatarHeight;

        if(this.deltaY < 0)
            deltaAvatarHeight = 0 - deltaAvatarHeight;

        var _this = this;
        $.each(this.speakers, function(idx, speaker) {
            var nmbRepeats = Math.ceil(_this.canvasSize.y / (_this.avatarSize.y * _this.speakers.length));

            for(var repeatIdx = -1; repeatIdx < nmbRepeats; repeatIdx++) {
                _this.canvasContext.drawImage(speaker.img, 0, (_this.deltaY + _this.avatarSize.y * idx) + (deltaAvatarHeight * repeatIdx), _this.avatarSize.x, _this.avatarSize.y);
            }
        });
    };

    this.init();
}