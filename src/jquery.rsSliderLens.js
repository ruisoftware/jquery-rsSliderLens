/**
* jQuery SliderLens - Range slider with magnification
* ====================================================
*
* Licensed under The MIT License
* 
* @author    Jose Rui Santos
*
* 
* For info, please scroll to the bottom.
*/
(function ($, undefined) {
    'use strict';
    var SliderLensClass = function ($elem, opts) {
        var
            // content that appears outside the handle 
            elemOrig = {
                $wrapper: null,
                $svg: null,
                tabindexAttr: null,
                autofocusable: false,
                initSvgOutsideHandle: function () {
                    var css = {
                        left: (info.isFixedHandle ? (info.isHoriz ? elemHandle.fixedHandleRelPos*100 : 50) : 0) + '%',
                        top: (info.isFixedHandle ? (info.isHoriz ? 50 : elemHandle.fixedHandleRelPos*100) : 0) + '%'
                    };
                    if (info.isFixedHandle) {
                        $elem.css(info.isHoriz ? 'height' : 'width', (info.isHoriz ? elemMagnif.height : elemMagnif.width) + 'px');
                    } else {
                        css.height = css.width = '100%';
                    }
                    this.$svg = util.createSvg(this.width, this.height).css(css);
                    if (opts.ruler.visible) {
                        util.renderSvg(this.$svg, this.width, this.height);
                    }
                    $elem.triggerHandler('customRuler.rsSliderLens', [this.$svg, this.width, this.height, 1, false, util.createSvgDom]);
                    this.$svg.prependTo(this.$wrapper);
                    $elem.css('visibility', 'hidden'); // because the svg ruler is used instead of the original slider content
                },
                initSize: function ($e) {
                    var $sizeElem = $e || $elem;
                    if ($e === undefined) {
                        if ((opts.width === 'auto' || opts.height === 'auto') && $sizeElem.css('display') === 'inline') {
                            $sizeElem.css('display', 'inline-block'); // in order to retrieve the correct dimensions
                        }
                        this.width = (opts.width === 'auto' ? $sizeElem.width() : opts.width) || 150;
                        this.height = (opts.height === 'auto' ? $sizeElem.height() : opts.height) || 50;
                    }
                    if ($e !== undefined || !info.isFixedHandle || info.hasRuler) {
                        if ($sizeElem.width() === 0 || opts.width !== 'auto' || $e !== undefined && info.isHoriz) {
                            $sizeElem.width(this.width);
                        }
                        if ($sizeElem.height() === 0 || opts.height !== 'auto' || $e !== undefined && !info.isHoriz) {
                            $sizeElem.height(this.height);
                        }
                    }
                    if ($e === undefined) {
                        info.isHoriz = opts.orientation === 'auto' ? this.width >= this.height : opts.orientation !== 'vert';
                    } else {
                        if (info.isFixedHandle && !info.hasRuler) {
                            if (info.isHoriz) {
                                $sizeElem.height(this.height*opts.handle.zoom);
                            } else {
                                $sizeElem.width(this.width*opts.handle.zoom);
                            }
                        }
                    }
                },
                init: function () {
                    this.tabindexAttr = $elem.attr('tabindex');
                    this.autofocusable = $elem.attr('autofocus');
                    this.style = $elem.attr('style');
                    info.isFixedHandle = opts.fixedHandle !== false;
                    if (info.isFixedHandle) {
                        elemHandle.fixedHandleRelPos = opts.fixedHandle === true ? 0.5 : (opts.flipped ? 1 - opts.fixedHandle : opts.fixedHandle);
                    } else {
                        elemHandle.fixedHandleRelPos = 0;
                    }
                    this.initSize();
                    if (!info.hasRuler) {
                        $elem.css(info.isHoriz ? 'width' : 'height', 'auto');
                        this.initSize();
                        if (info.isFixedHandle) {
                            if (info.isHoriz) {
                                $elem.css('line-height', this.height*opts.handle.zoom + 'px');
                            } else {
                                $elem.css('width', this.width*opts.handle.zoom + 'px');
                            }
                        }
                    }

                    var elemPosition = $elem.css('position'),
                        elemPos = $elem.position(),
                        elemCss = {
                            display: 'inline-block',
                            position: 'relative',
                            'white-space': 'nowrap'
                        };
                    if (!info.isHoriz) {
                        elemCss.left = opts.contentOffset*100 + '%';
                    }
                    this.$wrapper = $elem.css(elemCss).wrap('<div>').parent().
                        css({
                            overflow: (info.isFixedHandle ? 'hidden' : 'visible'),
                            display: 'inline-block'
                        }).
                        addClass(opts.style.classSlider).
                        addClass(info.isFixedHandle ? opts.style.classFixed : null).
                        addClass(info.isHoriz ? opts.style.classHoriz : opts.style.classVert).
                        addClass(opts.enabled ? null : opts.style.classDisabled);

                    if (info.isFixedHandle) {
                        $elem.css(info.isHoriz ? 'left' : 'top', elemHandle.fixedHandleRelPos*100 + '%');
                    } else {
                        if (info.isHoriz) {
                            $elem.css('transform', 'translateY(' + (opts.contentOffset*100 - 50) + '%)');
                        } else {
                            $elem.css('transform', 'translateX(-50%)');
                        }
                    }

                    // set again width and height, as css set above might change dimensions
                    this.initSize(this.$wrapper);
                    if (info.hasRuler && info.isFixedHandle) {
                        this[info.isHoriz ? 'width' : 'height'] *= opts.ruler.size;
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
                $rangeWrapper: null,
                $range: null,
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
                    var cssCommon = {
                            display: 'inline-block',
                            position: 'absolute'
                        },
                        cssWrapper = {
                            overflow: 'hidden'
                        },
                        cssInner = {},
                        value;

                    if (info.isHoriz) {
                        cssWrapper.top = opts.range.pos*100 + '%';
                        cssWrapper.height = info.isFixedHandle ? elemOrig.height*opts.range.size + 'px' : opts.range.size*100 + '%';
                        cssWrapper.transform = 'translateY(-50%)';
                        cssInner.height = '100%';
                    } else {
                        cssWrapper.left = opts.range.pos*100 + '%';
                        cssWrapper.width = info.isFixedHandle ? elemOrig.width*opts.range.size + 'px' : opts.range.size*100 + '%';
                        cssWrapper.transform = 'translateX(-50%)';
                        cssInner.width = '100%';
                    }

                    switch (opts.range.type) {
                        case 'min': cssInner[this.getPropMin()] = '0%';
                                    value = (info.getCurrValue(info.currValue[0]) - opts.min)/(opts.max - opts.min)*100;
                                    cssInner[this.getPropMax()] = (opts.flipped ? value : 100 - value) + '%';
                                    break;
                        case 'max': cssInner[this.getPropMax()] = '0%';
                                    value = (info.getCurrValue(info.currValue[0]) - opts.min)/(opts.max - opts.min)*100;
                                    cssInner[this.getPropMin()] = (opts.flipped ? 100 - value : value) + '%';
                                    break;
                        default:
                            if (info.isRangeFromToDefined) {
                                cssInner[this.getPropMin()] = (opts.range.type[0] - opts.min)/(opts.max - opts.min)*100 + '%';
                                cssInner[this.getPropMax()] = (opts.max - opts.range.type[1])/(opts.max - opts.min)*100 + '%';
                            }
                    }
                    if (info.isFixedHandle) {
                        cssWrapper[info.isHoriz ? 'width' : 'height'] = Math.round(elemOrig[info.isHoriz ? 'width' : 'height']*(1 - opts.paddingStart - opts.paddingEnd)) + 'px';
                        cssWrapper[info.isHoriz ? 'left' : 'top'] = elemHandle.fixedHandleRelPos*100 + '%';
                    } else {
                        cssWrapper[this.getPropMin()] = opts.paddingStart*100 + '%';
                        cssWrapper[this.getPropMax()] = opts.paddingEnd*100 + '%';
                    }

                    this.$rangeWrapper = $('<div>').css(cssCommon).css(cssWrapper).addClass(opts.style.classRange);
                    if (!info.hasRuler) {
                        this.$rangeWrapper.hide();
                    }
                    if (opts.range.type && opts.range.type !== 'hidden') {
                        this.$range = $('<div>').css(cssCommon).css(cssInner);
                        this.$rangeWrapper.append(this.$range);
                    }
                    if (info.canDragRange) {
                        this.$rangeWrapper.addClass(opts.style.classRangeDraggable);
                    }
                },
                appendToDOM: function (beforeHandle) {
                    if (beforeHandle) {
                        elemRange.$rangeWrapper.insertBefore(elemHandle.$elem1st);
                    } else {
                        elemRange.$rangeWrapper.appendTo(elemOrig.$wrapper);
                    }
                    if (elemMagnif.$elemRange1st) {
                        elemMagnif.$elemRange1st.appendTo(elemHandle.$elem1st);
                    }
                    if (elemMagnif.$elemRange2nd) {
                        elemMagnif.$elemRange2nd.appendTo(elemHandle.$elem2nd);
                    }
                },
                doUpdate: function (pos, isFirstHandle, $range, minCond, maxCond) {
                    if ($range) {
                        switch (opts.range.type) {
                            case 'min':
                                if (minCond) {
                                    $range.css(elemRange.getPropMax(), (opts.flipped ? pos : 100 - pos) + '%');
                                }
                                break;
                            case 'max':
                                if (maxCond) {
                                    $range.css(elemRange.getPropMin(), (opts.flipped ? 100 - pos : pos) + '%');
                                }
                                break;
                            case true:
                            case 'between':
                                if (isFirstHandle) {
                                    $range.css(opts.flipped ? elemRange.getPropMax() : elemRange.getPropMin(), pos + '%');
                                } else {
                                    $range.css(opts.flipped ? elemRange.getPropMin() : elemRange.getPropMax(), (100 - pos) + '%');
                                }
                        }
                    }
                },
                update: function (pos, isFirstHandle) {
                    elemRange.doUpdate(pos, isFirstHandle, elemRange.$range,
                        !info.doubleHandles || !opts.flipped && isFirstHandle || opts.flipped && !isFirstHandle,
                        !info.doubleHandles || opts.flipped && isFirstHandle || !opts.flipped && !isFirstHandle);
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
                    var contentOffset = info.hasRuler ? 0.5 : opts.contentOffset,
                        otherSize = info.isFixedHandle ? 1 : (opts.handle.otherSize === 'zoom' ? opts.handle.zoom : opts.handle.otherSize),
                        pos = ((contentOffset - (info.isFixedHandle ? 0.5 : opts.handle.pos))/otherSize + 0.5)*100 + '%';
                    return info.isHoriz ? {
                            left: (info.doubleHandles ? '100%' : '50%'),
                            top: pos
                        } : {
                            left: pos,
                            top: (info.doubleHandles ? '100%' : '50%')
                        };
                },
                initClone: function () {
                    this.$elem1st = $elem.clone().css('transform-origin', '0 0').
                        css(this.getRelativePosition()).removeAttr('tabindex autofocus id');
                    if (info.isHoriz) {
                        if (info.isFixedHandle) {
                            this.$elem1st.css('top', '');
                            if (!info.hasRuler) {
                                this.$elem1st.css('line-height', elemOrig.height + 'px');
                            }
                        }
                    } else {
                        if (!info.isFixedHandle && !info.hasRuler) {
                            this.$elem1st.css('width', elemOrig.width*opts.handle.zoom + 'px');
                        }
                    }

                    if (info.doubleHandles) {
                        this.$elem2nd = this.$elem1st.clone().css(info.isHoriz ? 'left' : 'top', '');
                    }
                },
                initSvgHandle: function () {
                    elemOrig.initSvgOutsideHandle();
                    this.$elem1st = util.createSvg(this.width, this.height).css(this.getRelativePosition());
                    if (opts.ruler.visible) {
                        util.renderSvg(this.$elem1st, this.width, this.height, !util.areTheSame(opts.handle.zoom, 1));
                    }
                    $elem.triggerHandler('customRuler.rsSliderLens', [this.$elem1st, this.width, this.height, opts.handle.zoom, true, util.createSvgDom]);
                    if (info.doubleHandles) {
                        this.$elem2nd = this.$elem1st.clone().css(info.isHoriz ? 'left' : 'top', '');
                    }
                    return true;
                },
                init: function () {
                    this.width = elemOrig.width*opts.handle.zoom;
                    this.height = elemOrig.height*opts.handle.zoom;
                    if (info.hasRuler) { 
                        this.initSvgHandle();
                    } else {
                        this.initClone();
                    }
                },
                resizeUpdate: function () {
                    info.updateTicksStep();
                    var newWidth = elemOrig.$wrapper.width(),
                        newHeight = elemOrig.$wrapper.height();
                    if (!info.isFixedHandle) {
                        elemMagnif.$elem1st.add(elemMagnif.$elem2nd).css({
                            width: newWidth*opts.handle.zoom,
                            height: newHeight*opts.handle.zoom
                        });
                    }
                    this.initRanges(newWidth, newHeight);
                    if (info.isRangeFromToDefined) {
                        if (info.doubleHandles) {
                            info.setValue(info.currValue[0], opts.flipped ? elemHandle.$elem2nd : elemHandle.$elem1st, true);
                            info.setValue(info.currValue[1], opts.flipped ? elemHandle.$elem1st : elemHandle.$elem2nd, true);
                        } else {
                            info.setValue(info.currValue[0], elemHandle.$elem1st, true);
                        }
                    }
                },
                createMagnifRange: function (isFirstHandle, newWidth, newHeight) {
                    var cssWrapper = {};
                    cssWrapper[info.isHoriz ? 'width' : 'height'] = Math.round((info.isHoriz ? newWidth : newHeight)*(1 - opts.paddingStart - opts.paddingEnd)*opts.handle.zoom) + 'px';
                    cssWrapper[info.isHoriz ? 'left' : 'top'] = info.doubleHandles ? (isFirstHandle ? '100%' : '0%') : '50%';
                    cssWrapper[info.isHoriz ? 'height' : 'width'] = info.isFixedHandle ? opts.range.size*elemMagnif[info.isHoriz ? 'height' : 'width'] + 'px' : opts.range.size*100 + '%';
                    if (isFirstHandle && elemMagnif.$elemRange1st) {
                        return elemMagnif.$elemRange1st.css(cssWrapper);
                    }
                    if (!isFirstHandle && elemMagnif.$elemRange2nd) {
                        return elemMagnif.$elemRange2nd.css(cssWrapper);
                    }
                    return elemRange.$rangeWrapper.clone().css(cssWrapper);
                },
                initRanges: function (newWidth, newHeight) {
                    if (newWidth === undefined) {
                        newWidth = elemOrig.width;
                    }
                    if (newHeight === undefined) {
                        newHeight = elemOrig.height;
                    }
                    this.$elemRange1st = elemMagnif.createMagnifRange(true, newWidth, newHeight);
                    if (info.doubleHandles) {
                        this.$elemRange2nd = elemMagnif.createMagnifRange(false, newWidth, newHeight);
                        switch (opts.range.type) {
                            case 'min':
                                (opts.flipped ? this.$elemRange1st : this.$elemRange2nd).empty();
                                break;
                            case 'max':
                                (opts.flipped ? this.$elemRange2nd : this.$elemRange1st).empty();
                                break;
                            case true:
                            case 'between':
                                this.$elemRange1st.add(this.$elemRange2nd).empty();
                        }
                    }
                },
                updateRanges: function (pos, isFirstHandle) {
                    elemRange.doUpdate(pos, isFirstHandle,
                        isFirstHandle ? elemMagnif.$elemRange1st.children() : elemMagnif.$elemRange2nd.children(), true, true);
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
                key: {
                    left: 37,
                    up: 38,
                    right: 39,
                    down: 40,
                    pgUp: 33,
                    pgDown: 34,
                    home: 36,
                    end: 35,
                    esc: 27
                },
                init: function () {
                    var css = {
                            display: 'inline-block',
                            overflow: 'hidden',
                            outline: 'none',
                            position: 'absolute'
                        };

                    if (info.isHoriz) {
                        css.width = opts.handle.size*100 + '%';
                        if (info.isFixedHandle) {
                            css.left = this.fixedHandleRelPos*100 + '%';
                            css.top = 0;
                            css.bottom = 0;
                            css.transform = 'translateX(-50%)';
                        } else {
                            css.top = opts.handle.pos*100 + '%';
                            css.height = (opts.handle.otherSize === 'zoom' ? opts.handle.zoom : opts.handle.otherSize)*100 + '%';
                            css.transform = 'translate(-' + (info.doubleHandles ? 100 : 50) + '%, -50%)';
                        }
                    } else {
                        css.height = opts.handle.size*100 + '%';
                        if (info.isFixedHandle) {
                            css.top = this.fixedHandleRelPos*100 + '%';
                            css.left = 0;
                            css.right = 0;
                            css.transform = 'translateY(-50%)';
                        } else {
                            css.left = opts.handle.pos*100 + '%';
                            css.width = (opts.handle.otherSize === 'zoom' ? opts.handle.zoom : opts.handle.otherSize)*100 + '%';
                            css.transform = 'translate(-50%, -' + (info.doubleHandles ? 100 : 50) + '%)';
                        }
                    }
                    this.$elem1st = elemMagnif.$elem1st.wrap('<div>').parent().
                        addClass(info.doubleHandles ? opts.style.classHandle1 : opts.style.classHandle).css(css);
                    this.bindTabEvents(true);
                    
                    if (info.doubleHandles) {
                        this.$elem2nd = elemMagnif.$elem2nd.wrap('<div>').parent().
                            addClass(opts.style.classHandle2).css(css).css('transform', 'translate' + (info.isHoriz ? 'Y(-50%)' : 'X(-50%)'));
                        this.bindTabEvents(false);
                    }
                },
                bindTabEvents: function (firstHandle) {
                    if ((elemOrig.tabindexAttr || info.isInputTypeRange) && opts.enabled) {
                        var bindForSecondHandle = function () {
                            elemHandle.$elem2nd.
                                attr('tabindex', elemOrig.tabindexAttr || 0).
                                bind('focusin.rsSliderLens', panUtil.gotFocus2nd).
                                bind('focusout.rsSliderLens', panUtil.loseFocus);
                        };

                        if (firstHandle || firstHandle === undefined) {
                            $elem.removeAttr('tabindex');
                            this.$elem1st.
                                attr('tabindex', elemOrig.tabindexAttr || 0).
                                bind('focusin.rsSliderLens', panUtil.gotFocus1st).
                                bind('focusout.rsSliderLens', panUtil.loseFocus);
                            
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
                    if ((elemOrig.tabindexAttr || info.isInputTypeRange) && !opts.enabled) {
                        this.$elem1st.add(this.$elem2nd).removeAttr('tabindex autofocus').unbind('focusout.rsSliderLens', panUtil.loseFocus);
                        this.$elem1st.unbind('focusin.rsSliderLens', panUtil.gotFocus1st);
                        if (this.$elem2nd) {
                            this.$elem2nd.unbind('focusin.rsSliderLens', panUtil.gotFocus2nd);
                        }
                    }
                },
                navigate: function (pixelOffset, valueOffset, duration, easingFunc, limits, $animHandle) {
                    if (!panUtil.$animObj) { // continue only if there is not an old animation still runing
                        var currValue = info.currValue[!info.doubleHandles || panUtil.$handle === elemHandle.$elem1st? 0 : 1],
                            toValue;
                        if (info.isStepDefined) {
                            toValue = Math.round((currValue + valueOffset - opts.min)/opts.step)*opts.step + opts.min;
                        } else {
                            toValue = currValue + pixelOffset/info.ticksStep;
                        }
                        if (limits !== undefined) {
                            if (toValue < limits[0]) { toValue = limits[0]; }
                            if (toValue > limits[1]) { toValue = limits[1]; }
                        }
                        if (toValue < opts.min) { toValue = opts.min; }
                        if (toValue > opts.max) { toValue = opts.max; }
                        panUtil.gotoAnim(currValue, toValue, duration, easingFunc, $animHandle);
                    }
                },
                keydown: function (event) {
                    var allowedKey = function () {
                        switch (event.which) {
                            case elemHandle.key.left:   return $.inArray('left', opts.keyboard.allowed) > -1;
                            case elemHandle.key.down:   return $.inArray('down', opts.keyboard.allowed) > -1; 
                            case elemHandle.key.right:  return $.inArray('right', opts.keyboard.allowed) > -1;
                            case elemHandle.key.up:     return $.inArray('up', opts.keyboard.allowed) > -1;
                            case elemHandle.key.pgUp:   return $.inArray('pgup', opts.keyboard.allowed) > -1;
                            case elemHandle.key.pgDown: return $.inArray('pgdown', opts.keyboard.allowed) > -1;
                            case elemHandle.key.home:   return $.inArray('home', opts.keyboard.allowed) > -1;
                            case elemHandle.key.end:    return $.inArray('end', opts.keyboard.allowed) > -1;
                            case elemHandle.key.esc:    return $.inArray('esc', opts.keyboard.allowed) > -1;
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
                            case elemHandle.key.left:
                            case elemHandle.key.down:
                                panUtil.beingDraggedByKeyboard = true;
                                elemHandle.navigate(info.isHoriz ? -1 : 1, info.isHoriz ? -opts.step: opts.step, info.isStepDefined ? opts.handle.animation*opts.step/(opts.max - opts.min) : 0, opts.keyboard.easing, limits);
                                break;
                            case elemHandle.key.right: 
                            case elemHandle.key.up:
                                panUtil.beingDraggedByKeyboard = true;
                                elemHandle.navigate(info.isHoriz ? 1 : -1, info.isHoriz ? opts.step : -opts.step, info.isStepDefined ? opts.handle.animation*opts.step/(opts.max - opts.min) : 0, opts.keyboard.easing, limits);
                                break;
                            case elemHandle.key.pgUp:
                            case elemHandle.key.pgDown:
                                /*jshint -W030 */
                                event.which === elemHandle.key.pgUp ?
                                    elemHandle.navigate((info.fromPixel - info.toPixel)/opts.keyboard.numPages, (opts.min - opts.max)/opts.keyboard.numPages, opts.handle.animation/opts.keyboard.numPages, opts.keyboard.easing, limits)
                                    : elemHandle.navigate((info.toPixel - info.fromPixel)/opts.keyboard.numPages, (opts.max - opts.min)/opts.keyboard.numPages, opts.handle.animation/opts.keyboard.numPages, opts.keyboard.easing, limits);
                                break;
                            case elemHandle.key.home: panUtil.gotoAnim(currValue, limits[0], opts.handle.animation, opts.keyboard.easing); break;
                            case elemHandle.key.end:  panUtil.gotoAnim(currValue, limits[1], opts.handle.animation, opts.keyboard.easing); break;
                            case elemHandle.key.esc:
                                if (info.doubleHandles) {
                                    panUtil.gotoAnim(info.currValue[0], info.uncommitedValue[0], opts.handle.animation, opts.keyboard.easing, elemHandle.$elem1st);
                                    panUtil.gotoAnim(info.currValue[1], info.uncommitedValue[1], opts.handle.animation, opts.keyboard.easing, elemHandle.$elem2nd);
                                } else {
                                    panUtil.gotoAnim(info.currValue[0], info.uncommitedValue[0], opts.handle.animation, opts.keyboard.easing);
                                }
                                info.currValue[0] = info.uncommitedValue[0];
                                info.currValue[1] = info.uncommitedValue[1];
                        }
                    }
                },
                keyup: function (event) {
                    switch (event.which) {
                        case elemHandle.key.left:
                        case elemHandle.key.down:
                        case elemHandle.key.right: 
                        case elemHandle.key.up:
                            if (!panUtil.beingDraggedByKeyboard) {
                                events.processFinalChange(panUtil.$handle);
                            }
                            panUtil.beingDraggedByKeyboard = false;
                    }
                },
                onMouseWheel: function (event) {
                    if (!opts.enabled || util.isAlmostZero(opts.step)) {
                        return;
                    }
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
                    var step = opts.step*opts.handle.mousewheel,
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
                            break;
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
 
                            if (values[1] !== null) {
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
                                    elemOrig.$wrapper.addClass(opts.style.classDisabled);
                                    elemHandle.unbindTabEvents();
                                }
                            } else {
                                if (value === true) {
                                    if (!opts.enabled) {
                                        // from disabled to enabled
                                        opts.enabled = true;
                                        elemOrig.$wrapper.removeClass(opts.style.classDisabled);
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
                                        panUtil.gotoAnim(info.currValue[0], value[0], opts.handle.animation, opts.keyboard.easing, elemHandle.$elem1st);
                                    }
                                    if (value[1] !== null) {
                                        panUtil.gotoAnim(info.currValue[1], value[1], opts.handle.animation, opts.keyboard.easing, elemHandle.$elem2nd);
                                    }
                                }
                            } else {
                                if (!twoValues) {
                                    panUtil.gotoAnim(info.currValue[0], info.getCurrValue(value), opts.handle.animation, opts.keyboard.easing);
                                }
                            }
                            break;
                        case 'range':
                            if (value) {
                                if (info.doubleHandles || value.type !== true && value.type !== 'between') { // single handles with range = true are ignored, since range true is only supported for double handle sliders
                                    if (elemMagnif.$elemRange1st) {
                                        elemMagnif.$elemRange1st.remove();
                                        elemMagnif.$elemRange1st = null;
                                    }
                                    if (elemMagnif.$elemRange2nd) {
                                        elemMagnif.$elemRange2nd.remove();
                                        elemMagnif.$elemRange2nd = null;
                                    }
                                    elemRange.$rangeWrapper.remove();

                                    opts.range = $.extend({}, opts.range, value);
                                    info.initRangeVars();
                                    elemRange.init();
                                    elemMagnif.initRanges();
                                    elemRange.appendToDOM(true);
                                    if (Math.abs(opts.handle.mousewheel) > 0.5) {
                                        elemRange.$rangeWrapper.bind('DOMMouseScroll.rsSliderLens mousewheel.rsSliderLens', elemHandle.onMouseWheel);
                                    }
                                    if (info.canDragRange) {
                                        elemRange.$range.bind('mousedown.rsSliderLens touchstart.rsSliderLens', panRangeUtil.startDrag);
                                    }
                                    noIEdrag(elemRange.$rangeWrapper);
                                    noIEdrag(elemMagnif.$elemRange1st);
                                    if (info.doubleHandles) {
                                        noIEdrag(elemMagnif.$elemRange2nd);
                                    }
                                    info.updateHandles(info.currValue);
                                }
                            }
                    }
                    return events.onGetter(event, field);
                },
                onResizeUpdate: function () {
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
                onDestroy: function () {
                    $elem.add(elemOrig.$wrapper).add(elemOrig.$canvas).add(elemRange.$rangeWrapper).add(elemHandle.$elem1st).add(elemHandle.$elem2nd).
                        unbind('DOMMouseScroll.rsSliderLens mousewheel.rsSliderLens', elemHandle.onMouseWheel);

                    $elem.
                        unbind('getter.rsSliderLens', events.onGetter).
                        unbind('setter.rsSliderLens', events.onSetter).
                        unbind('resizeUpdate.rsSliderLens', events.onResizeUpdate).
                        unbind('change.rsSliderLens', events.onChange).
                        unbind('finalchange.rsSliderLens', events.onFinalChange).
                        unbind('create.rsSliderLens', events.onCreate).
                        unbind('destroy.rsSliderLens', events.onDestroy).
                        unbind('customLabel.rsSliderLens', events.onCustomLabel).
                        unbind('customLabelAttrs.rsSliderLens', events.onCustomLabelAttrs).
                        unbind('customRuler.rsSliderLens', events.onCustomRuler);

                    elemOrig.$wrapper.
                        unbind('mousedown.rsSliderLens touchstart.rsSliderLens', panUtil.startDrag).
                        unbind('mouseup.rsSliderLens touchend.rsSliderLens', panUtil.stopDrag);

                    elemRange.$rangeWrapper.
                        unbind('mousedown.rsSliderLens touchstart.rsSliderLens', panUtil.startDrag);

                    if (elemRange.$range) {
                        elemRange.$range.
                            unbind('mousedown.rsSliderLens touchstart.rsSliderLens', panRangeUtil.startDrag);
                    }

                    $(document).
                        unbind('keydown.rsSliderLens', elemHandle.keydown).
                        unbind('keyup.rsSliderLens', elemHandle.keyup).
                        unbind('mousemove.rsSliderLens touchmove.rsSliderLens', info.isHoriz ? panUtil.dragHoriz : panUtil.dragVert).
                        unbind('mouseup.rsSliderLens touchend.rsSliderLens', panUtil.stopDragFromDoc).
                        unbind('mousemove.rsSliderLens touchmove.rsSliderLens', panRangeUtil.drag);

                    elemHandle.$elem1st.
                        unbind('focusin.rsSliderLens', panUtil.gotFocus1st).
                        unbind('focusout.rsSliderLens', panUtil.loseFocus).
                        unbind('mousedown.rsSliderLens touchstart.rsSliderLens', panUtil.startDrag).
                        unbind('mousedown.rsSliderLens touchstart.rsSliderLens', panUtil.startDragFromHandle1st);

                    if (elemHandle.$elem2nd) {
                        elemHandle.$elem2nd.
                            unbind('focusin.rsSliderLens', panUtil.gotFocus2nd).
                            unbind('focusout.rsSliderLens', panUtil.loseFocus).
                            unbind('mousedown.rsSliderLens touchstart.rsSliderLens', panUtil.startDragFromHandle2nd);
                    }

                    if (elemOrig.$canvas) {
                        elemOrig.$canvas.remove();
                    }
                    elemRange.$rangeWrapper.remove();
                    elemHandle.$elem1st.remove();
                    if (elemHandle.$elem2nd) {
                        elemHandle.$elem2nd.remove();
                    }
                    if (elemOrig.$svg) {
                        elemOrig.$svg.remove();
                    }
                    if (elemOrig.style) {
                        $elem.attr('style', elemOrig.style);
                    } else {
                        $elem.removeAttr('style');
                    }
                    if (elemOrig.tabindexAttr) {
                        $elem.attr('tabindex', elemOrig.tabindexAttr);
                    }
                    $elem.unwrap();
                },
                onCustomLabel: function (event, value) {
                    if (opts.ruler.labels.onCustomLabel) {
                        return opts.ruler.labels.onCustomLabel(event, value);
                    }
                    return value;
                },
                onCustomLabelAttrs: function (event, value, x, y) {
                    if (opts.ruler.labels.onCustomAttrs) {
                        return opts.ruler.labels.onCustomAttrs(event, value, x, y);
                    }
                },
                onCustomRuler: function (event, $svg, width, height, zoom, magnifiedRuler, createSvgDomFunc) {
                    if (opts.ruler.onCustom) {
                        return opts.ruler.onCustom(event, $svg, width, height, zoom, magnifiedRuler, createSvgDomFunc);
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
                isInputTypeRange: false, // whether the markup for this plug-in in an <input type="range">
                isHoriz: true,
                hasRuler: false,
                fromPixel: 0,
                toPixel: 0,
                doubleHandles: false,
                isRangeFromToDefined: false,
                isStepDefined: false,
                isAutoFocusable: false,
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
                        elemHandle.stopPosition[0] = info.currValue[0] = opts.value[0];
                        elemHandle.stopPosition[1] = info.currValue[1] = opts.value[1];
                    } else {
                        info.currValue[0] = opts.value;
                    }
                },
                initRangeVars: function () {
                    this.isRangeFromToDefined = (typeof opts.range.type === 'object') && opts.range.type.length === 2;
                    this.canDragRange = opts.range.draggable && opts.fixedHandle === false && (this.doubleHandles && (opts.range.type === true || opts.range.type === 'between') || this.isRangeFromToDefined);
                },
                initVars: function () {
                    this.initRangeVars();
                    // if fixed handle and two values are provided, then the second is discarded, as double handlers are not supported when a fixedHandle is used
                    if (opts.fixedHandle !== false && opts.value && (typeof opts.value === 'object') && opts.value.length === 2) {
                        opts.value = opts.value[0];
                    }
                    this.doubleHandles = !!opts.value && (typeof opts.value === 'object') && opts.value.length === 2;
                    var delta = opts.max - opts.min;
                    opts.step = opts.step < 0 ? 0 : (opts.step > delta ? delta : opts.step);
                    this.isStepDefined = opts.step > 0.00005;
                    this.isInputTypeRange = $elem.is('input[type=range]');
                    this.isAutoFocusable = (this.isInputTypeRange || $elem.attr('tabindex') !== undefined) && $elem.attr('autofocus') !== undefined;
                    this.hasRuler = opts.ruler.visible || !!opts.ruler.onCustom;
                    if (util.isAlmostZero(opts.handle.zoom)) {
                        opts.handle.zoom = 1;
                    }
                    if (util.isAlmostZero(opts.handle.otherSize)) {
                        opts.handle.otherSize = 1;
                    }
                    opts.handle.animation = util.getSpeedMs(opts.handle.animation);
                    if (opts.keyboard.numPages < 1) {
                        opts.keyboard.numPages = 5;
                    }
                    if (info.doubleHandles) {
                        opts.handle.size /= 2;
                    }
                },
                updateTicksStep: function () {
                    var $e = info.isFixedHandle ? (info.hasRuler ? elemOrig.$svg : $elem) : elemOrig.$wrapper,
                        size = info.isHoriz ? $e.width() : $e.height();
                    this.ticksStep = size*(1 - opts.paddingStart - opts.paddingEnd)/(opts.max - opts.min);
                    this.startPixel = size*(opts.flipped ? opts.paddingEnd : opts.paddingStart);
                    if (info.isRangeFromToDefined) {
                        if (opts.flipped) {
                            this.fromPixel = Math.round((opts.max - opts.range.type[1])*this.ticksStep);
                            this.toPixel = Math.round((opts.max - opts.range.type[0])*this.ticksStep);
                        } else {
                            this.fromPixel = Math.round((opts.range.type[0] - opts.min)*this.ticksStep);
                            this.toPixel = Math.round((opts.range.type[1] - opts.min)*this.ticksStep);
                        }
                    }
                },
                init: function () {
                    this.checkBounds();
                    this.updateTicksStep();
                    if (!info.isRangeFromToDefined) {
                        this.fromPixel = 0;
                        this.toPixel = Math.round((opts.max - opts.min)*this.ticksStep);
                    }
                },
                doSetHandles: function (values) {
                    if (info.doubleHandles) {
                        info.setValue(values[0], opts.flipped ? elemHandle.$elem2nd : elemHandle.$elem1st, info.isStepDefined, undefined, true);
                        info.setValue(values[1], opts.flipped ? elemHandle.$elem1st : elemHandle.$elem2nd, info.isStepDefined, undefined, true);
                        events.processFinalChange(true);
                        events.processFinalChange(false);
                    } else {
                        info.setValue(values[0], elemHandle.$elem1st, info.isStepDefined, undefined, true);
                        events.processFinalChange(true);
                    }
                },
                initHandles: function () {
                    if (info.doubleHandles) {
                        this.doSetHandles([info.getCurrValue(opts.value[0]), info.getCurrValue(opts.value[1])]);
                    } else {
                        this.doSetHandles([info.getCurrValue(opts.value)]);
                    }
                },
                updateHandles: function (values) {
                    this.doSetHandles(values);
                },

                checkLimits: function (value) {
                    var limit = opts.min;
                    if (info.isRangeFromToDefined) {
                        limit = info.getCurrValue(opts.range.type[opts.flipped ? 1 : 0]);
                        if (info.isStepDefined) {
                            limit = Math.ceil((limit - opts.min)/opts.step)*opts.step + opts.min;
                        }
                    }
                    if (value < limit) {
                        return limit;
                    }
                    limit = opts.max;
                    if (info.isRangeFromToDefined) {
                        limit = info.getCurrValue(opts.range.type[opts.flipped ? 0 : 1]);
                        if (info.isStepDefined) {
                            limit = Math.trunc((limit - opts.min)/opts.step)*opts.step + opts.min;
                        }
                    }
                    if (value > limit) {
                        return limit;
                    }
                    return value;
                },
                setValue: function (value, $handleElem, doSnap, checkOffLimits, forceOnChange) {
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
                        valueNoMin = Math.round(valueNoMin/opts.step)*opts.step;
                    }
                    if (info.isRangeFromToDefined) {
                        // make sure the handle is within range limits
                        var rangeBoundary = info.getCurrValue(opts.range.type[opts.flipped ? 1 : 0]) - opts.min;
                        rangeBoundary = Math.ceil(rangeBoundary/opts.step)*opts.step;
                        if (valueNoMin < rangeBoundary) {
                            valueNoMin = checkOffLimits ? rangeBoundary : (valueNoMin + opts.step);
                        } else {
                            rangeBoundary = info.getCurrValue(opts.range.type[opts.flipped ? 0 : 1]) - opts.min;
                            rangeBoundary = Math.trunc(rangeBoundary/opts.step)*opts.step;
                            if (valueNoMin > rangeBoundary) {
                                valueNoMin = checkOffLimits ? rangeBoundary : (valueNoMin - opts.step);
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
                    valueNoMin = info.checkLimits(valueNoMin + opts.min) - opts.min;
                    valueNoMinPx = info.checkLimits(valueNoMinPx + opts.min) - opts.min;
                    
                    var valueRelative = valueNoMinPx/(opts.min - opts.max)*100,
                        isFirstHandle = $handleElem === elemHandle.$elem1st,
                        padStart = opts.flipped ? opts.paddingEnd : opts.paddingStart,
                        padEnd = opts.flipped ? opts.paddingStart : opts.paddingEnd,
                        pos = valueRelative*(1 - padStart - padEnd) - padStart*100,
                        translate = 'translate(' + (info.isHoriz ? pos + '%, -50%)' : '-50%, ' + pos + '%)'),
                        translateRange = 'translate(' + (info.isHoriz ? valueRelative + '%, -50%)' : '-50%, ' + valueRelative + '%)'),
                        prevCurrValue = info.currValue[isFirstHandle ? 0 : 1];

                    info.currValue[isFirstHandle ? 0 : 1] = valueNoMin + opts.min;
                    if (info.isFixedHandle) {
                        if (info.hasRuler) {
                            elemMagnif.$elem1st.css('transform', translate);
                            elemOrig.$svg.css('transform', translate);
                        } else {
                            if (info.isHoriz) {
                                elemMagnif.$elem1st.css('transform', 'scale(' + opts.handle.zoom + ') ' + translate.replace(/-50%\)$/, '0)'));
                                $elem.css('transform', 'translate(' + pos + '%, ' + (opts.contentOffset*100 - 50) + '%)');
                            } else {
                                elemMagnif.$elem1st.css('transform', 'scale(' + opts.handle.zoom + ') ' + translate);
                                $elem.css('transform', 'translate(-50%, ' + pos + '%)');
                            }
                        }
                        elemRange.$rangeWrapper.css('transform', translateRange);
                        elemMagnif.$elemRange1st.css('transform', translateRange);
                    } else {
                        $handleElem.css(info.isHoriz ? 'left' : 'top', (-pos) + '%');
                        (isFirstHandle ? elemMagnif.$elem1st : elemMagnif.$elem2nd).css('transform', info.hasRuler ? translate : 'scale(' + opts.handle.zoom + ') ' + translate);
                        elemHandle.stopPosition[isFirstHandle ? 0 : 1] = valueNoMin + opts.min;
                        (isFirstHandle ? elemMagnif.$elemRange1st : elemMagnif.$elemRange2nd).css('transform', translateRange);
                    }
                    elemRange.update(- valueRelative, isFirstHandle);
                    elemMagnif.updateRanges(- valueRelative, isFirstHandle);

                    if (info.isInputTypeRange && isFirstHandle) {
                        $elem.attr('value', info.getCurrValue(info.currValue[0]));
                    }
                    var currValue = info.getCurrValue(info.currValue[isFirstHandle ? 0 : 1]);
                    if (forceOnChange || !util.areTheSame(prevCurrValue, currValue)) {
                        $elem.triggerHandler('change.rsSliderLens', [currValue, isFirstHandle]);
                    }
                }
            },

            util = {
                getEventPageX: function (event) {
                    if (event.originalEvent && event.originalEvent.touches && event.originalEvent.touches.length > 0) {
                        return event.originalEvent.touches[0].pageX;
                    }
                    return event.pageX;
                },
                getEventPageY: function (event) {
                    if (event.originalEvent && event.originalEvent.touches && event.originalEvent.touches.length > 0) {
                        return event.originalEvent.touches[0].pageY;
                    }
                    return event.pageY;
                },
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
                    var value = !str || str === 'auto' || str === '' ? 0 : parseInt(str, 10);
                    return isNaN(value) ? 0 : value;
                },
                toFloat: function (str) {
                    var value = !str || str === 'auto' || str === '' ? 0.0 : parseFloat(str);
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
                        'shape-rendering': 'geometricPrecision',
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
                        padEnd = opts.flipped ? paddingStart : paddingEnd,
                        generateTicks = function () {
                            var createObj = function (type) {
                                    var step = optsTicks[type].step;
                                    return optsTicks[type].visible ? {
                                            step: step,
                                            tickStep: (step > 0 && !util.isAlmostZero(opts.max - opts.min) ? step : 1)/(opts.max - opts.min)*usableArea,
                                            pos: optsTicks[type].pos*(1 - optsTicks[type].size)*shortest,
                                            size: optsTicks[type].size*shortest
                                        } : null;
                                },
                                drawMark = function (step, pos, size) { // step is the X coordinate for horizontal sliders or the Y coordinate for vertical sliders
                                    if (info.isHoriz) {
                                        path += 'M' + Math.round(step*100)/100 + ' ' + Math.round(pos*100)/100 + ' v' + Math.round(size*100)/100 + ' ';
                                    } else {
                                        path += 'M' + Math.round(pos*100)/100 + ' ' + Math.round(step*100)/100 + ' h' + Math.round(size*100)/100 + ' ';
                                    }
                                },
                                short = createObj('short'),
                                long = createObj('long'),
                                smallestStepObj = null,
                                largestStepObj = null,
                                path = '';

                            if (short && long) {
                                smallestStepObj = short.tickStep > long.tickStep ? long : short;
                                largestStepObj = short.tickStep > long.tickStep ? short : long;
                            } else {
                                smallestStepObj = short || long;
                            }
                            if (smallestStepObj) {
                                for (var smallStep = padStart, nextLargeStep = padStart;
                                        smallStep <= widest - padEnd + 0.00005;
                                        smallStep += smallestStepObj.tickStep) {

                                    var sameMark = false;
                                    if (largestStepObj) {
                                        sameMark = util.areTheSame(smallStep, nextLargeStep, 0.00005);
                                        if (sameMark || smallStep + smallestStepObj.tickStep - nextLargeStep > 0.00005) {
                                            drawMark(nextLargeStep, largestStepObj.pos, largestStepObj.size);
                                            nextLargeStep += largestStepObj.tickStep;
                                        }
                                    }
                                    if (!sameMark) {
                                        drawMark(smallStep, smallestStepObj.pos, smallestStepObj.size);
                                    }
                                }
                                $svg.append(util.createSvgDom('path', {
                                    d: path,
                                    'stroke-width': (doScale ? opts.handle.zoom : 1)
                                }));
                            }
                        };
                    generateTicks();

                    if (opts.ruler.labels.visible &&
                            ((opts.ruler.labels.values === 'step' || opts.ruler.labels.values === true) && opts.step > 0 ||
                             opts.ruler.labels.values instanceof Array)) {
                        var gAttrs = {
                                'dominant-baseline': 'central',
                                'text-anchor': 'middle'
                            },
                            $allText,
                            range = opts.max - opts.min,
                            withinBounds = function (value) {
                                value = +value; // strToInt
                                return value >= opts.min && value <= opts.max;
                            },
                            renderText = function (value) {
                                var pntX, pntY,
                                    w = opts.flipped ? opts.max - value : value - opts.min,
                                    s = opts.ruler.labels.pos*shortest/(doScale ? opts.handle.zoom : 1),
                                    textAttrs;
                                w = w/range*usableArea/(doScale ? opts.handle.zoom : 1) + (doScale ? padStart/opts.handle.zoom : padStart);
                                pntX = Math.round((info.isHoriz ? w : s)*100)/100;
                                pntY = Math.round((info.isHoriz ? s : w)*100)/100;
                                textAttrs = $elem.triggerHandler('customLabelAttrs.rsSliderLens', [value, pntX, pntY]);
                                if (Object.prototype.toString.call(textAttrs) !== '[object Object]') {
                                    textAttrs = {};
                                }
                                textAttrs.x = pntX;
                                textAttrs.y = pntY;
                                value = $elem.triggerHandler('customLabel.rsSliderLens', [value]);
                                $allText.append(util.createSvgDom('text', textAttrs).append(value));
                            },
                            x;
                        if (doScale) {
                            gAttrs.transform = 'scale(' + opts.handle.zoom + ')';
                        }
                        $allText = util.createSvgDom('g', gAttrs);
                        if (opts.ruler.labels.values instanceof Array) {
                            opts.ruler.labels.values.sort(function (a, b) { return a - b; });
                            for (x in opts.ruler.labels.values) {
                                if (opts.ruler.labels.values) {
                                    if (withinBounds(opts.ruler.labels.values[x])) {
                                        renderText(opts.ruler.labels.values[x]);
                                    }
                                }
                            }
                        } else {
                            for (x = opts.min; x <= opts.max; x += opts.step) {
                                renderText(x);
                            }
                        }
                        $allText.appendTo($svg);
                    }
                },
                getSpeedMs: function (speed) {
                    var ms = speed;
                    if (typeof speed === 'string') {
                        ms = $.fx.speeds[speed];
                        if (ms === undefined) {
                            ms = $.fx.speeds._default;
                        }
                    }
                    if (ms === undefined) {
                        ms = 150;
                    }
                    return ms;
                }
            },

            panUtil = {
                doDrag: true,
                firstClickWasOutsideHandle: false,
                mouseBtnStillDown: false,
                beingDraggedByKeyboard: false,
                dragDelta: 0,
                $handle: null, // handle currently being dragged
                $animObj: null,
                dragging: false,
                fixedHandleStartDragPos: 0,
                textSelection: function (enable) {
                    var value = enable ? '' : 'none';
                    $('body').css({
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
                    info.setValue(util.pixel2Value(value + panUtil.dragDelta), $animHandle || panUtil.$handle || elemHandle.$elem1st, undefined, !!$animHandle);
                    if (panUtil.doDrag) {
                        $(document).
                            bind('mousemove.rsSliderLens touchmove.rsSliderLens', info.isHoriz ? panUtil.dragHoriz : panUtil.dragVert).
                            bind('mouseup.rsSliderLens touchend.rsSliderLens', panUtil.stopDragFromDoc);
                    }
                    panUtil.$animObj = null;
                },
                anim: function (event, from, to, animDuration, easingFunc, $animHandle, doneCallback, noFinalChange) {
                    var $prevAnimHandle = $animHandle,
                        done = function () {
                            panUtil.animDone(util.value2Pixel(to), $prevAnimHandle);
                            if (!noFinalChange || noFinalChange === 'key' && !panUtil.beingDraggedByKeyboard) {
                                events.processFinalChange($animHandle === elemHandle.$elem1st);
                            } else {
                                if (noFinalChange === 'key') {
                                    panUtil.beingDraggedByKeyboard = false;
                                }
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
                        to = (info.isHoriz ? util.getEventPageX(event) : util.getEventPageY(event)) - refPnt;
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
                        animDuration = opts.handle.animation;
                    }
                    $animHandle = $animHandle || panUtil.$handle || elemHandle.$elem1st;
                    from = util.pixel2Value(from);
                    to = util.pixel2Value(to);
                    if (from !== to && animDuration > 0) {
                        panUtil.$animObj = $({ n: from });
                        panUtil.$animObj.animate({ n: to }, {
                            duration: animDuration,
                            easing: easingFunc === undefined ? opts.handle.easing : easingFunc,
                            step: function (now) {
                                info.setValue(now, $animHandle, opts.snapOnDrag);
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
                    if (panUtil.beingDraggedByKeyboard) {
                        panUtil.anim(null, fromPx, toPx, duration, easingFunc, $animHandle, undefined, 'key');
                    } else {
                        panUtil.anim(null, fromPx, toPx, duration, easingFunc, $animHandle);
                    }
                },
                startDrag: function (event) {
                    if (info.canDragRange && $(event.target).is(elemRange.$range)) {
                        event.preventDefault();
                        return;
                    }
                    if (opts.enabled && !panUtil.$animObj) {
                        info.updateTicksStep();
                        panUtil.disableTextSelection();
                        panRangeUtil.dragged = false;
                        panUtil.doDrag = true;
                        if (info.isFixedHandle) {
                            panUtil.$handle = elemHandle.$elem1st;
                            panUtil.fixedHandleStartDragPos = info.isHoriz ? util.getEventPageX(event) : util.getEventPageY(event);
                            panUtil.fixedHandleStartDragPos += util.value2Pixel(info.currValue[0]);
                            elemMagnif.$elem1st.parent().add(elemOrig.$wrapper).addClass(opts.style.classDragging);
                            $(document).
                                bind('mousemove.rsSliderLens touchmove.rsSliderLens', info.isHoriz ? panUtil.dragHoriz : panUtil.dragVert).
                                bind('mouseup.rsSliderLens touchend.rsSliderLens', panUtil.stopDragFromDoc);
                            setTimeout(function () {
                                panUtil.$handle.focus();
                            });
                        } else {
                            panUtil.mouseBtnStillDown = panUtil.firstClickWasOutsideHandle = true;
                            var initialValues = [info.currValue[0], info.currValue[1]];
                            panUtil.anim(event, undefined, undefined, undefined, undefined, undefined, function () {
                                panUtil.$handle.focus();
                                info.uncommitedValue[0] = initialValues[0];
                                info.uncommitedValue[1] = initialValues[1];
                                if (!panUtil.mouseBtnStillDown) {
                                    panUtil.stopDrag(true);
                                }
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
                            to = (info.isHoriz ? util.getEventPageX(event) : util.getEventPageY(event)) - refPnt;
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
                dragHorizVert: function (page) {
                    panUtil.dragging = true;
                    if (info.isFixedHandle) {
                        info.setValue(util.pixel2Value(- page + panUtil.fixedHandleStartDragPos), panUtil.$handle, opts.snapOnDrag);
                    } else {
                        panUtil.handleStartsToMoveWhen1stClickWasOutsideHandle();
                        info.setValue(util.pixel2Value(page - panUtil.dragDelta), panUtil.$handle, opts.snapOnDrag);
                    }
                },
                dragHoriz: function (event) {
                    panUtil.dragHorizVert(util.getEventPageX(event));
                },
                dragVert: function (event) {
                    panUtil.dragHorizVert(util.getEventPageY(event));
                },
                stopDrag: function (force) {
                    if (panUtil.dragging || panUtil.mouseBtnStillDown || force === true) {
                        if (panRangeUtil.dragged) {
                            panRangeUtil.stopDrag();
                            panRangeUtil.dragged = false;
                        } else {
                            if (opts.enabled) {
                                panUtil.enableTextSelection();
                                panUtil.doDrag = false;
                                panUtil.firstClickWasOutsideHandle = false;
                                $(document).unbind('mousemove.rsSliderLens mouseup.rsSliderLens touchmove.rsSliderLens touchend.rsSliderLens');
                                
                                // if step is being used and snapOnDrag is false, then need to adjust final handle position ou mouse up
                                if (info.isStepDefined && !panUtil.$animObj) {
                                    info.setValue(info.currValue[panUtil.$handle === elemHandle.$elem1st ? 0 : 1], panUtil.$handle, true);
                                }
                                panUtil.dragDelta = 0;
                                (panUtil.$handle === elemHandle.$elem1st ? elemMagnif.$elem1st : elemMagnif.$elem2nd).parent().add(elemOrig.$wrapper).removeClass(opts.style.classDragging);
                                events.processFinalChange();
                            }
                        }
                        panUtil.dragging = false;
                    }
                    panUtil.mouseBtnStillDown = false;
                },
                stopDragFromDoc: function () {
                    panUtil.stopDrag();
                },
                gotFocus: function () {
                    elemOrig.$wrapper.addClass(opts.style.classFocused);
                    if (!info.isDocumentEventsBound) {
                        $(document).
                            bind('keydown.rsSliderLens', elemHandle.keydown).
                            bind('keyup.rsSliderLens', elemHandle.keyup);
                        info.isDocumentEventsBound = true;

                        // save current values and range. If user presses ESC, then data rollsback to these values
                        info.uncommitedValue[0] = info.currValue[0];
                        info.uncommitedValue[1] = info.currValue[1];
                    }
                },
                gotFocus1st: function () {
                    if (!panUtil.$animObj) {
                        panUtil.$handle = elemHandle.$elem1st;
                        panUtil.gotFocus();
                    }
                },
                gotFocus2nd: function () {
                    if (!panUtil.$animObj) {
                        panUtil.$handle = elemHandle.$elem2nd;
                        panUtil.gotFocus();
                    }
                },
                loseFocus: function () {
                    elemOrig.$wrapper.removeClass(opts.style.classFocused);
                    if (panUtil.$animObj) {
                        // lost focus while a focused handle was still moving, so restore the focus back to the moving handle
                        if (panUtil.$handle) {
                            setTimeout(function () {
                                panUtil.$handle.focus();
                            });
                        }
                    } else {
                        setTimeout(function() {
                            var $allElems = $elem.
                                    add(elemOrig.$canvas).
                                    add(elemRange.$rangeWrapper).
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
                                $(document).
                                    unbind('keydown.rsSliderLens', elemHandle.keydown).
                                    unbind('keyup.rsSliderLens', elemHandle.keyup);
                                info.isDocumentEventsBound = false;
                            }
                        });
                    }
                }
            },

            panRangeUtil = {
                dragDelta: 0,
                dragged: false,
                origin: 0,
                deltaRange: 0,
                startDrag: function (event) {
                    if (opts.enabled) {
                        info.updateTicksStep();
                        panUtil.disableTextSelection();
                        panRangeUtil.origin = info.isHoriz ? elemOrig.$wrapper.offset().left : elemOrig.$wrapper.offset().top;
                        if (info.canDragRange && info.doubleHandles && (opts.range.type === true || opts.range.type === 'between')) {
                            panRangeUtil.deltaRange = info.currValue[1] - info.currValue[0];
                        } else {
                            panRangeUtil.deltaRange = opts.range.type[1] - opts.range.type[0];
                        }
                        panRangeUtil.dragDelta = info.isHoriz ? util.getEventPageX(event) - elemRange.$range.offset().left : util.getEventPageY(event) - elemRange.$range.offset().top;
                        panRangeUtil.dragged = false;
                        $(document).
                            bind('mousemove.rsSliderLens touchmove.rsSliderLens', panRangeUtil.drag).
                            bind('mouseup.rsSliderLens touchend.rsSliderLens', panRangeUtil.stopDrag);
                    }
                },
                drag: function (event) {
                    var firstDrag = !panRangeUtil.dragged;
                    panRangeUtil.dragged = true;
                    if (info.isRangeFromToDefined || info.canDragRange && info.doubleHandles && (opts.range.type === true || opts.range.type === 'between')) {
                        if (firstDrag) {
                            elemRange.$rangeWrapper.
                                add(elemMagnif.$elemRange1st).
                                add(elemMagnif.$elemRange2nd).addClass(opts.style.classDragging);
                        }

                        var candidateLeft = util.pixel2Value((info.isHoriz ? util.getEventPageX(event) : util.getEventPageY(event)) - panRangeUtil.dragDelta - panRangeUtil.origin),
                            candidateRight = candidateLeft + panRangeUtil.deltaRange,
                            aux;
                        candidateLeft = info.getCurrValue(candidateLeft);
                        candidateRight = info.getCurrValue(candidateRight);
                        if (opts.flipped) {
                            aux = candidateLeft;
                            candidateLeft = candidateRight;
                            candidateRight = aux;
                        }
                        aux = candidateRight - opts.max;
                        if (aux > 0 && aux < info.ticksStep) {
                            candidateRight = opts.max;
                            candidateLeft -= aux;
                        }
                        aux = opts.min - candidateLeft;
                        if (aux > 0 && aux < info.ticksStep) {
                            candidateLeft = opts.min;
                            candidateRight += aux;
                        }
                        if (candidateLeft >= opts.min && candidateRight <= opts.max) {
                            if (opts.range.type === true || opts.range.type === 'between') {
                                info.currValue[opts.flipped ? 1 : 0] = info.getCurrValue(candidateLeft);
                                if (info.doubleHandles) {
                                    info.currValue[opts.flipped ? 0 : 1] = info.getCurrValue(candidateRight);
                                }
                            } else {
                                opts.range.type[0] = candidateLeft;
                                opts.range.type[1] = candidateRight;
                                info.currValue[0] = info.getCurrValue(Math.min(Math.max(candidateLeft, info.getCurrValue(info.currValue[0])), candidateRight));
                                if (info.doubleHandles) {
                                    info.currValue[1] = info.getCurrValue(Math.min(Math.max(candidateLeft, info.getCurrValue(info.currValue[1])), candidateRight));
                                }
                            }
                            if (info.doubleHandles) {
                                elemHandle.stopPosition[0] = info.currValue[0];
                                elemHandle.stopPosition[1] = info.currValue[1];
                            }

                            elemRange.$range.
                                add(elemMagnif.$elemRange1st.children()).
                                add(elemMagnif.$elemRange2nd ? elemMagnif.$elemRange2nd.children() : null).
                                css(elemRange.getPropMin(), (candidateLeft - opts.min)/(opts.max - opts.min)*100 + '%').
                                css(elemRange.getPropMax(), (opts.max - candidateRight)/(opts.max - opts.min)*100 + '%');

                            info.setValue(info.currValue[0], elemHandle.$elem1st, true);
                            if (info.doubleHandles) {
                                info.setValue(info.currValue[1], elemHandle.$elem2nd, true);
                            }
                        }
                    }
                },
                stopDrag: function () {
                    if (opts.enabled) {
                        panUtil.enableTextSelection();
                        $(document).unbind('mousemove.rsSliderLens mouseup.rsSliderLens touchmove.rsSliderLens touchend.rsSliderLens');

                        if (panRangeUtil.dragged) {
                            info.setValue(info.currValue[0], elemHandle.$elem1st, true);
                            if (info.doubleHandles) {
                                info.setValue(info.currValue[1], elemHandle.$elem2nd, true);
                            }
                        }
                        if (info.doubleHandles) {
                            events.processFinalChange(true);
                            events.processFinalChange(false);
                        } else {
                            events.processFinalChange(true);
                        }
                        elemRange.$rangeWrapper.
                            add(elemMagnif.$elemRange1st).
                            add(elemMagnif.$elemRange2nd).removeClass(opts.style.classDragging);
                    }
                }
            },

            noIEdrag = function(elem) {
                if (elem) { elem[0].ondragstart = elem[0].onselectstart = function () { return false; }; }
            };

        $elem
            .bind('customRuler.rsSliderLens', events.onCustomRuler)
            .bind('customLabel.rsSliderLens', events.onCustomLabel)
            .bind('customLabelAttrs.rsSliderLens', events.onCustomLabelAttrs);
        info.initVars();
        elemOrig.init();
        elemMagnif.init();
        info.init();
        elemRange.init();
        elemMagnif.initRanges();
        elemHandle.init();

        // insert into DOM
        elemRange.appendToDOM();
        elemHandle.$elem1st.add(elemHandle.$elem2nd).appendTo(elemOrig.$wrapper);

        $elem.
            bind('getter.rsSliderLens', events.onGetter).
            bind('setter.rsSliderLens', events.onSetter).
            bind('resizeUpdate.rsSliderLens', events.onResizeUpdate).
            bind('change.rsSliderLens', events.onChange).
            bind('finalchange.rsSliderLens', events.onFinalChange).
            bind('create.rsSliderLens', events.onCreate).
            bind('destroy.rsSliderLens', events.onDestroy);

        if (Math.abs(opts.handle.mousewheel) > 0.5) {
            $elem.
                add(elemOrig.$canvas).
                add(elemRange.$rangeWrapper).
                add(elemHandle.$elem1st).
                add(elemHandle.$elem2nd).bind('DOMMouseScroll.rsSliderLens mousewheel.rsSliderLens', elemHandle.onMouseWheel);
        }

        if (info.canDragRange) {
            elemRange.$range.
                bind('mousedown.rsSliderLens touchstart.rsSliderLens', panRangeUtil.startDrag);
        }
        if (info.isFixedHandle) {
            elemOrig.$wrapper.
                bind('mousedown.rsSliderLens touchstart.rsSliderLens', panUtil.startDrag).
                bind('mouseup.rsSliderLens touchend.rsSliderLens', panUtil.stopDrag);
        } else {
            elemOrig.$wrapper.
                bind('mousedown.rsSliderLens touchstart.rsSliderLens', panUtil.startDrag).
                bind('mouseup.rsSliderLens touchend.rsSliderLens', panUtil.stopDrag);
            elemHandle.$elem1st.
                bind('mousedown.rsSliderLens touchstart.rsSliderLens', panUtil.startDragFromHandle1st);
        }

        // to prevent the default behaviour in IE when dragging an element
        noIEdrag($elem);
        noIEdrag(elemMagnif.$elem1st);
        noIEdrag(elemHandle.$elem1st);
        noIEdrag(elemOrig.$canvas);
        noIEdrag(elemRange.$rangeWrapper);
        noIEdrag(elemRange.$range);
        noIEdrag(elemMagnif.$elemRange1st);
        
        if (info.doubleHandles) {
            noIEdrag(elemMagnif.$elem2nd);
            noIEdrag(elemHandle.$elem2nd);
            noIEdrag(elemMagnif.$elemRange2nd);
            elemHandle.$elem2nd.
                bind('mousedown.rsSliderLens touchstart.rsSliderLens', panUtil.startDragFromHandle2nd);
        }
        if (opts.enabled && info.isAutoFocusable) {
            elemHandle.$elem1st.focus();
        }
        $elem.triggerHandler('create.rsSliderLens');
        info.initHandles();
    };
    
    $.fn.rsSliderLens = function (options) {
        var option = function () {
                if (typeof arguments[0] === 'string') {
                    switch (arguments.length) {
                        case 1:
                            return this.eq(0).triggerHandler('getter.rsSliderLens', arguments);
                        case 2:
                            for (var last = this.length - 1; last > -1; --last) {
                                this.eq(last).triggerHandler('setter.rsSliderLens', arguments);
                            }
                            return this;
                    }
                }
            },
            resizeUpdate = function () {
                return this.trigger('resizeUpdate.rsSliderLens');
            },
            destroy = function () {
                return this.trigger('destroy.rsSliderLens');
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
                    var value = !str || str === 'auto' || str === '' ? 0.0 : parseFloat(str);
                    return isNaN(value) ? 0.0 : value;
                };
            if ($this.is('input[type=range]')) {
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

    // Public access to the default input parameters
    $.fn.rsSliderLens.defaults = {
        orientation: 'auto', // Slider orientation: Type: string.
                             //   'horiz' - horizontal slider.
                             //   'vert' - vertical slider.
                             //   'auto' - horizontal if the content's width >= height; vertical if the content's width < height.
        width: 'auto',       // Slider width: Type: String or positive integer greater than zero.
                             //   'auto'  - The plug-in retrieves the width from the element to which the plug-in is bounded.
                             //             If retrieving the width is impossible (because the element is hidden), then 150 is used.
                             //   integer - The plug-in uses this given width instead.
        height: 'auto',      // Slider height: Type: String or positive integer greater than zero.
                             //   'auto'  - The plug-in retrieves the height from the element to which the plug-in is bounded.
                             //             If retrieving the height is impossible (because the element is hidden), then 50 is used.
                             //   integer - The plug-in uses this given height instead.
        fixedHandle: false, // Determines whether handle is movable. Type: boolean or floating point number between 0 and 1.
                            //           false - the user can move the handle left/right (horizontal sliders) or move up/down (vertical sliders).
                            //            true - the handle is in a fixed position (in the middle of the slider) and does not move. Instead, only the ruler moves.
                            // 0 <= value <= 1 - the handle is in a fixed position and does not move. Instead, only the ruler moves.
                            //                   The handle is placed in a relative position (0% - 100%). A value of 0 places the handle on the left (horizontal slides) or on top (vertical slides). 
                            //                   A value of 0.5 or true places the handle in the middle of the slider.
        value: 0, // Represents the initial value(s). Type: floating point number or array of two floating point numbers.
                  // When a single number is used, only one handle is shown. When a two number array is used, e.g. [5, 20], two handles are shown.
                  // If value is an array of two numbers and handle is fixed (see fixedHandle), then only the first value (value[0]) is considered.
        min: 0,   // Minimum allowed value. Type: floating point number.
        max: 100, // Maximum allowed value. Type: floating point number.
        step: 0,  // Determines the amount of each interval the slider takes between min and max. Use 0 to disable step. 
                  // For example, if min = 0, max = 1 and step = 0.25, then the user can only select 0, 0.25, 0.5, 0.75 and 1.
                  // Type: positive floating point number.
        snapOnDrag: false,  // Determines whether the handle snaps to each step during mouse dragging. Only meaningful if a non zero step is defined. Type: boolean.
        enabled: true,      // Determines whether the control is editable. Type: boolean.
        flipped: false,     // Indicates the direction. Type: boolean.
                            //   false - for horizontal sliders, the minimum is located on the left, maximum on the right. For vertical sliders, the minimum on the top, maximum on the bottom.
                            //   true - for horizontal sliders, the maximum is located on the left, minimum on the right. For vertical sliders, the maximum on the top, minimum on the bottom.
        contentOffset: 0.5, // Relative position of the content (0% - 100%). Type: Floating number between 0 and 1, inclusive.
                            // For horizontal sliders: Relative vertical position of the content.
                            // For vertical sliders: Relative horizontal position for content.
                            // Only applicable to sliders that show original content. Ignored for sliders with SVG rulers.
        paddingStart: 0,    // Relative start padding (0% - 100%). Type: Floating number between 0 and 1, inclusive.
        paddingEnd: 0,      // Relative end padding (0% - 100%). Type: Floating number between 0 and 1, inclusive.
                            // On SVG rulers, if the first or last labels are not displayed at all, or partially displayed, then use this to add some extra padding in order for the labels to be displayed correctly.
                            // When displaying the original content (see ruler.visible property)
        style: {            // CSS style classes. You can use more than one class, separated by a space. Type: string.
            classSlider: 'sliderlens',      // Class added to the wrapper div created at run-time.
            classFixed: 'fixed',            // Class added to the wrapper div created at run-time, when slider has a fixed handle.
            classHoriz: 'horiz',            // Class added to the wrapper div created at run-time, for horizontal sliders.
            classVert: 'vert',              // Class added to the wrapper div created at run-time, for vertical sliders.
            classDisabled: 'disabled',      // Class added to the wrapper div created at run-time, when slider is disabled.
            classHandle: 'handle',          // Class added to the handle div created at run-time, for single handle sliders.
            classHandle1: 'handle1',        // Class added to the first handle div created at run-time (only applicable to double handle sliders).
            classHandle2: 'handle2',        // Class added to the second handle div created at run-time (only applicable to double handle sliders).
            classDragging: 'dragging',      // Class added to the handle currently being dragged by the mouse. Also added to the wrapper div and to the range element.
            classRange: 'range',            // Class added to the range bars.
            classRangeDraggable: 'drag',    // Class added to the range bars the moment the user drags them.
            classFocused: 'focus'           // Class added to the wrapper div created at run-time, when handle receives keyboard focus.
                                            // The keyboard focus is possible only when the plug-in is bounded to a focusable element, that is,
                                            // an <input> element or any other element with a tabindex attribute.
        },

        // handle is the cursor that the user can drag around to select values
        handle: {
            size: 0.3,  // Relative handle size. Type: Floating number between 0 and 1, inclusive.
                        // For horizontal sliders, it is the handle width relative to the slider width, e.g.,
                        // if slider width is 500px and handle size is .3, then handle size becomes (500px * 30%) = 150px in width.
                        // For vertical sliders, it is the handle height relative to the slider height.
                        // If two handles are used, then this is the size of both handles together, which means each handle has a size of size/2.
            zoom: 1.5,  // Magnification factor applied inside the handle. Type: positive floating point number.
                        // If greater than 1, the content is magnified.
                        // If 1, the content remains the same size.
                        // If smaller than 1, the content is shrinked.
            pos: 0.5,   // Indicates the middle handle relative position (0% - 100%) Type: floating point number >= 0 and <= 1.
                        // Not applicable for fixed handled sliders.
                        // For horizontal sliders, a value of 0 aligns the middle of the handle to the top of the slider,
                        // 1 aligns the middle of the handle to the bottom of the slider.
                        // For vertical sliders, a value of 0 aligns the middle of the handle to the left of the slider,
                        // 1 aligns the middle of the handle to the right of the slider.
            otherSize: 'zoom', // Relative handle height (for horizontal sliders) or relative handle width (for vertical sliders). Type: string or floating point number >= 0.
                               // Not applicable for fixed handled sliders.
                               // If set to string 'zoom' the otherSize is set according to the handle.zoom value,
                               // e.g. if the handle.zoom is 1.25, then the otherSize is also 1.25 (125% of the slider size).
                               // If set to a floating point number, it represents a relative size, e.g. if set to 1, then handle size will have
                               // the same size (100%) of the slider element.
            animation: 100,    // Duration (ms or jQuery string alias) of animation that happens when handle needs to move to a different location (triggered by a mouse click on the slider).
                               // Use 0 to disable animation. Type: positive integer or string.
            easing: 'swing',   // Easing function used for the handle animation (@see http://api.jquery.com/animate/#easing). Type: string.
            mousewheel: 1  // Threshold factor applied to the handle when using the mouse wheel. Type: floating point number.
                           // when = 0, mouse wheel cannot be used to move the handle;
                           // when > 0 and mouse wheel goes up, then handle moves to the right (for horizontal sliders) or up (for vertical sliders)
                           // when > 0 and mouse wheel goes down, then handle moves to the left (for horizontal sliders) or down (for vertical sliders)
                           // when < 0 and mouse wheel goes up, then handle moves to the left (for horizontal sliders) or down (for vertical sliders)
                           // when < 0 and mouse wheel goes down, then handle moves to the right (for horizontal sliders) or up (for vertical sliders)
        },
        
        // Ruler rendering data. Should you decide to use a ruler, SliderLens can automatically render one for you, or you can render a customized one.
        ruler: {
            visible: true,      // Determines whether the SVG ruler is shown. Type: boolean.
                                // true - the original markup content is hidden and a SVG ruler is displayed instead.
                                // false - the original markup content is displayed.
                                // Note: If the plug-in is attached to a DOM element that contains no content at all (no children),
                                //       then this property is set to true and a ruler is displayed instead (since there is nothing to display from the DOM element).
                                // There is more to this, please see onCustom below.
            size: 1.5,          // Specifies the relative width (for horizontal sliders) or height (for vertical sliders) of the svg ruler. Type: floating pointer number >= 0.
                                // Only applicable to fixed handle sliders with a visible ruler.
                                // A value of 1, means that the ruler has the same (100%) width of the parent container (or height for vertical sliders).
                                // A value of 1.7, means that the ruler is wider (or taller) 170% than the parent container.

            // Labels on the ruler
            labels: {
                visible: true,          // Determines whether value labels are displayed. Type: boolean.
                values: 'step',         // Determines which values are displayed in the ruler. Type: string, boolean or array of numbers.
                                        //         'step' - Values are displayed with a step interval (see step). If step is 0, then no labels are displayed.
                                        //           true - Same as 'step'.
                                        //          false - Values are not displayed.
                                        //   number array - Only the numbers in the array are displayed.
                pos: 0.8,               // Indicates the label relative (0% - 100%) position. Type: floating point number >= 0 and <= 1.
                                        // For horizontal sliders, a value of 0 aligns the labels to the top, 1 aligns it to the bottom. Labels are center justified in horizontal sliders.
                                        // For vertical sliders, a value of 0 aligns the labels to the left, 1 aligns it to the right. 
                onCustomLabel: null,    // Event called for each label. Type: function (event, value).
                                        // Use this event to return a string that replaces the default given value.
                onCustomAttrs: null     // Event called for each label. Type: function (event, value, x, y).
                                        // This event should return an Javascript object with all the attributes that should be applied to a text label.
                                        // All three parameters are floating point numbers, and represent the current label value and the X and Y coordinates, respectively.
                                        /* Example: to rotate labels 45 degrees and left justified, use:
                                            $('.myElement').rsSliderLens({
                                                ruler: {
                                                    labels: {
                                                        onCustomAttrs: function (event, value, x, y) {
                                                            return {
                                                                transform: 'rotate(45 ' + x + ',' + y + ')',
                                                                'text-anchor': 'start'
                                                            };
                                                        }
                                                    }
                                                }
                                            });
                                        */
            },
            tickMarks: {
                short: {
                    visible: true,      // Determines whether short tick marks are visible. Type: boolean.
                    step: 2,            // Interval between each short tick mark. Type: floating number.
                    pos: 0.2,           // Indicates the short tick marks relative position (0% - 100%) Type: floating point number >= 0 and <= 1.
                                        // For horizontal sliders, 0 means aligned to the top of the slider and 1 to the bottom.
                                        // For vertical sliders, 0 means aligned to the left of the slider and 1 to the right.
                    size: 0.1           // Indicates the short tick marks relative size (0% - 100%) Type: floating point number >= 0 and <= 1.
                                        // E.g. a value of .5 means the tick mark has a height equivalent to half of the slider height, for horizontal sliders.
                                        // For vertical sliders, a value of 0.5 means the tick mark has a width equivalent to half of the slider width.
                },
                long: {
                    visible: true,      // Determines whether long tick marks are visible. Type: boolean.
                    step: 10,           // Interval between each long tick mark. Type: floating number.
                    pos: 0.15,          // Indicates the long tick marks relative position (0% - 100%) Type: floating point number >= 0 and <= 1.
                                        // For horizontal sliders, 0 means aligned to the top of the slider and 1 to the bottom.
                                        // For vertical sliders, 0 means aligned to the left of the slider and 1 to the right.
                    size: 0.15          // Indicates the long tick marks relative size (0% - 100%) Type: floating point number >= 0 and <= 1.
                                        // E.g. a value of .5 means the tick mark has a height equivalent to half of the slider height, for horizontal sliders.
                                        // For vertical sliders, a value of 0.5 means the tick mark has a width equivalent to half of the slider width.
                }
            },
            onCustom: null // Event used for customized rulers. Type: function(event, $svg, width, height, zoom, magnifiedRuler, createSvgDomFunc)
                           // If onCustom event is undefined and ruler.visible is true, then a custom ruler is generated.
                           // If onCustom event is undefined and ruler.visible is false, then no ruler is displayed and the original content is shown.
                           // If onCustom event is defined and ruler.visible is true, then onCustom is used to draw on top of the generated ruler.
                           // If onCustom event is defined and ruler.visible is false, then use onCustom to create your own custom ruler from scratch.
                           // This event is always called twice:
                           //   - First time for the regular size ruler.
                           //   - Second time for the magnified ruler inside the handle.
                           // $svg: <svg> element to be added later to the document. Any extra DOM elements created by your onCustom should be appended as children to this $svg.
                           // width: width in pixels of the $svg element.
                           // height: height in pixels of the $svg element.
                           // zoom: Indicates whether this ruler should be magnified. The first time this event is called, zoom is 1.
                           //       The second time this event is called, zoom matches the handle.zoom value.
                           // magnifiedRuler: boolean. It is false when onCustom is invoked for the regular size ruler.
                           //                          If is true when onCustom is invoked for the magnified ruler inside the handle.
                           // createSvgDomFunc: function(tag, attrs), where tag is a String and attrs a JS object.
                           //  A function provided to your convenience, that returns a new SVG element (without adding it to the DOM).
                           //  The returned element contains the given tag and attributes, if any.
                           //  For example, the following code
                           //    var $line = createSvgDomFunc('line', {x1: 0, y1: 0, x2: 0.5, y2: 5, 'stroke-width': zoom});
                           //  sets $line to the element <line x1="0" y1="0" x2="0.5" y2="5" stroke-width="1"></line>
        },
        range: {
            type: 'hidden',   // Specifies a range contained in [min, max]. This range can be used to restrict input even further, or to simply highlight intervals.
                              // Type: string or array of two floating point numbers.
                              //   'hidden' (or false or undefined) - no range is displayed.
                              //   'between' (or true) - range between current handles. Only applicable for double handles (see value).
                              //   'min' - range between min and the first handle.
                              //   'max' - range between handle and max, or - when two handles are used - between second handle and max.
                              //   [from, to] - Defines a range that restricts the input to the interval [from, to].
                              //                For example, if min = 20 and max = 100 and range = [50, 70], then it is not possible to select values smaller than 50 or greater than 70
                              //   The style of the range area is defined by classRange.
            draggable: false, // Determines whether the user can drag a range with the mouse. Type: boolean.
                              //   false - range cannot be dragged.
                              //    true - range can be dragged (only if type is 'between', true or [from, to])
                              // Not applicable for fixed handle sliders.
            pos: 0.46,        // Relative position of the range bar. Type: Floating number between 0 and 1, inclusive.
                              // For horizontal sliders, represents the vertical position of the horizontal range, with 0 aligned to the top of the slider, and 1 to the bottom.
                              // For vertical sliders, represents the horizontal position of the vertical range, with 0 aligned to the left of the slider, and 1 to the right.
            size: 0.1       // Relative size of the range bar. Type: Floating number between 0 and 1, inclusive.
                              // For horizontal sliders, represents the height of the horizontal range.
                              // For vertical sliders, represents the width of the vertical range.
        },
        keyboard: {
            allowed: ['left', 'right', 'up', 'down', 'home', 'end', 'pgup', 'pgdown', 'esc'], // Allowed keys. Type: String array.
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