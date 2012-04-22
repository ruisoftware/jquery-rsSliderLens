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
        var 
            // content that appears outside the handle 
            elemOrig = {
                pos: $origBar.position(),
                width: $origBar.width(),
                height: $origBar.height(),
                outerWidth: 0,
                outerHeight: 0,
                $canvas: null,
                initCanvasOutsideHandle: function () {
                    this.$canvas = $("<canvas>").attr({
                        'width': this.width + 'px',
                        'height': this.height + 'px'
                    }).css({
                        'position': 'absolute',
                        'z-index': util.toInt($origBar.css('z-index')),
                        'left': this.pos.left + 'px',
                        'top': this.pos.top + 'px',
                        'width': this.width + 'px',
                        'height': this.height + 'px'
                    });
                    if (opts.handle.onDrawRuler) {
                        opts.handle.onDrawRuler($origBar, this.$canvas[0], this.width, this.height);
                    } else {
                        if (this.$canvas[0].getContext) {
                            var pixelOffsets = util.initCanvas(this.$canvas[0].getContext('2d'), this.width, this.height, 1);
                            info.beginOffset = pixelOffsets.pixelStart;
                            info.endOffset = pixelOffsets.pixelEnd;
                        }
                    }
                    $origBar.hide(); // because the ruler is used instead of the original slider
                },
                init: function () {
                    this.outerWidth = $origBar.outerWidth() - util.toInt($origBar.css('border-left-width')) - util.toInt($origBar.css('border-right-width'));
                    this.outerHeight = $origBar.outerHeight() - util.toInt($origBar.css('border-top-width')) - util.toInt($origBar.css('border-bottom-width'));
                    if (opts.showRuler === true) {
                        this.initCanvasOutsideHandle();
                    }
                }
            },

            // range that appears outside the handle
            elemRange = {
                $elem: null,
                // determines whether the user defined in the class classHighlightRange a height or width property
                userAlreadyDefinedSize: function () {
                    var $inspector = $("<div>").css('display', 'none').addClass(opts.style.classHighlightRange);
                    $("body").append($inspector); // add to DOM, in order to read the CSS property
                    try {
                        return util.toInt($inspector.css(info.isHoriz ? 'height' : 'width')) != 0;
                    } finally {
                        $inspector.remove(); // and remove from DOM
                    }
                },
                init: function () {
                    if (!!opts.range) {
                        this.$elem = $("<div>").css({
                            'position': 'absolute',
                            'z-index': util.toInt($origBar.css('z-index')) + 1
                        }).addClass(opts.style.classHighlightRange);
                        
                        if (info.isHoriz) {
                            this.$elem.css('top', elemOrig.pos.top + 'px');
                            if (!this.userAlreadyDefinedSize()) {
                                this.$elem.css('height', elemOrig.height + 'px');
                            }
                            switch (opts.range) {
                                case 'min': this.$elem.css('left', Math.round(elemOrig.pos.left + info.initialMargin + info.beginOffset) + 'px');
                                            break;
                                default:
                                    if (info.isRangeDefined) {
                                        this.$elem.css({
                                            'left': Math.round(elemOrig.pos.left + info.fromPixel + info.initialMargin) + 'px',
                                            'width': Math.round(info.toPixel - info.fromPixel + 1) + 'px'
                                        });
                                    }
                            }
                        } else {
                            this.$elem.css('left', elemOrig.pos.left + 'px');
                            if (!this.userAlreadyDefinedSize()) {
                                this.$elem.css('width', elemOrig.width + 'px');
                            }
                            switch (opts.range) {
                                case 'min': this.$elem.css('top', Math.round(elemOrig.pos.top + info.initialMargin + info.beginOffset) + 'px');
                                            break;
                                default:
                                    if (info.isRangeDefined) {
                                        this.$elem.css({
                                            'top': Math.round(elemOrig.pos.top + info.fromPixel + info.initialMargin) + 'px',
                                            'height': Math.round(info.toPixel - info.fromPixel + 1) + 'px'
                                        });
                                    }
                            }
                        }
                    }
                }
            },
            
            // content inside the handle(s), which might include also the range(s)
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
                        'margin-left': 0,
                        'margin-top': 0,
