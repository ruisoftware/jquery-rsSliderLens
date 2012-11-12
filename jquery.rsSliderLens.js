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
                    var creating = this.$canvas === null;
                    if (creating) {
                        this.$canvas = $("<canvas>");
                    }
                    
                    this.$canvas.attr({
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

                    if (info.isHoriz) {
                        if (!!opts.style.classSliderlensHoriz) {
                            this.$canvas.addClass(opts.style.classSliderlensHoriz);
                        }
                    } else {
                        if (!!opts.style.classSliderlensVert) {
                            this.$canvas.addClass(opts.style.classSliderlensVert);
                        }
                    }
                    
                    if (opts.disabled) {
                        this.$canvas.addClass(opts.style.classHandleDisabled);
                    }
                    var ctx = this.$canvas[0].getContext('2d');
                    ctx.scale(1.0 / opts.handle.zoom, 1.0 / opts.handle.zoom);
                    ctx.drawImage(elemMagnif.$elem1st[0], 0, 0);
                    this.recalcPosBasedOnCanvas(creating);
                    $origBar.hide(); // because the ruler is used instead of the original slider
                },
                init: function () {
                    this.width = $origBar.width();
                    this.height = $origBar.height();
                    info.isHoriz = opts.orientation === 'auto' ? this.width >= this.height : (opts.orientation === 'vert' ? false : true);
                    if (info.isHoriz) {
                        if (!!opts.style.classSliderlensHoriz) {
                            $origBar.addClass(opts.style.classSliderlensHoriz);
                        }
                    } else {
                        if (!!opts.style.classSliderlensVert) {
                            $origBar.addClass(opts.style.classSliderlensVert);
                        }
                    }
                    // read again the position and size, since they might change after adding the classes above
                    var origBarHidden = $origBar.css('display') === 'none',
                        pos = $origBar.show().position();
                    this.width = $origBar.width();
                    this.height = $origBar.height();
                    if (origBarHidden) {
                        $origBar.hide();
                    }
                    
                    var border = {
                        left: util.toInt($origBar.css('border-left-width')), 
                        top: util.toInt($origBar.css('border-top-width'))
                    }
                    this.pos.left = pos.left;
                    this.pos.top = pos.top;
                    this.outerWidth = $origBar.outerWidth() - border.left - util.toInt($origBar.css('border-right-width'));
                    this.outerHeight = $origBar.outerHeight() - border.top - util.toInt($origBar.css('border-bottom-width'));
                },
                recalcPosBasedOnCanvas: function (creating) {
                    // origBar is hidden, so need to recalculate control position based on the canvas (ruler) instead
                    if (creating) { // creating is false when user invokes the 'invalidate' method, that is, when the canvas element is already in the DOM
                        var oldDisplay = this.$canvas.css('display');
                        this.$canvas.css('display', 'none');
                        $("body").append(this.$canvas); // add to DOM, in order to read the CSS properties
                    }
                    this.pos.left += util.toInt(this.$canvas.css('margin-left')) + util.toInt(this.$canvas.css('border-left-width')) + util.toInt(this.$canvas.css('padding-left'));
                    this.pos.top += util.toInt(this.$canvas.css('margin-top')) + util.toInt(this.$canvas.css('border-top-width')) + util.toInt(this.$canvas.css('padding-top'));
                    if (creating) {
                        this.$canvas.remove().css('display', oldDisplay); // and remove from DOM
                    }
                }
            },

            // range that appears outside the handle
            elemRange = {
                $elem: null,
                width: 0,
                height: 0,
                // returns the width or height that the user defined in the class classHighlightRange. If user did not defined, returns zero.
                getUserDefinedFixedSize: function () {
                    return util.toFloat(util.getUserDefinedCSS($("<div>").addClass(opts.style.classHighlightRange), info.isHoriz ? 'height' : 'width'));
                },
                getRangeName: function (name) {
                    if (opts.flipped) {
                        switch (name) {
                            case 'min': return 'max';
                            case 'max': return 'min';
                        }
                    }
                    return name;
                },
                init: function () {
                    if (!!opts.range) {
                        if (!this.$elem) {
                            this.$elem = $("<div>");
                        }
                        this.$elem.css({
                            'position': 'absolute',
                            'z-index': util.toInt($origBar.css('z-index')) + 1
                        }).addClass(opts.style.classHighlightRange);
                        if (info.canDragRange) {
                            this.$elem.addClass(opts.style.classHighlightRangeDraggable);
                        }
                        var userFixedSize = this.getUserDefinedFixedSize();
                        
                        if (info.isHoriz) {
                            this.$elem.css('top', elemOrig.pos.top + 'px');
                            if (Math.abs(userFixedSize) < 0.0005) {
                                this.height = elemOrig.height;
                                this.$elem.css('height', this.height + 'px');
                            } else {
                                this.height = userFixedSize;
                            }
                            
                            switch (this.getRangeName(opts.range)) {
                                case 'min': this.$elem.css('left', Math.round(elemOrig.pos.left + info.beginOffset + (opts.ruler.display ? 1 : 0)) + 'px');
                                            break;
                                default:
                                    if (info.isRangeDefined) {
                                        this.width = info.toPixel - info.fromPixel + 1;
                                        this.$elem.css({
                                            'left': (elemOrig.pos.left + info.fromPixel) + 'px',
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
                            switch (this.getRangeName(opts.range)) {
                                case 'min': this.$elem.css('top', Math.round(elemOrig.pos.top + info.beginOffset + (opts.ruler.display? 1 : 0)) + 'px');
                                            break;
                                default:
                                    if (info.isRangeDefined) {
                                        this.height = info.toPixel - info.fromPixel;
                                        this.$elem.css({
                                            'top': Math.round(elemOrig.pos.top + info.fromPixel) + 'px',
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
                width: 0,
                height: 0,
                initClone: function () {
                    if (!this.$elem1st) {
                        this.$elem1st = $origBar.clone().removeAttr('id').removeAttr('tabindex').removeAttr('autofocus');
                    }
                    this.$elem1st.css({
                        'float': 'left',
                        'z-index': util.toInt($origBar.css('z-index')) + 2,
                        'width': elemOrig.width + 'px',
                        'height': elemOrig.height + 'px',
                        'margin-left': 0,
                        'margin-top': 0,
                        'position': 'static'
                    }).css(util.getScaleCss(opts.handle.zoom));
                    
                    if (info.isInputTypeRange) {
                        this.$elem1st.removeAttr('name');
                    }
                    
                    if (opts.disabled) {
                        this.$elem1st.addClass(opts.style.classHandleDisabled);
                    }
                    
                    if (info.useDoubleHandles) {
                        if (!this.$elem2nd) {
                            this.$elem2nd = this.$elem1st.clone();
                        } else {
                            this.$elem2nd.css({
                                'width': elemOrig.width + 'px',
                                'height': elemOrig.height + 'px',
                                'margin-left': 0,
                                'margin-top': 0
                            });
                        }
                    }
                },
                initCanvasHandle: function () {
                    var creating = !this.$elem1st;
                    if (creating) {
                        this.$elem1st = $("<canvas>");
                        if (!this.$elem1st[0].getContext) {
                            this.$elem1st = null;
                            return false; // browser does not support canvas
                        }
                    }
                    this.$elem1st.attr({
                        'width': this.width + 'px',
                        'height': this.height + 'px'
                    }).css({
                        'float': 'left',
                        'width': this.width + 'px',
                        'height': this.height + 'px',
                        'margin-left': 0,
                        'margin-top': 0
                    });
                    
                    var ctx = this.$elem1st[0].getContext('2d'),
                        pixelOffsets = { begin: 0, end: 0 };
                    if (!creating) {
                        ctx.clearRect(0, 0, this.width, this.height);
                    }
                    ctx.scale(opts.handle.zoom, opts.handle.zoom);
                    if (creating) {
                        $origBar.
                            bind('fmtValue.rsSliderLens', events.onFmtValue).
                            bind('drawRuler.rsSliderLens', events.onDrawRuler);
                    }
                    if (opts.ruler.display) {
                        pixelOffsets = util.initCanvas(ctx, elemOrig.outerWidth, elemOrig.outerHeight);
                    }
                    if (opts.ruler.onDraw) {
                        var customPixelOffsets = $origBar.triggerHandler('drawRuler.rsSliderLens', [ctx, elemOrig.width, elemOrig.height, pixelOffsets]);
                        if (customPixelOffsets) {
                            info.snapMaxLimit = -1;
                            info.beginOffset = customPixelOffsets.begin ? customPixelOffsets.begin : 0;
                            info.endOffset = customPixelOffsets.end ? customPixelOffsets.end : 0;
                        } else {
                            if (opts.ruler.display) {
                                info.beginOffset = pixelOffsets.begin;
                                info.endOffset = pixelOffsets.end;
                            }
                        }
                    } else {
                        info.beginOffset = pixelOffsets.begin;
                        info.endOffset = pixelOffsets.end;
                    }
                    
                    elemOrig.initCanvasOutsideHandle();

                    if (info.useDoubleHandles) {
                        if (!this.$elem2nd) {
                            this.$elem2nd = this.$elem1st.clone();
                        } else {
                            this.$elem2nd.attr({
                                'width': this.width + 'px',
                                'height': this.height + 'px'
                            }).css({
                                'float': 'left',
                                'width': this.width + 'px',
                                'height': this.height + 'px',
                                'margin-left': 0,
                                'margin-top': 0
                            });
                        }
                        this.$elem2nd[0].getContext('2d').drawImage(this.$elem1st[0], 0, 0);
                    }
                    return true;
                },
                init: function () {
                    this.width = elemOrig.width * opts.handle.zoom;
                    this.height = elemOrig.height * opts.handle.zoom;
                    if ((opts.ruler.display || !opts.ruler.display && opts.ruler.onDraw) && !this.initCanvasHandle()) { 
                        // this browser does not support canvas, so fallback to non canvas
                        opts.ruler.display = false;
                        this.initClone();
                    } else {
                        if (!opts.ruler.display) {
                            this.initClone();
                        }
                    }
                },
                initRanges: function () {
                    if (info.isRangeDefined || opts.range === 'min' || opts.range === 'max') {
                        var createMagnifRange = function ($elem) {
                            
                            return ($elem === null ? elemRange.$elem.clone().removeAttr('id') : $elem).css({
                                'float': 'left',
                                'clear': 'left',
                                'width': (elemRange.width * (opts.ruler.display ? opts.handle.zoom : 1)) + 'px',
                                'height': (elemRange.height * (opts.ruler.display ? opts.handle.zoom : 1)) + 'px',
                                'z-index': (opts.ruler.display ? '' : util.toInt($origBar.css('z-index')) + 2),
                                // clear these cloned properties, do not need them
                                'position': '',
                                'left': '',
                                'top': ''
                            });
                        },
                        scaleIfNeeded = function ($elem) {
                            if (!opts.ruler.display) {
                                $elem.css(util.getScaleCss(opts.handle.zoom));
                            }
                        };
                        
                        this.$elemRange1st = createMagnifRange(this.$elemRange1st);
                        scaleIfNeeded(this.$elemRange1st);
                        if (info.useDoubleHandles) {
                            this.$elemRange2nd = createMagnifRange(this.$elemRange2nd);
                            scaleIfNeeded(this.$elemRange2nd);
                        } else {
                            if (info.isHoriz && elemRange.getRangeName(opts.range) === 'max') {
                                this.$elemRange1st.css('margin-left', getHandleHotPoint(elemHandle.$elem1st) / (opts.ruler.display ? 1 : opts.handle.zoom));
                            }
                        }
                    }
                },
                fixHorizMaxRange: function () {
                    if (info.usingScaleTransf && !info.useDoubleHandles && info.isHoriz && elemRange.getRangeName(opts.range) === 'max') {
                        this.$elemRange1st.css('margin-left', getHandleHotPoint(elemHandle.$elem1st));
                    }
                },
                adjustRangesPos: function () {
                    var adjustFor = function ($elemRange) {
                        if ($elemRange) { 
                            var prop = info.isHoriz ? 'margin-top' : 'margin-left',
                                userMargin = util.toFloat($elemRange.css(prop)),
                                propValue = userMargin - (info.isHoriz ? elemOrig.height : 0);
                            $elemRange.css(prop, (propValue * (opts.ruler.display ? opts.handle.zoom : 1)) + 'px');
                        }
                    };
                    if (opts.range !== true && opts.range !== false) {
                        adjustFor(this.$elemRange1st);
                        adjustFor(this.$elemRange2nd);
                    }
                },
                move: function (isFirst, valuePixel, offset) {
                    if (!opts.ruler.display) {
                        offset /= opts.handle.zoom;
                    }
                    
                    // move the magnified content inside the handle(s)
                    (isFirst ? this.$elem1st : this.$elem2nd).css(info.isHoriz? 'margin-left' : 'margin-top', offset * (info.usingScaleTransf && !opts.ruler.display ? opts.handle.zoom : 1) + 'px');
                    
                    // move the magnified ranges (if applicable)
                    switch (elemRange.getRangeName(opts.range)) {
                        case 'min': if (isFirst) {
                                        elemRange.$elem.css(info.isHoriz ? 'width' : 'height', --valuePixel + 'px');
                                        if (info.isHoriz) {
                                            this.$elemRange1st.css({
                                                'margin-left': Math.round(info.beginOffset * opts.handle.zoom + offset * (info.usingScaleTransf && !opts.ruler.display ? opts.handle.zoom : 1)) + 'px',
                                                'width': Math.round((valuePixel + 1) * (opts.ruler.display ? opts.handle.zoom : 1)) + 'px'
                                            });
                                        } else {
                                            var marginTop = info.beginOffset * opts.handle.zoom;
                                            if (opts.ruler.display) {
                                                marginTop -= this.height;
                                            } else {
                                                marginTop -= elemOrig.height;
                                                if (info.usingScaleTransf) {
                                                    var handlePos = - util.toInt(this.$elem1st.css('margin-top'));
                                                    if (handlePos >= elemOrig.height) {
                                                        marginTop -= handlePos - elemOrig.height;
                                                    }
                                                }
                                            }
                                            this.$elemRange1st.css({
                                                'margin-top': Math.round(marginTop) + 'px',
                                                'height': Math.round((valuePixel + 1) * (opts.ruler.display ? opts.handle.zoom : 1)) + 'px'
                                            });
                                        }
                                    }
                                    break;
                        case 'max': if (!info.useDoubleHandles || info.useDoubleHandles && !isFirst) {
                                        var $range = info.useDoubleHandles ? this.$elemRange2nd : this.$elemRange1st;
                                        
                                        if (info.isHoriz) {
                                            elemRange.$elem.css({
                                                'left': Math.round(elemOrig.pos.left + valuePixel + info.beginOffset + 1) + 'px',
                                                'width': Math.round(elemOrig.outerWidth - valuePixel - info.beginOffset - info.endOffset + 1) + 'px'
                                            });
                                            $range.css('width', (Math.round(elemOrig.outerWidth - valuePixel - info.beginOffset - info.endOffset) * (opts.ruler.display ? opts.handle.zoom : 1)) + 'px');
                                        } else {
                                            elemRange.$elem.css({
                                                'top': Math.round(elemOrig.pos.top + valuePixel + info.beginOffset + 1) + 'px',
                                                'height': Math.round(elemOrig.outerHeight - valuePixel - info.beginOffset - info.endOffset + 1) + 'px'
                                            });
                                            
                                            var marginTop = (getHandleHotPoint(info.useDoubleHandles ? elemHandle.$elem2nd : elemHandle.$elem1st) * (info.usingScaleTransf && !opts.ruler.display ? opts.handle.zoom : 1) - this.height) / (opts.ruler.display ? 1 : opts.handle.zoom) - offset * (info.usingScaleTransf && !opts.ruler.display ? opts.handle.zoom : 1);
                                            if (info.usingScaleTransf && !opts.ruler.display) {
                                                var handlePos = - util.toInt((info.useDoubleHandles ? this.$elem2nd : this.$elem1st).css('margin-top'));
                                                if (handlePos >= elemOrig.height) {
                                                    marginTop -= handlePos - elemOrig.height;
                                                }
                                            }
                                            $range.css({
                                                'height': (Math.round(elemOrig.outerHeight - valuePixel - info.beginOffset - info.endOffset) * (opts.ruler.display ? opts.handle.zoom : 1)) + 'px',
                                                'margin-top': marginTop + 'px'
                                            });
                                        }
                                    }
                                    break;
                        case true:  if (info.isHoriz) {
                                        elemRange.$elem.css({
                                            'left': (elemOrig.pos.left + elemHandle.stopPosition[0]) + 'px',
                                            'width': (elemHandle.stopPosition[1] - elemHandle.stopPosition[0] + 1) + 'px'
                                        });
                                    } else {
                                        elemRange.$elem.css({
                                            'top': (elemOrig.pos.top + elemHandle.stopPosition[0]) + 'px',
                                            'height': (elemHandle.stopPosition[1] - elemHandle.stopPosition[0] + 1) + 'px'
                                        });
                                    }
                    }
                    
                    if (info.isRangeDefined) {
                        var $range = isFirst ? this.$elemRange1st : this.$elemRange2nd;
                        if (info.usingScaleTransf && !opts.ruler.display) {
                            if (info.isHoriz) {
                                $range.css('margin-left', ((info.fromPixel + offset) * opts.handle.zoom) + 'px');
                            } else {
                                var marginTop = info.fromPixel * opts.handle.zoom - this.height / opts.handle.zoom,
                                    handlePos = - util.toInt((isFirst ? this.$elem1st : this.$elem2nd).css('margin-top'));
                                if (handlePos >= elemOrig.height) {
                                    marginTop -= handlePos - elemOrig.height;
                                }
                                $range.css('margin-top', marginTop + 'px');
                            }
                        } else {
                            $range.css(info.isHoriz ? 'margin-left' : 'margin-top', (info.fromPixel * (opts.ruler.display ? opts.handle.zoom : 1) + (info.isHoriz ? offset : - this.height / (opts.ruler.display ? 1 : opts.handle.zoom))) + 'px');
                        }
                    }   
                }
            },
            
            // the handle
            elemHandle = {
                $elem1st: null,
                $elem2nd: null,
                stopPosition: [0, 0], // only applicable for double handles:
                                      // For horizontal slider, stopPosition[0] is the rightmost pos for the left handle, stopPosition[1] is the leftmost pos for the right handle
                                      // For vertical slider, stopPosition[0] is the bottommost pos for the top handle, stopPosition[1] is the topmost pos for the bottom handle
                init: function () {
                    var width = elemOrig.outerWidth * opts.handle.zoom,
                        height = elemOrig.outerHeight * opts.handle.zoom,
                        cssCommon = {
                            'outline': '0',
                            'position': 'absolute',
                            'z-index': util.toInt($origBar.css('z-index')) + 2
                        }, cssCommonMiddle = {
                            'overflow': 'hidden',
                            'width': 0, // defined below
                            'height': 0 // defined below
                        }, 
                        cssOrient,
                        tabIndex = $origBar.attr('tabindex');
                    
                    if (info.isHoriz) {
                        cssCommonMiddle.width = opts.handle.size + 'px';
                        cssCommonMiddle.height = height + 'px';
                        cssOrient = {
                            'width': opts.handle.size + 'px',
                            'height': (elemOrig.outerHeight * opts.handle.zoom) + 'px',
                            'top': (elemOrig.pos.top - (elemMagnif.height - elemOrig.height) * opts.handle.relativePos) + 'px'
                        };
                    } else {
                        cssCommonMiddle.width = width + 'px';
                        cssCommonMiddle.height = opts.handle.size + 'px';
                        cssOrient = {
                            'width': (elemOrig.outerWidth * opts.handle.zoom) + 'px',
                            'height': opts.handle.size + 'px',
                            'left': (elemOrig.pos.left - (elemMagnif.width - elemOrig.width) * opts.handle.relativePos) + 'px'
                        };
                    }
                    if (!this.$elem1st) {
                        this.$elem1st = elemMagnif.$elem1st.add(elemMagnif.$elemRange1st).wrapAll("<div>").parent().
                            addClass(this.getHandleClass(true)).css(cssCommonMiddle).wrap("<div>").parent().
                            css(cssCommon).css(cssOrient);

                        if (tabIndex !== undefined && info.isEnabled) {
                            $origBar.removeAttr('tabindex');
                            this.$elem1st.
                                attr('tabindex', tabIndex).
                                bind('focus.rsSliderLens', panUtil.gotFocus1st).
                                bind('blur.rsSliderLens', panUtil.loseFocus);
                            
                            if ($origBar.attr('autofocus') !== undefined) {
                                $origBar.removeAttr('autofocus');
                                this.$elem1st.attr('autofocus', 'autofocus');
                            }
                        }
                    } else {
                        this.$elem1st.css(cssCommon).css(cssOrient).children().addClass(this.getHandleClass(true)).css(cssCommonMiddle);
                    }
                    
                    if (info.useDoubleHandles) {
                        if (!this.$elem2nd) {
                            this.$elem2nd = elemMagnif.$elem2nd.add(elemMagnif.$elemRange2nd).wrapAll("<div>").parent().
                                addClass(this.getHandleClass(false)).css(cssCommonMiddle).wrap("<div>").parent().
                                css(cssCommon).css(cssOrient);

                            if (tabIndex !== undefined && info.isEnabled) {
                                this.$elem2nd.
                                    attr('tabindex', tabIndex).
                                    bind('focus.rsSliderLens', panUtil.gotFocus2nd).
                                    bind('blur.rsSliderLens', panUtil.loseFocus);
                            }
                        } else {
                            this.$elem2nd.css(cssCommon).css(cssOrient).children().addClass(this.getHandleClass(false)).css(cssCommonMiddle);
                        }
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
                        classes = info.isHoriz ? opts.style.classHorizHandle : opts.style.classVertHandle;
                    }
                    return info.isEnabled ? classes : classes + ' ' + opts.style.classHandleDisabled;
                },
                setPos: function (isFirstHandle, pos) {
                    if (isFirstHandle) {
                        info.isHoriz ? this.$elem1st.css('left', (elemOrig.pos.left + pos) + 'px') : this.$elem1st.css('top', (elemOrig.pos.top + pos) + 'px');
                        this.stopPosition[0] = pos + opts.handle.size;
                    } else {
                        info.isHoriz ? this.$elem2nd.css('left', (elemOrig.pos.left + pos) + 'px') : this.$elem2nd.css('top', (elemOrig.pos.top + pos) + 'px');
                        this.stopPosition[1] = pos;
                    }
                },
                adjustSize: function () {
                    var $child = this.$elem1st.children();
                    this.$elem1st.css({
                        'width': ($child.outerWidth() + 1) + 'px',
                        'height': ($child.outerHeight() + 1) + 'px'
                    });
                    if (info.useDoubleHandles) {
                        $child = this.$elem2nd.children();
                        this.$elem2nd.css({
                            'width': ($child.outerWidth() + 1) + 'px',
                            'height': ($child.outerHeight() + 1) + 'px'
                        });
                    }
                },
                navigate: function (pixelOffset, valueOffset, duration, limits) {
                    var currValue = info.currValue[!info.useDoubleHandles || panUtil.$handle === elemHandle.$elem1st? 0 : 1],
                        toValue;
                    if (Math.abs(opts.step) <= 0.0000005) {
                        toValue = (currValue * info.ticksStep + pixelOffset) / info.ticksStep;
                    } else {
                        toValue = currValue + valueOffset;
                    }
                    if (info.isStepDefined) {
                        toValue = Math.round((toValue - opts.min) / opts.step) * opts.step + opts.min;
                    }
                    if (limits !== undefined) {
                        if (toValue < limits[0]) { toValue = limits[0]; }
                        if (toValue > limits[1]) { toValue = limits[1]; }
                    }
                    if (toValue < opts.min) { toValue = opts.min; }
                    if (toValue > opts.max) { toValue = opts.max; }
                    panUtil.gotoAnim(currValue, toValue, duration);
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
                            case key.left:  return $.inArray('left', opts.keyboard.allowed) > -1;
                            case key.down:  return $.inArray('down', opts.keyboard.allowed) > -1; 
                            case key.right: return $.inArray('right', opts.keyboard.allowed) > -1;
                            case key.up:    return $.inArray('up', opts.keyboard.allowed) > -1;
                            case key.pgUp:  return $.inArray('pgup', opts.keyboard.allowed) > -1;
                            case key.pgDown:return $.inArray('pgdown', opts.keyboard.allowed) > -1;
                            case key.home:  return $.inArray('home', opts.keyboard.allowed) > -1;
                            case key.end:   return $.inArray('end', opts.keyboard.allowed) > -1;
                            case key.esc:   return $.inArray('esc', opts.keyboard.allowed) > -1;
                        }
                        return false;
                    }, 
                    limits = [info.isRangeDefined ? info.getCurrValue(opts.range[opts.flipped ? 1 : 0]) : opts.min,
                              info.isRangeDefined ? info.getCurrValue(opts.range[opts.flipped ? 0 : 1]) : opts.max];
                                                    
                    limits[0] = info.useDoubleHandles ? (panUtil.$handle === elemHandle.$elem1st ? limits[0] : info.currValue[0]) : limits[0];
                    limits[1] = info.useDoubleHandles ? (panUtil.$handle === elemHandle.$elem1st ? info.currValue[1] : limits[1]) : limits[1];

                    if (allowedKey()) {
                        event.preventDefault();
                        var currValue = info.currValue[!info.useDoubleHandles || panUtil.$handle === elemHandle.$elem1st? 0 : 1];

                        switch (event.which) {
                            case key.left:
                            case key.down:
                            case key.right: 
                            case key.up:
                                if (info.isHoriz) {
                                    event.which === key.left || event.which === key.down ? elemHandle.navigate(-1, - opts.step, opts.keyboard.animation) : elemHandle.navigate(1, opts.step, opts.keyboard.animation);
                                } else {
                                    event.which === key.left || event.which === key.down ? elemHandle.navigate(1, opts.step, opts.keyboard.animation) : elemHandle.navigate(-1, - opts.step, opts.keyboard.animation);
                                }
                                break;
                            case key.pgUp:
                            case key.pgDown:
                                event.which === key.pgUp ? elemHandle.navigate((info.fromPixel - info.toPixel) / opts.keyboard.numPages, (opts.min - opts.max) / opts.keyboard.numPages, opts.keyboard.animation, limits)
                                                         : elemHandle.navigate((info.toPixel - info.fromPixel) / opts.keyboard.numPages, (opts.max - opts.min) / opts.keyboard.numPages, opts.keyboard.animation, limits);
                                break;
                            case key.home:   panUtil.gotoAnim(currValue, limits[0], opts.keyboard.animation); break;
                            case key.end:    panUtil.gotoAnim(currValue, limits[1], opts.keyboard.animation); break;
                            case key.esc:
                                info.currValue[0] = info.uncommitedValue[0];
                                info.currValue[1] = info.uncommitedValue[1];
                                updateHandles(info.useDoubleHandles ? info.currValue : info.currValue[0], false);
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
                            delta.y < 0 ? elemHandle.navigate(- delta.y, step, opts.handle.animation) : elemHandle.navigate(- delta.y, - step, opts.handle.animation);
                        };
                    if (Math.abs(delta.y) > 0.5) {
                        panUtil.$handle = elemHandle.$elem1st;
                        moveHandler();
                        if (info.useDoubleHandles) {
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
                            if (info.useDoubleHandles) {
                                return [info.getCurrValue(info.currValue[0]), info.getCurrValue(info.currValue[1])];
                            } else {
                                return info.getCurrValue(info.currValue[0]);
                            }
                        case 'range':
                            return opts.range;
                        case 'zoom':
                            return opts.handle.zoom;
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
                            var limits = [info.isRangeDefined ? info.getCurrValue(opts.range[opts.flipped ? 1 : 0]) : opts.min,
                                          info.isRangeDefined ? info.getCurrValue(opts.range[opts.flipped ? 0 : 1]) : opts.max];
 
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
                        case 'value':
                            var twoValues = !!value && (typeof value === 'object') && value.length === 2;
                            if (info.useDoubleHandles) {
                                if (twoValues) {
                                    checkValuesData(value);
                                    if (value[0] !== null) {
                                        setValueTicks(value[0], elemHandle.$elem1st);
                                    }
                                    if (value[1] !== null) {
                                        setValueTicks(value[1], elemHandle.$elem2nd);
                                    }
                                }
                            } else {
                                if (!twoValues) {
                                    setValuePixel(true, Math.round((info.getCurrValue(value) - opts.min) * info.ticksStep), elemHandle.$elem1st);
                                }
                            }
                            break;
                        case 'range':
                            if (info.useDoubleHandles || value !== true) { // single handles with range = true are ignored, since range true is only supported for double handle sliders
                                var newRangeNeeded = !!value && (typeof value === 'object') && value.length === 2;
                                // do not need a new range?
                                if (value !== 'min' && value !== 'max' && !newRangeNeeded) {
                                    // if currently ranges are being used, then delete them
                                    if (!!elemMagnif.$elemRange1st) {
                                        elemMagnif.$elemRange1st.remove();
                                        elemMagnif.$elemRange1st = null;                                
                                    }
                                    if (!!elemMagnif.$elemRange2nd) {
                                        elemMagnif.$elemRange2nd.remove();
                                        elemMagnif.$elemRange2nd = null;                                
                                    }
                                    
                                    if (value === false && !!elemRange.$elem) {
                                        elemRange.$elem.remove();
                                        elemRange.$elem = null;                                
                                    }
                                }
                                opts.range = value;
                                $origBar.triggerHandler('invalidate.rsSliderLens');
                            }
                    }
                    return events.onGetter(event, field);
                },
                onInvalidate: function (event) {
                    init();
                    updateHandles(info.useDoubleHandles ? info.currValue : info.currValue[0], opts.flipped);
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
                onFmtValue: function (event, num) {
                    if (opts.ruler.values.onFmtValue) {
                        return opts.ruler.values.onFmtValue(event, num);
                    }
                    return num;
                },
                onDrawRuler: function (event, ctx, width, height, pixelOffsets) {
                    if (opts.ruler.onDraw) {
                        return opts.ruler.onDraw(event, ctx, width, height, pixelOffsets);
                    }
                }
            },
            info = {
                snapMaxLimit: -1,
                snapMaxNum: opts.max,
                currValue: [0, 0], // Values for both handles. When only one handle is used, the currValue[1] is ignored
                ticksStep: 0,
                isInputTypeRange: false, // whether the markup for this plugin in an <input type="range">
                isHoriz: true,
                isEnabled: true,
                fromPixel: 0,
                toPixel: 0,
                beginOffset: 0,
                endOffset: 0,
                useDoubleHandles: false,
                isRangeDefined: false,
                isStepDefined: false,
                isIE9: $.browser.msie && parseInt($.browser.version) === 9,
                isAutoFocusable: $origBar.attr('tabindex') !== undefined && $origBar.attr('autofocus') !== undefined,
                canDragRange: false,
                isDocumentEventsBound: false,
                uncommitedValue: [0, 0],
                usingScaleTransf: false,
                getCurrValue: function (value) {
                    if (opts.flipped) {
                        return info.snapMaxNum - value + opts.min;
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
                    if (info.useDoubleHandles) {
                        info.currValue[0] = opts.value[0];
                        info.currValue[1] = opts.value[1];
                    } else {
                        info.currValue[0] = opts.value;
                    }
                },
                initVars: function () {
                    this.snapMaxNum = opts.max;
                    this.useDoubleHandles = !!opts.value && (typeof opts.value === 'object') && opts.value.length === 2;
                    this.isRangeDefined = !!opts.range && (typeof opts.range === 'object') && opts.range.length === 2;
                    this.isStepDefined = opts.step > 0.00005;
                    this.canDragRange = opts.dragRange && (this.useDoubleHandles && opts.range === true || this.isRangeDefined);
                    this.isInputTypeRange = $origBar.is("input[type=range]");
                    this.isEnabled = !opts.disabled;
                },
                init: function () {
                    this.checkBounds();
                    this.ticksStep = (Math.max(elemOrig.outerWidth, elemOrig.outerHeight) - info.beginOffset - info.endOffset) / (opts.max - opts.min);
                    if (info.isRangeDefined) {
                        if (opts.flipped) {
                            this.fromPixel = Math.round((opts.max - opts.range[1]) * this.ticksStep) + info.beginOffset;
                            this.toPixel = Math.round((opts.max - opts.range[0]) * this.ticksStep) + info.beginOffset;
                        } else {
                            this.fromPixel = Math.round((opts.range[0] - opts.min) * this.ticksStep) + info.beginOffset;
                            this.toPixel = Math.round((opts.range[1] - opts.min) * this.ticksStep) + info.beginOffset;
                        }
                    } else {
                        this.fromPixel = info.beginOffset;
                        this.toPixel = Math.round((opts.max - opts.min) * this.ticksStep) + info.beginOffset;
                    }
                    
                    if (info.snapMaxLimit > -1) {
                        if (opts.flipped) {
                            if (this.fromPixel < info.snapMaxLimit) {
                                this.fromPixel = this.beginOffset = info.snapMaxLimit;
                            }
                        } else {
                            if (this.toPixel > info.snapMaxLimit) {
                                this.toPixel = info.snapMaxLimit;
                            }
                        }
                    }
                }
            },
            init = function () {
                info.initVars();
                var creating = elemMagnif.$elem1st === null,
                    noRangeCreated = elemRange.$elem === null,
                    noIEdrag = function(elem) {
                        if (elem) { elem[0].ondragstart = elem[0].onselectstart = function () { return false; }; }
                    };

                if (creating && info.useDoubleHandles) {
                    opts.handle.size /= 2.0;
                }
                elemOrig.init();
                elemMagnif.init();
                info.init();
                elemRange.init();
                elemMagnif.initRanges();
                elemHandle.init();
                if (creating) {
                    $origBar.after(elemHandle.$elem2nd).after(elemHandle.$elem1st).after(elemRange.$elem).after(elemOrig.$canvas);
                } else {
                    if (noRangeCreated && elemRange.$elem !== null) { // before had no range, now will have it
                        elemHandle.$elem1st.before(elemRange.$elem);
                        elemMagnif.$elem1st.after(elemMagnif.$elemRange1st);
                        if (info.useDoubleHandles && elemMagnif.$elemRange2nd !== null) {
                            elemMagnif.$elem2nd.after(elemMagnif.$elemRange2nd);
                        }
                    }
                }

                elemHandle.adjustSize();
                if (noRangeCreated) {
                    elemMagnif.adjustRangesPos();
                }
                info.usingScaleTransf = !opts.ruler.display && (util.isDefined(elemHandle.$elem1st.css('-moz-transform')) || util.isDefined(elemHandle.$elem1st.css('-o-transform')));
                elemMagnif.fixHorizMaxRange();

                if (creating) {
                    if (info.isEnabled && Math.abs(opts.handle.mousewheel) > 0.5) {
                        $origBar.
                            add(elemOrig.$canvas).
                            add(elemRange.$elem).
                            add(elemHandle.$elem1st).
                            add(elemHandle.$elem2nd).bind('DOMMouseScroll.rsSlideIt mousewheel.rsSlideIt', elemHandle.onMouseWheel);
                    }

                    $origBar.
                        bind('getter.rsSliderLens', events.onGetter).
                        bind('setter.rsSliderLens', events.onSetter).
                        bind('invalidate.rsSliderLens', events.onInvalidate).
                        bind('change.rsSliderLens', events.onChange).
                        bind('create.rsSliderLens', events.onCreate);

                    if (info.canDragRange) {
                        elemRange.$elem.mousedown(panRangeUtil.startDrag).mouseup(panRangeUtil.stopDrag).click(panRangeUtil.click);
                    } else {
                        if (!!opts.range) {
                            elemRange.$elem.mousedown(panUtil.startDrag).mouseup(panUtil.stopDrag);
                        }
                    }
                    
                    $origBar.add(elemOrig.$canvas).mousedown(panUtil.startDrag).mouseup(panUtil.stopDrag);
                    elemHandle.$elem1st.mousedown(panUtil.startDragFromHandle1st).mouseup(panUtil.stopDrag);

                    if (!!opts.style.classHandleHover) {
                        $origBar.add(elemOrig.$canvas).add(elemHandle.$elem1st).add(elemHandle.$elem2nd).mouseleave(util.mouseleave).
                            add(elemRange.$elem).add(elemMagnif.$elemRange1st).add(elemMagnif.$elemRange2nd).mouseenter(util.mouseenter);
                    }
                    
                    // to prevent the default behaviour in IE when dragging an element
                    $origBar[0].ondragstart = elemMagnif.$elem1st[0].ondragstart = elemHandle.$elem1st[0].ondragstart =
                    $origBar[0].onselectstart = elemMagnif.$elem1st[0].onselectstart = elemHandle.$elem1st[0].onselectstart = function () { return false; };
                    noIEdrag(elemOrig.$canvas);
                    noIEdrag(elemRange.$elem);
                    noIEdrag(elemMagnif.$elemRange1st);
                    
                    if (info.useDoubleHandles) {
                        elemMagnif.$elem2nd[0].ondragstart = elemHandle.$elem2nd[0].ondragstart =
                        elemMagnif.$elem2nd[0].onselectstart = elemHandle.$elem2nd[0].onselectstart = function () { return false; };
                        noIEdrag(elemMagnif.$elemRange2nd);
                        elemHandle.$elem2nd.mousedown(panUtil.startDragFromHandle2nd).mouseup(panUtil.stopDrag);
                    }
                    if (info.isAutoFocusable) {
                        elemHandle.$elem1st.focus();
                    }
                    $origBar.triggerHandler('create.rsSliderLens');
                } else {
                    if (noRangeCreated && elemRange.$elem !== null) { // before had no range, now will have it                
                        if (info.isEnabled && Math.abs(opts.handle.mousewheel) > 0.5) {
                            elemRange.$elem.bind('DOMMouseScroll.rsSlideIt mousewheel.rsSlideIt', elemHandle.onMouseWheel);
                        }
                        if (info.canDragRange) {
                            elemRange.$elem.mousedown(panRangeUtil.startDrag).mouseup(panRangeUtil.stopDrag).click(panRangeUtil.click);
                        } else {
                            if (!!opts.range) {
                                elemRange.$elem.mousedown(panUtil.startDrag).mouseup(panUtil.stopDrag);
                            }
                        }
                        noIEdrag(elemRange.$elem);
                        noIEdrag(elemMagnif.$elemRange1st);
                        if (info.useDoubleHandles) {
                            noIEdrag(elemMagnif.$elemRange2nd);
                        }
                    }
                }
            },
            updateHandles = function (values, flipped) {
                if (info.useDoubleHandles) {
                    setValueTicks(flipped ? info.getCurrValue(values[0]) : values[0], flipped ? elemHandle.$elem2nd : elemHandle.$elem1st);
                    setValueTicks(flipped ? info.getCurrValue(values[1]) : values[1], flipped ? elemHandle.$elem1st : elemHandle.$elem2nd);
                } else {
                    setValueTicks(flipped ? info.getCurrValue(values) : values, elemHandle.$elem1st);
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
                return valuePixel - getHandleHotPoint($handleElem);
            },
            setValuePixel = function (forceRender, value, $handleElem, doSnap) { // value is a zero based pixel value
                var canSet = function (v) {
                    // valid: 0: ok;  -1: invalid, too small;  1: invalid, too big 
                    if (info.useDoubleHandles) {
                        if ($handleElem === elemHandle.$elem1st) {
                            cond = info.fromPixel - 1;
                            if (v <= cond) return { valid: -1, val: cond + 1 };
                            cond = elemHandle.stopPosition[1] + 1;
                            if (v >= cond) return { valid: 1, val: elemHandle.stopPosition[1] };
                        } else {
                            cond = elemHandle.stopPosition[0] - 1;
                            if (v <= cond) return { valid: -1, val: elemHandle.stopPosition[0] };
                            cond = info.toPixel + 1;
                            if (v >= cond) return { valid: 1, val: cond - 1 };
                        }
                    } else {
                        cond = info.fromPixel - 1;
                        if (v <= cond) return { valid: -1, val: cond + 1 };
                        cond = info.toPixel + 1;
                        if (v >= cond) return { valid: 1, val: cond - 1 };
                    }
                    return { valid: 0, val: v };
                };
                var limitsData = canSet(value + info.beginOffset);
                if (limitsData.valid === 0 || forceRender) {
                    limitsData.val = (limitsData.val - info.beginOffset) / info.ticksStep + opts.min;
                    setValueTicks(limitsData.val, $handleElem, doSnap);
                }
            },
            checkLimits = function (value) {
                var limit = info.isRangeDefined ? info.getCurrValue(opts.range[opts.flipped ? 1 : 0]) : opts.min;
                if (value < limit) {
                    return limit;
                } else {
                    limit = info.isRangeDefined ? info.getCurrValue(opts.range[opts.flipped ? 0 : 1]) : opts.max;
                    if (value > limit) {
                        return limit;
                    }
                }
                return value;
            },
            setValueTicks = function (value, $handleElem, doSnap) {
                var valueNoMin = value - opts.min,
                    valueNoMinPx = valueNoMin;
                    
                if (info.isStepDefined) {
                    valueNoMin = Math.round(valueNoMin / opts.step) * opts.step;
                    if (info.isRangeDefined) {
                        // make sure the handle is within range limits
                        if (valueNoMin < info.getCurrValue(opts.range[opts.flipped ? 1 : 0]) - opts.min) {
                            valueNoMin += opts.step;
                        }
                        if (valueNoMin > info.getCurrValue(opts.range[opts.flipped ? 0 : 1]) - opts.min) {
                            valueNoMin -= opts.step;
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
                if (info.isStepDefined && doSnap === false) {
                    valueNoMinPx = checkLimits(valueNoMinPx + opts.min) - opts.min;
                }
                
                var valuePixel = valueNoMinPx * info.ticksStep,
                    isFirstHandle = $handleElem === elemHandle.$elem1st,
                    $magnifElem = isFirstHandle? elemMagnif.$elem1st : elemMagnif.$elem2nd;

                info.currValue[isFirstHandle ? 0 : 1] = valueNoMin + opts.min;
                if (info.isHoriz) {
                    elemHandle.setPos(isFirstHandle, info.beginOffset + getHandlePos(valuePixel, $handleElem));
                    elemMagnif.move(isFirstHandle, valuePixel, getHandleHotPoint($handleElem) - (info.beginOffset + valuePixel) * opts.handle.zoom);
                } else {
                    elemHandle.setPos(isFirstHandle, info.beginOffset + getHandlePos(valuePixel, $handleElem));
                    elemMagnif.move(isFirstHandle, valuePixel, getHandleHotPoint($handleElem) - (info.beginOffset + valuePixel) * opts.handle.zoom);
                }

                if (info.isInputTypeRange && isFirstHandle) {
                    $origBar.attr('value', info.getCurrValue(info.currValue[0]));
                }
                $origBar.triggerHandler('change.rsSliderLens', [info.getCurrValue(info.currValue[isFirstHandle ? 0 : 1]), isFirstHandle]);
            },
            util = {
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
                                // values and tick marks on the same relative position
                                offset[0] = offset[1] = (longerMark ? tickSize.big : tickSize.small) / 2;
                            } else { 
                                if (opts.ruler.values.relativePos > opts.ruler.tickMarks.relativePos) {
                                    // values below tick marks (or, in case of vertical sliders, values right to tick marks)
                                    offset[0] = tickSize.big / 2;
                                    offset[1] = longerMark ? tickSize.big / 2 : tickSize.small - tickSize.big / 2;
                                } else {
                                    // values above tick marks (or, in case of vertical sliders, values left to tick marks)
                                    offset[0] = longerMark ? tickSize.big / 2 : tickSize.small - tickSize.big / 2;
                                    offset[1] = tickSize.big / 2;
                                }
                            }
                            if (info.isHoriz) {
                                ctx.moveTo(i, posMiddle - offset[opts.ruler.tickMarks.flipped ? 1 : 0]);
                                ctx.lineTo(i, posMiddle + offset[opts.ruler.tickMarks.flipped ? 0 : 1]);
                            } else {
                                ctx.moveTo(posMiddle - offset[opts.ruler.tickMarks.flipped ? 1 : 0], i);
                                ctx.lineTo(posMiddle + offset[opts.ruler.tickMarks.flipped ? 0 : 1], i);
                            }
                        },
                        getFormatedNum = function (num) {
                            var fmt = $origBar.triggerHandler('fmtValue.rsSliderLens', [num]);
                            return fmt === undefined ? num : fmt;
                        };                        
                    ctx.beginPath();
                    ctx.font = fontData.contextFont;
                    ctx.strokeStyle = opts.ruler.tickMarks.strokeStyle;
                    ctx.fillStyle = opts.ruler.values.fontStyle;
                    ctx.lineWidth = 1;
                    var fmtMin = fmtMax = null,
                        from = curr = deltaStart = deltaEnd = 0,
                        lastLabel = to = info.isHoriz ? width : height;
                        
                    if (opts.ruler.values.show) {
                        fmtMin = getFormatedNum(opts.min);
                        fmtMax = getFormatedNum(opts.max);
                        from = info.isHoriz ? ctx.measureText(fmtMin).width : fontData.height;
                        deltaStart = from / 2;
                        
                        deltaEnd = info.isHoriz ? ctx.measureText(fmtMax).width : fontData.height;
                        deltaEnd /= 2;
                        if (opts.flipped) {
                            curr = to - from;
                            from = to - deltaStart;
                            lastLabel = deltaEnd * 2;
                            to = deltaEnd;
                        } else {
                            curr = from;
                            from = deltaStart;
                            lastLabel -= deltaEnd * 2;
                            to -= deltaEnd;
                        }
                    }
                    var tickSize = { big: (info.isHoriz ? height : width) * opts.ruler.tickMarks.relativeSizeBig, small: (info.isHoriz ? height : width) * opts.ruler.tickMarks.relativeSizeSmall },
                        tickMarkRate = ((info.isHoriz ? width : height) - deltaStart - deltaEnd) / (opts.flipped ? opts.min - opts.max : opts.max - opts.min),
                        pixelStep = info.isStepDefined ? tickMarkRate * opts.step : (opts.flipped ? -2 : 2),
                        tickMarkRelativePos = tickSize.big / 2 + ((info.isHoriz ? height : width) - tickSize.big) * opts.ruler.tickMarks.relativePos,
                        textRelativePos = maxLabelWidth = 0,
                        allLabels = [],
                        doText = false;

                    for (var i = from, longerMark = true, cond = true; cond; i += pixelStep) {
                        var num = (i - from) / tickMarkRate + opts.min;
                        if (info.isStepDefined) {
                            num = util.roundNtoMultipleOfM(num - opts.min, opts.step) + opts.min;
                            info.snapMaxLimit = i;
                            if (opts.flipped) {
                                info.snapMaxNum = num;
                            }
                        }
                        num = util.roundToDecimalPlaces(num, opts.ruler.values.decimals);

                        var fmtNum = getFormatedNum(num);                            
                        
                        if (opts.ruler.values.show) {
                            var halfLabel = info.isHoriz ? ctx.measureText(fmtNum).width / 2 : deltaStart, // for vertical sliders deltaStart is half of text height
                                doText;
                            
                            if (opts.flipped) {
                                doText = // if there is enough space (3px) that would separate this label from the previous one (right)
                                        curr - i - halfLabel > 3 && 
                                        // and there is enough space to the last label (on the left)
                                        i - halfLabel - lastLabel > 3;
                            } else {
                                doText = // if there is enough space (3px) that would separate this label from the previous one (left)
                                        i - halfLabel - curr > 3 && 
                                        // and there is enough space to the last label (on the right)
                                        lastLabel - i - halfLabel > 3;
                            }

                            // only shows a label, if multiple of tryShowEvery (if defined)
                            if (doText && !!opts.ruler.values.tryShowEvery) {
                                var everyValue = Math.abs((num - opts.min) % opts.ruler.values.tryShowEvery);
                                doText = everyValue < 0.00005 && Math.abs(i - from) > 0.00005;
                            }

                            if (doText) {
                                allLabels.push({ fmt: fmtNum, pos: i - halfLabel });
                                maxLabelWidth = Math.max(maxLabelWidth, ctx.measureText(fmtNum).width);
                                curr = i + (opts.flipped ? - halfLabel : halfLabel);
                                longerMark = true;
                            }
                        }

                        cond = opts.flipped ? (i + pixelStep - to > - 0.00005) : (to - i - pixelStep > - 0.00005);
                        if (opts.ruler.tickMarks.show) {
                            drawTick(i, longerMark || !cond, tickMarkRelativePos);
                            longerMark = opts.flipped ? (i + pixelStep - to <= 0.00005) : (to - i - pixelStep <= 0.00005);
                        }
                    }

                    if (opts.ruler.values.show) {
                        var minLength = ctx.measureText(fmtMin).width;
                        maxLabelWidth = Math.max(maxLabelWidth, minLength);
                        var spaceForLabels = info.isHoriz ? fontData.height : maxLabelWidth;
                        textRelativePos = (info.isHoriz ? spaceForLabels : 0) + ((info.isHoriz ? height : width) - spaceForLabels) * opts.ruler.values.relativePos;
                        info.isHoriz ? ctx.fillText(fmtMin, opts.flipped ? width - minLength: 0, textRelativePos) : ctx.fillText(fmtMin, textRelativePos, opts.flipped ? height : fontData.height);
                        for (i in allLabels) {
                            info.isHoriz ? ctx.fillText(allLabels[i].fmt, allLabels[i].pos, textRelativePos) : ctx.fillText(allLabels[i].fmt, textRelativePos, allLabels[i].pos + fontData.height);
                        }
                        var maxLabelPos = opts.flipped ? 0 : lastLabel;
                        info.isHoriz ? ctx.fillText(fmtMax, maxLabelPos, textRelativePos) : ctx.fillText(fmtMax, textRelativePos, maxLabelPos + fontData.height);
                    }
                    ctx.stroke();
                    return opts.flipped ? { begin: deltaEnd, end: deltaStart } : { begin: deltaStart, end: deltaEnd };
                },
                getScaleCss: function (zoomValue) {
                    var scale = 'scale(' + opts.handle.zoom + ')',
                        css = {
                            '-moz-transform-origin': '0 0',
                            '-o-transform-origin': '0 0',
                            '-moz-transform': scale,
                            '-o-transform': scale,
                            'zoom': opts.handle.zoom
                        };
                    return css;
                },
                getUserDefinedCSS: function ($elem, cssProp) {
                    var oldDisplay = $elem.css('display'),
                        $inspector = $elem.css('display', 'none');
                    $("body").append($inspector); // add to DOM, in order to read the CSS property
                    try {
                        return $inspector.css(cssProp);
                    } finally {
                        $inspector.remove().css('display', oldDisplay); // and remove from DOM
                    }
                },
                mouseenter: function () {
                    if (info.isEnabled) {
                        $origBar.add(elemOrig.$canvas).add(elemHandle.$elem1st).add(elemHandle.$elem2nd).addClass(opts.style.classHandleHover);
                    }
                },
                mouseleave: function () {
                    if (info.isEnabled && !panUtil.dragging) {
                        $origBar.add(elemOrig.$canvas).add(elemHandle.$elem1st).add(elemHandle.$elem2nd).removeClass(opts.style.classHandleHover);
                    }
                }
            },
            panUtil = {
                doDrag: true,
                firstClickWasOutsideHandle: false,
                dragDelta: 0,
                $handle: null, // handle currently being dragged
                animating: false,
                dragging: false,
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
                animDone: function (value) {
                    setValuePixel(true, value + panUtil.dragDelta, panUtil.$handle);
                    if (panUtil.doDrag) {
                        $(document).
                            bind('mousemove.rsSliderLens', info.isHoriz ? panUtil.dragHoriz : panUtil.dragVert).
                            bind('mouseup.rsSliderLens', panUtil.stopDragFromDoc);
                    }
                    panUtil.animating = false;
                },
                anim: function (event, from, to, animDuration, doneCallback) {
                    if (panUtil.animating) {
                        return; // there is still an animation going on, so ignore this new one
                    }
                    if (to === undefined) {
                        to = (info.isHoriz ? event.pageX - elemOrig.pos.left : event.pageY - elemOrig.pos.top) - info.beginOffset;
                    }
                    if (from === undefined) {
                        if (!info.useDoubleHandles || to <= ((info.currValue[0] + info.currValue[1]) / 2 - opts.min) * info.ticksStep) {
                            panUtil.$handle = elemHandle.$elem1st;
                            from = (info.currValue[0] - opts.min) * info.ticksStep;
                        } else {
                            panUtil.$handle = elemHandle.$elem2nd;
                            from = (info.currValue[1] - opts.min) * info.ticksStep;
                        }
                    }
                    if (animDuration === undefined) {
                        animDuration = opts.handle.animation;
                    }
                    if (from !== to && animDuration > 0) {
                        panUtil.animating = true;
                        $({ n: from }).animate({ n: to }, {
                            duration: animDuration,
                            step: function (now) {
                                setValuePixel(false, now, panUtil.$handle, opts.snapOnDrag);
                            },
                            complete: function () {
                                panUtil.animDone(to);
                                if (doneCallback) {
                                    doneCallback();
                                }
                            }
                        });
                    } else {
                        panUtil.animDone(to);
                        if (doneCallback) {
                            doneCallback();
                        }
                    }
                },
                gotoAnim: function (fromValue, toValue, animDuration) {
                    var getDuration = function(distance) {
                            var dur = (animDuration * distance) / (info.toPixel - info.fromPixel);
                            return dur < 50 ? 0 : dur; // just do not animate if duration takes less than 50ms
                        },
                        fromPx = (fromValue - opts.min) * info.ticksStep,
                        toPx = (toValue - opts.min) * info.ticksStep;
                    panUtil.dragDelta = 0;
                    panUtil.doDrag = false;
                    panUtil.anim(null, fromPx, toPx, getDuration(Math.abs(toPx - fromPx)));
                },
                startDrag: function (event) {
                    if (info.isEnabled && !panUtil.animating) {
                        panUtil.disableTextSelection();
                        panRangeUtil.dragged = false;
                        panUtil.doDrag = true;
                        panUtil.dragging = true;
                        panUtil.firstClickWasOutsideHandle = true;
                        var initialValues = [info.currValue[0], info.currValue[1]];
                        panUtil.anim(event, undefined, undefined, undefined, function () {
                            panUtil.$handle.focus();
                            info.uncommitedValue[0] = initialValues[0];
                            info.uncommitedValue[1] = initialValues[1];
                        });
                    }
                },
                startDragFromHandle: function (event, $elemHandle) {
                    if (info.isEnabled) {
                        panUtil.disableTextSelection();
                        panRangeUtil.dragged = false;
                        panUtil.$handle = $elemHandle;
                        var from = (info.currValue[$elemHandle === elemHandle.$elem1st ? 0 : 1] - opts.min) * info.ticksStep,
                            to = info.isHoriz ? event.pageX - elemOrig.pos.left : event.pageY - elemOrig.pos.top;
                        panUtil.doDrag = true;
                        panUtil.dragging = true;
                        panUtil.dragDelta = from - to;
                        panUtil.animDone(to);
                    }
                },
                startDragFromHandle1st: function (event) {
                    if (info.isEnabled && !panUtil.animating) {
                        elemMagnif.$elem1st.parent().addClass(opts.style.classHandleClickDown);
                        panUtil.startDragFromHandle(event, elemHandle.$elem1st);
                    }
                },
                startDragFromHandle2nd: function (event) {
                    if (info.isEnabled && !panUtil.animating) {
                        elemMagnif.$elem2nd.parent().addClass(opts.style.classHandleClickDown);
                        panUtil.startDragFromHandle(event, elemHandle.$elem2nd);
                    }
                },
                handleStartsToMoveWhen1stClickWasOutsideHandle: function () {
                    if (panUtil.firstClickWasOutsideHandle) {
                        (panUtil.$handle === elemHandle.$elem1st ? elemMagnif.$elem1st : elemMagnif.$elem2nd).parent().addClass(opts.style.classHandleClickDown);
                        panUtil.firstClickWasOutsideHandle = false;
                        panUtil.dragDelta -= info.beginOffset;
                    }
                },
                dragHoriz: function (event) {
                    panUtil.handleStartsToMoveWhen1stClickWasOutsideHandle();
                    setValuePixel(false, event.pageX - elemOrig.pos.left + panUtil.dragDelta, panUtil.$handle, opts.snapOnDrag);
                },
                dragVert: function (event) {
                    panUtil.handleStartsToMoveWhen1stClickWasOutsideHandle();
                    setValuePixel(false, event.pageY - elemOrig.pos.top + panUtil.dragDelta, panUtil.$handle, opts.snapOnDrag);
                },
                stopDrag: function (event) {
                    if (panRangeUtil.dragged) {
                        panRangeUtil.stopDrag(event);
                        panRangeUtil.dragged = false;
                    } else {
                        if (info.isEnabled) {
                            panUtil.enableTextSelection();
                            panUtil.doDrag = false;
                            panUtil.firstClickWasOutsideHandle = false;
                            $(document).unbind('mousemove.rsSliderLens mouseup.rsSliderLens');
                            
                            // if snap is being used and snapOnDrag is false, then need to adjust final handle position ou mouse up
                            if (info.isStepDefined && !panUtil.animating) {
                                setValueTicks(info.currValue[panUtil.$handle === elemHandle.$elem1st ? 0 : 1], panUtil.$handle, true);
                            }
                            panUtil.dragDelta = 0;
                            (panUtil.$handle === elemHandle.$elem2nd ? elemMagnif.$elem2nd : elemMagnif.$elem1st).parent().removeClass(opts.style.classHandleClickDown);
                        }
                    }
                    panUtil.dragging = false;
                },
                stopDragFromDoc: function (event) {
                    panUtil.stopDrag(event);
                    if (!!opts.style.classHandleHover) {
                        util.mouseleave();
                    }
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
                    if (!panUtil.animating) {
                        panUtil.$handle = elemHandle.$elem1st;
                        panUtil.gotFocus(event);
                    }
                },
                gotFocus2nd: function (event) {
                    if (!panUtil.animating) {
                        panUtil.$handle = elemHandle.$elem2nd;
                        panUtil.gotFocus(event);
                    }
                },
                loseFocus: function (event) {
                    if (panUtil.animating) {
                        // lost focus while a focused handle was still moving, so restore the focus back to the moving handle
                        if (!!panUtil.$handle) {
                            setTimeout(function () {
                                panUtil.$handle.focus();
                            }, 1);
                        }
                    } else {
                        setTimeout(function() {
                            var $allElems = $origBar.
                                    add(elemOrig.$canvas).
                                    add(elemRange.$elem).
                                    add(elemMagnif.$elem1st).add(elemMagnif.$elem1st.parent()).add(elemMagnif.$elem1st.parent().parent()).
                                    add(elemMagnif.$elemRange1st).
                                    add(elemMagnif.$elemRange2nd).
                                    add(elemHandle.$elem1st).
                                    add(elemHandle.$elem2nd),
                                currFocusedElem = document.activeElement;
                                    
                            if (info.useDoubleHandles) {
                                $allElems = $allElems.add(elemMagnif.$elem2nd).add(elemMagnif.$elem2nd.parent()).add(elemMagnif.$elem2nd.parent().parent());
                            }
                            
                            if (!$(currFocusedElem).is($allElems)) { // did focus moved outside this slider?
                                $(document).unbind('keydown.rsSliderLens', elemHandle.keydown);
                                info.isDocumentEventsBound = false;
                            }
                        }, 1);
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
                        panUtil.disableTextSelection();
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
                        $(document).
                            bind('mousemove.rsSliderLens', info.isHoriz ? panRangeUtil.dragHoriz : panRangeUtil.dragVert).
                            bind('mouseup.rsSliderLens', panRangeUtil.stopDrag);
                    }
                },
                dragHorizVert: function (deltaMoved, outerSize, startPos, cssRange) {
                    panRangeUtil.dragged = true;
                    var candidateFromPixel = panRangeUtil.origPixelLimits.from + deltaMoved,
                        candidateToPixel = panRangeUtil.origPixelLimits.to + deltaMoved;

                    if (candidateFromPixel >= info.beginOffset && candidateToPixel <= outerSize - info.endOffset) {
                        panUtil.$handle = elemHandle.$elem1st;
                        setValuePixel(true, deltaMoved + panRangeUtil.dragValue[0], panUtil.$handle, opts.snapOnDrag);
                        if (info.isRangeDefined) {
                            info.fromPixel = candidateFromPixel;
                            info.toPixel = candidateToPixel;
                            var range0 = info.getCurrValue((info.fromPixel - info.beginOffset - 1) / info.ticksStep + opts.min),
                                range1 = info.getCurrValue((info.toPixel - info.beginOffset + 1) / info.ticksStep + opts.min);
                            opts.range = opts.flipped ? [range1, range0] : [range0, range1];
                        }
                        elemRange.$elem.css(cssRange, (startPos + info.fromPixel) + 'px');
                        
                        if (info.useDoubleHandles) {
                            panUtil.$handle = elemHandle.$elem2nd;
                            setValuePixel(true, deltaMoved + panRangeUtil.dragValue[1], panUtil.$handle, opts.snapOnDrag);
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
                        panUtil.enableTextSelection();
                        $(document).unbind('mousemove.rsSliderLens mouseup.rsSliderLens');

                        // if snap is being used and snapOnDrag is false, then need to adjust final handle position ou mouse up
                        if (info.isStepDefined) {
                            setValueTicks(info.currValue[0], elemHandle.$elem1st, true);
                            if (info.useDoubleHandles) {
                                setValueTicks(info.currValue[1], elemHandle.$elem2nd, true);
                            }
                        }
                    }
                },
                click: function (event) {
                    if (info.isEnabled && !panRangeUtil.dragged) {
                        panUtil.doDrag = false;
                        var initialValues = [info.currValue[0], info.currValue[1]];
                        panUtil.anim(event, undefined, undefined, undefined, function () {
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
        invalidate = function () {
            return this.each(function () {
                $(this).trigger('invalidate.rsSliderLens');
            });
        };

        if (typeof options === 'string') {
            var otherArgs = Array.prototype.slice.call(arguments, 1);
            switch (options) {
                case 'option': return option.apply(this, otherArgs);
                case 'invalidate': return invalidate.call(this);
                default: return this;
            }
        }
        var opts = $.extend({}, $.fn.rsSliderLens.defaults, options);
        opts.handle = $.extend({}, $.fn.rsSliderLens.defaults.handle, options ? options.handle : options);
        opts.style = $.extend({}, $.fn.rsSliderLens.defaults.style, options ? options.style : options);
        opts.ruler = $.extend({}, $.fn.rsSliderLens.defaults.ruler, options ? options.ruler : options);
        opts.ruler.values = $.extend({}, $.fn.rsSliderLens.defaults.ruler.values, options ? (options.ruler ? options.ruler.values : options.ruler) : options);
        opts.ruler.tickMarks = $.extend({}, $.fn.rsSliderLens.defaults.ruler.tickMarks, options ? (options.ruler ? options.ruler.tickMarks : options.ruler) : options);
        opts.keyboard = $.extend({}, $.fn.rsSliderLens.defaults.keyboard, options ? options.keyboard : options);

        return this.each(function () {
            var $origBar = $(this),
                allOpts = $.extend(true, {}, opts),
                toFloat = function (str) {
                    var value = !str || str == 'auto' || str == '' ? 0.0 : parseFloat(str);
                    return isNaN(value) ? 0.0 : value;
                };
            if ($origBar.is("input[type=range]")) {
                var attrValue = $origBar.attr('value'),
                    doubleHandles = !!opts.value && (typeof opts.value === 'object') && opts.value.length === 2;
                    
                if (attrValue !== undefined && !doubleHandles) {
                    allOpts = $.extend({}, allOpts, {value: toFloat(attrValue)});
                }
                attrValue = $origBar.attr('min');
                if (attrValue !== undefined) {
                    allOpts = $.extend({}, allOpts, {min: toFloat(attrValue)});
                }
                attrValue = $origBar.attr('max');
                if (attrValue !== undefined) {
                    allOpts = $.extend({}, allOpts, {max: toFloat(attrValue)});
                }
                attrValue = $origBar.attr('step');
                if (attrValue !== undefined) {
                    allOpts = $.extend({}, allOpts, {step: toFloat(attrValue)});
                }
                attrValue = $origBar.attr('disabled');
                if (attrValue !== undefined) {
                    allOpts = $.extend({}, allOpts, {disabled: true});
                }
            }
            new SliderLensClass($(this), allOpts);
        });
    };

    // public access to the default input parameters
    $.fn.rsSliderLens.defaults = {
        orientation: 'auto', // Slider orientation: Type: string.
                             // 'horiz' - horizontal slider.
                             // 'vert' - vertical slider.
                             // 'auto' - horizontal if the content's width >= height; vertical if the content's width < height.
        value: 0, // Represents the initial value(s). When a single number is used, only one handle is shown. When a two number array is used, e.g. [5, 20], two handles are shown.
                  // Type: floating point number or an array of two floating point numbers.
        min: 0,   // Minimum allowed value. Type: floating point number.
        max: 100, // Maximum allowed value. Type: floating point number.
        step: 0,  // Determines the amount of each interval the slider takes between min and max. Use 0 to disable step. 
                  // For example, if min = 0, max = 1 and step = 0.25, the user can only select the following values: 0, 0.25, 0.5, 0.75 and 1.
                  // Type: floating point number.
        snapOnDrag: false, // Determines whether the handle snaps to each step during mouse dragging. Only meaningful if step is defined (non zero step). Type: boolean.
        range: false,   // Specifies a range contained in [min, max]. This range can be used to restrict input even further, or to simply highlight intervals.
                        // Type: boolean, string or an array of two floating point numbers
                        //   false - no range.
                        //   true - range between current handles. Only meaningful for double handles (see value).
                        //   'min' - range between min and the first handle.
                        //   'max' - range between handle and max, or, when two handles are used, between second handle and max.
                        //   [from, to] - Defines a range that restricts the input to the interval [from, to].
                        //                For example, if min = 20 and max = 100 and range = [50, 70], then it is not possible to select values smaller than 50 or greater than 70
                        //   The style of the range area is defined by classHighlightRange.
        dragRange: false, // Determines whether the user can move a range by dragging it with the mouse. Type: boolean.
        disabled: false,  // Determines whether the control is editable. Type: boolean.
        flipped: false,   // Indicates the values direction. Type: boolean.
                          //   false - for horizontal sliders, the minimum is located on the left, maximum on the right. For vertical sliders, the minimum on the top, maximum on the bottom.
                          //   true - for horizontal sliders, the maximum is located on the left, minimum on the right. For vertical sliders, the maximum on the top, minimum on the bottom.
                          
        style: {          // CSS style classes. You can use more than one class, separated by a space. Type: string.
            classSliderlensHoriz: 'sliderlens-horiz',           // class added to the original horizontal slider markup and to the unscaled canvas (when ruler is used)
            classSliderlensVert: 'sliderlens-vert',             // class added to the original vertical slider markup and to the unscaled canvas (when ruler is used)
            classHorizHandle: 'sliderlens-horiz-handle',        // handle used in in horizontal sliders
            classVertHandle: 'sliderlens-vert-handle',          // handle used in in vertical sliders
            classHorizHandle1: 'sliderlens-horiz-handle1',      // leftmost handle in horizontal sliders
            classHorizHandle2: 'sliderlens-horiz-handle2',      // rightmost handle in horizontal sliders
            classVertHandle1: 'sliderlens-vert-handle1',        // topmost handle in vertical sliders
            classVertHandle2: 'sliderlens-vert-handle2',        // bottommost handle in vertical sliders
            classHighlightRange: 'sliderlens-range',            // range bar (used when range is not false)
            classHighlightRangeDraggable: 'drag',               // added to the range bar when user can drag it
            classHandleDisabled: 'sliderlens-disabled',         // disabled handle
            classHandleClickDown: 'sliderlens-handle-down',     // style applied while the handle is being dragged by the mouse
            classHandleHover: 'sliderlens-hover'                // class added when mouse is hover the handler and unscaled canvas (when ruler is used). This class is added only if disabled is false
        },
        
        // handle is the cursor that the user can drag around to select values
        handle: {
            size: 25,   // Size of handle in pixels. Type: positive integer.
                        // For horizontal sliders, it is the handle width. For vertical sliders, it is the handle height.
                        // If two handles are used, then this is the size of both handles together, which means each handle has a size of size/2.
            
            zoom: 1.5,  // Magnification factor applied inside the handle. Type: floating point number.
            
            relativePos: 0.5, // Floating point number between 0 and 1 that indicates the handle relative (0% - 100%) position. Type: floating point number >= 0 and <= 1.
                              // For horizontal sliders, a value of 0 aligns handle to the top, 1 aligns it to the bottom.
                              // For vertical sliders, a value of 0 aligns handle to the left, 1 aligns it to the right.
                              // This parameter has no effect if zoom is 1.
            
            animation: 100, // Duration (ms) of animation that happens when handle needs to move to a different location (triggered by a mouse click on the slider).
                            // Use 0 to disable animation. Type: positive integer.
                           
            mousewheel: 1  // Speed factor applied to the handle when using the mouse wheel. Type: floating point number.
                           // when = 0, mouse wheel cannot be used to move the handle;
                           // when > 0 and mouse wheel goes up, then handle moves to the right (for horizontal sliders) or up (for vertical sliders)
                           // when > 0 and mouse wheel goes down, then handle moves to the left (for horizontal sliders) or down (for vertical sliders)
                           // when < 0 and mouse wheel goes up, then handle moves to the left (for horizontal sliders) or down (for vertical sliders)
                           // when < 0 and mouse wheel goes down, then handle moves to the right (for horizontal sliders) or up (for vertical sliders)
        },
        
        // Ruler rendering data. Should you decide to use a ruler, SliderLens can automatically render one for you, or you can render a customized one.
        ruler: {
            display: true,          // Determines whether the ruler is displayed. Type: boolean.
            values: {               // Configuration data for the labels that appear in the ruler.
                show: true,             // Determines whether value labels are rendered. Type: boolean.
                font: '12px arial',     // Canvas font used for the labels. Type: string.
                fontStyle: 'black',     // Font style. Type: string.
            
                relativePos: 0.9,       // Floating point number between 0 and 1 that indicates the label relative (0% - 100%) position. Type: floating point number >= 0 and <= 1.
                                        // For horizontal sliders, a value of 0 aligns the labels to the top, 1 aligns it to the bottom. Labels are center justified in horizontal sliders.
                                        // For vertical sliders, a value of 0 aligns the labels to the left, 1 aligns it to the right. 
                                        // Labels are left justified in vertical sliders, which means that when relativePos is 1, the longest label is aligned to the right, while the others (shorter) labels are left justified relatively to the longest one.

                tryShowEvery: null,     // Instructs the plug-in to try to place a label every 'tryShowEvery' value. This is not guaranteed, since depends on the minimum space from the last label, label size and other constraints. Type: positive real number.
                decimals: 0,            // Decimals places for labels. Type: positive integer.
                onFmtValue: null        // Event called for each label, to allow customized formating. Type: function (event, value).
            },
            tickMarks: {
                show: true,             // Determines whether the tick marks are displayed. Type: boolean. 
                strokeStyle: 'black',   // Stroke style for the tick marks lines. Type: string.
                relativePos: 0,         // Position for the tick marks relatively to the height (for horizontal sliders) or width (for vertical sliders). Type: floating point number >= 0 and <= 1.
                relativeSizeSmall: .1,  // Relative size for the shorter tick mark. Type: floating point number >= 0 and <= 1. 
                relativeSizeBig: .2,    // Relative size for the longer tick mark. A longer tick mark indicates the place for a label. Type: floating point number >= 0 and <= 1.
                flipped: false          // Determines whether the shorter and longer ticks marks are flipped. Type: boolean.
            },
            onDraw: null   // Event used for customized rulers. Type: function(event, ctx, canvasWidth, canvasHeight, pixelOffsets)
                           // If onDraw event is not defined and ruler.display is true, then a custom ruler is generated.
                           // If onDraw event is not defined and ruler.display is false, then no ruler is displayed and the original content is shown.
                           // If onDraw event is defined and ruler.display is true, then onDraw is used to draw on top of the generated ruler.
                           // If onDraw event is defined and ruler.display is false, then use onDraw to create your own custom ruler from scratch.
        },
        keyboard: {
            allowed: ['left', 'right', 'up', 'down', 'home', 'end', 'pgup', 'pgdown', 'esc'], // Allowed keys. Type: String array.
            animation: 1500,    // Milliseconds that takes to move the handle from one edge of the slider to the other when Home/End is pressed. Other keys use a shorter duration relatively to the distance travelled. Type: positive integer.
            numPages: 5         // Number of pages in a slider (how many times can you page up/down to go through the whole range). Type: positive integer.
        },
        onChange: null, // Event fired when value changes (when handle moves). Type: function (event, value, isFirstHandle).
        onCreate: null  // Event fired after the plug-in has been initialized. Type: function (event).
    };
    // Note: If the plug-in is associated with an <input type="range" ...>, the options "value", "min", "max", "step" and "disabled" retrieve their value from the correspondent attributes present in the markup, if present.

})(jQuery);