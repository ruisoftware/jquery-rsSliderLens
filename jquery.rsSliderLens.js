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
                    if (!!opts.range) {
                        this.$elem = $("<div>").css({
                            'position': 'absolute',
                            'z-index': util.toInt($origBar.css('z-index')) + 1
                        }).addClass(opts.style.classHighlightRange);
                        if (info.isHoriz) {
                            this.$elem.css({
                                'top': elemOrig.pos.top + 'px',
                                'height': elemOrig.height + 'px'
                            });
                            switch (opts.range) {
                                case 'min': this.$elem.css('left', (elemOrig.pos.left + info.initialMargin + opts.beginOffset) + 'px');
                                            break;
                                default:
                                    if (info.isRangeDefined) {
                                        this.$elem.css({
                                            'left': (elemOrig.pos.left + info.fromPixel + info.initialMargin) + 'px',
                                            'width': (info.toPixel - info.fromPixel) + 'px'
                                        });
                                    }
                            }
                        } else {
                            this.$elem.css({
                                'left': elemOrig.pos.left + 'px',
                                'width': elemOrig.width + 'px'
                            });
                            switch (opts.range) {
                                case 'min': this.$elem.css('top', (elemOrig.pos.top + info.initialMargin + opts.beginOffset) + 'px');
                                            break;
                                default:
                                    if (info.isRangeDefined) {
                                        this.$elem.css({
                                            'top': (elemOrig.pos.top + info.fromPixel + info.initialMargin) + 'px',
                                            'height': (info.toPixel - info.fromPixel) + 'px'
                                        });
                                    }
                            }
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
                initClone: function () {
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
                
                initCanvasHandler: function () {
                    this.$elem1st = $("<canvas>").attr({
                        'width': this.width + 'px',
                        'height': this.height + 'px'
                    });
                    if (opts.handle.onDrawRuler) {
                        opts.handle.onDrawRuler($origBar, this.$elem1st[0], this.width, this.height);
                    } else {
                        if (this.$elem1st[0].getContext) {
                            util.initCanvas(this.$elem1st[0].getContext('2d'), this.width, this.height, opts.handle.zoom);
                        }
                    }
                },
                init: function () {
                    /*
                    if (opts.showRuler) {
                        this.initCanvas();
                    }
                    */
                    if (opts.showRuler === true || opts.showRuler === 'handler') {
                        this.initCanvasHandler();
                        if (opts.showRuler === true) {
                            //this.initCanvasOutsideHandler();
                        }
                    } else {
                        this.initClone();
                    }
                },
                initRanges: function (scale) {
                    if (info.isRangeDefined || opts.range === 'min' || opts.range === 'max') {
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
                move: function (isFirst, valuePixel, offset) {
                    switch (opts.range) {
                        case 'min': if (isFirst) { 
                                        elemRange.$elem.css(info.isHoriz ? 'width' : 'height', valuePixel + 'px');
                                        if (info.isHoriz) {
                                            this.$elemRange1st.css({
                                                'left': offset + 'px',
                                                'width': valuePixel + 'px'
                                            });
                                        } else {
                                            this.$elemRange1st.css({
                                                'top': offset + 'px',
                                                'height': valuePixel + 'px'
                                            });
                                        }
                                    }
                                    break;
                        case 'max': if (!info.useDoubleHandlers || info.useDoubleHandlers && !isFirst) {
                                        if (info.isHoriz) {
                                            elemRange.$elem.css({
                                                'left': (elemOrig.pos.left + valuePixel + opts.beginOffset) + 'px',
                                                'width': (elemOrig.outerWidth - valuePixel - opts.endOffset) + 'px'
                                            });
                                            (info.useDoubleHandlers ? this.$elemRange2nd : this.$elemRange1st).
                                                css('width', (elemOrig.outerWidth - valuePixel - opts.endOffset) + 'px');
                                        } else {
                                            elemRange.$elem.css({
                                                'top': (elemOrig.pos.top + valuePixel + opts.beginOffset) + 'px',
                                                'height': (elemOrig.outerHeight - valuePixel - opts.endOffset) + 'px'
                                            });
                                            (info.useDoubleHandlers ? this.$elemRange2nd : this.$elemRange1st).
                                                css('height', (elemOrig.outerHeight - valuePixel - opts.endOffset) + 'px');
                                        }
                                    }
                                    break;
                        case true:  if (info.isHoriz) {
                                        var left = elemOrig.pos.left + (info.currValue[0] - opts.min) * info.ticksStep + opts.beginOffset;
                                        elemRange.$elem.css({
                                            'left': left + 'px',
                                            'width': (elemOrig.pos.left + (info.currValue[1] - opts.min) * info.ticksStep + opts.beginOffset - left) + 'px'
                                        });
                                    } else {
                                        var top = elemOrig.pos.top + (info.currValue[0] - opts.min) * info.ticksStep + opts.beginOffset;
                                        elemRange.$elem.css({
                                            'top': top + 'px',
                                            'height': (elemOrig.pos.top + (info.currValue[1] - opts.min) * info.ticksStep + opts.beginOffset - top) + 'px'
                                        });
                                    }
                    }
                    (isFirst ? this.$elem1st : this.$elem2nd).css(info.isHoriz? 'left' : 'top', offset + 'px');
                    if (info.isRangeDefined) {
                        (isFirst ? this.$elemRange1st : this.$elemRange2nd).css(info.isHoriz? 'left' : 'top', (offset + info.fromPixel * opts.handle.zoom) + 'px');
                    }
                }
            },
            elemHandle = {
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
                        //'overflow': 'hidden',
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
                isStepDefined: opts.step > 0.00005,
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
                    } else {
                        if (opts.range === true) { // range=true does not make sense for single handle
                            opts.range = false;
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
                    this.toPixel = ((info.isRangeDefined ? opts.range[1] : opts.max) - opts.min) * this.ticksStep + opts.beginOffset;
                    this.initialMargin = (this.isHoriz ? util.toInt($origBar.css('margin-left')) : util.toInt($origBar.css('margin-top')));
                }
            },

            init = function () {
                elemOrig.init();
                info.init();
                elemRange.init();
                elemMagnif.init();
                elemHandle.init();
                $origBar.after(elemHandle.$elem2nd).after(elemHandle.$elem1st).after(elemRange.$elem);

                // disable user text selection
                $origBar.add(elemRange.$elem).
                    add(elemMagnif.$elem1st).
                    add(elemMagnif.$elem2nd).
                    add(elemHandle.$elem1st).
                    add(elemHandle.$elem2nd).css({
                        '-webkit-touch-callout': 'none',
                        '-webkit-user-select': 'none',
                        '-khtml-user-select': 'none',
                        '-moz-user-select': 'none',
                        '-ms-user-select': 'none',
                        '-o-user-select': 'none',
                        'user-select': 'none'
                    });

                $origBar.add(elemRange.$elem).mousedown(panUtil.startDrag).mouseup(panUtil.stopDrag);
                elemHandle.$elem1st.mousedown(panUtil.startDragFromHandle1st).mouseup(panUtil.stopDrag);

                // to prevent the default behaviour in IE when dragging an element
                $origBar[0].ondragstart = elemMagnif.$elem1st[0].ondragstart = elemHandle.$elem1st[0].ondragstart =
                $origBar[0].onselectstart = elemMagnif.$elem1st[0].onselectstart = elemHandle.$elem1st[0].onselectstart = function () { return false; };
                if (info.useDoubleHandlers) {
                    elemMagnif.$elem2nd[0].ondragstart = elemHandle.$elem2nd[0].ondragstart =
                    elemMagnif.$elem2nd[0].onselectstart = elemHandle.$elem2nd[0].onselectstart = function () { return false; };
                    elemHandle.$elem2nd.mousedown(panUtil.startDragFromHandle2nd).mouseup(panUtil.stopDrag);
                }
            },
            getHandlerOffset = function ($handlerElem) {
                if (info.useDoubleHandlers) {
                    if ($handlerElem === elemHandle.$elem1st) {
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
                        if ($handlerElem === elemHandle.$elem1st) {
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
                valueNoMin = info.isStepDefined ? Math.round(valueNoMin / opts.step) * opts.step : valueNoMin;
                valueNoMin = checkLimits(valueNoMin + opts.min) - opts.min;
                
                var valuePixel = valueNoMin * info.ticksStep,
                    $magnifElem = $handlerElem === elemHandle.$elem1st? elemMagnif.$elem1st : elemMagnif.$elem2nd;
                
                info.currValue[$handlerElem === elemHandle.$elem2nd ? 1 : 0] = valueNoMin + opts.min;
                if (info.isHoriz) {
                    $handlerElem.css({
                        'left': (elemOrig.pos.left + opts.beginOffset + getHandlerPos(valuePixel, $handlerElem)) + 'px'
                    });
                    elemMagnif.move($handlerElem === elemHandle.$elem1st, valuePixel, getHandlerOffset($handlerElem) - info.initialMargin - (opts.beginOffset + valuePixel) * opts.handle.zoom);
                } else {
                    $handlerElem.css({
                        'top': (elemOrig.pos.top + opts.beginOffset + getHandlerPos(valuePixel, $handlerElem)) + 'px'
                    });
                    elemMagnif.move($handlerElem === elemHandle.$elem1st, valuePixel, getHandlerOffset($handlerElem) - info.initialMargin - (opts.beginOffset + valuePixel) * opts.handle.zoom);
                }
                if (opts.onChange) {
                    opts.onChange($origBar, info.currValue[$handlerElem === elemHandle.$elem2nd ? 1 : 0], $handlerElem === elemHandle.$elem1st, valuePixel);
                }
            },
            util = {
                toInt: function (str) {
                    return !str || str == 'auto' || str == '' ? 0 : parseInt(str, 10);
                },
                toFloat: function (str) {
                    return !str || str == 'auto' || str == '' ? 0.0 : parseFloat(str);
                },
                roundToDecimalPlaces: function (num, decimals) {
                    var base = Math.pow(10, decimals);
                    return Math.round(num * base) / base;
                },
                // rounds n to the nearest multiple of m, e.g., if n = 24.8 and m = 25, then returns 25; if n = 24.8 and m = 10, then returns 20
                roundNtoMultipleOfM: function (n, m) {
                    return Math.round(n / m) * m;
                },
                initCanvas: function (ctx, width, height, zoom) {
                    var getFontData = function () {
                            var fontSize = !!opts.ruler.values.font ? opts.ruler.values.font.match(/(\d*.\d+|\d)(em|pt|px|%)/i) : null,
                                fontData = { size: 10, type: 'px', sizePos: 0 };
                            if (!fontSize) {
                                fontSize = [$("html,body").css('font-size')];
                            }
                            fontData.size = util.toFloat(fontSize[0]);
                            fontData.type = fontSize[0].replace(/(\d*.\d+|\d)/, '').toLowerCase();
                            fontData.sizePos = !!opts.ruler.values.font ? opts.ruler.values.font.indexOf(fontSize[0]) : 0;
                            return {
                                size: fontData.size * zoom,
                                contextFont:
                                    ((!!opts.ruler.values.font ? opts.ruler.values.font.substring(0, fontData.sizePos) + ' ' : '') +
                                    fontData.size * zoom + fontData.type + ' ' +
                                    (!!opts.ruler.values.font ? opts.ruler.values.font.substring(fontData.sizePos + fontSize[0].length + 1) : ' arial')).trim()
                            };
                        },
                        fontData = getFontData(),
                        drawTick = function (i, longerMark, pos) {
                            i = Math.round(i) + 0.5;
                            ctx.moveTo(i, pos - (longerMark? opts.ruler.tickMarks.sizeBig : opts.ruler.tickMarks.sizeSmall) * zoom);
                            ctx.lineTo(i, pos);
                        },
                        getFormatedNum = function (num) {
                            return opts.ruler.values.onFmtValue ? opts.ruler.values.onFmtValue($origBar, num) : num;
                        };
                        
                    ctx.font = fontData.contextFont;
                    ctx.fillStyle = opts.ruler.values.fillStyle;
                    ctx.strokeStyle = opts.ruler.tickMarks.strokeStyle;
                    ctx.lineWidth = zoom;
                    var fmtMin = getFormatedNum(opts.min),
                        fmtMax = getFormatedNum(opts.max),
                        from = curr = ctx.measureText(fmtMin).width,
                        deltaStart = from / 2,
                        deltaEnd = ctx.measureText(fmtMax).width / 2,
                        lastLabel = width - deltaEnd * 2,
                        to = width - deltaEnd,
                        space = width - deltaStart - deltaEnd,
                        tickMarkRate = space / (opts.max - opts.min),
                        pixelStep = info.isStepDefined ? tickMarkRate * opts.step : zoom * 2,
                        textRelativePos = fontData.size + (height - fontData.size) * opts.ruler.values.relativePos;
                        tickMarkRelativePos = Math.max(opts.ruler.tickMarks.sizeSmall, opts.ruler.tickMarks.sizeBig) + (height - Math.max(opts.ruler.tickMarks.sizeSmall, opts.ruler.tickMarks.sizeBig)) * opts.ruler.tickMarks.relativePos;
                    if (opts.ruler.values.show) {
                        ctx.fillText(fmtMin, 0, textRelativePos);
                    }
                    for (var i = deltaStart, longerMark = true, cond = true; cond; i += pixelStep) {
                        var num = util.roundToDecimalPlaces((i - deltaStart) / tickMarkRate + opts.min, opts.ruler.values.decimals),
                            fmtNum;

                        if (info.isStepDefined) {
                            num = util.roundNtoMultipleOfM(num - opts.min, opts.step) + opts.min;
                        }
                        fmtNum = opts.ruler.values.onFmtValue ? opts.ruler.values.onFmtValue($origBar, num) : num;
                            
                        var textPos = ctx.measureText(fmtNum).width / 2;
                        
                        if (opts.ruler.values.show) {
                            var doText = // if there is enough space (6px) that would separate this label from the previous one
                                        i - textPos - curr > 6 * zoom && 
                                        // and there is enough space to the last label
                                        lastLabel - i - textPos > 6 * zoom;
;
                            // only shows a label, if every prefValueEvery (if defined) and ... 
                            if (doText && !!opts.ruler.values.prefValueEvery) {
                                var everyValue = Math.abs((num - opts.min) % opts.ruler.values.prefValueEvery);
                                doText = everyValue < 0.00005 && i - deltaStart > 0.00005;
                            }

                            if (doText) {
                                ctx.fillText(fmtNum, i - textPos, textRelativePos);
                                curr = i + textPos;
                                longerMark = true;
                            }
                        }

                        cond = to - i - pixelStep > - 0.00005;
                        if (opts.ruler.tickMarks.show) {
                            drawTick(i, longerMark || !cond, tickMarkRelativePos);
                            longerMark = to - i - pixelStep <= 0.00005;
                        }
                    }
                    if (opts.ruler.values.show) {
                        ctx.fillText(fmtMax, lastLabel, textRelativePos);
                    }
                    ctx.stroke();
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
                        panUtil.$handler = elemHandle.$elem1st;
                        from = (info.currValue[0] - opts.min) * info.ticksStep;
                    } else {
                        panUtil.$handler = elemHandle.$elem2nd;
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
                    panUtil.$handler = elemHandle.$elem1st;
                    var from = (info.currValue[0] - opts.min) * info.ticksStep,
                        to = info.isHoriz ? event.pageX - elemOrig.pos.left : event.pageY - elemOrig.pos.top;
                    panUtil.noDrag = false;
                    panUtil.dragDelta = from - to;
                    panUtil.animDone(to);
                },
                startDragFromHandle2nd: function (event) {
                    panUtil.$handler = elemHandle.$elem2nd;
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
            setValueTicks(opts.value[0], elemHandle.$elem1st);
            setValueTicks(opts.value[1], elemHandle.$elem2nd);
        } else {
            setValueTicks(opts.value, elemHandle.$elem1st);
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
        opts.ruler = $.extend({}, $.fn.rsSliderLens.defaults.ruler, options ? options.ruler : options);
        opts.ruler.values = $.extend({}, $.fn.rsSliderLens.defaults.ruler.values, options ? (options.ruler ? options.ruler.values : options.ruler) : options);
        opts.ruler.tickMarks = $.extend({}, $.fn.rsSliderLens.defaults.ruler.tickMarks, options ? (options.ruler ? options.ruler.tickMarks : options.ruler) : options);

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
        range: false,   // false - no range
                        // true - range between current handlers. Only meaningful for double handlers.
                        // "min" - between start and first handler
                        // "max" - between handler and last position, or, when two handlers are used, between second handler and last position.
                        // [from, to] - defines a range that restricts the input to the interval [from, to].
                        // The style of this bar is defined by the classHighlightRange parameter
        style: {
            classHighlightRange: 'sliderlens-range'
        },
        handle: {
            size: 50,
            zoom: 1.5,
            relativePos: 0.5, // float between 0 and 1 that indicates the handler relative (0% - 100%) vertical position (for horizontal sliders).
            // When it is 0, the handler is vertically aligned to the top, 1 for the bottom.
            // For vertical sliders, relativePos is the handler relative horizontal position: 0 for the left side, 1 for the right side
            animation: 200,
            onDrawRuler: null
        },
        showRuler: false, // false - Original content appears outside handler. Magnified original content appears inside handler.
                          // true - Ruler appears outside handler. Magnified rule appears inside handle.
                          // 'handler' - Original content appears outside handler. Magnified rule appears inside handle.
        onDrawRuler: null,
        ruler: {
            values: {
                show: true,
                font: '10px arial',
                fillStyle: 'black',
                relativePos: 0,
                prefValueEvery: null,
                decimals: 0,
                onFmtValue: null // function ($origBar, value)
            },
            tickMarks: {
                show: true,
                strokeStyle: 'black',
                relativePos: 1,
                sizeSmall: 10,
                sizeBig: 15
            }            
        },
        onChange: null // function ($origBar, value, isFirstHandle, pixelValue)
    };

    /* TODO */
    $.fn.rsSliderLens.defaultsGoto = {
        animate: 1000
    };

})(jQuery);