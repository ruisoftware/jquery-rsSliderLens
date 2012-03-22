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
    var SliderLensClass = function ($origBar, opts) {
        var elemOrig = {
                pos: $origBar.position(),
                width: $origBar.width(),
                height: $origBar.height(),
                outerWidth: 0,
                outerHeight: 0,
                init: function () {
                    this.outerWidth = $origBar.outerWidth() - util.toInt($origBar.css('border-left-width')) - util.toInt($origBar.css('border-right-width'));
                    this.outerHeight = $origBar.outerHeight() - util.toInt($origBar.css('border-top-width')) - util.toInt($origBar.css('border-bottom-width'));
                }
            },
            elemRange = {
                $elem: null,
                init: function () {
                    if (opts.highlightRange && info.isRangeDefined) {
                        this.$elem = $("<div>").css({
                            'position': 'absolute',
                            'z-index': util.toInt($origBar.css('z-index')) + 1
                        }).addClass(opts.style.classHighlightRange);
                        if (info.isHoriz) {
                            this.$elem.css({
                                'left': (elemOrig.pos.left + info.fromPixel + util.toInt($origBar.css('margin-left'))) + 'px',
                                'top': elemOrig.pos.top + 'px',
                                'width': (info.toPixel - info.fromPixel) + 'px',
                                'height': elemOrig.height + 'px'
                            });
                        } else {
                            this.$elem.css({
                                'left': elemOrig.pos.left + 'px',
                                'top': (elemOrig.pos.top + info.fromPixel + util.toInt($origBar.css('margin-top'))) + 'px',
                                'width': elemOrig.width + 'px',
                                'height': (info.toPixel - info.fromPixel) + 'px'
                            });
                        }
                    }
                }
            },
            elemMagnif = {
                $elem1st: null,
                $elem2nd: null,
                $elemRange1st: null,
                $elemRange2nd: null,
                width: elemOrig.width * opts.handle.zoom,
                height: elemOrig.height * opts.handle.zoom,
                init: function () {
                    var scale = 'scale(' + opts.handle.zoom + ')';
                    this.$elem1st = $origBar.clone().removeAttr('id').removeAttr('class').css({
                        'position': 'absolute',
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
                        'filter': "progid:DXImageTransform.Microsoft.Matrix(M11=" + opts.handle.zoom + ", M12=0, M21=0, M22=" + opts.handle.zoom + ", DX=0, Dy=0, SizingMethod='auto expand');",
                        'z-index': util.toInt($origBar.css('z-index')) + 2,
                        'width': elemOrig.width + 'px',
                        'height': elemOrig.height + 'px',
                        'left': 0,
                        'top': 0,
'background-color': '#bfb'
                    });

                    if (info.useDoubleHandlers) {
                        this.$elem2nd = this.$elem1st.clone();
                    }
                    this.initRanges(scale);
                },
                initRanges: function (scale) {
                    if (opts.highlightRange && info.isRangeDefined) {
                        var createMagnifRange = function (isFirst) {
                            return elemRange.$elem.clone().removeAttr('id').css({
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
                                'z-index': util.toInt($origBar.css('z-index')) + 2,
                                'left': 0,
                                'top': 0
                            });
                        };
                        
                        this.$elemRange1st = createMagnifRange(true);
                        if (info.useDoubleHandlers) {
                            this.$elemRange2nd = createMagnifRange(false);
                        }
                    }
                },
                move: function (isFirst, offset) {
                    (isFirst ? this.$elem1st : this.$elem2nd).css(info.isHoriz? 'left' : 'top', offset + 'px');
                    if (opts.highlightRange && info.isRangeDefined) {
                        (isFirst ? this.$elemRange1st : this.$elemRange2nd).css(info.isHoriz? 'left' : 'top', (offset + info.fromPixel * opts.handle.zoom) + 'px');
                    }
                }
            },
            elemHandler = {
                $elem1st: null,
                $elem2nd: null,
                width: 0,
                height: 0,
                init: function () {
                    this.width = elemOrig.outerWidth * opts.handle.zoom;
                    this.height = elemOrig.outerHeight * opts.handle.zoom;
                    var cssCommon = {
                        'background-color': '#ddd',
                        //'border': '1px blue solid',
                        'overflow': 'hidden',
                        'opacity': 0.8,
                        
                        'position': 'absolute',
                        'z-index': util.toInt($origBar.css('z-index')) + 2
                    }, cssOrient;

                    if (info.isHoriz) {
                        cssOrient = {
                            'width': opts.handle.size + 'px',
                            'height': this.height + 'px',
                            'top': (elemOrig.pos.top - (elemMagnif.height - elemOrig.height) * opts.handle.relativePos) + 'px'
                        };
                    } else {
                        cssOrient = {
                            'width': this.width + 'px',
                            'height': opts.handle.size + 'px',
                            'left': (elemOrig.pos.left - (elemMagnif.width - elemOrig.width) * opts.handle.relativePos) + 'px'
                        };
                    }
                    this.$elem1st = elemMagnif.$elem1st.add(elemMagnif.$elemRange1st).wrapAll("<div>").parent().css(cssCommon).css(cssOrient);
                    if (info.useDoubleHandlers) {
                        this.$elem2nd = elemMagnif.$elem2nd.add(elemMagnif.$elemRange2nd).wrapAll("<div>").parent().css(cssCommon).css(cssOrient);
                    }
                }
            },

            info = {
                currValue: [0, 0], // Values for both handlers. When only one handler is used, the currValue[1] is ignored
                ticksStep: 0,
                isHoriz: elemOrig.width >= elemOrig.height,
                initialMargin: 0,
                fromPixel: 0,
                toPixel: 0,
                useDoubleHandlers: !!opts.value && (typeof opts.value === 'object') && opts.value.length === 2,
                isRangeDefined: !!opts.range && (typeof opts.range === 'object') && opts.range.length === 2,
                checkBounds: function () {
                    var checkValue = function (minBound, maxBound) {
                        if (opts.value < minBound) {
                            opts.value = minBound;
                        } else {
                            if (opts.value > maxBound) {
                                opts.value = maxBound;
                            }
                        }
                    },
                        checkValueArray = function (values, minBound, maxBound) {
                            if (values[0] < minBound) {
                                values[0] = minBound;
                            } // yeah, no else here
                            if (values[1] > maxBound) {
                                values[1] = maxBound;
                            }
                        },
                        sw;
                    if (opts.min > opts.max) {
                        sw = opts.min;
                        opts.min = opts.max;
                        opts.max = sw;
                    }
                    if (info.useDoubleHandlers) {
                        if (opts.value[0] > opts.value[1]) {
                            sw = opts.value[0];
                            opts.value[0] = opts.value[1];
                            opts.value[1] = sw;
                        }
                    }
                    if (info.isRangeDefined) {
                        if (opts.range[0] > opts.range[1]) {
                            sw = opts.range[0];
                            opts.range[0] = opts.range[1];
                            opts.range[1] = sw;
                        }
                        checkValueArray(opts.range, opts.min, opts.max);

                        if (info.useDoubleHandlers) {
                            checkValueArray(opts.value, opts.range[0], opts.range[1]);
                        } else {
                            checkValue(opts.range[0], opts.range[1]);
                        }
                    } else {
                        if (info.useDoubleHandlers) {
                            checkValueArray(opts.value, opts.min, opts.max);
                        } else {
                            checkValue(opts.min, opts.max);
                        }
                    }
                },
                init: function () {
                    this.checkBounds();
                    this.ticksStep = (Math.max(elemOrig.outerWidth, elemOrig.outerHeight) - opts.beginOffset - opts.endOffset) / (opts.max - opts.min);
                    this.fromPixel = (info.isRangeDefined ? opts.range[0] - opts.min : 0) * this.ticksStep + opts.beginOffset;
                    this.toPixel = ((info.isRangeDefined ? opts.range[1] : opts.max) - opts.min) * this.ticksStep + opts.beginOffset/* - opts.endOffset*/;
                    this.initialMargin = (this.isHoriz ? util.toInt($origBar.css('margin-left')) : util.toInt($origBar.css('margin-top')));
                }
            },

            init = function () {
                elemOrig.init();
                info.init();
                elemRange.init();
                elemMagnif.init();
                elemHandler.init();
                $origBar.after(elemHandler.$elem2nd).after(elemHandler.$elem1st).after(elemRange.$elem);

                // disable user text selection
                $origBar.add(elemRange.$elem).
                    add(elemMagnif.$elem1st).
                    add(elemMagnif.$elem2nd).
                    add(elemHandler.$elem1st).
                    add(elemHandler.$elem2nd).css({
                        '-webkit-touch-callout': 'none',
                        '-webkit-user-select': 'none',
                        '-khtml-user-select': 'none',
                        '-moz-user-select': 'none',
                        '-ms-user-select': 'none',
                        '-o-user-select': 'none',
                        'user-select': 'none'
                    });

                $origBar.add(elemRange.$elem).mousedown(panUtil.startDrag).mouseup(panUtil.stopDrag);
                elemHandler.$elem1st.mousedown(panUtil.startDragFromHandle1st).mouseup(panUtil.stopDrag);

                // to prevent the default behaviour in IE when dragging an element
                $origBar[0].ondragstart = elemMagnif.$elem1st[0].ondragstart = elemHandler.$elem1st[0].ondragstart =
                $origBar[0].onselectstart = elemMagnif.$elem1st[0].onselectstart = elemHandler.$elem1st[0].onselectstart = function () { return false; };
                if (info.useDoubleHandlers) {
                    elemMagnif.$elem2nd[0].ondragstart = elemHandler.$elem2nd[0].ondragstart =
                    elemMagnif.$elem2nd[0].onselectstart = elemHandler.$elem2nd[0].onselectstart = function () { return false; };
                    elemHandler.$elem2nd.mousedown(panUtil.startDragFromHandle2nd).mouseup(panUtil.stopDrag);
                }
            },
            getHandlerOffset = function ($handlerElem) {
                if (info.useDoubleHandlers) {
                    if ($handlerElem === elemHandler.$elem1st) {
                        // top/left handler: measure point is located on the handle bottom/right side
                        return opts.handle.size;
                    } else {
                        // bottom/right handler: measure point is located on the handle up/left side
                        return 0;
                    }
                }
                // one handler: measure point is located on the handle center
                return opts.handle.size / 2;
            },
            getHandlerPos = function (valuePixel, $handlerElem) {
                return valuePixel + info.initialMargin - getHandlerOffset($handlerElem);
            },
            setValuePixel = function (value, $handlerElem) { // value is a zero based pixel value
                var canSet = function (v) {
                    if (info.useDoubleHandlers) {
                        if ($handlerElem === elemHandler.$elem1st) {
                            return v >= info.fromPixel && v <= info.currValue[1] * info.ticksStep + opts.beginOffset;
                        } else {
                            return v >= (info.currValue[0] * info.ticksStep + opts.beginOffset) && v <= info.toPixel + opts.endOffset;
                        }
                    } else {
                        return v >= info.fromPixel && v <= info.toPixel + opts.endOffset;
                    }
                };
                if (canSet(value + opts.beginOffset)) {
                    setValueTicks(value / info.ticksStep + opts.min, $handlerElem);
                }
            },
            checkLimits = function (value) {
                if (info.isRangeDefined) {
                    if (value < opts.range[0]) {
                        return opts.range[0];
                    } else {
                        if (value > opts.range[1]) {
                            return opts.range[1];
                        }
                    }
                } else {
                    if (value < opts.min) {
                        return opts.min;
                    } else {
                        if (value > opts.max) {
                            return opts.max;
                        }
                    }
                }
                return value;
            },
            setValueTicks = function (value, $handlerElem) {
                var valueNoMin = value - opts.min;
                valueNoMin = opts.step > 0.00005 ? Math.round(valueNoMin / opts.step) * opts.step : valueNoMin;
                valueNoMin = checkLimits(valueNoMin + opts.min) - opts.min;
                
                var valuePixel = valueNoMin * info.ticksStep,
                    $magnifElem = $handlerElem === elemHandler.$elem1st? elemMagnif.$elem1st : elemMagnif.$elem2nd;
                if (info.isHoriz) {
                    $handlerElem.css({
                        'left': (elemOrig.pos.left + opts.beginOffset + getHandlerPos(valuePixel, $handlerElem)) + 'px'
                    });
                    elemMagnif.move($handlerElem === elemHandler.$elem1st, getHandlerOffset($handlerElem) - info.initialMargin - (opts.beginOffset + valuePixel) * opts.handle.zoom);
                } else {
                    $handlerElem.css({
                        'top': (elemOrig.pos.top + opts.beginOffset + getHandlerPos(valuePixel, $handlerElem)) + 'px'
                    });
                    elemMagnif.move($handlerElem === elemHandler.$elem1st, getHandlerOffset($handlerElem) - info.initialMargin - (opts.beginOffset + valuePixel) * opts.handle.zoom);
                }
                info.currValue[$handlerElem === elemHandler.$elem2nd ? 1 : 0] = valueNoMin + opts.min;
                if (opts.events.onChange) {
                    opts.events.onChange($origBar, info.currValue[$handlerElem === elemHandler.$elem2nd ? 1 : 0], $handlerElem === elemHandler.$elem1st, valuePixel);
                }
            },
            util = {
                toInt: function (str) {
                    return !str || str == 'auto' || str == '' ? 0 : parseInt(str, 10);
                },
                toFloat: function (str) {
                    return !str || str == 'auto' || str == '' ? 0.0 : parseFloat(str);
                }
            },
            panUtil = {
                noDrag: false,
                dragDelta: 0,
                $handler: null, // handler currently being dragged
                animDone: function (value) {
                    setValuePixel(value + panUtil.dragDelta, panUtil.$handler);
                    if (!panUtil.noDrag) {
                        $("body, html")
                            .bind('mousemove.rsSliderLens', info.isHoriz ? panUtil.dragHoriz : panUtil.dragVert)
                            .bind('mouseup.rsSliderLens', panUtil.stopDrag);
                    }
                },
                startDrag: function (event) {
                    var to = info.isHoriz ? event.pageX - elemOrig.pos.left : event.pageY - elemOrig.pos.top,
                        from;
                    if (!info.useDoubleHandlers || to <= ((info.currValue[0] + info.currValue[1]) / 2 - opts.min) * info.ticksStep) {
                        panUtil.$handler = elemHandler.$elem1st;
                        from = (info.currValue[0] - opts.min) * info.ticksStep;
                    } else {
                        panUtil.$handler = elemHandler.$elem2nd;
                        from = (info.currValue[1] - opts.min) * info.ticksStep;
                    }
                    panUtil.noDrag = false;

                    if (from !== to) {
                        $({ n: from }).animate({ n: to }, {
                            duration: opts.handle.animation,
                            step: function (now) {
                                setValuePixel(now, panUtil.$handler);
                            },
                            complete: function () {
                                panUtil.animDone(to);
                            }
                        });
                    } else {
                        panUtil.animDone(to);
                    }
                },
                startDragFromHandle1st: function (event) {
                    panUtil.$handler = elemHandler.$elem1st;
                    var from = (info.currValue[0] - opts.min) * info.ticksStep,
                        to = info.isHoriz ? event.pageX - elemOrig.pos.left : event.pageY - elemOrig.pos.top;
                    panUtil.noDrag = false;
                    panUtil.dragDelta = from - to;
                    panUtil.animDone(to);
                },
                startDragFromHandle2nd: function (event) {
                    panUtil.$handler = elemHandler.$elem2nd;
                    var from = (info.currValue[1] - opts.min) * info.ticksStep,
                        to = info.isHoriz ? event.pageX - elemOrig.pos.left : event.pageY - elemOrig.pos.top;
                    panUtil.noDrag = false;
                    panUtil.dragDelta = from - to;
                    panUtil.animDone(to);
                },
                dragHoriz: function (event) {
                    setValuePixel(event.pageX - elemOrig.pos.left + panUtil.dragDelta, panUtil.$handler);
                },
                dragVert: function (event) {
                    setValuePixel(event.pageY - elemOrig.pos.top + panUtil.dragDelta, panUtil.$handler);
                },
                stopDrag: function (event) {
                    panUtil.noDrag = true;
                    $("body, html").unbind('mousemove.rsSliderLens mouseup.rsSliderLens');
                    panUtil.dragDelta = 0;
                }
            };

        init();
        if (info.useDoubleHandlers) {
            setValueTicks(opts.value[0], elemHandler.$elem1st);
            setValueTicks(opts.value[1], elemHandler.$elem2nd);
        } else {
            setValueTicks(opts.value, elemHandler.$elem1st);
        }
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
        opts.style = $.extend({}, $.fn.rsSliderLens.defaults.style, options ? options.style : options);
        opts.events = $.extend({}, $.fn.rsSliderLens.defaults.events, options ? options.events : options);

        return this.each(function () {
            new SliderLensClass($(this), opts);
        });
    };

    // public access to the default input parameters
    $.fn.rsSliderLens.defaults = {
        value: 0, // number or a two number array. When a single number is used, only a single handle is shown. When an array is used (e.g. [5, 20]) two handles are shown.
        min: 0,
        max: 16,
        step: 0,
        beginOffset: 0,
        endOffset: 0,
        range: null, // Two number array that defines the range of values that the user can select. For example, if range=[20, 80] and min=0, max=100 the slider 
        // renders all scale from 0 to 100, but only the 20-80 range is selectable.
        // If you want everything to be selectable, then do not specify range, or use range=null or even use range=[0, 100].

        // false - no range
        // true - between value[0] and value[1]
        // "min" - between 0 and value[0]
        // "max" - between value[1] (or value[0], for single handler) to max
        
        highlightRange: true, // If true, a highlight bar shows up to indicate the range location. This parameter is ignored if range parameter is undefined or null.
        // The style of this bar is defined by the classHighlightRange parameter
        style: {
            classHighlightRange: 'sliderlens-range'
        },
        handle: {
            size: 50,
            zoom: 1.5,
            relativePos: 0.4, // float between 0 and 1 that indicates the handler relative (0% - 100%) vertical position (for horizontal sliders).
            // When it is 0, the handler is vertically aligned to the top, 1 for the bottom.
            // For vertical sliders, relativePos is the handler relative horizontal position: 0 for the left side, 1 for the right side
            animation: 200
        },
        events: {
            onChange: null // function ($origBar, value, isFirstHandle, pixelValue)
        }
    };

    /* TODO */
    $.fn.rsSliderLens.defaultsGoto = {
        animate: 1000
    };

})(jQuery);