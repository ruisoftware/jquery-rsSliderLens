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
                    var ctx = this.$canvas[0].getContext('2d');
                    ctx.scale(1 / opts.handle.zoom, 1 / opts.handle.zoom);
                    ctx.drawImage(elemMagnif.$elem1st[0], 0, 0);
                    $origBar.hide(); // because the ruler is used instead of the original slider
                },
                init: function () {
                    this.outerWidth = $origBar.outerWidth() - util.toInt($origBar.css('border-left-width')) - util.toInt($origBar.css('border-right-width'));
                    this.outerHeight = $origBar.outerHeight() - util.toInt($origBar.css('border-top-width')) - util.toInt($origBar.css('border-bottom-width'));
                }
            },

            // range that appears outside the handle
            elemRange = {
                $elem: null,
                width: 0,
                height: 0,
                // returns the width or height that the user defined in the class classHighlightRange. If user did not defined, returns zero.
                getUserDefinedFixedSize: function () {
                    var $inspector = $("<div>").css('display', 'none').addClass(opts.style.classHighlightRange);
                    $("body").append($inspector); // add to DOM, in order to read the CSS property
                    try {
                        return util.toFloat($inspector.css(info.isHoriz ? 'height' : 'width'));
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
                        var userFixedSize = this.getUserDefinedFixedSize();
                        
                        if (info.isHoriz) {
                            this.$elem.css('top', elemOrig.pos.top + 'px');
                            if (Math.abs(userFixedSize) < 0.0005) {
                                this.height = elemOrig.height;
                                this.$elem.css('height', this.height + 'px');
                            } else {
                                this.height = userFixedSize;
                            }
                            
                            switch (opts.range) {
                                case 'min': this.$elem.css('left', Math.round(elemOrig.pos.left + info.initialMargin + info.beginOffset) + 'px');
                                            break;
                                default:
                                    if (info.isRangeDefined) {
                                        this.width = Math.round(info.toPixel - info.fromPixel);
                                        this.$elem.css({
                                            'left': Math.round(elemOrig.pos.left + info.fromPixel + info.initialMargin) + 'px',
                                            'width': this.width + 'px'
                                        });
                                    }
                            }
                        } else {
                            this.$elem.css('left', elemOrig.pos.left + 'px');
                            if (Math.abs(userFixedSize) < 0.0005) {
                                this.width = elemOrig.width;
                                this.$elem.css('width', this.width + 'px');
                            } else {
                                this.width = userFixedSize;
                            }
                            switch (opts.range) {
                                case 'min': this.$elem.css('top', Math.round(elemOrig.pos.top + info.initialMargin + info.beginOffset) + 'px');
                                            break;
                                default:
                                    if (info.isRangeDefined) {
                                        this.height = Math.round(info.toPixel - info.fromPixel);
                                        this.$elem.css({
                                            'top': Math.round(elemOrig.pos.top + info.fromPixel + info.initialMargin) + 'px',
                                            'height': this.height + 'px'
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
                    this.$elem1st = $origBar.clone().removeAttr('id').removeAttr('class').css({
                        'z-index': util.toInt($origBar.css('z-index')) + 2,
                        'width': elemOrig.width + 'px',
                        'height': elemOrig.height + 'px',
                        'margin-left': 0,
                        'margin-top': 0,
                        'position': 'static'
                    });
                    
                    if (info.isInputTypeRange) {
                        this.$elem1st.removeAttr('name');
                    }
                    
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
                        'float': 'left',
                        'width': this.width + 'px',
                        'height': this.height + 'px'
                    });
                    
                    if (!this.$elem1st[0].getContext) {
                        return false; // browser does not support canvas
                    }
                    var ctx = this.$elem1st[0].getContext('2d');
                    ctx.scale(opts.handle.zoom, opts.handle.zoom);
                    if (opts.handle.onDrawRuler) {
                        opts.handle.onDrawRuler($origBar, this.$elem1st[0], elemOrig.width, elemOrig.height);
                    } else {
                        var pixelOffsets = util.initCanvas(ctx, elemOrig.width, elemOrig.height);
                        info.beginOffset = pixelOffsets.pixelStart;
                        info.endOffset = pixelOffsets.pixelEnd;
                    }
                    if (opts.showRuler === true) {
                        elemOrig.initCanvasOutsideHandle();
                    }

                    if (info.useDoubleHandles) {
                        this.$elem2nd = this.$elem1st.clone();
                        this.$elem2nd[0].getContext('2d').drawImage(this.$elem1st[0], 0, 0);
                    }
                    return true;
                },
                init: function () {
                    if (info.hasRuler) {
                        if (this.initCanvasHandle()) { 
                            return;
                        }
                        // user wanted canvas, but browser does not support it, then fallback to non canvas
                        opts.showRuler = false;
                        info.hasRuler = false;
                    }
                    this.initClone();
                },
                initRanges: function () {
                    if (info.isRangeDefined || opts.range === 'min' || opts.range === 'max') {
                        var createMagnifRange = function () {
                        
                            return elemRange.$elem.clone().removeAttr('id').css({
                                'float': 'left',
                                'clear': 'left',
                                'width': (elemRange.width * (info.hasRuler ? opts.handle.zoom : 1)) + 'px',
                                'height': (elemRange.height * (info.hasRuler ? opts.handle.zoom : 1)) + 'px',
                                // clear these cloned properties, do not need them
                                'position': '',
                                'z-index': '',
                                'left': '',
                                'top': ''
                            });
                        };
                        
                        this.$elemRange1st = createMagnifRange();
                        if (info.useDoubleHandles) {
                            this.$elemRange2nd = createMagnifRange();
                        } else {
                            if (opts.range === 'max' && info.isHoriz) {
                                this.$elemRange1st.css('margin-left', getHandleHotPoint(this.$elemRange1st) / (info.hasRuler ? 1 : opts.handle.zoom));
                            }
                        }
                    }
                },
                adjustRangesPos: function () {
                    var adjustFor = function ($elemRange, idx, scaledChildren) {
                        if ($elemRange) { 
                            var prop = info.isHoriz ? 'margin-top' : 'margin-left',
                                userMargin = util.toFloat($elemRange.css(prop));
                            if (info.hasRuler) {
                                $elemRange.css(prop, (userMargin * opts.handle.zoom - (info.isHoriz ? $elemRange.position().top : 0)) + 'px');
                            } else {
                                $elemRange.css(prop, (userMargin - (info.isHoriz ? (scaledChildren ? ($elemRange.position().top - userMargin) /  opts.handle.zoom : $elemRange.position().top) : 0)) + 'px');
                            }
                        }
                    };
                    if (opts.range !== true && opts.range !== false) {
                        var scaledChildren = true;
                        if (!info.hasRuler) {
                            var cssScale = util.getScaleCss(opts.handle.zoom),
                                before = this.$elemRange1st.position().top;
                            
                            // this.$elemRange1st is a child of elemHandle.$elem1st, so by applying a scale transformation to elemHandle.$elem1st, 
                            // the child should also be scalled. I say "should" because while some browsers scale all children others not really
                            elemHandle.$elem1st.css(cssScale);
                            // and this determines whether the browser indeed scale all children 
                            var after = this.$elemRange1st.position().top;
                            // this problem happens for horizontal sliders only
                            if (info.isHoriz && before === after) {
                                // before and after are the same, which means scale did not worked for children
                                scaledChildren = false;
                            }
                            if (info.useDoubleHandles) {
                                elemHandle.$elem2nd.css(cssScale);
                            }
                        }
                        adjustFor(this.$elemRange1st, 0, scaledChildren);
                        adjustFor(this.$elemRange2nd, 1, scaledChildren);
                    } else {
                        if (!info.hasRuler) {
                            elemHandle.$elem1st.add(elemHandle.$elem2nd).css(util.getScaleCss(opts.handle.zoom));
                        }
                    }
                },
                move: function (isFirst, valuePixel, offset) {
                    if (!info.hasRuler) {
                        offset /= opts.handle.zoom;
                    }
                    switch (opts.range) {
                        case 'min': if (isFirst) {
                                        elemRange.$elem.css(info.isHoriz ? 'width' : 'height', --valuePixel + 'px');
                                        if (info.isHoriz) {
                                            this.$elemRange1st.css({
                                                'margin-left': Math.round(info.beginOffset * opts.handle.zoom + offset) + 'px',
                                                'width': Math.round((valuePixel + 1) * (info.hasRuler ? opts.handle.zoom : 1)) + 'px'
                                            });
                                        } else {
                                            this.$elemRange1st.css({
                                                'margin-top': Math.round(info.beginOffset * opts.handle.zoom - (info.hasRuler ? this.height : elemOrig.height)) + 'px',
                                                'height': Math.round((valuePixel + 1) * (info.hasRuler ? opts.handle.zoom : 1)) + 'px'
                                            });
                                        }
                                    }
                                    break;
                        case 'max': if (!info.useDoubleHandles || info.useDoubleHandles && !isFirst) {
                                        if (info.isHoriz) {
                                            elemRange.$elem.css({
                                                'left': (elemOrig.pos.left + valuePixel + info.beginOffset) + 'px',
                                                'width': Math.round(elemOrig.outerWidth - valuePixel - info.beginOffset - info.endOffset) + 'px'
                                            });
                                            (info.useDoubleHandles ? this.$elemRange2nd : this.$elemRange1st).css('width', 
                                                (Math.round(elemOrig.outerWidth - valuePixel - info.beginOffset - info.endOffset) * (info.hasRuler ? opts.handle.zoom : 1)) + 'px');
                                        } else {
                                            elemRange.$elem.css({
                                                'top': (elemOrig.pos.top + valuePixel + info.beginOffset) + 'px',
                                                'height': Math.round(elemOrig.outerHeight - valuePixel - info.beginOffset - info.endOffset) + 'px'
                                            });
                                            (info.useDoubleHandles ? this.$elemRange2nd : this.$elemRange1st).css('height', 
                                                (Math.round(elemOrig.outerHeight - valuePixel - info.beginOffset - info.endOffset) * (info.hasRuler ? opts.handle.zoom : 1)) + 'px');
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
                        (isFirst ? this.$elemRange1st : this.$elemRange2nd).
                            css(info.isHoriz ? 'margin-left' : 'margin-top', (info.fromPixel * (info.hasRuler ? opts.handle.zoom : 1) + (info.isHoriz ? offset : - this.height / (info.hasRuler ? 1 : opts.handle.zoom))) + 'px');
                    } else {
                        if (opts.range === 'max' && !info.isHoriz) {
                            (isFirst ? this.$elemRange1st : this.$elemRange2nd).css('margin-top', (- this.height / (info.hasRuler ? 1 : opts.handle.zoom) - offset + getHandleHotPoint(isFirst ? this.$elemRange1st : this.$elemRange2nd) / (info.hasRuler ? 1 : opts.handle.zoom)) + 'px');
                        }
                    }   
                }
            },
            
            // the handle
            elemHandle = {
                $elem1st: null,
                $elem2nd: null,
                width: 0,
                height: 0,
                stopPosition: [0, 0], // only applicable for double handles:
                                      // For horizontal slider, stopPosition[0] is the rightmost pos for the left handle, stopPosition[1] is the leftmost pos for the right handle
                                      // For vertical slider, stopPosition[0] is the bottommost pos for the top handle, stopPosition[1] is the topmost pos for the bottom handle
                init: function () {
                    this.width = elemOrig.outerWidth * (info.hasRuler ? opts.handle.zoom : 1);
                    this.height = elemOrig.outerHeight * (info.hasRuler ? opts.handle.zoom : 1);
                    var cssCommon = {
                        'position': 'absolute',
                        'z-index': util.toInt($origBar.css('z-index')) + 2
                    }, cssCommonMiddle = {
                        'overflow': 'hidden',
                        'background-color': '#bfb',
                        'width': 0, // defined below
                        'height': 0 // defined below
                    }, cssOrient,
                    handleSize = opts.handle.size / (info.hasRuler ? 1 : opts.handle.zoom);
                    
                    if (info.isHoriz) {
                        cssCommonMiddle.width = handleSize + 'px';
                        cssCommonMiddle.height = this.height + 'px';
                        cssOrient = {
                            'width': handleSize + 'px',
                            'height': this.height + 'px',
                            'top': (elemOrig.pos.top - (elemMagnif.height - elemOrig.height) * opts.handle.relativePos) + 'px'
                        };
                    } else {
                        cssCommonMiddle.width = this.width + 'px';
                        cssCommonMiddle.height = handleSize + 'px';
                        cssOrient = {
                            'width': this.width + 'px',
                            'height': handleSize + 'px',
                            'left': (elemOrig.pos.left - (elemMagnif.width - elemOrig.width) * opts.handle.relativePos) + 'px'
                        };
                    }
                    this.$elem1st = elemMagnif.$elem1st.add(elemMagnif.$elemRange1st).wrapAll("<div>").parent().
                        addClass(this.getHandleClass(true)).css(cssCommonMiddle).wrap("<div>").parent().
                        css(cssCommon).css(cssOrient);
                        
                    if (info.useDoubleHandles) {
                        this.$elem2nd = elemMagnif.$elem2nd.add(elemMagnif.$elemRange2nd).wrapAll("<div>").parent().
                            addClass(this.getHandleClass(false)).css(cssCommonMiddle).wrap("<div>").parent().
                            css(cssCommon).css(cssOrient);
                    }
                },
                getHandleClass: function (isFirstHandle) {
                    var classes;
                    if (info.useDoubleHandles) {
                        if (isFirstHandle) {
                            classes = info.isHoriz ? opts.style.classHorizHandle1 : opts.style.classVertHandle1;
                        } else {
                            classes = info.isHoriz ? opts.style.classHorizHandle2 : opts.style.classVertHandle2;
                        }
                    } else {
                        classes = info.isHoriz ? opts.style.classSingleHorizHandle : opts.style.classSingleVertHandle;
                    }
                    return info.isEnabled ? classes : classes + ' ' + opts.style.classDisabled;
                },
                setPos: function (isFirstHandle, pos) {
                    if (isFirstHandle) {
                        this.$elem1st.css(info.isHoriz ? 'left' : 'top', pos + 'px');
                        this.stopPosition[0] = Math.round(pos + opts.handle.size - (info.isHoriz ? elemOrig.pos.left : elemOrig.pos.top));
                    } else {
                        this.$elem2nd.css(info.isHoriz ? 'left' : 'top', pos + 'px');
                        this.stopPosition[1] = Math.round(pos - (info.isHoriz ? elemOrig.pos.left : elemOrig.pos.top));
                    }
                }
            },
            events = {
                onGotoPos: function (event, optsGoto) {
                    // setting a value for the second handle, only makes sense for double handle sliders
                    if (!info.useDoubleHandles && !optsGoto.firstHandle) {
                        optsGoto.firstHandle = true;
                    }
                    if (optsGoto.firstHandle) {
                        setValueTicks(optsGoto.value, opts.reversed && info.useDoubleHandles ? elemHandle.$elem2nd : elemHandle.$elem1st);
                    } else {
                        setValueTicks(optsGoto.value, opts.reversed && info.useDoubleHandles ? elemHandle.$elem1st : elemHandle.$elem2nd);
                    }
                }
            },
            info = {
                currValue: [0, 0], // Values for both handles. When only one handle is used, the currValue[1] is ignored
                ticksStep: 0,
                isInputTypeRange: false, // whether the markup for this plugin in an <input type="range">
                isHoriz: elemOrig.width >= elemOrig.height,
                isEnabled: true,
                initialMargin: 0,
                fromPixel: 0,
                toPixel: 0,
                beginOffset: 0,
                endOffset: 0,
                useDoubleHandles: !!opts.value && (typeof opts.value === 'object') && opts.value.length === 2,
                isRangeDefined: !!opts.range && (typeof opts.range === 'object') && opts.range.length === 2,
                isStepDefined: opts.step > 0.00005,
                isIE9: $.browser.msie && parseInt($.browser.version) === 9,
                hasRuler: opts.showRuler === true || opts.showRuler === 'handle',
                getCurrValue: function (value) {
                    if (opts.reversed) {
                        return opts.max - value + opts.min;
                    } else {
                        return value;
                    }
                },
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
                    this.isEnabled = !opts.disabled;
                    this.checkBounds();
                    this.ticksStep = (Math.max(elemOrig.outerWidth, elemOrig.outerHeight) - info.beginOffset - info.endOffset) / (opts.max - opts.min);
                    if (info.isRangeDefined) {
                        if (opts.reversed) {
                            this.fromPixel = (opts.max - opts.range[1]) * this.ticksStep + info.beginOffset;
                            this.toPixel = (opts.max - opts.range[0]) * this.ticksStep + info.beginOffset;
                        } else {
                            this.fromPixel = (opts.range[0] - opts.min) * this.ticksStep + info.beginOffset;
                            this.toPixel = (opts.range[1] - opts.min) * this.ticksStep + info.beginOffset;
                        }
                    } else {
                        this.fromPixel = info.beginOffset;
                        this.toPixel = (opts.max - opts.min) * this.ticksStep + info.beginOffset;
                    }
                    this.initialMargin = (this.isHoriz ? util.toInt($origBar.css('margin-left')) : util.toInt($origBar.css('margin-top')));
                }
            },
            overrideInputRangeOpts = function () {
                info.isInputTypeRange = $origBar.is("input[type=range]");
                if (info.isInputTypeRange) {
                    var attrValue = $origBar.attr('value');
                    if (attrValue !== undefined) {
                        opts = $.extend({}, opts, {value: util.toFloat(attrValue)});
                    }
                    attrValue = $origBar.attr('min');
                    if (attrValue !== undefined) {
                        opts = $.extend({}, opts, {min: util.toFloat(attrValue)});
                    }
                    attrValue = $origBar.attr('max');
                    if (attrValue !== undefined) {
                        opts = $.extend({}, opts, {max: util.toFloat(attrValue)});
                    }
                    attrValue = $origBar.attr('step');
                    if (attrValue !== undefined) {
                        opts = $.extend({}, opts, {step: util.toFloat(attrValue)});
                    }
                    attrValue = $origBar.attr('disabled');
                    if (attrValue !== undefined) {
                        opts = $.extend({}, opts, {disabled: true});
                    }
                }
            },
            init = function () {
                if (info.useDoubleHandles) {
                    opts.handle.size /= 2.0;
                }
                overrideInputRangeOpts();
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
                    }).
                    bind('gotoSingle.rsSliderLens', events.onGotoPos);

                if (opts.dragRange && (info.useDoubleHandles && opts.range === true || info.isRangeDefined)) {
                    elemRange.$elem.mousedown(panRangeUtil.startDrag).mouseup(panRangeUtil.stopDrag).click(panRangeUtil.click);
                } else {
                    if (!!opts.range) {
                        elemRange.$elem.mousedown(panUtil.startDrag).mouseup(panUtil.stopDrag);
                    }
                }
                
                $origBar.add(elemOrig.$canvas).mousedown(panUtil.startDrag).mouseup(panUtil.stopDrag);
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
                            return v >= info.fromPixel - 1 && v <= elemHandle.stopPosition[1] + (!!opts.showRuler ? 1 : 2);
                        } else {
                            return v >= elemHandle.stopPosition[0] - (!!opts.showRuler ? 0 : 1) && v <= info.toPixel + 1;
                        }
                    } else {
                        return v >= info.fromPixel - 1 && v <= info.toPixel + 1;
                    }
                };
                if (canSet(value + info.beginOffset)) {
                    setValueTicks(value / info.ticksStep + opts.min, $handleElem);
                }
            },
            checkLimits = function (value) {
                var limit = info.isRangeDefined ? info.getCurrValue(opts.range[opts.reversed ? 1 : 0]) : opts.min;
                if (value < limit) {
                    return limit;
                } else {
                    limit = info.isRangeDefined ? info.getCurrValue(opts.range[opts.reversed ? 0 : 1]) : opts.max;
                    if (value > limit) {
                        return limit;
                    }
                }
                return value;
            },
            setValueTicks = function (value, $handleElem) {
                var valueNoMin = value - opts.min,
                    isFirstHandle = $handleElem === elemHandle.$elem1st;
                valueNoMin = info.isStepDefined ? Math.round(valueNoMin / opts.step) * opts.step : valueNoMin;
                valueNoMin = checkLimits(valueNoMin + opts.min) - opts.min;
                
                var valuePixel = Math.round(valueNoMin * info.ticksStep),
                    $magnifElem = isFirstHandle? elemMagnif.$elem1st : elemMagnif.$elem2nd;
                info.currValue[isFirstHandle ? 0 : 1] = valueNoMin + opts.min;
                if (info.isHoriz) {
                    elemHandle.setPos(isFirstHandle, elemOrig.pos.left + info.beginOffset + getHandlePos(valuePixel, $handleElem));
                    elemMagnif.move(isFirstHandle, valuePixel, getHandleHotPoint($handleElem) - info.initialMargin - (info.beginOffset + valuePixel) * opts.handle.zoom);
                } else {
                    elemHandle.setPos(isFirstHandle, elemOrig.pos.top + info.beginOffset + getHandlePos(valuePixel, $handleElem));
                    elemMagnif.move(isFirstHandle, valuePixel, getHandleHotPoint($handleElem) - info.initialMargin - (info.beginOffset + valuePixel) * opts.handle.zoom);
                }
                if (info.isInputTypeRange && isFirstHandle) {
                    $origBar.attr('value', info.getCurrValue(info.currValue[0]));
                }
                if (opts.onChange) {
                    opts.onChange($origBar, info.getCurrValue(info.currValue[isFirstHandle ? 0 : 1]), isFirstHandle, valuePixel);
                }
            },
            util = {
                toInt: function (str) {
                    var value = !str || str == 'auto' || str == '' ? 0 : parseInt(str, 10);
                    return isNaN(value) ? 0 : value;
                },
                toFloat: function (str) {
                    var value = !str || str == 'auto' || str == '' ? 0.0 : parseFloat(str);
                    return isNaN(value) ? 0.0 : value;
                },
                roundToDecimalPlaces: function (num, decimals) {
                    var base = Math.pow(10, decimals);
                    return Math.round(num * base) / base;
                },
                // rounds n to the nearest multiple of m, e.g., if n = 24.8 and m = 25, then returns 25; if n = 24.8 and m = 10, then returns 20
                roundNtoMultipleOfM: function (n, m) {
                    return Math.round(n / m) * m;
                },
                initCanvas: function (ctx, width, height) {
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
                                height: fontData.size,
                                contextFont:
                                    ((!!opts.ruler.values.font ? opts.ruler.values.font.substring(0, fontData.sizePos) + ' ' : '') +
                                    fontData.size + fontData.type + ' ' +
                                    (!!opts.ruler.values.font ? opts.ruler.values.font.substring(fontData.sizePos + fontSize[0].length + 1) : ' arial')).trim()
                            };
                        },
                        fontData = getFontData(),
                        drawTick = function (i, longerMark, posMiddle) {
                            i = Math.round(i) + 0.5;
                            var offset = [0, 0];
                            if (Math.abs(opts.ruler.values.relativePos - opts.ruler.tickMarks.relativePos) < 0.005) {
                                // values and tick marks on the relative position
                                offset[0] = offset[1] = (longerMark ? opts.ruler.tickMarks.sizeBig : opts.ruler.tickMarks.sizeSmall) / 2;
                            } else { 
                                if (opts.ruler.values.relativePos > opts.ruler.tickMarks.relativePos) {
                                    // values below tick marks (or, in case of vertical sliders, values right to tick marks)
                                    offset[0] = opts.ruler.tickMarks.sizeBig / 2;
                                    offset[1] = longerMark ? opts.ruler.tickMarks.sizeBig / 2 : opts.ruler.tickMarks.sizeSmall - opts.ruler.tickMarks.sizeBig / 2;
                                } else {
                                    // values above tick marks (or, in case of vertical sliders, values left to tick marks)
                                    offset[0] = longerMark ? opts.ruler.tickMarks.sizeBig / 2 : opts.ruler.tickMarks.sizeSmall - opts.ruler.tickMarks.sizeBig / 2;
                                    offset[1] = opts.ruler.tickMarks.sizeBig / 2;
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
                            if (opts.ruler.values.onFmtValue) {
                                var fmt = opts.ruler.values.onFmtValue($origBar, num);
                                return fmt === undefined ? num : fmt;
                            }
                            return num;
                        };
                    ctx.font = fontData.contextFont;
                    ctx.fillStyle = opts.ruler.values.fillStyle;
                    ctx.strokeStyle = opts.ruler.tickMarks.strokeStyle;
                    ctx.lineWidth = 1;
                    var fmtMin = fmtMax = null,
                        from = curr = deltaStart = deltaEnd = lastLabel = 0,
                        lastLabel = to = info.isHoriz ? width : height,
                        min = opts.reversed ? opts.max : opts.min,
                        max = opts.reversed ? opts.min : opts.max;
                        
                    if (opts.ruler.values.show) {
                        fmtMin = getFormatedNum(min);
                        fmtMax = getFormatedNum(max);
                        from = curr = info.isHoriz ? ctx.measureText(fmtMin).width : fontData.height;
                        deltaStart = from / 2;
                        deltaEnd = (info.isHoriz ? ctx.measureText(fmtMax).width : fontData.height) / 2;
                        lastLabel -= deltaEnd * 2;
                        to -= deltaEnd;
                    }
                    var tickMarkRate = ((info.isHoriz ? width : height) - deltaStart - deltaEnd) / (max - min),
                        pixelStep = info.isStepDefined ? Math.abs(tickMarkRate) * opts.step : 2,
                        tickMarkRelativePos = opts.ruler.tickMarks.sizeBig / 2 + ((info.isHoriz ? height : width) - opts.ruler.tickMarks.sizeBig) * opts.ruler.tickMarks.relativePos,
                        textRelativePos = 0;

                    if (opts.ruler.values.show) {
                        var spaceForLabels = info.isHoriz ? fontData.height : Math.max(ctx.measureText(fmtMin).width, ctx.measureText(fmtMax).width);
                        textRelativePos = (info.isHoriz ? spaceForLabels : 0) + ((info.isHoriz ? height : width) - spaceForLabels) * opts.ruler.values.relativePos;
                        info.isHoriz ? ctx.fillText(fmtMin, 0, textRelativePos) : ctx.fillText(fmtMin, textRelativePos, fontData.height);
                    }
                    for (var i = deltaStart, longerMark = true, cond = true; cond; i += pixelStep) {
                        var num = (i - deltaStart) / tickMarkRate + min;
                        if (info.isStepDefined) {
                            num = util.roundNtoMultipleOfM(num - min, opts.step) + min;
                        }
                        num = util.roundToDecimalPlaces(num, opts.ruler.values.decimals);

                        var fmtNum = getFormatedNum(num),
                            textPos = info.isHoriz ? ctx.measureText(fmtNum).width / 2 : deltaStart; // for vertical sliders deltaStart is half of text height
                        
                        if (opts.ruler.values.show) {
                            var doText = // if there is enough space (4px) that would separate this label from the previous one
                                        i - textPos - curr > 4 && 
                                        // and there is enough space to the last label
                                        lastLabel - i - textPos > 4;

                            // only shows a label, if multiple of tryShowEvery (if defined)
                            if (doText && !!opts.ruler.values.tryShowEvery) {
                                var everyValue = Math.abs((num - min) % opts.ruler.values.tryShowEvery);
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
                },
                getScaleCss: function (zoomValue) {
                    var scale = 'scale(' + opts.handle.zoom + ')',
                        css = {
                            '-webkit-transform-origin': '0 0',
                            '-moz-transform-origin': '0 0',
                            '-o-transform-origin': '0 0',
                            'msTransformOrigin': '0 0',
                            'transform-origin': '0 0',
                            '-webkit-transform': scale,
                            '-moz-transform': scale,
                            '-o-transform': scale,
                            'msTransform': scale,
                            'transform': scale
                        };
                    if (!info.isIE9) {
                        css['filter'] = "progid:DXImageTransform.Microsoft.Matrix(M11=" + zoomValue + ", M12=0, M21=0, M22=" + zoomValue + ", DX=0, Dy=0, SizingMethod='auto expand');"
                    }
                    return css;
                }
            },
            panUtil = {
                doDrag: true,
                firstClickWasOutsideHandle: false,
                dragDelta: 0,
                $handle: null, // handle currently being dragged
                animDone: function (value) {
                    setValuePixel(value + panUtil.dragDelta, panUtil.$handle);
                    if (panUtil.doDrag) {
                        $("body, html")
                            .bind('mousemove.rsSliderLens', info.isHoriz ? panUtil.dragHoriz : panUtil.dragVert)
                            .bind('mouseup.rsSliderLens', panUtil.stopDrag);
                    }
                },
                anim: function (event) {
                    var to = (info.isHoriz ? event.pageX - elemOrig.pos.left : event.pageY - elemOrig.pos.top) - info.beginOffset,
                        from;
                    if (!info.useDoubleHandles || to <= ((info.currValue[0] + info.currValue[1]) / 2 - opts.min) * info.ticksStep) {
                        panUtil.$handle = elemHandle.$elem1st;
                        from = (info.currValue[0] - opts.min) * info.ticksStep;
                    } else {
                        panUtil.$handle = elemHandle.$elem2nd;
                        from = (info.currValue[1] - opts.min) * info.ticksStep;
                    }

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
                startDrag: function (event) {
                    if (info.isEnabled) {
                        panUtil.doDrag = true;
                        panUtil.firstClickWasOutsideHandle = true;
                        panUtil.anim(event);
                    }
                },
                startDragFromHandle: function (event, $elemHandle) {
                    if (info.isEnabled) {
                        panUtil.$handle = $elemHandle;
                        var from = (info.currValue[$elemHandle === elemHandle.$elem1st ? 0 : 1] - opts.min) * info.ticksStep,
                            to = info.isHoriz ? event.pageX - elemOrig.pos.left : event.pageY - elemOrig.pos.top;
                        panUtil.doDrag = true;
                        panUtil.dragDelta = from - to;
                        panUtil.animDone(to);
                    }
                },
                startDragFromHandle1st: function (event) {
                    if (info.isEnabled) {
                        elemMagnif.$elem1st.parent().addClass(opts.style.classHandleClickDown);
                        panUtil.startDragFromHandle(event, elemHandle.$elem1st);
                    }
                },
                startDragFromHandle2nd: function (event) {
                    if (info.isEnabled) {
                        elemMagnif.$elem2nd.parent().addClass(opts.style.classHandleClickDown);
                        panUtil.startDragFromHandle(event, elemHandle.$elem2nd);
                    }
                },
                handleStartsToMoveWhen1stClickWasOutsideHandle: function () {
                    if (panUtil.firstClickWasOutsideHandle) {
                        (panUtil.$handle === elemHandle.$elem1st ? elemMagnif.$elem1st : elemMagnif.$elem2nd).parent().addClass(opts.style.classHandleClickDown);
                        panUtil.firstClickWasOutsideHandle = false;
                    }
                },
                dragHoriz: function (event) {
                    panUtil.handleStartsToMoveWhen1stClickWasOutsideHandle();
                    setValuePixel(event.pageX - elemOrig.pos.left + panUtil.dragDelta, panUtil.$handle);
                },
                dragVert: function (event) {
                    panUtil.handleStartsToMoveWhen1stClickWasOutsideHandle();
                    setValuePixel(event.pageY - elemOrig.pos.top + panUtil.dragDelta, panUtil.$handle);
                },
                stopDrag: function (event) {
                    if (info.isEnabled) {
                        panUtil.doDrag = false;
                        panUtil.firstClickWasOutsideHandle = false;
                        $("body, html").unbind('mousemove.rsSliderLens mouseup.rsSliderLens');
                        panUtil.dragDelta = 0;
                        if (panUtil.$handle == elemHandle.$elem2nd) {
                            elemMagnif.$elem2nd.parent().removeClass(opts.style.classHandleClickDown);
                        } else {
                            elemMagnif.$elem1st.parent().removeClass(opts.style.classHandleClickDown);
                        }                     
                    }
                }
            },
            panRangeUtil = {
                dragDelta: 0,
                dragValue: [0, 0],
                origPixelLimits: {from: 0, to: 0},
                dragged: false,
                startDrag: function (event) {
                    if (info.isEnabled) {
                        panRangeUtil.origPixelLimits.from = info.fromPixel;
                        panRangeUtil.origPixelLimits.to = info.toPixel;
                        panRangeUtil.dragDelta = info.isHoriz ? event.pageX - elemOrig.pos.left : event.pageY - elemOrig.pos.top;
                        panRangeUtil.dragValue[0] = (info.currValue[0] - opts.min) * info.ticksStep;
                        panRangeUtil.dragged = false;
                        if (info.useDoubleHandles) {
                            panRangeUtil.dragValue[1] = (info.currValue[1] - opts.min) * info.ticksStep;
                            if (!info.isRangeDefined) { // when there is a range between the two handles (opts.range = true)
                                panRangeUtil.origPixelLimits.from = panRangeUtil.dragValue[0] + info.beginOffset;
                                panRangeUtil.origPixelLimits.to = panRangeUtil.dragValue[1] + info.beginOffset;
                            }
                        }
                        $("body, html")
                            .bind('mousemove.rsSliderLens', info.isHoriz ? panRangeUtil.dragHoriz : panRangeUtil.dragVert)
                            .bind('mouseup.rsSliderLens', panRangeUtil.stopDrag);
                    }
                },
                dragHorizVert: function (deltaMoved, outerSize, startPos, cssRange) {
                    panRangeUtil.dragged = true;
                    var candidateFromPixel = panRangeUtil.origPixelLimits.from + deltaMoved,
                        candidateToPixel = panRangeUtil.origPixelLimits.to + deltaMoved;

                    if (candidateFromPixel >= info.beginOffset && candidateToPixel <= outerSize - info.endOffset) {
                        setValuePixel(deltaMoved + panRangeUtil.dragValue[0], elemHandle.$elem1st);
                        if (info.isRangeDefined) {
                            info.fromPixel = candidateFromPixel; 
                            info.toPixel = candidateToPixel;
                            opts.range[opts.reversed ? 1 : 0] = info.getCurrValue((info.fromPixel - info.beginOffset) / info.ticksStep + opts.min);
                            opts.range[opts.reversed ? 0 : 1] = info.getCurrValue((info.toPixel - info.beginOffset) / info.ticksStep + opts.min);
                        }
                        elemRange.$elem.css(cssRange, Math.round(startPos + info.fromPixel + info.initialMargin) + 'px');
                        
                        if (info.useDoubleHandles) {
                            setValuePixel(deltaMoved + panRangeUtil.dragValue[1], elemHandle.$elem2nd);
                        }
                    }
                },
                dragHoriz: function (event) {
                    panRangeUtil.dragHorizVert(event.pageX - elemOrig.pos.left - panRangeUtil.dragDelta, elemOrig.outerWidth, elemOrig.pos.left, 'left');
                },
                dragVert: function (event) {
                    panRangeUtil.dragHorizVert(event.pageY - elemOrig.pos.top - panRangeUtil.dragDelta, elemOrig.outerHeight, elemOrig.pos.top, 'top');
                },
                stopDrag: function (event) {
                    if (info.isEnabled) {
                        $("body, html").unbind('mousemove.rsSliderLens mouseup.rsSliderLens');
                    }
                },
                click: function (event) {
                    if (info.isEnabled && !panRangeUtil.dragged) {
                        panUtil.doDrag = false;
                        panUtil.anim(event);
                    }
                }
            };

        init();
        if (info.useDoubleHandles) {
            setValueTicks(info.getCurrValue(opts.value[0]), opts.reversed ? elemHandle.$elem2nd : elemHandle.$elem1st);
            setValueTicks(info.getCurrValue(opts.value[1]), opts.reversed ? elemHandle.$elem1st : elemHandle.$elem2nd);
        } else {
            setValueTicks(info.getCurrValue(opts.value), elemHandle.$elem1st);
        }
    };

    $.fn.rsSliderLens = function (options) {
        var gotoPos = function (optionsGoto) {
            var optsGoto = $.extend({}, $.fn.rsSliderLens.defaultsGoto, optionsGoto);

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
        dragRange: false,
        disabled: false,
        reversed: false,
        style: {
            classHighlightRange: 'sliderlens-range',
            classSingleVertHandle: 'sliderlens-vert-handle',
            classSingleHorizHandle: 'sliderlens-horiz-handle',
            classVertHandle1: 'sliderlens-vert-handle1',
            classVertHandle2: 'sliderlens-vert-handle2',
            classHorizHandle1: 'sliderlens-horiz-handle1',
            classHorizHandle2: 'sliderlens-horiz-handle2',
            classDisabled: 'sliderlens-disabled',
            classHandleClickDown: 'sliderlens-handle-clickdown'
        },
        
        // handle is the cursor that the user can drag around to select values
        handle: {
            size: 25,   // Size of handle is pixels. For horizontal sliders, it is handle width. For vertical sliders, it is handle height.
                        // If two handles are used, then this is the size of both handles togeter, which means each handle has a size of size/2
            zoom: 1.5,  // Magnification factor applied inside the handle.
            relativePos: 0.7,   // Floating point number between 0 and 1 that indicates the handle relative (0% - 100%) position.
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
                sizeSmall: 5,
                sizeBig: 8
            }            
        },
        onChange: null // function ($origBar, value, isFirstHandle, pixelValue)
    };

    $.fn.rsSliderLens.defaultsGoto = {
        value: 0,
        firstHandle: true,
        animate: false
    };

})(jQuery);