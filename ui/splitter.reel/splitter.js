/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */

var Montage = require("montage").Montage,
Component = require("ui/component").Component,
TranslateComposer = require("ui/composer/translate-composer").TranslateComposer;

exports.Splitter = Montage.create(Component, {

    // Public Properties for Splitter

    /** horizontal or vertical */
    _axis: {value: null},
    axis: {
        get: function() {
            return this._axis;
        },
        set: function(value) {
            this._axis = value;
            this.needsDraw = true;
        }
    },

    /* Should the Splitter provide a drag handle to resize the panel */
    _resizable: {value: null},
    resizable: {
        get: function() {
            return this._resizable;
        },
        set: function(value) {
            this._resizable = value;
            this.needsDraw = true;
        }
    },

    /**
    * Width as a %. Number between 0 and 100
    */
    minWidth: {
        value: null
    },

    /**
    * Width as a %. Number between 0 and 100
    */
    maxWidth: {
        value: null
    },

    /**
    * Height as a %. Number between 0 and 100
    */
    minHeight: {
        value: null
    },

    /**
    * Height as a %. Number between 0 and 100
    */
    maxHeight: {
        value: null
    },

    _percent: {value: null},
    percent: {
        get: function() {
            return this._percent;
        },
        set: function(value) {
            this._percent = String.isString(value) ? parseFloat(value) : value;
            this.needsDraw = true;
        }

    },


    // Private

    _composer: {value: null},
    
    __handleX: {value: null},
    _handleX: {
        get: function() {
            return this.__handleX;
        },
        set: function(value) {
            this.__handleX = value;
            this._calculatePercentFromPosition();
        }
    },

    __handleY: {value: null},
    _handleY: {
        get: function() {
            return this.__handleY;
        },
        set: function(value) {
            this.__handleY = value;
            this._calculatePercentFromPosition();
        }
    },

    _calculatePercentFromPosition: {
        value: function() {
            var isHorizontal = (this.axis === 'horizontal');
            if(isHorizontal) {
                this.percent = (this._handleX/this.containerWidth) * 100;
            } else {
                this.percent = (this._handleY/this.containerHeight) * 100;

            }
        }
    },


   _containerWidth: {value: null},
   containerWidth: {
       get: function() {
           return this._containerWidth;
       },
       set: function(value) {
           this._containerWidth = value;
       }
   },

   _containerHeight: {value: null},
   containerHeight: {
       get: function() {
           return this._containerHeight;
       },
       set: function(value) {
           this._containerHeight = value;
       }
   },

   _initialDraw: {value: true},

   // collection of wrappers Splitter creates for the child elements
    _wrappers: {
        value: null
    },

    _dragHandle: {value: null},

    _makeWrapper: {
        value: function(element) {
            var wrapper = document.createElement('div');
            wrapper.classList.add('montage-splitter-child');
            wrapper.appendChild(element);
            if(!this._wrappers) {
                this._wrappers = [];
            }
            this._wrappers.push(wrapper);
            return wrapper;
        }
    },

    _makeDragHandle: {
        value: function() {
            var handle = document.createElement('div');
            handle.classList.add('montage-splitter-thumb');
            this._dragHandle = handle;
            return handle;
        }
    },

    _wrapItems: {
        value: function() {
            var childNodes = Array.prototype.slice.call(this.element.children, 0);

            var i=0, len = childNodes.length;
            for(i; i< len; i++) {
                this.element.appendChild(this._makeWrapper(childNodes[i]));
                if(this.resizable && i === 0) {
                    this.element.classList.add('montage-splitterDraggable');
                    // splitter after the first
                    this.element.appendChild(this._makeDragHandle());
                }
            }
        }
    },


    // ---------------------------------------
    // Montage Lifecycle and Event Callbacks
    // --------------------------------------

    /** Translate Composer requirement */
    surrenderPointer: {
        value: function(pointer, composer) {
            // If the user is sliding us then we do not want anyone using
            // the pointer
            return false;
        }
    },

    didCreate: {
        value: function() {
            this.minWidth = this.minWidth || 20; // min = 20%
            this.maxWidth = this.maxWidth || 80; // max = 80%
            this.minHeight = this.minHeight || 20;
            this.maxHeight = this.maxHeight || 80;
            this.percent = this.percent || 50;
        }
    },

    _calculateInitialHandlePosition: {
        value: function() {
            var isHorizontal = (this.axis === 'horizontal');

            if(this.resizable) {
                this.containerWidth = this.element.offsetWidth;
                this.containerHeight = this.element.offsetHeight;

                if(isHorizontal) {
                    this._handleX = this._dragHandle.offsetLeft;
                } else {
                    this._handleY = this._dragHandle.offsetTop;
                }
                //console.log('handle X Y ', this._handleX, this._handleY, this.percent);
            }
        }
    },

    _initializeComposer: {
        value: function() {
            var isHorizontal = (this.axis === 'horizontal');

            this._composer = Montage.create(TranslateComposer);
            this._composer.element = this._dragHandle;
            this._composer.axis = this.axis || 'vertical';

            if(isHorizontal) {
                this._composer.minTranslateX = ((this.minWidth/100) * this.containerWidth);
                this._composer.maxTranslateX = (this.maxWidth/100) * this.containerWidth;
                this._composer.translateX = this._handleX;
            } else {
                this._composer.minTranslateY = (this.minHeight/100) * this.containerHeight;
                this._composer.maxTranslateY = (this.maxHeight/100) * this.containerHeight;
                this._composer.translateY = this._handleY;
            }
            this._composer.load();
        }
    },


    prepareForDraw: {
        value: function() {
            this.element.classList.add('horizontal' === this.axis ? 'montage-splitterRow' : 'montage-splitterCol');
            this._wrapItems();
        }
    },


    prepareForActivationEvents: {
        value: function() {
            this._composer.addEventListener('translateStart', this, false);
            this._composer.addEventListener('translate', this, false);
            this._composer.addEventListener('translateEnd', this, false);
        }
    },

    _startTranslate: {
        enumerable: false,
        value: null
    },

    _startPosition: {
        enumerable: false,
        value: null
    },

    handleTranslateStart: {
        value: function(e) {
            var isHorizontal = (this.axis === 'horizontal');
            this._startTranslate = (isHorizontal ? e.translateX : e.translateY);
            this._startPosition = (isHorizontal ? this._handleX : this._handleY);

            this._valueSyncedWithPosition = false;
        }
    },

    handleTranslate: {
        value: function (event) {
            var isHorizontal = (this.axis === 'horizontal');
            if(isHorizontal) {
                var x = this._startPosition + event.translateX - this._startTranslate;
                if (x < 0) {
                    x = 0;
                } else {
                    if (x > this._containerWidth) {
                        x = this._containerWidth;
                    }
                }
                this._handleX = x;
            } else {
                var y = this._startPosition + event.translateY - this._startTranslate;
                if (y < 0) {
                    y = 0;
                } else {
                    if (y > this._sliderHeight) {
                        y = this._sliderHeight;
                    }
                }
                this._handleY = y;
            }
        }
    },

    handleTranslateEnd: {
        value: function(e) {
        }
    },


    draw: {
        value: function() {
            var isHorizontal = (this.axis === 'horizontal');
            if(this._wrappers.length > 1) {
                var wrapper = this._wrappers[0];
                wrapper.style[isHorizontal ? 'width' : 'height'] = this.percent + '%';
                this._wrappers[1].style[isHorizontal ? 'width' : 'height'] = (100- this.percent) + '%';
            }
        }
    },

    didDraw: {
        value: function() {
            if(this._initialDraw && this.resizable) {
                this._calculateInitialHandlePosition();
                this._initializeComposer();
            }
            this._initialDraw = false;
        }
    }
});
