// tests TODO
// instantiate a new plugin with disabled state. Then call setter to enabled it, then test if tabindex attribute works


/**
* jQuery SliderLens - Slider with magnification
* ====================================================
*
* Licensed under The MIT License
* 
* @version   2
* @author    Jose Rui Santos
*
* 
* For info, please scroll to the bottom.
*/
(function ($, undefined) {
    var SliderLensClass = function ($elem, opts) {
        var 
            // content that appears outside the handle 
            elemOrig = {
                $wrapper: null,
                $svg: null,
                tabindexAttr: null,
                autofocusable: false,
                initSvgOutsideHandle: function () {
                    this.$svg = util.createSvg(this.width, this.height).css({
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%'
                    });
                    if (opts.ruler.visible) {
                        util.renderSvg(this.$svg, this.width, this.height);
                    }
                    if (opts.ruler.onDraw) {
                        opts.ruler.onDraw(this.$svg, this.width, this.height, util.createSvgDom);
                    }
                    this.$svg.prependTo(this.$wrapper);
                    $elem.css('visibility', 'hidden'); // because the ruler is used instead of the original slider
                },
                init: function () {
                    this.tabindexAttr = $elem.attr('tabindex');
                    this.autofocusable = $elem.attr('autofocus');
                    info.isFixedHandle = opts.fixedHandle !== false;
                    if (info.isFixedHandle) {
                        elemHandle.fixedHandleRelPos = opts.fixedHandle === true ? 0.5 : (opts.flipped ? 1 - opts.fixedHandle : opts.fixedHandle);
                    } else {
                        elemHandle.fixedHandleRelPos = 0;
                    }

                    this.width = $elem.width();
                    this.height = $elem.height();
                    if (this.width === 0) {
                        this.width = 25;
                        $elem.width(25);
                    }
                    if (this.height === 0) {
                        this.height = 25;
                        $elem.height(25);
                    }
                    info.isHoriz = opts.orientation === 'auto' ? this.width >= this.height : opts.orientation !== 'vert';

                    var elemPosition = $elem.css('position'),
                        elemPos = $elem.position();

                    this.$wrapper = $elem.css({
                        display: 'inline-block',
                        position: 'relative',
                        'white-space': 'nowrap'
                    }).css(
                        info.isHoriz ? 'top' : 'left', opts.contentOffset*100 + '%'
                    ).wrap('<div>').parent().
                        css({
                            overflow: (info.isFixedHandle ? 'hidden' : 'visible'),
                            display: 'inline-block'
                        }).
                        addClass(opts.style.classSlider).
                        addClass(info.isFixedHandle ? opts.style.classFixed : null).
                        addClass(info.isHoriz ? opts.style.classHoriz : opts.style.classVert).
                        addClass(opts.enabled ? null : opts.style.classHandleDisabled);

                    if (info.isFixedHandle) {
                        $elem.css(info.isHoriz ? 'left' : 'top', elemHandle.fixedHandleRelPos*100 + '%');
                    } else {
                        $elem.css('transform', 'translate' + (info.isHoriz ? 'Y' : 'X') + '(-50%)');
                    }

                    // set again width and height, as css set above might change dimensions
                    if (opts.ruler.visible || opts.ruler.onDraw) {
                        this.width = this.$wrapper.width();
                        this.height = this.$wrapper.height();
                    } else {
                        this.width = $elem.width();
                        this.height = $elem.height();
                    }

                    if (elemPosition === 'static') {
                        this.$wrapper.css('position', 'relative');
                    } else {
                        this.$wrapper.css({
                            position: elemPosition,
                            left: elemPos.left + 'px',
                            top: elemPos.top + 'px'
                        });
                    }
                }
            },

            // range that appears outside the handle
            elemRange = {
                $range: null,
                getRangeName: function (name) {
                    if (opts.flipped) {
                        switch (name) {
                            case 'min': return 'max';
                            case 'max': return 'min';
                        }
                    }
                    return name;
                },
                getPropMin: function () {
                    if (opts.flipped) {
                        return info.isHoriz ? 'right' : 'bottom';
                    }
                    return info.isHoriz ? 'left' : 'top';
                },
                getPropMax: function () {
                    if (opts.flipped) {
                        return info.isHoriz ? 'left' : 'top';
                    }
                    return info.isHoriz ? 'right' : 'bottom';
                },
                init: function () {
                    if (opts.range.type && opts.range.type !== 'hidden') {
                        var css = {
                                display: 'inline-block',
                                position: 'absolute'
                            };

                        if (info.isHoriz) {
                            css.top = opts.range.relativePos*100 + '%';
                            css.height = opts.range.size*100 + '%';
                            css.transform = 'translateY(-50%)';
                        } else {
                            css.left = opts.range.relativePos*100 + '%';
                            css.width = opts.range.size*100 + '%';
                            css.transform = 'translateX(-50%)';
                        }

                        if (!info.isFixedHandle) {
                            switch (opts.range.type) {
                                case 'min': css[elemRange.getPropMin()] = opts.paddingStart*100 + '%';
                                            break;
                                case 'max': css[elemRange.getPropMax()] = opts.paddingEnd*100 + '%';
                                            break;
                                default:
                                    if (info.isRangeFromToDefined) {
                                        var factor = (1 - opts.paddingStart - opts.paddingEnd)/(opts.max - opts.min),
                                            relStart = (info.getCurrValue(opts.range.type[opts.flipped ? 1 : 0]) - opts.min)*factor,
                                            relEnd = (info.getCurrValue(opts.range.type[opts.flipped ? 0 : 1]) - opts.min)*factor,
                                            start, end;
                                        if (opts.flipped) {
                                            start = (opts.paddingEnd + relStart)*100 + '%';
                                            end = (1 - relEnd - opts.paddingEnd)*100 + '%'
                                        } else {
                                            start = (opts.paddingStart + relStart)*100 + '%';
                                            end = (1 - relEnd - opts.paddingStart)*100 + '%'
                                        }

                                        if (info.isHoriz) {
                                            css.left = start;
                                            css.right = end;
                                        } else {
                                            css.top = start;
                                            css.bottom = end;
                                        }
                                    }
                            }
                        }

                        this.$range = $("<div>").css(css).addClass(opts.style.classHighlightRange);
                        if (info.canDragRange) {
                            this.$range.addClass(opts.style.classHighlightRangeDraggable);
                        }
                    }
                },
                update: function (pos, isFirstHandle) {
                    var fixedHandlePos = 0;
                    if (info.isFixedHandle) {
                        fixedHandlePos = opts.fixedHandle === true ? 0.5 : opts.fixedHandle;
                    }

                    switch (opts.range.type) {
                        case 'min':
                            if (info.isFixedHandle) {
                                elemRange.$range.css(elemRange.getPropMin(), ((opts.flipped ? pos : 100 - pos) - fixedHandlePos*100) + '%');
                            } else {
                                if (!info.doubleHandles || isFirstHandle && !opts.flipped || !isFirstHandle && opts.flipped) {
                                    elemRange.$range.css(elemRange.getPropMax(), (opts.flipped ? pos : 100 - pos) + '%');
                                }
                            }
                            break;
                        case 'max':
                            if (!info.doubleHandles || !isFirstHandle && !opts.flipped || isFirstHandle && opts.flipped) {
                                elemRange.$range.css(elemRange.getPropMin(), (opts.flipped ? 100 - pos : pos) + '%');
                            }
                            break;
                        case true:
                        case 'between':
                            if (isFirstHandle) {
                                elemRange.$range.css(opts.flipped ? elemRange.getPropMax() : elemRange.getPropMin(), pos + '%');
                            } else {
                                elemRange.$range.css(opts.flipped ? elemRange.getPropMin() : elemRange.getPropMax(), (100 - pos) + '%');
                            }
                    }
                }
            },
            
            // magnified content inside the handle(s), which might also include the range(s)
            elemMagnif = {
                $elem1st: null,
                $elem2nd: null,
                $elemRange1st: null,
                $elemRange2nd: null,
                width: 0,
                height: 0,
                getRelativePosition: function () {
                    var contentOffset = opts.ruler.visible || opts.ruler.onDraw ? 0.5 : opts.contentOffset,
                        otherSize = info.isFixedHandle ? 1 : (opts.handle.otherSize === 'zoom' ? opts.handle.zoom : opts.handle.otherSize),
                        pos = ((contentOffset - (info.isFixedHandle ? .5 : opts.handle.relativePos))/otherSize + 0.5)*100 + '%';
                    return info.isHoriz ? {
                            left: (info.doubleHandles ? '100%' : '50%'),
                            top: pos
                        } : {
                            left: pos,
                            top: (info.doubleHandles ? '100%' : '50%')
                        };
                    ;
                },
                initClone: function () {
                    this.$elem1st = $elem.clone().css('transform-origin', '0 0').
                        css(this.getRelativePosition()).removeAttr('tabindex autofocus');

                    if (info.doubleHandles) {
                        this.$elem2nd = this.$elem1st.clone().css(info.isHoriz ? 'left' : 'top', '');
                    }
                },
                initSvgHandle: function () {
                    elemOrig.initSvgOutsideHandle();
                    this.$elem1st = util.createSvg(this.width, this.height).
                        css(this.getRelativePosition());
                    if (opts.ruler.visible) {
                        util.renderSvg(this.$elem1st, this.width, this.height, opts.handle.zoom !== 1);
                    }
                    if (opts.ruler.onDraw) {
                        opts.ruler.onDraw(this.$elem1st, this.width, this.height, util.createSvgDom);
                    }

                    if (info.doubleHandles) {
                        this.$elem2nd = this.$elem1st.clone().css(info.isHoriz ? 'left' : 'top', '');
                    }
                    return true;
                },
                init: function () {
                    this.width = elemOrig.width*opts.handle.zoom;
                        this.height = elemOrig.height*opts.handle.zoom;
                    if (opts.ruler.visible || opts.ruler.onDraw) { 
                        this.initSvgHandle();
                    } else {
                        this.initClone();
                    }
                },
                resizeUpdate: function () {
                    elemMagnif.$elem1st.add(elemMagnif.$elem2nd).css({
                        width: elemOrig.$wrapper.width()*opts.handle.zoom,
                        height: elemOrig.$wrapper.height()*opts.handle.zoom
                    });
                },
                initRanges: function () {
                    if (info.isRangeFromToDefined || opts.range.type === 'min' || opts.range.type === 'max') {
                        var createMagnifRange = function ($thisRange) {
                            return ($thisRange === null ? elemRange.$range.clone().removeAttr('id') : $thisRange).css({
                                width: (elemRange.width * (opts.ruler.visible ? opts.handle.zoom : 1)) + 'px',
                                height: (elemRange.height * (opts.ruler.visible ? opts.handle.zoom : 1)) + 'px',
                                'z-index': (opts.ruler.visible ? '' : util.toInt($thisRange.css('z-index')) + 2),
                                // clear these cloned properties, do not need them
                                position: 'relative', 'top': '', 'right': '', 'bottom': '', 'left': '' 
                            });
                        },
                        scaleIfNeeded = function ($thisRange) {
                            if (!opts.ruler.visible) {
                                $thisRange.css(util.getScaleCss(opts.handle.zoom));
                            }
                        };
                        
                        this.$elemRange1st = createMagnifRange(this.$elemRange1st);
                        scaleIfNeeded(this.$elemRange1st);
                        if (info.doubleHandles) {
                            this.$elemRange2nd = createMagnifRange(this.$elemRange2nd);
                            scaleIfNeeded(this.$elemRange2nd);
                        } else {
                            if (info.isHoriz && elemRange.getRangeName(opts.range.type) === 'max') {
                                this.$elemRange1st.css('left', getHandleHotPoint(elemHandle.$elem1st) / (opts.ruler.visible ? 1 : opts.handle.zoom));
                            }
                        }
                    }
                },
                applyMeasurements: function () {
                    if (info.usingScaleTransf && !info.doubleHandles && info.isHoriz && elemRange.getRangeName(opts.range.type) === 'max') {
                        this.$elemRange1st.css('left', getHandleHotPoint(elemHandle.$elem1st));
                    }
                },
                move: function (isFirst, valuePixel, offset) {
                    if (!opts.ruler.visible) {
                        offset /= opts.handle.zoom;
                    }
                    
                    // move the magnified content inside the handle(s)
                    //(isFirst ? this.$elem1st : this.$elem2nd).css(info.isHoriz? 'margin-left' : 'margin-top', offset * (info.usingScaleTransf && !opts.ruler.visible ? opts.handle.zoom : 1) + 'px');

                    // move the magnified ranges (if applicable)
                    switch (elemRange.getRangeName(opts.range.type)) {
                        case 'min': if (isFirst) {
                                        elemRange.$range.css(info.isHoriz ? 'width' : 'height', ++valuePixel + 'px');
                                        if (info.isHoriz) {
                                            if (elemOrig.right !== null && !info.isFixedHandle) {
                                                elemRange.$range.css('right', (util.toInt(elemHandle.$elem1st.css('right')) + opts.handle.size - getHandleHotPoint(elemHandle.$elem1st)) + 'px'); 
                                            }
                                            this.$elemRange1st.css({
                                                'left': Math.round(info.beginOffset * opts.handle.zoom + offset * (info.usingScaleTransf && !opts.ruler.visible ? opts.handle.zoom : 1)) + 'px',
                                                'width': Math.round(valuePixel * (opts.ruler.visible ? opts.handle.zoom : 1)) + 'px'
                                            });
                                        } else {
                                            if (elemOrig.bottom !== null && !info.isFixedHandle) {
                                                elemRange.$range.css('bottom', (util.toInt(elemHandle.$elem1st.css('bottom')) + opts.handle.size - getHandleHotPoint(elemHandle.$elem1st)) + 'px'); 
                                            }

                                            var top = getHandleHotPoint(elemHandle.$elem1st) - valuePixel * opts.handle.zoom;
                                            if (!info.usingScaleTransf && !opts.ruler.visible) {
                                                top /= opts.handle.zoom;
                                            }
                                            this.$elemRange1st.css({
                                                'top': Math.round(top) + 'px',
                                                'height': Math.round(valuePixel * (opts.ruler.visible ? opts.handle.zoom : 1)) + 'px'
                                            });
                                        }
                                    }
                                    break;
                        case 'max': if (!info.doubleHandles || info.doubleHandles && !isFirst) {
                                        var $range = info.doubleHandles ? this.$elemRange2nd : this.$elemRange1st;
                                        
                                        if (info.isHoriz) {
                                            if (elemOrig.right === null || info.isFixedHandle) {
                                                elemRange.$range.css('left', Math.round(info.isFixedHandle ? elemHandle.fixedHandleRelPos : elemOrig.pos.value().left + valuePixel + info.beginOffset) + 'px');
                                            }
                                            elemRange.$range.css('width', Math.round(elemOrig.outerWidth - valuePixel - info.beginOffset - info.endOffset) + 'px');
                                            $range.css('width', (Math.round(elemOrig.outerWidth - valuePixel - info.beginOffset - info.endOffset) * (opts.ruler.visible ? opts.handle.zoom : 1)) + 'px');
                                        } else {
                                            if (elemOrig.bottom === null || info.isFixedHandle) {
                                                elemRange.$range.css('top', Math.round(info.isFixedHandle ? elemHandle.fixedHandleRelPos : elemOrig.pos.value().top + valuePixel + info.beginOffset) + 'px');
                                            }
                                            elemRange.$range.css('height', Math.round(elemOrig.outerHeight - valuePixel - info.beginOffset - info.endOffset) + 'px');
                            
                                            var top = getHandleHotPoint(info.doubleHandles ? elemHandle.$elem2nd : elemHandle.$elem1st) / 
                                                        (opts.ruler.visible || info.usingScaleTransf ? 1 : opts.handle.zoom);

                                            $range.css({
                                                'height': (Math.round(elemOrig.outerHeight - valuePixel - info.beginOffset - info.endOffset) * (opts.ruler.visible ? opts.handle.zoom : 1)) + 'px',
                                                'top': top + 'px'
                                            });
                                        }
                                    }
                                    break;
                        case true:  if (info.isHoriz) {
                                        if (elemOrig.right === null || info.isFixedHandle) {
                                            elemRange.$range.css('left', (elemOrig.pos.value().left + elemHandle.stopPosition[0]) + 'px');
                                        } else {
                                            elemRange.$range.css('right', (util.toInt(elemHandle.$elem2nd.css('right')) + opts.handle.size) + 'px');
                                        }
                                        elemRange.$range.css('width', (elemHandle.stopPosition[1] - elemHandle.stopPosition[0] + 1) + 'px');
                                    } else {
                                        if (elemOrig.bottom === null || info.isFixedHandle) {
                                            elemRange.$range.css('top', (elemOrig.pos.value().top + elemHandle.stopPosition[0]) + 'px');
                                        } else {
                                            elemRange.$range.css('bottom', (util.toInt(elemHandle.$elem2nd.css('bottom')) + opts.handle.size) + 'px');
                                        }
                                        elemRange.$range.css('height', (elemHandle.stopPosition[1] - elemHandle.stopPosition[0] + 1) + 'px');
                                    }
                    }
                    
                    if (info.isRangeFromToDefined) {
                        var $range = isFirst ? this.$elemRange1st : this.$elemRange2nd;
                        if (info.usingScaleTransf && !opts.ruler.visible) {
                            if (info.isHoriz) {
                                $range.css('left', ((info.fromPixel + offset) * opts.handle.zoom) + 'px');
                            } else {
                                var marginTop = info.fromPixel * opts.handle.zoom - this.height / opts.handle.zoom,
                                    handlePos = - util.toInt((isFirst ? this.$elem1st : this.$elem2nd).css('top'));
                                if (handlePos >= elemOrig.height) {
                                    marginTop -= handlePos - elemOrig.height;
                                }
                                $range.css('top', marginTop + 'px');
                            }
                        } else {
                            $range.css(info.isHoriz ? 'left' : 'top', (info.fromPixel * (opts.ruler.visible ? opts.handle.zoom : 1) + offset) + 'px');
                        }
                    }
                }
            },
            
            // the handle(s)
            elemHandle = {
                $elem1st: null,
                $elem2nd: null,
                stopPosition: [0, 0], // used to stop both handles from overlaping each other. Only applicable for double handles:
                                      // For horizontal slider, stopPosition[0] is the rightmost pos for the left handle, stopPosition[1] is the leftmost pos for the right handle
                                      // For vertical slider, stopPosition[0] is the bottommost pos for the top handle, stopPosition[1] is the topmost pos for the bottom handle
                fixedHandleRelPos: 0,
                init: function () {
                    var css = {
                            display: 'inline-block',
                            overflow: 'hidden',
                            outline: 'none',
                            position: 'absolute',
                            'z-index': $elem.css('z-index')
                        };

                    if (info.isHoriz) {
                        css.width = opts.handle.size*100 + '%';
                        if (info.isFixedHandle) {
                            css.left = this.fixedHandleRelPos*100 + '%';
                            css.top = 0;
                            css.height = '100%';
                            css.transform = 'translateX(-50%)';
                        } else {
                            css.top = opts.handle.relativePos*100 + '%';
                            css.height = (opts.handle.otherSize === 'zoom' ? opts.handle.zoom : opts.handle.otherSize)*100 + '%';
                            css.transform = 'translate(-' + (info.doubleHandles ? 100 : 50) + '%, -50%)';
                        }
                    } else {
                        css.height = opts.handle.size*100 + '%';
                        if (info.isFixedHandle) {
                            css.top = this.fixedHandleRelPos*100 + '%';
                            css.left = 0;
                            css.width = '100%';
                            css.transform = 'translateY(-50%)';
                        } else {
                            css.left = opts.handle.relativePos*100 + '%';
                            css.width = (opts.handle.otherSize === 'zoom' ? opts.handle.zoom : opts.handle.otherSize)*100 + '%';
                            css.transform = 'translate(-50%, -' + (info.doubleHandles ? 100 : 50) + '%)';
                        }
                    }
                    this.$elem1st = elemMagnif.$elem1st.wrap("<div>").parent().
                        addClass(info.doubleHandles ? opts.style.classHandle1 : opts.style.classHandle).css(css);
                    this.bindTabEvents(true);
                    
                    if (info.doubleHandles) {
                        this.$elem2nd = elemMagnif.$elem2nd.wrap("<div>").parent().
                            addClass(opts.style.classHandle2).css(css).css('transform', 'translate' + (info.isHoriz ? 'Y(-50%)' : 'X(-50%)'));
                        this.bindTabEvents(false);
                    }
                },
                bindTabEvents: function (firstHandle) {
                    if (elemOrig.tabindexAttr && opts.enabled) {
                        var bindForSecondHandle = function () {
                            elemHandle.$elem2nd.
                                attr('tabindex', elemOrig.tabindexAttr).
                                bind('focus.rsSliderLens', panUtil.gotFocus2nd).
                                bind('blur.rsSliderLens', panUtil.loseFocus);
                        };

                        if (firstHandle || firstHandle === undefined) {
                            $elem.removeAttr('tabindex');
                            this.$elem1st.
                                attr('tabindex', elemOrig.tabindexAttr).
                                bind('focus.rsSliderLens', panUtil.gotFocus1st).
                                bind('blur.rsSliderLens', panUtil.loseFocus);

                            if (elemOrig.autofocusable) {
                                $elem.removeAttr('autofocus');
                                this.$elem1st.attr('autofocus', 'autofocus');
                            }

                            if (firstHandle === undefined && this.$elem2nd) {
                                bindForSecondHandle();
                            }
                        } else {
                            bindForSecondHandle();
                        }
                    }
                },
                unbindTabEvents: function () {
                    if (elemOrig.tabindexAttr && !opts.enabled) {
                        this.$elem1st.add(this.$elem2nd).removeAttr('tabindex autofocus').unbind('blur.rsSliderLens', panUtil.loseFocus);
                        this.$elem1st.unbind('focus.rsSliderLens', panUtil.gotFocus1st);
                        if (this.$elem2nd) {
                            this.$elem2nd.unbind('focus.rsSliderLens', panUtil.gotFocus2nd);
                        }
                    }
                },

                navigate: function (pixelOffset, valueOffset, duration, easingFunc, limits, $animHandle) {
                    var currValue = info.currValue[!info.doubleHandles || panUtil.$handle === elemHandle.$elem1st? 0 : 1],
                        toValue;
                    if (info.isStepDefined) {
                        toValue = Math.round((currValue + valueOffset)/opts.step)*opts.step;
                    } else {
                        toValue = (currValue*info.ticksStep + pixelOffset)/info.ticksStep;
                    }
                    if (limits !== undefined) {
                        if (toValue < limits[0]) { toValue = limits[0]; }
                        if (toValue > limits[1]) { toValue = limits[1]; }
                    }
                    if (toValue < opts.min) { toValue = opts.min; }
                    if (toValue > opts.max) { toValue = opts.max; }
                    panUtil.gotoAnim(currValue, toValue, duration, easingFunc, $animHandle);
                },
                keydown: function (event) {
                    var key = {
                        left: 37,
                        up: 38,
                        right: 39,
                        down: 40,
                        pgUp: 33,
                        pgDown: 34,
                        home: 36,
                        end: 35,
                        esc: 27
                    }, allowedKey = function () {
                        switch (event.which) {
                            case key.left:   return $.inArray('left', opts.keyboard.allowed) > -1;
                            case key.down:   return $.inArray('down', opts.keyboard.allowed) > -1; 
                            case key.right:  return $.inArray('right', opts.keyboard.allowed) > -1;
                            case key.up:     return $.inArray('up', opts.keyboard.allowed) > -1;
                            case key.pgUp:   return $.inArray('pgup', opts.keyboard.allowed) > -1;
                            case key.pgDown: return $.inArray('pgdown', opts.keyboard.allowed) > -1;
                            case key.home:   return $.inArray('home', opts.keyboard.allowed) > -1;
                            case key.end:    return $.inArray('end', opts.keyboard.allowed) > -1;
                            case key.esc:    return $.inArray('esc', opts.keyboard.allowed) > -1;
                        }
                        return false;
                    }, 
                    limits = [info.isRangeFromToDefined ? info.getCurrValue(opts.range.type[opts.flipped ? 1 : 0]) : opts.min,
                              info.isRangeFromToDefined ? info.getCurrValue(opts.range.type[opts.flipped ? 0 : 1]) : opts.max];
                                                    
                    limits[0] = info.doubleHandles ? (panUtil.$handle === elemHandle.$elem1st ? limits[0] : info.currValue[0]) : limits[0];
                    limits[1] = info.doubleHandles ? (panUtil.$handle === elemHandle.$elem1st ? info.currValue[1] : limits[1]) : limits[1];

                    if (allowedKey()) {
                        event.preventDefault();
                        var currValue = info.currValue[!info.doubleHandles || panUtil.$handle === elemHandle.$elem1st? 0 : 1];

                        switch (event.which) {
                            case key.left:
                            case key.down:
                                elemHandle.navigate(info.isHoriz ? -1 : 1, info.isHoriz ? -opts.step: opts.step, 0, opts.keyboard.easing, limits);
                                break;
                            case key.right: 
                            case key.up:
                                elemHandle.navigate(info.isHoriz ? 1 : -1, info.isHoriz ? opts.step : -opts.step, 0, opts.keyboard.easing, limits);
                                break;
                            case key.pgUp:
                            case key.pgDown:
                                event.which === key.pgUp ? elemHandle.navigate((info.fromPixel - info.toPixel)/opts.keyboard.numPages, (opts.min - opts.max)/opts.keyboard.numPages, opts.keyboard.animation, opts.keyboard.easing, limits)
                                                         : elemHandle.navigate((info.toPixel - info.fromPixel)/opts.keyboard.numPages, (opts.max - opts.min)/opts.keyboard.numPages, opts.keyboard.animation, opts.keyboard.easing, limits);
                                break;
                            case key.home: panUtil.gotoAnim(currValue, limits[0], opts.keyboard.animation, opts.keyboard.easing); break;
                            case key.end:  panUtil.gotoAnim(currValue, limits[1], opts.keyboard.animation, opts.keyboard.easing); break;
                            case key.esc:
                                if (info.doubleHandles) {
                                    panUtil.gotoAnim(info.currValue[0], info.uncommitedValue[0], opts.keyboard.animation, opts.keyboard.easing, elemHandle.$elem1st);
                                    panUtil.gotoAnim(info.currValue[1], info.uncommitedValue[1], opts.keyboard.animation, opts.keyboard.easing, elemHandle.$elem2nd);
                                } else {
                                    panUtil.gotoAnim(info.currValue[0], info.uncommitedValue[0], opts.keyboard.animation, opts.keyboard.easing);
                                }
                                info.currValue[0] = info.uncommitedValue[0];
                                info.currValue[1] = info.uncommitedValue[1];
                        }
                    }
                },
                onMouseWheel: function (event) {
                    var delta = {x: 0, y: 0};
                    if (event.wheelDelta === undefined && event.originalEvent !== undefined && (event.originalEvent.wheelDelta !== undefined || event.originalEvent.detail !== undefined)) { 
                        event = event.originalEvent;
                    }
                    if (event.wheelDelta) { 
                        delta.y = event.wheelDelta / 120;
                    }
                    if (event.detail) {
                        delta.y = -event.detail / 3;
                    }
                    var evt = event || window.event;
                    if (evt.axis !== undefined && evt.axis === evt.HORIZONTAL_AXIS) {
                        delta.x = - delta.y;
                        delta.y = 0;
                    }
                    if (evt.wheelDeltaY !== undefined) {
                        delta.y = evt.wheelDeltaY / 120;
                    }
                    if (evt.wheelDeltaX !== undefined) { 
                        delta.x = - evt.wheelDeltaX / 120;
                    }
                    event.preventDefault(); // prevents scrolling

                    delta.y *= opts.handle.mousewheel;
                    var step = opts.step * opts.handle.mousewheel,
                        moveHandler = function () {
                            elemHandle.navigate(- delta.y, delta.y < 0 ? step : - step, opts.handle.animation, opts.handle.easing, undefined, panUtil.$handle);
                        };
                    if (Math.abs(delta.y) > 0.5) {
                        panUtil.$handle = elemHandle.$elem1st;
                        moveHandler();
                        if (info.doubleHandles) {
                            panUtil.$handle = elemHandle.$elem2nd;
                            moveHandler();
                        }
                    }
                }
            },

            events = {
                onGetter: function (event, field) {
                    switch (field) {
                        case 'value': 
                            if (info.doubleHandles) {
                                return [info.getCurrValue(info.currValue[0]), info.getCurrValue(info.currValue[1])];
                            } else {
                                return info.getCurrValue(info.currValue[0]);
                            }
                        case 'range':
                            return opts.range.type;
                        case 'enabled':
                            return opts.enabled;
                    }
                    return null;
                },
                onSetter: function (event, field, value) {
                    var swapValues = function (values) {
                            var sw = values[0];
                            values[0] = values[1];
                            values[1] = sw;
                        },
                        checkValuesData = function (values) {
                            var limits = [info.isRangeFromToDefined ? info.getCurrValue(opts.range.type[opts.flipped ? 1 : 0]) : opts.min,
                                          info.isRangeFromToDefined ? info.getCurrValue(opts.range.type[opts.flipped ? 0 : 1]) : opts.max];
 
                            if (values[1] != null) {
                                values[1] = info.getCurrValue(values[1]);
                                if (values[1] < limits[0]) { values[1] = limits[0]; }
                                if (values[1] > limits[1]) { values[1] = limits[1]; }
                            }
                            if (values[0] !== null) {
                                values[0] = info.getCurrValue(values[0]);
                                if (values[0] < limits[0]) { values[0] = limits[0]; }
                                if (values[0] > limits[1]) { values[0] = limits[1]; }
                                if (values[1] !== null) {
                                    // user wants to set both handles
                                    if (values[0] > values[1]) {
                                        swapValues(values);
                                    }
                                } else {
                                    // user wants to set only the first handle
                                    if (values[0] > info.currValue[1]) { values[1] = values[0]; }
                                }                                
                            } else {
                                if (values[1] !== null) {
                                    // user wants to set only the second handle
                                    if (values[1] < info.currValue[0]) { values[0] = values[1]; }
                                }
                            }
                        };
                    switch (field) {
                        case 'enabled':
                            if (value === false) {
                                if (opts.enabled) {
                                    // from enabled to disabled
                                    opts.enabled = false;
                                    $elem.add(elemOrig.$canvas).add(elemOrig.$wrapper).add(elemRange.$range).addClass(opts.style.classHandleDisabled);
                                    elemMagnif.$elem1st.add(elemMagnif.$elem2nd).add(elemMagnif.$elemRange1st).add(elemMagnif.$elemRange2nd).addClass(opts.style.classHandleDisabled);
                                    elemHandle.$elem1st.children().addClass(opts.style.classHandleDisabled);
                                    if (elemHandle.$elem2nd) {
                                        elemHandle.$elem2nd.children().addClass(opts.style.classHandleDisabled);
                                    }
                                    elemHandle.unbindTabEvents();
                                }
                            } else {
                                if (value === true) {
                                    if (!opts.enabled) {
                                        // from disabled to enabled
                                        opts.enabled = true;
                                        $elem.add(elemOrig.$canvas).add(elemOrig.$wrapper).add(elemRange.$range).removeClass(opts.style.classHandleDisabled);
                                        elemMagnif.$elem1st.add(elemMagnif.$elem2nd).add(elemMagnif.$elemRange1st).add(elemMagnif.$elemRange2nd).removeClass(opts.style.classHandleDisabled);
                                        elemHandle.$elem1st.children().removeClass(opts.style.classHandleDisabled);
                                        if (elemHandle.$elem2nd) {
                                            elemHandle.$elem2nd.children().removeClass(opts.style.classHandleDisabled);
                                        }
                                        elemHandle.bindTabEvents();
                                    }
                                }
                            }
                            
                            break;
                        case 'value':
                            var twoValues = value && (typeof value === 'object') && value.length === 2;
                            if (info.doubleHandles) {
                                if (twoValues) {
                                    checkValuesData(value);
                                    if (value[0] !== null) {
                                        panUtil.gotoAnim(info.currValue[0], value[0], opts.keyboard.animation, opts.keyboard.easing, elemHandle.$elem1st);
                                    }
                                    if (value[1] !== null) {
                                        panUtil.gotoAnim(info.currValue[1], value[1], opts.keyboard.animation, opts.keyboard.easing, elemHandle.$elem2nd);
                                    }
                                }
                            } else {
                                if (!twoValues) {
                                    panUtil.gotoAnim(info.currValue[0], info.getCurrValue(value), opts.keyboard.animation, opts.keyboard.easing);
                                }
                            }
                            break;
                        case 'range':
                            if (info.doubleHandles || value !== true && value !== 'between') { // single handles with range = true are ignored, since range true is only supported for double handle sliders
                                var newRangeNeeded = value && (typeof value === 'object') && value.length === 2;
                                // do not need a new range?
                                if (value !== 'min' && value !== 'max' && !newRangeNeeded) {
                                    // if currently ranges are being used, then delete them
                                    if (elemMagnif.$elemRange1st) {
                                        elemMagnif.$elemRange1st.remove();
                                        elemMagnif.$elemRange1st = null;
                                    }
                                    if (elemMagnif.$elemRange2nd) {
                                        elemMagnif.$elemRange2nd.remove();
                                        elemMagnif.$elemRange2nd = null;
                                    }
                                    
                                    if (value === false && !!elemRange.$range) {
                                        elemRange.$range.unbind('DOMMouseScroll.rsSliderLens mousewheel.rsSliderLens mousedown mouseup click').remove();
                                        elemRange.$range = null;
                                    }
                                }
                                opts.range = value;
                            }
                    }
                    return events.onGetter(event, field);
                },
                onResizeUpdate: function (event) {
                    elemMagnif.resizeUpdate();
                },
                onChange: function (event, value, isFirstHandle) {
                    if (opts.onChange) {
                        opts.onChange(event, value, isFirstHandle);
                    }
                },
                onCreate: function (event) {
                    if (opts.onCreate) {
                        opts.onCreate(event);
                    }
                },
                onDestroy: function (event) {
                    $elem.add(elemOrig.$wrapper).add(elemOrig.$canvas).add(elemRange.$range).add(elemHandle.$elem1st).add(elemHandle.$elem2nd).
                        unbind('DOMMouseScroll.rsSliderLens mousewheel.rsSliderLens', elemHandle.onMouseWheel);
                    
                    $elem.
                        unbind('getter.rsSliderLens', events.onGetter).
                        unbind('setter.rsSliderLens', events.onSetter).
                        unbind('resizeUpdate.rsSliderLens', events.onResizeUpdate).
                        unbind('change.rsSliderLens', events.onChange).
                        unbind('finalchange.rsSliderLens', events.onFinalChange).
                        unbind('create.rsSliderLens', events.onCreate).
                        unbind('destroy.rsSliderLens', events.onDestroy).
                        unbind('fmtValue.rsSliderLens', events.onFmtValue).
                        unbind('drawRuler.rsSliderLens', events.onDrawRuler);
                    
                    elemOrig.$wrapper.
                        unbind('mousedown.rsSliderLens', panUtil.startDrag).
                        unbind('mouseup.rsSliderLens', panUtil.stopDrag);

                    if (elemRange.$range) {
                        elemRange.$range.
                            unbind('mousedown.rsSliderLens', panRangeUtil.startDrag).
                            unbind('mouseup.rsSliderLens', panRangeUtil.stopDrag).
                            unbind('click.rsSliderLens', panRangeUtil.click).
                            unbind('mousedown.rsSliderLens', panUtil.startDrag);
                    }

                    $(document).
                        unbind('keydown.rsSliderLens', elemHandle.keydown).
                        unbind('mousemove.rsSliderLens', info.isHoriz ? panUtil.dragHoriz : panUtil.dragVert).
                        unbind('mouseup.rsSliderLens', panUtil.stopDragFromDoc).
                        unbind('mousemove.rsSliderLens', panRangeUtil.drag);

                    elemHandle.$elem1st.
                        unbind('focus.rsSliderLens', panUtil.gotFocus1st).
                        unbind('blur.rsSliderLens', panUtil.loseFocus).
                        unbind('mousedown.rsSliderLens', panUtil.startDrag).
                        unbind('mousedown.rsSliderLens', panUtil.startDragFromHandle1st);

                    if (elemHandle.$elem2nd) {
                        elemHandle.$elem2nd.
                            unbind('focus.rsSliderLens', panUtil.gotFocus2nd).
                            unbind('blur.rsSliderLens', panUtil.loseFocus).
                            unbind('mousedown.rsSliderLens', panUtil.startDragFromHandle2nd);
                    }

                    if (info.isFixedHandle) {
                        $elem.unwrap();
                    }
                    if (elemOrig.$canvas) {
                        elemOrig.$canvas.remove();
                    }
                    if (elemRange.$range) {
                        elemRange.$range.remove();
                    }
                    elemHandle.$elem1st.remove();
                    if (elemHandle.$elem2nd) {
                        elemHandle.$elem2nd.remove();
                    }
                    $elem.css({
                        'position': '',
                        'display': ''
                    });
                    $elem.css(info.isHoriz ? 'margin-left' : 'margin-top', '');
                    if ($elem.attr('style') === '') { 
                        $elem.removeAttr('style');
                    }
                    if (elemOrig.tabindexAttr) {
                        $elem.attr('tabindex', elemOrig.tabindexAttr);
                    }
                },
                onFmtValue: function (event, num) {
                    if (opts.ruler.labels.onFmtValue) {
                        return opts.ruler.labels.onFmtValue(event, num);
                    }
                    return num;
                },
                onDrawRuler: function (event, ctx, width, height, pixelOffsets) {
                    if (opts.ruler.onDraw) {
                        return opts.ruler.onDraw(event, ctx, width, height, pixelOffsets);
                    }
                },
                finalChangeValueFirst: null,
                finalChangeValueSecond: null,
                processFinalChange: function (isFirstHandle) {
                    var firstHandle = isFirstHandle !== undefined ? isFirstHandle : info.isFixedHandle || panUtil.$handle === elemHandle.$elem1st,
                        value = info.getCurrValue(info.currValue[firstHandle ? 0 : 1]);
                    if (firstHandle) {
                        if (value !== events.finalChangeValueFirst) {
                            $elem.triggerHandler('finalchange.rsSliderLens', [value, true]);
                            events.finalChangeValueFirst = value;
                        }
                    } else {
                        if (value !== events.finalChangeValueSecond) {
                            $elem.triggerHandler('finalchange.rsSliderLens', [value, false]);
                            events.finalChangeValueSecond = value;
                        }
                    }
                },
                onFinalChange: function (event, value, isFirstHandle) {
                    if (opts.onFinalChange) {
                        opts.onFinalChange(event, value, isFirstHandle);
                    }
                }
            },

            info = {
                ns: 'http://www.w3.org/2000/svg',
                currValue: [0, 0], // Values for both handles. When only one handle is used, the currValue[1] is ignored
                ticksStep: 0,
                startPixel: 0,
                isFixedHandle: false,
                isInputTypeRange: false, // whether the markup for this plugin in an <input type="range">
                isHoriz: true,
                
                fromPixel: 0,
                toPixel: 0,
                beginOffset: 0,
                endOffset: 0,
                usingScaleTransf: false,
                
                doubleHandles: false,
                isRangeFromToDefined: false,
                isStepDefined: false,
                isAutoFocusable: $elem.attr('tabindex') !== undefined && $elem.attr('autofocus') !== undefined,
                canDragRange: false,
                isDocumentEventsBound: false,
                uncommitedValue: [0, 0],
                getCurrValue: function (value) {
                    if (opts.flipped) {
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
                    if (info.doubleHandles) {
                        if (opts.value[0] > opts.value[1]) {
                            sw = opts.value[0];
                            opts.value[0] = opts.value[1];
                            opts.value[1] = sw;
                        }
                    } else {
                        if (opts.range.type === true || opts.range.type === 'between') {
                            // single handle sliders do not support the range type 'between'
                            opts.range.type = false;
                        }
                    }
                    if (info.isRangeFromToDefined) {
                        if (opts.range.type[0] > opts.range.type[1]) {
                            sw = opts.range.type[0];
                            opts.range.type[0] = opts.range.type[1];
                            opts.range.type[1] = sw;
                        }
                        checkValueArray(opts.range.type, opts.min, opts.max);

                        if (info.doubleHandles) {
                            checkValueArray(opts.value, opts.range.type[0], opts.range.type[1]);
                        } else {
                            checkValue(opts.range.type[0], opts.range.type[1]);
                        }
                    } else {
                        if (info.doubleHandles) {
                            checkValueArray(opts.value, opts.min, opts.max);
                        } else {
                            checkValue(opts.min, opts.max);
                        }
                    }
                    if (info.doubleHandles) {
                        info.currValue[0] = opts.value[0];
                        info.currValue[1] = opts.value[1];
                    } else {
                        info.currValue[0] = opts.value;
                    }
                },
                initVars: function () {
                    // if fixed handle and two values are provied, then the second is discarded, as double handlers are not supported when a fixedHandle is used
                    if (opts.fixedHandle !== false && opts.value && (typeof opts.value === 'object') && opts.value.length === 2) {
                        opts.value = opts.value[0];
                    }
                    this.doubleHandles = opts.value && (typeof opts.value === 'object') && opts.value.length === 2;
                    this.isRangeFromToDefined = (typeof opts.range.type === 'object') && opts.range.type.length === 2;
                    var delta = opts.max - opts.min;
                    opts.step = opts.step < 0 ? 0 : (opts.step > delta ? delta : opts.step);
                    this.isStepDefined = opts.step > 0.00005;
                    this.canDragRange = opts.range.draggable && opts.fixedHandle === false && (this.doubleHandles && (opts.range.type === true || opts.range.type === 'between') || this.isRangeFromToDefined);
                    this.isInputTypeRange = $elem.is("input[type=range]");
                    if (util.isAlmostZero(opts.handle.zoom)) {
                        opts.handle.zoom = 1;
                    }
                    if (util.isAlmostZero(opts.handle.otherSize)) {
                        opts.handle.otherSize = 1;
                    }
                },
                updateTicksStep: function () {
                    var $e = info.isFixedHandle ? $elem : elemOrig.$wrapper,
                        size = info.isHoriz ? $e.width() : $e.height();
                    this.ticksStep = size*(1 - opts.paddingStart)*(1 - opts.paddingEnd)/(opts.max - opts.min);
                    this.startPixel = size*(opts.flipped ? opts.paddingEnd : opts.paddingStart);
                },
                init: function () {
                    this.checkBounds();
                    this.updateTicksStep();
                    if (info.isRangeFromToDefined) {
                        if (opts.flipped) {
                            this.fromPixel = Math.round((opts.max - opts.range.type[1])*this.ticksStep) + info.beginOffset;
                            this.toPixel = Math.round((opts.max - opts.range.type[0])*this.ticksStep) + info.beginOffset;
                        } else {
                            this.fromPixel = Math.round((opts.range.type[0] - opts.min)*this.ticksStep) + info.beginOffset;
                            this.toPixel = Math.round((opts.range.type[1] - opts.min)*this.ticksStep) + info.beginOffset;
                        }
                    } else {
                        this.fromPixel = info.beginOffset;
                        this.toPixel = Math.round((opts.max - opts.min)*this.ticksStep) + info.beginOffset;
                    }
                }
            },
            init = function () {
                info.initVars();
                var noRangeCreatedBefore = elemRange.$range === null,
                    noIEdrag = function(elem) {
                        if (elem) { elem[0].ondragstart = elem[0].onselectstart = function () { return false; }; }
                    };

                if (info.doubleHandles) {
                    opts.handle.size /= 2;
                }
                elemOrig.init();
                elemMagnif.init();
                info.init();
                elemRange.init();
                //elemMagnif.initRanges();
                elemHandle.init();

                // insert into DOM
                if (elemRange.$range) {
                    elemRange.$range.appendTo(elemOrig.$wrapper);
                }
                elemHandle.$elem1st.add(elemHandle.$elem2nd).appendTo(elemOrig.$wrapper);

                info.usingScaleTransf = !opts.ruler.visible && (util.isDefined(elemHandle.$elem1st.css('-moz-transform')) || util.isDefined(elemHandle.$elem1st.css('-o-transform')));
                elemMagnif.applyMeasurements();

                if (opts.enabled) {
                    if (Math.abs(opts.handle.mousewheel) > 0.5) {
                        $elem.
                            add(elemOrig.$canvas).
                            add(elemRange.$range).
                            add(elemHandle.$elem1st).
                            add(elemHandle.$elem2nd).bind('DOMMouseScroll.rsSliderLens mousewheel.rsSliderLens', elemHandle.onMouseWheel);
                    }

                    $elem.
                        bind('getter.rsSliderLens', events.onGetter).
                        bind('setter.rsSliderLens', events.onSetter).
                        bind('resizeUpdate.rsSliderLens', events.onResizeUpdate).
                        bind('change.rsSliderLens', events.onChange).
                        bind('finalchange.rsSliderLens', events.onFinalChange).
                        bind('create.rsSliderLens', events.onCreate).
                        bind('destroy.rsSliderLens', events.onDestroy);

                    if (info.canDragRange) {
                        elemRange.$range.
                            bind('mousedown.rsSliderLens', panRangeUtil.startDrag).
                            bind('mouseup.rsSliderLens', panRangeUtil.stopDrag).
                            bind('click.rsSliderLens', panRangeUtil.click);

                    } else {
                        if (opts.range.type && opts.range.type !== 'hidden') {
                            elemRange.$range.
                                bind('mousedown.rsSliderLens', panUtil.startDrag).
                                bind('mouseup.rsSliderLens', panUtil.stopDrag);
                        }
                    }
                    
                    if (info.isFixedHandle) {
                        elemOrig.$wrapper.
                            bind('mousedown.rsSliderLens', panUtil.startDrag).
                            bind('mouseup.rsSliderLens', panUtil.stopDrag);
                    } else {
                        elemOrig.$wrapper.
                            bind('mousedown.rsSliderLens', panUtil.startDrag).
                            bind('mouseup.rsSliderLens', panUtil.stopDrag);
                        elemHandle.$elem1st.
                            bind('mousedown.rsSliderLens', panUtil.startDragFromHandle1st);
                    }

                    // to prevent the default behaviour in IE when dragging an element
                    noIEdrag($elem);
                    noIEdrag(elemMagnif.$elem1st);
                    noIEdrag(elemHandle.$elem1st);
                    noIEdrag(elemOrig.$canvas);
                    noIEdrag(elemRange.$range);
                    noIEdrag(elemMagnif.$elemRange1st);
                    
                    if (info.doubleHandles) {
                        noIEdrag(elemMagnif.$elem2nd);
                        noIEdrag(elemHandle.$elem2nd);
                        noIEdrag(elemMagnif.$elemRange2nd);
                        elemHandle.$elem2nd.
                            bind('mousedown.rsSliderLens', panUtil.startDragFromHandle2nd);
                    }
                    if (info.isAutoFocusable) {
                        elemHandle.$elem1st.focus();
                    }
                }
                $elem.triggerHandler('create.rsSliderLens');
            },
            updateHandles = function (values, flipped) {
                if (info.doubleHandles) {
                    setValue(flipped ? info.getCurrValue(values[0]) : values[0], flipped ? elemHandle.$elem2nd : elemHandle.$elem1st, info.isStepDefined);
                    setValue(flipped ? info.getCurrValue(values[1]) : values[1], flipped ? elemHandle.$elem1st : elemHandle.$elem2nd, info.isStepDefined);
                    events.processFinalChange(true);
                    events.processFinalChange(false);
                } else {
                    setValue(flipped ? info.getCurrValue(values) : values, info.isFixedHandle ? elemOrig.$wrapper : elemHandle.$elem1st, info.isStepDefined);
                    events.processFinalChange(true);
                }
            },
            getHandleHotPoint = function ($handleElem) {
                if (info.doubleHandles) {
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
            checkLimits = function (value) {
                var limit = info.isRangeFromToDefined ? info.getCurrValue(opts.range.type[opts.flipped ? 1 : 0]) : opts.min;
                if (value < limit) {
                    return limit;
                } else {
                    limit = info.isRangeFromToDefined ? info.getCurrValue(opts.range.type[opts.flipped ? 0 : 1]) : opts.max;
                    if (value > limit) {
                        return limit;
                    }
                }
                return value;
            },
            setValue = function (value, $handleElem, doSnap, checkOffLimits) {
                if (info.doubleHandles) {
                    if ($handleElem === elemHandle.$elem1st) {
                        if (value > elemHandle.stopPosition[1]) {
                            value = elemHandle.stopPosition[1];
                        }
                    } else {
                        if (value < elemHandle.stopPosition[0]) {
                            value = elemHandle.stopPosition[0];
                        }
                    }
                }

                var valueNoMin = value - opts.min,
                    valueNoMinPx = valueNoMin;

                if (info.isStepDefined) {
                    valueNoMin = Math.round(valueNoMin / opts.step) * opts.step;
                    if (info.isRangeFromToDefined) {
                        // make sure the handle is within range limits
                        var rangeBoundary = info.getCurrValue(opts.range.type[opts.flipped ? 1 : 0]) - opts.min;
                        if (valueNoMin < rangeBoundary) {
                            valueNoMin = checkOffLimits ? rangeBoundary : (valueNoMin + opts.step);
                        } else {
                            rangeBoundary = info.getCurrValue(opts.range.type[opts.flipped ? 0 : 1]) - opts.min;
                            if (valueNoMin > rangeBoundary) {
                                valueNoMin = checkOffLimits ? rangeBoundary : (valueNoMin - opts.step);
                            }
                        }
                    }
                }
                if (valueNoMin < 0) {
                    valueNoMin += opts.step;
                }
                if (valueNoMin > opts.max - opts.min) {
                    valueNoMin -= opts.step;
                }
                if (info.isStepDefined && doSnap !== false) {
                    valueNoMinPx = valueNoMin;
                }
                valueNoMin = checkLimits(valueNoMin + opts.min) - opts.min;
                valueNoMinPx = checkLimits(valueNoMinPx + opts.min) - opts.min;
                
                var valueRelative = valueNoMinPx/(opts.min - opts.max)*100,
                    isFirstHandle = $handleElem === elemHandle.$elem1st,
                    onlyOneHandle = isFirstHandle || info.isFixedHandle,
                    padStart = opts.flipped ? opts.paddingEnd : opts.paddingStart,
                    padEnd = opts.flipped ? opts.paddingStart : opts.paddingEnd,
                    pos = valueRelative*(1 - padStart - padEnd) - padStart*100,
                    translate = 'translate(' + (info.isHoriz ? pos + '%, -50%)' : '-50%, ' + pos + '%)');

                info.currValue[onlyOneHandle ? 0 : 1] = valueNoMin + opts.min;
                if (info.isFixedHandle) {
                    if (opts.ruler.visible || opts.ruler.onDraw) {
                        elemMagnif.$elem1st.css('transform', translate);
                        pos += 50;
                        translate = 'translate(' + (info.isHoriz ? pos + '%, -50%)' : '-50%, ' + pos + '%)');
                        elemOrig.$svg.css('transform', translate);
                    } else {
                        elemMagnif.$elem1st.css('transform', 'scale(' + opts.handle.zoom + ') ' + translate);
                        $elem.css('transform', translate);
                    }
                    elemRange.update(-pos, isFirstHandle);
                } else {
                    $handleElem.css(info.isHoriz ? 'left' : 'top', (-pos) + '%');
                    (isFirstHandle ? elemMagnif.$elem1st : elemMagnif.$elem2nd).css('transform', opts.ruler.visible || opts.ruler.onDraw ? translate : 'scale(' + opts.handle.zoom + ') ' + translate);
                    elemHandle.stopPosition[isFirstHandle ? 0 : 1] = valueNoMin + opts.min;
                    elemRange.update(-pos, isFirstHandle);
                }

                //elemMagnif.move(onlyOneHandle, valuePixel, getHandleHotPoint($handleElem) - (info.beginOffset + valuePixel) * opts.handle.zoom);

                if (info.isInputTypeRange && onlyOneHandle) {
                    $elem.attr('value', info.getCurrValue(info.currValue[0]));
                }
                $elem.triggerHandler('change.rsSliderLens', [info.getCurrValue(info.currValue[onlyOneHandle ? 0 : 1]), onlyOneHandle]);
            },
            util = {
                pixel2Value: function (pixel) {
                    return (pixel - info.startPixel)/info.ticksStep + opts.min;
                },
                value2Pixel: function (value) {
                    return (value - opts.min)*info.ticksStep + info.startPixel;
                },
                isDefined: function (v) {
                    return v !== undefined && v !== null;
                },
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
                isAlmostZero: function(a, maxDelta) {
                    return this.areTheSame(a, 0, maxDelta);
                },
                areTheSame: function(a, b, maxDelta) {
                    return Math.abs(a - b) < (maxDelta === undefined ? 0.00005 : maxDelta);
                },

                createSvgDom: function (tag, attrs) {
                    var el = document.createElementNS(info.ns, tag);
                    for (var k in attrs) {
                        el.setAttribute(k, attrs[k]);
                    }
                    return $(el);
                },

                createSvg: function (width, height) {
                    return util.createSvgDom('svg', {
                        width: width,
                        height: height,
                        viewBox: '0 0 ' + width + ' ' + height,
                        preserveAspectRatio: 'none',
                        xmlns: info.ns,
                        version: '1.1'
                    }).css({
                        position: 'absolute',
                        'pointer-events': 'none'
                    });
                },

                renderSvg: function ($svg, width, height, doScale) {
                    var widest = info.isHoriz ? width : height,
                        shortest = info.isHoriz ? height : width,
                        optsTicks = opts.ruler.tickMarks,
                        paddingStart = opts.paddingStart*widest,
                        paddingEnd = opts.paddingEnd*widest,
                        usableArea = widest - paddingStart - paddingEnd,
                        padStart = opts.flipped ? paddingEnd : paddingStart,
                        padEnd = opts.flipped ? paddingStart : paddingEnd;

                    if (optsTicks.short.visible || optsTicks.long.visible) {
                        var marker = {
                                getMarker: function (id, size, stroke) {
                                    return util.createSvgDom('marker', {
                                        id: id,
                                        markerWidth: info.isHoriz ? 1 : size,
                                        markerHeight: info.isHoriz ? size : 1,
                                        refX: 1,
                                        refY: 1
                                    }).append(util.createSvgDom('line', {
                                        x1: 1,
                                        y1: 1,
                                        x2: info.isHoriz ? 1 : size,
                                        y2: info.isHoriz ? size : 1,
                                        stroke: stroke
                                    }));
                                },
                                generateTicks: function (type) {
                                    var step = optsTicks[type].step,
                                        tickStep = (step > 0 && !util.isAlmostZero(opts.max - opts.min) ? step : 1)/(opts.max - opts.min)*usableArea,
                                        points = '',
                                        s = optsTicks[type].relativePos*shortest,
                                        id = type.charAt(0) + (+ new Date()),
                                        url = 'url(#' + id + ')';

                                    if (!this.$defs) {
                                        this.$defs = util.createSvgDom('defs');
                                    }
                                    this.$defs.append(this.getMarker(id, optsTicks[type].relativeSize*shortest, optsTicks[type].stroke));

                                    for (var w = padStart; w <= widest - padEnd; w += tickStep) {
                                        points += (info.isHoriz ? w + ',' + s : s + ',' + w) + ' ';
                                    }
                                    $svg.append(util.createSvgDom('polyline', {
                                        points: points,
                                        'marker-start': url,
                                        'marker-mid': url,
                                        'marker-end': url,
                                        'stroke': 'transparent'
                                    }));
                                }
                            };
                        if (optsTicks.short.visible) {
                            marker.generateTicks('short');
                        }
                        if (optsTicks.long.visible) {
                            marker.generateTicks('long');
                        }
                        marker.$defs.prependTo($svg);
                    }

                    if (opts.ruler.labels.values === 'step' && opts.step > 0 || opts.ruler.labels.values instanceof Array) {
                        var $allText = util.createSvgDom('g'),
                            range = opts.max - opts.min,
                            withinBounds = function (value) {
                                value = +value; // strToInt
                                return value >= opts.min && value <= opts.max;
                            },
                            renderText = function (value) {
                                var textData = {},
                                    w = opts.flipped ? opts.max - value : value - opts.min,
                                    s = opts.ruler.labels.relativePos*shortest/(doScale ? opts.handle.zoom : 1),
                                    svgTextTransform = opts.ruler.labels.onSvgTransform ? opts.ruler.labels.onSvgTransform(textData.x, textData.y) : undefined;
                                w = w/range*usableArea/(doScale ? opts.handle.zoom : 1) + (doScale ? padStart/opts.handle.zoom : padStart);
                                if (info.isHoriz) {
                                    textData.x = w;
                                    textData.y = s;
                                } else {
                                    textData.x = s;
                                    textData.y = w;
                                }
                                if (typeof svgTextTransform === 'string') {
                                    textData.transform = (doScale ? 'scale(' + opts.handle.zoom + ') ' : '') + svgTextTransform;
                                } else {
                                    if (doScale) {
                                        textData.transform = 'scale(' + opts.handle.zoom + ')';
                                    }
                                }
                                $allText.append(util.createSvgDom('text', textData).append(value));
                            };
                        if (opts.ruler.labels.values instanceof Array) {
                            opts.ruler.labels.values.sort(function (a, b) { return a - b; });
                            for (var x in opts.ruler.labels.values) {
                                if (withinBounds(opts.ruler.labels.values[x])) {
                                    renderText(opts.ruler.labels.values[x]);
                                }
                            }
                        } else {
                            for (var x = opts.min; x <= opts.max; x += opts.step) {
                                renderText(x);
                            }
                        }
                        $allText.appendTo($svg);
                    }
                },
                getScaleCss: function (zoomValue) {
                    return {
                        'transform-origin': '0 0',
                        'transform': 'scale(' + opts.handle.zoom + ')'
                    };
                },
                getUserDefinedCSS: function ($this, cssProp) {
                    var oldDisplay = $this.css('display'),
                        $inspector = $this.css('display', 'none');
                    $("body").append($inspector); // add to DOM, in order to read the CSS property
                    try {
                        return $inspector.css(cssProp);
                    } finally {
                        $inspector.remove().css('display', oldDisplay); // and remove from DOM
                    }
                },
                getSpeedMs: function (speed) {
                    var ms = speed;
                    if (typeof speed === 'string') {
                        ms = $.fx.speeds[speed];
                        if (ms === undefined) {
                            ms = $.fx.speeds['_default'];
                        }
                    }
                    if (ms === undefined) {
                        ms = 400;
                    }
                    return ms;
                }
            },
            panUtil = {
                doDrag: true,
                firstClickWasOutsideHandle: false,
                dragDelta: 0,
                $handle: null, // handle currently being dragged
                $animObj: null,
                dragging: false,
                fixedHandleStartDragPos: 0,
                textSelection: function (enable) {
                    var value = enable ? '' : 'none';
                    $("body").css({
                        '-webkit-touch-callout': value,
                        '-webkit-user-select': value,
                        '-khtml-user-select': value,
                        '-moz-user-select': value,
                        '-ms-user-select': value,
                        '-o-user-select': value,
                        'user-select': value
                    });
                },
                disableTextSelection: function () {
                    panUtil.textSelection(false);
                },
                enableTextSelection: function () {
                    panUtil.textSelection(true);
                },
                animDone: function (value, $animHandle) {
                    setValue(util.pixel2Value(value + panUtil.dragDelta), $animHandle === undefined ? panUtil.$handle : $animHandle, undefined, !!$animHandle);
                    if (panUtil.doDrag) {
                        $(document).
                            bind('mousemove.rsSliderLens', info.isHoriz ? panUtil.dragHoriz : panUtil.dragVert).
                            bind('mouseup.rsSliderLens', panUtil.stopDragFromDoc);
                    }
                    panUtil.$animObj = null;
                },
                anim: function (event, from, to, animDuration, easingFunc, $animHandle, doneCallback, noFinalChange) {
                    var $prevAnimHandle = $animHandle,
                        done = function () {
                            panUtil.animDone(util.value2Pixel(to), $prevAnimHandle);
                            if (!noFinalChange) {
                                events.processFinalChange($animHandle === elemHandle.$elem1st);
                            }
                            if (doneCallback) {
                                doneCallback();
                            }
                        },
                        refPnt = info.isHoriz ? elemOrig.$wrapper.offset().left : elemOrig.$wrapper.offset().top;

                    if (panUtil.$animObj && !$animHandle) {
                        // stop the current animation
                        panUtil.$animObj.stop();
                        from = util.value2Pixel(panUtil.$animObj[0].n);
                    }
                    if (to === undefined) {
                        to = (info.isHoriz ? event.pageX : event.pageY) - refPnt;
                    }
                    if (from === undefined) {
                        if (!info.doubleHandles || to <= util.value2Pixel((info.currValue[0] + info.currValue[1])/2)) {
                            panUtil.$handle = elemHandle.$elem1st;
                            from = util.value2Pixel(info.currValue[0]);
                        } else {
                            panUtil.$handle = elemHandle.$elem2nd;
                            from = util.value2Pixel(info.currValue[1]);
                        }
                    }
                    if (animDuration === undefined) {
                        animDuration = util.getSpeedMs(opts.handle.animation);
                    }
                    if ($animHandle === undefined) {
                        $animHandle = panUtil.$handle;
                    }
                    from = util.pixel2Value(from);
                    to = util.pixel2Value(to);
                    if (from !== to && animDuration > 0) {
                        panUtil.$animObj = $({ n: from });
                        panUtil.$animObj.animate({ n: to }, {
                            duration: animDuration,
                            easing: easingFunc === undefined ? opts.handle.easing : easingFunc,
                            step: function (now) {
                                setValue(now, $animHandle, opts.snapOnDrag);
                            },
                            complete: done
                        });
                    } else {
                        done();
                    }
                },
                gotoAnim: function (fromValue, toValue, animDuration, easingFunc, $animHandle) {
                    var duration = util.getSpeedMs(animDuration),
                        fromPx = util.value2Pixel(fromValue),
                        toPx = util.value2Pixel(toValue);
                    panUtil.dragDelta = 0;
                    panUtil.doDrag = false;
                    if ($animHandle) {
                        panUtil.anim(null, fromPx, toPx, duration, easingFunc, $animHandle, undefined, false);
                    } else {
                        if (animDuration === 0) {
                            panUtil.anim(null, fromPx, toPx, duration, easingFunc, undefined, undefined, false);
                        } else {
                            panUtil.anim(null, fromPx, toPx, duration, easingFunc);
                        }
                    }
                },
                startDrag: function (event) {
                    if (opts.enabled && !panUtil.$animObj) {
                        info.updateTicksStep();
                        panUtil.disableTextSelection();
                        panRangeUtil.dragged = false;
                        panUtil.doDrag = true;
                        panUtil.dragging = true;
                        if (info.isFixedHandle) {
                            panUtil.$handle = elemHandle.$elem1st;
                            panUtil.fixedHandleStartDragPos = info.isHoriz ? event.pageX : event.pageY;
                            panUtil.fixedHandleStartDragPos += util.value2Pixel(info.currValue[0]);
                            elemMagnif.$elem1st.parent().add(elemOrig.$wrapper).addClass(opts.style.classDragging);
                            $(document).
                                bind('mousemove.rsSliderLens', info.isHoriz ? panUtil.dragHoriz : panUtil.dragVert).
                                bind('mouseup.rsSliderLens', panUtil.stopDragFromDoc);
                        } else {
                            panUtil.firstClickWasOutsideHandle = true;
                            var initialValues = [info.currValue[0], info.currValue[1]];
                            panUtil.anim(event, undefined, undefined, undefined, undefined, undefined, function () {
                                panUtil.$handle.focus();
                                info.uncommitedValue[0] = initialValues[0];
                                info.uncommitedValue[1] = initialValues[1];
                            }, true);
                        }
                    }
                },
                startDragFromHandle: function (event, $elemHandle) {
                    if (opts.enabled) {
                        event.stopPropagation();
                        info.updateTicksStep();
                        panUtil.disableTextSelection();
                        panRangeUtil.dragged = false;
                        panUtil.$handle = $elemHandle;
                        $elemHandle.add(elemOrig.$wrapper).addClass(opts.style.classDragging);
                        var refPnt = info.isHoriz ? elemOrig.$wrapper.offset().left : elemOrig.$wrapper.offset().top,
                            from = util.value2Pixel(info.currValue[$elemHandle === elemHandle.$elem1st ? 0 : 1]),
                            to = (info.isHoriz ? event.pageX : event.pageY) - refPnt;
                        panUtil.doDrag = true;
                        panUtil.dragging = true;
                        panUtil.dragDelta = from - to;
                        panUtil.animDone(to);
                        panUtil.dragDelta = refPnt - panUtil.dragDelta;
                    }
                },
                startDragFromHandle1st: function (event) {
                    if (opts.enabled && !panUtil.$animObj) {
                        panUtil.startDragFromHandle(event, elemHandle.$elem1st);
                    }
                },
                startDragFromHandle2nd: function (event) {
                    if (opts.enabled && !panUtil.$animObj) {
                        panUtil.startDragFromHandle(event, elemHandle.$elem2nd);
                    }
                },
                handleStartsToMoveWhen1stClickWasOutsideHandle: function () {
                    if (panUtil.firstClickWasOutsideHandle) {
                        panUtil.$handle.add(elemOrig.$wrapper).addClass(opts.style.classDragging);
                        panUtil.firstClickWasOutsideHandle = false;
                        panUtil.dragDelta = info.isHoriz ? elemOrig.$wrapper.offset().left : elemOrig.$wrapper.offset().top;
                    }
                },
                dragHorizVert: function (event, attr) {
                    if (info.isFixedHandle) {
                        setValue(util.pixel2Value(-event[attr] + panUtil.fixedHandleStartDragPos), elemOrig.$wrapper, opts.snapOnDrag);
                    } else {
                        panUtil.handleStartsToMoveWhen1stClickWasOutsideHandle();
                        setValue(util.pixel2Value(event[attr] - panUtil.dragDelta), panUtil.$handle, opts.snapOnDrag);
                    }
                },
                dragHoriz: function (event) {
                    panUtil.dragHorizVert(event, 'pageX');
                },
                dragVert: function (event) {
                    panUtil.dragHorizVert(event, 'pageY');
                },
                stopDrag: function (event) {
                    if (panUtil.dragging) {
                        if (panRangeUtil.dragged) {
                            panRangeUtil.stopDrag(event);
                            panRangeUtil.dragged = false;
                        } else {
                            if (opts.enabled) {
                                panUtil.enableTextSelection();
                                panUtil.doDrag = false;
                                panUtil.firstClickWasOutsideHandle = false;
                                $(document).unbind('mousemove.rsSliderLens mouseup.rsSliderLens');
                                
                                // if snap is being used and snapOnDrag is false, then need to adjust final handle position ou mouse up
                                if (info.isStepDefined && !panUtil.$animObj) {
                                    setValue(info.currValue[panUtil.$handle === elemHandle.$elem1st ? 0 : 1], panUtil.$handle, true);
                                }
                                panUtil.dragDelta = 0;
                                (panUtil.$handle === elemHandle.$elem1st ? elemMagnif.$elem1st : elemMagnif.$elem2nd).parent().add(elemOrig.$wrapper).removeClass(opts.style.classDragging);
                                events.processFinalChange();
                            }
                        }
                        panUtil.dragging = false;
                    }
                },
                stopDragFromDoc: function (event) {
                    panUtil.stopDrag(event);
                },
                gotFocus: function (event) {
                    if (!info.isDocumentEventsBound) {
                        $(document).bind('keydown.rsSliderLens', elemHandle.keydown);
                        info.isDocumentEventsBound = true;

                        // save current values and range. If user presses ESC, then data rollsback to these values
                        info.uncommitedValue[0] = info.currValue[0];
                        info.uncommitedValue[1] = info.currValue[1];
                    }
                },
                gotFocus1st: function (event) {
                    if (!panUtil.$animObj) {
                        panUtil.$handle = elemHandle.$elem1st;
                        panUtil.gotFocus(event);
                    }
                },
                gotFocus2nd: function (event) {
                    if (!panUtil.$animObj) {
                        panUtil.$handle = elemHandle.$elem2nd;
                        panUtil.gotFocus(event);
                    }
                },
                loseFocus: function (event) {
                    if (panUtil.$animObj) {
                        // lost focus while a focused handle was still moving, so restore the focus back to the moving handle
                        if (!!panUtil.$handle) {
                            setTimeout(function () {
                                panUtil.$handle.focus();
                            });
                        }
                    } else {
                        setTimeout(function() {
                            var $allElems = $elem.
                                    add(elemOrig.$canvas).
                                    add(elemRange.$range).
                                    add(elemMagnif.$elem1st).add(elemMagnif.$elem1st.parent()).add(elemMagnif.$elem1st.parent().parent()).
                                    add(elemMagnif.$elemRange1st).
                                    add(elemMagnif.$elemRange2nd).
                                    add(elemHandle.$elem1st).
                                    add(elemHandle.$elem2nd),
                                currFocusedElem = document.activeElement;

                            if (info.doubleHandles) {
                                $allElems = $allElems.add(elemMagnif.$elem2nd).add(elemMagnif.$elem2nd.parent()).add(elemMagnif.$elem2nd.parent().parent());
                            }

                            if (!$(currFocusedElem).is($allElems)) { // did focus moved outside this slider?
                                $(document).unbind('keydown.rsSliderLens', elemHandle.keydown);
                                info.isDocumentEventsBound = false;
                            }
                        });
                    }
                }
            },

            panRangeUtil = {
                dragDelta: 0,
                dragValue: [0, 0],
                origPixelLimits: {from: 0, to: 0},
                dragged: false,
                startDrag: function (event) {
                    if (opts.enabled) {
                        panUtil.disableTextSelection();
                        panRangeUtil.origPixelLimits.from = info.fromPixel;
                        panRangeUtil.origPixelLimits.to = info.toPixel;
                        panRangeUtil.dragDelta = info.isHoriz ? event.pageX - elemOrig.offsetPos.value().left : event.pageY - elemOrig.offsetPos.value().top;
                        panRangeUtil.dragValue[0] = (info.currValue[0] - opts.min) * info.ticksStep;
                        panRangeUtil.dragged = false;

                        if (info.doubleHandles) {
                            panRangeUtil.dragValue[1] = (info.currValue[1] - opts.min) * info.ticksStep;
                            if (!info.isRangeFromToDefined) {
                                panRangeUtil.origPixelLimits.from = panRangeUtil.dragValue[0] + info.beginOffset;
                                panRangeUtil.origPixelLimits.to = panRangeUtil.dragValue[1] + info.beginOffset;
                            }
                        }
                        $(document).
                            bind('mousemove.rsSliderLens', panRangeUtil.drag).
                            bind('mouseup.rsSliderLens', panRangeUtil.stopDrag);
                    }
                },
                drag: function (event) {
                    panRangeUtil.dragged = true;
                    var deltaMoved = (info.isHoriz ? event.pageX - elemOrig.offsetPos.value().left : event.pageY - elemOrig.offsetPos.value().top) - panRangeUtil.dragDelta,
                        candidateFromPixel = panRangeUtil.origPixelLimits.from + deltaMoved,
                        candidateToPixel = panRangeUtil.origPixelLimits.to + deltaMoved;

                    if (candidateFromPixel >= info.beginOffset && candidateToPixel <= (info.isHoriz ? elemOrig.outerWidth : elemOrig.outerHeight) - info.endOffset) {
                        panUtil.$handle = elemHandle.$elem1st;
                        setValue(util.pixel2Value(deltaMoved + panRangeUtil.dragValue[0]), panUtil.$handle, opts.snapOnDrag);
                        if (info.isRangeFromToDefined) {
                            info.fromPixel = candidateFromPixel;
                            info.toPixel = candidateToPixel;
                            var range0 = info.getCurrValue((info.fromPixel - info.beginOffset - 1) / info.ticksStep + opts.min),
                                range1 = info.getCurrValue((info.toPixel - info.beginOffset + 1) / info.ticksStep + opts.min);
                            opts.range = opts.flipped ? [range1, range0] : [range0, range1];
                        }

                        if (!info.doubleHandles || opts.range !== true) {
                            if (info.isHoriz) {
                                if (elemOrig.right !== null) {
                                    elemRange.$range.css('right', (elemOrig.right + elemOrig.outerWidth - info.toPixel) + 'px');
                                } else {
                                    elemRange.$range.css('left', (elemOrig.pos.value().left + info.fromPixel) + 'px');
                                }
                            } else {
                                if (elemOrig.bottom !== null) {
                                    elemRange.$range.css('bottom', (elemOrig.bottom + elemOrig.outerHeight - info.toPixel) + 'px');
                                } else {
                                    elemRange.$range.css('top', (elemOrig.pos.value().top + info.fromPixel) + 'px');
                                }
                            }
                        }
                       
                        if (info.doubleHandles) {
                            panUtil.$handle = elemHandle.$elem2nd;
                            setValue(util.pixel2Value(deltaMoved + panRangeUtil.dragValue[1]), panUtil.$handle, opts.snapOnDrag);
                        }
                    }
                },
                stopDrag: function (event) {
                    if (opts.enabled) {
                        panUtil.enableTextSelection();
                        $(document).unbind('mousemove.rsSliderLens mouseup.rsSliderLens');

                        // if snap is being used and snapOnDrag is false, then need to adjust final handle position ou mouse up
                        if (info.isStepDefined) {
                            setValue(info.currValue[0], elemHandle.$elem1st, true);
                            if (info.doubleHandles) {
                                setValue(info.currValue[1], elemHandle.$elem2nd, true);
                            }
                        }
                        if (info.doubleHandles) {
                            events.processFinalChange(0, true);
                            events.processFinalChange(0, false);
                        } else {
                            events.processFinalChange();
                        }
                    }
                },
                click: function (event) {
                    if (opts.enabled && !panRangeUtil.dragged) {
                        panUtil.doDrag = false;
                        var initialValues = [info.currValue[0], info.currValue[1]];
                        panUtil.anim(event, undefined, undefined, undefined, undefined, undefined, function () {
                            panUtil.$handle.focus();
                            info.uncommitedValue[0] = initialValues[0];
                            info.uncommitedValue[1] = initialValues[1];
                        });
                    }
                }
            };
        init();
        updateHandles(opts.value, opts.flipped);
    };
    
    $.fn.rsSliderLens = function (options) {
        var option = function (options) {
            if (typeof arguments[0] === 'string') {
                var op = arguments.length == 1 ? 'getter' : (arguments.length == 2 ? 'setter' : null);
                if (op) {
                    return this.eq(0).triggerHandler(op + '.rsSliderLens', arguments);
                }
            }
        },
        resizeUpdate = function () {
            this.trigger('resizeUpdate.rsSliderLens');
        },
        destroy = function () {
            this.trigger('destroy.rsSliderLens');
        };

        if (typeof options === 'string') {
            var otherArgs = Array.prototype.slice.call(arguments, 1);
            switch (options) {
                case 'option': return option.apply(this, otherArgs);
                case 'resizeUpdate': return resizeUpdate.call(this);
                case 'destroy': return destroy.call(this);
                default: return this;
            }
        }
        var opts = $.extend({}, $.fn.rsSliderLens.defaults, options);
        opts.handle = $.extend({}, $.fn.rsSliderLens.defaults.handle, options ? options.handle : options);
        opts.style = $.extend({}, $.fn.rsSliderLens.defaults.style, options ? options.style : options);
        opts.ruler = $.extend({}, $.fn.rsSliderLens.defaults.ruler, options ? options.ruler : options);
        opts.ruler.labels = $.extend({}, $.fn.rsSliderLens.defaults.ruler.labels, options ? (options.ruler ? options.ruler.labels : options.ruler) : options);
        opts.ruler.tickMarks = $.extend({}, $.fn.rsSliderLens.defaults.ruler.tickMarks, options ? (options.ruler ? options.ruler.tickMarks : options.ruler) : options);
        opts.ruler.tickMarks.short = $.extend({}, $.fn.rsSliderLens.defaults.ruler.tickMarks.short, options ? (options.ruler ? (options.ruler.tickMarks ? options.ruler.tickMarks.short : options.ruler.tickMarks) : options.ruler) : options);
        opts.ruler.tickMarks.long = $.extend({}, $.fn.rsSliderLens.defaults.ruler.tickMarks.long, options ? (options.ruler ? (options.ruler.tickMarks ? options.ruler.tickMarks.long : options.ruler.tickMarks) : options.ruler) : options);
        opts.range = $.extend({}, $.fn.rsSliderLens.defaults.range, options ? options.range : options);
        opts.keyboard = $.extend({}, $.fn.rsSliderLens.defaults.keyboard, options ? options.keyboard : options);

        return this.each(function () {
            var $this = $(this),
                allOpts = $.extend(true, {}, opts),
                toFloat = function (str) {
                    var value = !str || str == 'auto' || str == '' ? 0.0 : parseFloat(str);
                    return isNaN(value) ? 0.0 : value;
                };
            if ($this.is("input[type=range]")) {
                var attrValue = $this.attr('value'),
                    doubleHandles = opts.value && (typeof opts.value === 'object') && opts.value.length === 2;
                    
                if (attrValue !== undefined && !doubleHandles) {
                    allOpts = $.extend({}, allOpts, { value: toFloat(attrValue) });
                }
                attrValue = $this.attr('min');
                if (attrValue !== undefined) {
                    allOpts = $.extend({}, allOpts, { min: toFloat(attrValue) });
                }
                attrValue = $this.attr('max');
                if (attrValue !== undefined) {
                    allOpts = $.extend({}, allOpts, { max: toFloat(attrValue) });
                }
                attrValue = $this.attr('step');
                if (attrValue !== undefined) {
                    allOpts = $.extend({}, allOpts, { step: toFloat(attrValue) });
                }
                attrValue = $this.attr('disabled');
                if (attrValue !== undefined) {
                    allOpts = $.extend({}, allOpts, { enabled: false });
                }
            }
            // if attached element does not have any content, there is nothing to show. So, show the ruler instead.
            if ($this.contents().length === 0) {
                allOpts.ruler.visible = true;
            }
            new SliderLensClass($this, allOpts);
        });
    };

    // public access to the default input parameters
    $.fn.rsSliderLens.defaults = {
        orientation: 'auto', // Slider orientation: Type: string.
                             // 'horiz' - horizontal slider.
                             // 'vert' - vertical slider.
                             // 'auto' - horizontal if the content's width >= height; vertical if the content's width < height.
        fixedHandle: false, // Determines whether handle is movable. Type: boolean or floating point number between 0 and 1.
                            //           false - the user can move the handle left/right (horizontal sliders) or move up/down (vertical sliders).
                            //            true - the handle is in a fixed position on the middle of the ruler and does not move, only the ruler moves.
                            // 0 <= value <= 1 - the handle is in a fixed position and does not move, only the ruler moves.
                            //                   The handle is placed in a relative position (0% - 100%). A value of 0 places the handle on the left (horizontal slides) or on top (vertical slides). 
                            //                   A value of 0.5 or true places the handle in the middle of the ruler.
        value: 0, // Represents the initial value(s). Type: floating point number or array of two floating point numbers.
                  // When a single number is used, only one handle is shown. When a two number array is used, e.g. [5, 20], two handles are shown.
                  // If value is an array of two numbers and handle is fixed (fixedHandle between 0 and 1), then only the first value (value[0]) is considered,
                  // i.e., only one handle is used, since it is not possible to have two fixed handles. 
        min: 0,   // Minimum allowed value. Type: floating point number.
        max: 100, // Maximum allowed value. Type: floating point number.
        step: 0,  // Determines the amount of each interval the slider takes between min and max. Use 0 to disable step. 
                  // For example, if min = 0, max = 1 and step = 0.25, the user can only select the following values: 0, 0.25, 0.5, 0.75 and 1.
                  // Type: positive floating point number.
        snapOnDrag: false, // Determines whether the handle snaps to each step during mouse dragging. Only meaningful if a non zero step is defined. Type: boolean.
        enabled: true,    // Determines whether the control is editable. Type: boolean.
        flipped: false,   // Indicates the values direction. Type: boolean.
                          //   false - for horizontal sliders, the minimum is located on the left, maximum on the right. For vertical sliders, the minimum on the top, maximum on the bottom.
                          //   true - for horizontal sliders, the maximum is located on the left, minimum on the right. For vertical sliders, the maximum on the top, minimum on the bottom.
        contentOffset: 0.5, // For horizontal sliders: Relative vertical position for content; For vertical sliders: Relative horizontal position for content. Ignored when SVG ruler is used.
        paddingStart: 0,
        paddingEnd: 0,
        style: {          // CSS style classes. You can use more than one class, separated by a space. Type: string.
            classSlider: 'sliderlens',
            classFixed: 'fixed',
            classHoriz: 'horiz',
            classVert: 'vert',
            classDisabled: 'disabled',
            classHandle: 'handle',
            classHandle1: 'handle1',
            classHandle2: 'handle2',
            classHighlightRange: 'range',                        // range bar (used when range is not false)
            classHighlightRangeDraggable: 'drag',                           // added to the range bar when user can drag it
            classDragging: 'dragging',                         // style applied while the handle is being dragged by the mouse


            classSliderlensHoriz: 'sliderlens-horiz',                       // class added to the original horizontal slider markup and to the unscaled canvas (when ruler is used)
            classSliderlensVert: 'sliderlens-vert',                         // class added to the original vertical slider markup and to the unscaled canvas (when ruler is used)
            classSliderLensHorizOverflow: 'sliderlens-horiz-overflow',      // class added to the parent of the original horizontal slider markup and to the unscaled canvas (when ruler is used).
            classSliderLensVertOverflow: 'sliderlens-vert-overflow',        // class added to the parent of the original vertical slider markup and to the unscaled canvas (when ruler is used).
            classHorizHandle: 'sliderlens-horiz-handle round flare',             // non fixed handle used in in horizontal sliders
            classVertHandle: 'sliderlens-vert-handle round flare',               // non fixed handle used in in vertical sliders
            classHorizFixedHandle: 'sliderlens-horiz-fixedhandle round flare',   // fixed handle used in in horizontal sliders
            classVertFixedHandle: 'sliderlens-vert-fixedhandle round flare',     // fixed handle used in in vertical sliders
            classHorizHandle1: 'sliderlens-horiz-handle1 round flare',           // non fixed leftmost handle in horizontal sliders
            classHorizHandle2: 'sliderlens-horiz-handle2 round flare',           // non fixed rightmost handle in horizontal sliders
            classVertHandle1: 'sliderlens-vert-handle1 round flare',             // non fixed topmost handle in vertical sliders
            classVertHandle2: 'sliderlens-vert-handle2 round flare',             // non fixed bottommost handle in vertical sliders
            classHandleDisabled: 'sliderlens-disabled'                     // disabled handle
        },

        // handle is the cursor that the user can drag around to select values
        handle: {
            size: .3,   // Relative handle width (for horizontal sliders) or relative handle height (for vertical sliders). Type: Floating number between 0 and 1, inclusive.
                        // For horizontal sliders, it is the handle width relative to the slider width, e.g.,
                        // if slider width is 500px and handle size is .3, then handle size becomes (500px * 30%) = 150px in width.
                        // For vertical sliders, it is the handle height relative to the slider height.
                        // If two handles are used, then this is the size of both handles together, which means each handle has a size of size/2.

            zoom: 1.25, // Magnification factor applied inside the handle. Type: positive floating point number.
                        // If greater than 1, the content is magnified.
                        // If 1, the content remains the same size.
                        // if smaller than 1, the content is shrinked.

            relativePos: 0.5, // Indicates the middle handle relative position (0% - 100%) Type: floating point number >= 0 and <= 1.
                              // NOT aplicable for fixed handled sliders.
                              // For horizontal sliders, a value of 0 aligns the middle of the handle to the top of the outer element,
                              // 1 aligns the middle of the handle to the bottom of the outer element.
                              // For vertical sliders, a value of 0 aligns the middle of the handle to the left of the outer element,
                              // 1 aligns the middle of the handle to the right of the outer element.

            otherSize: 'zoom', // Relative handle height (for horizontal sliders) or relative handle width (for vertical sliders). Type: string or floating point number >= 0.
                               // NOT aplicable for fixed handled sliders.
                               // If set to string 'zoom' the otherSize is set according to the handle.zoom value,
                               // e.g. if the handle.zoom is 1.25, then the otherSize is also 1.25 (or 125% of the slider size).
                               // If set to a loating point number, it represents a relative size, e.g. if set to 1, then handle size will have
                               // the same size (100%) of the slider element.

            animation: 100,   // Duration (ms or jQuery string alias) of animation that happens when handle needs to move to a different location (triggered by a mouse click on the slider).
                              // Use 0 to disable animation. Type: positive integer or string.

            easing: 'swing', // Easing function used for the handle animation (@see http://api.jquery.com/animate/#easing). Type: string.

            mousewheel: 1  // Threshold factor applied to the handle when using the mouse wheel. Type: floating point number.
                           // when = 0, mouse wheel cannot be used to move the handle;
                           // when > 0 and mouse wheel goes up, then handle moves to the right (for horizontal sliders) or up (for vertical sliders)
                           // when > 0 and mouse wheel goes down, then handle moves to the left (for horizontal sliders) or down (for vertical sliders)
                           // when < 0 and mouse wheel goes up, then handle moves to the left (for horizontal sliders) or down (for vertical sliders)
                           // when < 0 and mouse wheel goes down, then handle moves to the right (for horizontal sliders) or up (for vertical sliders)
        },
        
        // Ruler rendering data. Should you decide to use a ruler, SliderLens can automatically render one for you, or you can render a customized one.
        ruler: {
            visible: true,          // Determines whether the ruler is shown. Type: boolean.
                                    // true - svg ruler is displayed.
                                    // false - the original content is displayed.
                                    // Note: If the plug-in is attached to a DOM element that contains no content at all (no children),
                                    //       then this property is set to true and a ruler is displayed instead (since there is nothing to display from the DOM element).
                                    // There is more to this, please see onDraw below.

            labels: {               // Configuration data for the labels that appear in the ruler.
                visible: true,          // Determines whether value labels are displayed. Type: boolean.
                values: 'step',

                relativePos: 0.5,       // Indicates the label relative (0% - 100%) position. Type: floating point number >= 0 and <= 1.
                                        // For horizontal sliders, a value of 0 aligns the labels to the top, 1 aligns it to the bottom. Labels are center justified in horizontal sliders.
                                        // For vertical sliders, a value of 0 aligns the labels to the left, 1 aligns it to the right. 

                vertJustify: 'left',    // For vertical sliders, indicates whether shorter labels are left, center or right justified in relation to the widest label. Type: string 'left', 'center' or 'right'
                                        // For horizontal sliders has no effect.

                onSvgTransform: null    // For each label, the result of this event is added as a transform parameter to the SVG text element. Type: function (x, y).
                                        /* Example: to rotate labels 45 degrees use:
                                            $(".myElement").rsSliderLens({
                                                ruler: {
                                                    labels: {
                                                        onSvgTransform: function (x, y) {
                                                            return 'rotate(45 ' + x + ',' + y + ')';
                                                        }
                                                    }
                                            });
                                        */
            },
            tickMarks: {
                short: {
                    visible: true,
                    step: 1,
                    stroke: 'black',
                    relativePos: .1,
                    relativeSize: .15
                },
                long: {
                    visible: true,
                    step: 10,
                    stroke: 'black',
                    relativePos: .1,
                    relativeSize: .3
                }
            },
            onDraw: null   // Event used for customized rulers. Type: function($svg, width, height, createSvgDomFunc)
                           // If onDraw event is not defined and ruler.visible is true, then a custom ruler is generated.
                           // If onDraw event is not defined and ruler.visible is false, then no ruler is displayed and the original content is shown.
                           // If onDraw event is defined and ruler.visible is true, then onDraw is used to draw on top of the generated ruler.
                           // If onDraw event is defined and ruler.visible is false, then use onDraw to create your own custom ruler from scratch.
        },
        range: {
            type: 'hidden', // Specifies a range contained in [min, max]. This range can be used to restrict input even further, or to simply highlight intervals.
                            // Type: string or array of two floating point numbers
                            //   'hidden' (or false or undefined) - no range.
                            //   'between' (or true) - range between current handles. Only applicable for double handles (see value).
                            //   'min' - range between min and the first handle.
                            //   'max' - range between handle and max, or - when two handles are used - between second handle and max.
                            //   [from, to] - Defines a range that restricts the input to the interval [from, to].
                            //                For example, if min = 20 and max = 100 and range = [50, 70], then it is not possible to select values smaller than 50 or greater than 70
                            //   The style of the range area is defined by classHighlightRange.
            draggable: false, // Determines whether the user can move a range by dragging it with the mouse. Type: boolean.
                              // Not applicable for fixed handle sliders.
            relativePos: .5,
            size: .25
        },
        keyboard: {
            allowed: ['left', 'right', 'up', 'down', 'home', 'end', 'pgup', 'pgdown', 'esc'], // Allowed keys. Type: String array.
            animation: 250, // Duration (ms or jQuery string alias) of the animation that the handle takes. Type: positive integer or string.
            easing: 'swing',    // Easing function used in keyboard animation (@see http://api.jquery.com/animate/#easing). Type: string.
            numPages: 5         // Number of pages in a slider (how many times can you page up/down to go through the whole range). Type: positive integer.
        },
        onChange: null,         // Event fired when value changes (when handle moves). Type: function (event, value, isFirstHandle).
        onFinalChange: null,    // Event fired for the final value set after the animation has finished or after a mouse dragging. Type: function (event, value, isFirstHandle).
        onCreate: null          // Event fired after the plug-in has been initialized. Type: function (event).
    };
    // Note: If the plug-in is associated with an <input type="range" ...>, the options 
    // "value", "min", "max", "step" and "enabled" are set according to their respective html attributes present in the markup.
    // A particular case is the "enabled" option that retrieves the value from the "disabled" html attribute.
    // If the markup does not contain these attributes, then these options take their values from the rsSliderLens constructor instead.

})(jQuery);