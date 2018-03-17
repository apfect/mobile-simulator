if ( window.parent && window.location !== window.parent.location )
{
	window.mobileSimulation = true;

	var touchDown = false;
	var startPosition = null;
	var startScroll = null;
	var moved = false;
	var lastMove = null;
	var prevMove = null;
	
	var style =
		'* { cursor: pointer !important; }' +
		//'* { cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADSHpUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHjajVVbsiQpCP13FbMEERFZDipGzA5m+XPMrKy+daOn52qkD0AeBzRT/PP3Tn+dZtpSFe3NWsto1aoVx6Lnu9k10jXTTSovFvYf9PQwqHwynpn8k15fRmh8U/QwSv+m6GWBjwGsqd579ZciBvWromfRrGuuvxg97nnNRyFnJu7smBkjsZZDKVgLW8LEfBS0Fyh6/H8dPscLAw2jr/TLRz4Lf8un1wF4yhcgv8Mpl0/6G3D+RU8fjKe1SztdVukL7Q/gp+/o/x/4V1hfsCx+rxLIHwzbnw7uvfrecQlUrw211l5V9AR/K4LggB982aR3L+/56TXzey3YnX1FwIIPPT0LoG+o6HvWi9LzwGdIzdNv2sTnGF+c25VU+cPusXYSKBDRS63/rKefCv6u732qlejczeuulSvZ5VrSQYbPCDEkgfobWs7/1fRk7WBk96FidCf67nei9duhAzFdELRLRcctgflUqEiBKmrUyQqf2/Pypb6T/If2yCb6kfA6d35e1X6Hf4LPvHOOStpot0QRHFlblNBKu1I03mXHJmDpbWjLu2Wvo4fZEuUhtBqt2Rqv1X2aUhtek1iTPIyozDo2S0P5slljn6OsLnvNwnP46homa+laZB6rLp0jluIJidWnJduN5lEKPwaka5t2LMzao/biww1PUmTvraCco9iYEy7PWjiCdomhNWKkKXo2QMHMm+qArel7uMvUJtDWopchAIDr4DxQNVIh2+GOZ5sV+E2JtAuZRR4KHMfsI1yXqs/dyqTQ7ZuWii8eqsCmrT6QeC61uixzByAmsJhqWT6AsvcqtMWilqmoJ1SDQbZT945XNrjrmM02F40lsn2wo1LGBpAMO8ln1q64dmDu4lFlAERhVoS+CBkeixCMWqPSZ+8mCLpE8ZVbQwUq6ehDz+MPPDeCgtOISBarRNNdEQm0LTbXNoMJcIf2OZBSuNNcykCIc8I4jKUeBSkmQaUoMJSQDvv4UUzrlTtthtKFotjuG3WEeCYAGDlGXQh6eVmDZSRBKo1m9yE7okxfm4GRRu9MgoxPh4viWSZ+TSKoOFQLaz/xlAB52JmTblwAvM3pX8vE001JF+U6AAAABHNCSVQICAgIfAhkiAAAAHxJREFUWIXtlrEJwDAMBK1fIltk/zm8RZZ4UiUkYAVsCZTirxXmzyokWXMg2b0agN2rzWJeMIDDe0RyyxJ5CZDsX8EjkajELTAbniVhkfAMCayGZmHR31+sdqG8AxKQQLmABtE/dsGqROo2fEq0VnQPjERGZF5EQgghRDknZv9QHNYwQcsAAAAASUVORK5CYII=") 16 16, move !important; }' +
		'.mobile-scrollbar { position: fixed; z-index: 99999; background: #777777; opacity: 0; pointer-events: none; transition: opacity 0.6s ease; }' +
		'.mobile-scrollbar-v { right: 0; top: 0; width: 5px; }' +
		'.mobile-scrollbar-h { bottom: 0; left: 0; height: 5px; }' +
		'.mobile-scrollbar.active { opacity: 0.5; transition: opacity 0.2s ease; }';
	
	$('html > head').append($('<style>' + style + '</style>'));
	
	$('body')
		.addClass('mobile-preview')
		.append("<div class='mobile-scrollbar mobile-scrollbar-v'></div>")
		.append("<div class='mobile-scrollbar mobile-scrollbar-h'></div>");
	           
   	var mobileScrollBarResize = function()
   	{
    	$('.mobile-scrollbar-v').height($(window).height() * $(window).height() / $(document).height());
    	$('.mobile-scrollbar-v').toggle($('.mobile-scrollbar-v').height() < $(window).height());
		
    	$('.mobile-scrollbar-h').width($(window).width() * $(window).width() / $(document).width());
    	$('.mobile-scrollbar-h').toggle($('.mobile-scrollbar-h').width() < $(window).width());
    };
    mobileScrollBarResize();
    $(window).resize(mobileScrollBarResize);
    
	$(document).on('scroll', function(event) {
		$('.mobile-scrollbar-v').css('top', $(window).scrollTop() * $(window).height() / $(document).height());
		$('.mobile-scrollbar-h').css('left', $(window).scrollLeft() * $(window).width() / $(document).width());
	});
    
	$("body, html").css({
	    overflow: 'hidden'
	})
	.on('mousewheel', function() {
		return false;
	});

	$("form").on("submit", function(event) {
		event.preventDefault();
		return false;
	});
	
	$("body").on("selectstart select dragstart drag mouseup mousedown", function(event) {
		event.preventDefault();
	});
	
	$("body").on("touchstart mousedown", function (event) {
    	touchDown = true;
		startPosition = { x: event.pageX, y: event.pageY };
		startScroll = { x: $(window).scrollLeft(), y: $(window).scrollTop() };
		moved = false;
		lastMove = { time: event.timeStamp, x: $(window).scrollLeft(), y: $(window).scrollTop() };
    });
    
    var scrollAnimation = null;
    
	$("body").on("touchend mouseup mouseleave touchcancel click", function (event) {
		if (!touchDown) return;
    	touchDown = false;
		startPosition = null;
		startScroll = null;
		if (moved) {
			$('body *').on('click.preventDragClick', function(event) { return false; });
			setTimeout(function() { $('body *').off('click.preventDragClick'); }, 1);
		}
		moved = false;
		var now = event.timeStamp;
		if (prevMove && now - prevMove.time < 150 && prevMove.time != lastMove.time)
		{					
			var vector = [
				(lastMove.x - prevMove.x) / (lastMove.time - prevMove.time) * 5,
				(lastMove.y - prevMove.y) / (lastMove.time - prevMove.time) * 5
			];
			clearInterval(scrollAnimation);
			scrollAnimation = setInterval(function() {
				var vl = Math.sqrt(vector[0]*vector[0] + vector[1]*vector[1]);
				var vx = vector[0] / vl / 6 * (1 + vl/20);
				var vy = vector[1] / vl / 6 * (1 + vl/20);
				vector[0] = vector[0] - vx;
				vector[1] = vector[1] - vy;
				if (0.0 == vector[0] == vector[1] || isNaN(vx) || isNaN(vy) || vector[0] * vx < 0 || vector[1] * vy < 0) {
					clearInterval(scrollAnimation);
					scrollAnimation = null;
					$('.mobile-scrollbar').removeClass('active');
					return;
				}
				$(window).scrollLeft($(window).scrollLeft() + vector[0]);
				$(window).scrollTop($(window).scrollTop() + vector[1]);
			}, 1000/60);
        }
        else $('.mobile-scrollbar').removeClass('active');
        lastMove = null;
        prevMove = null;
		
    });
	
	$("body").on("touchmove mousemove", function(event) {
		if (!touchDown) return;
		if (scrollAnimation) { clearInterval(scrollAnimation); scrollAnimation = null; }
		var shift = {
			x: event.pageX - startPosition.x - ($(window).scrollLeft() - startScroll.x),
			y: event.pageY - startPosition.y - ($(window).scrollTop() - startScroll.y)
		};
		$(window).scrollLeft(startScroll.x - shift.x);
		$(window).scrollTop(startScroll.y - shift.y);
		moved = true;
		if (shift.x) $('.mobile-scrollbar-h').addClass('active');
		if (shift.y) $('.mobile-scrollbar-v').addClass('active');
		prevMove = lastMove;
		lastMove = { time: event.timeStamp, x: $(window).scrollLeft(), y: $(window).scrollTop() };
	});
}