'background-color': '#bfb'
                    });

                    if (info.useDoubleHandles) {
                        this.$elem2nd = this.$elem1st.clone();
                    }
                },
                
                initCanvasHandle: function () {
                    this.$elem1st = $("<canvas>").attr({
                        'width': this.width + 'px',
                        'height': this.height + 'px'
                    }).css({
                        'margin-left': 0,
                        'margin-top': 0,
                    });
                    if (opts.handle.onDrawRuler) {
                        opts.handle.onDrawRuler($origBar, this.$elem1st[0], this.width, this.height);
                    } else {
                        if (this.$elem1st[0].getContext) {
                            var pixelOffsets = util.initCanvas(this.$elem1st[0].getContext('2d'), this.width, this.height, opts.handle.zoom);
                            if (opts.showRuler === 'handle') {
                                info.beginOffset = pixelOffsets.pixelStart / opts.handle.zoom;
                                info.endOffset = pixelOffsets.pixelEnd / opts.handle.zoom;
                            }
                        }
                    }
                    
                    if (info.useDoubleHandles) {
                        var imageData = this.$elem1st[0].getContext('2d').getImageData(0, 0, this.width, this.height);
                        this.$elem2nd = this.$elem1st.clone();
                        this.$elem2nd[0].getContext('2d').putImageData(imageData, 0, 0);
                    }
                },
                init: function () {
                    if (opts.showRuler === true || opts.showRuler === 'handle') {
                        this.initCanvasHandle();
                    } else {
                        this.initClone();
                    }
                },
                initRanges: function () {
                    if (info.isRangeDefined || opts.range === 'min' || opts.range === 'max') {
                        var createMagnifRange = function () {
                            var scale = 'scale(' + opts.handle.zoom + ')';
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
                                'position': 'static',
                                'z-index': ''
                            });
                        };
                        
                        this.$elemRange1st = createMagnifRange();
                        if (info.useDoubleHandles) {
                            this.$elemRange2nd = createMagnifRange();
                        } else {
                            if (opts.range === 'max') {
                                this.$elemRange1st.css('margin-left', getHandleHotPoint(this.$elemRange1st));
                            }
                        }
                    }
                },
                adjustRangesPos: function () {
                    var pos = info.isHoriz ? this.$elemRange1st.position().top : this.$elemRange1st.position().left,
                        userMargin = util.toFloat(this.$elemRange1st.css(info.isHoriz ? 'margin-top' : 'margin-left'));
                    this.$elemRange1st.css((info.isHoriz ? 'margin-top' : 'margin-left'), (userMargin * opts.handle.zoom - pos) + 'px');
                },
                move: function (isFirst, valuePixel, offset) {
                    switch (opts.range) {
                        case 'min': if (isFirst) { 
                                        elemRange.$elem.css(info.isHoriz ? 'width' : 'height', valuePixel + 'px');
                                        if (info.isHoriz) {
                                            this.$elemRange1st.css({
                                                'left': Math.round(offset + info.beginOffset * opts.handle.zoom) + 'px',
                                                'width': Math.round(valuePixel) + 'px'
                                            });
                                        } else {
                                            this.$elemRange1st.css({
                                                'top': Math.round(offset + info.beginOffset * opts.handle.zoom) + 'px',
                                                'height': Math.round(valuePixel) + 'px'
                                            });
                                        }
                                    }
                                    break;
                        case 'max': if (!info.useDoubleHandles || info.useDoubleHandles && !isFirst) {
                                        if (info.isHoriz) {
                                            var wid = Math.round(elemOrig.outerWidth - valuePixel - info.beginOffset - info.endOffset) + 1;
                                            elemRange.$elem.css({
                                                'left': (elemOrig.pos.left + valuePixel + info.beginOffset) + 'px',
                                                'width': wid + 'px'
                                            });
                                            (info.useDoubleHandles ? this.$elemRange2nd : this.$elemRange1st).css('width', wid + 'px');
                                        } else {
                                            var heig = Math.round(elemOrig.outerHeight - valuePixel - info.beginOffset - info.endOffset) + 1;
                                            elemRange.$elem.css({
                                                'top': (elemOrig.pos.top + valuePixel + info.beginOffset) + 'px',
                                                'height': heig + 'px'
                                            });
                                            (info.useDoubleHandles ? this.$elemRange2nd : this.$elemRange1st).css('height', heig + 'px');
                                        }
                                    }
                                    break;
                        case true:  if (info.isHoriz) {
                                        var left = elemOrig.pos.left + (info.currValue[0] - opts.min) * info.ticksStep + info.beginOffset;
                                        elemRange.$elem.css({
                                            'left': left + 'px',
                                            'width': (elemOrig.pos.left + (info.currValue[1] - opts.min) * info.ticksStep + info.beginOffset - left) + 'px'
                                        });
                                    } else {
                                        var top = elemOrig.pos.top + (info.currValue[0] - opts.min) * info.ticksStep + info.beginOffset;
                                        elemRange.$elem.css({
                                            'top': top + 'px',
                                            'height': (elemOrig.pos.top + (info.currValue[1] - opts.min) * info.ticksStep + info.beginOffset - top) + 'px'
                                        });
                                    }
                    }
                    (isFirst ? this.$elem1st : this.$elem2nd).css(info.isHoriz? 'margin-left' : 'margin-top', offset + 'px');
                    if (info.isRangeDefined) {
                        (isFirst ? this.$elemRange1st : this.$elemRange2nd).css(info.isHoriz? 'margin-left' : 'margin-top', (offset + info.fromPixel * opts.handle.zoom) + 'px');
                    }
                }
            },
            
            // the handle
            elemHandle = {
                $elem1st: null,
                $elem2nd: null,
                width: 0,
                height: 0,
                init: function () {
                    this.width = elemOrig.outerWidth * opts.handle.zoom;
                    this.height = elemOrig.outerHeight * opts.handle.zoom;
                    var cssCommon = {
                        'opacity': 0.8,                        
                        'position': 'absolute',
                        'z-index': util.toInt($origBar.css('z-index')) + 2
                    }, cssCommonMiddle = {
                        'overflow': 'hidden',
                        'border-top-left-radius': '20px'
                    }, cssOrient;
                    cssCommonMiddle[info.isHoriz ? 'height' : 'width'] = (info.isHoriz ? this.height : this.width) + 'px';
                    
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
                    this.$elem1st = elemMagnif.$elem1st.add(elemMagnif.$elemRange1st).wrapAll("<div>").parent().css(cssCommonMiddle).wrap("<div>").parent().css(cssCommon).css(cssOrient);
                    if (info.useDoubleHandles) {
                        this.$elem2nd = elemMagnif.$elem2nd.add(elemMagnif.$elemRange2nd).wrapAll("<div>").parent().css(cssCommonMiddle).wrap("<div>").parent().css(cssCommon).css(cssOrient);
                    }
                }
            },

            info = {
                currValue: [0, 0], // Values for both handles. When only one handle is used, the currValue[1] is ignored
                ticksStep: 0,
                isHoriz: elemOrig.width >= elemOrig.height,
                initialMargin: 0,
                fromPixel: 0,
                toPixel: 0,
                beginOffset: 0,
                endOffset: 0,
                useDoubleHandles: !!opts.value && (typeof opts.value === 'object') && opts.value.length === 2,
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
                    if (info.useDoubleHandles) {
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

                        if (info.useDoubleHandles) {
                            checkValueArray(opts.value, opts.range[0], opts.range[1]);
                        } else {
                            checkValue(opts.range[0], opts.range[1]);
                        }
                    } else {
                        if (info.useDoubleHandles) {
                            checkValueArray(opts.value, opts.min, opts.max);
                        } else {
                            checkValue(opts.min, opts.max);
                        }
                    }
                },
                init: function () {
                    this.checkBounds();
                    this.ticksStep = (Math.max(elemOrig.outerWidth, elemOrig.outerHeight) - info.beginOffset - info.endOffset) / (opts.max - opts.min);
                    this.fromPixel = (info.isRangeDefined ? opts.range[0] - opts.min : 0) * this.ticksStep + info.beginOffset;
                    this.toPixel = ((info.isRangeDefined ? opts.range[1] : opts.max) - opts.min) * this.ticksStep + info.beginOffset;
                    this.initialMargin = (this.isHoriz ? util.toInt($origBar.css('margin-left')) : util.toInt($origBar.css('margin-top')));
                }
            },

            init = function () {
                elemOrig.init();
                elemMagnif.init();
                info.init();
                elemRange.init();
                elemMagnif.initRanges();
                elemHandle.init();
                $origBar.after(elemHandle.$elem2nd).after(elemHandle.$elem1st).after(elemRange.$elem).after(elemOrig.$canvas);
                elemMagnif.adjustRangesPos();
                
                // disable user text selection
                $origBar.
                    add(elemOrig.$canvas).
                    add(elemRange.$elem).
                    add(elemMagnif.$elem1st).
                    add(elemMagnif.$elem2nd).
                    add(elemMagnif.$elemRange1st).
                    add(elemMagnif.$elemRange2nd).
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

                $origBar.add(elemOrig.$canvas).add(elemRange.$elem).mousedown(panUtil.startDrag).mouseup(panUtil.stopDrag);
                
                elemHandle.$elem1st.mousedown(panUtil.startDragFromHandle1st).mouseup(panUtil.stopDrag);

                // to prevent the default behaviour in IE when dragging an element
                $origBar[0].ondragstart = elemMagnif.$elem1st[0].ondragstart = elemHandle.$elem1st[0].ondragstart =
                $origBar[0].onselectstart = elemMagnif.$elem1st[0].onselectstart = elemHandle.$elem1st[0].onselectstart = function () { return false; };
                var noIEdrag = function(elem) {
                    if (elem) { elem[0].ondragstart = elem[0].onselectstart = function () { return false; }; }
                };
                noIEdrag(elemOrig.$canvas);
                noIEdrag(elemRange.$elem);
                noIEdrag(elemMagnif.$elemRange1st);
                
                if (info.useDoubleHandles) {
                    elemMagnif.$elem2nd[0].ondragstart = elemHandle.$elem2nd[0].ondragstart =
                    elemMagnif.$elem2nd[0].onselectstart = elemHandle.$elem2nd[0].onselectstart = function () { return false; };
                    noIEdrag(elemMagnif.$elemRange2nd);
                    elemHandle.$elem2nd.mousedown(panUtil.startDragFromHandle2nd).mouseup(panUtil.stopDrag);
                }
            },
            getHandleHotPoint = function ($handleElem) {
                if (info.useDoubleHandles) {
                    if ($handleElem === elemHandle.$elem1st) {
                        // top/left handle: measure point is located on the handle bottom/right side
                        return opts.handle.size;
                    } else {
                        // bottom/right handle: measure point is located on the handle up/left side
                        return 0;
                    }
                }
                // one handle: measure point is located on the handle center
                return opts.handle.size / 2;
            },
            getHandlePos = function (valuePixel, $handleElem) {
                return valuePixel + info.initialMargin - getHandleHotPoint($handleElem);
            },
            setValuePixel = function (value, $handleElem) { // value is a zero based pixel value
                var canSet = function (v) {
                    if (info.useDoubleHandles) {
                        if ($handleElem === elemHandle.$elem1st) {
                            return v >= info.fromPixel && v <= (info.currValue[1] - opts.min) * info.ticksStep + info.beginOffset;
                        } else {
                            return v >= ((info.currValue[0] - opts.min) * info.ticksStep + info.beginOffset) && v <= info.toPixel + info.endOffset;
                        }
                    } else {
                        return v >= info.fromPixel && v <= info.toPixel + info.endOffset;
                    }
                };
                if (canSet(value + info.beginOffset)) {
                    setValueTicks(value / info.ticksStep + opts.min, $handleElem);
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
            setValueTicks = function (value, $handleElem) {
                var valueNoMin = value - opts.min;
                valueNoMin = info.isStepDefined ? Math.round(valueNoMin / opts.step) * opts.step : valueNoMin;
                valueNoMin = checkLimits(valueNoMin + opts.min) - opts.min;
                
                var valuePixel = Math.round(valueNoMin * info.ticksStep),
                    $magnifElem = $handleElem === elemHandle.$elem1st? elemMagnif.$elem1st : elemMagnif.$elem2nd;
                
                info.currValue[$handleElem === elemHandle.$elem2nd ? 1 : 0] = valueNoMin + opts.min;
                if (info.isHoriz) {
                    $handleElem.css({
                        'left': (elemOrig.pos.left + info.beginOffset + getHandlePos(valuePixel, $handleElem)) + 'px'
                    });
                    elemMagnif.move($handleElem === elemHandle.$elem1st, valuePixel, getHandleHotPoint($handleElem) - info.initialMargin - (info.beginOffset + valuePixel) * opts.handle.zoom);
                } else {
                    $handleElem.css({
                        'top': (elemOrig.pos.top + info.beginOffset + getHandlePos(valuePixel, $handleElem)) + 'px'
                    });
                    elemMagnif.move($handleElem === elemHandle.$elem1st, valuePixel, getHandleHotPoint($handleElem) - info.initialMargin - (info.beginOffset + valuePixel) * opts.handle.zoom);
                }
                if (opts.onChange) {
                    opts.onChange($origBar, info.currValue[$handleElem === elemHandle.$elem2nd ? 1 : 0], $handleElem === elemHandle.$elem1st, valuePixel);
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
                                height: fontData.size * zoom,
                                contextFont:
                                    ((!!opts.ruler.values.font ? opts.ruler.values.font.substring(0, fontData.sizePos) + ' ' : '') +
                                    fontData.size * zoom + fontData.type + ' ' +
                                    (!!opts.ruler.values.font ? opts.ruler.values.font.substring(fontData.sizePos + fontSize[0].length + 1) : ' arial')).trim()
                            };
                        },
                        fontData = getFontData(),
                        drawTick = function (i, longerMark, posMiddle) {
                            i = Math.round(i) + 0.5;
                            var offset = [0, 0];
                            if (Math.abs(opts.ruler.values.relativePos - opts.ruler.tickMarks.relativePos) < 0.005) {
                                // values and tick marks on the relative position
                                offset[0] = offset[1] = (longerMark ? opts.ruler.tickMarks.sizeBig : opts.ruler.tickMarks.sizeSmall) / 2 * zoom;
                            } else { 
                                if (opts.ruler.values.relativePos > opts.ruler.tickMarks.relativePos) {
                                    // values below tick marks (or, in case of vertical sliders, values right to tick marks)
                                    offset[0] = opts.ruler.tickMarks.sizeBig / 2 * zoom;
                                    offset[1] = (longerMark ? opts.ruler.tickMarks.sizeBig / 2 : opts.ruler.tickMarks.sizeSmall - opts.ruler.tickMarks.sizeBig / 2) * zoom;
                                } else {
                                    // values above tick marks (or, in case of vertical sliders, values left to tick marks)
                                    offset[0] = (longerMark ? opts.ruler.tickMarks.sizeBig / 2 : opts.ruler.tickMarks.sizeSmall - opts.ruler.tickMarks.sizeBig / 2) * zoom;
                                    offset[1] = opts.ruler.tickMarks.sizeBig / 2 * zoom;
                                }
                            }
                            if (info.isHoriz) {
                                ctx.moveTo(i, posMiddle - offset[0]);
                                ctx.lineTo(i, posMiddle + offset[1]);
                            } else {
                                ctx.moveTo(posMiddle - offset[0], i);
                                ctx.lineTo(posMiddle + offset[1], i);
                            }
                        },
                        getFormatedNum = function (num) {
                            return opts.ruler.values.onFmtValue ? opts.ruler.values.onFmtValue($origBar, num) : num;
                        };
                        
                    ctx.font = fontData.contextFont;
                    ctx.fillStyle = opts.ruler.values.fillStyle;
                    ctx.strokeStyle = opts.ruler.tickMarks.strokeStyle;
                    ctx.lineWidth = zoom;
                    var fmtMin = fmtMax = null,
                        from = curr = deltaStart = deltaEnd = lastLabel = 0,
                        lastLabel = to = info.isHoriz ? width : height;
                        
                    if (opts.ruler.values.show) {
                        fmtMin = getFormatedNum(opts.min);
                        fmtMax = getFormatedNum(opts.max);
                        from = curr = info.isHoriz ? ctx.measureText(fmtMin).width : fontData.height;
                        deltaStart = from / 2;
                        deltaEnd = (info.isHoriz ? ctx.measureText(fmtMax).width : fontData.height) / 2;
                        lastLabel -= deltaEnd * 2;
                        to -= deltaEnd;
                    }
                    var tickMarkRate = ((info.isHoriz ? width : height) - deltaStart - deltaEnd) / (opts.max - opts.min),
                        pixelStep = info.isStepDefined ? tickMarkRate * opts.step : zoom * 2,
                        spaceForLabels = info.isHoriz ? fontData.height : Math.max(ctx.measureText(fmtMin).width, ctx.measureText(fmtMax).width),
                        textRelativePos = (info.isHoriz ? spaceForLabels : 0) + ((info.isHoriz ? height : width) - spaceForLabels) * opts.ruler.values.relativePos;
                        tickMarkRelativePos = opts.ruler.tickMarks.sizeBig / 2 * zoom + ((info.isHoriz ? height : width) - opts.ruler.tickMarks.sizeBig * zoom) * opts.ruler.tickMarks.relativePos;
                    if (opts.ruler.values.show) {
                        info.isHoriz ? ctx.fillText(fmtMin, 0, textRelativePos) : ctx.fillText(fmtMin, textRelativePos, fontData.height);
                    }
                    for (var i = deltaStart, longerMark = true, cond = true; cond; i += pixelStep) {
                        var num = (i - deltaStart) / tickMarkRate + opts.min;
                        if (info.isStepDefined) {
                            num = util.roundNtoMultipleOfM(num - opts.min, opts.step) + opts.min;
                        }
                        num = util.roundToDecimalPlaces(num, opts.ruler.values.decimals);

                        var fmtNum = opts.ruler.values.onFmtValue ? opts.ruler.values.onFmtValue($origBar, num) : num,
                            textPos = info.isHoriz ? ctx.measureText(fmtNum).width / 2 : deltaStart; // for vertical sliders deltaStart is half of text height
                        
                        if (opts.ruler.values.show) {
                            var doText = // if there is enough space (4px) that would separate this label from the previous one
                                        i - textPos - curr > 4 * zoom && 
                                        // and there is enough space to the last label
                                        lastLabel - i - textPos > 4 * zoom;

                            // only shows a label, if multiple of tryShowEvery (if defined)
                            if (doText && !!opts.ruler.values.tryShowEvery) {
                                var everyValue = Math.abs((num - opts.min) % opts.ruler.values.tryShowEvery);
                                doText = everyValue < 0.00005 && i - deltaStart > 0.00005;
                            }

                            if (doText) {
                                info.isHoriz ? ctx.fillText(fmtNum, i - textPos, textRelativePos) : ctx.fillText(fmtNum, textRelativePos, i - textPos + fontData.height);
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
                        info.isHoriz ? ctx.fillText(fmtMax, lastLabel, textRelativePos) : ctx.fillText(fmtMax, textRelativePos, lastLabel + fontData.height);
                    }
                    ctx.stroke();
                    return { pixelStart: deltaStart, pixelEnd: deltaEnd };
                }
            },
            panUtil = {
                noDrag: false,
                dragDelta: 0,
                $handle: null, // handle currently being dragged
                animDone: function (value) {
                    setValuePixel(value + panUtil.dragDelta, panUtil.$handle);
                    if (!panUtil.noDrag) {
                        $("body, html")
                            .bind('mousemove.rsSliderLens', info.isHoriz ? panUtil.dragHoriz : panUtil.dragVert)
                            .bind('mouseup.rsSliderLens', panUtil.stopDrag);
                    }
                },
                startDrag: function (event) {
                    var to = info.isHoriz ? event.pageX - elemOrig.pos.left : event.pageY - elemOrig.pos.top,
                        from;
                    if (!info.useDoubleHandles || to <= ((info.currValue[0] + info.currValue[1]) / 2 - opts.min) * info.ticksStep) {
                        panUtil.$handle = elemHandle.$elem1st;
                        from = (info.currValue[0] - opts.min) * info.ticksStep;
                    } else {
                        panUtil.$handle = elemHandle.$elem2nd;
                        from = (info.currValue[1] - opts.min) * info.ticksStep;
                    }
                    panUtil.noDrag = false;

                    if (from !== to) {
                        $({ n: from }).animate({ n: to }, {
                            duration: opts.handle.animation,
                            step: function (now) {
                                setValuePixel(now, panUtil.$handle);
                            },
                            complete: function () {
                                panUtil.animDone(to);
                            }
                        });
                    } else {
                        panUtil.animDone(to);
                    }
                },
                startDragFromHandle: function (event, $elemHandle) {
                    panUtil.$handle = $elemHandle;
                    var from = (info.currValue[$elemHandle === elemHandle.$elem1st ? 0 : 1] - opts.min) * info.ticksStep,
                        to = info.isHoriz ? event.pageX - elemOrig.pos.left : event.pageY - elemOrig.pos.top;
                    panUtil.noDrag = false;
                    panUtil.dragDelta = from - to;
                    panUtil.animDone(to);
                },
                startDragFromHandle1st: function (event) {
                    panUtil.startDragFromHandle(event, elemHandle.$elem1st);
                },
                startDragFromHandle2nd: function (event) {
                    panUtil.startDragFromHandle(event, elemHandle.$elem2nd);
                },
                dragHoriz: function (event) {
                    setValuePixel(event.pageX - elemOrig.pos.left + panUtil.dragDelta, panUtil.$handle);
                },
                dragVert: function (event) {
                    setValuePixel(event.pageY - elemOrig.pos.top + panUtil.dragDelta, panUtil.$handle);
                },
                stopDrag: function (event) {
                    panUtil.noDrag = true;
                    $("body, html").unbind('mousemove.rsSliderLens mouseup.rsSliderLens');
                    panUtil.dragDelta = 0;
                }
            };

        init();
        if (info.useDoubleHandles) {
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
        value: 0, // Number or a two number array.
                  // When a single number is used, only a single handle is shown. When a two number array is used (e.g. [5, 20]) two handles are shown.
        min: 0,   // first value in the slider
        max: 100, // last value in the slider
        step: 0,  // Determines the amount of each interval the slider takes between min and max. Use 0 to disable step. 
                  // For example, if min = 0, max = 1 and step = 0.25, then the user can only select 0, 0.25, 0.5, 0.75 and 1 values.
        range: false,   // false - no range.
                        // true - range between current handles. Only meaningful for double handles.
                        // "min" - Highlights range between min and the first handle
                        // "max" - Highlights range between handle and max, or, when two handles are used, between second handle and max.
                        // [from, to] - Defines a range that restricts the input to the interval [from, to] and highlights such interval.
                        //              For example, if min = 20 and max = 100 and range = [50, 70], then it is not possible to select values smaller than 50 or greater than 70
                        // The style of this bar is defined by the classHighlightRange parameter
        style: {
            classHighlightRange: 'sliderlens-range' // Style used to highlight range
        },
        
        // handle is the cursor that the user can drag around to select values
        handle: {
            size: 50,   // Size of handle is pixels. For horizontal sliders, it is handle width. For vertical sliders, it is handle height.
            zoom: 1.5,  // Magnification factor applied inside the handle.
            relativePos: 0.5,   // Floating point number between 0 and 1 that indicates the handle relative (0% - 100%) position.
                                // For horizontal sliders, a value of 0 aligns handle to the top, 1 aligns it to the bottom.
                                // For vertical sliders, a value of 0 aligns handle to the left, 1 aligns it to the right.
            animation: 200,     // Duration (ms) of animation that happens when handle needs to move to a different location (triggered by a mouse click on the slider)
            onDrawRuler: null
        },
        showRuler: false, // false - Original content appears outside handle. Magnified original content appears inside handle.
                          // true - Ruler appears outside handle. Magnified ruler appears inside handle.
                          // 'handle' - Original content appears outside handle. Magnified ruler appears inside handle.
        onDrawRuler: null,
        ruler: {
            values: {
                show: true,
                font: '10px arial',
                fillStyle: 'black',
                relativePos: 0,
                tryShowEvery: null,
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