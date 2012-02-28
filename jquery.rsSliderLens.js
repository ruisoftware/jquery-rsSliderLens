/**
* jQuery SliderLens - Slider with magnification
* ====================================================
*
* Licensed under The MIT License
* 
* @version   1
* @since     25.02.2012
* @author    Jose Rui Santos
*
* 
* Input parameter  Default value  Remarks
* ================ =============  ===============================================================================================
*
* 
* Usage with default values:
* ==========================
*
*/
(function ($) {
    var SliderLensClass = function ($elem, opts) {
        var elemOrig = {
                pos: $elem.position(),
                width: $elem.width(),
                height: $elem.height(),
                isHoriz: false
            },
            elemMagnif = {
                $elem: null,
                width: elemOrig.width * opts.handle.zoom,
                height: elemOrig.height * opts.handle.zoom
            },
            util = {
                toInt: function (str) {
                    return !str || str == 'auto' || str == '' ? 0 : parseInt(str, 10);
                },
                toFloat: function (str) {
                    return !str || str == 'auto' || str == '' ? 0.0 : parseFloat(str);
                }
            },
            ticksStep = Math.max(elemOrig.width, elemOrig.height) / (opts.max - opts.min),
            init = function () {
                elemOrig.isHoriz = elemOrig.width >= elemOrig.height;
                var scale = 'scale(' + opts.handle.zoom + ')';
                elemMagnif.$elem = $elem.css({
                        'width': elemOrig.width,
                        'height': elemOrig.height
                    }).clone().removeAttr('id').css({
                        '-webkit-transform-origin': '0 0',
                        '-moz-transform-origin': '0 0',
                        '-o-transform-origin': '0 0',
                        'msTransformOrigin': '0 0',
                        'transform-origin': '0 0',
                        '-webkit-transform': scale,
                        '-moz-transform': scale,
                        '-o-transform': scale,
                        'msTransform': scale,
                        'transform': scale,
                        'position': 'absolute',
                        'z-index': util.toInt($elem.css('z-index')) + 1,
                        'background-color': 'yellow',
                        'opacity': 0.5
                    });
                if (elemOrig.isHoriz) {
                    elemMagnif.$elem.css({
                        'height':  elemOrig.height,
                        'top': (elemOrig.pos.top - (elemMagnif.height - elemOrig.height) * opts.handle.relativePos) + 'px'
                    });
                } else {
                    elemMagnif.$elem.css({
                        'width':  elemOrig.width,
                        'left': (elemOrig.pos.left - (elemMagnif.width - elemOrig.width) * opts.handle.relativePos) + 'px'
                    });
                }
                $elem.after(elemMagnif.$elem);
            },
            setValuePixel = function (value) {
                setValueTicks(value/ticksStep);
            },
            setValueTicks = function (value) {
                var valueNoMin = value - opts.min,
                    handleMiddlePos = valueNoMin * ticksStep,
                    halfOffsetHandle = opts.handlesize / 2 / opts.handle.zoom;

                if (elemOrig.isHoriz) {
                    elemMagnif.$elem.css({
                        'left': (elemOrig.pos.left + (valueNoMin - valueNoMin * opts.handle.zoom) * ticksStep) + 'px',
                        'clip': 'rect(0px ' + (handleMiddlePos + halfOffsetHandle) + 'px ' + elemMagnif.height + 'px ' + (handleMiddlePos - halfOffsetHandle) + 'px)'
                    });
                } else {
                    elemMagnif.$elem.css({
                        'top': (elemOrig.pos.top + (valueNoMin - valueNoMin * opts.handle.zoom) * ticksStep) + 'px',
                        'clip': 'rect(' + (handleMiddlePos - halfOffsetHandle) + 'px ' + elemMagnif.width + 'px ' + (handleMiddlePos + halfOffsetHandle) + 'px 0px)'
                    });
                }
            };

        init();
        setValueTicks(opts.value);
        elemMagnif.$elem.click(function (event) {
            setValuePixel(elemOrig.isHoriz ? event.pageX - elemOrig.pos.left : event.pageY - elemOrig.pos.top);
        });
        $elem.click(function (event) {
            setValuePixel(elemOrig.isHoriz ? event.pageX - elemOrig.pos.left : event.pageY - elemOrig.pos.top);
        });
    };

    $.fn.rsSliderLens = function (options) {
        var gotoPos = function (optionsGoto) {
            var optsGoto = $.extend({}, $.fn.rsSlidetLens.defaultsGoto, optionsGoto);

            return this.each(function () {
                $(this).trigger('gotoSingle.rsSliderLens', [optsGoto]);
            });
        };

        if (typeof options === 'string') {
            var otherArgs = Array.prototype.slice.call(arguments, 1);
            switch (options) {
                case 'gotoPos': return gotoPos.apply(this, otherArgs);
                default: return this;
            }
        }
        var opts = $.extend({}, $.fn.rsSliderLens.defaults, options);
        opts.handle = $.extend({}, $.fn.rsSliderLens.defaults.handle, options ? options.handle : options);

        return this.each(function () {
            new SliderLensClass($(this), opts);
        });
    };

    // public access to the default input parameters
    $.fn.rsSliderLens.defaults = {
        value: 160,
        min: 0,
        max: 160,
        horizontal: true,
        handle: {
            size: 1,
            zoom: 2,
            relativePos: 0.2 // float between 0 and 1 that indicates the relative (0% -- 100%) vertical position of the magnified scale on horizontal orientation.
                             // When is 0, the magnified scale is vertically aligned to the top, 1 for the bottom.
                             // For vertical oriented sliders, relativePos is the relative horizontal position: 0 for the left side, 1 for the right side
        }
    };

    $.fn.rsSliderLens.defaultsGoto = {
        animate: 1000
    };
    
})(jQuery);